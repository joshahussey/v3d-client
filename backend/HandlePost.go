package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type PostBody struct {
   Kind string `json:"type"`
   Args json.RawMessage `json:"args"`
}

type PostError struct {
	step string
	err  error
}

func (pe PostError) Unwrap() error {
	return pe.err
}

func (pe PostError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("PostError: %s\nError: %w", pe.step, pe.err))
}

func PoE(step string, err error) error {
	return PostError{step: step, err: err}
}

// Handle Post request
func HandlePost(ctx ReqContext) error {
	client := ClientMgr.clients[ctx.sessionID]
	body, err := io.ReadAll(ctx.r.Body)
	if err != nil {
		return PoE("ReadAll", err)
	}
    var jsonBody PostBody
    err = json.Unmarshal(body, &jsonBody)
    if err != nil {
        return PoE("Unmarshal", err)
    }
    switch jsonBody.Kind {
    case "shape":
        err = HandleShapeUrl(ctx, jsonBody.Args)
        if err != nil {
            return PoE("HandleShapeUrl", err)
        }
        return nil
    case "kml":
        logI(ctx.sessionID, "FOUND THE KML!", "KML")
        ctx.w.WriteHeader(http.StatusOK)
        return nil
    default:
        msg, err := json.Marshal(jsonBody)
        if err != nil {
            return PoE("Marshal", err)
        }
        err = client.conn.WriteMessage(1, msg)
        if err != nil {
            return PoE("WriteMessage", err)
        }
        ctx.w.WriteHeader(http.StatusOK)
        return nil
    }
}

