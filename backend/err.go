package main

import (
	"errors"
	"fmt"
	"net/http"
)

func e(ctx ReqContext, err error) {
	var uploadError UploadError
	var unzipError UnzipError
	var webSocketError WebSocketError
	var shapeError ShapeError
	var kmlError KmlError
	if err != nil {
		if errors.Is(err, webSocketError) {
			logE(ctx.sessionID, err, "HandleAddWs")
			http.Error(ctx.w, err.Error(), http.StatusBadRequest)
			return
		}
		if errors.Is(err, kmlError) {
			logE(ctx.sessionID, err, "HandleKml")
			http.Error(ctx.w, err.Error(), http.StatusBadRequest)
			return
		}
		if errors.Is(err, shapeError) {
			if errors.Is(err, uploadError) {
				logE(ctx.sessionID, err, "HandleShapeMakeSymLink")
				http.Error(ctx.w, err.Error(), http.StatusBadRequest)
				return
			}
			if errors.Is(err, unzipError) {
				logE(ctx.sessionID, err, "HandleShapeMakeSymLink")
				http.Error(ctx.w, err.Error(), http.StatusBadRequest)
				return
			}
		}
		logE(ctx.sessionID, err, "HandleShapeMakeSymLink")
		ctx.w.Header().Set("Access-Control-Allow-Origin", "*")
		status := http.StatusBadRequest
		ctx.w.WriteHeader(status)
		_, respErr := ctx.w.Write([]byte(err.Error()))
		if respErr != nil {
			logE(ctx.sessionID, respErr, "HandleShapeMakeSymLink")
		}
		client := ClientMgr.clients[ctx.sessionID]
		message := []byte(fmt.Sprintf(`{"type": "LOADING_FAILED_NOTIFIER", "uuid": "%s"}`, ctx.uuid))
		err := client.conn.WriteMessage(1, message)
		if err != nil {
			logE(ctx.sessionID, err, "e")
		}
		return
	}
}
