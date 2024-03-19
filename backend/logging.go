package main

import "log"

func logE(sessionID string, err error, step string) {
	log.Printf("[ERROR] SessionID: %s: Step: %s\n\t %s", sessionID, step, err)
}

func logI(sessionID string, message string, step string) {
	log.Printf("[INFO] SessionID: %s: Step: %s\n\t %s", sessionID, step, message)
}

func logD(sessionID string, message string, step string) {
	log.Printf("[DEBUG] SessionID: %s: Step: %s\n\t %s", sessionID, step, message)
}
