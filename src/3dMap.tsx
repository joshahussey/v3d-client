import * as cesium from "cesium";
import CesiumNavigation from "cesium-navigation-es6";
import "../node_modules/cesium/Build/Cesium/Widgets/widgets.css";
import "./CSS/cslt.scss";
import "./CSS/style.scss";
import FeaturesApiDataSource from "./Datasources/FeaturesApiDataSource";
//import SensorThingsDataSource from "./Datasources/SensorThingsDataSource";
import { Accessor, createEffect, createSignal } from "solid-js";
import { render } from "solid-js/web";
import {
    BLUE_TILE_STYLE,
    HOME_POSITION,
    TRANSPARENT_TILE_STYLE,
    WES_3D_EVENTS,
    cesiumBuiltInUID,
    googlePhotorealisticUID,
    wgsEllipsoidUID,
    standAloneLayersServiceLabel,
    standAloneLayersServiceUID,
    standAloneLayersServiceUrl
} from "./Constants";
import { getContextSignals } from "./Context/UIContext";
import CelestialBodyDataSource from "./Datasources/CelestialBodyDataSource";
import CoverageApiDataSource from "./Datasources/CoverageApiDataSource";
import OgcMapsDatasource from "./Datasources/OgcMapsDatasource";
import WesDataSource from "./Datasources/WesDataSource";
import { showEntityProperties } from "./Utils/EntitySelection";
import { applyViewParameters, loadViewParameters, saveViewParameters, zoomToLoadedView } from "./Utils/SaveView";
import {
    CesiumWindow,
    Map3DController,
    MapState,
    Wes3DTileSet,
    WesDataSourceObject,
    WesDatasources,
    WesImageryLayer,
    WesImageryObject,
    WesImageryProvider,
    WesImagerylayers,
    WesPrimitiveObject,
    WesGeoJsonDataSource,
    WesTerrainObject,
    WesWebMapTileServiceImageryProvider
} from "./Wes";
import { createStore } from "solid-js/store";
import { createLiveWmsPeriodString, isLiveWms } from "./Utils/TimeParser";
import FeaturesApiLiveDataSource from "./Datasources/FeaturesApiLiveDatasource";
import { handleAoiEvent } from "./Utils/Aoi";
import { GeoCaUI } from "./UI/GeoCaUI";

const Controller = (window as CesiumWindow).Map3DController;

localStorage.setItem("cesiumOpened", "true");
window.onbeforeunload = function () {
    localStorage.setItem("cesiumOpened", "false");
};

