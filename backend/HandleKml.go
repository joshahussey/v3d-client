package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

type KmlUrlMessage struct {
	Kind string  `json:"type"`
	Args KmlArgs `json:"args"`
}

type KmlArgs struct {
	Uid         string      `json:"uid"`
	Url         string      `json:"url"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	ServiceInfo ServiceInfo `json:"serviceInfo"`
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
	return WebSocketError{step: step, err: err}
}

func HandleKml(ctx ReqContext) error {
	client := ClientMgr.clients[ctx.sessionID]
	var layerList []string
	errorList := []string{}

	//Parse the form
	err := ctx.r.ParseMultipartForm(32 << 20)
	if err != nil {
		return KE("ParseMultipartForm", err)
	}

	//Get File From Form
	file, handler, err := ctx.r.FormFile("file")
	if err != nil {
		return KE("FormFile", err)
	}
	defer file.Close()
	logI(ctx.sessionID, fmt.Sprintf("Uploaded File: %+v\nFile Size: %+v\nMIME Header: %+v\n", handler.Filename, handler.Size, handler.Header), "HandleShapeFormFile")

	//Make Directory To Store KMLs If Needed
	path := "/cslt/web/services/kml/"
	err = os.MkdirAll(path, 0777)
	if err != nil {
        return KE("MkdirAll", err)
	}

	//Read Bytes From Form File
	inputFileBytes, err := io.ReadAll(file)
	if err != nil {
		return KE("ReadAll", err)
	}

	//Get Input File Hash
	inputHasher := sha256.New()
	_, err = inputHasher.Write(inputFileBytes)
	if err != nil {
		return KE("Write", err)
	}
	inputFileHash := fmt.Sprintf("%x", inputHasher.Sum(nil))

	// Check Inilf File With Name Exists
	kmlServicePath := "/cslt/web/services/kml/" + handler.Filename
	_, err = os.Stat(kmlServicePath)
	if err == nil {
		//Get Existing File Hash
		existingFileBytes, err := os.ReadFile(kmlServicePath)
		if err != nil {
			return KE("ReadFile", err)
		}
		existingFileHasher := sha256.New()
		_, err = existingFileHasher.Write(existingFileBytes)
		if err != nil {
			return KE("Write", err)
		}
		existingHash := fmt.Sprintf("%x", existingFileHasher.Sum(nil))

		if inputFileHash == existingHash {
			logI(ctx.sessionID, fmt.Sprintf("File with hash %s already exists. Sending preprocessed services...\n", inputFileHash), "HandleShapeFileExists")
			sendKmlMessage(handler.Filename, existingHash, &client, &errorList)
			sendKmlResponse(ctx, errorList, layerList)
			return nil
		}
	} else if !os.IsNotExist(err) {
		return KE("Stat", err)
	}

	//Create The Cache File
	kmlPath := path + handler.Filename
	cacheFile, err := os.Create(kmlPath)
	if err != nil {
		return KE("Create", err)
	}
	defer cacheFile.Close()

	//Write The Form File Bytes To The Cache File
	bytesWritten, err := cacheFile.Write(inputFileBytes)
	if err != nil {
		return KE("Write", err)
	}
	logI(ctx.sessionID, fmt.Sprintf("Wrote %d bytes to %s\n", bytesWritten, cacheFile.Name()), "HandleKmlWriteFile")

	pathComponents := strings.Split(cacheFile.Name(), "/")
	fileName := pathComponents[len(pathComponents)-1]
	err = addService(inputFileHash)
	if err != nil {
		logE(ctx.sessionID, err, "addServiceKml")
	}
	sendKmlMessage(fileName, inputFileHash, &client, &errorList)
	layerList = append(layerList, fileName)
	sendKmlResponse(ctx, errorList, layerList)
    return nil
}

func sendKmlMessage(fileName string, serviceUid string, client *Client, errorList *[]string) {
	message := KmlUrlMessage{}
	message.Kind = "KML"
	message.Args.Uid = serviceUid
	message.Args.Url = "./services/kml/" + fileName
	message.Args.Title = fileName
	message.Args.Description = fmt.Sprintf("Contents of %s", fileName)
	message.Args.ServiceInfo.ServiceTitle = fileName
	message.Args.ServiceInfo.ServiceId = serviceUid
	message.Args.ServiceInfo.ServiceUrl = "UploadedFile"
	jsonMessage, err := json.Marshal(message)
	logI(client.sessionID, fmt.Sprintf("Sending message: %s\n", string(jsonMessage[:])), "sendMessage")
	if err != nil {
		logE(client.sessionID, err, "sendKmlMessageMarshal")
		*errorList = append(*errorList, fileName)
		return
	}

	err = client.conn.WriteMessage(1, jsonMessage)
	if err != nil {
		logE(client.sessionID, err, "sendKmlMessageWriteMessage")
		*errorList = append(*errorList, fileName)
		return
	}
}

func sendKmlResponse(ctx ReqContext, messageErrorList []string, fileList []string) {
	if len(messageErrorList) > 0 && len(fileList) > 0 {
		logE(ctx.sessionID, fmt.Errorf("Error sending messages for the following files: \n\t%s\n", strings.Join(messageErrorList, "\n\t")), "HandleShapeMakeSymLink")
		_, err := ctx.w.Write([]byte(fmt.Sprintf("Successfully created the following files:\n\t%s\nError sending messages for the following files: \n\t%s\n", strings.Join(fileList, "\n\t"), strings.Join(messageErrorList, "\n\t"))))
		if err != nil {
			logE(ctx.sessionID, err, "sendKmlResponseWriteError")
			http.Error(ctx.w, "Error writing error message\n", http.StatusBadRequest)
		}
		return
	}
	if len(messageErrorList) > 0 && len(fileList) == 0 {
		logE(ctx.sessionID, fmt.Errorf("Error sending messages for the following files: \n\t%s\n", strings.Join(messageErrorList, "\n\t")), "HandleShapeMakeSymLink")
		_, err := ctx.w.Write([]byte(fmt.Sprintf("No Files Could be added to the map. Error sending messages for the following files: \n\t%s\n", strings.Join(messageErrorList, "\n\t"))))
		if err != nil {
			logE(ctx.sessionID, err, "sendKmlResponseWriteError")
			http.Error(ctx.w, "Error writing error message\n", http.StatusBadRequest)
		}
		return
	}
	logI(ctx.sessionID, fmt.Sprintf("Successfully sent the following files to the map:\n\t%s\n", strings.Join(fileList, "\n\t")), "HandleShapeMakeSymLink")
	_, err := ctx.w.Write([]byte(fmt.Sprintf("Successfully sent the following files to the map:\n\t%s\n", strings.Join(fileList, "\n\t"))))
	if err != nil {
		logE(ctx.sessionID, err, "sendKmlResponseWriteError")
		http.Error(ctx.w, "Error writing error message\n", http.StatusBadRequest)
	}
}
