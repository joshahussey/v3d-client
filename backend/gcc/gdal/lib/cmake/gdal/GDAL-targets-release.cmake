#----------------------------------------------------------------
# Generated CMake target import file for configuration "Release".
#----------------------------------------------------------------

# Commands may need to know the format version.
set(CMAKE_IMPORT_FILE_VERSION 1)

# Import target "GDAL::GDAL" for configuration "Release"
set_property(TARGET GDAL::GDAL APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(GDAL::GDAL PROPERTIES
  IMPORTED_LINK_DEPENDENT_LIBRARIES_RELEASE "json-c::json-c;zstd::libzstd_shared;GEOS::geos_c;PROJ::proj;expat::expat;TileDB::tiledb_shared;Arrow::arrow_shared;Parquet::parquet_shared;ArrowDataset::arrow_dataset_shared"
  IMPORTED_LOCATION_RELEASE "/nix/store/blknx4w1qzf75klb28i1sqmxyf9rv365-gdal-3.8.4/lib/libgdal.so.34.3.8.4"
  IMPORTED_SONAME_RELEASE "libgdal.so.34"
  )

list(APPEND _cmake_import_check_targets GDAL::GDAL )
list(APPEND _cmake_import_check_files_for_GDAL::GDAL "/nix/store/blknx4w1qzf75klb28i1sqmxyf9rv365-gdal-3.8.4/lib/libgdal.so.34.3.8.4" )

# Commands beyond this point should not need to know the version.
set(CMAKE_IMPORT_FILE_VERSION)
