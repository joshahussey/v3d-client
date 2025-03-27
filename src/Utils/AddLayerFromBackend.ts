import {
    add3DTilesObject,
    addArcGisWMSObject,
    addCelestialObject,
    addCOGObject,
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
    addCOG,
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
            await addWMS(args as [addWMSObject]);
            raiseMapStateChangedEvent();
            break;
        case "WMTS":
            addWMTS(args as [addWMTSObject]);
            raiseMapStateChangedEvent();
            break;
        case "ARCGISWMS":
            await addArcGisWMS(args as [addArcGisWMSObject]);
            raiseMapStateChangedEvent();
            break;
        case "OGCMAP":
            addOgcMap(args as [addOGCMapObject]);
            raiseMapStateChangedEvent();
            break;
        case "FEATURE":
            addOGCFeature(args as [addOGCFeatureObject]);
            raiseMapStateChangedEvent();
            break;
        case "COVERAGE":
            addOGCCoverage(args as [addOGCCoverageObject]);
            raiseMapStateChangedEvent();
            break;
        case "CELESTIAL":
            addCelestial(args as [addCelestialObject]);
            raiseMapStateChangedEvent();
            break;
        case "SENSORTHINGS":
            addSensorThings(args as [addSensorThingsObject]);
            raiseMapStateChangedEvent();
            break;
        case "GEOJSON":
            addGeoJSON(args as [addGeoJSONObject]);
            raiseMapStateChangedEvent();
            break;
        case "KML":
            addKml(args as [addKmlObject]);
            raiseMapStateChangedEvent();
            break;
        case "3DTILES":
            add3DTiles(args as [add3DTilesObject]);
            raiseMapStateChangedEvent();
            break;
        case "COG":
            addCOG(args as [addCOGObject]);
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
