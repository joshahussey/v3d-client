package main

//#cgo CFLAGS: -g -Wall
//#cgo LDFLAGS: -L. -lgdal
//#include <stdlib.h>
//#include "shape2json.h"
import "C"

import (
	"crypto/sha256"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path"
	"strings"
	"sync"
	"unsafe"

	_ "github.com/mattn/go-sqlite3"
	"github.com/paulmach/orb/geojson"
)

type ShapeUrl struct {
	Url         string      `json:"url"`
	ServiceInfo ServiceInfo `json:"serviceInfo"`
}

type ShapefileArgs struct {
	Uid              string           `json:"uid"`
	Url              string           `json:"url"`
	Title            string           `json:"title"`
	Description      string           `json:"description"`
	Wgs84BoundingBox Wgs84BoundingBox `json:"wgs84BoundingBox"`
	ServiceInfo      ServiceInfo      `json:"serviceInfo"`
}

type ShapefileMessage struct {
	Kind string          `json:"type"`
	Args []ShapefileArgs `json:"args"`
	Uuid string          `json:"uuid"`
}

type ShapeError struct {
	step string
	err  error
}

type ShapeResponse struct {
	ResponseMessage
	GeoJsonErrorList []string `json:"geoJsonErrorList"`
	MessageErrorList []string `json:"messageErrorList"`
	SuccessList      []string `json:"successList"`
}

func (se ShapeError) Unwrap() error {
	return se.err
}

func (se ShapeError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("ShapeError: %s\nError: %w", se.step, se.err))
}

func SE(step string, err error) error {
	return ShapeError{step: step, err: err}
}

func HandleShape(ctx ReqContext) error {
	client, clientFound := ClientMgr.clients[ctx.sessionID]
	message := []byte(fmt.Sprintf(`{"type": "LOADING_NOTIFIER", "uuid": "%s"}`, ctx.uuid))
	if clientFound {
		err := client.conn.WriteMessage(1, message)
		if err != nil {
			return SE("HandleShapeWriteMessage", err)
		}
	} else {
		requestQueue.Enqueue(ctx.sessionID, message)
	}
	filename, hash, err := UploadHashMoveDelete(ctx, shp)
	if err != nil {
		return SE("HandleShapeUploadHashMoveDelete", err)
	}
	//Create GeoJSON
	var mutex sync.Mutex
	var wg sync.WaitGroup
	if err = os.MkdirAll(GeoJsonDirPath(hash), 0777); err != nil {
		return SE("HandleShapeMkdir", err)
	}
	serviceList, err := shapeServiceList(hash)

	geoJsonDir := GeoJsonDirPath(hash)
	var jsonErrorList []string
	for _, service := range *serviceList {
		wg.Add(1)
		go processShapeAndCreateService(ctx, hash, geoJsonDir, service, &jsonErrorList, &wg, &mutex)
	}
	wg.Wait()
	layerList, messageErrorList := sendShapeMessage(ctx, path.Base(filename), hash, &mutex)
	if err != nil {
		return SE("HandleShapeSendLayers", err)
	}
	err = sendShapeResponse(ctx, messageErrorList, jsonErrorList, layerList)
	if err != nil {
		return SE("HandleShapeSendResponse", err)
	}
	return nil
}

func HandleShapeUrl(ctx ReqContext, args json.RawMessage) error {
	var jsonArgs ShapeUrl
	err := json.Unmarshal(args, &jsonArgs)
	if err != nil {
		return SE("HandleShapeUrlUnmarshal", err)
	}
	filename, hash, err := DownloadHashMoveDelete(ctx, jsonArgs.Url, shp)
	if err != nil {
		return SE("HandleShapeUploadHashMoveDelete", err)
	}
	//Create GeoJSON
	var mutex sync.Mutex
	var wg sync.WaitGroup
	if err = os.MkdirAll(GeoJsonDirPath(hash), 0777); err != nil {
		return SE("HandleShapeMkdir", err)
	}
	serviceList, err := shapeServiceList(hash)

	geoJsonDir := GeoJsonDirPath(hash)
	var jsonErrorList []string
	for _, service := range *serviceList {
		wg.Add(1)
		go processShapeAndCreateService(ctx, hash, geoJsonDir, service, &jsonErrorList, &wg, &mutex)
	}
	wg.Wait()
	layerList, messageErrorList := sendShapeMessage(ctx, path.Base(filename), hash, &mutex)
	if err != nil {
		return SE("HandleShapeSendLayers", err)
	}
	err = sendShapeResponse(ctx, messageErrorList, jsonErrorList, layerList)
	if err != nil {
		return SE("HandleShapeSendResponse", err)
	}
	return nil
}

