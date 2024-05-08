package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

const timeout = "1000"

type GpkgArgs struct {
	Uid         string      `json:"uid"`
	Title       string      `json:"name"`
	Description string      `json:"description"`
	ServiceInfo ServiceInfo `json:"serviceInfo"`
	GpkgType    string      `json:"gpkgType"`
	Table       string      `json:"table"`
	TileWidth   int         `json:"tileWidth"`
	TileHeight  int         `json:"tileHeight"`
	Rect        Rect        `json:"rect"`
	ZoomDims    []ZoomDim   `json:"zoomDims"`
}

type Rect struct {
	MinX float64 `json:"minX"`
	MinY float64 `json:"minY"`
	MaxX float64 `json:"maxX"`
	MaxY float64 `json:"maxY"`
}

type ZoomDim struct {
	Level  int `json:"level"`
	Width  int `json:"width"`
	Height int `json:"height"`
}

type GpkgLayer struct {
	name        string
	description string
	minX        float64
	minY        float64
	maxX        float64
	maxY        float64
	tileWidth   int
	tileHeight  int
	table       string
	layerType   string
	matrixDims  []ZoomDim
}

type GpkgMessage struct {
	Kind string     `json:"type"`
	Args []GpkgArgs `json:"args"`
	Uuid string     `json:"uuid"`
}

type GpkgError struct {
	step string
	err  error
}

func (ge GpkgError) Unwrap() error {
	return ge.err
}

func (ge GpkgError) Error() string {
	return fmt.Sprintf("%s", fmt.Errorf("GpkgError: %s\nError: %w", ge.step, ge.err))
}

func ge(step string, err error) error {
	return GpkgError{step: step, err: err}
}

func HandleGpkgUrl(ctx ReqContext, args json.RawMessage) error {
	logD(ctx.sessionID, "InHandleGpkgUrl", "HandleGpkgUrlInit")
	return nil
}

func HandleGpkg(ctx ReqContext) error {
	logD(ctx.sessionID, "In HandleGpkg", "HandleGpkgInit")
	client, clientFound := ClientMgr.clients[ctx.sessionID]
	message := []byte(fmt.Sprintf(`{"type": "LOADING_NOTIFIER", "uuid": "%s"}`, ctx.uuid))

	if clientFound {
		err := client.conn.WriteMessage(1, message)
		if err != nil {
			return ge("HandleGpkgWriteClientFound", err)
		}
	} else {
		requestQueue.Enqueue(ctx.sessionID, message)
	}

	//file, filePath, err := handleUpload(ctx, gpkg)
	filename, hash, err := UploadHashMoveDelete(ctx, gpkg)
	if err != nil {
		return ge("HandleGpkgUpload", err)
	}

	gpkgFinalPath := GpkgDbPath(hash, filename)

	// For now, only tiles are supported
	layers, err := GetLayers(gpkgFinalPath, "tiles", ctx.sessionID)
	if err != nil {
		return ge("HandleGpkgRetrieveLayers", err)
	} else if len(layers) == 0 {
		return ge("HandleGpkgRetrieveLayers", errors.New("No layers found in GeoPackage"))
	}

	var serviceInfo ServiceInfo
	serviceInfo.ServiceId = hash + "/" + filename
	serviceInfo.ServiceTitle = filepath.Base(filename)
	serviceInfo.ServiceUrl = "gpkg/" + hash + "/" + filename

	var gpkgArgsArr []GpkgArgs
	for _, layer := range layers {
		var gpkgArgs GpkgArgs
		gpkgArgs.Uid = hash + "|" + layer.table
		gpkgArgs.Title = layer.name
		if len(layer.description) == 0 {
			gpkgArgs.Description = layer.name
		} else {
			gpkgArgs.Description = layer.description
		}
		gpkgArgs.Description = layer.description
		gpkgArgs.ServiceInfo = serviceInfo
		gpkgArgs.GpkgType = "tiles"
		gpkgArgs.Table = layer.table
		gpkgArgs.TileWidth = layer.tileWidth
		gpkgArgs.TileHeight = layer.tileHeight
		var rect Rect
		rect.MinX = layer.minX
		rect.MinY = layer.minY
		rect.MaxX = layer.maxX
		rect.MaxY = layer.maxY
		gpkgArgs.Rect = rect
		gpkgArgs.ZoomDims = layer.matrixDims

		gpkgArgsArr = append(gpkgArgsArr, gpkgArgs)
	}

	var gpkgMessage GpkgMessage
	gpkgMessage.Uuid = hash
	gpkgMessage.Args = gpkgArgsArr
	gpkgMessage.Kind = "GPKG"

	jsonMessage, err := json.Marshal(gpkgMessage)
	if err != nil {
		return ge("HandleGpkgSendMessage", err)
	}

	if clientFound {
		err = client.conn.WriteMessage(1, jsonMessage)
		if err != nil {
			return ge("HandleGpkgWriteMessage", err)
		}
	} else {
		requestQueue.Enqueue(ctx.sessionID, jsonMessage)
	}

	responseBody := ResponseMessage{}
	responseBody.ClientOpened = clientFound
	responseMessage, err := json.Marshal(responseBody)
	if err != nil {
		return ge("HandleGpkgWriteMessage", err)
	} else {
		ctx.w.Write(responseMessage)
	}

	return nil
}

