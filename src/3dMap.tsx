import CesiumNavigation from "cesium-navigation-es6";
import "../node_modules/cesium/Build/Cesium/Widgets/widgets.css";
import "./CSS/cslt.scss";
import "./CSS/style.scss";
import FeaturesApiDataSource from "./Datasources/FeaturesApiDataSource";
import SensorThingsDataSource from "./Datasources/SensorThingsDataSource";
import { Accessor, createEffect, createSignal } from "solid-js";
import { render } from "solid-js/web";
import {
    BLUE_TILE_STYLE,
    HOME_POSITION,
    TRANSPARENT_TILE_STYLE,
    cesiumBuiltInUID,
    googlePhotorealisticUID,
    wgsEllipsoidUID,
    standAloneLayersServiceLabel,
    standAloneLayersServiceUID,
    standAloneLayersServiceUrl,
    DEFAULT_ALLOWED_ZOOM_DISTANCE
} from "./Constants";
import { getContextSignals, LoadingRequestCode } from "./Context/UIContext";
import CelestialBodyDataSource from "./Datasources/CelestialBodyDataSource";
import CoverageApiDataSource from "./Datasources/CoverageApiDataSource";
import OgcMapsDatasource from "./Datasources/OgcMapsDatasource";
import WesDataSource from "./Datasources/WesDataSource";
import { showEntityProperties } from "./Utils/EntitySelection";
import { applyViewParameters, loadViewParameters, saveViewParameters, zoomToLoadedView } from "./Utils/SaveView";
import {
    CesiumWindow,
    MapState,
    Wes3DTileSet,
    WesDataSourceObject,
    WesDatasources,
    WesImageryLayer,
    WesImageryObject,
    WesImageryProvider,
    WesImagerylayers,
    WesPrimitiveObject,
    WesTerrainObject,
    WesWebMapTileServiceImageryProvider,
    LegendSource,
    WesGeoJsonDataSource,
    WesKmlDataSource,
    WesLayerPropertiesObject,
    Wes3dMapLayer,
    csltWMTSOption,
    csltWMSOption,
    csltCesiumBuiltInOption,
    csltOGCFeatureOption,
    csltOGCCoverageOption,
    csltGpkgOption,
    csltArcGISWMSOption,
    csltOGCMapOption,
    csltCOGOption
} from "./Types/types";
import { getMapState, onLoad, setMapState } from "./Utils/Controller";
import { createStore } from "solid-js/store";
import { createLiveWmsPeriodString, isLiveWms } from "./Utils/TimeParser";
import FeaturesApiLiveDataSource from "./Datasources/FeaturesApiLiveDatasource";
import { GeoCaUI } from "./UI/GeoCaUI";
import { createReconnectingWS } from "@solid-primitives/websocket";
import { translate as t } from "./i18n/Translator";
import {
    ArcGisMapServerImageryProvider,
    Camera,
    Cesium3DTileset,
    CesiumTerrainProvider,
    Clock,
    ClockRange,
    ClockViewModel,
    ConstantProperty,
    createGooglePhotorealistic3DTileset,
    createOsmBuildingsAsync,
    createWorldImageryAsync,
    createWorldTerrainAsync,
    DataSource,
    Ellipsoid,
    EllipsoidTerrainProvider,
    GeoJsonDataSource,
    GoogleMaps,
    HeightReference,
    ImageryLayer,
    ImageryProvider,
    Ion,
    IonImageryProvider,
    IonWorldImageryStyle,
    JulianDate,
    KmlDataSource,
    Moon,
    PrimitiveCollection,
    Rectangle,
    Resource,
    SceneMode,
    Sun,
    TimeInterval,
    TimeIntervalCollection,
    UrlTemplateImageryProvider,
    Viewer,
    WebMapServiceImageryProvider,
    WebMapTileServiceImageryProvider,
    Math as CesiumMath
} from "cesium";
import { zoomTo } from "./Utils/ZoomTo";
import { styleDefaultClusters, styleGeoJsonBillboard } from "./Utils/ClusterStyling";
import { addLayerFromBackend } from "./Utils/AddLayerFromBackend";
import GpkgTilingScheme from "./Utils/GpkgTilingScheme";
import { updateAoi } from "./Utils/Aoi";
import { validateBoundingBox } from "./Utils/Validation";
import TIFFImageryProvider from "tiff-imagery-provider";
import { createCogProjectionObject } from "./Utils/Utils";
import { addCatalogObj } from "./Types/3dMapControllerTypes";

