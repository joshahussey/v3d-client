package main

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
    "github.com/google/uuid"
	"github.com/everystreet/go-geojson/v2"
	"github.com/everystreet/go-shapefile"
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
	Kind     string           `json:"type"`
	Features *[]geojson.Feature `json:"features"`
}

type ShapefileArgs struct {
	Uid                string `json:"uid"`
	UrlOrGeoJsonObject GeoJsonFeatureCollection `json:"urlOrGeoJsonObject"`
    Title              string `json:"title"`
    Description        string `json:"description"`
    Wgs84BoundingBox   Wgs84BoundingBox `json:"wgs84BoundingBox"`
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

type Wgs84BoundingBox struct {
    Minx float64 `json:"minx"`
    Miny float64 `json:"miny"`
    Maxx float64 `json:"maxx"`
    Maxy float64 `json:"maxy"`
}

// HandleNewClient
func HandleNewClient(w http.ResponseWriter, r *http.Request) {
	if _, upgrade := r.Header["Upgrade"]; !upgrade {
		http.Error(w, "This endpoint is for websockets only\n", http.StatusBadRequest)
		log.Printf("%s: Attempt to connect to websocket endpoint with non-websocket request\n", r.RemoteAddr)
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("%s: Error upgrading to websocket: %s\n", r.RemoteAddr, err)
		return
	}
	sessionID := r.URL.Query().Get("sessionID")
	client := Client{
		conn:      conn,
		sessionID: sessionID,
	}
	ClientMgr.AddClient(sessionID, client)
	log.Printf("%s: Connected client %s.\n", r.RemoteAddr, sessionID)
	go client.Listen()
}

func HandleAdd(w http.ResponseWriter, r *http.Request) {
	fmt.Println("HandleAdd")
	if _, upgrade := r.Header["Upgrade"]; upgrade {
		HandleAddWs(w, r)
	} else {
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
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, PATCH, WS, WSS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
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

// Handle Websocket request on /add
func HandleAddWs(w http.ResponseWriter, r *http.Request) {
	fmt.Println("HandleAddWs")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()
	sessionID := r.URL.Query().Get("sessionID")
	_, p, err := conn.ReadMessage()
	if err != nil {
		log.Println(err)
		return
	}
	client := ClientMgr.clients[sessionID]
	writeErr := client.conn.WriteMessage(1, p)
	if writeErr != nil {
		log.Println(writeErr)
		return
	}
}

// Handle Post request on /add
func HandlePost(w http.ResponseWriter, r *http.Request) {
	fmt.Println("HandlePost")
	sessionID := r.URL.Query().Get("sessionID")
	client := ClientMgr.clients[sessionID]
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("%s: SessionID: %s: Error reading message: %s\n", r.RemoteAddr, sessionID, err)
		return
	}
	writeErr := client.conn.WriteMessage(1, body)
	if writeErr != nil {
		log.Printf("%s: SessionID: %s: Error writing message: %s\n", r.RemoteAddr, sessionID, writeErr)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// Handle Get request on /add
func HandleGet(w http.ResponseWriter, r *http.Request) {
	fmt.Println("HandleGet")
	http.Error(w, fmt.Sprintf("Attempt to make %s request, please use POST, PATCH, or connect a Websocket\n", r.Method), http.StatusBadRequest)
	log.Printf("%s: Attempt to make %s request, please use POST, PATCH, or connect a Websocket\n", r.Method, r.RemoteAddr)
}

// Handle Patch request on /add
func HandlePatch(w http.ResponseWriter, r *http.Request) {
	fmt.Println("HandlePatch")
	sessionID := r.URL.Query().Get("sessionID")
	client := ClientMgr.clients[sessionID]
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("%s: SessionID: %s: Error reading message: %s\n", r.RemoteAddr, sessionID, err)
		return
	}
	writeErr := client.conn.WriteMessage(1, body)
	if writeErr != nil {
		log.Printf("%s: SessionID: %s: Error writing message: %s\n", r.RemoteAddr, sessionID, writeErr)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// Handle Put request on /add
func HandlePut(w http.ResponseWriter, r *http.Request) {
	fmt.Println("HandlePut")
	http.Error(w, fmt.Sprintf("Attempt to make %s request, please use POST, PATCH, or connect a Websocket\n", r.Method), http.StatusBadRequest)
	log.Printf("%s: Attempt to make %s request, please use POST, PATCH, or connect a Websocket\n", r.Method, r.RemoteAddr)
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
	fmt.Println("HandlePut")
	http.Error(w, fmt.Sprintf("Attempt to make %s request, please use POST, PATCH, or connect a Websocket\n", r.Method), http.StatusBadRequest)
	log.Printf("%s: Attempt to make %s request, please use POST, PATCH, or connect a Websocket\n", r.Method, r.RemoteAddr)
}

// Handle Unknown request on /add
func HandleUnknownRequest(w http.ResponseWriter, r *http.Request) {
	fmt.Println("HandlePut")
	http.Error(w, fmt.Sprintf("Attempt to make %s request, please use POST, PATCH, or connect a Websocket\n", r.Method), http.StatusBadRequest)
	log.Printf("%s: Attempt to make %s request, please use POST, PATCH, or connect a Websocket\n", r.Method, r.RemoteAddr)
}

func HandleShape(w http.ResponseWriter, r *http.Request) {
	fmt.Println("HandleShape")
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		log.Println("Error in parsing form")
		log.Println(err)
		return
	}
	file, handler, err := r.FormFile("file")
	if err != nil {
		log.Println("Error in getting file")
		log.Println(err)
		return
	}
	defer file.Close()
	fmt.Printf("Uploaded File: %+v\n", handler.Filename)
	fmt.Printf("File Size: %+v\n", handler.Size)
	fmt.Printf("MIME Header: %+v\n", handler.Header)

	pathPrefix := "/cslt/cache/shapefiles/" + handler.Filename
	err = os.MkdirAll(pathPrefix+"/layers", 0777)
	if err != nil {
		log.Println("Error creating shapefile directory")
		log.Println(err)
	}
	shpPath:= pathPrefix + "/" + handler.Filename
		cacheFile, err := os.Create(shpPath)
	if err != nil {
		log.Println("Error in creating file")
		log.Println(err)
		return
	}
	defer cacheFile.Close()

	bytes, err := io.ReadAll(file)
	if err != nil {
		log.Println("Error in reading file")
		log.Println(err)
		return
	}
	bytesWritten, error := cacheFile.Write(bytes)
	if error != nil {
		log.Println("Error in writing file")
		log.Println(err)
		return
	}
	log.Printf("Wrote %d bytes to %s MOTHERFUCKER\n", bytesWritten, cacheFile.Name())

	filesList := []string{}

	log.Printf("Path: %s\n", shpPath)
	zipReader, err := zip.OpenReader(shpPath)
	if err != nil {
		log.Println("Error getting zip reader for file.")
		log.Println(err)
		return
	}
	defer zipReader.Close()

	for _, shp := range zipReader.File {
		fmt.Printf("Path: %s\n", shp.Name)
		nameComponents := strings.Split(shp.Name, ".")
		if len(nameComponents) < 2 {
			log.Printf("Error: Invalid shapefile archive member name: %s\nSkipping.\n", shp.Name)
			continue
		}

		if slices.Contains(filesList, nameComponents[0]) {
			continue
		}

		filesList = append(filesList, nameComponents[0])
		fmt.Printf("old: %s\nnew: %s\nnc0: %s\n", shpPath, pathPrefix+"/layers/"+nameComponents[0]+".zip", nameComponents[0])
		err = os.Symlink(shpPath, pathPrefix+"/layers/"+nameComponents[0]+".zip")
        if err != nil {
            log.Println(err)
        }
	}

	sessionID := r.URL.Query().Get("sessionID")
	addShape(handler.Filename, sessionID)

	w.WriteHeader(http.StatusOK)
}

func addShape(shpName string, sessionId string) {
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


	for _, file := range files {
		message := shape2message(path, file.Name())
        message.Args.Title = file.Name()
        message.Args.Description = fmt.Sprintf("Contents of %s", file.Name())
        message.Args.Wgs84BoundingBox = wgs84BoundingBox
        message.Args.ServiceInfo.ServiceTitle = shpName
        message.Args.ServiceInfo.ServiceId = uuid.New().String()
        message.Args.ServiceInfo.ServiceUrl = "UploadedFile"
        jsonMessage, err := json.Marshal(message)
        log.Printf("Sending message: %s\n", string(jsonMessage[:]))
        if err != nil {
            log.Fatal(err)
        }
//		err = client.conn.WriteJSON(jsonMessage)
		err = client.conn.WriteMessage(1, jsonMessage)
        if err != nil {
            log.Fatal(err)
        }
	}
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
	port := os.Getenv("BACKEND_PORT")
	log.Printf("Port: %s", port)
	http.HandleFunc("/map", HandleNewClient)
	http.HandleFunc("/add", HandleAdd)
	http.HandleFunc("/shape", HandleShape)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), nil))
}
