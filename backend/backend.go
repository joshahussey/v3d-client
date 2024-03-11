package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
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

    cacheFile, err := os.Create("/tmp/" + handler.Filename)
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
    fmt.Printf("Wrote %d bytes to %s\n", bytesWritten, cacheFile.Name())
    w.WriteHeader(http.StatusOK)
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