func sendShapeMessage(ctx ReqContext, serviceName string, hash string, mutex *sync.Mutex) ([]string, []string) {
	client, clientFound := ClientMgr.clients[ctx.sessionID]
	files, err := os.ReadDir(OgcFeaturesDirPath(hash))
	if err != nil {
		logD(ctx.sessionID, fmt.Sprintf("Error reading directory: %v\n", err), "sendShapeMessageReadDir")
		return []string{}, []string{serviceName}
	}
	var layerList []string
	var errorList []string
	message := ShapefileMessage{}
	message.Kind = "FEATURE"
	message.Args = []ShapefileArgs{}
	for _, layer := range files {
		layerDb, err := sql.Open("sqlite3", OgcFeaturesDirPath(hash)+"/"+layer.Name())
		logD(ctx.sessionID, fmt.Sprintf("Opening db file: %s\n", OgcFeaturesDirPath(hash)+"/"+layer.Name()), "sendShapeMessageOpen")
		if err != nil {
			logE(ctx.sessionID, err, "sendShapeMessageOpen")
			errorList = append(errorList, layer.Name())
		}
		defer layerDb.Close()
		var bbox Wgs84BoundingBox
		var layerHash string
		err = layerDb.QueryRow("SELECT uuid, minx, miny, maxx, maxy FROM layer").Scan(&layerHash, &bbox.Minx, &bbox.Miny, &bbox.Maxx, &bbox.Maxy)
		if err != nil {
			logE(ctx.sessionID, err, "sendShapeMessageQueryRow")
			errorList = append(errorList, serviceName)
		}
		args := ShapefileArgs{}
		args.Uid = layerHash
		args.Url = "./ogcfeatures/" + hash + "/" + strings.TrimSuffix(layer.Name(), path.Ext(layer.Name())) //geo3d.compusult.com/ogcfeatures/37ea8961-942d-4a5f-8e3b-642b63748e4f/canada_map
		// args.Url = "/ogcfeatures/" + hash + "/" + strings.TrimSuffix(layer.Name(), path.Ext(layer.Name())) //geo3d.compusult.com/ogcfeatures/37ea8961-942d-4a5f-8e3b-642b63748e4f/canada_map
		args.Title = strings.TrimSuffix(layer.Name(), path.Ext(layer.Name()))
		args.Wgs84BoundingBox = bbox
		args.Description = fmt.Sprintf("Contents of %s", layer.Name())
		args.ServiceInfo.ServiceTitle = serviceName
		args.ServiceInfo.ServiceId = hash
		args.ServiceInfo.ServiceUrl = "UploadedFile"
		message.Args = append(message.Args, args)
		layerList = append(layerList, layer.Name())
	}
	message.Uuid = ctx.uuid
	jsonMessage, err := json.Marshal(message)
	logI(ctx.sessionID, fmt.Sprintf("Sending message: %s\n", string(jsonMessage[:])), "makeShapeMessage")
	if err != nil {
		logE(ctx.sessionID, err, "makeShapeMessageMarshal")
		errorList = append(errorList, serviceName)
		return layerList, errorList
	}
	if !clientFound {
		requestQueue.Enqueue(ctx.sessionID, jsonMessage)
	} else {
		mutex.Lock()
		err = client.conn.WriteMessage(1, jsonMessage)
		mutex.Unlock()
		if err != nil {
			logE(ctx.sessionID, err, "makeShapeMessageWriteMessage")
			mutex.Lock()
			errorList = append(errorList, serviceName)
			mutex.Unlock()
			return layerList, errorList
		}
	}
	return layerList, errorList
}

func sendShapeResponse(ctx ReqContext, messageErrorList []string, jsonErrorList []string, fileList []string) error {
	_, ok := ClientMgr.clients[ctx.sessionID]
	responseBody := ShapeResponse{}
	responseBody.ClientOpened = ok
	responseBody.GeoJsonErrorList = jsonErrorList
	responseBody.MessageErrorList = messageErrorList
	responseBody.SuccessList = fileList
	responseMessage, err := json.Marshal(responseBody)
	if err != nil {
		return PoE("MarshalJsonResponse", err)
	} else {
		ctx.w.Write(responseMessage)
	}
	return nil
}

func makeJsonFromShape(ctx ReqContext, geoJsonDir string, shpfilePath string, errorList *[]string, mutex *sync.Mutex) string {
	_, inFileName := path.Split(shpfilePath)
	outFileName := strings.TrimSuffix(inFileName, path.Ext(inFileName)) + ".json"
	outFilePath := geoJsonDir + "/" + outFileName
	cInputShapeFile := C.CString(shpfilePath)
	cOutputJsonFile := C.CString(outFilePath)
	mutex.Lock()
	ret := C.shape2json(cInputShapeFile, cOutputJsonFile)
	mutex.Unlock()
	if ret != 0 {
		logE(ctx.sessionID, fmt.Errorf("%v", ret), "CERRORmakeJsonFromShape")
		mutex.Lock()
		*errorList = append(*errorList, inFileName)
		mutex.Unlock()
	}
	C.free(unsafe.Pointer(cInputShapeFile))
	C.free(unsafe.Pointer(cOutputJsonFile))
	return outFilePath
}

