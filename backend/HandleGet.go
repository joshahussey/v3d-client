package main

import "fmt"
 
type GetError struct {
	step string
	err  error
}

func (ge GetError) Unwrap() error {
	return ge.err
}

func (ge GetError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("GetError: %s\nError: %w", ge.step, ge.err))
}

func GE(step string, err error) error {
	return GetError{step: step, err: err}
}

func HandleGet(ctx ReqContext) error {
    return GE("HandleGet", fmt.Errorf("Not Implemented"))
}

