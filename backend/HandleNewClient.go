package main

import (
	"fmt"
)
type NewClientError struct {
	step string
	err  error
}

func (nce NewClientError) Unwrap() error {
	return nce.err
}

func (nce NewClientError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("NewClientError: %s\nError: %w", nce.step, nce.err))
}

func NCE(step string, err error) error {
	return NewClientError{step: step, err: err}
}

func HandleNewClient(ctx ReqContext) error {
	if _, upgrade := ctx.r.Header["Upgrade"]; !upgrade {
		return NCE("Header", fmt.Errorf("Upgrade header not found"))
	}
	conn, err := upgrader.Upgrade(ctx.w, ctx.r, nil)
	if err != nil {
		return NCE("Upgrade", err)
	}
	client := Client{
		conn:      conn,
		sessionID: ctx.sessionID,
	}
	ClientMgr.AddClient(ctx.sessionID, client)
	logI(ctx.sessionID, ctx.r.RemoteAddr+": Connected Client", "AddClient")
	go client.Listen()
	return nil
}
