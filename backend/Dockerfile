# syntax=docker/dockerfile:1

FROM ghcr.io/osgeo/gdal:alpine-small-3.8.4
COPY --from=golang:1.21 /usr/local/go /usr/local/go
ENV PATH="/usr/local/go/bin:${PATH}"
ARG BACKEND_PORT_ARG=8080
WORKDIR /cslt
RUN [ "mkdir", "-p", "./backend" ]
COPY . ./backend
EXPOSE $BACKEND_PORT_ARG
ENV BACKEND_PORT $BACKEND_PORT_ARG
WORKDIR /cslt/backend
RUN [ "apk", "add", "gcc", "musl-dev" ]
RUN [ "go", "build" ]
RUN [ "rm", "-rf", "Backend.go", "CMakeLists.txt", "Database.go", "DirList.go", "Err.go", "FileUpload.go", "HandleAddWebsocket.go", "HandleDelete.go", "HandleFeatures.go", "HandleGet.go", "HandleHead.go", "HandleKml.go", "HandleNewClient.go", "HandlePatch.go", "HandlePost.go", "HandlePut.go", "HandleShape.go", "HandleUnknownRequest.go", "RequestQueue.go", "build", "compile_commands.json", "Logging.go", "shape2json.c", "shape2json.h","go.mod", "go.sum", "Dockerfile"]

CMD [ "/cslt/backend/cslt3d", ">", "/cslt/backend/logs/backend.log", "2>&1", "&"]
