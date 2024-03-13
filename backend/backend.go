package main

//#cgo CFLAGS: -g -Wall
//#cgo LDFLAGS: -L. -lgdal
//#include <stdlib.h>
//#include "shape2json.h"
import "C"

import "unsafe"
import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"slices"
	"strings"
	"sync"
    
    "github.com/everystreet/go-shapefile"
	"github.com/everystreet/go-geojson/v2"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

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

type GeoJsonFeatureCollection struct {
	Kind     string             `json:"type"`
	Features *[]geojson.Feature `json:"features"`
}

type ShapefileUrlArgs struct {
	Uid                string           `json:"uid"`
	UrlOrGeoJsonObject string           `json:"urlOrGeoJsonObject"`
	Title              string           `json:"title"`
	Description        string           `json:"description"`
	Wgs84BoundingBox   Wgs84BoundingBox `json:"wgs84BoundingBox"`
	ServiceInfo        ServiceInfo      `json:"serviceInfo"`
}

type ShapefileArgs struct {
	Uid                string                   `json:"uid"`
	UrlOrGeoJsonObject GeoJsonFeatureCollection `json:"urlOrGeoJsonObject"`
	Title              string                   `json:"title"`
	Description        string                   `json:"description"`
	Wgs84BoundingBox   Wgs84BoundingBox         `json:"wgs84BoundingBox"`
	ServiceInfo        ServiceInfo              `json:"serviceInfo"`
}

type ServiceInfo struct {
	ServiceTitle string `json:"serviceTitle"`
	ServiceId    string `json:"serviceId"`
	ServiceUrl   string `json:"serviceUrl"`
}
type ShapefileUrlMessage struct {
	Kind string           `json:"type"`
	Args ShapefileUrlArgs `json:"args"`
}

