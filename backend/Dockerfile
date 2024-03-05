# syntax=docker/dockerfile:1

FROM node:20-alpine
COPY --from=golang:1.21 /usr/local/go /usr/local/go
ENV PATH="/usr/local/go/bin:${PATH}"
ARG BACKEND_PORT_ARG=8080
WORKDIR /cslt
RUN [ "mkdir", "-p", "./backend" ]
COPY . ./backend
EXPOSE $BACKEND_PORT_ARG
ENV BACKEND_PORT $BACKEND_PORT_ARG
RUN [ "go", "build", "-C", "./backend", "-v", "-x" ]
WORKDIR /cslt/backend
RUN [ "rm", "-rf", "backend.go" ]
RUN [ "rm", "-rf", "go.mod" ]
RUN [ "rm", "-rf", "go.sum" ]
#CMD [ "/cslt/backend/cslt3d", ">", "/cslt/backend.log", "2>&1" ]
CMD [ "/cslt/backend/cslt3d" ]
