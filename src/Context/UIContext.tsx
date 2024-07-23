import { Accessor, JSX, Setter, createContext, useContext } from "solid-js";
import { LegendSource, Wes3DTileSet, WesImageryLayer, WesTerrainObject } from "../Types/types";
import WesDataSource from "../Datasources/WesDataSource";
import { Clock, GeoJsonDataSource, KmlDataSource } from "cesium";
import { SetStoreFunction } from "solid-js/store";
export enum LoadingRequestCode {
    STARTED = 0,
    FINISHED = 1,
    ERROR = 2,
    UNSET = 3
}
let baseLayers: Accessor<WesImageryLayer[]>;
let setBaseLayers: Setter<WesImageryLayer[]>;
let selectedLayer: Accessor<WesImageryLayer>;
let setSelectedLayer: Setter<WesImageryLayer>;
let datasources: Accessor<(WesDataSource | KmlDataSource | GeoJsonDataSource)[]>;
let setDatasources: Setter<(WesDataSource | KmlDataSource | GeoJsonDataSource)[]>;
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
let clockStore: Clock;
let setClockStore: SetStoreFunction<Clock>;
let sourcesWithLegends: Accessor<LegendSource[]>;
let setSourcesWithLegends: Setter<LegendSource[]>;
let osmBuildingsLayer: Accessor<string>;
let setOsmBuildingsLayer: Setter<string>;
let isLoading: Accessor<LoadingRequestCode>;
let setIsLoading: Setter<LoadingRequestCode>;
let loadingRequestMap: Accessor<Map<string, ReturnType<typeof setTimeout>>>;
let setLoadingRequestMap: Setter<Map<string, ReturnType<typeof setTimeout>>>;

export type UIContextType = {
    baseLayers: Accessor<WesImageryLayer[]>;
    setBaseLayers: Setter<WesImageryLayer[]>;
    selectedLayer: Accessor<WesImageryLayer>;
    setSelectedLayer: Setter<WesImageryLayer>;
    datasources: Accessor<(WesDataSource | KmlDataSource | GeoJsonDataSource)[]>;
    setDatasources: Setter<(WesDataSource | KmlDataSource | GeoJsonDataSource)[]>;
    imageLayers: Accessor<WesImageryLayer[]>;
    setImageLayers: Setter<WesImageryLayer[]>;
    terrainSets: Accessor<WesTerrainObject[]>;
    setTerrainSets: Setter<WesTerrainObject[]>;
    selectedTerrain: Accessor<WesTerrainObject>;
    setSelectedTerrain: Setter<WesTerrainObject>;
    tileSets: Accessor<Wes3DTileSet[]>;
    setTileSets: Setter<Wes3DTileSet[]>;
    selectedHome: Accessor<number[]>;
    setSelectedHome: Setter<number[]>;
    timeMap: Accessor<Map<string, number[]>>;
    setTimeMap: Setter<Map<string, number[]>>;
    displayClock: Accessor<boolean>;
    setDisplayClock: Setter<boolean>;
    clockStore: Clock;
    setClockStore: SetStoreFunction<Clock>;
    sourcesWithLegends: Accessor<LegendSource[]>;
    setSourcesWithLegends: Setter<LegendSource[]>;
    osmBuildingsLayer: Accessor<string>;
    setOsmBuildingsLayer: Setter<string>;
    isLoading: Accessor<LoadingRequestCode>;
    setIsLoading: Setter<LoadingRequestCode>;
    loadingRequestMap: Accessor<Map<string, ReturnType<typeof setTimeout>>>;
    setLoadingRequestMap: Setter<Map<string, ReturnType<typeof setTimeout>>>;
};

export function getContextSignals(
    BaseLayers: Accessor<WesImageryLayer[]>,
    SetBaseLayers: Setter<WesImageryLayer[]>,
    SelectedLayer: Accessor<WesImageryLayer>,
    SetSelectedLayer: Setter<WesImageryLayer>,
    Datasources: Accessor<(WesDataSource | KmlDataSource | GeoJsonDataSource)[]>,
    SetDatasources: Setter<(WesDataSource | KmlDataSource | GeoJsonDataSource)[]>,
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
    ClockStore: Clock,
    SetClockStore: SetStoreFunction<Clock>,
    SourcesWithLegends: Accessor<LegendSource[]>,
    SetSourcesWithLegends: Setter<LegendSource[]>,
    OsmBuildingsLayer: Accessor<string>,
    SetOsmBuildingsLayer: Setter<string>,
    IsLoading: Accessor<LoadingRequestCode>,
    SetIsLoading: Setter<LoadingRequestCode>,
    LoadingRequestMap: Accessor<Map<string, ReturnType<typeof setTimeout>>>,
    SetLoadingRequestMap: Setter<Map<string, ReturnType<typeof setTimeout>>>
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
const InterfaceContext = createContext<UIContextType>();

export function InterfaceProvider(props: {
    children: number | boolean | Node | JSX.ArrayElement | (string & object) | null | undefined;
}): JSX.Element {
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
