package main

import (
	"fmt"
	"time"
    "strings"
)

type RequestQueueObject struct {
	sessionID   string
	message     []byte
	requestTime time.Time
}

type RequestQueue struct {
	requestObjQueue []RequestQueueObject
}

func NewRequestQueue() *RequestQueue {
	requestObjQueue := make([]RequestQueueObject, 0)
	return &RequestQueue{
		requestObjQueue: requestObjQueue,
	}
}

func (e *RequestQueueObject) String() string {
    return fmt.Sprintf("RequestQueueObject: %s: %s", e.requestTime.String(), e.message)
}

func (e *RequestQueue) String() string {
    var builder strings.Builder
    for _, rq := range e.requestObjQueue {
        builder.WriteString(fmt.Sprintf("%s\n", rq.String()))
    }
    return fmt.Sprintf("RequestQueue: %s", builder.String())
}

// Logical flow from the queue
func (e *RequestQueue) Work() {
	for {
	workerLoop:
		for i, rq := range e.requestObjQueue {
			client, ok := ClientMgr.GetClient(rq.sessionID)
			if ok {
				logD(rq.sessionID, fmt.Sprintf("Found Client for Queued Object: %s", &rq), "Work")
				err := client.conn.WriteMessage(1, rq.message)
				if err == nil {
					logD(rq.sessionID, "No Error Sending Request, Removing", "Work")
					if i != 0 {
						e.Dequeue(i)
					} else {
						e.DequeueFirst()
					}
					break workerLoop
				}
			} else {
				if rq.requestTime.Add(time.Second * 30).Before(time.Now()) {
					logD(rq.sessionID, "Request Is Older Than 30s, Removing", "Work")
					if i != 0 {
						e.Dequeue(i)
					} else {
						e.DequeueFirst()
					}
					break workerLoop
				}
			}
		}
	}
}

func (e *RequestQueue) Enqueue(sessionID string, message []byte) {
	logD(sessionID, "Adding Item To Queue", "Enqueue")
	rqo := RequestQueueObject{sessionID, message, time.Now()}
	e.requestObjQueue = append(e.requestObjQueue, rqo)
	logD(sessionID, e.String(), "Enqueue")
}

func (e *RequestQueue) DequeueFirst() RequestQueueObject {
	element := e.requestObjQueue[0] //Get element at index
	logD(element.sessionID, fmt.Sprintf("Dequeue Item at Position: %d", 0), "Dequeue")
	e.requestObjQueue = e.requestObjQueue[1:] // Slice off the element once it is dequeued.
	logD(element.sessionID, e.String(), "Dequeue")
	return element
}
func (e *RequestQueue) Dequeue(index int) RequestQueueObject {
	element := e.requestObjQueue[index] //Get element at index
	logD(element.sessionID, fmt.Sprintf("Dequeue Item at Position: %d", index), "Dequeue")
	e.requestObjQueue = append(e.requestObjQueue[:index], e.requestObjQueue[index+1:]...) // Slice off the element once it is dequeued.
    logD(element.sessionID, e.String(), "Dequeue")
	return element
}
