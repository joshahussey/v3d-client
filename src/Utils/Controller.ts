import {
    WGS84BoundingBox,
    add3DTilesObject,
    addArcGisWMSObject,
    addCelestialObject,
    addGeoJSONObject,
    addGpkgObject,
    addKmlObject,
    addOGCCoverageObject,
    addOGCFeatureObject,
    addOGCMapObject,
    addSensorThingsObject,
    addWMSObject,
    addWMTSObject,
    addCOGObject
} from "../Types/3dMapControllerTypes";
import { MapState, WesImageryObject, csltCOGOption, csltGpkgOption } from "../Types/types";
import {
    findImagePngFormat,
    getArcGisRestCapabilitiesLayerInformation,
    getCapabilitiesLayerInformation,
    getWmsCapabilitiesJson
} from "./CapabilitiesParsing";

/**
 * Adds a WMTS to 3DMap if a layer on top of the imagery if the uid doesn't exist.
 * If the uid exists then the existing layer is first removed.
 *
 * @param {addWMTSObject[]} addWMTSObject
 */
export function addWMTS(addWMTSObject: addWMTSObject[]) {
    const mapState = getMapState();
    let imageLayers = mapState.imageLayers;
    for (const wmtsObject of addWMTSObject) {
        const option = {
            uid: wmtsObject.uid,
            type: "WMTS",
            name: wmtsObject.title,
            description: wmtsObject.abstract ? wmtsObject.abstract : wmtsObject.title,
            url: wmtsObject.resourceUrlTemplate,
            serviceInfo: wmtsObject.serviceInfo,
            bounds: wmtsObject.wgs84BoundingBox,
            layer: wmtsObject.layerIdentifier,
            style: wmtsObject.styleIdentifier,
            format: wmtsObject.format,
            tileMatrixSetID: wmtsObject.tileMatrixSetIdentifier,
            maximumLevel: wmtsObject.maximumLevel,
            credit: wmtsObject.credit ? wmtsObject.credit : "",
            show: true,
            alpha: 1.0
        };
        imageLayers = imageLayers.filter(l => l.uid !== wmtsObject.uid);
        imageLayers = [...imageLayers, option];
    }
    setMapState({
        ...mapState,
        imageLayers: imageLayers
    });
}

/**
 * Adds an OGC Maps Layer to 3DMap if a layer on top of the imagery if the uid doesn't exist.
 * If the uid exists then the existing layer is first removed.
 *
 * @param {addOGCMapObject[]} addOgcMapObject
 */
export function addOgcMap(addOgcMapObject: addOGCMapObject[]) {
    const mapState = getMapState();
    let imageLayers = mapState.imageLayers;
    for (const ogcMapObject of addOgcMapObject) {
        const option: WesImageryObject = {
            type: "OgcMap",
            uid: ogcMapObject.uid,
            name: ogcMapObject.title,
            show: true,
            url: ogcMapObject.url,
            serviceInfo: ogcMapObject.serviceInfo,
            bounds: ogcMapObject.wgs84BoundingBox,
            description: "",
            credit: ""
        };
        imageLayers = imageLayers.filter(l => l.uid !== ogcMapObject.uid);
        imageLayers.push(option);
    }
    mapState.imageLayers = imageLayers;
    setMapState(mapState);
}

/**
 * Adds a WMS to 3DMap if a layer on top of the imagery if the uid doesn't exist.
 * If the uid exists then the existing layer is first removed.
 *
 * @param {addWMSObject[]} addWMSObject
 */