func createFeatureService(hash string, geoJsonFilePath string, shpfilePath string) error {
	shpFile, err := os.Open(shpfilePath)
	if err != nil {
		return SE("OpenShpFile", err)
	}
	shpBytes, err := io.ReadAll(shpFile)
	if err != nil {
		return SE("ReadShpFile", err)
	}
	hasher := sha256.New()
	_, err = hasher.Write(shpBytes)
	if err != nil {
		return SE("HashShpFile", err)
	}
	layerHash := fmt.Sprintf("%x", hasher.Sum(nil))
	_, inFileName := path.Split(shpfilePath)
	gjFileName := strings.TrimSuffix(inFileName, path.Ext(inFileName)) + ".json"
	dbFileName := strings.TrimSuffix(inFileName, path.Ext(inFileName)) + ".sqlite"
	err = os.MkdirAll(OgcFeaturesDirPath(hash), 0777)
	if err != nil {
		if !os.IsExist(err) {
			return SE("Mkdir", err)
		}
	}
	dbpath := OgcFeaturesDirPath(hash) + "/" + dbFileName
	logD("LOCAL", fmt.Sprintf("Creating db file: %s\n", dbpath), "CreateFeatureService")
	dbfile, err := os.Create(dbpath)
	if err != nil {
		return SE("CreateDbFile", err)
	}
	defer dbfile.Close()
	db, err := sql.Open("sqlite3", dbpath)
	if err != nil {
		return SE("OpenDbFile", err)
	}
	defer db.Close()
	_, err = db.Exec("CREATE TABLE layer (uuid TEXT, minx FLOAT, miny FLOAT, maxx FLOAT, maxy FLOAT)")
	if err != nil {
		return SE("CreateDbLayerTable", err)
	}
	_, err = db.Exec("CREATE TABLE geometry (id TEXT PRIMARY KEY, minx FLOAT, miny FLOAT, maxx FLOAT, maxy FLOAT, type TEXT, json BLOB)")
	if err != nil {
		return SE("DbLayerGeometry", err)
	}
	gjBytes, err := os.ReadFile(geoJsonFilePath)
	if err != nil {
		return SE("ReadJsonFile", err)
	}
	gj, err := geojson.UnmarshalFeatureCollection(gjBytes)
	if err != nil {
		return SE("UnmarshalJson", err)
	}
	var lminx, lminy, lmaxx, lmaxy float64
	if gj.BBox != nil && len(gj.BBox) == 4 {
		lminx, lminy, lmaxx, lmaxy = gj.BBox[0], gj.BBox[1], gj.BBox[2], gj.BBox[3]
	} else {
		logI("LOCAL", fmt.Sprintf("BBox is nil for %s\n", gjFileName), "BBOX")
		lminx, lminy, lmaxx, lmaxy = -180.0, -90.0, 180.0, 90.0
	}
	_, err = db.Exec("INSERT INTO layer (uuid, minx, miny, maxx, maxy) VALUES (?, ?, ?, ?, ?)", layerHash, lminx, lminy, lmaxx, lmaxy)
	if err != nil {
		return SE("InsertIntoLayer", err)
	}
	for _, feature := range gj.Features {
		id := feature.ID
		bound := feature.BBox.Bound()
		Mins := bound.Min.Point()
		Maxs := bound.Max.Point()
		minx, miny, maxx, maxy := Mins[0], Mins[1], Maxs[0], Maxs[1]
		geomType := feature.Geometry.GeoJSONType()
		sqlFeat, err := feature.MarshalJSON()
		if err != nil {
			return SE("MarshalJsonFromSql", err)
		}
		_, err = db.Exec("INSERT INTO geometry (id, minx, miny, maxx, maxy, type, json) VALUES (?, ?, ?, ?, ?, ?, ?)", id, minx, miny, maxx, maxy, geomType, sqlFeat)
		if err != nil {
			return SE("InsertGeometry", err)
		}
	}
	return nil
}

func shapeServiceList(hash string) (*[]string, error) {
	var serviceList []string
	dir, err := os.Stat(DownloadDirPath(hash, shp))
	if err != nil {
		return &serviceList, err
	}
	if !dir.IsDir() {
		return &serviceList, SE("HandleShapeIsDir", fmt.Errorf("Downloaded file is not a directory"))
	}
	files, err := os.ReadDir(DownloadDirPath(hash, shp))
	if err != nil {
		return &serviceList, SE("HandleShapeReadDir", err)
	}
	for _, file := range files {
		if path.Ext(file.Name()) == ".shp" {
			serviceList = append(serviceList, DownloadDirPath(hash, shp)+"/"+file.Name())
		}
	}
	if len(serviceList) == 0 {
		return &serviceList, SE("HandleShapeServiceList", fmt.Errorf("No shapefiles found in directory"))
	}
	return &serviceList, nil
}

func processShapeAndCreateService(ctx ReqContext, hash string, geoJsonDir string, shpfilePath string, errorList *[]string, wg *sync.WaitGroup, mutex *sync.Mutex) {
	jsonFilePath := makeJsonFromShape(ctx, geoJsonDir, shpfilePath, errorList, mutex)
	err := createFeatureService(hash, jsonFilePath, shpfilePath)
	if err != nil {
		logD(ctx.sessionID, fmt.Sprintf("Error creating feature service: %v\n", err), "HandleShapeCreateFeatureService")
	}
	wg.Done()
}
