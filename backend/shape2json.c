#include "shape2json.h"
#include "gdal/cpl_conv.h"
#include "gdal/cpl_vsi.h"
#include "gdal/gdal.h"
#include "gdal/ogr_api.h"
#include "gdal/ogr_srs_api.h"

int shape2json(char *inputFile, char *outputFile) {
  
  FILE *log_file;
  log_file = freopen("/cslt/logs/shape2json.log", "w", stdout);
  //log_file = freopen("/opt/Standalone3D/backend/shape2json.log", "w", stdout);
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

  // Open Input File
  GDALDatasetH hDS = GDALOpenEx(inputFile, GDAL_OF_VECTOR, NULL, NULL, NULL);
  if (hDS == NULL) {
    logE("Open failed.", "GDAL:");
    return 1;
  }
  logI("Open successful.", "GDAL:");

  //Check if .prj file exists
  OGRSpatialReferenceH backupSRS;
  backupSRS = GDALGetSpatialRef(hDS);
  if (backupSRS == NULL) {
    logI("Failed to get file spatial reference. Checking Prj", "OGR:");
    char prjFile[256];
    snprintf(prjFile, sizeof(prjFile), "%s.prj", inputFile);
    if (fileExists(prjFile)) {
      char **projFile = (char **)GDALOpen(prjFile, GA_ReadOnly);
      if (projFile != NULL) {
        OGRSpatialReferenceH hPrjSRS = OSRNewSpatialReference(NULL);
        if (OSRImportFromESRI(hPrjSRS, projFile) == OGRERR_NONE) {
          logI("Imported spatial reference from .prj file.", "OGR:");
          backupSRS = hPrjSRS;
        } else {
          logE("Failed to import spatial reference from .prj file.", "OGR:");
          OSRDestroySpatialReference(hPrjSRS);
        }
        GDALClose(projFile);
      }
    }
  } else {
    logI("Found backup spatial reference in file.", "OGR:");
  }

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
    logI("Tried source spatial reference.", "OGR:");
    if (hSrcSRS == NULL) {
      logI("No layer SRS, tyring backup SRS.", "OGR:");
      if (backupSRS != NULL) {
        logI("Using backup SRS.", "OGR:");
        hSrcSRS = backupSRS;
      } else {
        logE("Failed to get source spatial reference. Assuming EPSG:4326.",
             "OGR:");
        hSrcSRS = OSRNewSpatialReference(NULL);
        OSRImportFromEPSG(hSrcSRS, 4326);
      }
    }

    // Check if source SRS is already EPSG:4326
    bool reproject = true;
    const char *pszAuthName = OSRGetAuthorityName(hSrcSRS, NULL);
    const char *pszAuthCode = OSRGetAuthorityCode(hSrcSRS, NULL);
    logI("Got source SRS authority.", "OGR:");
    if (pszAuthName != NULL && pszAuthCode != NULL) {
        logI("Both SRS AuthName and AuthCode Non-null. Checking if ESPG:4326.", "OGR:");
      if (strcmp(pszAuthName, "EPSG") == 0 &&
          strcmp(pszAuthCode, "4326") == 0) {
        logI("Source SRS is already EPSG:4326. Will not transform geometries",
             "OGR:");
        reproject = false;
      }
    }

    // Create Destination Layer
    OGRLayerH hDstLayer = OGR_DS_CreateLayer(hDstDS, OGR_L_GetName(hLayer),
                                             NULL, wkbUnknown, NULL);
    if (hDstLayer == NULL) {
      logE("Failed to create layer in output GeoJSON file.", "OGR:");
      continue; // Skip this layer
    }
    logI("Created layer in output GeoJSON file.", "OGR:");

    // Copy features from input layer to output layer without
    // transformation
    OGR_L_ResetReading(hLayer);
    logI("Reset reading.", "OGR:");
    OGRFeatureH hFeature;
    if (!reproject) {
        logI("No reprojection needed.", "OGR:");
      while ((hFeature = OGR_L_GetNextFeature(hLayer)) != NULL) {
        if (OGR_L_CreateFeature(hDstLayer, hFeature) != OGRERR_NONE) {
          logE("Failed to create feature in output layer.", "OGR:");
          OGR_F_Destroy(hFeature);
          continue; // Skip this feature
        }
        logI("Created feature in output layer.", "OGR:");
        OGR_F_Destroy(hFeature);
      }
    } else {
      // Set the spatial reference for output layer to EPSG:4326
      logI("Reprojecting geometries.", "OGR:");

      OGRSpatialReferenceH hDstSRS = OSRNewSpatialReference(NULL);
      if (OSRSetFromUserInput(hDstSRS, "EPSG:4326") != OGRERR_NONE) {
        logE("Failed to set spatial reference for output layer. Skipping this "
             "layer.",
             "OGR:");
        OSRDestroySpatialReference(hDstSRS);
        continue; // Skip this layer
      }
      logI("Set spatial reference for output layer.", "OGR:");
      OSRSetAxisMappingStrategy(hDstSRS, OAMS_TRADITIONAL_GIS_ORDER);
      // Create coordinate transformation
      if (hSrcSRS == NULL) {
        logE("Failed to get source spatial reference. Skipping this layer.",
             "OGR:");
        OSRDestroySpatialReference(hDstSRS);
        continue; // Skip this layer
      }
      if (hDstSRS == NULL) {
        logE("Failed to get destination spatial reference. Skipping this "
             "layer.",
             "OGR:");
        OSRDestroySpatialReference(hDstSRS);
        continue; // Skip this layer
      }
      OGRCoordinateTransformationH hTransform =
          OCTNewCoordinateTransformation(hSrcSRS, hDstSRS);
      if (hTransform == NULL) {
        logE("Failed to create coordinate transformation. Skipping this layer.",
             "OGR:");
        OSRDestroySpatialReference(hDstSRS);
        continue; // Skip this layer
      }
      logI("Created coordinate transformation.", "OGR:");
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
      OCTDestroyCoordinateTransformation(hTransform);
    }
    converedLayerCount++;

    // Clean up
    OGR_DS_Destroy(hDstDS);
    GDALClose(hDS);
    logI("Cleaned up.", "OGR:");
  }

  if (converedLayerCount == 0) {
    logE("No layers were converted.", "OGR:");
    return 1;
  } 
  logI("Closed datasets.", "GDAL:");
  return 0;
}

// int main(int argc, char **argv) {
//   if (argc < 3) {
//     printf("Usage: %s <input_shapefile> <output_geojson>\n", argv[0]);
//     return 1;
//   }
//   int err = shape2json(argv[1], argv[2]);
//   if (err != 0) {
//     printf("Conversion failed.\n");
//     return 1;
//   }
//   printf("Conversion successful.\n");
//   return 0;
// }

int fileExists(const char *filename) {
  FILE *file;
  if ((file = fopen(filename, "r"))) {
    fclose(file);
    return 1;
  }
  return 0;
}

void logE(char *message, char *step) {
  printf("[ERROR]: %s: %s\n", step, message);
}

void logI(char *message, char *step) {
  printf("[INFO]: %s: %s\n", step, message);
}

void logD(char *message, char *step) {
  printf("[DEBUG]: %s: %s\n", step, message);
}
