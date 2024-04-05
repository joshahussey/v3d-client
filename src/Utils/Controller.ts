import {
    add3DTilesObject,
    addArcGisWMSObject,
    addCelestialObject,
    addGeoJSONObject,
    addKmlObject,
    addOGCCoverageObject,
    addOGCFeatureObject,
    addOGCMapObject,
    addSensorThingsObject,
    addWMSObject,
    addWMTSObject
} from "../3dMapControllerTypes";
import { MapState, WesImageryObject } from "../types";

/**
 * Adds a WMTS to 3DMap if a layer on top of the imagery if the uid dosn't exist.
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
 * Adds an OGC Maps Layer to 3DMap if a layer on top of the imagery if the uid dosn't exist.
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
 * Adds a WMS to 3DMap if a layer on top of the imagery if the uid dosn't exist.
 * If the uid exists then the existing layer is first removed.
 *
 * @param {addWMSObject[]} addWMSObject
 */
export function addWMS(addWMSObject: addWMSObject[]) {
    const mapState = getMapState();
    let imageLayers = mapState.imageLayers;
    for (const wmsObject of addWMSObject) {
        const option = {
            uid: wmsObject.uid,
            type: "WMS",
            name: wmsObject.title,
            description: wmsObject.abstract ? wmsObject.abstract : wmsObject.title,
            url: wmsObject.url,
            serviceInfo: wmsObject.serviceInfo,
            bounds: wmsObject.wgs84BoundingBox,
            layers: wmsObject.name,
            parameters: {
                transparent: "true",
                format: wmsObject.format
            },
            credit: wmsObject.credit ? wmsObject.credit : "",
            show: false,
            alpha: 1.0
        };
        imageLayers = imageLayers.filter(l => l.uid !== wmsObject.uid);
        imageLayers.push(option);
    }
    mapState.imageLayers = imageLayers;
    setMapState(mapState);
}

/**
 * Adds a ArcGIS MapServer to 3DMap if the uid dosn't exist.
 * If the uid exists then the existing layer is first removed.
 *
 * @param {addArcGisWMSObject[]} addArcGISWMSObject unique identifier for the layer.
 */
export function addArcGisWMS(addArcGISWMSObject: addArcGisWMSObject[]) {
    const mapState = getMapState();
    let imageLayers = mapState.imageLayers;
    for (const arcGisWmsObject of addArcGISWMSObject) {
        const option: WesImageryObject = {
            uid: arcGisWmsObject.uid,
            type: "ArcGis",
            name: arcGisWmsObject.title,
            description: arcGisWmsObject.abstract ? arcGisWmsObject.abstract : arcGisWmsObject.title,
            url: arcGisWmsObject.url,
            serviceInfo: arcGisWmsObject.serviceInfo,
            bounds: arcGisWmsObject.wgs84BoundingBox,
            credit: arcGisWmsObject.credit ? arcGisWmsObject.credit : ""
        };
        imageLayers = imageLayers.filter(l => l.uid !== arcGisWmsObject.uid);
        imageLayers.push(option);
    }
    mapState.imageLayers = imageLayers;
    setMapState(mapState);
}

/**
 * Adds a 3D Tiles to 3DMap if a layer on top of the map primitives if the uid dosn't exist.
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
            sourceLayerIndex: Number(ogcCoverageObject.sourceLayerIndex),
            id: ogcCoverageObject.id
        };
        dataSources = dataSources.filter(d => d.uid !== ogcCoverageObject.uid);
        dataSources.push(option);
    }
    mapState.dataSources = dataSources;
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
 * Retrieves the latest version of of the map state from the server using url stored at 'localStoreage.Default3dMapUrl'.
 * @param {*} force
 * @returns {JSON | null} The default Map State from the server.
 */
export async function fetchDefaultMapState(force: boolean) {
    let url = localStorage.Default3dMapUrl;
    if (!url) {
        url = "state.json";
    }
    const response = await fetch(url);
    console.log(response.status); // 200
    console.log(response.statusText); // OK
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
