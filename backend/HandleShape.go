package main

//#cgo CFLAGS: -g -Wall
//#cgo LDFLAGS: -L. -lgdal
//#include <stdlib.h>
//#include "shape2json.h"
import "C"

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"strings"
	"sync"
	"unsafe"

	"github.com/google/uuid"
)

type ShapeUrl struct {
	Url         string      `json:"url"`
	ServiceInfo ServiceInfo `json:"serviceInfo"`
}

type ShapefileArgs struct {
	Uid                string      `json:"uid"`
	UrlOrGeoJsonObject string      `json:"urlOrGeoJsonObject"`
	Title              string      `json:"title"`
	Description        string      `json:"description"`
	ServiceInfo        ServiceInfo `json:"serviceInfo"`
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

func (se ShapeError) Unwrap() error {
	return se.err
}

func (se ShapeError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("UnzipError: %s\nError: %w", se.step, se.err))
}

func SE(step string, err error) error {
	return ShapeError{step: step, err: err}
}

func HandleShape(ctx ReqContext) error {
	client, clientFound := ClientMgr.clients[ctx.sessionID]
	message := []byte(fmt.Sprintf(`{"type": "LOADING_NOTIFIER", "uuid": "%s"}`, ctx.uuid))
	if clientFound {
		client.conn.WriteMessage(1, message)
	} else {
		requestQueue.Enqueue(ctx.sessionID, message)
	}
	//Upload Shapefile
	file, filePath, err := handleUpload(ctx, shp)
	if err != nil {
		return SE("HandleShapeUpload", err)
	}
	defer file.Close()
	uploadDir := path.Dir(*filePath)
	defer os.RemoveAll(uploadDir)

	//Check Zip file hash
	shapefilesHostedDir := "/cslt/web/services/shapefiles"
	zipBytes, err := os.ReadFile(*filePath)
	if err != nil {
		return SE("HandleShapeReadFile", err)
	}
	hasher := sha256.New()
	_, err = hasher.Write(zipBytes)
	if err != nil {
		return SE("HandleShapeHasher", err)
	}
	hash := fmt.Sprintf("%x", hasher.Sum(nil))
	shapeFilesServiceDir := shapefilesHostedDir + "/" + hash
	var messageErrorList []string
	var jsonErrorList []string
	var layerList []string
	_, err = os.Stat(shapeFilesServiceDir)
	if err == nil {
		logI(ctx.sessionID, fmt.Sprintf("File with hash %s already exists. Sending preprocessed services...\n", hash), "HandleShapeFileExists")
		var mutex sync.Mutex
		err = sendShapeLayers(ctx, shapeFilesServiceDir, path.Base(file.Name()), hash, &messageErrorList, &layerList, &mutex)
		if err != nil {
			return SE("HandleShapeSendLayers", err)
		}
		err = sendShapeResponse(ctx, messageErrorList, jsonErrorList, layerList)
		if err != nil {
			return SE("HandleShapeSendResponse", err)
		}
		return nil
	} else if !os.IsNotExist(err) {
		return SE("HandleShapeStat", err)
	}
	//Unzip File
	serviceList, err := unzipUpload(*filePath, shp)
	if err != nil {
		return SE("HandleShapeUnzip", err)
	}
	//Create GeoJSON
	var mutex sync.Mutex
	var wg sync.WaitGroup
	err = os.MkdirAll(shapeFilesServiceDir, 0777) // /cslt/web/services/shapefiles/SHA256
	if err != nil {
		return SE("HandleShapeMkdir", err)
	}
	for _, service := range *serviceList {
		wg.Add(1)
		go makeJsonFromShape(ctx, shapeFilesServiceDir, service, &jsonErrorList, &wg, &mutex)
	}
	wg.Wait()
	err = sendShapeLayers(ctx, shapeFilesServiceDir, path.Base(file.Name()), hash, &messageErrorList, &layerList, &mutex)
	if err != nil {
		return SE("HandleShapeSendLayers", err)
	}
	err = sendShapeResponse(ctx, messageErrorList, jsonErrorList, layerList)
	if err != nil {
		return SE("HandleShapeSendResponse", err)
	}
	return nil
}

