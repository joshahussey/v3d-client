import { Accessor, Setter, createContext, useContext } from "solid-js";
import { Wes3DTileSet, WesImageryLayer, WesTerrainObject } from "../Wes";
import WesDataSource from "../Datasources/WesDataSource";
export enum LoadingRequestCode {
    STARTED = 0,
    FINISHED = 1,
    ERROR = 2
}
let baseLayers: Accessor<WesImageryLayer[]>;
let setBaseLayers: Setter<WesImageryLayer[]>;
let selectedLayer: Accessor<WesImageryLayer>;
let setSelectedLayer: Setter<WesImageryLayer>;
let datasources: Accessor<WesDataSource[]>;
let setDatasources: Setter<WesDataSource[]>;
let imageLayers: Accessor<WesImageryLayer[]>;
let setImageLayers: Setter<WesImageryLayer[]>;
let terrainSets: Accessor<WesTerrainObject[]>;
let setTerrainSets: Setter<WesTerrainObject[]>;
let selectedTerrain: Accessor<WesTerrainObject>;
let setSelectedTerrain: Setter<WesTerrainObject>;
let tileSets: Accessor<Wes3DTileSet[]>;
let setTileSets: Setter<Wes3DTileSet[]>;
let selectedHome: Accessor<number[]>;
let setSelectedHome: Setter<number[]>;
let timeMap: Accessor<Map<string, number[]>>;
let setTimeMap: Setter<Map<string, number[]>>;
let displayClock: Accessor<boolean>;
let setDisplayClock: Setter<boolean>;
let clockStore: Accessor<any>;
let setClockStore: Setter<any>;
let sourcesWithLegends: Accessor<any>;
let setSourcesWithLegends: Setter<any>;
let osmBuildingsLayer: Accessor<string>;
let setOsmBuildingsLayer: Setter<string>;
let isLoading: Accessor<LoadingRequestCode>;
let setIsLoading: Setter<LoadingRequestCode>;
let loadingRequestMap: Accessor<Map<string, any>>
let setLoadingRequestMap: Setter<Map<string, any>>
export function getContextSignals(
    BaseLayers: Accessor<WesImageryLayer[]>,
    SetBaseLayers: Setter<WesImageryLayer[]>,
    SelectedLayer: Accessor<WesImageryLayer>,
    SetSelectedLayer: Setter<WesImageryLayer>,
    Datasources: Accessor<WesDataSource[]>,
    SetDatasources: Setter<WesDataSource[]>,
    ImageLayers: Accessor<WesImageryLayer[]>,
    SetImageLayers: Setter<WesImageryLayer[]>,
    TerrainSets: Accessor<WesTerrainObject[]>,
    SetTerrainSets: Setter<WesTerrainObject[]>,
    SelectedTerrain: Accessor<WesTerrainObject>,
    SetSelectedTerrain: Setter<WesTerrainObject>,
    TileSets: Accessor<Wes3DTileSet[]>,
    SetTileSets: Setter<Wes3DTileSet[]>,
    SelectedHome: Accessor<number[]>,
    SetSelectedHome: Setter<number[]>,
    TimeMap: Accessor<Map<string, number[]>>,
    SetTimeMap: Setter<Map<string, number[]>>,
    DisplayClock: Accessor<boolean>,
    SetDisplayClock: Setter<boolean>,
    ClockStore: Accessor<any>,
    SetClockStore: Setter<any>,
    SourcesWithLegends: Accessor<any>,
    SetSourcesWithLegends: Setter<any>,
    OsmBuildingsLayer: Accessor<string>,
    SetOsmBuildingsLayer: Setter<string>,
    IsLoading: Accessor<LoadingRequestCode>,
    SetIsLoading: Setter<LoadingRequestCode>,
    LoadingRequestMap: Accessor<Map<string, any>>,
    SetLoadingRequestMap: Setter<Map<string, any>>
) {
    baseLayers = BaseLayers;
    setBaseLayers = SetBaseLayers;
    selectedLayer = SelectedLayer;
    setSelectedLayer = SetSelectedLayer;
    datasources = Datasources;
    setDatasources = SetDatasources;
    imageLayers = ImageLayers;
    setImageLayers = SetImageLayers;
    terrainSets = TerrainSets;
    setTerrainSets = SetTerrainSets;
    selectedTerrain = SelectedTerrain;
    setSelectedTerrain = SetSelectedTerrain;
    tileSets = TileSets;
    setTileSets = SetTileSets;
    selectedHome = SelectedHome;
    setSelectedHome = SetSelectedHome;
    timeMap = TimeMap;
    setTimeMap = SetTimeMap;
    displayClock = DisplayClock;
    setDisplayClock = SetDisplayClock;
    clockStore = ClockStore;
    setClockStore = SetClockStore;
    sourcesWithLegends = SourcesWithLegends;
    setSourcesWithLegends = SetSourcesWithLegends;
    osmBuildingsLayer = OsmBuildingsLayer;
    setOsmBuildingsLayer = SetOsmBuildingsLayer;
    isLoading = IsLoading;
    setIsLoading = SetIsLoading;
    loadingRequestMap = LoadingRequestMap;
    setLoadingRequestMap = SetLoadingRequestMap;
}
const InterfaceContext = createContext();

export function InterfaceProvider(props: any) {
    const signals = {
        baseLayers,
        setBaseLayers,
        selectedLayer,
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
    };

    return <InterfaceContext.Provider value={signals}>{props.children}</InterfaceContext.Provider>;
}

export function useInterfaceContext() {
    return useContext(InterfaceContext);
}
