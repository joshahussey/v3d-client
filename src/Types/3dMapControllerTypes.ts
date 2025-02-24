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
    | addGpkgObject
    | addCOGObject;

export type addWMSObject = {
    uid: string;
    capabilitiesUrl: string;
    name: string;
    credit: string;
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
    id: string;
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

export type addCOGObject = {
    uid: string;
    url: string;
    name: string;
    description: string;
    projection: string;
    serviceInfo: ServiceInfo;
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

export interface addCatalogObj {
    uid: string;
    title: string;
    url: string;
    type: string;
}

export type zoomDim = {
    level: number;
    width: number;
    height: number;
};
