package main

import (
	"fmt"
	"io"
	"os"
)

const DownloadsDir = "/cslt/downloads"
const ProcessedDir = "/cslt/processed"
const ProcessedGeoJsonDir = ProcessedDir + "/geojson"
const ShapeDownloadsDir = DownloadsDir + "/shape"
const ExposedServiceDir = "/cslt/web/services"
const ServiceDir = "/cslt/services"
const OgcFeaturesDir = ServiceDir + "/ogcfeatures"
const GpkgDir = ServiceDir + "/gpkg"
const KmlDir = ExposedServiceDir + "/kml"

func DownloadDirPath(hash string, serviceType ServiceType) string {
	return DownloadsDir + "/" + serviceType.String() + "/" + hash
}

func DownloadedFilePath(hash string, serviceType ServiceType, fileName string) string {
	return DownloadDirPath(hash, serviceType) + "/" + fileName
}

func GpkgDbPath(hash string, filename string) string {
    return DownloadedFilePath(hash, gpkg, filename)
}

func OgcFeaturesDirPath(hash string) string {
	return OgcFeaturesDir + "/" + hash
}

func OgcFeaturesDbPath(hash string, filename(string)) string {
	return OgcFeaturesDirPath(hash) + "/" + filename + ".sqlite"
}

func GeoJsonDirPath(hash string) string {
	return ProcessedGeoJsonDir + "/" + hash
}

func KmlDirPath(hash string) string {
	return KmlDir + "/" + hash
}

func KmlServicePath(hash string, fileName string) string {
	return KmlDirPath(hash) + "/" + fileName
}

// You might expect there'd be a stdlib func that does this already...
// See https://stackoverflow.com/a/50741908
func MoveFile(src string, dest string) error {
	inFile, err := os.Open(src)
	if err != nil {
		return fmt.Errorf("Unable to open src file: %v", err)
	}
	defer inFile.Close()
	outFile, err := os.Create(dest)
	if err != nil {
		return fmt.Errorf("Unable to open dest file: %v", err)
	}
	defer outFile.Close()
	_, err = io.Copy(outFile, inFile)
	if err != nil {
		return fmt.Errorf("Unable to copy file: %v", err)
	}
	inFile.Close()
	err = os.Remove(src)
	if err != nil {
		return fmt.Errorf("Couldn't remove source file: %v", err)
	}
	return nil
}