func GetUrlSegments(url string) []string {
	url = strings.TrimPrefix(url, "/")
	url = strings.TrimSuffix(url, "/")
	return strings.Split(url, "/")
}

func HandleGpkgTile(req ReqContext) error {
	segments := GetUrlSegments(req.r.URL.Path)

	/*
			0 - "tilegpkg"
			1 - geopackage hash (hash)
		    2 - geopackage id (filename)
			3 - tablename
			4 - zoom level
			5 - x
			6 - y
	*/
	if len(segments) != 7 {
		req.w.WriteHeader(http.StatusNotFound)
		return nil
	}

	const pathPrefix = GpkgDir + "/"

	// Note path.Join resolves //, /./, and /../ segments in the returned path
	reqPath := path.Join(pathPrefix, segments[1]+"/"+segments[2])

	// Prevent path traversal
	if !strings.HasPrefix(reqPath, pathPrefix) {
		req.w.WriteHeader(http.StatusNotFound)
		return nil
	}

	info, err := os.Stat(reqPath)
	if err != nil || (info != nil && !info.Mode().IsRegular()) {
		if err == nil {
			err = errors.New("Unable to stat file " + reqPath)
		}
		req.w.WriteHeader(http.StatusNotFound)
		return err
	}

	db, err := sql.Open("sqlite3", reqPath+"?_busy_timeout="+timeout)
	if err != nil {
		return err
	}
	defer db.Close()

	var tile []byte

	row := db.QueryRow("select tile_data from "+segments[3]+" where zoom_level=? and tile_column=? and tile_row=? limit 1", segments[4], segments[5], segments[6])
	err = row.Scan(&tile)
	if err != nil {
		return err
	}

	mime := http.DetectContentType(tile)
	req.w.Header().Add("Content-Type", mime)
	_, err = req.w.Write(tile)
	if err != nil {
		return nil
	}

	return nil
}

func GetLayers(gpkg string, layerType string, sessionId string) ([]GpkgLayer, error) {
	db, err := sql.Open("sqlite3", gpkg+"?_busy_timeout="+timeout)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	var layers []GpkgLayer

	// EPSG:4326 being defined with an srs_id of 4326 is part of the gpkg spec
	rows, err := db.Query("select identifier, table_name, ifnull(description, ''), min_x, min_y, max_x, max_y from gpkg_contents where data_type=? and srs_id=4326", layerType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		err := func() error {
			var layer GpkgLayer
			layer.layerType = "tiles"

			if err := rows.Scan(&layer.name, &layer.table, &layer.description, &layer.minX, &layer.minY, &layer.maxX, &layer.maxY); err != nil {
				return err
			}

			var numWidths, numHeights int

			row := db.QueryRow("select count(distinct tile_width), count(distinct tile_height) from gpkg_tile_matrix where table_name = ?", layer.table)
			if err := row.Scan(&numWidths, &numHeights); err != nil {
				return err
			}

			if numWidths != 1 {
				logI(sessionId, fmt.Sprintf("Skipping layer due to inconsistent tile widths: %s", layer.table), "HandleGpkgGetLayersWidthCheck")
				return nil
			}

			if numHeights != 1 {
				logI(sessionId, fmt.Sprintf("Skipping layer due to inconsistent tile heights: %s", layer.table), "HandleGpkgGetLayersWidthCheck")
				return nil
			}

			var minZoom, maxZoom int

			row = db.QueryRow("select tile_width, tile_height, min(zoom_level), max(zoom_level) from gpkg_tile_matrix where table_name = ? limit 1", layer.table)
			if err := row.Scan(&layer.tileWidth, &layer.tileHeight, &minZoom, &maxZoom); err != nil {
				logE(sessionId, err, "HandleGpkgGetLayersReadTileZoomMetadata")
				return nil
			}

			layer.matrixDims = make([]ZoomDim, (maxZoom-minZoom)+1)
			i := -1
			for zoom := minZoom; zoom <= maxZoom; zoom++ {
				i++
				dimensionRows := db.QueryRow("select matrix_width, matrix_height from gpkg_tile_matrix where table_name=? and zoom_level=? limit 1", layer.table, zoom)
				var zoomDim ZoomDim
				zoomDim.Level = zoom
				err = dimensionRows.Scan(&zoomDim.Width, &zoomDim.Height)
				if err != nil {
					return err
				}
				layer.matrixDims[i] = zoomDim
			}

			layers = append(layers, layer)
			return nil
		}()
		if err != nil {
			return nil, err
		}
	}

	return layers, nil
}
