package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/davecgh/go-spew/spew"
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
	clients map[*Client]bool
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

	fmt.Printf("%v\n", sessionID)

	client := &Client{
		conn:      conn,
		sessionID: sessionID,
	}

	fmt.Printf("Client:\n")
	spew.Dump(client)

	ClientMgr.AddClient(client)

	go client.Listen()
}

func HandleRequest(w http.ResponseWriter, r *http.Request) {
	
}

// Listen listens for incoming messages from the client.
func (c *Client) Listen() {
	defer func() {
		ClientMgr.RemoveClient(c)
		c.conn.Close()
	}()

	for {
		messageType, p, err := c.conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}

		// Handle the received message based on your requirements
		fmt.Printf("Session ID: %v\n", c.sessionID)

		// Example: Send a response back to the client
		c.conn.WriteMessage(messageType, []byte("Message received!"))
	}
}

// ClientManager instance to manage clients
var ClientMgr = &ClientManager{
	clients: make(map[*Client]bool),
}

// AddClient adds a new client to the manager.
func (cm *ClientManager) AddClient(client *Client) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	cm.clients[client] = true
	fmt.Printf("Client %s connected with Session ID %s\n", client.clientID, client.sessionID)
}

// RemoveClient removes a client from the manager.
func (cm *ClientManager) RemoveClient(client *Client) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	delete(cm.clients, client)
	fmt.Printf("Client %s disconnected\n", client.clientID)
}

func main() {
	http.HandleFunc("/", HandleWebSocket)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

