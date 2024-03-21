package main

import (
	"fmt"
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

type ServiceInfo struct {
	ServiceTitle string `json:"serviceTitle"`
	ServiceId    string `json:"serviceId"`
	ServiceUrl   string `json:"serviceUrl"`
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

func HandleConnect(w http.ResponseWriter, r *http.Request) {
    ctx := ReqContext{w: w, r: r, sessionID: r.URL.Query().Get("sessionID")}
    err := HandleNewClient(ctx)
    if err != nil {
        e(ctx, err)
        return
    }
}

func HandleShapeRequest(w http.ResponseWriter, r *http.Request) {
    ctx := ReqContext{w: w, r: r, sessionID: r.URL.Query().Get("sessionID")}
    err := HandleShape(ctx)
    if err != nil {
        e(ctx, err)
        return
    }
}

func HandleKmlRequest(w http.ResponseWriter, r *http.Request) {
    ctx := ReqContext{w: w, r: r, sessionID: r.URL.Query().Get("sessionID")}
    err := HandleKml(ctx)
    if err != nil {
        e(ctx, err)
        return
    }
}

func HandleAdd(w http.ResponseWriter, r *http.Request) {
    ctx := ReqContext{w: w, r: r, sessionID: r.URL.Query().Get("sessionID")}
	if _, upgrade := r.Header["Upgrade"]; upgrade {
        err := HandleAddWs(ctx)
            if err != nil {
                e(ctx, err)
                return
            }
	} else {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, PATCH, WS, WSS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		switch r.Method {
		case "POST":
            err := HandlePost(ctx)
            if err != nil {
                e(ctx, err)
                return
            }
		case "GET":
            err := HandleGet(ctx)
            if err != nil {
                e(ctx, err)
                return
            }
		case "PATCH":
            err := HandlePatch(ctx)
            if err != nil {
                e(ctx, err)
                return
            }
		case "PUT":
            err := HandlePut(ctx)
            if err != nil {
                e(ctx, err)
                return
            }
		case "OPTIONS":
			w.WriteHeader(http.StatusOK)
		case "DELETE":
            err := HandleDelete(ctx)
            if err != nil {
                e(ctx, err)
                return
            }
		case "HEAD":
            err := HandleHead(ctx)
            if err != nil {
                e(ctx, err)
                return
            }
		default:
            err := HandleUnknownRequest(ctx)
            if err != nil {
                e(ctx, err)
                return
            }
		}
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
	initDb()
	http.HandleFunc("/map", HandleConnect)
	http.HandleFunc("/add", HandleAdd)
	http.HandleFunc("/shape", HandleShapeRequest)
	http.HandleFunc("/kml", HandleKmlRequest)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), nil))
}
