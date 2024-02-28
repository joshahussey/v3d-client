package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Client represents a WebSocket client.
type Client struct {
	conn      *websocket.Conn
	clientID  string
	sessionID string
}

// ClientManager manages WebSocket clients and their IDs.
type ClientManager struct {
	clients map[*Client]bool
	mutex   sync.Mutex
}

// HandleWebSocket handles WebSocket connections.
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("saidonasoidnoaisnoisadnoiasdn");
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	clientID := r.URL.Query().Get("clientID")
	sessionID := r.URL.Query().Get("sessionID")

	client := &Client{
		conn:      conn,
		clientID:  clientID,
		sessionID: sessionID,
	}

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
		fmt.Printf("Received message from client %s: %s\n", c.clientID, p)

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
	fmt.Printf("first")
	http.HandleFunc("/api/a/", HandleWebSocket)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