func sendShapeLayers(ctx ReqContext, shapeServiceDir string, serviceName string, serviceUid string, messageErrorList *[]string, layerList *[]string, mutex *sync.Mutex) error {
	var wg sync.WaitGroup
	layers, err := os.ReadDir(shapeServiceDir)
	if err != nil {
		return SE("HandleShapeReadDir", err)
	}
	client, clientFound := ClientMgr.clients[ctx.sessionID]
	layerMap := make(map[string]string)
	for _, layer := range layers {
		if layer.IsDir() {
			logE(ctx.sessionID, fmt.Errorf("Found directory in shapefile service directory"), "HandleShapeIsDirServices")
			continue
		}
		layerFile, err := os.Open(shapeServiceDir + "/" + layer.Name())
		if err != nil {
			logE(ctx.sessionID, err, "HandleShapeOpenLayer")
			mutex.Lock()
			*messageErrorList = append(*messageErrorList, layer.Name())
			mutex.Unlock()
			return SE("HandleShapeOpenLayer", err)
		}
		hasher := sha256.New()
		_, err = io.Copy(hasher, layerFile)
		if err != nil {
			logE(ctx.sessionID, err, "HandleShapeCopyHasher")
			mutex.Lock()
			*messageErrorList = append(*messageErrorList, layer.Name())
			mutex.Unlock()
			return SE("HandleShapeCopyHasher", err)
		}
		layerHash := fmt.Sprintf("%x", hasher.Sum(nil))
		layerFile.Close()
		err = addService(layerHash)
		if err != nil {
			logE(ctx.sessionID, err, "addServiceShapefile")
		}
		layerMap[layer.Name()] = layerHash
	}
	wg.Add(1)
	go sendShapeMessage(ctx, &client, clientFound, ctx.sessionID, layerMap, serviceName, serviceUid, messageErrorList, layerList, &wg, mutex)
	wg.Wait()
	return nil
}

func sendShapeMessage(ctx ReqContext, client *Client, clientFound bool, sessionId string, layerMap map[string]string, serviceName string, serviceUid string, errorList *[]string, layerList *[]string, wg *sync.WaitGroup, mutex *sync.Mutex) {
	message := ShapefileMessage{}
	message.Kind = "GEOJSON"
	message.Args = []ShapefileArgs{}
	for layerName, layerHash := range layerMap {
		args := ShapefileArgs{}
		args.Uid = layerHash
		args.UrlOrGeoJsonObject = "./services/shapefiles/" + serviceUid + "/" + layerName
		args.Title = layerName
		args.Description = fmt.Sprintf("Contents of %s", layerName)
		args.ServiceInfo.ServiceTitle = serviceName
		args.ServiceInfo.ServiceId = serviceUid
		args.ServiceInfo.ServiceUrl = "UploadedFile"
		message.Args = append(message.Args, args)
	}
	message.Uuid = ctx.uuid
	jsonMessage, err := json.Marshal(message)
	logI(ctx.sessionID, fmt.Sprintf("Sending message: %s\n", string(jsonMessage[:])), "makeShapeMessage")
	if err != nil {
		logE(ctx.sessionID, err, "makeShapeMessageMarshal")
		mutex.Lock()
		*errorList = append(*errorList, serviceName)
		mutex.Unlock()
		wg.Done()
		return
	}
	if !clientFound {
		requestQueue.Enqueue(sessionId, jsonMessage)
	} else {
		mutex.Lock()
		err = client.conn.WriteMessage(1, jsonMessage)
		mutex.Unlock()
		if err != nil {
			logE(ctx.sessionID, err, "makeShapeMessageWriteMessage")
			mutex.Lock()
			*errorList = append(*errorList, serviceName)
			mutex.Unlock()
			wg.Done()
			return
		}
	}
	mutex.Lock()
	*layerList = append(*layerList, serviceName)
	mutex.Unlock()
	wg.Done()
}

