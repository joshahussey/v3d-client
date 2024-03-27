import { AddRequestObject } from "../3dMapControllerTypes";
import { CesiumWindow } from "../Wes";
const Controller = (window as CesiumWindow).Map3DController;

export async function addLayerFromBackend(parsedMessage: any) {
    let args = parsedMessage.args;
    if (!Array.isArray(args)) {
        args = [args]
    }
    const receivedMessageObjects: AddRequestObject[] = [];
    switch (parsedMessage.type) {
        case "WMS":
            for (const arg of args) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    url: arg.url,
                    title: arg.title,
                    abstract: arg.abstract,
                    name: arg.name,
                    format: arg.format,
                    credit: arg.credit,
                    wgs84BoundingBox: arg.wgs84BoundingBox,
                    serviceInfo: arg.serviceInfo,
                })
            }
            Controller.addWMS(receivedMessageObjects);
            Controller.raiseMapStateChangedEvent();
            break;
        case "WMTS":
            for (const arg of args) {
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
                })
            }
            Controller.addWMTS(receivedMessageObjects);
            Controller.raiseMapStateChangedEvent();
            break;
        case "ARCGISWMS":
            for (const arg of args) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    url: arg.url,
                    title: arg.title,
                    abstract: arg.abstract,
                    credit: arg.credit,
                    wgs84BoundingBox: arg.wgs84BoundingBox,
                    serviceInfo: arg.serviceInfo
                })
            }
            Controller.addArcGisWMS(receivedMessageObjects);
            Controller.raiseMapStateChangedEvent();
            break;
        case "OGCMAP":
            for (const arg of args) {
                receivedMessageObjects.push({
                    uid: arg.uid, 
                    title: arg.title, 
                    url: arg.url,
                    wgs84BoundingBox: arg.wgs84BoundingBox, 
                    serviceInfo: arg.serviceInfo
                })
            }
            Controller.addOgcMap(receivedMessageObjects);
            Controller.raiseMapStateChangedEvent();
            break;
        case "FEATURE":
            for (const arg of args) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    url: arg.url,
                    title: arg.title,
                    description: arg.description,
                    wgs84BoundingBox: arg.wgs84BoundingBox,
                    serviceInfo: arg.serviceInfo
                })
            }
            Controller.addOGCFeature(receivedMessageObjects);
            Controller.raiseMapStateChangedEvent();
            break;
        case "COVERAGE":
            for (const arg of args) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    url: arg.url,
                    title: arg.title,
                    description: arg.description,
                    sourceLayerIndex: arg.sourceLayerIndex,
                    id: arg.id,
                    wgs84BoundingBox: arg.wgs84BoundingBox,
                    serviceInfo: arg.serviceInfo
                })
            }
            Controller.addOGCCoverage(receivedMessageObjects);
            Controller.raiseMapStateChangedEvent();
            break;
        case "CELESTIAL":
            for (const arg of args) {
                receivedMessageObjects.push({
                    uid: arg.uid, 
                    url: arg.url, 
                    title: arg.title, 
                    description: arg.description, 
                    serviceInfo: arg.serviceInfo
                })
            }
            Controller.addCelestial(receivedMessageObjects);
            Controller.raiseMapStateChangedEvent();
            break;
        case "SENSORTHINGS":
            for (const arg of args) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    url: arg.url,
                    title: arg.title,
                    description: arg.description,
                    wgs84BoundingBox: arg.wgs84BoundingBox,
                    serviceInfo: arg.serviceInfo
                })
            }
            Controller.addSensorThings(receivedMessageObjects);
            Controller.raiseMapStateChangedEvent();
            break;
        case "GEOJSON":
            for (const arg of args) {
                receivedMessageObjects.push({
                    uid: arg.uid,
                    urlOrGeoJsonObject: arg.urlOrGeoJsonObject,
                    title: arg.title,
                    description: arg.description,
                    serviceInfo: arg.serviceInfo
                })
            }
            Controller.addGeoJSON(receivedMessageObjects);
            Controller.raiseMapStateChangedEvent();
            break;
        case "KML":
            for (const arg of args) {
                receivedMessageObjects.push({
                    uid: arg.uid, 
                    url: arg.url,
                    title: arg.title, 
                    description: arg.description, 
                    serviceInfo: arg.serviceInfo
                })
            }
            Controller.addKml(receivedMessageObjects);
            Controller.raiseMapStateChangedEvent();
            break;
        case "3DTILES":
            for (const arg of args) {
                receivedMessageObjects.push({
                    uid: arg.uid, 
                    url: arg.url, 
                    title: arg.title, 
                    description: arg.description, 
                    serviceInfo: arg.serviceInfo
                })
            }
            Controller.add3DTiles(receivedMessageObjects);
            Controller.raiseMapStateChangedEvent();
            break;
        default:
            break;
    }
}

