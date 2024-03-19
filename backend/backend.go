package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"

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

type ReqContext struct {
    w http.ResponseWriter
    r *http.Request
    sessionID string
}

// HandleNewClient
func HandleNewClient(w http.ResponseWriter, r *http.Request) {
    ctx := ReqContext{w: w, r: r, sessionID: r.URL.Query().Get("sessionID")}
	sessionID := r.URL.Query().Get("sessionID")
	if _, upgrade := r.Header["Upgrade"]; !upgrade {
        reqError(ctx, fmt.Errorf("This endpoint is for websockets only"), "HandleNewClient")
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
        reqError(ctx, err, "HandleNewClientUpgrade")
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
    ctx := ReqContext{w: w, r: r, sessionID: sessionID}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
        reqError(ctx, err, "HandleAddWsUpgrade")
		return
	}
	defer conn.Close()
	_, p, err := conn.ReadMessage()
	if err != nil {
        reqError(ctx, err, "HandleAddWsReadMessage")
		return
	}
	client := ClientMgr.clients[sessionID]
	writeErr := client.conn.WriteMessage(1, p)
	if writeErr != nil {
        reqError(ctx, writeErr, "HandleAddWsWriteMessage")
		return
	}
}

// Handle Post request
func HandlePost(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("sessionID")
    ctx := ReqContext{w: w, r: r, sessionID: sessionID}
	client := ClientMgr.clients[sessionID]
	body, err := io.ReadAll(r.Body)
	if err != nil {
        reqError(ctx, err, "HandlePostReadBody")
		return
	}
	writeErr := client.conn.WriteMessage(1, body)
	if writeErr != nil {
        reqError(ctx, writeErr, "HandlePostWriteMessage")
		return
	}
	w.WriteHeader(http.StatusOK)
}

// Handle Get request
func HandleGet(w http.ResponseWriter, r *http.Request) {
    ctx := ReqContext{w: w, r: r, sessionID: r.URL.Query().Get("sessionID")}
    reqError(ctx, fmt.Errorf("Attempt to make GET request"), "HandleGet")
}

// Handle Patch request on /add
func HandlePatch(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("sessionID")
    ctx := ReqContext{w: w, r: r, sessionID: sessionID}
	client := ClientMgr.clients[sessionID]
	body, err := io.ReadAll(r.Body)
	if err != nil {
        reqError(ctx, err, "HandlePatchReadBody")
		return
	}
	writeErr := client.conn.WriteMessage(1, body)
	if writeErr != nil {
        reqError(ctx, writeErr, "HandlePatchWriteMessage")
		return
	}
	w.WriteHeader(http.StatusOK)
}

// Handle Put request
func HandlePut(w http.ResponseWriter, r *http.Request) {
    ctx := ReqContext{w: w, r: r, sessionID: r.URL.Query().Get("sessionID")}
    reqError(ctx, fmt.Errorf("Attempt to make PUT request"), "HandlePut")
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
    ctx := ReqContext{w: w, r: r, sessionID: r.URL.Query().Get("sessionID")}
    reqError(ctx, fmt.Errorf("Attempt to make DELETE request"), "HandleDelete")
}

// Handle Unknown request on /add
func HandleUnknownRequest(w http.ResponseWriter, r *http.Request) {
    ctx := ReqContext{w: w, r: r, sessionID: r.URL.Query().Get("sessionID")}
    reqError(ctx, fmt.Errorf("Unknown request"), "HandleUnknownRequest")
}

func HandleShape(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("sessionID")
    ctx := ReqContext{w: w, r: r, sessionID: sessionID}
    //Upload Shapefile
    file, filePath, err := handleUpload(ctx, shp)
    if err != nil {
        e(ctx, err)
        return
    }
    defer file.Close()

	//Check Zip file hash
	shapefilesHostedDir := "/cslt/web/services/shapefiles"
	zipBytes, err := os.ReadFile(*filePath)
	if err != nil {
        e(ctx, err)
		return
	}
	hasher := sha256.New()
	_, err = hasher.Write(zipBytes)
	if err != nil {
        e(ctx, fmt.Errorf("Error writing hash: %w", err))
		return
	}
	hash := fmt.Sprintf("%x", hasher.Sum(nil))
	shapeFilesServiceDir := shapefilesHostedDir + "/" + hash
	var messageErrorList []string
	var jsonErrorList []string
	var layerList []string
	_, err = os.Stat(shapeFilesServiceDir)
	if err == nil {
		logI(sessionID, fmt.Sprintf("File with hash %s already exists. Sending preprocessed services...\n", hash), "HandleShapeFileExists")
		var mutex sync.Mutex
		sendShapeLayers(ctx, shapeFilesServiceDir, file.Name(), hash, &messageErrorList, &layerList, &mutex)
		sendShapeResponse(ctx, messageErrorList, jsonErrorList, layerList)
		return
	} else if !os.IsNotExist(err) {
        e(ctx, fmt.Errorf("Error checking if file exists: %w", err))
		return
	}

	//Unzip File
    serviceList, err := unzipUpload(*filePath, shp)
    if err != nil {
        e(ctx, err)
        return
    }

	//Create GeoJSON
	var mutex sync.Mutex
	var wg sync.WaitGroup
	err = os.MkdirAll(shapeFilesServiceDir, 0777) // /cslt/web/services/shapefiles/SHA256
	if err != nil {
        e(ctx, fmt.Errorf("Error creating directory: %w", err))
		return
	}
	for _, service := range *serviceList {
		wg.Add(1)
		go makeJsonFromShape(ctx, shapeFilesServiceDir, service, &jsonErrorList, &wg, &mutex)
	}
	wg.Wait()
	sendShapeLayers(ctx, shapeFilesServiceDir, file.Name(), hash, &messageErrorList, &layerList, &mutex)
	sendShapeResponse(ctx, messageErrorList, jsonErrorList, layerList)
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


func reqError(ctx ReqContext, err error, step string) {
    logE(ctx.sessionID, err, step)
    http.Error(ctx.w, err.Error(), http.StatusBadRequest)
}
