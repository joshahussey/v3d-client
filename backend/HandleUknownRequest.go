package main

import "fmt"

type UnknownRequestError struct {
	step string
	err  error
}

func (ue UnknownRequestError) Unwrap() error {
	return ue.err
}

func (ue UnknownRequestError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("UnknownRequestError: %s\nError: %w", ue.step, ue.err))
}

func UnE(step string, err error) error {
	return UnknownRequestError{step: step, err: err}
}
// Handle Unknown request on /add
func HandleUnknownRequest(ctx ReqContext) error {
    return UnE("HandleUnknownRequest", fmt.Errorf("Not Implemented"))
}

