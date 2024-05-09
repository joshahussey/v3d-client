# syntax=docker/dockerfile:1

FROM docker.compusult.com:5000/backend_base
WORKDIR /cslt
COPY . ./backend
WORKDIR /cslt/backend
RUN [ "go", "build" ]
RUN [ "rm", "-rf", "Backend.go", "CMakeLists.txt", "Database.go", "DirList.go", "Err.go", "FileUpload.go", "HandleAddWebsocket.go", "HandleDelete.go", "HandleFeatures.go", "HandleGet.go", "HandleHead.go", "HandleKml.go", "HandleNewClient.go", "HandlePatch.go", "HandlePost.go", "HandlePut.go", "HandleShape.go", "HandleUnknownRequest.go", "RequestQueue.go", "build", "compile_commands.json", "Logging.go", "shape2json.c", "shape2json.h","go.mod", "go.sum", "Dockerfile"]

CMD [ "/cslt/backend/cslt3d", ">", "/cslt/backend/logs/backend.log", "2>&1", "&"]
