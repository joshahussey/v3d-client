import { ServiceInfo } from "./types";

export type WGS84BoundingBox = {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
};

export type AddRequestObject =
    | addWMSObject
    | addWMTSObject
    | addArcGisWMSObject
    | add3DTilesObject
    | addSensorThingsObject
    | addCelestialObject
    | addGeoJSONObject
    | addKmlObject
    | addOGCMapObject
    | addOGCFeatureObject
    | addOGCCoverageObject
    | addGpkgObject;

export type addWMSObject = {
    uid: string;
    url: string;
    title: string;
    abstract: string;
    name: string;
    format: string;
    credit: string;
    wgs84BoundingBox: WGS84BoundingBox;
    serviceInfo: ServiceInfo;
};

export type addWMTSObject = {
    uid: string;
    resourceUrlTemplate: string;
    title: string;
    abstract: string;
    layerIdentifier: string;
    styleIdentifier: string;
    format: string;
    tileMatrixSetIdentifier: string;
    maximumLevel: number;
    credit: string;
    wgs84BoundingBox: WGS84BoundingBox;
    serviceInfo: ServiceInfo;
};

export type addArcGisWMSObject = {
    uid: string;
    url: string;
    title: string;
    abstract: string;
    credit: string;
    wgs84BoundingBox: WGS84BoundingBox;
    serviceInfo: ServiceInfo;
};

export type add3DTilesObject = {
    uid: string;
    url: string;
    title: string;
    description: string;
    serviceInfo: ServiceInfo;
    show?: boolean;
};

export type addSensorThingsObject = {
    uid: string;
    url: string;
    title: string;
    description: string;
    wgs84BoundingBox: WGS84BoundingBox;
    serviceInfo: ServiceInfo;
};

export type addCelestialObject = {
    uid: string;
    url: string;
    title: string;
    description: string;
    serviceInfo: ServiceInfo;
};

export type addGeoJSONObject = {
    uid: string;
    urlOrGeoJsonObject: string;
    title: string;
    description: string;
    serviceInfo: ServiceInfo;
};

export type addKmlObject = {
    uid: string;
    url: string;
    title: string;
    description: string;
    serviceInfo: ServiceInfo;
};

export type addOGCMapObject = {
    uid: string;
    title: string;
    url: string;
    wgs84BoundingBox: WGS84BoundingBox;
    serviceInfo: ServiceInfo;
};

export type addOGCFeatureObject = {
    uid: string;
    url: string;
    title: string;
    description: string;
    wgs84BoundingBox: WGS84BoundingBox;
    serviceInfo: ServiceInfo;
};

export type addOGCCoverageObject = {
    uid: string;
    url: string;
    title: string;
    description: string;
    sourceLayerIndex: string;
    id: string;
    wgs84BoundingBox: WGS84BoundingBox;
    serviceInfo: ServiceInfo;
};

export type addGpkgObject = {
    uid: string;
    name: string;
    description: string;
    type: string;
    gpkgType: string;
    table: string;
    serviceInfo: ServiceInfo;
    tileWidth: number;
    tileHeight: number;
    rect: WGS84BoundingBox;
    zoomDims: zoomDim[];
};

export type zoomDim = {
    level: number;
    width: number;
    height: number;
};
