package main

import (
	"fmt"
	"time"
)

type RequestQueueObject struct {
	ctx         ReqContext
	message     []byte
	requestTime time.Time
}

type RequestQueue struct {
	requestObjQueue []RequestQueueObject
	workingQueue    []bool
}

func NewRequestQueue() *RequestQueue {
	requestObjQueue := make([]RequestQueueObject, 0)
	workingQueue := make([]bool, 0)
	return &RequestQueue{
		requestObjQueue: requestObjQueue,
		workingQueue:    workingQueue,
	}
}

// Logical flow from the queue
func (e *RequestQueue) Work() {
	for {
	workerLoop:
		for i := range e.requestObjQueue {
			client, ok := ClientMgr.GetClient(e.requestObjQueue[i].ctx.sessionID)
			if ok {
				logD(e.requestObjQueue[i].ctx.sessionID, fmt.Sprintf("Found Client At Position: %s", i), "Work")
				err := client.conn.WriteMessage(1, e.requestObjQueue[i].message)
				if err == nil {
					logD(e.requestObjQueue[i].ctx.sessionID, "No Error Sending Request, Removing", "Work")
					if i != 0 {
						e.Dequeue(i)
					} else {
						e.DequeueFirst()
					}
					break workerLoop
				}
			} else {
				if e.requestObjQueue[i].requestTime.Add(time.Second * 30).Before(time.Now()) {
					logD(e.requestObjQueue[i].ctx.sessionID, "Request Is Older Than 30s, Removing", "Work")
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

func (e *RequestQueue) Enqueue(context ReqContext, message []byte) {
	logD(context.sessionID, "Adding Item To Queue", "Enqueue")
	rqo := RequestQueueObject{context, message, time.Now()}
	e.requestObjQueue = append(e.requestObjQueue, rqo)
	logD(context.sessionID, fmt.Sprintf("%s", e.requestObjQueue), "Enqueue")
}

func (e *RequestQueue) DequeueFirst() RequestQueueObject {
	element := e.requestObjQueue[0] //Get element at index
	logD(element.ctx.sessionID, fmt.Sprintf("Dequeue Item at Position: %s", 0), "Dequeue")
	e.requestObjQueue = e.requestObjQueue[1:] // Slice off the element once it is dequeued.
	logD(element.ctx.sessionID, fmt.Sprintf("%s", e.requestObjQueue), "Dequeue")
	return element
}
func (e *RequestQueue) Dequeue(index int) RequestQueueObject {
	element := e.requestObjQueue[index] //Get element at index
	logD(element.ctx.sessionID, fmt.Sprintf("Dequeue Item at Position: %s", index), "Dequeue")
	e.requestObjQueue = append(e.requestObjQueue[:index], e.requestObjQueue[index+1:]...) // Slice off the element once it is dequeued.
	logD(element.ctx.sessionID, fmt.Sprintf("%s", e.requestObjQueue), "Dequeue")
	return element
}