func sendShapeResponse(ctx ReqContext, messageErrorList []string, jsonErrorList []string, fileList []string) error {
	if len(messageErrorList) > 0 || len(jsonErrorList) > 0 && len(fileList) > 0 {
		logE(ctx.sessionID, fmt.Errorf("Error creating GeoJSON for the following files:\n\t%s\nError sending messages for the following files: \n\t%s\n", strings.Join(jsonErrorList, "\n\t"), strings.Join(messageErrorList, "\n\t")), "HandleShapeResponseAll")
		_, err := ctx.w.Write([]byte(fmt.Sprintf("Successfully created the following files:\n\t%s\nError creating GeoJSON for the following files:\n\t%s\nError sending messages for the following files: \n\t%s\n", strings.Join(fileList, "\n\t"), strings.Join(jsonErrorList, "\n\t"), strings.Join(messageErrorList, "\n\t"))))
		if err != nil {
			return SE("HandleShapePartialSuccessResponseError", err)
		}
		return nil
	}
	if len(messageErrorList) > 0 || len(jsonErrorList) > 0 && len(fileList) == 0 {
		logE(ctx.sessionID, fmt.Errorf("Error creating GeoJSON for the following files:\n\t%s\nError sending messages for the following files: \n\t%s\n", strings.Join(jsonErrorList, "\n\t"), strings.Join(messageErrorList, "\n\t")), "HandleShapeResponseNoFiles")
		_, err := ctx.w.Write([]byte(fmt.Sprintf("No Files Could be added to the map. Error creating GeoJSON for the following files:\n\t%s\nError sending messages for the following files: \n\t%s\n", strings.Join(jsonErrorList, "\n\t"), strings.Join(messageErrorList, "\n\t"))))
		if err != nil {
			return SE("HandleShapeCompleteFailureResonse", err)
		}
		return nil
	}
	logI(ctx.sessionID, fmt.Sprintf("Successfully sent the following files to the map:\n\t%s\n", strings.Join(fileList, "\n\t")), "HandleShapeReponseSuccess")
	_, err := ctx.w.Write([]byte(fmt.Sprintf("Successfully sent the following files to the map:\n\t%s\n", strings.Join(fileList, "\n\t"))))
	if err != nil {
		return SE("HandleShapeSuccessResponseError", err)
	}
	return nil
}

func makeJsonFromShape(ctx ReqContext, shapefilesServiceDir string, shpfilePath string, errorList *[]string, wg *sync.WaitGroup, mutex *sync.Mutex) {
	_, inFileName := path.Split(shpfilePath)
	outFileName := strings.TrimSuffix(inFileName, path.Ext(inFileName)) + ".json"
	outFilePath := shapefilesServiceDir + "/" + outFileName
	cInputShapeFile := C.CString(shpfilePath)
	cOutputJsonFile := C.CString(outFilePath)
	logD(ctx.sessionID, fmt.Sprintf("Calling shape2json with args: %s, %s\n", shpfilePath, outFilePath), "makeJsonFromShape")
	mutex.Lock()
	ret := C.shape2json(cInputShapeFile, cOutputJsonFile)
	mutex.Unlock()
	logD(ctx.sessionID, fmt.Sprintf("Called shape2json with args: %s, %s\n", shpfilePath, outFilePath), "makeJsonFromShape")
	logD(ctx.sessionID, fmt.Sprintf("Return value from shape2json: %d\n", ret), "makeJsonFromShape")
	if ret != 0 {
		logE(ctx.sessionID, fmt.Errorf("%v", ret), "CERRORmakeJsonFromShape")
		mutex.Lock()
		*errorList = append(*errorList, inFileName)
		mutex.Unlock()
	}
	wg.Done()
	C.free(unsafe.Pointer(cInputShapeFile))
	C.free(unsafe.Pointer(cOutputJsonFile))
}