export async function addWMS(addWMSObject: addWMSObject[]) {
    const mapState = getMapState();
    let imageLayers = mapState.imageLayers;
    for (const wmsObject of addWMSObject) {
        const capJson = await getWmsCapabilitiesJson(wmsObject.capabilitiesUrl);
        if (capJson == null) {
            console.error("Couldnt get the capabilities json from: " + wmsObject.capabilitiesUrl);
            return;
        }
        const layerInfo = getCapabilitiesLayerInformation(capJson, wmsObject.name);
        if (layerInfo == null || layerInfo.length == 0) {
            console.error(
                "Couldn't get the layer information from: " + wmsObject.capabilitiesUrl + " for: " + wmsObject.name
            );
            return;
        }
        for (const layer of layerInfo) {
            if (layer.Name !== undefined) {
                const option = {
                    uid: wmsObject.uid + "_" + layer.Name,
                    type: "WMS",
                    name: layer.Title,
                    description: layer.Abstract ? layer.Abstract : layer.Title,
                    url: wmsObject.capabilitiesUrl.split("?")[0],
                    serviceInfo: wmsObject.serviceInfo,
                    bounds: {
                        minX: layer.EX_GeographicBoundingBox[0],
                        minY: layer.EX_GeographicBoundingBox[1],
                        maxX: layer.EX_GeographicBoundingBox[2],
                        maxY: layer.EX_GeographicBoundingBox[3]
                    },
                    layers: layer.Name,
                    parameters: {
                        transparent: "true",
                        format: findImagePngFormat(capJson)
                    },
                    credit: wmsObject.credit ? wmsObject.credit : "",
                    show: false,
                    alpha: 1.0
                };
                imageLayers = imageLayers.filter(l => l.uid !== wmsObject.uid + "_" + layer.Name);
                imageLayers.push(option);
            }
        }
    }
    mapState.imageLayers = imageLayers;
    setMapState(mapState);
}

/**
 * Adds a ArcGIS MapServer to 3DMap if the uid doesn't exist.
 * If the uid exists then the existing layer is first removed.
 *
 * @param {addArcGisWMSObject[]} addArcGISWMSObject unique identifier for the layer.
 */
export async function addArcGisWMS(addArcGISWMSObject: addArcGisWMSObject[]) {
    const mapState = getMapState();
    let imageLayers = mapState.imageLayers;
    for (const arcGisWmsObject of addArcGISWMSObject) {
        const layersReturned = await getArcGisRestCapabilitiesLayerInformation(arcGisWmsObject.url, arcGisWmsObject.id);
        const baseMapServerUrl = arcGisWmsObject.url.substring(0, arcGisWmsObject.url.lastIndexOf("/MapServer") + 10);
        for (const layer of layersReturned) {
            const option: WesImageryObject = {
                uid: arcGisWmsObject.uid + "_" + layer.id,
                type: "ArcGis",
                name: layer.name,
                id: layer.id,
                description: arcGisWmsObject.abstract ? arcGisWmsObject.abstract : arcGisWmsObject.title,
                url: baseMapServerUrl,
                serviceInfo: arcGisWmsObject.serviceInfo,
                bounds: arcGisWmsObject.wgs84BoundingBox,
                credit: arcGisWmsObject.credit ? arcGisWmsObject.credit : "",
                show: true
            };
            imageLayers = imageLayers.filter(l => l.uid !== arcGisWmsObject.uid);
            imageLayers.push(option);
        }
    }
    mapState.imageLayers = imageLayers;
    setMapState(mapState);
}

/**
 * Adds a 3D Tiles to 3DMap if a layer on top of the map primitives if the uid doesn't exist.
 * If the uid exists then the existing layer is first removed.
 *
 * @param {add3DTilesObject[]} add3DTilesObject unique identifier for the layer.
 */
export function add3DTiles(add3DTilesObject: add3DTilesObject[]) {
    const mapState = getMapState();
    let primitiveLayers = mapState.primitiveLayers;
    for (const tilesObject of add3DTilesObject) {
        let show = true;
        if (tilesObject.show) {
            show = tilesObject.show;
        }
        const option = {
            uid: tilesObject.uid,
            type: "3D_TILES",
            name: tilesObject.title,
            description: tilesObject.description,
            url: tilesObject.url,
            serviceInfo: tilesObject.serviceInfo,
            show
        };
        primitiveLayers = primitiveLayers.filter(l => l.uid !== tilesObject.uid);
        primitiveLayers = [...primitiveLayers, option];
    }
    setMapState({
        ...mapState,
        primitiveLayers: primitiveLayers
    });
}

