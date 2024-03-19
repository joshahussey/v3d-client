package main

import "fmt"

type DeleteError struct {
	step string
	err  error
}

func (de DeleteError) Unwrap() error {
	return de.err
}

func (de DeleteError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("DeleteError: %s\nError: %w", de.step, de.err))
}

func DE(step string, err error) error {
	return DeleteError{step: step, err: err}
}
// Handle Delete request on /add
func HandleDelete(ctx ReqContext) error {
    return DE("HandleDelete", fmt.Errorf("Not Implemented"))
}

