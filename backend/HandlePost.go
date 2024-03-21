package main

import (
	"fmt"
	"io"
	"net/http"
)

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
	body, err := io.ReadAll(ctx.r.Body)
	if err != nil {
		return PoE("ReadAll", err)
	}
	if !ok {
		requestQueue.Enqueue(ctx.sessionID, body)
	} else {
		err = client.conn.WriteMessage(1, body)
		if err != nil {
			return PoE("WriteMessage", err)
		}
	}
	ctx.w.WriteHeader(http.StatusOK)
	return nil
}
