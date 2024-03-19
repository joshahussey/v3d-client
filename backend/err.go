package main

import (
	"errors"
	"fmt"
	"net/http"
)

type UploadError struct {
	step string
	err  error
}

func (ue UploadError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("UploadError: %s\nError: %w", ue.step, ue.err))
}

func (ue UploadError) Unwrap() error {
	return ue.err
}

type UnzipError struct {
	step string
	err  error
}

func (ue UnzipError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("UnzipError: %s\nError: %w", ue.step, ue.err))
}

func (ue UnzipError) Unwrap() error {
	return ue.err
}

func UPE(step string, err error) error {
	return UploadError{step: step, err: err}
}

func UZE(step string, err error) error {
	return UnzipError{step: step, err: err}
}

func e(ctx ReqContext, err error) {
	var uploadError UploadError
	var unzipError UnzipError
	if err != nil {
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
        logE(ctx.sessionID, err, "HandleShapeMakeSymLink")
        http.Error(ctx.w, err.Error(), http.StatusBadRequest)
	}
}