type ShapefileMessage struct {
	Kind string        `json:"type"`
	Args ShapefileArgs `json:"args"`
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
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		logE(sessionID, err, "HandleShapeParseForm")
		http.Error(w, "Error parsing form\n", http.StatusBadRequest)
		return
	}
	file, handler, err := r.FormFile("file")
	if err != nil {
		logE(sessionID, err, "HandleShapeFormFile")
		http.Error(w, "Error getting file from form\n", http.StatusBadRequest)
		return
	}
	defer file.Close()
	logI(sessionID, fmt.Sprintf("Uploaded File: %+v\nFile Size: %+v\nMIME Header: %+v\n", handler.Filename, handler.Size, handler.Header), "HandleShapeFormFile")
	pathPrefix := "/cslt/cache/shapefiles/" + handler.Filename
	err = os.MkdirAll(pathPrefix+"/layers", 0777)
	if err != nil {
		logE(sessionID, err, "HandleShapeMkdirAllCache")
		http.Error(w, "Error creating shapefile cache directory\n", http.StatusBadRequest)
	}
	err = os.MkdirAll("/cslt/web/services/shapefiles/"+handler.Filename, 0777)
	if err != nil {
		logE(sessionID, err, "HandleShapeMkdirAllServices")
		http.Error(w, "Error creating shapefile service directory\n", http.StatusBadRequest)
	}
	shpPath := pathPrefix + "/" + handler.Filename
	cacheFile, err := os.Create(shpPath)
	if err != nil {
        logE(sessionID, err, "HandleShapeCreateFile")
        http.Error(w, "Error creating cache file\n", http.StatusBadRequest)
		return
	}
	defer cacheFile.Close()

	bytes, err := io.ReadAll(file)
	if err != nil {
        logE(sessionID, err, "HandleShapeReadFile")
        http.Error(w, "Error reading file\n", http.StatusBadRequest)
		return
	}
	bytesWritten, error := cacheFile.Write(bytes)
	if error != nil {
        logE(sessionID, error, "HandleShapeWriteFile")
        http.Error(w, "Error writing file\n", http.StatusBadRequest)
		return
	}
    logI(sessionID, fmt.Sprintf("Wrote %d bytes to %s\n", bytesWritten, cacheFile.Name()), "HandleShapeWriteFile")

	zipReader, err := zip.OpenReader(shpPath)
	if err != nil {
        logE(sessionID, err, "HandleShapeOpenReader")
        http.Error(w, "Error getting zip reader for file\n", http.StatusBadRequest)
		return
	}
	defer zipReader.Close()

	linkWg := sync.WaitGroup{}
	var linkMut sync.Mutex
    filesList := []string{}
    errorList := []string{}
	for _, shp := range zipReader.File {
		linkWg.Add(1)
		go makeSymLink(sessionID, shp.Name, shpPath, pathPrefix, &filesList, &errorList, &linkWg, &linkMut)
        err = os.Mkdir(pathPrefix + "/temp/", 0777)
        if err != nil {
            logE(sessionID, err, "HandleShapeMkdirTemp")
            http.Error(w, "Error creating temp directory\n", http.StatusBadRequest)
            return
        }

        shpPath := pathPrefix + "/temp/" + shp.Name 
        jsonPath := pathPrefix + "/temp/" + shp.Name + ".json"
		destHandle, err := os.Create(shpPath)
		if err != nil {
			logE(sessionID, err, "OpenDestHandleGdal")
		}
		shpHandle, err := shp.Open()
		if err != nil {
			logE(sessionID, err, "OpenShpHandleGdal")
		}
		_, err = io.Copy(destHandle, shpHandle)
        if err != nil {
            logE(sessionID, err, "CopyShpHandleGdal")
        }
        cInputShapeFile := C.CString(shpPath)
        cOutputJsonFile := C.CString(jsonPath)
        defer C.free(unsafe.Pointer(cInputShapeFile))
        defer C.free(unsafe.Pointer(cOutputJsonFile))
        C.shape2json(cInputShapeFile, cOutputJsonFile)
	}
	linkWg.Wait()
    serviceErrorList := []string{}
    err = makeShapeServices(handler.Filename, sessionID, &serviceErrorList)
    if err != nil {
        logE(sessionID, err, "HandleShapeMakeServices")
        http.Error(w, "Error creating shape services\n", http.StatusBadRequest)
        return
    }
    if len(errorList) > 0 || len(serviceErrorList) > 0 {
        logE(sessionID, fmt.Errorf("Error creating symlinks for the following files: %s", strings.Join(errorList, ", ")), "HandleShapeMakeSymLink")
        _, err := w.Write([]byte(fmt.Sprintf("Error creating symlinks for the following files: %s\nError creating services for the following files: %s", strings.Join(errorList, ", "), strings.Join(serviceErrorList, ", "))))
        if err != nil {
            logE(sessionID, err, "HandleShapeWriteError")
            http.Error(w, "Error writing error message\n", http.StatusBadRequest)
        }
        return
    }
	w.WriteHeader(http.StatusOK)
}

func makeSymLink(sessionID string, name string, shpPath string, pathPrefix string, filesList *[]string, errorList *[]string, wg *sync.WaitGroup, mutex *sync.Mutex) {
	nameComponents := strings.Split(name, ".")
    mutex.Lock()
	if len(nameComponents) < 2 {
        logI(sessionID, fmt.Sprintf("Error: Invalid shapefile archive member name: %s\nSkipping.\n", name), "makeSymLink")
        *errorList = append(*errorList, name)
        mutex.Unlock()
		wg.Done()
		return
	}
	if slices.Contains(*filesList, nameComponents[0]) {
		mutex.Unlock()
		wg.Done()
		return
	}
	*filesList = append(*filesList, nameComponents[0])
	mutex.Unlock()
    logI(sessionID, fmt.Sprintf("Creating symlink for %s\n", name), "makeSymLink")
    logD(sessionID, fmt.Sprintf("source: %s\ndestination: %s\nnc0: %s\n", shpPath, pathPrefix+"/layers/"+nameComponents[0]+".zip", nameComponents[0]), "makeSymLink")
	err := os.Symlink(shpPath, pathPrefix+"/layers/"+nameComponents[0]+".zip")
	if err != nil {
        logE(sessionID, err, "makeSymLink")
        mutex.Lock()
        *errorList = append(*errorList, name)
        mutex.Unlock()
		wg.Done()
		return
	}
	wg.Done()
}