func HandleShapeUrl(ctx ReqContext, args json.RawMessage) error {
	var jsonArgs ShapeUrl
	logI(ctx.sessionID, fmt.Sprintf("Received body: %s\n", string(args)), "HandleShapeUrlBody")
	err := json.Unmarshal(args, &jsonArgs)
	if err != nil {
		return SE("HandleShapeUrlUnmarshal", err)
	}
	err = os.MkdirAll("/tmp", 0777)
	if err != nil {
		return SE("HandleShapeUrlMkdirAll", err)
	}
	tmpFilePath := "/tmp/" + uuid.New().String() + ".zip"
	tmpFile, err := os.Create(tmpFilePath)
	if err != nil {
		return SE("HandleShapeUrlCreate", err)
	}
	defer tmpFile.Close()
	resp, err := http.Get(jsonArgs.Url)
	if err != nil {
		return SE("HandleShapeUrlDownload", err)
	}
	defer resp.Body.Close()
	_, err = io.Copy(tmpFile, resp.Body)
	if err != nil {
		return SE("HandleShapeUrlCopy", err)
	}
	shapefilesHostedDir := "/cslt/web/services/shapefiles"
	zipBytes, err := os.ReadFile(tmpFilePath)
	if err != nil {
		return SE("HandleShapeUrlReadFile", err)
	}
	hasher := sha256.New()
	_, err = hasher.Write(zipBytes)
	if err != nil {
		return SE("HandleShapeUrlHasher", err)
	}
	hash := fmt.Sprintf("%x", hasher.Sum(nil))
	shapeFilesServiceDir := shapefilesHostedDir + "/" + hash
	var messageErrorList []string
	var jsonErrorList []string
	var layerList []string
	_, err = os.Stat(shapeFilesServiceDir)
	if err == nil {
		logI(ctx.sessionID, fmt.Sprintf("File with hash %s already exists. Sending preprocessed services...\n", hash), "HandleShapeFileExists")
		var mutex sync.Mutex
		err = sendShapeLayers(ctx, shapeFilesServiceDir, jsonArgs.ServiceInfo.ServiceTitle, hash, &messageErrorList, &layerList, &mutex)
		if err != nil {
			return SE("HandleShapeUrlSendLayers", err)
		}
		err = sendShapeResponse(ctx, messageErrorList, jsonErrorList, layerList)
		if err != nil {
			return SE("HandleShapeUrlSendResponse", err)
		}
		return nil
	} else if !os.IsNotExist(err) {
		return SE("HandleShapeUrlStat", err)
	}
	//Unzip File
	serviceList, err := unzipUpload(tmpFilePath, shp)
	if err != nil {
		return SE("HandleShapeUrlUnzip", err)
	}
	//Create GeoJSON
	var mutex sync.Mutex
	var wg sync.WaitGroup
	err = os.MkdirAll(shapeFilesServiceDir, 0777) // /cslt/web/services/shapefiles/SHA256
	if err != nil {
		return SE("HandleShapeUrlMkdir", err)
	}
	for _, service := range *serviceList {
		wg.Add(1)
		go makeJsonFromShape(ctx, shapeFilesServiceDir, service, &jsonErrorList, &wg, &mutex)
	}
	wg.Wait()
	err = sendShapeLayers(ctx, shapeFilesServiceDir, jsonArgs.ServiceInfo.ServiceTitle, hash, &messageErrorList, &layerList, &mutex)
	if err != nil {
		return SE("HandleShapeUrlSendLayers", err)
	}
	err = sendShapeResponse(ctx, messageErrorList, jsonErrorList, layerList)
	if err != nil {
		return SE("HandleShapeUrlSendResponse", err)
	}
	return nil
}
