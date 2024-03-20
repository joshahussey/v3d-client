package main

import (
	"fmt"
	"net/http"
)

type HeadError struct {
	step string
	err  error
}

func (he HeadError) Unwrap() error {
	return he.err
}

func (he HeadError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("HeadError: %s\nError: %w", he.step, he.err))
}

func HE(step string, err error) error {
	return HeadError{step: step, err: err}
}

// Handle Head request on /add
func HandleHead(ctx ReqContext) error {
	ctx.w.Header().Set("Access-Control-Allow-Origin", "*")
	ctx.w.Header().Set("Access-Control-Allow-Methods", "POST, PATCH, WS, WSS")
	ctx.w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
    ctx.w.WriteHeader(http.StatusOK)
    return nil
}

