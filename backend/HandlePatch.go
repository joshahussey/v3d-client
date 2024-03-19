package main

import (
	"fmt"
	"io"
	"net/http"
)
type PatchError struct {
	step string
	err  error
}

func (pe PatchError) Unwrap() error {
	return pe.err
}

func (pe PatchError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("PatchError: %s\nError: %w", pe.step, pe.err))
}

func PaE(step string, err error) error {
	return PatchError{step: step, err: err}
}
func HandlePatch(ctx ReqContext) error {
	client := ClientMgr.clients[ctx.sessionID]
	body, err := io.ReadAll(ctx.r.Body)
	if err != nil {
		return PaE("ReadAll", err)
	}
	err = client.conn.WriteMessage(1, body)
	if err != nil {
		return PaE("WriteMessage", err)
	}
	ctx.w.WriteHeader(http.StatusOK)
    return nil
}