export function addCOG(addCOGObject: addCOGObject[]) {
    const mapState = getMapState();
    let imageLayers = mapState.imageLayers;
    for (const cogObject of addCOGObject) {
        const option: csltCOGOption = {
            uid: cogObject.uid,
            type: "COG",
            name: cogObject.name,
            description: cogObject.description,
            projection: cogObject.projection,
            url: cogObject.url,
            serviceInfo: cogObject.serviceInfo
        };
        imageLayers = imageLayers.filter(l => l.uid !== cogObject.uid);
        imageLayers.push(option);
    }
    mapState.imageLayers = imageLayers;
    setMapState(mapState);
}

/**
 * Adds a SensorThings data source to the 3D map, replacing any existing data source with the same UID.
 *
 * @param {addSensorThingsObject[]} addSensorThingsObject unique identifier for the layer.
 */
export function addSensorThings(addSensorThingsObject: addSensorThingsObject[]) {
    const mapState = getMapState();
    let dataSources = mapState.dataSources;
    for (const sensorThingsObject of addSensorThingsObject) {
        const option = {
            uid: sensorThingsObject.uid,
            type: "sensorthings",
            name: sensorThingsObject.title,
            description: sensorThingsObject.description,
            url: sensorThingsObject.url,
            bounds: sensorThingsObject.wgs84BoundingBox,
            serviceInfo: sensorThingsObject.serviceInfo
        };
        dataSources = dataSources.filter(d => d.uid !== sensorThingsObject.uid);
        dataSources.push(option);
    }
    mapState.dataSources = dataSources;
    setMapState(mapState);
}

/**
 * Adds a data source to the 3D map, replacing any existing data source with the same UID.
 *
 * @param {addCelestialObject[]} addCelestialObject unique identifier for the layer.
 */
//NOT CURRENTLY SUPPORTED
export function addCelestial(addCelestialObject: addCelestialObject[]) {
    const mapState = getMapState();
    let dataSources = mapState.dataSources;
    for (const celestialObject of addCelestialObject) {
        const option = {
            uid: celestialObject.uid,
            type: "celestial",
            name: celestialObject.title,
            description: celestialObject.description,
            url: celestialObject.url,
            serviceInfo: celestialObject.serviceInfo
        };
        dataSources = dataSources.filter(d => d.uid !== celestialObject.uid);
        dataSources.push(option);
    }
    mapState.dataSources = dataSources;
    setMapState(mapState);
}

/**
 * Adds a data source to the 3D map, replacing any existing data source with the same UID.
 *
 * @param {addGeoJSONObject[]} addGeoJsonObject unique identifier for the layer.
 */
export function addGeoJSON(addGeoJsonObject: addGeoJSONObject[]) {
    const mapState = getMapState();
    let dataSources = mapState.dataSources;
    for (const geoJsonObject of addGeoJsonObject) {
        const option = {
            uid: geoJsonObject.uid,
            name: geoJsonObject.title,
            description: geoJsonObject.description,
            url: geoJsonObject.urlOrGeoJsonObject,
            type: "geojson",
            serviceInfo: geoJsonObject.serviceInfo
        };
        dataSources = dataSources.filter(d => d.uid !== geoJsonObject.uid);
        dataSources.push(option);
    }
    mapState.dataSources = dataSources;
    setMapState(mapState);
}

/**
 * Adds a data source to the 3D map, replacing any existing data source with the same UID.
 *
 * @param {addKmlObject[]} addKmlObject unique identifier for the layer.
 */
export function addKml(addKmlObject: addKmlObject[]) {
    const mapState = getMapState();
    let dataSources = mapState.dataSources;
    for (const kmlObject of addKmlObject) {
        const option = {
            uid: kmlObject.uid,
            name: kmlObject.title,
            description: kmlObject.description,
            url: kmlObject.url,
            type: "kml",
            serviceInfo: kmlObject.serviceInfo
        };
        dataSources = dataSources.filter(d => d.uid !== kmlObject.uid);
        dataSources.push(option);
    }
    mapState.dataSources = dataSources;
    setMapState(mapState);
}

