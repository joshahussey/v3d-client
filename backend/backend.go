package main

//#cgo CFLAGS: -g -Wall
//#cgo LDFLAGS: -L. -lgdal
//#include <stdlib.h>
//#include "shape2json.h"
import "C"

import (
	"archive/zip"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
	"sync"
	"unsafe"

	"github.com/gorilla/websocket"
)

var shapeServicesPath = "/cslt/web/services/shapefiles"
var kmlServicesPath = "/cslt/web/services/kml"
var geopackageServicesPath = "/cslt/web/services/geopackage"

// Types
// Upgrader is a buffer for a websocket connection
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Client represents a WebSocket client.
type Client struct {
	conn      *websocket.Conn
	sessionID string
}

// ClientManager manages WebSocket clients and their IDs.
type ClientManager struct {
	clients map[string]Client
	mutex   sync.Mutex
}

type ShapefileArgs struct {
	Uid                string      `json:"uid"`
	UrlOrGeoJsonObject string      `json:"urlOrGeoJsonObject"`
	Title              string      `json:"title"`
	Description        string      `json:"description"`
	ServiceInfo        ServiceInfo `json:"serviceInfo"`
}

type ServiceInfo struct {
	ServiceTitle string `json:"serviceTitle"`
	ServiceId    string `json:"serviceId"`
	ServiceUrl   string `json:"serviceUrl"`
}
type ShapefileMessage struct {
	Kind string        `json:"type"`
	Args ShapefileArgs `json:"args"`
}

type KmlUrlMessage struct {
	Kind string  `json:"type"`
	Args KmlArgs `json:"args"`
}

