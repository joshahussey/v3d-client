package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type PostBody struct {
	Kind string          `json:"type"`
	Uuid string          `json:"uuid"`
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
	client, ok := ClientMgr.clients[ctx.sessionID]
	message := []byte(fmt.Sprintf(`{"type": "LOADING_NOTIFIER", "uuid": "%s"}`, ctx.uuid))
	if ok {
		client.conn.WriteMessage(1, message)
	} else {
		requestQueue.Enqueue(ctx.sessionID, message)
	}
	body, err := io.ReadAll(ctx.r.Body)
	if err != nil {
		return PoE("ReadAll", err)
	}
	var jsonBody PostBody
	jsonBody.Uuid = ctx.uuid
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
	case "gpkg":
		err = HandleGpkgUrl(ctx, jsonBody.Args)
		if err != nil {
			return PoE("HandleGpkgUrl", err)
		}
		return nil
	default:
		msg, err := json.Marshal(jsonBody)
		if err != nil {
			return PoE("Marshal", err)
		}
		if !ok {
			requestQueue.Enqueue(ctx.sessionID, msg)
		} else {
			err = client.conn.WriteMessage(1, msg)
			if err != nil {
				return PoE("WriteMessage", err)
			}
		}
		ctx.w.WriteHeader(http.StatusOK)
		return nil
	}
}