func makeShapeServices(shpName string, sessionId string, errorList *[]string) (error) {
	path := "/cslt/cache/shapefiles/" + shpName + "/layers/"
	servicePrefix := "/cslt/web/services/shapefiles/" + shpName
	files, err := os.ReadDir(path)
	if err != nil {
        logE(sessionId, err, "makeShapeServicesReadDir")
        return err
	}

	client := ClientMgr.clients[sessionId]
	var wgs84BoundingBox Wgs84BoundingBox
	wgs84BoundingBox.Minx = -180
	wgs84BoundingBox.Miny = -90
	wgs84BoundingBox.Maxx = -180
	wgs84BoundingBox.Maxy = -90

	serviceUid := uuid.New().String()
	var wg sync.WaitGroup
	for _, file := range files {
		wg.Add(1)
		go sendMessage(shpName, servicePrefix, file.Name(), wgs84BoundingBox, serviceUid, path, &client, &wg, errorList)
	}
	wg.Wait()
    return nil
}

func sendMessage(shpName string, servicePrefix string, fileName string, bbox Wgs84BoundingBox, serviceUid string, path string, client *Client, wg *sync.WaitGroup, errorList *[]string) {
	message := ShapefileUrlMessage{}
	message.Kind = "GEOJSON"
	message.Args.Uid = uuid.New().String()
	message.Args.UrlOrGeoJsonObject = "./services/shapefiles/" + shpName + "/" + fileName + ".geojson"
	message.Args.Title = fileName
	message.Args.Description = fmt.Sprintf("Contents of %s", fileName)
	message.Args.Wgs84BoundingBox = bbox
	message.Args.ServiceInfo.ServiceTitle = shpName
	message.Args.ServiceInfo.ServiceId = serviceUid
	message.Args.ServiceInfo.ServiceUrl = "UploadedFile"
	featureCollection, err := shape2json(path, fileName)
    if err != nil {
        logE(client.sessionID, err, "sendMessageShape2Json")
        *errorList = append(*errorList, fileName)
        wg.Done()
        return
    }
	collectionJson, err := json.Marshal(featureCollection)
	if err != nil {
        logE(client.sessionID, err, "sendMessageMarshal")
        *errorList = append(*errorList, fileName)
		wg.Done()
		return
	}
	err = os.WriteFile(servicePrefix+"/"+fileName+".geojson", collectionJson, 0777)
	if err != nil {
        logE(client.sessionID, err, "sendMessageWriteFile")
        *errorList = append(*errorList, fileName)
		wg.Done()
		return
	}
	jsonMessage, err := json.Marshal(message)
    logI(client.sessionID, fmt.Sprintf("Sending message: %s\n", string(jsonMessage[:])), "sendMessage")
	if err != nil {
        logE(client.sessionID, err, "sendMessageMarshal")
        *errorList = append(*errorList, fileName)
		wg.Done()
		return
	}
	err = client.conn.WriteMessage(1, jsonMessage)
	if err != nil {
        logE(client.sessionID, err, "sendMessageWriteMessage")
        *errorList = append(*errorList, fileName)
		wg.Done()
        return
	}
	wg.Done()
}

