#include <stdlib.h>
#include "gdal.h"
#include "ogr_api.h"
#include "shape2json.h"
int shape2json(char *inputFile, char *outputFile) {

    CPLSetConfigOption("SHAPE_RESTORE_SHX", "YES");

    GDALAllRegister();

    GDALDatasetH hDS = GDALOpenEx(inputFile, GDAL_OF_VECTOR, NULL, NULL, NULL);
    if (hDS == NULL) {
        fprintf(stderr, "Failed to open Shapefile %s\n", inputFile);
        return 1;
    }

    GDALDriverH hDriver = GDALGetDriverByName("GeoJSON");
    if (hDriver == NULL) {
        fprintf(stderr, "Failed to get GeoJSON driver\n");
        GDALClose(hDS);
        return 1;
    }

    GDALDatasetH hDSGeoJSON = GDALCreateCopy(hDriver, outputFile, hDS, FALSE, NULL, NULL, NULL);
    if (hDSGeoJSON == NULL) {
        fprintf(stderr, "Failed to create GeoJSON file %s\n", outputFile);
        GDALClose(hDS);
        return 1;
    }

    GDALClose(hDS);
    GDALClose(hDSGeoJSON);

    return 0;
}
