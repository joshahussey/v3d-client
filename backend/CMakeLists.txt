cmake_minimum_required(VERSION 3.0)
project(shape2json)

# Find GDAL
find_package(GDAL REQUIRED)
include_directories(${GDAL_INCLUDE_DIRS})

# Add executable
add_executable(shape2json shape2json.c)

# Link GDAL library
target_link_libraries(shape2json ${GDAL_LIBRARY})
