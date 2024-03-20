package main

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path"
	"strings"
)

type ServiceType int

const (
	shp ServiceType = iota
	kml
	gpkg
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


func (st ServiceType) String() string {
	return [...]string{".shp", ".kml", ".gpkg"}[st]
}

func handleUpload(ctx ReqContext, serviceType ServiceType) (*os.File, *string, error) {
	//Parse File From Request
	err := ctx.r.ParseMultipartForm(32 << 20)
	if err != nil {
		return nil, nil, UPE("ParseMultipartFormError", err)
	}

	uploadedFile, upload, err := ctx.r.FormFile("file")
	if err != nil {
		return nil, nil, UPE("FormFileError", err)
	}

	var fileDir string
	switch serviceType {
	case shp:
		fileDir = "/cslt/uploads/" + ctx.sessionID + "/shapefiles/" + upload.Filename
	case kml:
		fileDir = "/cslt/uploads/" + ctx.sessionID + "/kml/" + upload.Filename
	case gpkg:
		fileDir = "/cslt/uploads/" + ctx.sessionID + "/gpkg/" + upload.Filename
	default:
		return nil, nil, UPE("ServiceTypeError", fmt.Errorf("Invalid Service Type: %s", serviceType))
	}
	logI(ctx.sessionID, fmt.Sprintf("Uploaded File: %+v\nFile Size: %+v\nMIME Header: %+v\n", upload.Filename, upload.Size, upload.Header), "HandleShapeFormFile")
    var filePath = fileDir + "/" + upload.Filename

	bytes, err := io.ReadAll(uploadedFile)
	if err != nil {
		return nil, nil, UPE("ReadError", err)
	}

	//Write Zip File
	err = os.MkdirAll(path.Dir(filePath), 0777)
	if err != nil {
		return nil, nil, UPE("MkdirError", err)
	}

	zipFile, err := os.Create(filePath)
	if err != nil {
		return nil, nil, UPE("CreateError", err)
	}

	bytesWritten, error := zipFile.Write(bytes)
	if error != nil {
		return nil, nil, UPE("WriteError", error)
	}

	logI(ctx.sessionID, fmt.Sprintf("Wrote %d bytes to %s\n", bytesWritten, zipFile.Name()), "HandleShapeWriteFile")
	return zipFile, &filePath, nil
}

func unzipUpload(zipFilePath string, serviceType ServiceType) (*[]string, error) {
	//Open zip file
	zipDirPath := path.Dir(zipFilePath)
    logI("Unzipping file: ", zipFilePath, "unzipUpload")
	zipContentsDirPath := zipDirPath + "/contents"
	err := os.MkdirAll(zipContentsDirPath, 0777)
	if err != nil {
		return nil, UZE("MkdirError", err)
	}
	zipReader, err := zip.OpenReader(zipFilePath)
	if err != nil {
		return nil, UZE("OpenReaderError", err)
	}
	defer zipReader.Close()

	//Unzip files
	var files []string
	for _, file := range zipReader.File {
        outFileName := strings.ReplaceAll(file.Name, "/", "_")
		filePath := zipContentsDirPath + "/" + outFileName
		fileReader, err := file.Open()
		if err != nil {
			return nil, UZE("OpenFileError", err)
		}
		newFile, err := os.Create(filePath)
		if err != nil {
			return nil, UZE("CreateFileError", err)
		}
		_, err = io.Copy(newFile, fileReader)
		if err != nil {
			return nil, UZE("CopyFileError", err)
		}
		newFile.Close()
		fileReader.Close()
		if serviceType.String() == path.Ext(filePath) {
			files = append(files, filePath)
		}
	}
	return &files, nil
}
