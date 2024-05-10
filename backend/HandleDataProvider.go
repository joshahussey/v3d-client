package main

import (
	"encoding/json"
	"fmt"
	"io"
	"sync"
)

type DataProviderMessage struct {
	Kind            string `json:"type"`
	DataProviderUrl string `json:"dataProviderUrl"`
	SessionId       string `json:"sessionId"`
	Uuid            string `json:"uuid"`
}

type DataProviderError struct {
	step string
	err  error
}

func (ke DataProviderError) Unwrap() error {
	return ke.err
}

func (ke DataProviderError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("DataProviderError: %s\nError: %w", ke.step, ke.err))
}

func DPE(step string, err error) error {
	return DataProviderError{step: step, err: err}
}

func HandleGetDataProvider(ctx ReqContext) error {
	return nil
}

func HandlePostDataProvider(ctx ReqContext) error {
	client, clientFound := ClientMgr.GetClient(ctx.sessionID)
	var mutex sync.Mutex
	sendDataProviderMessage(&client, clientFound, ctx, &mutex)
	return nil
}

func sendDataProviderMessage(client *Client, clientFound bool, ctx ReqContext, mutex *sync.Mutex) error {
	body, err := io.ReadAll(ctx.r.Body)
	if err != nil {
		logE(client.sessionID, err, "sendDataProviderMessageReadAll")
		return DPE("ReadAll", err)
	}
	var jsonBody DataProviderMessage
	jsonBody.Uuid = ctx.uuid
	jsonBody.SessionId = ctx.sessionID
	jsonBody.Kind = "SET_DATA_PROVIDER"
	err = json.Unmarshal(body, &jsonBody)
	if err != nil {
		logE(client.sessionID, err, "sendDataProviderMessageUnmarshal")
		return PoE("Unmarshal", err)
	}

	jsonMessage, err := json.Marshal(jsonBody)
	logI(client.sessionID, fmt.Sprintf("Sending message: %s\n", string(jsonMessage[:])), "sendMessage")
	if err != nil {
		logE(client.sessionID, err, "sendDataProviderMessageMarshal")
		return nil
	}

	if !clientFound {
		requestQueue.Enqueue(ctx.sessionID, jsonMessage)
	} else {
		mutex.Lock()
		err = client.conn.WriteMessage(1, jsonMessage)
		mutex.Unlock()
		if err != nil {
			logE(client.sessionID, err, "sendDataProviderMessageWriteMessage")
			return nil
		}
	}
	return nil
}