const load = async function (mapState: MapState): Promise<cesium.Viewer> {
    //Setup
    const dataSourcesToBeAdded: Set<WesDataSourceObject> = new Set();
    const imageryLayersToBeAdded: Set<WesImageryObject> = new Set();
    const tilesetsToBeAdded: Set<WesPrimitiveObject> = new Set();
    let addingLayers = false;
    cesium.Ion.defaultAccessToken = mapState.accessToken;
    cesium.GoogleMaps.defaultApiKey = mapState.googleToken;
    let basemapOptions = mapState.baseMapLayers;
    let imageryOptions = mapState.imageLayers;
    let terrainOptions = mapState.terrainSets;
    let dataSourceOptions = mapState.dataSources;
    let primitiveOptions = mapState.primitiveLayers;
    const basemapOption = mapState.baseMapLayers[0];
    const baseImageryProvider = (await getImageryProvider(basemapOption)) as cesium.ImageryProvider;
    const baseImageryLayer = new cesium.ImageryLayer(baseImageryProvider, {});
    const terrainOption = mapState.terrainSets[0];
    // Creates the cesium viewer by binding to the div in 3dMap.jsp
    const clock = new cesium.Clock({
        clockRange: cesium.ClockRange.CLAMPED
    });
    const clockModel = new cesium.ClockViewModel(clock);
    cesium.Camera.DEFAULT_VIEW_RECTANGLE = cesium.Rectangle.fromDegrees(-90, -90, 90, 90);
    const initCameraViewport = localStorage.getItem("initCameraViewport");
    if (initCameraViewport) {
        const rectangleComponents = initCameraViewport.split(",");
        cesium.Camera.DEFAULT_VIEW_RECTANGLE = cesium.Rectangle.fromDegrees(
            Number(rectangleComponents[0]),
            Number(rectangleComponents[1]),
            Number(rectangleComponents[2]),
            Number(rectangleComponents[3])
        );
        localStorage.removeItem("initCameraViewport");
    }

    const viewer = new cesium.Viewer("cesiumContainer", {
        baseLayer: baseImageryLayer,
        homeButton: false,
        fullscreenButton: true,
        baseLayerPicker: false,
        animation: false,
        timeline: false,
        geocoder: false,
        vrButton: false,
        infoBox: true,
        navigationHelpButton: false,
        sceneModePicker: false,
        clockViewModel: clockModel
    });

    cesium.Camera.DEFAULT_VIEW_RECTANGLE = cesium.Rectangle.fromDegrees(-90, -90, 90, 90);

    (window as CesiumWindow).Map3DViewer = viewer;
    viewer.scene.globe.depthTestAgainstTerrain = true;
    const primitiveLayers = viewer.scene.primitives;
    const [osmBuildingsLayer, setOsmBuildingsLayer] = createSignal("", {
        equals: false
    });
    chooseTerrainSet(terrainOption);
    const cesiumToolbar = document.querySelector(".cesium-viewer-toolbar") as HTMLDivElement;
    if (cesiumToolbar) cesiumToolbar.style.display = "none";
    viewer.scene.moon = new cesium.Moon();
    viewer.scene.sun = new cesium.Sun();
    const navOptions = {
        defaultResetView: cesium.Rectangle.fromDegrees(80, 22, 130, 50),
        enableCompass: true,
        enableZoomControls: true,
        enableDistanceLegend: true,
        enableCompassOuterRing: true
    };
    new CesiumNavigation(viewer, navOptions);
    viewer.selectedEntityChanged.addEventListener(showEntityProperties);
    const dataSourceLayers = viewer.dataSources;
    const imageryLayers = viewer.imageryLayers;

    //Create Context
    const [selectedLayer, setSelectedLayer] = createSignal(baseImageryLayer);
    const [selectedTerrain, setSelectedTerrain] = createSignal(terrainOption);
    const [imageLayers, setImageLayers] = createSignal([] as WesImageryLayer[], {
        equals: false
    });
    const [tileSets, setTileSets] = createSignal([] as Wes3DTileSet[]);
    const [baseLayers, setBaseLayers] = createSignal([] as WesImageryLayer[], {
        equals: false
    });
    const [datasources, setDatasources] = createSignal([] as WesDataSource[], {
        equals: false
    });
    const [terrainSets, setTerrainSets] = createSignal([] as WesTerrainObject[]);
    const [optionsMap, setOptionsMap] = createSignal(new Map(), {
        equals: false
    });
    (window as CesiumWindow).optionsMap = optionsMap;
    const [selectedTerrainSet, setSelectedTerrainSet] = createSignal([] as WesTerrainObject[], {
        equals: false
    });
    const [selectedHome, setSelectedHome] = createSignal(HOME_POSITION);
    const [timeMap, setTimeMap] = createSignal(new Map(), { equals: false });
    (window as CesiumWindow).timeMap = timeMap;
    (window as CesiumWindow).setTimeMap = setTimeMap;
    const [displayClock, setDisplayClock] = createSignal(false);
    const [clockStore, setClockStore] = createStore(viewer.clock);
    const [sourcesWithLegends, setSourcesWithLegends] = createSignal([], {
        equals: false
    });
    (window as CesiumWindow).sourcesWithLegends = sourcesWithLegends;
    (window as CesiumWindow).setSourcesWithLegends = setSourcesWithLegends;
    cesium.GeoJsonDataSource.clampToGround = true;

    (window as any).fireBroadcastEvent = (event: any, eventId: any, hasPayload: any) => {
        if (!WES_3D_EVENTS.has(eventId)) return;

        if (eventId === "net.compusult.wes.client.cesium.Wes3dAoiEvent") {
            handleAoiEvent(event);
        }
    };

    //Scope Listeners
    const removeSignal = new AbortController();

    //Main
    await setupLayers();
    syncDatasources();
    syncImageryLayers();
    syncPrimitiveLayers();
    addChangeListeners();
    saveViewParameters(viewer, optionsMap);
    loadViewParameters();

    //Helper Functions
    function addChangeListeners() {
        viewer.dataSources.dataSourceRemoved.addEventListener(() => {
            syncDatasources();
        }, removeSignal);
        viewer.dataSources.dataSourceAdded.addEventListener(() => {
            syncDatasources();
        }, removeSignal);
        viewer.dataSources.dataSourceMoved.addEventListener(() => {
            syncDatasources();
        }, removeSignal);
        viewer.imageryLayers.layerRemoved.addEventListener(() => {
            syncImageryLayers();
        }, removeSignal);
        viewer.imageryLayers.layerAdded.addEventListener(() => {
            syncImageryLayers();
        }, removeSignal);
        viewer.imageryLayers.layerMoved.addEventListener(() => {
            syncImageryLayers();
        }, removeSignal);
        window.addEventListener(
            "tilesetAdded",
            () => {
                syncPrimitiveLayers();
            },
            removeSignal
        );
        window.addEventListener(
            "tilesetRemoved",
            () => {
                syncPrimitiveLayers();
            },
            removeSignal
        );
        window.addEventListener("mapStateSaved", () => {
            saveViewParameters(viewer, optionsMap);
        });
        window.addEventListener("mapStateLoaded", () => {
            loadViewParameters();
            zoomToLoadedView(viewer);
        });
        window.addEventListener("mapStateChanged", async () => {
            const currentDatasourceOptions = mapState.dataSources.slice().map(datasource => datasource.uid);
            const currentImageryOptions = mapState.imageLayers.slice().map(imagery => imagery.uid);
            const currentTilesetOptions = mapState.primitiveLayers.slice().map(tileset => tileset.uid);
            getLayerStates();

            //Make a copy of the correct mapState, since adding/removing/modifying layers will change it.
            const correctMapStateImageLayersCopy = mapState.imageLayers.slice();

            mapState.dataSources.forEach(datasource => {
                if (!(datasource.uid in currentDatasourceOptions)) {
                    dataSourcesToBeAdded.add(datasource);
                }
            });
            mapState.imageLayers.forEach(imagery => {
                if (!(imagery.uid in currentImageryOptions)) {
                    imageryLayersToBeAdded.add(imagery);
                }
            });
            mapState.primitiveLayers.forEach(tileset => {
                if (!(tileset.uid in currentTilesetOptions)) {
                    tilesetsToBeAdded.add(tileset);
                }
            });
            if (!addingLayers) {
                await addLayers(viewer, optionsMap);
            }
            const initialMapStateDataSources = mapState.dataSources.slice();
            currentDatasourceOptions.forEach((uid: string) => {
                let remove = true;
                for (let i = 0; i < initialMapStateDataSources.length; i++) {
                    if (initialMapStateDataSources[i].uid === uid) {
                        remove = false;
                        break;
                    }
                }
                if (remove) {
                    for (let i = 0; i < (viewer.dataSources as WesDatasources)._dataSources.length; i++) {
                        const dataSource = (viewer.dataSources as WesDatasources)._dataSources[i];
                        if (dataSource.uid === uid) {
                            if (dataSource instanceof CoverageApiDataSource) {
                                (window as CesiumWindow).Map3DViewer.scene.primitives.remove(
                                    dataSource._renderedPrimitive
                                );
                                (window as CesiumWindow).removeEventListener("timeChanged", dataSource._listener);
                                dataSource._removed = true;
                                dataSource._renderedPrimitive = undefined;
                                if (dataSource._hasLegend) {
                                    setSourcesWithLegends(
                                        sourcesWithLegends().filter((source: any) => source.uid !== dataSource.uid)
                                    );
                                }
                                (window as CesiumWindow).Map3DViewer.dataSources.remove(dataSource, true);
                                window.dispatchEvent(new Event("tilesetRemoved"));
                            } else {
                                viewer.dataSources.remove(dataSource);
                            }
                            break;
                        }
                    }
                }
            });
            const initialMapStateImageLayers = mapState.imageLayers.slice();
            currentImageryOptions.forEach((uid: string) => {
                let remove = true;
                for (let i = 0; i < initialMapStateImageLayers.length; i++) {
                    if (initialMapStateImageLayers[i].uid === uid) {
                        remove = false;
                        break;
                    }
                }
                if (remove) {
                    for (let i = 0; i < (viewer.imageryLayers as WesImagerylayers)._layers.length; i++) {
                        if ((viewer.imageryLayers as WesImagerylayers)._layers[i].uid === uid) {
                            viewer.imageryLayers.remove(viewer.imageryLayers.get(i));
                            break;
                        }
                    }
                }
            });
            const initialMapStatePrimitiveLayers = mapState.primitiveLayers.slice();
            currentTilesetOptions.forEach((uid: string) => {
                let remove = true;
                for (let i = 0; i < initialMapStatePrimitiveLayers.length; i++) {
                    if (initialMapStatePrimitiveLayers[i].uid === uid) {
                        remove = false;
                        break;
                    }
                }
                if (remove) {
                    for (let i = 0; i < tileSets().length; i++) {
                        if (tileSets()[i].uid === uid) {
                            viewer.scene.primitives.remove(tileSets()[i]);
                            window.dispatchEvent(new Event("tilesetRemoved"));
                            break;
                        }
                    }
                }
            });

            /*
             * Using the original mapState copy we made, compare each one with the corresponding viewer.ImageryLayers
             * Starting from the highest index mapState layer, if they dont match the index in viewer.imageryLayers,
             * raise the imageryLayer until it does match.
             */
            for (let i = correctMapStateImageLayersCopy.length - 1; i >= 0; i--) {
                for (let j = viewer.imageryLayers.length - 1; j >= 0; j--) {
                    //Don't change layer index of the basemap.
                    if (correctMapStateImageLayersCopy[i].uid === (selectedLayer() as WesImageryLayer).uid) {
                        continue;
                    }
                    if (
                        correctMapStateImageLayersCopy[i].uid === (viewer.imageryLayers.get(j) as WesImageryLayer).uid
                    ) {
                        const layer = viewer.imageryLayers.get(j);
                        while (
                            i >= viewer.imageryLayers.indexOf(layer) && 
                            viewer.imageryLayers.indexOf(layer) != -1 && 
                            viewer.imageryLayers.indexOf(layer) < viewer.imageryLayers.length - 1
                        ) {
                            if (correctMapStateImageLayersCopy.length != viewer.imageryLayers.length) break;
                            viewer.imageryLayers.raise(layer);
                        }
                    }
                }
            }
        });
    }

    function syncDatasources() {
        const datasourcesSet: Set<WesDataSource> = new Set((dataSourceLayers as WesDatasources)._dataSources);
        setDatasources(Array.from(datasourcesSet));
        for (const source of optionsMap().keys()) {
            if (source instanceof WesDataSource) {
                if (!datasources().includes(source)) {
                    optionsMap().delete(source);
                    if (timeMap().has(source.uid)) {
                        const tempTimeMap = timeMap();
                        tempTimeMap.delete(source.uid);
                        setTimeMap(tempTimeMap);
                    }
                }
            }
        }

        const mapStateOptions: Set<WesDataSourceObject> = new Set();
        const map = optionsMap();
        const sources = datasources();
        sources.forEach(datasource => {
            for (const option of map.values()) {
                if (option.uid === datasource.uid) {
                    mapStateOptions.add(option);
                    return;
                }
            }
        });
        mapState.dataSources = Array.from(mapStateOptions);
        Controller.setMapState(mapState);
    }

    function syncImageryLayers() {
        const imageryLayerSet: Set<WesImageryLayer> = new Set((imageryLayers as WesImagerylayers)._layers.slice());
        imageryLayerSet.forEach(layer => {
            baseLayers().forEach(baseLayer => {
                if (layer.uid === baseLayer.uid) {
                    imageryLayerSet.delete(layer);
                }
            });
        });
        setImageLayers(Array.from(imageryLayerSet));
        for (const source of optionsMap().keys()) {
            let inBaseLayers = false;
            let inImageLayers = false;
            for (const layer of baseLayers()) {
                if (layer.uid === source.uid) {
                    inBaseLayers = true;
                    break;
                }
            }
            for (const layer of imageLayers()) {
                if (layer.uid === source.uid) {
                    inImageLayers = true;
                    break;
                }
            }
            if (source instanceof cesium.ImageryLayer && inBaseLayers === false && inImageLayers === false) {
                optionsMap().delete(source);
                if (timeMap().has(source.uid)) {
                    const tempTimeMap = timeMap();
                    tempTimeMap.delete(source.uid);
                    setTimeMap(tempTimeMap);
                }
            }
        }

        const mapStateOptions: Set<WesImageryObject> = new Set();
        const map = optionsMap();
        const sources = imageLayers();
        sources.forEach(imageryLayer => {
            for (const option of map.values()) {
                if (option.uid === imageryLayer.uid && basemapOptions.includes(option) === false) {
                    mapStateOptions.add(option);
                    return;
                }
            }
        });
        const stateLayers = Array.from(mapStateOptions);
        stateLayers.push(map.get(selectedLayer()));
        mapState.imageLayers = stateLayers;
        Controller.setMapState(mapState);
    }

    function syncPrimitiveLayers() {
        const primitivesLayersArray: Wes3DTileSet[] = (viewer.scene.primitives as any)._primitives.slice();
        const filteredPrimitivesArray: Wes3DTileSet[] = [];
        primitivesLayersArray.forEach((layer: Wes3DTileSet) => {
            if (layer instanceof cesium.Cesium3DTileset) {
                if (layer.name === "google") return;
                filteredPrimitivesArray.push(layer);
            }
        });
        setTileSets(filteredPrimitivesArray);
        for (const source of optionsMap().keys()) {
            if (source instanceof cesium.Cesium3DTileset) {
                if (!tileSets().includes(source as Wes3DTileSet)) {
                    optionsMap().delete(source);
                }
            }
        }

        const mapStateOptions: Set<WesPrimitiveObject> = new Set();
        const map = optionsMap();
        const sources = tileSets();
        sources.forEach(tileset => {
            for (const option of map.values()) {
                if (option.uid === tileset.uid) {
                    mapStateOptions.add(option);
                    return;
                }
            }
        });
        mapState.primitiveLayers = Array.from(mapStateOptions);
        Controller.setMapState(mapState);
    }

    function reorderBaseMapOptions(layer: WesImageryLayer) {
        for (let i = 0; i < basemapOptions.length; i++) {
            if (layer.uid === basemapOptions[i].uid) {
                const previousOption = basemapOptions.splice(i, 1);
                basemapOptions.unshift(previousOption[0]);
                break;
            }
        }
        mapState.baseMapLayers = basemapOptions;
        Controller.setMapState(mapState);
    }

    async function getLayerStates() {
        mapState = Controller.getMapState();
        imageryOptions = mapState.imageLayers;
        basemapOptions = mapState.baseMapLayers;
        dataSourceOptions = mapState.dataSources;
        primitiveOptions = mapState.primitiveLayers;
        terrainOptions = mapState.terrainSets;
    }

    /**
     * Load initial state when opening client
     */
    async function setupLayers() {
        // Create all the base layers
        for (let i = 0; i < basemapOptions.length; i++) {
            addBaseLayerOption(basemapOptions[i]);
        }
        // Create the additional imagery layers
        for (let i = 0; i < imageryOptions.length; i++) {
            addAdditionalLayerOption(imageryOptions[i]);
        }
        // Create the additional primitives currently only supports 3D_TILES
        const primitiveOptions = mapState.primitiveLayers;
        for (let i = 0; i < primitiveOptions.length; i++) {
            await add3dTiles(primitiveOptions[i]);
        }
        const dataSourceOptions = mapState.dataSources;
        for (let i = 0; i < dataSourceOptions.length; i++) {
            await addDataSource(dataSourceOptions[i]);
        }
        const terrainOptions = mapState.terrainSets;
        for (let i = 0; i < terrainOptions.length; i++) {
            addTerrainSets(terrainOptions[i]);
        }
    }

    /**
     * Add a new layer to the already opened client
     */
    async function addLayers(viewer?: cesium.Viewer, optionsMap?: any) {
        addingLayers = true;
        while (dataSourcesToBeAdded.size > 0) {
            const layerOptions = dataSourcesToBeAdded.values();
            const layerOption = layerOptions.next().value;
            if (checkIfLayerExists(layerOption)) {
                dataSourcesToBeAdded.delete(layerOption);
                continue;
            }
            await addDataSource(layerOption);
            dataSourcesToBeAdded.delete(layerOption);
        }
        while (imageryLayersToBeAdded.size > 0) {
            const layerOptions = imageryLayersToBeAdded.values();
            const layerOption = layerOptions.next().value;
            if (checkIfLayerExists(layerOption)) {
                imageryLayersToBeAdded.delete(layerOption);
                continue;
            }
            await addAdditionalLayerOption(layerOption);
            imageryLayersToBeAdded.delete(layerOption);
        }
        while (tilesetsToBeAdded.size > 0) {
            const layerOptions = tilesetsToBeAdded.values();
            const layerOption = layerOptions.next().value;
            if (checkIfLayerExists(layerOption)) {
                tilesetsToBeAdded.delete(layerOption);
                continue;
            }
            await add3dTiles(layerOption);
            tilesetsToBeAdded.delete(layerOption);
        }
        if (dataSourcesToBeAdded.size > 0 || imageryLayersToBeAdded.size > 0 || tilesetsToBeAdded.size > 0) {
            if (optionsMap != null && viewer != null) {
                addLayers(viewer, optionsMap);
            } else {
                addLayers();
            }
        }
        addingLayers = false;
        if (optionsMap != null && viewer != null) {
            applyViewParameters(viewer, optionsMap);
        }

        // Null check as this won't exist the first time load is called -- it's set in ExpandedMenu.tsx
        (window as any).setCatalogOpen?.(false);
    }

    /**
     * Method for adding base maps to the map.
     *
     * @param {*} option  Json object stored in the session for a imagery layer.
     */
    async function addBaseLayerOption(option: WesImageryObject): Promise<void> {
        for (let i = 0; i < baseLayers().length; i++) {
            if (baseLayers()[i].uid === option.uid) return;
        }
        // if (
        //     (imageryLayers as WesImagerylayers)._layers
        //         .map((layer) => layer.uid).includes((selectedLayer() as WesImageryLayer).uid)
        // ) {}
        let layer;
        if (option.uid === basemapOption.uid) {
            layer = imageryLayers.get(0) as WesImageryLayer;
            layer.name = option.name;
            layer.uid = option.uid;
            setSelectedLayer(layer);
        } else {
            layer = cesium.ImageryLayer.fromProviderAsync(await getImageryProvider(option), {});
            (layer as WesImageryLayer).name = option.name;
            (layer as WesImageryLayer).uid = option.uid;
        }
        const baseLayerArray = baseLayers();
        baseLayerArray.push(layer as WesImageryLayer);
        setBaseLayers(baseLayerArray);
        optionsMap().set(layer, option);
    }

    function addTerrainSets(option: WesTerrainObject) {
        for (let i = 0; i < terrainSets().length; i++) {
            const terrain = terrainSets()[i];
            if (terrain.name === option.name) {
                return;
            }
        }
        terrainSets().push(option);
    }

    async function chooseTerrainSet(terrainSet: WesTerrainObject) {
        const terrainUID = terrainSet.uid;

        const osmLayerId = osmBuildingsLayer();
        let osmLayer = null;
        for (let i = 0; i < primitiveLayers.length; i++) {
            const layer = primitiveLayers.get(i);
            if (layer.uid === osmLayerId) {
                osmLayer = layer;
                break;
            }
        }

        let isGooglePhotorealistic = false;

        switch (terrainUID) {
            case wgsEllipsoidUID: {
                (viewer.scene.primitives as any)._primitives.forEach(function (primitive: Wes3DTileSet) {
                    if ((primitive as any)._url && (primitive as any)._url.includes("google")) {
                        primitive.show = false;
                    }
                });
                viewer.scene.globe.translucency.enabled = false;
                viewer.terrainProvider = new cesium.EllipsoidTerrainProvider();

                break;
            }
            case cesiumBuiltInUID: {
                (viewer.scene.primitives as any)._primitives.forEach(function (primitive: Wes3DTileSet) {
                    if ((primitive as any)._url && (primitive as any)._url.includes("google")) {
                        primitive.show = false;
                    }
                });
                viewer.scene.globe.translucency.enabled = false;
                viewer.terrainProvider = await cesium.createWorldTerrainAsync();
                break;
            }
            case googlePhotorealisticUID: {
                isGooglePhotorealistic = true;
                viewer.scene.globe.translucency.enabled = true;
                viewer.scene.globe.translucency.backFaceAlpha = 0;
                viewer.scene.globe.translucency.frontFaceAlpha = 0;
                const tileset = (await cesium.createGooglePhotorealistic3DTileset()) as Wes3DTileSet;
                tileset.name = "google";
                primitiveLayers.add(tileset);

                if (osmLayer && !osmLayer.show) {
                    osmLayer.style = TRANSPARENT_TILE_STYLE;
                    osmLayer.show = true;
                }
                break;
            }
            default: {
                (viewer.scene.primitives as any)._primitives.forEach(function (primitive: Wes3DTileSet) {
                    if ((primitive as any)._url && primitive._url.includes("google")) {
                        primitive.show = false;
                    }
                });
                viewer.scene.globe.translucency.enabled = false;
                viewer.terrainProvider = await cesium.CesiumTerrainProvider.fromUrl(terrainSet.url);
            }
        }

        if (!isGooglePhotorealistic && osmLayer && osmLayer.style == TRANSPARENT_TILE_STYLE) {
            osmLayer.style = BLUE_TILE_STYLE;
            osmLayer.show = false;
        }

        if (terrainSets()[0]) {
            if (terrainSets()[0].uid !== terrainUID) {
                const terrainSetsArray = terrainSets();
                for (let i = 0; i < terrainSetsArray.length; i++) {
                    const terrainOption = terrainSetsArray[i];
                    if (terrainOption.name === terrainSet.name) {
                        const newTerrain = terrainSetsArray.splice(i, 1);
                        terrainSetsArray.unshift(newTerrain[0]);
                        break;
                    }
                }
                mapState.terrainSets = terrainSetsArray;
                Controller.setMapState(mapState);
                setTerrainSets(terrainSetsArray);
            }
        }
        return;
    }

    /**
     * Method for getting ImageryProvider from the Json object stored in the session.
     *
     * @param {*} option Json object stored in the session for a imagery layer.
     * @returns ImageryProvider for the provided json.
     */
    async function getImageryProvider(option: WesImageryObject): Promise<WesImageryProvider | null> {
        let bounds;
        if (option.bounds != undefined) {
            bounds = cesium.Rectangle.fromDegrees(
                option.bounds.minX,
                option.bounds.minY,
                option.bounds.maxX,
                option.bounds.maxY,
            )
        }
        if (option.type === "WMTS") {
            const resource = new cesium.Resource({ url: option.url });
            return new cesium.WebMapTileServiceImageryProvider({
                url: resource,
                //name: option.name,
                layer: option.layer,
                style: option.style,
                format: option.format,
                tileMatrixSetID: option.tileMatrixSetID,
                maximumLevel: option.maximumLevel,
                credit: option.credit
            }) as WesWebMapTileServiceImageryProvider;
        }
        if (option.type === "ArcGis") {
            //return new ArcGisMapServerImageryProvider({
            //    url: option.url,
            //    //name: option.name,
            //    credit: option.credit,
            //});
            return await cesium.ArcGisMapServerImageryProvider.fromUrl(option.url, {
                ellipsoid: cesium.Ellipsoid.WGS84,
                credit: option.credit
            });
        }
        if (option.type === "WMS") {
            const isTemporal = await isLiveWms(option.name, option.url);
            if (isTemporal) {
                const wmsDescriptor = await createLiveWmsPeriodString(option.name);
                const dataCallback = (interval: any, index: number) => {
                    let time;
                    if (index === 0) {
                        time = cesium.JulianDate.toIso8601(interval.stop);
                    } else {
                        time = cesium.JulianDate.toIso8601(interval.start);
                    }
                    return {
                        Time: time
                    };
                };
                const times = cesium.TimeIntervalCollection.fromIso8601({
                    iso8601: wmsDescriptor.iso8601,
                    leadingInterval: true,
                    trailingInterval: true,
                    isStopIncluded: false,
                    dataCallback: dataCallback
                });
                const tempMap = timeMap();
                tempMap.set(option.uid, [
                    cesium.JulianDate.fromDate(wmsDescriptor.start),
                    cesium.JulianDate.fromDate(wmsDescriptor.end)
                ]);
                setTimeMap(tempMap);
                return new cesium.WebMapServiceImageryProvider({
                    url: option.url,
                    //name: option.name,
                    layers: option.layers,
                    parameters: option.parameters,
                    tileHeight: 4000,
                    tileWidth: 4000,
                    credit: option.credit,
                    clock: viewer.clock,
                    times: times,
                    enablePickFeatures: false,
                    rectangle: bounds
                });
            }
            return new cesium.WebMapServiceImageryProvider({
                url: option.url,
                //name: option.name,
                layers: option.layers,
                parameters: option.parameters,
                credit: option.credit,
                enablePickFeatures: false,
                rectangle: bounds
            });
        }
        if (option.type === "CesiumBuiltin") {
            switch (option.cesiumBuiltinType) {
                case "bingMaps":
                    return cesium.createWorldImageryAsync({ style: cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS });

                case "ionResource":
                    return new cesium.IonImageryProvider({
                        assetId: option.IonResourceAssetId
                    } as any);

                default:
                    throw "Error: Unrecognized Cesium builtin option";
            }
        }
        return null;
    }

    /**
     * Method for adding 3D Tiles to the map.
     *
     * @param {*} option Json object stored in the session for a tileset layer.
     */
    async function add3dTiles(option: WesPrimitiveObject) {
        for (let i = 0; i < primitiveLayers.length; i++) {
            const layer = primitiveLayers.get(i);
            if (layer.uid && layer.uid === option.uid) {
                return;
            }
        }
        let tileset;
        if (option?.name === "Open Street Map Buildings") {
            tileset = primitiveLayers.add(await cesium.createOsmBuildingsAsync());
            tileset.style = BLUE_TILE_STYLE;
            tileset.serviceInfo = {
                serviceId: standAloneLayersServiceUID,
                serviceTitle: standAloneLayersServiceLabel,
                serviceUrl: standAloneLayersServiceUrl
            };
            setOsmBuildingsLayer(option.uid);
        } else {
            tileset = primitiveLayers.add(await cesium.Cesium3DTileset.fromUrl(option.url));
            tileset.serviceInfo = {
                serviceId: option.serviceInfo?.serviceId,
                serviceTitle: option.serviceInfo?.serviceTitle,
                serviceUrl: option.serviceInfo?.serviceUrl
            };
        }

        tileset.name = option.name;
        // if (option.type !== "DigitalTwin") {
        //     viewer.zoomTo(
        //         tileset,
        //         new HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius * 4.0)
        //     );
        // }
        tileset.uid = option.uid;
        optionsMap().set(tileset, option);
        window.dispatchEvent(new Event("tilesetAdded"));
    }

    /**
     * Method for adding imagery layers to the map.
     *
     * @param *} imageryOption Json object stored in the session for a imagery layer.
     */
    async function addAdditionalLayerOption(imageryOption: WesImageryObject) {
        const baseLayerArray = baseLayers();
        for (let i = 0; i < baseLayerArray.length; i++) {
            if (baseLayerArray[i].uid === imageryOption.uid) {
                return;
            }
        }
        let layer = null;
        if (imageryOption.type === "OgcMap") {
            const createdDatasource = new OgcMapsDatasource(
                imageryOption.description,
                imageryOption.name,
                imageryOption.url,
                viewer,
                imageryOption.uid,
                imageryOption.bounds,
                imageryOption.serviceInfo = {
                    serviceId: imageryOption.serviceInfo?.serviceId,
                    serviceTitle: imageryOption.serviceInfo?.serviceTitle,
                    serviceUrl: imageryOption.serviceInfo?.serviceUrl
                }
            );
            layer = cesium.ImageryLayer.fromProviderAsync(createdDatasource.provider as any, {});
        } else {
            if (imageryOption.uid === basemapOption.uid) {
                layer = imageryLayers.get(0);
                imageryLayers.remove(layer, false);
            } else {
                const provider = await getImageryProvider(imageryOption);
                layer = cesium.ImageryLayer.fromProviderAsync(provider, {});
            }
        }
        layer.alpha = 1;
        layer.show = true;
        (layer as WesImageryLayer).name = imageryOption.name;
        (layer as WesImageryLayer).uid = imageryOption.uid;
        (layer as WesImageryLayer).serviceInfo = {
            serviceId: imageryOption.serviceInfo?.serviceId,
            serviceTitle: imageryOption.serviceInfo?.serviceTitle,
            serviceUrl: imageryOption.serviceInfo?.serviceUrl
        };
        const map = optionsMap();
        map.set(layer, imageryOption);
        setOptionsMap(map);
        imageryLayers.add(layer);
        imageryLayers.raiseToTop(layer);
    }

    /**
     * Method for adding data sources to the map.
     *
     * @param {*} dataSourceOption Json object stored in the session for a data source
     */
    async function addDataSource(dataSourceOption: WesDataSourceObject) {
        for (const source of optionsMap().keys()) {
            if (source.uid === dataSourceOption.uid) return;
        }
        let type = dataSourceOption.type;
        if (type) type = type.toLowerCase();
        let createdDataSource;
        let serviceInfo;
        switch (type) {
            //case "sensorthings":
            //  createdDataSource = new SensorThingsDataSource(
            //    dataSourceOption.description,
            //    dataSourceOption.name,
            //    dataSourceOption.url,
            //    viewer,
            //    dataSourceOption.uid
            //  );
            //  break;
            case "feature":
                {
                    //const temporal = await isLiveFeatures(dataSourceOption.url);
                    const temporal = false;
                    if (temporal) {
                        createdDataSource = new FeaturesApiLiveDataSource(
                            dataSourceOption.description,
                            dataSourceOption.name,
                            dataSourceOption.url,
                            viewer,
                            dataSourceOption.uid,
                            temporal as JSON,
                            dataSourceOption.serviceInfo
                        );
                        break;
                    }
                }
                createdDataSource = new FeaturesApiDataSource(
                    dataSourceOption.description,
                    dataSourceOption.name,
                    dataSourceOption.url,
                    viewer,
                    dataSourceOption.uid,
                    dataSourceOption.serviceInfo
                );
                break;

            case "celestial":
                if (!dataSourceOption.serviceInfo) {
                    serviceInfo = {
                        serviceTitle: standAloneLayersServiceLabel,
                        serviceId: standAloneLayersServiceUID,
                        serviceUrl: standAloneLayersServiceUrl
                    };
                } else {
                    serviceInfo = dataSourceOption.serviceInfo;
                }
                createdDataSource = new CelestialBodyDataSource(
                    dataSourceOption.description,
                    dataSourceOption.name,
                    dataSourceOption.url,
                    viewer,
                    dataSourceOption.uid,
                    serviceInfo
                );
                createdDataSource.show = false;
                break;
            case "geojson":
                if (dataSourceOption.url != null && dataSourceOption.url != undefined) {
                    createdDataSource = new cesium.GeoJsonDataSource(dataSourceOption.name);
                    createdDataSource.load(dataSourceOption.url);
                    createdDataSource.clustering.enabled = true;
                    (createdDataSource as WesGeoJsonDataSource).serviceInfo = {
                        serviceId: dataSourceOption.serviceInfo?.serviceId,
                        serviceTitle: dataSourceOption.serviceInfo?.serviceTitle,
                        serviceUrl: dataSourceOption.serviceInfo?.serviceUrl
                    };
                }
                break;
            case "coverage":
                createdDataSource = new CoverageApiDataSource(
                    dataSourceOption.description,
                    dataSourceOption.name,
                    dataSourceOption.url,
                    viewer,
                    dataSourceOption.id,
                    dataSourceOption.sourceLayerIndex!,
                    dataSourceOption.uid,
                    dataSourceOption.bounds,
                    dataSourceOption.serviceInfo
                );
                createdDataSource._name = `${dataSourceOption.name}`;
                break;
            case null:
                throw `Error: Datasource type is null`;
            default:
                throw `Error: Unrecognized data source type: ${dataSourceOption.type}`;
        }
        if (createdDataSource != undefined) {
            const map = optionsMap();
            map.set(createdDataSource, dataSourceOption);
            setOptionsMap(map);
            await dataSourceLayers.add(createdDataSource as cesium.DataSource);
        }
    }

    function checkIfLayerExists(layerOption: WesImageryLayer) {
        for (const option of optionsMap().values()) {
            if (option.uid === layerOption.uid) {
                return true;
            }
        }
        return false;
    }

    //Toolbar element
    function App() {
        getContextSignals(
            baseLayers,
            setBaseLayers,
            selectedLayer as Accessor<WesImageryLayer>,
            setSelectedLayer,
            datasources,
            setDatasources,
            imageLayers,
            setImageLayers,
            terrainSets,
            setTerrainSets,
            selectedTerrain,
            setSelectedTerrain,
            tileSets,
            setTileSets,
            selectedHome,
            setSelectedHome,
            timeMap,
            setTimeMap,
            displayClock,
            setDisplayClock,
            clockStore,
            setClockStore,
            sourcesWithLegends,
            setSourcesWithLegends,
            osmBuildingsLayer,
            setOsmBuildingsLayer
        );
        //Create Effects
        createEffect(() => {
            const previousLayer = imageryLayers.get(0);
            if ((previousLayer as WesImageryLayer).uid === (selectedLayer() as WesImageryLayer).uid) return;
            reorderBaseMapOptions(selectedLayer() as WesImageryLayer);
            imageryLayers.remove(previousLayer, false);
            imageryLayers.add(selectedLayer(), 0);
            imageryLayers.lowerToBottom(selectedLayer());
        });

        createEffect(() => {
            chooseTerrainSet(selectedTerrain());
        });

        createEffect(() => {
            //iterate through map for highest and lowest times
            const timeValues = Array.from(timeMap().values());
            if (timeValues.length == 0) {
                setDisplayClock(false);
                setClockStore({ startTime: undefined, stopTime: undefined });
            } else {
                let startTime;
                let stopTime;
                setDisplayClock(true);
                for (let i = 0; i < timeValues.length; i++) {
                    if (i === 0) {
                        startTime = timeValues[i][0];
                        stopTime = timeValues[i][1];
                    } else {
                        if (timeValues[i][0] < startTime) {
                            startTime = timeValues[i][0];
                        }
                        if (timeValues[i][1] > stopTime) {
                            stopTime = timeValues[i][1];
                        }
                    }
                }
                setClockStore({ startTime: startTime, stopTime: stopTime });
            }
        });

        //Create Toolbar Buttons
        return (<GeoCaUI />);
    }
    render(App, document.getElementById("WesUserInterface")!);

    return viewer;
};

////////////////////////////////////////////// Initialize Map //////////////////////////////////////////////
(Controller as Map3DController).onLoad().then(async (mapState: MapState) => {
    //The loading indicator that is removed when the map is loaded
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay !== null) {
        loadingOverlay.remove();
    }
    //Render the Map
    await load(mapState);
});
