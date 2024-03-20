#include "gdal.h"
#include "ogr_api.h"
#include "ogr_srs_api.h"
#include "shape2json.h"

int shape2json(char *inputFile, char *outputFile) {
    GDALAllRegister();
    OGRRegisterAll();

    GDALDatasetH hDS = GDALOpenEx(inputFile, GDAL_OF_VECTOR, NULL, NULL, NULL);
    if (hDS == NULL) {
        printf("Open failed.\n");
        return 1;
    }

    // Create GeoJSON driver
    OGRSFDriverH hDriver = OGRGetDriverByName("GeoJSON");
    if (hDriver == NULL) {
        printf("GeoJSON driver not available.\n");
        GDALClose(hDS);
        return 1;
    }

    // Create output GeoJSON file
    OGRDataSourceH hDstDS = OGR_Dr_CreateDataSource(hDriver, outputFile, NULL);
    if (hDstDS == NULL) {
        printf("Creation of output file failed.\n");
        GDALClose(hDS);
        return 1;
    }

    int GDALLayerCount = GDALDatasetGetLayerCount(hDS);
    printf("Layer count: %d\n", GDALLayerCount);

    // Loop through each layer
    for (int i = 0; i < GDALLayerCount; i++) {
        OGRLayerH hLayer = GDALDatasetGetLayer(hDS, i);
        printf("Layer name: %s\n", OGR_L_GetName(hLayer));

        // Create corresponding layer in output GeoJSON file
        OGRLayerH hDstLayer = OGR_DS_CreateLayer(hDstDS, OGR_L_GetName(hLayer), NULL, wkbUnknown, NULL);
        if (hDstLayer == NULL) {
            printf("Layer creation failed.\n");
            continue; // Skip this layer
        }

        // Set the spatial reference for output layer to EPSG:4326
        OGRSpatialReferenceH hSrcSRS = OGR_L_GetSpatialRef(hLayer);
        OGRSpatialReferenceH hDstSRS = OSRNewSpatialReference(NULL);
        OSRImportFromEPSG(hDstSRS, 4326);
        OGRCoordinateTransformationH hTransform = OCTNewCoordinateTransformation(hSrcSRS, hDstSRS);

        // Copy features from input layer to output layer, reprojecting coordinates to EPSG:4326
        OGR_L_ResetReading(hLayer);
        OGRFeatureH hFeature;
        while ((hFeature = OGR_L_GetNextFeature(hLayer)) != NULL) {
            OGRGeometryH hGeom = OGR_F_GetGeometryRef(hFeature);
            if (hGeom != NULL) {
                OGR_G_Transform(hGeom, hTransform);
                OGR_F_SetGeometry(hFeature, hGeom);
            }
            OGRErr err = OGR_L_CreateFeature(hDstLayer, hFeature);
            if (err != OGRERR_NONE) {
                printf("Feature creation failed.\n");
            }
            OGR_F_Destroy(hFeature);
        }

        // Clean up
        OCTDestroyCoordinateTransformation(hTransform);
        OSRDestroySpatialReference(hDstSRS);
    }

    // Close datasets
    OGR_DS_Destroy(hDstDS);
    GDALClose(hDS);

    return 0;
}

// int main(int argc, char **argv) {
//     if (argc < 3) {
//         printf("Usage: %s <input_shapefile> <output_geojson>\n", argv[0]);
//         return 1;
//     }

//     int err = shape2json(argv[1], argv[2]);
//     if (err != 0) {
//         printf("Conversion failed.\n");
//         return 1;
//     }

//     printf("Conversion successful.\n");
//     return 0;
// }
