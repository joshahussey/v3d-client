package main

import (
	"archive/zip"
	"bytes"
	"crypto/sha256"
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/google/uuid"
)

type ServiceType int

const (
	shp ServiceType = iota
	kml
	gpkg
)

func (st ServiceType) UploadDir(session string) string {
	return "/cslt/uploads/" + session + "/" + st.DirString()
}

func (st ServiceType) String() string {
	return [...]string{".shp", ".kml", ".gpkg"}[st]
}

func (st ServiceType) DirString() string {
	return [...]string{"shape", "kml", "gpkg"}[st]
}

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

func DownloadHashMoveDelete(ctx ReqContext, url string, serviceType ServiceType) (string, string, error) {
	resp, err := http.Get(url)
	if err != nil {
		return "", "", UPE("Get", err)
	}
	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", "", UPE("ReadAll", err)
	}
	hasher := sha256.New()
	_, err = hasher.Write(respBytes)
	if err != nil {
		return "", "", UPE("Hasher", err)
	}
	hash := fmt.Sprintf("%x", hasher.Sum(nil))
	filename, err := DownloadedFileName(resp)
	if err != nil {
		return "", "", UPE("DownloadedFileName", err)
	}
	_, err = os.Stat(DownloadDirPath(hash, serviceType))
	if err != nil {
		if os.IsNotExist(err) {
			err := os.MkdirAll(DownloadDirPath(hash, serviceType), 0777)
			if err != nil {
				return "", "", UPE("MkdirAll", err)
			}
			if http.DetectContentType(respBytes) == "application/zip" {
				reader := bytes.NewReader(respBytes)
				zipReader, err := zip.NewReader(reader, int64(len(respBytes)))
				if err != nil {
					return "", "", UPE("NewReader", err)
				}
				err = unzipFromMemory(zipReader, DownloadDirPath(hash, serviceType))
				if err != nil {
					return "", "", UPE("unzipFromMemory", err)
				}
			} else {
				download, err := os.Create(DownloadDirPath(hash, serviceType) + "/" + filename)
				if err != nil {
					return "", "", UPE("Create", err)
				}
				_, err = download.Write(respBytes)
				if err != nil {
					return "", "", UPE("Write", err)
				}
			}
		}
	} else {
		logI(ctx.sessionID, DownloadDirPath(hash, serviceType)+" Exists, not redownloading.", "UploadHashMoveDelete")
	}
	return filename, hash, nil

}

func UploadHashMoveDelete(ctx ReqContext, serviceType ServiceType) (string, string, error) {
	err := ctx.r.ParseMultipartForm(32 << 20)
	if err != nil {
		return "", "", UPE("ParseMultipartForm", err)
	}
	file, handler, err := ctx.r.FormFile("file")
	if err != nil {
		return "", "", UPE("FormFile", err)
	}
	defer file.Close()
	if handler.Size > 1000000000 {
		return "", "", UPE("FileSize", fmt.Errorf("File size too large: %d", handler.Size))
	}
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return "", "", UPE("ReadAll", err)
	}
	hasher := sha256.New()
	_, err = hasher.Write(fileBytes)
	if err != nil {
		return "", "", UPE("Hasher", err)
	}
	hash := fmt.Sprintf("%x", hasher.Sum(nil))
	_, err = os.Stat(DownloadDirPath(hash, serviceType))
	if err != nil {
		if os.IsNotExist(err) {
			err := os.MkdirAll(DownloadDirPath(hash, serviceType), 0777)
			if err != nil {
				return "", "", UPE("MkdirAll", err)
			}
			if path.Ext(handler.Filename) == ".zip" {
				zipReader, err := zip.NewReader(file, handler.Size)
				if err != nil {
					return "", "", UPE("NewReader", err)
				}
				err = unzipFromMemory(zipReader, DownloadDirPath(hash, serviceType))
				if err != nil {
					return "", "", UPE("unzipFromMemory", err)
				}
			} else {
				download, err := os.Create(DownloadDirPath(hash, serviceType) + "/" + handler.Filename)
				if err != nil {
					return "", "", UPE("Create", err)
				}
				_, err = download.Write(fileBytes)
				if err != nil {
					return "", "", UPE("Write", err)
				}
			}
		}
	} else {
		logI(ctx.sessionID, DownloadDirPath(hash, serviceType)+" Exists, not redownloading.", "UploadHashMoveDelete")
	}
	return handler.Filename, hash, nil
}

func unzipFromMemory(zipReader *zip.Reader, downloadDir string) error {
	for _, file := range zipReader.File {
		outFileName := strings.ReplaceAll(file.Name, "/", "_")
		downloadFilePath := downloadDir + "/" + outFileName
		fileReader, err := file.Open()
		if err != nil {
			return UZE("OpenFileError", err)
		}
		newFile, err := os.Create(downloadFilePath)
		if err != nil {
			return UZE("CreateFileError", err)
		}
		_, err = io.Copy(newFile, fileReader)
		if err != nil {
			return UZE("CopyFileError", err)
		}
		newFile.Close()
		fileReader.Close()
	}
	return nil
}

func DownloadedFileName(resp *http.Response) (string, error) {
	if cd := resp.Header.Get("Content-Disposition"); cd != "" {
		if _, params, err := mime.ParseMediaType(cd); err == nil {
			return params["filename"], nil
		} else {
			return "", err
		}
	}
	logI("LOCAL", "No Content-Disposition header found. Using random UUID as Filename", "DownloadedFileName")
	return uuid.New().String(), nil
}
