package main

import "fmt"

type PutError struct {
	step string
	err  error
}

func (pe PutError) Unwrap() error {
	return pe.err
}

func (pe PutError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("PutError: %s\nError: %w", pe.step, pe.err))
}

func PuE(step string, err error) error {
	return PutError{step: step, err: err}
}
// Handle Put request
func HandlePut(ctx ReqContext) error {
    return PuE("HandlePut", fmt.Errorf("Not Implemented"))
}