func addShapeDirect(shpName string, sessionId string) {
	path := "/cslt/cache/shapefiles/" + shpName + "/layers/"
	files, err := os.ReadDir(path)
	if err != nil {
		log.Fatal(err)
	}

	client := ClientMgr.clients[sessionId]
	var wgs84BoundingBox Wgs84BoundingBox
	wgs84BoundingBox.Minx = -180
	wgs84BoundingBox.Miny = -90
	wgs84BoundingBox.Maxx = -180
	wgs84BoundingBox.Maxy = -90

	serviceUid := uuid.New().String()
	for _, file := range files {
		message := shape2message(path, file.Name())
		message.Args.Title = file.Name()
		message.Args.Description = fmt.Sprintf("Contents of %s", file.Name())
		message.Args.Wgs84BoundingBox = wgs84BoundingBox
		message.Args.ServiceInfo.ServiceTitle = shpName
		message.Args.ServiceInfo.ServiceId = serviceUid
		message.Args.ServiceInfo.ServiceUrl = "UploadedFile"
		jsonMessage, err := json.Marshal(message)
		log.Printf("Sending message: %s\n", string(jsonMessage[:]))
		if err != nil {
			log.Fatal(err)
		}
		err = client.conn.WriteMessage(1, jsonMessage)
		if err != nil {
			log.Fatal(err)
		}
	}
}

func shape2json(path string, file string) (GeoJsonFeatureCollection, error) {
	shp, err := os.Open(path + file)
	if err != nil {
        logE("shape2json", err, "shape2jsonOpen")
        return GeoJsonFeatureCollection{}, err
	}
	defer shp.Close()
	stat, err := shp.Stat()
	if err != nil {
        logE("shape2json", err, "shape2jsonStat")
        return GeoJsonFeatureCollection{}, err
	}

	scanner, err := shapefile.NewZipScanner(shp, stat.Size(), file)
	if err != nil {
        logE("shape2json", err, "shape2jsonNewZipScanner")
        return GeoJsonFeatureCollection{}, err
	}

	// Start the scanner
	err = scanner.Scan()
	if err != nil {
        logE("shape2json", err, "shape2jsonScan")
        return GeoJsonFeatureCollection{}, err
	}

	var features []geojson.Feature
	for {
		record := scanner.Record()
		if record == nil {
			break
		}
		feature := record.GeoJSONFeature()
		features = append(features, *feature)
	}
	featureCollection := GeoJsonFeatureCollection{Kind: "FeatureCollection", Features: &features}
	return featureCollection, nil
}

func shape2message(path string, file string) ShapefileMessage {
	shp, err := os.Open(path + file)
	if err != nil {
		log.Fatal(err)
	}
	defer shp.Close()
	stat, err := shp.Stat()
	if err != nil {
		log.Fatal(err)
	}

	scanner, err := shapefile.NewZipScanner(shp, stat.Size(), file)
	if err != nil {
		log.Fatal(err)
	}

	// Start the scanner
	err = scanner.Scan()
	if err != nil {
		log.Fatal(err)
	}

	var features []geojson.Feature
	var message ShapefileMessage
	message.Kind = "GEOJSON"
	message.Args.Uid = uuid.New().String()
	for {
		record := scanner.Record()
		if record == nil {
			break
		}
		feature := record.GeoJSONFeature()
		features = append(features, *feature)
	}
	message.Args.UrlOrGeoJsonObject = GeoJsonFeatureCollection{Kind: "FeatureCollection", Features: &features}
	err = scanner.Err()
	if err != nil {
		log.Fatal(err)
	}
	return message
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
    f, err := os.OpenFile("/cslt/logs/backend.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
    if err != nil {
        logE("LOCAL", err, "Cannot open log file, logging to stdout/stderr")
    } else {
        log.SetOutput(f)
    }
    defer f.Close()
	port := os.Getenv("BACKEND_PORT")
	log.Printf("Port: %s", port)
	http.HandleFunc("/map", HandleNewClient)
	http.HandleFunc("/add", HandleAdd)
	http.HandleFunc("/shape", HandleShape)
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
