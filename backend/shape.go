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
)

func sendShapeLayers(ctx ReqContext, shapeServiceDir string, serviceName string, serviceUid string, messageErrorList *[]string, layerList *[]string, mutex *sync.Mutex) {
	var wg sync.WaitGroup
	layers, err := os.ReadDir(shapeServiceDir)
	if err != nil {
		logE(ctx.sessionID, err, "HandleShapeReadDirServices")
		http.Error(ctx.w, "Error reading shapefile service directory\n", http.StatusBadRequest)
		return
	}
	client := ClientMgr.clients[ctx.sessionID]
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
			return
		}
		hasher := sha256.New()
		_, err = io.Copy(hasher, layerFile)
		if err != nil {
			logE(ctx.sessionID, err, "HandleShapeCopyHasher")
			mutex.Lock()
			*messageErrorList = append(*messageErrorList, layer.Name())
			mutex.Unlock()
			return
		}
		layerHash := fmt.Sprintf("%x", hasher.Sum(nil))
		layerFile.Close()
		wg.Add(1)
		go sendShapeMessage(ctx, &client, layer.Name(), layerHash, serviceName, serviceUid, messageErrorList, layerList, &wg, mutex)
	}
	wg.Wait()
}

func sendShapeMessage(ctx ReqContext, client *Client, layerName string, layerHash string, serviceName string, serviceUid string, errorList *[]string, layerList *[]string, wg *sync.WaitGroup, mutex *sync.Mutex) {
	message := ShapefileMessage{}
	message.Kind = "GEOJSON"
	message.Args.Uid = layerHash
	message.Args.UrlOrGeoJsonObject = "./services/shapefiles/" + serviceUid + "/" + layerName
	message.Args.Title = layerName
	message.Args.Description = fmt.Sprintf("Contents of %s", layerName)
	message.Args.ServiceInfo.ServiceTitle = serviceName
	message.Args.ServiceInfo.ServiceId = serviceUid
	message.Args.ServiceInfo.ServiceUrl = "UploadedFile"
	jsonMessage, err := json.Marshal(message)
	logI(ctx.sessionID, fmt.Sprintf("Sending message: %s\n", string(jsonMessage[:])), "makeShapeMessage")
	if err != nil {
		logE(ctx.sessionID, err, "makeShapeMessageMarshal")
		mutex.Lock()
		*errorList = append(*errorList, layerName)
		mutex.Unlock()
		wg.Done()
		return
	}
	mutex.Lock()
	err = client.conn.WriteMessage(1, jsonMessage)
	mutex.Unlock()
	if err != nil {
		logE(ctx.sessionID, err, "makeShapeMessageWriteMessage")
		mutex.Lock()
		*errorList = append(*errorList, layerName)
		mutex.Unlock()
		wg.Done()
		return
	}
	mutex.Lock()
	*layerList = append(*layerList, layerName)
	mutex.Unlock()
	wg.Done()
}

func sendShapeResponse(ctx ReqContext, messageErrorList []string, jsonErrorList []string, fileList []string) {
	if len(messageErrorList) > 0 || len(jsonErrorList) > 0 && len(fileList) > 0 {
		logE(ctx.sessionID, fmt.Errorf("Error creating GeoJSON for the following files:\n\t%s\nError sending messages for the following files: \n\t%s\n", strings.Join(jsonErrorList, "\n\t"), strings.Join(messageErrorList, "\n\t")), "HandleShapeMakeSymLink")
		_, err := ctx.w.Write([]byte(fmt.Sprintf("Successfully created the following files:\n\t%s\nError creating GeoJSON for the following files:\n\t%s\nError sending messages for the following files: \n\t%s\n", strings.Join(fileList, "\n\t"), strings.Join(jsonErrorList, "\n\t"), strings.Join(messageErrorList, "\n\t"))))
		if err != nil {
			logE(ctx.sessionID, err, "HandleShapeWriteError")
			http.Error(ctx.w, "Error writing error message\n", http.StatusBadRequest)
		}
		return
	}
	if len(messageErrorList) > 0 || len(jsonErrorList) > 0 && len(fileList) == 0 {
		logE(ctx.sessionID, fmt.Errorf("Error creating GeoJSON for the following files:\n\t%s\nError sending messages for the following files: \n\t%s\n", strings.Join(jsonErrorList, "\n\t"), strings.Join(messageErrorList, "\n\t")), "HandleShapeMakeSymLink")
		_, err := ctx.w.Write([]byte(fmt.Sprintf("No Files Could be added to the map. Error creating GeoJSON for the following files:\n\t%s\nError sending messages for the following files: \n\t%s\n", strings.Join(jsonErrorList, "\n\t"), strings.Join(messageErrorList, "\n\t"))))
		if err != nil {
			logE(ctx.sessionID, err, "HandleShapeWriteError")
			http.Error(ctx.w, "Error writing error message\n", http.StatusBadRequest)
		}
		return
	}
	logI(ctx.sessionID, fmt.Sprintf("Successfully sent the following files to the map:\n\t%s\n", strings.Join(fileList, "\n\t")), "HandleShapeMakeSymLink")
	_, err := ctx.w.Write([]byte(fmt.Sprintf("Successfully sent the following files to the map:\n\t%s\n", strings.Join(fileList, "\n\t"))))
	if err != nil {
		logE(ctx.sessionID, err, "HandleShapeWriteError")
		http.Error(ctx.w, "Error writing error message\n", http.StatusBadRequest)
	}
}

func makeJsonFromShape(ctx ReqContext, shapefilesServiceDir string, shpfilePath string, errorList *[]string, wg *sync.WaitGroup, mutex *sync.Mutex) {
	_, inFileName := path.Split(shpfilePath)
	outFileName := strings.TrimSuffix(inFileName, path.Ext(inFileName)) + ".json"
	outFilePath := shapefilesServiceDir + "/" + outFileName
	cInputShapeFile := C.CString(shpfilePath)
	cOutputJsonFile := C.CString(outFilePath)
	defer C.free(unsafe.Pointer(cInputShapeFile))
	defer C.free(unsafe.Pointer(cOutputJsonFile))
	logD(ctx.sessionID, fmt.Sprintf("Calling shape2json with args: %s, %s\n", shpfilePath, outFilePath), "makeJsonFromShape")
	_, err := C.shape2json(cInputShapeFile, cOutputJsonFile)
	logD(ctx.sessionID, fmt.Sprintf("Called shape2json with args: %s, %s\n", shpfilePath, outFilePath), "makeJsonFromShape")
	if err != nil {
		logE(ctx.sessionID, err, "CERRORmakeJsonFromShape")
		mutex.Lock()
		*errorList = append(*errorList, inFileName)
		mutex.Unlock()
	}
	wg.Done()
}

