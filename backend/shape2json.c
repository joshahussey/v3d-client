#include "gdal.h"
#include "ogr_api.h"
#include "ogr_srs_api.h"
#include "shape2json.h"
#include "cpl_conv.h"

int shape2json(char *inputFile, char *outputFile) {
    FILE *log_file;
    log_file = freopen("/cslt/logs/shape2json.log", "w", stdout);
    if (log_file == NULL) {
        logE("Opening log file for stdout failed.", "OpenLogFile");
        return 1;
    }
    int fd = fileno(stdout);
    if (dup2(fd, fileno(stderr)) == -1) {
        logE("Redirecting stderr to stdout failed.", "RedirectStderr");
        return 1;
    }

    CPLSetConfigOption("SHAPE_RESTORE_SHX", "YES");
    GDALAllRegister();
    OGRRegisterAll();

    GDALDatasetH hDS = GDALOpenEx(inputFile, GDAL_OF_VECTOR, NULL, NULL, NULL);
    if (hDS == NULL) {
        logE("Open failed.", "GDAL:");
        return 1;
    }
    logI("Open successful.", "GDAL:");

    // Create GeoJSON driver
    OGRSFDriverH hDriver = OGRGetDriverByName("GeoJSON");
    if (hDriver == NULL) {
        logE("Failed to get GeoJSON driver.", "OGR:");
        GDALClose(hDS);
        return 1;
    }
    logI("Got GeoJSON driver.", "OGR:");

    // Create output GeoJSON file
    OGRDataSourceH hDstDS = OGR_Dr_CreateDataSource(hDriver, outputFile, NULL);
    if (hDstDS == NULL) {
        logE("Failed to create output GeoJSON file.", "OGR:");
        GDALClose(hDS);
        return 1;
    }
    logI("Created output GeoJSON file.", "OGR:");

    const char* pszProjection = GDALGetProjectionRef(hDS);

    // Get layer count
    int GDALLayerCount = GDALDatasetGetLayerCount(hDS);
    char message[100];
    sprintf(message, "Layer count: %d", GDALLayerCount);
    logI(message, "GDAL:");
    
    // Loop through each layer
    int converedLayerCount = 0;
    for (int i = 0; i < GDALLayerCount; i++) {
        OGRLayerH hLayer = GDALDatasetGetLayer(hDS, i);
        char message[100];
        sprintf(message, "Layer name: %s", OGR_L_GetName(hLayer));
        logI(message, "OGR:");

        // Get the input layer's spatial reference
        OGRSpatialReferenceH hSrcSRS = OGR_L_GetSpatialRef(hLayer);
        char message2[100];
        sprintf(message2, "Using layer spatial reference: %s", OSRGetAttrValue(hSrcSRS, "AUTHORITY", 1));
        logI(message2, "OGR:");
        if (hSrcSRS == NULL) {
            logE("Failed to get layer's spatial reference.", "OGR:");
            if ( pszProjection != NULL ) {
                hSrcSRS = (OGRSpatialReferenceH)pszProjection;
                char message3[100];
                sprintf(message3, "File spatial reference: %s", pszProjection);
                logI(message3, "OGR:");
            } else {
                logE("Failed to get any spatial reference for this layer.", "OGR:");
                continue; // Skip this layer
            }
            logI("Using file spatial reference.", "OGR:");
            continue; // Skip this layer
        }

        // Create corresponding layer in output GeoJSON file
        OGRLayerH hDstLayer = OGR_DS_CreateLayer(hDstDS, OGR_L_GetName(hLayer), NULL, wkbUnknown, NULL);
        if (hDstLayer == NULL) {
            logE("Failed to create layer in output GeoJSON file.", "OGR:");
            continue; // Skip this layer
        }
        logI("Created layer in output GeoJSON file.", "OGR:");

        // Set the spatial reference for output layer to EPSG:4326
        OGRSpatialReferenceH hDstSRS = OSRNewSpatialReference(NULL);
        if (OSRSetFromUserInput(hDstSRS, "EPSG:4326") != OGRERR_NONE) {
            logE("Failed to set spatial reference for output layer.", "OGR:");
            OSRDestroySpatialReference(hDstSRS);
            continue; // Skip this layer
        }
        logI("Set spatial reference for output layer.", "OGR:");
        OSRSetAxisMappingStrategy(hDstSRS, OAMS_TRADITIONAL_GIS_ORDER);

        // Create coordinate transformation
        OGRCoordinateTransformationH hTransform = OCTNewCoordinateTransformation(hSrcSRS, hDstSRS);
        if (hTransform == NULL) {
            logE("Failed to create coordinate transformation.", "OGR:");
            OSRDestroySpatialReference(hDstSRS);
            continue; // Skip this layer
        }
        logI("Created coordinate transformation.", "OGR:");

        // Copy features from input layer to output layer, reprojecting coordinates dynamically
        OGR_L_ResetReading(hLayer);
        OGRFeatureH hFeature;
        while ((hFeature = OGR_L_GetNextFeature(hLayer)) != NULL) {
            OGRGeometryH hGeom = OGR_F_GetGeometryRef(hFeature);
            if (hGeom != NULL) {
                if (OGR_G_Transform(hGeom, hTransform) != OGRERR_NONE) {
                    logE("Failed to transform geometry.", "OGR:");
                    continue; // Skip this feature
                }
                OGR_F_SetGeometry(hFeature, hGeom);
                logI("Transformed geometry.", "OGR:");
            }
            if (OGR_L_CreateFeature(hDstLayer, hFeature) != OGRERR_NONE) {
                logE("Failed to create feature in output layer.", "OGR:");
                OGR_F_Destroy(hFeature);
                continue; // Skip this feature
            }
            logI("Created feature in output layer.", "OGR:");
            OGR_F_Destroy(hFeature);
        }
        converedLayerCount++;

        // Clean up
        OCTDestroyCoordinateTransformation(hTransform);
        OSRDestroySpatialReference(hDstSRS);
        logI("Cleaned up.", "OGR:");
    }
    if (converedLayerCount == 0) {
        logE("No layers were converted.", "OGR:");
        OGR_DS_Destroy(hDstDS);
        GDALClose(hDS);
        return 1;
    }

    // Close datasets
    OGR_DS_Destroy(hDstDS);
    GDALClose(hDS);
    logI("Closed datasets.", "GDAL:");
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

void logE(char *message, char *step) {
    printf("[ERROR]: %s: %s\n", step, message);
}

void logI(char *message, char *step) {
    printf("[INFO]: %s: %s\n", step, message);
}

void logD(char *message, char *step) {
    printf("[DEBUG]: %s: %s\n", step, message);
}
