package main

import "fmt"

type WebSocketError struct {
	step string
	err  error
}

func (ws WebSocketError) Unwrap() error {
	return ws.err
}

func (ws WebSocketError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("WebSocketError: %s\nError: %w", ws.step, ws.err))
}

func WS(step string, err error) error {
	return WebSocketError{step: step, err: err}
}

func HandleAddWs(ctx ReqContext) error {
	conn, err := upgrader.Upgrade(ctx.w, ctx.r, nil)
	if err != nil {
		return WS("Upgrade", err)
	}
	defer conn.Close()
	_, p, err := conn.ReadMessage()
	if err != nil {
		return WS("ReadMessage", err)
	}
	client, clientFound := ClientMgr.GetClient(ctx.sessionID)
	if !clientFound {
		requestQueue.Enqueue(ctx.sessionID, p)
	} else {
		err = client.conn.WriteMessage(1, p)
		if err != nil {
			return WS("WriteMessage", err)
		}
	}
	return nil
}
