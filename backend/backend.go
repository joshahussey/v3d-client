package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"sync"
)

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

// HandleWebSocket handles WebSocket connections.
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	sessionID := r.URL.Query().Get("sessionID")
	client := Client{
		conn:      conn,
		sessionID: sessionID,
	}
	ClientMgr.AddClient(sessionID, client)
	fmt.Printf("Connected client %s.\n", sessionID)
	go client.Listen()
}

func HandleAdd(w http.ResponseWriter, r *http.Request) {
    fmt.Println("handleadd")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
    defer conn.Close()
	sessionID := r.URL.Query().Get("sessionID")
	messageType, p, err := conn.ReadMessage()
	if err != nil {
		log.Println(err)
		return
	}
    fmt.Printf("This is not fit: %s", string(p))
	client := ClientMgr.clients[sessionID]
    writeErr := client.conn.WriteMessage(messageType, []byte("YOUVE GOT MAIL MF"))
    if writeErr != nil {
        log.Println(writeErr)
        return
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
	http.HandleFunc("/", HandleWebSocket)
	http.HandleFunc("/add", HandleAdd)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