type KmlArgs struct {
	Uid         string      `json:"uid"`
	Url         string      `json:"url"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	ServiceInfo ServiceInfo `json:"serviceInfo"`
}

type Wgs84BoundingBox struct {
	Minx float64 `json:"minx"`
	Miny float64 `json:"miny"`
	Maxx float64 `json:"maxx"`
	Maxy float64 `json:"maxy"`
}

// HandleNewClient
func HandleNewClient(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("sessionID")
	if _, upgrade := r.Header["Upgrade"]; !upgrade {
		http.Error(w, "This endpoint is for websockets only\n", http.StatusBadRequest)
		logE(sessionID, fmt.Errorf("Attempt to connect to websocket endpoint with non-websocket request"), "HandleNewClient")
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Error upgrading request to Websocket\n", http.StatusBadRequest)
		logE(sessionID, err, "NewClientUpgrade")
		return
	}
	client := Client{
		conn:      conn,
		sessionID: sessionID,
	}
	ClientMgr.AddClient(sessionID, client)
	logI(sessionID, r.RemoteAddr+": Connected Client", "AddClient")
	log.Printf("%s: Connected client %s.\n", r.RemoteAddr, sessionID)
	go client.Listen()
}

func HandleAdd(w http.ResponseWriter, r *http.Request) {
	if _, upgrade := r.Header["Upgrade"]; upgrade {
		HandleAddWs(w, r)
	} else {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, PATCH, WS, WSS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		switch r.Method {
		case "POST":
			HandlePost(w, r)
		case "GET":
			HandleGet(w, r)
		case "PATCH":
			HandlePatch(w, r)
		case "PUT":
			HandlePut(w, r)
		case "OPTIONS":
			w.WriteHeader(http.StatusOK)
		case "DELETE":
			HandleDelete(w, r)
		case "HEAD":
			HandleHead(w, r)
		default:
			HandleUnknownRequest(w, r)
		}
	}
}

// Handle Websocket request
func HandleAddWs(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("sessionID")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logE(sessionID, err, "HandleAddWsUpgrade")
		http.Error(w, "Error upgrading request to Websocket\n", http.StatusBadRequest)
		return
	}
	defer conn.Close()
	_, p, err := conn.ReadMessage()
	if err != nil {
		logE(sessionID, err, "HandleAddWsReadMessage")
		http.Error(w, "Error reading message from Websocket\n", http.StatusBadRequest)
		return
	}
	client := ClientMgr.clients[sessionID]
	writeErr := client.conn.WriteMessage(1, p)
	if writeErr != nil {
		logE(sessionID, writeErr, "HandleAddWsWriteMessage")
		http.Error(w, "Error writing message to Websocket\n", http.StatusBadRequest)
		return
	}
}

// Handle Post request
func HandlePost(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("sessionID")
	client := ClientMgr.clients[sessionID]
	body, err := io.ReadAll(r.Body)
	if err != nil {
		logE(sessionID, err, "HandlePostReadBody")
		http.Error(w, "Error reading message\n", http.StatusBadRequest)
		return
	}
	writeErr := client.conn.WriteMessage(1, body)
	if writeErr != nil {
		logE(sessionID, writeErr, "HandlePostWriteMessage")
		http.Error(w, "Error writing message\n", http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// Handle Get request
func HandleGet(w http.ResponseWriter, r *http.Request) {
	logE(r.URL.Query().Get("sessionID"), fmt.Errorf("Attempt to make GET request"), "HandleGet")
	http.Error(w, fmt.Sprintf("Attempt to make %s request, please use POST, PATCH, or connect a Websocket\n", r.Method), http.StatusBadRequest)
}

// Handle Patch request on /add
func HandlePatch(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("sessionID")
	client := ClientMgr.clients[sessionID]
	body, err := io.ReadAll(r.Body)
	if err != nil {
		logE(sessionID, err, "HandlePatchReadBody")
		http.Error(w, "Error reading message\n", http.StatusBadRequest)
		return
	}
	writeErr := client.conn.WriteMessage(1, body)
	if writeErr != nil {
		logE(sessionID, writeErr, "HandlePatchWriteMessage")
		http.Error(w, "Error writing message\n", http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// Handle Put request
func HandlePut(w http.ResponseWriter, r *http.Request) {
	logE(r.URL.Query().Get("sessionID"), fmt.Errorf("Attempt to make PUT request"), "HandlePut")
	http.Error(w, fmt.Sprintf("Attempt to make %s request, please use POST, PATCH, or connect a Websocket\n", r.Method), http.StatusBadRequest)
}

// Handle Head request on /add
func HandleHead(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, PATCH, WS, WSS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.WriteHeader(http.StatusOK)
}

// Handle Delete request on /add
func HandleDelete(w http.ResponseWriter, r *http.Request) {
	logE(r.URL.Query().Get("sessionID"), fmt.Errorf("Attempt to make DELETE request"), "HandleDelete")
	http.Error(w, fmt.Sprintf("Attempt to make %s request, please use POST, PATCH, or connect a Websocket\n", r.Method), http.StatusBadRequest)
}

// Handle Unknown request on /add
func HandleUnknownRequest(w http.ResponseWriter, r *http.Request) {
	logE(r.URL.Query().Get("sessionID"), fmt.Errorf("Attempt to make %s request", r.Method), "HandleUnknownRequest")
	http.Error(w, fmt.Sprintf("Attempt to make %s request, please use POST, PATCH, or connect a Websocket\n", r.Method), http.StatusBadRequest)
}

func HandleShape(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("sessionID")

	//File Upload
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		logE(sessionID, err, "HandleShapeParseForm")
		http.Error(w, "Error parsing form\n", http.StatusBadRequest)
		return
	}
	uploadedFile, upload, err := r.FormFile("file")
	if err != nil {
		logE(sessionID, err, "HandleShapeFormFile")
		http.Error(w, "Error getting file from form\n", http.StatusBadRequest)
		return
	}
	defer uploadedFile.Close()
	logI(sessionID, fmt.Sprintf("Uploaded File: %+v\nFile Size: %+v\nMIME Header: %+v\n", upload.Filename, upload.Size, upload.Header), "HandleShapeFormFile")
	bytes, err := io.ReadAll(uploadedFile)
	if err != nil {
		logE(sessionID, err, "HandleShapeReadFile")
		http.Error(w, "Error reading file\n", http.StatusBadRequest)
		return
	}

	//Write Zip File
	zipDirPath := "/cslt/uploads/" + sessionID + "/shapefiles/" + upload.Filename // /cslt/uploads/SESSIONID/shapefiles/example.zip
	zipFilePath := zipDirPath + "/" + upload.Filename                             // /cslt/uploads/SESSIONID/shapefiles/example.zip/example.zip
	err = os.MkdirAll(zipDirPath, 0777)
	if err != nil {
		logE(sessionID, err, "HandleShapeMkdirZipDir")
		http.Error(w, "Error creating zip directory\n", http.StatusBadRequest)
		return
	}
	zipFile, err := os.Create(zipFilePath)
	if err != nil {
		logE(sessionID, err, "HandleShapeCreateFile")
		http.Error(w, "Error creating cache file\n", http.StatusBadRequest)
		return
	}
	bytesWritten, error := zipFile.Write(bytes)
	if error != nil {
		logE(sessionID, error, "HandleShapeWriteFile")
		http.Error(w, "Error writing file\n", http.StatusBadRequest)
		return
	}
	logI(sessionID, fmt.Sprintf("Wrote %d bytes to %s\n", bytesWritten, zipFile.Name()), "HandleShapeWriteFile")

	//Check Zip file hash
	shapefilesHostedDir := "/cslt/web/services/shapefiles"
	zipBytes, err := os.ReadFile(zipFilePath)
	if err != nil {
		logE(sessionID, err, "HandleShapeReadFile")
		http.Error(w, "Error reading file\n", http.StatusBadRequest)
		return
	}
	hasher := sha256.New()
	_, err = hasher.Write(zipBytes)
	if err != nil {
		logE(sessionID, err, "HandleShapeCopyHasher")
		http.Error(w, "Error copying file to hasher\n", http.StatusBadRequest)
		return
	}
	zipFile.Close()
	hash := fmt.Sprintf("%x", hasher.Sum(nil))
	shapeFilesServiceDir := shapefilesHostedDir + "/" + hash
	var messageErrorList []string
	var jsonErrorList []string
	var layerList []string
	_, err = os.Stat(shapeFilesServiceDir)
	if err == nil {
		logI(sessionID, fmt.Sprintf("File with hash %s already exists. Sending preprocessed services...\n", hash), "HandleShapeFileExists")
		var mutex sync.Mutex
		sendShapeLayers(w, sessionID, shapeFilesServiceDir, upload.Filename, hash, &messageErrorList, &layerList, &mutex)
		sendShapeResponse(w, sessionID, messageErrorList, jsonErrorList, layerList)
		return
	} else if !os.IsNotExist(err) {
		logE(sessionID, err, "HandleShapeStat")
		http.Error(w, "Error checking if file exists\n", http.StatusBadRequest)
		return
	}
	//Unzip File
	zipContentsDirPath := zipDirPath + "/contents"
	err = os.MkdirAll(zipContentsDirPath, 0777) // /cslt/uploads/SESSIONID/shapefiles/example.zip/contents
	if err != nil {
		logE(sessionID, err, "HandleShapeMkdirContents")
		http.Error(w, "Error creating contents directory\n", http.StatusBadRequest)
		return
	}
	zipReader, err := zip.OpenReader(zipFilePath)
	if err != nil {
		logE(sessionID, err, "HandleShapeOpenReader")
		http.Error(w, "Error getting zip reader for file\n", http.StatusBadRequest)
		return
	}
	defer zipReader.Close()

	var shpFiles []string
	for _, file := range zipReader.File {
		filePath := zipContentsDirPath + "/" + file.Name
		if file.FileInfo().IsDir() {
			zippedDirFiles, err := os.ReadDir(filePath)
			if err != nil {
				logE(sessionID, err, "HandleShapeReadDir")
				http.Error(w, "Error reading directory\n", http.StatusBadRequest)
				return
			}
			for _, zippedDirFile := range zippedDirFiles {
				innerDirFilePath := filePath + "-" + zippedDirFile.Name()
				if zippedDirFile.IsDir() {
					continue
				}
				innerDirFile, err := os.Create(innerDirFilePath)
				if err != nil {
					logE(sessionID, err, "HandleShapeCreateInnerDirFile")
					http.Error(w, "Error creating inner directory file\n", http.StatusBadRequest)
					return
				}
				innerDirFileReader, err := file.Open()
				if err != nil {
					logE(sessionID, err, "HandleShapeOpenInnerDirFile")
					http.Error(w, "Error opening inner directory file\n", http.StatusBadRequest)
					return
				}
				_, err = io.Copy(innerDirFile, innerDirFileReader)
				if err != nil {
					logE(sessionID, err, "HandleShapeCopyInnerDirFile")
					http.Error(w, "Error copying inner directory file\n", http.StatusBadRequest)
					return
				}
				innerDirFile.Close()
				innerDirFileReader.Close()
				if ".shp" == path.Ext(innerDirFilePath) {
					shpFiles = append(shpFiles, innerDirFilePath)
				}
			}
		} else {
			fileReader, err := file.Open()
			if err != nil {
				logE(sessionID, err, "HandleShapeOpenFile")
				http.Error(w, "Error opening file\n", http.StatusBadRequest)
				return
			}
			newFile, err := os.Create(filePath)
			if err != nil {
				logE(sessionID, err, "HandleShapeCreateFile")
				http.Error(w, "Error creating file\n", http.StatusBadRequest)
				return
			}
			_, err = io.Copy(newFile, fileReader)
			if err != nil {
				logE(sessionID, err, "HandleShapeCopyFile")
				http.Error(w, "Error copying file\n", http.StatusBadRequest)
				return
			}
			newFile.Close()
			fileReader.Close()
			if ".shp" == path.Ext(filePath) {
				shpFiles = append(shpFiles, filePath)
			}
		}
	}

	//Create GeoJSON
	var mutex sync.Mutex
	var wg sync.WaitGroup
	err = os.MkdirAll(shapeFilesServiceDir, 0777) // /cslt/web/services/shapefiles/SHA256
	if err != nil {
		logE(sessionID, err, "HandleShapeMkdirServices")
		http.Error(w, "Error creating shapefile service directory\n", http.StatusBadRequest)
		return
	}
	for _, shp := range shpFiles {
		wg.Add(1)
		go makeJsonFromShape(sessionID, shapeFilesServiceDir, shp, &jsonErrorList, &wg, &mutex)
	}
	wg.Wait()
	sendShapeLayers(w, sessionID, shapeFilesServiceDir, upload.Filename, hash, &messageErrorList, &layerList, &mutex)
	sendShapeResponse(w, sessionID, messageErrorList, jsonErrorList, layerList)
}

func sendShapeLayers(w http.ResponseWriter, sessionID string, shapeServiceDir string, serviceName string, serviceUid string, messageErrorList *[]string, layerList *[]string, mutex *sync.Mutex) {
	var wg sync.WaitGroup
	layers, err := os.ReadDir(shapeServiceDir)
	if err != nil {
		logE(sessionID, err, "HandleShapeReadDirServices")
		http.Error(w, "Error reading shapefile service directory\n", http.StatusBadRequest)
		return
	}
	client := ClientMgr.clients[sessionID]
	for _, layer := range layers {
		if layer.IsDir() {
			logE(sessionID, fmt.Errorf("Found directory in shapefile service directory"), "HandleShapeIsDirServices")
			continue
		}
		layerFile, err := os.Open(shapeServiceDir + "/" + layer.Name())
		if err != nil {
			logE(sessionID, err, "HandleShapeOpenLayer")
			mutex.Lock()
			*messageErrorList = append(*messageErrorList, layer.Name())
			mutex.Unlock()
			return
		}
		hasher := sha256.New()
		_, err = io.Copy(hasher, layerFile)
		if err != nil {
			logE(sessionID, err, "HandleShapeCopyHasher")
			mutex.Lock()
			*messageErrorList = append(*messageErrorList, layer.Name())
			mutex.Unlock()
			return
		}
		layerHash := fmt.Sprintf("%x", hasher.Sum(nil))
		layerFile.Close()
		wg.Add(1)
		go sendShapeMessage(sessionID, &client, layer.Name(), layerHash, serviceName, serviceUid, messageErrorList, layerList, &wg, mutex)
	}
	wg.Wait()
}

func sendShapeMessage(sessionID string, client *Client, layerName string, layerHash string, serviceName string, serviceUid string, errorList *[]string, layerList *[]string, wg *sync.WaitGroup, mutex *sync.Mutex) {
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
	logI(sessionID, fmt.Sprintf("Sending message: %s\n", string(jsonMessage[:])), "makeShapeMessage")
	if err != nil {
		logE(sessionID, err, "makeShapeMessageMarshal")
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
		logE(sessionID, err, "makeShapeMessageWriteMessage")
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

func sendShapeResponse(w http.ResponseWriter, sessionID string, messageErrorList []string, jsonErrorList []string, fileList []string) {
	if len(messageErrorList) > 0 || len(jsonErrorList) > 0 && len(fileList) > 0 {
		logE(sessionID, fmt.Errorf("Error creating GeoJSON for the following files:\n\t%s\nError sending messages for the following files: \n\t%s\n", strings.Join(jsonErrorList, "\n\t"), strings.Join(messageErrorList, "\n\t")), "HandleShapeMakeSymLink")
		_, err := w.Write([]byte(fmt.Sprintf("Successfully created the following files:\n\t%s\nError creating GeoJSON for the following files:\n\t%s\nError sending messages for the following files: \n\t%s\n", strings.Join(fileList, "\n\t"), strings.Join(jsonErrorList, "\n\t"), strings.Join(messageErrorList, "\n\t"))))
		if err != nil {
			logE(sessionID, err, "HandleShapeWriteError")
			http.Error(w, "Error writing error message\n", http.StatusBadRequest)
		}
		return
	}
	if len(messageErrorList) > 0 || len(jsonErrorList) > 0 && len(fileList) == 0 {
		logE(sessionID, fmt.Errorf("Error creating GeoJSON for the following files:\n\t%s\nError sending messages for the following files: \n\t%s\n", strings.Join(jsonErrorList, "\n\t"), strings.Join(messageErrorList, "\n\t")), "HandleShapeMakeSymLink")
		_, err := w.Write([]byte(fmt.Sprintf("No Files Could be added to the map. Error creating GeoJSON for the following files:\n\t%s\nError sending messages for the following files: \n\t%s\n", strings.Join(jsonErrorList, "\n\t"), strings.Join(messageErrorList, "\n\t"))))
		if err != nil {
			logE(sessionID, err, "HandleShapeWriteError")
			http.Error(w, "Error writing error message\n", http.StatusBadRequest)
		}
		return
	}
	logI(sessionID, fmt.Sprintf("Successfully sent the following files to the map:\n\t%s\n", strings.Join(fileList, "\n\t")), "HandleShapeMakeSymLink")
	_, err := w.Write([]byte(fmt.Sprintf("Successfully sent the following files to the map:\n\t%s\n", strings.Join(fileList, "\n\t"))))
	if err != nil {
		logE(sessionID, err, "HandleShapeWriteError")
		http.Error(w, "Error writing error message\n", http.StatusBadRequest)
	}
}

func makeJsonFromShape(sessionID string, shapefilesServiceDir string, shpfilePath string, errorList *[]string, wg *sync.WaitGroup, mutex *sync.Mutex) {
	_, inFileName := path.Split(shpfilePath)
	outFileName := strings.TrimSuffix(inFileName, path.Ext(inFileName)) + ".json"
	outFilePath := shapefilesServiceDir + "/" + outFileName
	cInputShapeFile := C.CString(shpfilePath)
	cOutputJsonFile := C.CString(outFilePath)
	defer C.free(unsafe.Pointer(cInputShapeFile))
	defer C.free(unsafe.Pointer(cOutputJsonFile))
	logD(sessionID, fmt.Sprintf("Calling shape2json with args: %s, %s\n", shpfilePath, outFilePath), "makeJsonFromShape")
	_, err := C.shape2json(cInputShapeFile, cOutputJsonFile)
	logD(sessionID, fmt.Sprintf("Called shape2json with args: %s, %s\n", shpfilePath, outFilePath), "makeJsonFromShape")
	if err != nil {
		logE(sessionID, err, "CERRORmakeJsonFromShape")
		mutex.Lock()
		*errorList = append(*errorList, inFileName)
		mutex.Unlock()
	}
	wg.Done()
}

func HandleKml(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("sessionID")
	client := ClientMgr.clients[sessionID]
	var layerList []string
	errorList := []string{}

	//Parse the form
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		logE(sessionID, err, "HandleKmlParseForm")
		http.Error(w, "Error getting file from form\n", http.StatusBadRequest)
		return
	}

	//Get File From Form
	file, handler, err := r.FormFile("file")
	if err != nil {
		logE(sessionID, err, "HandleKmlFormFile")
		http.Error(w, "Error getting file from form\n", http.StatusBadRequest)
		return
	}
	defer file.Close()
	logI(sessionID, fmt.Sprintf("Uploaded File: %+v\nFile Size: %+v\nMIME Header: %+v\n", handler.Filename, handler.Size, handler.Header), "HandleShapeFormFile")

	//Make Directory To Store KMLs If Needed
	path := "/cslt/web/services/kml/"
	err = os.MkdirAll(path, 0777)
	if err != nil {
		logE(sessionID, err, "HandleKmlMkdirAllServices")
		http.Error(w, "Error creating kml directory\n", http.StatusBadRequest)
	}

	//Read Bytes From Form File
	inputFileBytes, err := io.ReadAll(file)
	if err != nil {
		logE(sessionID, err, "HandleKmlReadFile")
		http.Error(w, "Error reading file\n", http.StatusBadRequest)
		return
	}

	//Get Input File Hash
	inputHasher := sha256.New()
	_, err = inputHasher.Write(inputFileBytes)
	if err != nil {
		logE(sessionID, err, "HandleKmlReadFile")
		http.Error(w, "Error reading file\n", http.StatusBadRequest)
		return
	}
	inputFileHash := fmt.Sprintf("%x", inputHasher.Sum(nil))

	// Check If File With Name Exists
	kmlServicePath := "/cslt/web/services/kml/" + handler.Filename
	_, err = os.Stat(kmlServicePath)
	if err == nil {
		//Get Existing File Hash
		existingFileBytes, err := os.ReadFile(kmlServicePath)
		if err != nil {
			logE(sessionID, err, "HandleKmlReadFile")
			http.Error(w, "Error reading file\n", http.StatusBadRequest)
			return
		}
		existingFileHasher := sha256.New()
		_, err = existingFileHasher.Write(existingFileBytes)
		if err != nil {
			logE(sessionID, err, "HandleKmlWriteFile")
			http.Error(w, "Error writing file\n", http.StatusBadRequest)
			return
		}
		existingHash := fmt.Sprintf("%x", existingFileHasher.Sum(nil))

		if inputFileHash == existingHash {
			logI(sessionID, fmt.Sprintf("File with hash %s already exists. Sending preprocessed services...\n", inputFileHash), "HandleShapeFileExists")
			sendKmlMessage(handler.Filename, existingHash, &client, &errorList)
			sendKmlResponse(w, sessionID, errorList, layerList)
			return
		}
	} else if !os.IsNotExist(err) {
		logE(sessionID, err, "HandleKmlStat")
		http.Error(w, "Error checking if file exists\n", http.StatusBadRequest)
		return
	}

	//Create The Cache File
	kmlPath := path + handler.Filename
	cacheFile, err := os.Create(kmlPath)
	if err != nil {
		logE(sessionID, err, "HandleKmlCreateFile")
		http.Error(w, "Error creating cache file\n", http.StatusBadRequest)
		return
	}
	defer cacheFile.Close()

	//Write The Form File Bytes To The Cache File
	bytesWritten, err := cacheFile.Write(inputFileBytes)
	if err != nil {
		logE(sessionID, err, "HandleKmlWriteFile")
		http.Error(w, "Error writing file\n", http.StatusBadRequest)
		return
	}
	logI(sessionID, fmt.Sprintf("Wrote %d bytes to %s\n", bytesWritten, cacheFile.Name()), "HandleKmlWriteFile")

	pathComponents := strings.Split(cacheFile.Name(), "/")
	fileName := pathComponents[len(pathComponents)-1]
	sendKmlMessage(fileName, inputFileHash, &client, &errorList)
	layerList = append(layerList, fileName)

	sendKmlResponse(w, sessionID, errorList, layerList)
}

func sendKmlMessage(fileName string, serviceUid string, client *Client, errorList *[]string) {
	message := KmlUrlMessage{}
	message.Kind = "KML"
	message.Args.Uid = serviceUid
	message.Args.Url = "./services/kml/" + fileName
	message.Args.Title = fileName
	message.Args.Description = fmt.Sprintf("Contents of %s", fileName)
	message.Args.ServiceInfo.ServiceTitle = fileName
	message.Args.ServiceInfo.ServiceId = serviceUid
	message.Args.ServiceInfo.ServiceUrl = "UploadedFile"
	jsonMessage, err := json.Marshal(message)
	logI(client.sessionID, fmt.Sprintf("Sending message: %s\n", string(jsonMessage[:])), "sendMessage")
	if err != nil {
		logE(client.sessionID, err, "sendKmlMessageMarshal")
		*errorList = append(*errorList, fileName)
		return
	}

	err = client.conn.WriteMessage(1, jsonMessage)
	if err != nil {
		logE(client.sessionID, err, "sendKmlMessageWriteMessage")
		*errorList = append(*errorList, fileName)
		return
	}
}

func sendKmlResponse(w http.ResponseWriter, sessionID string, messageErrorList []string, fileList []string) {
	if len(messageErrorList) > 0 && len(fileList) > 0 {
		logE(sessionID, fmt.Errorf("Error sending messages for the following files: \n\t%s\n", strings.Join(messageErrorList, "\n\t")), "HandleShapeMakeSymLink")
		_, err := w.Write([]byte(fmt.Sprintf("Successfully created the following files:\n\t%s\nError sending messages for the following files: \n\t%s\n", strings.Join(fileList, "\n\t"), strings.Join(messageErrorList, "\n\t"))))
		if err != nil {
			logE(sessionID, err, "sendKmlResponseWriteError")
			http.Error(w, "Error writing error message\n", http.StatusBadRequest)
		}
		return
	}
	if len(messageErrorList) > 0 && len(fileList) == 0 {
		logE(sessionID, fmt.Errorf("Error sending messages for the following files: \n\t%s\n", strings.Join(messageErrorList, "\n\t")), "HandleShapeMakeSymLink")
		_, err := w.Write([]byte(fmt.Sprintf("No Files Could be added to the map. Error sending messages for the following files: \n\t%s\n", strings.Join(messageErrorList, "\n\t"))))
		if err != nil {
			logE(sessionID, err, "sendKmlResponseWriteError")
			http.Error(w, "Error writing error message\n", http.StatusBadRequest)
		}
		return
	}
	logI(sessionID, fmt.Sprintf("Successfully sent the following files to the map:\n\t%s\n", strings.Join(fileList, "\n\t")), "HandleShapeMakeSymLink")
	_, err := w.Write([]byte(fmt.Sprintf("Successfully sent the following files to the map:\n\t%s\n", strings.Join(fileList, "\n\t"))))
	if err != nil {
		logE(sessionID, err, "sendKmlResponseWriteError")
		http.Error(w, "Error writing error message\n", http.StatusBadRequest)
	}
}

// Listen listens for incoming messages from the client.
func (c *Client) Listen() {
	defer func() {
		ClientMgr.RemoveClient(c.sessionID)
		c.conn.Close()
	}()

	for {
		//messageType, _, err := c.conn.ReadMessage()
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}

		// Handle the received message based on your requirements
		fmt.Printf("Session ID: %v, sent message.\n", c.sessionID)

		// Example: Send a response back to the client
		//c.conn.WriteMessage(messageType, []byte("Message received!"))
	}
}

// ClientManager instance to manage clients
var ClientMgr = &ClientManager{
	clients: make(map[string]Client),
}

// AddClient adds a new client to the manager.
func (cm *ClientManager) AddClient(sessionID string, client Client) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	cm.clients[sessionID] = client
	fmt.Printf("Client %s added to clients list.\n", client.sessionID)
}

// RemoveClient removes a client from the manager.
func (cm *ClientManager) RemoveClient(sessionID string) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	delete(cm.clients, sessionID)
	fmt.Printf("Client %s disconnected\n", sessionID)
}

func main() {
	var f *os.File
	err := os.MkdirAll("/cslt/logs", 0777)
	if err != nil {
		logE("LOCAL", err, "Cannot create log directory, logging to stdout/stderr")
	} else {
		f, err := os.Create("/cslt/logs/backend.log")
		if err != nil {
			logE("LOCAL", err, "Cannot open log file, logging to stdout/stderr")
		} else {
			log.SetOutput(f)
		}
	}
	defer f.Close()
	port := os.Getenv("BACKEND_PORT")
	log.Printf("Port: %s", port)
	http.HandleFunc("/map", HandleNewClient)
	http.HandleFunc("/add", HandleAdd)
	http.HandleFunc("/shape", HandleShape)
	http.HandleFunc("/kml", HandleKml)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), nil))
}

func logE(sessionID string, err error, step string) {
	log.Printf("[ERROR] SessionID: %s: Step: %s\n\t %s", sessionID, step, err)
}

func logI(sessionID string, message string, step string) {
	log.Printf("[INFO] SessionID: %s: Step: %s\n\t %s", sessionID, step, message)
}

func logD(sessionID string, message string, step string) {
	log.Printf("[DEBUG] SessionID: %s: Step: %s\n\t %s", sessionID, step, message)
}