type WesPrimitiveCollection = PrimitiveCollection & {
    _primitives: Wes3DTileSet[];
};

localStorage.setItem("cesiumOpened", "true");
window.onbeforeunload = function () {
    localStorage.setItem("cesiumOpened", "false");
};

const load = async function (mapState: MapState): Promise<Viewer> {
    //Setup
    const dataSourcesToBeAdded: Set<WesDataSourceObject> = new Set();
    const imageryLayersToBeAdded: Set<WesImageryObject> = new Set();
    const tilesetsToBeAdded: Set<WesPrimitiveObject> = new Set();
    let addingLayers = false;
    Ion.defaultAccessToken = mapState.accessToken;
    GoogleMaps.defaultApiKey = mapState.googleToken;
    let basemapOptions = mapState.baseMapLayers;
    let imageryOptions = mapState.imageLayers;
    const basemapOption = mapState.baseMapLayers[0];
    const baseImageryProvider = (await getImageryProvider(basemapOption)) as ImageryProvider;
    const baseImageryLayer = new ImageryLayer(baseImageryProvider, {});
    const terrainOption = mapState.terrainSets[0];
    // Creates the cesium viewer by binding to the div in 3dMap.jsp
    const clock = new Clock({
        clockRange: ClockRange.CLAMPED
    });
    const clockModel = new ClockViewModel(clock);
    const [selectedHome, setSelectedHome] = createSignal(HOME_POSITION);
    Camera.DEFAULT_VIEW_RECTANGLE = Rectangle.fromDegrees(...selectedHome());
    Camera.DEFAULT_VIEW_FACTOR = 0;
    const initCameraViewport = localStorage.getItem("initCameraViewport");
    if (initCameraViewport) {
        const rectangleComponents = initCameraViewport.split(",");
        Camera.DEFAULT_VIEW_RECTANGLE = Rectangle.fromDegrees(
            Number(rectangleComponents[0]),
            Number(rectangleComponents[1]),
            Number(rectangleComponents[2]),
            Number(rectangleComponents[3])
        );
        localStorage.removeItem("initCameraViewport");
    }
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let sessionID = urlParams.get("sessionID");
    if (!sessionID) {
        sessionID = sessionStorage.getItem("sessionID");
        if (!sessionID) {
            if (location.protocol !== "https:") {
                sessionID = (CesiumMath.nextRandomNumber() * 1e16).toFixed(0).toString();
            } else {
                sessionID = self.crypto.randomUUID();
            }
        }
    }
    sessionStorage.setItem("sessionID", sessionID);

    if (!localStorage.getItem("dataProvider")) {
        localStorage.setItem("dataProvider", window.location.origin);
    }

    const viewer = new Viewer("cesiumContainer", {
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

    let minAllowedZoomDist = localStorage.getItem("minimumAllowedZoomDistance");
    if (!minAllowedZoomDist) {
        localStorage.setItem("minimumAllowedZoomDistance", DEFAULT_ALLOWED_ZOOM_DISTANCE.toString());
        minAllowedZoomDist = DEFAULT_ALLOWED_ZOOM_DISTANCE.toString();
    }
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = parseInt(minAllowedZoomDist);

    //Cesium wont let you change the text in the tooltip of the fullscreen button, so we do it manually.
    try {
        const fullscreenButton = document.getElementsByClassName("cesium-fullscreenButton");
        (fullscreenButton[0] as HTMLButtonElement).title = t("3dMapfullscreenButtonTooltip");
    } catch {
        console.warn("No Cesium fullscreen button found.");
    }

    (window as CesiumWindow).Map3DViewer = viewer;
    viewer.scene.globe.depthTestAgainstTerrain = true;
    const primitiveLayers = viewer.scene.primitives;
    const [osmBuildingsLayer, setOsmBuildingsLayer] = createSignal("", {
        equals: false
    });
    chooseTerrainSet(terrainOption);
    const cesiumToolbar = document.querySelector(".cesium-viewer-toolbar") as HTMLDivElement;
    if (cesiumToolbar) cesiumToolbar.style.display = "none";
    viewer.scene.moon = new Moon();
    viewer.scene.sun = new Sun();
    const navOptions = {
        defaultResetView: Rectangle.fromDegrees(...selectedHome()),
        enableCompass: true,
        enableZoomControls: true,
        enableDistanceLegend: true,
        enableCompassOuterRing: true,
        resetTooltip: t("3dMapZoomToHome"),
        zoomInTooltip: t("3dMapZoomIn"),
        zoomOutTooltip: t("3dMapZoomOut")
    };
    new CesiumNavigation(viewer, navOptions);
    //Hide the zoom to home button in the nav controls.
    try {
        const navControlHomeButton = document.getElementById("navigationDiv")?.children[1].children[1];
        (navControlHomeButton as HTMLElement).style.display = "none";
    } catch {
        console.warn("No navigator home button found.");
    }
    viewer.selectedEntityChanged.addEventListener(showEntityProperties);
    const dataSourceLayers = viewer.dataSources;
    const imageryLayers = viewer.imageryLayers;

    //Create Context
    const [selectedLayer, setSelectedLayer] = createSignal(baseImageryLayer as WesImageryLayer);
    const [selectedTerrain, setSelectedTerrain] = createSignal(terrainOption);
    const [imageLayers, setImageLayers] = createSignal([] as WesImageryLayer[], {
        equals: false
    });
    const [tileSets, setTileSets] = createSignal([] as Wes3DTileSet[]);
    const [baseLayers, setBaseLayers] = createSignal([] as WesImageryLayer[], {
        equals: false
    });
    const [datasources, setDatasources] = createSignal([] as (WesDataSource | KmlDataSource | GeoJsonDataSource)[], {
        equals: false
    });
    const [terrainSets, setTerrainSets] = createSignal([] as WesTerrainObject[]);
    const [optionsMap, setOptionsMap] = createSignal(new Map<Wes3dMapLayer, WesLayerPropertiesObject>(), {
        equals: false
    });
    (window as CesiumWindow).optionsMap = optionsMap;
    const [isLoading, setIsLoading] = createSignal(LoadingRequestCode.UNSET);
    const [loadingRequestMap, setLoadingRequestMap] = createSignal(new Map(), {});
    const [timeMap, setTimeMap] = createSignal(new Map(), { equals: false });
    (window as CesiumWindow).timeMap = timeMap;
    (window as CesiumWindow).setTimeMap = setTimeMap;
    const [displayClock, setDisplayClock] = createSignal(false);
    const [clockStore, setClockStore] = createStore(viewer.clock);
    const [sourcesWithLegends, setSourcesWithLegends] = createSignal([] as LegendSource[], {
        equals: false
    });
    (window as CesiumWindow).sourcesWithLegends = sourcesWithLegends;
    (window as CesiumWindow).setSourcesWithLegends = setSourcesWithLegends;

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

    let webSocket;
    // let websocketUrl = "wss://hqpj80bujc.execute-api.ca-central-1.amazonaws.com/Prod/";
    let wsUrl = AWS_SOCKET;
    let wssUrl = AWS_SOCKET;
    if (wsUrl === undefined || wsUrl === "") {
        wsUrl = `ws://${window.location.hostname}/map/`;
        wssUrl = `wss://${window.location.hostname}/map/`;
    }
    switch (window.location.protocol) {
        case "http:":
            //eslint-disable-next-line
            webSocket = createReconnectingWS(`${wsUrl}?sessionID=${sessionStorage.getItem("sessionID")}`);
            break;
        case "https:":
            //eslint-disable-next-line
            webSocket = createReconnectingWS(`${wssUrl}?sessionID=${sessionStorage.getItem("sessionID")}`);
            break;
        default:
            throw new Error(t("3dMapLoadError1"));
    }

    webSocket.addEventListener("message", async e => {
        const message = e.data;
        if (!message) return;
        let parsedMessage = await JSON.parse(message);
        if (parsedMessage.message) {
            parsedMessage = parsedMessage.message;
        }
        switch (parsedMessage.type) {
            case "AOI":
                updateAoi(parsedMessage.aoi);
                break;
            case "LOADING_NOTIFIER":
                setIsLoading(LoadingRequestCode.STARTED);
                loadingRequestMap().set(
                    parsedMessage.uuid,
                    setTimeout(() => {
                        setIsLoading(LoadingRequestCode.ERROR);
                        loadingRequestMap().delete(parsedMessage.uuid);
                    }, 30000)
                );
                break;
            case "LOADING_FAILED_NOTIFIER":
                setIsLoading(LoadingRequestCode.ERROR);
                setIsLoading(LoadingRequestCode.ERROR);
                clearTimeout(loadingRequestMap().get(parsedMessage.uuid));
                loadingRequestMap().delete(parsedMessage.uuid);
                break;
            case "SET_DATA_PROVIDER":
                localStorage.setItem("dataProvider", parsedMessage.dataProviderUrl);
                break;
            case "CATALOG": {
                clearTimeout(loadingRequestMap().get(parsedMessage.uuid));
                loadingRequestMap().delete(parsedMessage.uuid);
                setIsLoading(LoadingRequestCode.FINISHED);
                const mapState = getMapState();
                if (!mapState.catalogList.some((obj: addCatalogObj) => obj.uid === parsedMessage.args.uid)) {
                    mapState.catalogList.unshift(parsedMessage.args);
                }
                setMapState(mapState);
                break;
            }
            default:
                addLayerFromBackend(parsedMessage);
                clearTimeout(loadingRequestMap().get(parsedMessage.uuid));
                loadingRequestMap().delete(parsedMessage.uuid);
                setIsLoading(LoadingRequestCode.FINISHED);
                break;
        }
    });

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
                                (window as CesiumWindow).removeEventListener(
                                    "timeChanged",
                                    dataSource._listener as EventListener
                                );
                                dataSource._removed = true;
                                dataSource._renderedPrimitive = undefined;
                                if (dataSource._hasLegend) {
                                    setSourcesWithLegends(
                                        sourcesWithLegends().filter(source => source.uid !== dataSource.uid)
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
            if (
                source instanceof WesDataSource ||
                source instanceof GeoJsonDataSource ||
                source instanceof KmlDataSource
            ) {
                if (!datasources().includes(source)) {
                    optionsMap().delete(source);
                    if (timeMap().has((source as WesDataSource).uid)) {
                        const tempTimeMap = timeMap();
                        tempTimeMap.delete((source as WesDataSource).uid);
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
                if (option.uid === (datasource as WesDataSource).uid) {
                    mapStateOptions.add(option as WesDataSourceObject);
                    return;
                }
            }
        });
        mapState.dataSources = Array.from(mapStateOptions);
        setMapState(mapState);
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
            if (source instanceof ImageryLayer && inBaseLayers === false && inImageLayers === false) {
                optionsMap().delete(source);
                if (timeMap().has((source as WesImageryLayer).uid)) {
                    const tempTimeMap = timeMap();
                    tempTimeMap.delete((source as WesImageryLayer).uid);
                    setTimeMap(tempTimeMap);
                }
            }
        }

        const mapStateOptions: Set<WesImageryObject> = new Set();
        const map = optionsMap();
        const sources = imageLayers();
        sources.forEach(imageryLayer => {
            for (const option of map.values()) {
                if (option.uid === imageryLayer.uid && basemapOptions.includes(option as WesImageryObject) === false) {
                    mapStateOptions.add(option as WesImageryObject);
                    return;
                }
            }
        });
        const stateLayers = Array.from(mapStateOptions);
        const selLayer = map.get(selectedLayer());
        stateLayers.push(selLayer as WesImageryObject);
        mapState.imageLayers = stateLayers;
        setMapState(mapState);
    }

    function syncPrimitiveLayers() {
        const primitivesLayersArray: Wes3DTileSet[] = (
            viewer.scene.primitives as WesPrimitiveCollection
        )._primitives.slice();
        const filteredPrimitivesArray: Wes3DTileSet[] = [];
        primitivesLayersArray.forEach((layer: Wes3DTileSet) => {
            if (layer instanceof Cesium3DTileset) {
                if (layer.name === "google") return;
                filteredPrimitivesArray.push(layer);
            }
        });
        setTileSets(filteredPrimitivesArray);
        for (const source of optionsMap().keys()) {
            if (source instanceof Cesium3DTileset) {
                if (!tileSets().includes(source as unknown as Wes3DTileSet)) {
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
                    mapStateOptions.add(option as WesPrimitiveObject);
                    return;
                }
            }
        });
        mapState.primitiveLayers = Array.from(mapStateOptions);
        setMapState(mapState);
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
        setMapState(mapState);
    }

    async function getLayerStates() {
        mapState = getMapState();
        imageryOptions = mapState.imageLayers;
        basemapOptions = mapState.baseMapLayers;
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
    async function addLayers(viewer?: Viewer, optionsMap?: Accessor<Map<Wes3dMapLayer, WesLayerPropertiesObject>>) {
        addingLayers = true;
        let hasZoomed = false;
        while (dataSourcesToBeAdded.size > 0) {
            const layerOptions = dataSourcesToBeAdded.values();
            const layerOption = layerOptions.next().value;
            if (layerOption != undefined) {
                if (checkIfLayerExists(layerOption)) {
                    dataSourcesToBeAdded.delete(layerOption);
                    continue;
                }
                await addDataSource(layerOption);
                if (!hasZoomed) {
                    hasZoomed = true;
                    zoomTo(
                        dataSourceLayers.get(dataSourceLayers.length - 1) as
                            | WesDataSource
                            | KmlDataSource
                            | GeoJsonDataSource
                    );
                }
                dataSourcesToBeAdded.delete(layerOption);
            }
        }
        while (imageryLayersToBeAdded.size > 0) {
            const layerOptions = imageryLayersToBeAdded.values();
            const layerOption = layerOptions.next().value;
            if (layerOption != undefined) {
                if (checkIfLayerExists(layerOption)) {
                    imageryLayersToBeAdded.delete(layerOption);
                    continue;
                }
                await addAdditionalLayerOption(layerOption);
                if (!hasZoomed) {
                    hasZoomed = true;
                    zoomTo(imageryLayers.get(imageryLayers.length - 1) as WesImageryLayer);
                }
                imageryLayersToBeAdded.delete(layerOption);
            }
        }
        while (tilesetsToBeAdded.size > 0) {
            const layerOptions = tilesetsToBeAdded.values();
            const layerOption = layerOptions.next().value;
            if (layerOption != undefined) {
                if (checkIfLayerExists(layerOption)) {
                    tilesetsToBeAdded.delete(layerOption);
                    continue;
                }
                await add3dTiles(layerOption);
                if (!hasZoomed) {
                    hasZoomed = true;
                    zoomTo(tileSets()[tileSets().length - 1]);
                }
                tilesetsToBeAdded.delete(layerOption);
            }
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
            applyViewParameters(optionsMap);
        }

        // Null check as this won't exist the first time load is called -- it's set in ExpandedMenu.tsx
        //if (openedLayerPage() == OPENED_LAYER_PAGE.CATALOG) {
        //    setOpenedLayerPage(OPENED_LAYER_PAGE.LAYERS);
        //}
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
            const imageryProvider = getImageryProvider(option);
            if (imageryProvider == null) {
                return;
            }
            layer = ImageryLayer.fromProviderAsync(imageryProvider, {});
            (layer as WesImageryLayer).name = option.name;
            (layer as WesImageryLayer).uid = option.uid;
        }
        const baseLayerArray = baseLayers();
        baseLayerArray.push(layer as WesImageryLayer);
        setBaseLayers(baseLayerArray);
        optionsMap().set(layer as WesImageryLayer, option);
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
                (viewer.scene.primitives as WesPrimitiveCollection)._primitives.forEach(function (
                    primitive: Wes3DTileSet
                ) {
                    if (primitive._url && primitive._url.includes("google")) {
                        primitive.show = false;
                    }
                });
                viewer.scene.globe.translucency.enabled = false;
                viewer.terrainProvider = new EllipsoidTerrainProvider();

                break;
            }
            case cesiumBuiltInUID: {
                (viewer.scene.primitives as WesPrimitiveCollection)._primitives.forEach(function (
                    primitive: Wes3DTileSet
                ) {
                    if (primitive._url && primitive._url.includes("google")) {
                        primitive.show = false;
                    }
                });
                viewer.scene.globe.translucency.enabled = false;
                viewer.terrainProvider = await createWorldTerrainAsync();
                break;
            }
            case googlePhotorealisticUID: {
                isGooglePhotorealistic = true;
                viewer.scene.globe.translucency.enabled = true;
                viewer.scene.globe.translucency.backFaceAlpha = 0;
                viewer.scene.globe.translucency.frontFaceAlpha = 0;
                const tileset = (await createGooglePhotorealistic3DTileset()) as Wes3DTileSet;
                tileset.name = "google";
                primitiveLayers.add(tileset);

                if (osmLayer && !osmLayer.show) {
                    osmLayer.style = TRANSPARENT_TILE_STYLE;
                    osmLayer.show = true;
                }
                break;
            }
            default: {
                (viewer.scene.primitives as WesPrimitiveCollection)._primitives.forEach(function (
                    primitive: Wes3DTileSet
                ) {
                    if (primitive._url && primitive._url.includes("google")) {
                        primitive.show = false;
                    }
                });
                viewer.scene.globe.translucency.enabled = false;
                viewer.terrainProvider = await CesiumTerrainProvider.fromUrl(terrainSet.url);
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
                setMapState(mapState);
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
    async function getImageryProvider(option: WesImageryObject): Promise<WesImageryProvider> {
        let bounds;
        if ("bounds" in option && option.bounds != undefined) {
            bounds = Rectangle.fromDegrees(
                option.bounds.minX,
                option.bounds.minY,
                option.bounds.maxX,
                option.bounds.maxY
            );
        }
        if (bounds) {
            const isValid = validateBoundingBox(bounds);
            if (!isValid) {
                bounds = undefined;
            }
        }
        if (option.type === "WMTS") {
            const wmtsOption = option as csltWMTSOption;
            const resource = new Resource({ url: wmtsOption.url });
            return new WebMapTileServiceImageryProvider({
                url: resource,
                //name: wmtsOption.name,
                layer: wmtsOption.layer,
                style: wmtsOption.style,
                format: wmtsOption.format,
                tileMatrixSetID: wmtsOption.tileMatrixSetID,
                maximumLevel: wmtsOption.maximumLevel,
                credit: wmtsOption.credit
            }) as WesWebMapTileServiceImageryProvider;
        }
        if (option.type === "ArcGis") {
            //return new ArcGisMapServerImageryProvider({
            //    url: option.url,
            //    //name: option.name,
            //    credit: option.credit,
            //});
            const arcgisOption = option as csltArcGISWMSOption;
            return await ArcGisMapServerImageryProvider.fromUrl(arcgisOption.url, {
                ellipsoid: Ellipsoid.WGS84,
                credit: arcgisOption.credit,
                rectangle: bounds,
                layers: arcgisOption.id
            });
        }
        if (option.type === "WMS") {
            const wmsOption = option as csltWMSOption;
            const isTemporal = await isLiveWms(wmsOption.layers, wmsOption.url);
            if (isTemporal) {
                const wmsDescriptor = await createLiveWmsPeriodString(wmsOption.layers);
                const dataCallback = (interval: TimeInterval, index: number) => {
                    let time;
                    if (index === 0) {
                        time = JulianDate.toIso8601(interval.stop);
                    } else {
                        time = JulianDate.toIso8601(interval.start);
                    }
                    return {
                        Time: time
                    };
                };
                const times = TimeIntervalCollection.fromIso8601({
                    iso8601: wmsDescriptor.iso8601,
                    leadingInterval: true,
                    trailingInterval: true,
                    isStopIncluded: false,
                    dataCallback: dataCallback
                });
                const tempMap = timeMap();
                tempMap.set(wmsOption.uid, [
                    JulianDate.fromDate(wmsDescriptor.start),
                    JulianDate.fromDate(wmsDescriptor.end)
                ]);
                setTimeMap(tempMap);
                return new WebMapServiceImageryProvider({
                    url: wmsOption.url,
                    //name: wmsOption.name,
                    layers: wmsOption.layers,
                    parameters: wmsOption.parameters,
                    tileHeight: 4000,
                    tileWidth: 4000,
                    credit: wmsOption.credit,
                    clock: viewer.clock,
                    times: times,
                    enablePickFeatures: false,
                    rectangle: bounds
                });
            }
            return new WebMapServiceImageryProvider({
                url: wmsOption.url,
                //name: wmsOption.name,
                layers: wmsOption.layers,
                parameters: wmsOption.parameters,
                credit: wmsOption.credit,
                enablePickFeatures: false,
                rectangle: bounds
            });
        }
        if (option.type === "CesiumBuiltin") {
            switch ((option as unknown as csltCesiumBuiltInOption).cesiumBuiltinType) {
                case "bingMaps":
                    return createWorldImageryAsync({ style: IonWorldImageryStyle.AERIAL_WITH_LABELS });

                case "ionResource":
                    return new IonImageryProvider({
                        assetId: (option as unknown as csltCesiumBuiltInOption).IonResourceAssetId
                    } as IonImageryProvider.ConstructorOptions);

                default:
                    throw t("3dMapGetImageryProviderError1");
            }
        }
        if (option.type === "GPKG" && (option as csltGpkgOption).gpkgType === "tiles") {
            const gpkgOption = option as csltGpkgOption;
            bounds = gpkgOption.bounds
                ? Rectangle.fromDegrees(
                      gpkgOption.bounds.minX,
                      gpkgOption.bounds.minY,
                      gpkgOption.bounds.maxX,
                      gpkgOption.bounds.maxY
                  )
                : Rectangle.fromDegrees(-180, -90, 180, 90);

            const minLevel = gpkgOption.matrixDimensions.reduce((prev, current) => {
                return prev.level < current.level ? prev : current;
            }).level;

            const maxLevel = gpkgOption.matrixDimensions.reduce((prev, current) => {
                return prev.level > current.level ? prev : current;
            }).level;

            const tilingScheme = new GpkgTilingScheme(gpkgOption.matrixDimensions);
            return new UrlTemplateImageryProvider({
                minimumLevel: minLevel,
                maximumLevel: maxLevel,
                url:
                    window.location.origin +
                    "/tilegpkg/" +
                    gpkgOption.serviceInfo.serviceId +
                    "/" +
                    gpkgOption.gpkgTableName +
                    "/{z}/{x}/{y}",
                rectangle: bounds,
                tilingScheme: tilingScheme
            });
        }
        if (option.type === "COG") {
            const cogOption = option as csltCOGOption;
            return TIFFImageryProvider.fromUrl(cogOption.url, {
                projFunc: code => {
                    return createCogProjectionObject(code);
                }
            }) as unknown as WesImageryProvider;
        }

        throw t("3dMapGetImageryProviderError2");
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
            tileset = primitiveLayers.add(
                await createOsmBuildingsAsync({ projectTo2D: true } as Cesium3DTileset.ConstructorOptions)
            );
            tileset.style = BLUE_TILE_STYLE;
            tileset.serviceInfo = {
                serviceId: standAloneLayersServiceUID,
                serviceTitle: standAloneLayersServiceLabel,
                serviceUrl: standAloneLayersServiceUrl
            };
            setOsmBuildingsLayer(option.uid);
        } else {
            tileset = primitiveLayers.add(await Cesium3DTileset.fromUrl(option.url, { projectTo2D: true }));
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
        tileset.show = option.show;
        optionsMap().set(tileset, option);
        window.dispatchEvent(new Event("tilesetAdded"));
    }

    /**
     * Method for adding imagery layers to the map.
     *
     * @param {*} imageryOption Json object stored in the session for a imagery layer.
     */
    async function addAdditionalLayerOption(imageryOption: WesImageryObject) {
        const baseLayerArray = baseLayers();
        for (let i = 0; i < baseLayerArray.length; i++) {
            if (baseLayerArray[i].uid === imageryOption.uid) {
                return;
            }
        }
        let layer = null;
        if (imageryOption.type === "OgcMap" && "bounds" in imageryOption) {
            const createdDatasource = new OgcMapsDatasource(
                imageryOption.description,
                imageryOption.name,
                (imageryOption as csltOGCMapOption).url,
                viewer,
                imageryOption.uid,
                imageryOption.bounds,
                (imageryOption.serviceInfo = {
                    serviceId: imageryOption.serviceInfo.serviceId,
                    serviceTitle: imageryOption.serviceInfo.serviceTitle,
                    serviceUrl: imageryOption.serviceInfo.serviceUrl
                })
            );
            if (createdDatasource.provider) {
                layer = ImageryLayer.fromProviderAsync(createdDatasource.getProvider(), {});
            }
        } else {
            if (imageryOption.uid === basemapOption.uid) {
                layer = imageryLayers.get(0);
                imageryLayers.remove(layer, false);
            } else {
                const provider = getImageryProvider(imageryOption);
                layer = ImageryLayer.fromProviderAsync(provider, {});
            }
        }
        if (layer == null) {
            return;
        }
        layer.alpha = 1;
        layer.show = true;
        (layer as WesImageryLayer).name = imageryOption.name;
        (layer as WesImageryLayer).description = imageryOption.description;
        (layer as WesImageryLayer).uid = imageryOption.uid;
        (layer as WesImageryLayer).serviceInfo = {
            serviceId: imageryOption.serviceInfo.serviceId,
            serviceTitle: imageryOption.serviceInfo.serviceTitle,
            serviceUrl: imageryOption.serviceInfo.serviceUrl
        };
        const map = optionsMap();
        map.set(layer as WesImageryLayer, imageryOption);
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
            case "sensorthings":
                createdDataSource = new SensorThingsDataSource(
                    dataSourceOption.description,
                    dataSourceOption.name,
                    dataSourceOption.url,
                    viewer,
                    dataSourceOption.uid,
                    dataSourceOption.serviceInfo
                );
                break;
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
                            temporal,
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
                    (dataSourceOption as csltOGCFeatureOption).bounds,
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
                    const gjDataSource = new GeoJsonDataSource(dataSourceOption.name) as WesGeoJsonDataSource;
                    loadGeoJsonDataSource(gjDataSource, dataSourceOption);
                    viewer.scene.morphComplete.addEventListener(() => {
                        loadGeoJsonDataSource(gjDataSource, dataSourceOption);
                    }, removeSignal);
                    gjDataSource.clustering.enabled = true;
                    gjDataSource.serviceInfo = {
                        serviceId: dataSourceOption.serviceInfo.serviceId,
                        serviceTitle: dataSourceOption.serviceInfo.serviceTitle,
                        serviceUrl: dataSourceOption.serviceInfo.serviceUrl
                    };
                    gjDataSource.uid = dataSourceOption.uid;
                    gjDataSource.description = dataSourceOption.description;
                    gjDataSource.name = dataSourceOption.name;
                    gjDataSource.url = dataSourceOption.url;
                    createdDataSource = gjDataSource;
                    createdDataSource.clustering.minimumClusterSize = 10;
                    styleDefaultClusters(createdDataSource, viewer);
                    styleGeoJsonBillboard(createdDataSource, viewer);
                }
                break;
            case "kml":
                if (dataSourceOption.url != null && dataSourceOption.url != undefined) {
                    createdDataSource = await KmlDataSource.load(dataSourceOption.url, {
                        clampToGround: true
                    });
                    createdDataSource = createdDataSource as WesKmlDataSource;
                    createdDataSource.clustering.enabled = true;
                    createdDataSource.serviceInfo = {
                        serviceId: dataSourceOption.serviceInfo.serviceId,
                        serviceTitle: dataSourceOption.serviceInfo.serviceTitle,
                        serviceUrl: dataSourceOption.serviceInfo.serviceUrl
                    };
                    createdDataSource.uid = dataSourceOption.uid;
                    createdDataSource.description = dataSourceOption.description;
                    createdDataSource.name = dataSourceOption.name;
                    createdDataSource.url = dataSourceOption.url;
                    viewer.scene.globe.depthTestAgainstTerrain = false;
                }
                break;
            case "coverage":
                createdDataSource = new CoverageApiDataSource(
                    dataSourceOption.description,
                    dataSourceOption.name,
                    dataSourceOption.url,
                    viewer,
                    (dataSourceOption as csltOGCCoverageOption).id,
                    (dataSourceOption as csltOGCCoverageOption).sourceLayerIndex,
                    dataSourceOption.uid,
                    (dataSourceOption as csltOGCCoverageOption).bounds,
                    dataSourceOption.serviceInfo
                );
                createdDataSource._name = `${dataSourceOption.name}`;
                break;
            case null:
                throw t("3dMapAddDatasourceError1");
            default:
                throw t("3dMapAddDatasourceError2", [dataSourceOption.type]);
        }
        if (createdDataSource != undefined) {
            const map = optionsMap();
            map.set(createdDataSource as WesDataSource, dataSourceOption);
            setOptionsMap(map);
            await dataSourceLayers.add(createdDataSource as DataSource);
        }
    }

    async function loadGeoJsonDataSource(datasource: GeoJsonDataSource, dataSourceOption: WesDataSourceObject) {
        await (datasource as GeoJsonDataSource).load(dataSourceOption.url, {
            clampToGround: viewer.scene.mode !== SceneMode.SCENE2D
        });
        if (viewer.scene.mode == SceneMode.COLUMBUS_VIEW) {
            for (const ent of datasource.entities.values) {
                if (ent.billboard !== undefined) {
                    ent.billboard.heightReference = new ConstantProperty(HeightReference.NONE);
                }
            }
        }
    }

    function checkIfLayerExists(layerOption: WesImageryObject | WesDataSourceObject | Wes3DTileSet) {
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
            setOsmBuildingsLayer,
            isLoading,
            setIsLoading,
            loadingRequestMap,
            setLoadingRequestMap
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
        return <GeoCaUI />;
    }

    const wesUI = document.getElementById("WesUserInterface");
    if (wesUI) {
        render(App, wesUI);
    }

    return viewer;
};

////////////////////////////////////////////// Initialize Map //////////////////////////////////////////////
onLoad(false).then(async (mapState: MapState) => {
    //The loading indicator that is removed when the map is loaded
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay !== null) {
        loadingOverlay.remove();
    }
    //Render the Map
    await load(mapState);
});
