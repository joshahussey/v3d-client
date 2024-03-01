# syntax=docker/dockerfile:1

FROM node:20-alpine
ARG DOMAIN_NAME_ARG=localhost
ARG ROOT_DIR_3D_ARG=.
ARG TLS_CERT_LOC_ARG=internal
ARG TLS_KEY_LOC_ARG
WORKDIR /cslt
COPY --from=golang:1.21 /usr/local/go /usr/local/go
ENV PATH="/usr/local/go/bin:${PATH}"
COPY . .
RUN [ "mkdir", "-p", "./logs" ]
EXPOSE 2015
EXPOSE 2016
EXPOSE 2019
EXPOSE 8080
ENV DOMAIN_NAME $DOMAIN_NAME_ARG
ENV ROOT_DIR_3D $ROOT_DIR_3D_ARG
ENV TLS_CERT_LOC $TLS_CERT_LOC_ARG
ENV TLS_KEY_LOC $TLS_KEY_LOC_ARG
RUN [ "npm", "install" ]
RUN [ "npm", "run", "full-build-release" ]
CMD ./backend/run.sh && ./server/run.sh
