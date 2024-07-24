package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path"
	"sync"
)

type KmlUrlMessage struct {
	Kind string  `json:"type"`
	Args KmlArgs `json:"args"`
	Uuid string  `json:"uuid"`
}

type KmlArgs struct {
	Uid         string      `json:"uid"`
	Url         string      `json:"url"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	ServiceInfo ServiceInfo `json:"serviceInfo"`
}

type KmlResponse struct {
	ResponseMessage
	MessageErrorList []string `json:"messageErrorList"`
	SuccessList      []string `json:"successList"`
}

type KmlError struct {
	step string
	err  error
}

func (ke KmlError) Unwrap() error {
	return ke.err
}

func (ke KmlError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("KmlError: %s\nError: %w", ke.step, ke.err))
}

func KE(step string, err error) error {
	return KmlError{step: step, err: err}
}

func HandleKml(ctx ReqContext) error {
	client, clientFound := ClientMgr.GetClient(ctx.sessionID)
	message := []byte(fmt.Sprintf(`{"type": "LOADING_NOTIFIER", "uuid": "%s"}`, ctx.uuid))
	if clientFound {
		err := client.conn.WriteMessage(1, message)
		if err != nil {
			logE(ctx.sessionID, err, "HandleKmlWriteMessage")
		}
	} else {
		requestQueue.Enqueue(ctx.sessionID, message)
	}

	errorList := []string{}
	var mutex sync.Mutex

	filename, hash, err := UploadHashMoveDelete(ctx, kml)
	if err != nil {
		return KE("UploadHashMoveDelete", err)
	}

	// Check If Directory With Hash Exists
	_, err = os.Stat(KmlDirPath(hash))
	if err == nil {
		logI(ctx.sessionID, fmt.Sprintf("File with hash %s already exists. Sending preprocessed services...\n", hash), "HandleShapeFileExists")
		sendKmlMessage(filename, hash, &client, clientFound, ctx, &errorList, &mutex)
		layerList, err := kmlServiceList(hash)
		if err != nil {
			return KE("HandleKmlServiceList", err)
		}
		err = sendKmlResponse(ctx, errorList, *layerList)
		if err != nil {
			return KE("HandleSendKmlResponse", err)
		}
		return nil
	} else if !os.IsNotExist(err) {
		return KE("Stat", err)
	}

	// Make the directory for the file hash
	err = os.MkdirAll(KmlDirPath(hash), 0777) // /cslt/web/services/kml/SHA256
	if err != nil {
		return KE("HandleKmlMkdir", err)
	}

	err = MoveFile(DownloadedFilePath(hash, kml, filename), KmlServicePath(hash, filename))
	//Write The Form File Bytes To The Cache File
	if err != nil {
		return KE("Rename", err)
	}

	err = addServiceToCleanupList(hash)
	if err != nil {
		logE(ctx.sessionID, err, "addServiceKml")
	}
	sendKmlMessage(filename, hash, &client, clientFound, ctx, &errorList, &mutex)
	layerList, err := kmlServiceList(hash)
	if err != nil {
		return KE("HandleKmlServiceList", err)
	}
	err = sendKmlResponse(ctx, errorList, *layerList)
	if err != nil {
		return KE("HandleSendKmlResponse", err)
	}
	return nil
}

func sendKmlMessage(fileName string, serviceUid string, client *Client, clientFound bool, ctx ReqContext, errorList *[]string, mutex *sync.Mutex) {
	message := KmlUrlMessage{}
	message.Kind = "KML"
	message.Args.Uid = serviceUid
	message.Args.Url = "./services/kml/" + serviceUid + "/" + fileName
	message.Args.Title = fileName
	message.Args.Description = fmt.Sprintf("Contents of %s", fileName)
	message.Args.ServiceInfo.ServiceTitle = fileName
	message.Args.ServiceInfo.ServiceId = serviceUid
	message.Args.ServiceInfo.ServiceUrl = "UploadedFile"
	message.Uuid = ctx.uuid
	jsonMessage, err := json.Marshal(message)
	logI(client.sessionID, fmt.Sprintf("Sending message: %s\n", string(jsonMessage[:])), "sendMessage")
	if err != nil {
		logE(client.sessionID, err, "sendKmlMessageMarshal")
		*errorList = append(*errorList, fileName)
		return
	}

	if !clientFound {
		requestQueue.Enqueue(ctx.sessionID, jsonMessage)
	} else {
		mutex.Lock()
		err = client.conn.WriteMessage(1, jsonMessage)
		mutex.Unlock()
		if err != nil {
			logE(client.sessionID, err, "sendKmlMessageWriteMessage")
			*errorList = append(*errorList, fileName)
			return
		}
	}
}

func sendKmlResponse(ctx ReqContext, messageErrorList []string, fileList []string) error {
	_, ok := ClientMgr.clients[ctx.sessionID]
	responseBody := KmlResponse{}
	responseBody.ClientOpened = ok
	responseBody.MessageErrorList = messageErrorList
	responseBody.SuccessList = fileList
	responseMessage, err := json.Marshal(responseBody)
	if err != nil {
		return PoE("MarshalJsonResponse", err)
	} else {
		ctx.w.Write(responseMessage)
	}
	return nil
}

func kmlServiceList(hash string) (*[]string, error) {
	var serviceList []string
	dir, err := os.Stat(KmlDirPath(hash))
	if err != nil {
		return &serviceList, err
	}
	if !dir.IsDir() {
		return &serviceList, KE("HandleKmlIsDir", fmt.Errorf("Downloaded file is not a directory"))
	}
	files, err := os.ReadDir(KmlDirPath(hash))
	if err != nil {
		return &serviceList, KE("HandleKmlReadDir", err)
	}
	for _, file := range files {
		if path.Ext(file.Name()) == ".kml" || path.Ext(file.Name()) == ".kmz" {
			serviceList = append(serviceList, KmlServicePath(hash, file.Name()))
		}
	}
	if len(serviceList) == 0 {
		return &serviceList, KE("HandleKmlServiceList", fmt.Errorf("No kml or kmz files found in directory"))
	}
	return &serviceList, nil
}
