# syntax=docker/dockerfile:1

FROM golang:1.21
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
RUN [ "rm", "-rf", "run.sh.bak" ] # TODO remove
RUN [ "./run.sh", "&" ]
CMD [ "tail", "-F", "/dev/null" ]