/**
 * Adds a data source to the 3D map, replacing any existing data source with the same UID.
 *
 * @param {addOGCFeatureObject[]} addOGCFeatureObject unique identifier for the layer.
 */
export function addOGCFeature(addOGCFeatureObject: addOGCFeatureObject[]) {
    const mapState = getMapState();
    let dataSources = mapState.dataSources;
    for (const ogcFeatureObject of addOGCFeatureObject) {
        const option = {
            uid: ogcFeatureObject.uid,
            type: "feature",
            name: ogcFeatureObject.title,
            description: ogcFeatureObject.description,
            url: ogcFeatureObject.url,
            bounds: ogcFeatureObject.wgs84BoundingBox,
            serviceInfo: ogcFeatureObject.serviceInfo
        };
        dataSources = dataSources.filter(d => d.uid !== ogcFeatureObject.uid);
        dataSources.push(option);
    }
    mapState.dataSources = dataSources;
    setMapState(mapState);
}

/**
 * Adds a data source to the 3D map, replacing any existing data source with the same UID.
 *
 * @param {addOGCCoverageObject[]} addOGCCoverageObject unique identifier for the layer.
 */
export function addOGCCoverage(addOGCCoverageObject: addOGCCoverageObject[]) {
    const mapState = getMapState();
    let dataSources = mapState.dataSources;
    for (const ogcCoverageObject of addOGCCoverageObject) {
        const option = {
            uid: ogcCoverageObject.uid,
            type: "coverage",
            name: ogcCoverageObject.title,
            description: ogcCoverageObject.description,
            url: ogcCoverageObject.url,
            bounds: ogcCoverageObject.wgs84BoundingBox,
            serviceInfo: ogcCoverageObject.serviceInfo,
            sourceLayerIndex: ogcCoverageObject.sourceLayerIndex,
            id: ogcCoverageObject.id
        };
        dataSources = dataSources.filter(d => d.uid !== ogcCoverageObject.uid);
        dataSources.push(option);
    }
    mapState.dataSources = dataSources;
    setMapState(mapState);
}

export function addGpkg(addGpkgObject: addGpkgObject[]) {
    const mapState = getMapState();
    let imageLayers = mapState.imageLayers;
    for (const gpkgObject of addGpkgObject) {
        const option: csltGpkgOption = {
            uid: gpkgObject.uid,
            name: gpkgObject.name,
            description: gpkgObject.description,
            type: "GPKG",
            gpkgType: gpkgObject.gpkgType,
            gpkgTableName: gpkgObject.table,
            serviceInfo: gpkgObject.serviceInfo,
            tileWidth: gpkgObject.tileWidth,
            tileHeight: gpkgObject.tileHeight,
            bounds: gpkgObject.rect as WGS84BoundingBox,
            matrixDimensions: gpkgObject.zoomDims
        };
        imageLayers = imageLayers.filter(i => i.uid !== gpkgObject.uid);
        imageLayers.push(option);
    }
    mapState.imageLayers = imageLayers;
    setMapState(mapState);
}

/**
 * If the uid exists then the existing layer is removed.
 *
 * @param {string} uid unique identifier for the layer.
 */
export function remove(uid: string) {
    const mapState = getMapState();

    let primitiveLayers = mapState.primitiveLayers;
    primitiveLayers = primitiveLayers.filter(l => l.uid !== uid);

    let imageLayers = mapState.imageLayers;
    imageLayers = imageLayers.filter(l => l.uid !== uid);

    setMapState({
        ...mapState,
        imageLayers: imageLayers,
        primitiveLayers: primitiveLayers
    });
}

/**
 * Return the current map state as json. if the layer dosn't exist then it will load it.
 *
 * @returns {MapState} Return the current map state as json.
 */
export function getMapState(): MapState {
    const mapStateString = localStorage.getItem("cesiumMapState");
    if (mapStateString) {
        const mapState = JSON.parse(mapStateString);
        if (mapState) {
            return mapState;
        }
    }
    //return null;
    return restMap();
}

