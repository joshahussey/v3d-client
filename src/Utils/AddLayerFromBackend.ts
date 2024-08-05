import {
    add3DTilesObject,
    addArcGisWMSObject,
    addCelestialObject,
    addGeoJSONObject,
    addGpkgObject,
    addKmlObject,
    addOGCCoverageObject,
    addOGCFeatureObject,
    addOGCMapObject,
    AddRequestObject,
    addSensorThingsObject,
    addWMSObject,
    addWMTSObject,
    zoomDim
} from "../Types/3dMapControllerTypes";
import {
    add3DTiles,
    addArcGisWMS,
    addCelestial,
    addGeoJSON,
    addGpkg,
    addKml,
    addOGCCoverage,
    addOGCFeature,
    addOgcMap,
    addSensorThings,
    addWMS,
    addWMTS,
    raiseMapStateChangedEvent
} from "./Controller";

export async function addLayerFromBackend(parsedMessage: { type: string; args: [AddRequestObject] }) {
    let args = parsedMessage.args;
    if (!Array.isArray(args)) {
        args = [args];
    }
    const receivedMessageObjects: AddRequestObject[] = [];
    switch (parsedMessage.type) {
        case "WMS":
            for (const arg of args as [addWMSObject]) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    capabilitiesUrl: arg.capabilitiesUrl,
                    name: arg.name,
                    credit: arg.credit,
                    serviceInfo: arg.serviceInfo
                });
            }
            await addWMS(receivedMessageObjects as addWMSObject[]);
            raiseMapStateChangedEvent();
            break;
        case "WMTS":
            for (const arg of args as [addWMTSObject]) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    resourceUrlTemplate: arg.resourceUrlTemplate,
                    title: arg.title,
                    abstract: arg.abstract,
                    layerIdentifier: arg.layerIdentifier,
                    styleIdentifier: arg.styleIdentifier,
                    format: arg.format,
                    tileMatrixSetIdentifier: arg.tileMatrixSetIdentifier,
                    maximumLevel: arg.maximumLevel,
                    credit: arg.credit,
                    wgs84BoundingBox: arg.wgs84BoundingBox,
                    serviceInfo: arg.serviceInfo
                });
            }
            addWMTS(receivedMessageObjects as addWMTSObject[]);
            raiseMapStateChangedEvent();
            break;
        case "ARCGISWMS":
            for (const arg of args as [addArcGisWMSObject]) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    url: arg.url,
                    title: arg.title,
                    id: arg.id,
                    abstract: arg.abstract,
                    credit: arg.credit,
                    wgs84BoundingBox: arg.wgs84BoundingBox,
                    serviceInfo: arg.serviceInfo
                });
            }
            addArcGisWMS(receivedMessageObjects as addArcGisWMSObject[]);
            raiseMapStateChangedEvent();
            break;
        case "OGCMAP":
            for (const arg of args as [addOGCMapObject]) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    title: arg.title,
                    url: arg.url,
                    wgs84BoundingBox: arg.wgs84BoundingBox,
                    serviceInfo: arg.serviceInfo
                });
            }
            addOgcMap(receivedMessageObjects as addOGCMapObject[]);
            raiseMapStateChangedEvent();
            break;
        case "FEATURE":
            for (const arg of args as [addOGCFeatureObject]) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    url: arg.url,
                    title: arg.title,
                    description: arg.description,
                    wgs84BoundingBox: arg.wgs84BoundingBox,
                    serviceInfo: arg.serviceInfo
                });
            }
            addOGCFeature(receivedMessageObjects as addOGCFeatureObject[]);
            raiseMapStateChangedEvent();
            break;
        case "COVERAGE":
            for (const arg of args as [addOGCCoverageObject]) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    url: arg.url,
                    title: arg.title,
                    description: arg.description,
                    sourceLayerIndex: arg.sourceLayerIndex,
                    id: arg.id,
                    wgs84BoundingBox: arg.wgs84BoundingBox,
                    serviceInfo: arg.serviceInfo
                });
            }
            addOGCCoverage(receivedMessageObjects as addOGCCoverageObject[]);
            raiseMapStateChangedEvent();
            break;
        case "CELESTIAL":
            for (const arg of args as [addCelestialObject]) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    url: arg.url,
                    title: arg.title,
                    description: arg.description,
                    serviceInfo: arg.serviceInfo
                });
            }
            addCelestial(receivedMessageObjects as addCelestialObject[]);
            raiseMapStateChangedEvent();
            break;
        case "SENSORTHINGS":
            for (const arg of args as [addSensorThingsObject]) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    url: arg.url,
                    title: arg.title,
                    description: arg.description,
                    wgs84BoundingBox: arg.wgs84BoundingBox,
                    serviceInfo: arg.serviceInfo
                });
            }
            addSensorThings(receivedMessageObjects as addSensorThingsObject[]);
            raiseMapStateChangedEvent();
            break;
        case "GEOJSON":
            for (const arg of args as [addGeoJSONObject]) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    urlOrGeoJsonObject: arg.urlOrGeoJsonObject,
                    title: arg.title,
                    description: arg.description,
                    serviceInfo: arg.serviceInfo
                });
            }
            addGeoJSON(receivedMessageObjects as addGeoJSONObject[]);
            raiseMapStateChangedEvent();
            break;
        case "KML":
            for (const arg of args as [addKmlObject]) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    url: arg.url,
                    title: arg.title,
                    description: arg.description,
                    serviceInfo: arg.serviceInfo
                });
            }
            addKml(receivedMessageObjects as addKmlObject[]);
            raiseMapStateChangedEvent();
            break;
        case "3DTILES":
            for (const arg of args as [add3DTilesObject]) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    url: arg.url,
                    title: arg.title,
                    description: arg.description,
                    serviceInfo: arg.serviceInfo
                });
            }
            add3DTiles(receivedMessageObjects as add3DTilesObject[]);
            raiseMapStateChangedEvent();
            break;
        case "GPKG":
            for (const arg of args as [addGpkgObject]) {
                const matrixDimensions: zoomDim[] = [];
                arg.zoomDims.forEach((z: zoomDim) => {
                    matrixDimensions.push(z);
                });
                receivedMessageObjects.push({
                    uid: arg.uid,
                    name: arg.name,
                    description: arg.description,
                    type: arg.type,
                    gpkgType: arg.gpkgType,
                    table: arg.table,
                    tileWidth: arg.tileWidth,
                    tileHeight: arg.tileHeight,
                    rect: arg.rect,
                    serviceInfo: arg.serviceInfo,
                    zoomDims: matrixDimensions
                });
            }
            addGpkg(receivedMessageObjects as addGpkgObject[]);
            raiseMapStateChangedEvent();
            break;
        default:
            break;
    }
}
