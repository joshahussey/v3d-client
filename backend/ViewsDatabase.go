package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"

	_ "github.com/mattn/go-sqlite3"
)

type ViewRecord struct {
	Id          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type View struct {
	Title string `json:"title"`
	Description string `json:"description"`
	State string `json:"mapState"`
}

const viewDbPathPrefix = "/cslt/db/views/"

func getViewsDb(sessionId string) (string, error) {
	dbDir := viewDbPathPrefix + sessionId
	dbFile := dbDir + "/view.sqlite"
	dbFileWithOptions := dbFile + "?_busy_timeout=1000"

	fileInfo, err := os.Stat(dbFile)
	if err == nil {
		if !fileInfo.Mode().IsRegular() {
			return "", fmt.Errorf("Non-regular file found at %s when looking for views database.", dbFile)
		} else {
			return dbFile, nil
		}
	}

	if !errors.Is(err, os.ErrNotExist) {
		return "", err
	}

	logD(sessionId, fmt.Sprintf("Creating views db dir %s", dbDir), "createViewsDbDir")
	err = os.MkdirAll(dbDir, 0644)
	if err != nil {
		return "", err
	}

	logD(sessionId, fmt.Sprintf("Creating views db %s", dbFile), "createViewsDb")
	_, err = os.Create(dbFile)
	if err != nil {
		return "", err
	}

	db, err := sql.Open("sqlite3", dbFileWithOptions)
	if err != nil {
		return "", err
	}
	defer db.Close()

	_, err = db.Exec("create table views (id integer primary key, name text, description text, creation_date timestamp default current_timestamp, content text)")
	if err != nil {
		return "", err
	}

	return dbFile, nil
}

const contentTypeHeaderKey = "Content-Type"
const acceptHeaderKey = "Accept"
const appJsonMimeType = "application/json"
const sqliteMimeType = "application/x-sqlite3"

func HandleGetViews(ctx ReqContext) error {
	dbFile, err := getViewsDb(ctx.sessionID)
	if err != nil {
		return err
	}

	contentType := ctx.r.Header.Get(acceptHeaderKey)
	switch contentType {
	case "":
		fallthrough // Default to JSON
	case appJsonMimeType:
		logD(ctx.sessionID, "Handling JSON get views request.", "HandleGetViewsJson")
		db, err := sql.Open("sqlite3", dbFile+"?_busy_timeout=1000")
		if err != nil {
			return err
		}
		defer db.Close()

		rows, err := db.Query("select id, name, description from views;")
		if err != nil {
			return err
		}

		var views []ViewRecord

		for rows.Next() {
			var view ViewRecord
			err = rows.Scan(&view.Id, &view.Title, &view.Description)
			if err != nil {
				logE(ctx.sessionID, err, "viewsDbScanViews")
				continue
			}

			views = append(views, view)
		}
		logD(ctx.sessionID, fmt.Sprintf("Returning %d views", len(views)), "HandleGetViewsJsonResults")

		viewsJson, err := json.Marshal(views)
		if err != nil {
			return err
		}

		ctx.w.Header().Set(contentTypeHeaderKey, appJsonMimeType)
		_, err = ctx.w.Write(viewsJson)
		if err != nil {
			return err
		}
	case sqliteMimeType:
		logD(ctx.sessionID, "Handling SQLite get views request.", "HandleGetViewsSqlite")

		reader, err := os.Open(dbFile)
		if err != nil {
			return err
		}
		defer reader.Close()

		ctx.w.Header().Set(contentTypeHeaderKey, sqliteMimeType)
		_, err = io.Copy(ctx.w, reader)
		if err != nil {
			return err
		}
	default:
		return errors.New("Request contained unsupported content type: " + contentType)
	}
	return nil
}

func HandleGetView(ctx ReqContext) error {
	segments := GetUrlSegments(ctx.r.URL.Path)
	if len(segments) != 2 {
		ctx.w.WriteHeader(http.StatusNotFound)
		return nil
	}

	logD(ctx.sessionID, "Handling get view request for view " + segments[1], "HandleGetViewStart")

	viewId, err := strconv.Atoi(segments[1])
	if err != nil {
		return err
	}

	dbFile, err := getViewsDb(ctx.sessionID)
	if err != nil {
		return err
	}

	db, err := sql.Open("sqlite3", dbFile + "?_busy_timeout=1000")
	if err != nil {
		return err
	}
	defer db.Close()

	row := db.QueryRow("select content from views where id=?", viewId)
	var view string
	err = row.Scan(&view)
	if err != nil {
		return err
	} else if view == "" {
		ctx.w.WriteHeader(http.StatusNotFound)
	}
	logD(ctx.sessionID, "Retrieved view content", "HandleGetViewFinish")

	ctx.w.Header().Set(contentTypeHeaderKey, appJsonMimeType)
	_, err = ctx.w.Write([]byte(view))
	if err != nil {
		return err
	}

	return nil
}

func HandlePostView(ctx ReqContext) error {
	var view View
	err := json.NewDecoder(ctx.r.Body).Decode(&view)
	if err != nil {
		return err
	}

	logD(ctx.sessionID, "Processing view post request.", "HandlePostViewStart")

	dbFile, err := getViewsDb(ctx.sessionID)
	if err != nil {
		return err
	}

	db, err := sql.Open("sqlite3", dbFile + "?_busy_timeout=1000")
	if err != nil {
		return err
	}
	defer db.Close()

	_, err = db.Exec("insert into views (name, description, content) values (?, ?, ?)", view.Title, view.Description, view.State)
	if err != nil {
		return err
	}

	logD(ctx.sessionID, "Successfully added view.", "HandlePostViewEnd")

	ctx.w.WriteHeader(http.StatusNoContent)

	return nil
}

func HandleDeleteView(ctx ReqContext) error {
	logD(ctx.sessionID, "Processing view delete request.", "HandleDeleteViewStart")
	segments := GetUrlSegments(ctx.r.URL.Path)

	if len(segments) != 2 {
		ctx.w.WriteHeader(http.StatusNotFound)
		return nil
	}

	logD(ctx.sessionID, "View requested for deletion has ID: " + segments[1], "HandleDeleteViewId")

	viewId, err := strconv.Atoi(segments[1])
	if err != nil {
		return err
	}

	dbFile, err := getViewsDb(ctx.sessionID)
	if err != nil {
		return err
	}

	db, err := sql.Open("sqlite3", dbFile + "?_busy_timeout=1000")
	if err != nil {
		return err
	}
	defer db.Close()

	_, err = db.Exec("delete from views where id=?", viewId)
	if err != nil {
		return err
	}

	ctx.w.WriteHeader(http.StatusNoContent)

	logD(ctx.sessionID, fmt.Sprintf("Deleted view %d successfully", viewId), "HandleDeleteViewDone")

	return nil
}

func HandlePutView(ctx ReqContext) error {
	logD(ctx.sessionID, "Processing view put request.", "HandlePutViewStart")

	var view View
	err := json.NewDecoder(ctx.r.Body).Decode(&view)
	if err != nil {
		return err
	}

	segments := GetUrlSegments(ctx.r.URL.Path)

	if len(segments) != 2 {
		ctx.w.WriteHeader(http.StatusNotFound)
		return nil
	}

	logD(ctx.sessionID, "View requested for update has ID: " + segments[1], "HandlePutViewId")

	viewId, err := strconv.Atoi(segments[1])
	if err != nil {
		return err
	}

	dbFile, err := getViewsDb(ctx.sessionID)
	if err != nil {
		return err
	}

	db, err := sql.Open("sqlite3", dbFile + "?_busy_timeout=1000")
	if err != nil {
		return err
	}
	defer db.Close()

	_, err = db.Exec("update views set name=?, description=?, content=? where id=?", view.Title, view.Description, view.State, viewId)
	if err != nil {
		return err
	}

	ctx.w.WriteHeader(http.StatusNoContent)

	logD(ctx.sessionID, fmt.Sprintf("Updated view %d successfully", viewId), "HandlePutViewDone")

	return nil
}
