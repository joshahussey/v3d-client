package main

import (
	"fmt"
	"strings"
	"time"
)

type RequestQueue struct {
	requestSessionQueue []RequestSessionQueue
}

func NewRequestQueue() *RequestQueue {
	requestSessionQueue := make([]RequestSessionQueue, 0)
	return &RequestQueue{
		requestSessionQueue: requestSessionQueue,
	}
}

func (e *RequestQueue) String() string {
	var builder strings.Builder
	for _, rq := range e.requestSessionQueue {
		builder.WriteString(fmt.Sprintf("Request Session Queue ID: %s", rq.sessionID))
		builder.WriteString(fmt.Sprintf("%s\n", rq.String()))
	}
	return fmt.Sprintf("RequestQueue: %s", builder.String())
}

func (e *RequestQueue) Enqueue(sessionID string, message []byte) {
	logD(sessionID, "Adding Item To Queue", "RequestQueue.Enqueue")
	var foundRequestSessionQueue *RequestSessionQueue
	var rsqIndex = -1
	for i, rsq := range e.requestSessionQueue {
		if rsq.sessionID == sessionID {
			foundRequestSessionQueue = &rsq
			rsqIndex = i
			break
		}
	}
	if rsqIndex != -1 {
		foundRequestSessionQueue.Enqueue(message)
		e.requestSessionQueue[rsqIndex] = *foundRequestSessionQueue
	} else {
		foundRequestSessionQueue = NewRequestSessionQueue(sessionID)
		foundRequestSessionQueue.Enqueue(message)
		e.requestSessionQueue = append(e.requestSessionQueue, *foundRequestSessionQueue)
	}
	logD(sessionID, e.String(), "RequestQueue.Enqueue")
}

func (e *RequestQueue) DequeueFirst() RequestSessionQueue {
	element := e.requestSessionQueue[0] //Get element at index
	logD(element.sessionID, fmt.Sprintf("Dequeue Item at Position: %d", 0), "RequestQueue.DequeueFirst")
	e.requestSessionQueue = e.requestSessionQueue[1:] // Slice off the element once it is dequeued.
	logD(element.sessionID, e.String(), "RequestQueue.Dequeue")
	return element
}

func (e *RequestQueue) Dequeue(index int) RequestSessionQueue {
	element := e.requestSessionQueue[index] //Get element at index
	logD(element.sessionID, fmt.Sprintf("Dequeue Item at Position: %d", index), "RequestQueue.Dequeue")
	e.requestSessionQueue = append(e.requestSessionQueue[:index], e.requestSessionQueue[index+1:]...) // Slice off the element once it is dequeued.
	logD(element.sessionID, e.String(), "RequestQueue.Dequeue")
	return element
}

type RequestSessionQueue struct {
	sessionID       string
	requestObjQueue []RequestQueueObject
}

func NewRequestSessionQueue(sessionID string) *RequestSessionQueue {
	requestObjQueue := make([]RequestQueueObject, 0)
	return &RequestSessionQueue{
		requestObjQueue: requestObjQueue,
		sessionID:       sessionID,
	}
}

func (e *RequestSessionQueue) String() string {
	var builder strings.Builder
	for _, rq := range e.requestObjQueue {
		builder.WriteString(fmt.Sprintf("%s\n", rq.String()))
	}
	return fmt.Sprintf("RequestSessionQueue: %s", builder.String())
}

func (e *RequestSessionQueue) Enqueue(message []byte) {
	logD(e.sessionID, "Adding Item To RequestSessionQueue", "RequestSessionQueue.Enqueue")
	rqo := RequestQueueObject{message, time.Now()}
	e.requestObjQueue = append(e.requestObjQueue, rqo)
	logD(e.sessionID, fmt.Sprintf("Request Session Queue After Adding Object: %s", e.String()), "RequestSessionQueue.Enqueue")
}

func (e *RequestSessionQueue) DequeueFirst() RequestQueueObject {
	element := e.requestObjQueue[0] //Get element at index
	logD(e.sessionID, fmt.Sprintf("Dequeue Item at Position: %d", 0), "RequestSessionQueue.DequeueFirst")
	e.requestObjQueue = e.requestObjQueue[1:] // Slice off the element once it is dequeued.
	logD(e.sessionID, fmt.Sprintf("RequestSessionQueue after dequeue: %s", e.String()), "RequestSessionQueue.DequeueFirst")
	return element
}

type RequestQueueObject struct {
	message     []byte
	requestTime time.Time
}

func (e *RequestQueueObject) String() string {
	return fmt.Sprintf("RequestQueueObject: %s: %s", e.requestTime.String(), e.message)
}

func (reqQueue *RequestQueue) Work() {
	for {
		time.Sleep(time.Duration(10 * float64(time.Millisecond)))
		for reqSessionQueueIndex, reqSessionQueue := range reqQueue.requestSessionQueue {
			client, clientFound := ClientMgr.GetClient(reqSessionQueue.sessionID)
			for _, reqQueueObject := range reqSessionQueue.requestObjQueue {
				if reqQueueObject.requestTime.Add(time.Second * 30).Before(time.Now()) {
					logD(reqSessionQueue.sessionID, "Request Is Older Than 30s, Removing", "Work")
					reqSessionQueue.DequeueFirst()
					reqQueue.requestSessionQueue[reqSessionQueueIndex] = reqSessionQueue
					break
				} else if clientFound {
					err := client.conn.WriteMessage(1, reqQueueObject.message)
					if err == nil {
						logD(reqSessionQueue.sessionID, "No Error Sending Request, Removing", "Work")
						reqSessionQueue.DequeueFirst()
						reqQueue.requestSessionQueue[reqSessionQueueIndex] = reqSessionQueue
						break
					}
				} else {
					break
				}
			}
			if len(reqSessionQueue.requestObjQueue) == 0 {
				if reqSessionQueueIndex != 0 {
					reqQueue.Dequeue(reqSessionQueueIndex)
				} else {
					reqQueue.DequeueFirst()
				}
				break
			}
		}
	}
}