/**
 * Resets the map to the default state.
 * @returns {JSON | null} return the new map state.
 *
 */
export function restMap() {
    const mapState = getDefaultState();
    if (mapState) {
        setMapState(mapState);
    }
    return mapState;
}

/**
 * Saves the map State.
 *
 * @param {MapState} mapStateJson the new map state as json.
 */
export function setMapState(mapStateJson: MapState) {
    if (mapStateJson) {
        localStorage.cesiumMapState = JSON.stringify(mapStateJson);
    }
}

/**
 * Return the default map state as json. The default State must be fetched first by fetchDefaultMapState.
 *
 * @returns {JSON | null} Return the default map state as json.
 */
export function getDefaultState() {
    const mapStateDefault = localStorage.getItem("cesiumMapStateDefault");
    if (mapStateDefault) {
        const mapState = JSON.parse(mapStateDefault);
        if (mapState) {
            return mapState;
        }
    }
    return null;
}

/**
 * Retrieves the latest version of of the map state from the server using the referrer's url concatenated with
 * a path to WES's DefaultCesiumState servlet. If this fails, it uses the 3D state.json file.
 * @param {*} force
 * @returns {JSON | null} The default Map State from the server.
 */
export async function fetchDefaultMapState(force: boolean) {
    const url = document.referrer;
    const response = await fetch("state.json");
    if (response.status !== 200) {
        console.error("Failed to fetch Default Map State from state.json");
        return;
    }
    if (response.status === 200) {
        try {
            const data = await response.json();
            // handle data
            if (!force || !data) {
                const oldMapState = getDefaultState();
                if (oldMapState) {
                    return oldMapState;
                }
            }
            if (data) {
                localStorage.cesiumMapStateDefault = JSON.stringify(data);
            }
            return data;
        } catch (e) {
            console.log("Failed to load Default Map State from ", url, e);
        }
    } else {
        console.log("Failed to load Default Map State from ", url, " with a status code ", response.status);
    }
}

/**
 * The map state might need to be loaded from the server, calling this method will ensure the map is loaded before performing any actions.
 *
 * @param {boolean} force will force the map state to be loaded from the server.
 * @returns {JSON | null}The Map State after it is loaded which might be from the server.
 */
export async function onLoad(force: boolean) {
    const mapState = getMapState();
    if (!mapState) {
        const result = await fetchDefaultMapState(force);
        const s = getMapState();
        if (s) {
            return s;
        }
        setMapState(result);
        return result;
    } else {
        return mapState;
    }
}

/**
 * Open the 3D Client in a new window.
 */
export function openClient() {
    window.open(
        "/wes/Cesium/WES/3dMap.jsp",
        "3d",
        "menubar=no,location=no,toolbar=no,status=no,directories=no,resizable=yes"
    );
}

/**
 * Raise the map state changed event.
 */
export function raiseMapStateChangedEvent() {
    //const csltRegistry = (window as CesiumWindow).csltWindowRegistry;
    //const cesiumWindow = csltRegistry ? csltRegistry.getWindow("3d") : window;
    const cesiumWindow = window;
    cesiumWindow.dispatchEvent(new Event("mapStateChanged"));
}

/**
 * Raise the map state saved event.
 */
export function raiseMapStateSavedEvent() {
    //const csltRegistry = window.csltWindowRegistry;
    //const cesiumWindow = csltRegistry ? csltRegistry.getWindow("3d") : window;
    const cesiumWindow = window;
    cesiumWindow.dispatchEvent(new Event("mapStateSaved"));
}

/**
 * Raise the map state loaded event.
 */
export function raiseMapStateLoadedEvent() {
    //const csltRegistry = window.csltWindowRegistry;
    //const cesiumWindow = csltRegistry ? csltRegistry.getWindow("3d") : window;
    const cesiumWindow = window;
    cesiumWindow.dispatchEvent(new Event("mapStateLoaded"));
}
