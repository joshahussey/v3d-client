// WES Data Types
//
import {
    Cartesian2,
    Event as CesiumEvent,
    DataSource,
    ImageryLayer,
    Cesium3DTileset,
    Viewer,
    ImageryLayerCollection,
    DataSourceCollection,
    Color,
    GroundPrimitive
} from "cesium";
import CoverageApiDataSource from "./Datasources/CoverageApiDataSource";
import { Setter } from "solid-js";
import { warn } from "console";
interface WesDatasources extends DataSourceCollection {
    _dataSources: WesDataSource[];
}

interface WesImagerylayers extends ImageryLayerCollection {
    _layers: WesImageryLayer[];
}

type CoverageResponse = {
    type: "Coverage";
    domain: CoverageDomain;
    parameters: CoverageParameters;
    ranges: CoverageRanges;
};

type CoverageDomain = {
    type: "Domain";
    domainType: CoverageDomainTypes;
    axes: CoverageDomainAxes;
    referencing: CoverageReferencing;
};

type CoverageParameters = {
    [key: string]: {
        type: string;
        description: string;
        unit: CoverageUnit;
        observedProperty: CoverageProperty;
    };
};

type CoverageRanges = {
    [key: string]: {
        type: string;
        dataType: string;
        axisNames: string[];
        shape: number[];
        values: number[];
    };
};

type CoverageDomainTypes = "Grid";
type CoverageDomainAxes = {
    [key: string]: CoverageAxis | { values: string[] } | undefined;
    x: CoverageAxis;
    y: CoverageAxis;
    z?: CoverageAxis;
    t?: { values: string[] };
};

type CoverageReferencing = CoverageReferenceObject[];

type CoverageUnit = {
    unit: {
        symbol: string;
    };
};

type CoverageProperty = {
    id: string;
    label: { [key: string]: string };
};

type CoverageAxis = AxesRange | number[];

type AxesRange = {
    start: number;
    stop: number;
    num: number;
};

type CoverageReferenceObject = {
    coordinates: keyof CoverageDomainAxes;
    system: {
        [key: string]: string;
        type: string;
    };
};

interface CoverageAxesObject extends Object {
    x: AxisObject;
    y: AxisObject;
}

type FeaturesCollectionTemporal = {
    interval: string[][];
    resolution: string;
    trs: string;
};

interface AxisObject extends Object {
    start: number;
    stop: number;
    num: number;
}
type CesiumWindow = Window &
    typeof globalThis & {
        aoiBufferPrimitives?: Array<GroundPrimitive>;
        sourcesWithLegends: Accessor<any[]>;
        setSourcesWithLegends: Setter<any[]>;
        setTimeMap: Setter<Map<number, number>>;
        timeMap: Accessor<Map<number, number>>;
        Map3DViewer: Viewer;
        Map3DController: Map3DController;
        optionsMap: Accessor<any>;
    };
type WesTerrainObject = {
    uid: string;
    name: string;
    url: string;
    type: "Terrain";
};

type WesImageryObject = {
    uid: string;
    type: string;
    cesiumBuiltinType?: string;
    baseMapLayer: string;
    name: string;
    layer: string;
    description: string;
    url: string;
    style: string;
    tileMatrixSetID: string;
    maximumLevel: number;
    show: boolean;
    alpha: number;
    format: string;
    credit: string;
    layers: string;
    parameters: { [key: string]: string };
    IonResourceAssetId: number;
    serviceInfo?: ServiceInfo;
    bounds: ImageryBounds;
};

type WesPrimitiveObject = {
    uid: string;
    name: string;
    type: string;
    show: boolean;
    url: string;
    serviceInfo?: ServiceInfo;
};

type WesDataSourceObject = {
    description: string;
    uid: string;
    name: string;
    type: string;
    url: string;
    show: boolean;
    sourceLayerIndex: number | null;
    id: string;
    serviceInfo: ServiceInfo;
    bounds: ImageryBounds;
};

type WesLayerPropertiesObject = WesImageryObject | WesDataSourceObject | WesPrimitiveObject | WesTerrainObject;

type ServiceInfo = {
    serviceTitle?: string;
    serviceId?: string;
    serviceUrl?: string;
};

type ImageryBounds = {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

interface WesGeoJsonDataSource extends GeoJsonDataSource {
    serviceInfo?: ServiceInfo;
}

interface WesImageryLayer extends ImageryLayer {
    name: string;
    uid: string;
    type: string;
    url: string;
    layer: string;
    style: string;
    format: string;
    tileMatrixSetID: string;
    maximumLevel: number;
    layers: string;
    parameters: { [key: string]: string };
    credit: string;
    cesiumBuiltinType: string;
    IonResourceAssetId: number;
    description: string;
    serviceInfo?: ServiceInfo;
}
interface WesPrimitiveCollection extends PrimitiveCollection {
    name?: string;
    uid?: string;
    url: string;
}
interface WesWebMapServiceImageryProvider extends WebMapServiceImageryProvider {
    name?: string;
}
interface WesWebMapTileServiceImageryProvider extends WebMapTileServiceImageryProvider {
    name?: string;
}
interface WesArcGisMapServerImageryProvider extends ArcGisMapServerImageryProvider {
    name?: string;
}
interface Wes3DTileSet extends Cesium3DTileset {
    _url: string;
    name: string;
    type: string;
    uid: string;
    enabled?: boolean;
}
type WesImageryProvider =
    | WesWebMapServiceImageryProvider
    | WesWebMapTileServiceImageryProvider
    | WesArcGisMapServerImageryProvider
    | IonImageryProvider;

type Wes3dMapLayer =
    | WesImageryLayer
    | WesPrimitiveCollection
    | FeaturesApiDataSource
    | WesDataSource
    | CelestialBodyDataSource
    | CoverageApiDataSource
    | Wes3DTileSet;

type ChangeFlag = {
    layers: boolean;
    primitives: boolean;
    dataSources: boolean;
} | null;
type Map3DController = any;
type MapState = {
    accessToken: string;
    googleToken: string;
    baseMapLayers: WesImageryObject[];
    dataSources: WesDataSourceObject[];
    imageLayers: WesImageryObject[];
    primitiveLayers: WesPrimitiveObject[];
    terrainSets: WesTerrainObject[];
    cameraPosition: number[];
    saveLayerParameters: { show: boolean; alpha?: number; uid: string }[];
};

interface cesiumViewModel {
    layers: Array<any>;
    tileSets: Array<any>;
    baseLayers: Array<any>;
    dataSources: Array<any>;
    optionsMap: Map<any, any>;
    terrainSets: WesTerrainObject[];
    upLayer: Wes3dMapLayer | null;
    downLayer: Wes3dMapLayer | null;
    selectedLayer: Wes3dMapLayer | null;
    isSelectableLayer: Function;
    isBasemapLayer: Function;
    raise: Function;
    lower: Function;
    removeLayer: Function;
    raisePrimitive: Function;
    lowerPrimitive: Function;
    removePrimitive: Function;
    zoomToTiles: Function;
    isOsmBuildingsOnGoogleTerrain: Function;
    checkboxValue: Function;
    canRaise: Function;
    canLower: Function;
    canLowerPrimitive: Function;
    changed: Function;
    menuDisplay: Function;
    isOSMBuildings: Function;
    has3dLayers: Function;
    get3dLayers: Function;
    hasTerrainOptions: Function;
    shouldShowZoom: Function;
    measure: Function;
    selectedTerrain: WesTerrainObject | null;
    getUserStyles: Function;
    selectedUserStyle: Function | null;
    isFeaturesApiDataSource: Function;
    osmStyle: Cesium3DTileStyle;
}
type UserStyleDefinition = {
    index: number;
    name: string;
    dataSource: WesDataSource;
};
type Cluster = [boolean, number, number, number, number];
type FeatureArray = OGCFeature[];
type PixelPosition = [number, number];
type GeoJSONCoordinate = [number, number, number];
type FeatureWeightIdentifier = [number, number, number, Set<number>];
type JsonCluster = [...Cluster, number];
type FeaturesJson = Array<JsonCluster | OGCFeature>;
interface OGCFeature extends GeoJSON.Feature {
    id: string;
    name?: string;
    screenSpaceCoordinate: Cartesian2;
    geometry: GeoJSON.Geometry & {
        coordinates: GeoJSONCoordinate;
    };
    isCluster: boolean;
    isClustered: boolean;
    numberInCluster: number;
}

type CesiumPolylineDescriptor = {
    material: PolylineOutlineMaterialProperty;
    width: number;
};

type CesiumLineDescriptor = {
    material: Color;
    width: number;
};

type TddRule = {
    Name?: string;
    Title?: string;
    Abstract?: string;
    Filter?: TddFilter;
    ElseFilter?: TddFilter;
    PointSymbolizer?: TddPointSymbolizer;
    LineSymbolizer?: TddLineSymbolizer;
    PolygonSymbolizer?: TddPolygonSymbolizer;
    RasterSymbolizer?: TddRasterSymbolizer;
};

type TddFilter = {
    PropertyIsEqualTo?: TddPropertyComparisonFilter;
    PropertyIsNotEqualTo?: TddPropertyComparisonFilter;
    PropertyIsLessThan?: TddPropertyComparisonFilter;
    PropertyIsLessThanOrEqualTo?: TddPropertyComparisonFilter;
    PropertyIsGreaterThan?: TddPropertyComparisonFilter;
    PropertyIsGreaterThanOrEqualTo?: TddPropertyComparisonFilter;
    PropertyIsNull?: TddPropertyExistsFilter;
    PropertyIsNotNull?: TddPropertyExistsFilter;
    And?: TddFilter[];
    Or?: TddFilter[];
};

type TddPropertyComparisonFilter = {
    PropertyName: string;
    Literal: string | number;
};

type TddPropertyExistsFilter = {
    PropertyName: string;
};

type TddPointSymbolizer = {
    Point?: PointProperty;
    Model?: ModelProperty;
    Label?: LabelProperty;
    Billboard?: BillboardProperty;
};

type pointProperty = {
    Color: RGBA;
    OutlineColor?: RGBA;
    OutlineWidth?: number;
    Size: number;
};

type ModelProperty = {
    url: string;
    Scale?: number;
    MinimumPixelSize?: number;
    MaximumScale?: number;
    Shadows?: ShadowMode;
    SilhouetteColor?: RGBA;
    SilhouetteSize?: number;
    Color?: RGBA;
    ColorBlendMode?: ColorBlendMode;
    ColorBlendAmount?: number;
    LightColor?: RGBA;
    Orientation?: {
        Yaw: string|number|{PropertyName: string};
        Pitch: string|number|{PropertyName: string};
        Roll: string|number|{PropertyName: string};
    }
    DistanceDisplayCondition?: {
        Near: number;
        Far: number;
    };
};

type RGBA = [number, number, number, number];

type LabelProperty = {
    Text: string | { PropertyName: string };
    Font?: font;
    LabelStyle?: LabelStyle;
    Scale?: number;
    ShowBackground?: boolean;
    BackgroundColor?: boolean;
    BackgroundPadding?: number;
    PixelOffset?: {
        vertical: number;
        horizontal: number;
    };
    EyeOffset?: {
        height: number;
        width: number;
        depth: number;
    };
    HorizontalOrigin?: HorizontalOrigin;
    VerticalOrigin?: VerticalOrigin;
    FillColor?: RGBA;
    OutlineColor?: RGBA;
    OutlineWidth?: number;
    DistanceDisplayCondition?: {
        Near: number;
        Far: number;
    };
}

type BillboardProperty = {
    Image: string;
    Scale?: number;
    PixelOffset?: {
        vertical: number;
        horizontal: number;
    };
    EyeOffset?: {
        height: number;
        width: number;
        depth: number;
    };
    HorizontalOrigin?: HorizontalOrigin;
    VerticalOrigin?: VerticalOrigin;
    Color?: RGBA;
    Rotation?: number;
    SizeInMeters?: number;
    Width?: number;
    Height?: number;
    DistanceDisplayCondition?: {
        Near: number;
        Far: number;
    };
};

type TddPolygonSymbolizer = {
    ExtrudedHeight?: number;
    TextureRotation?: number;
    Fill?: Boolean;
    Material?: Material;
    Outline?: boolean;
    OutlineColor?: RGBA;
    OutlineWidth?: number;
    CloseTop?: boolean;
    CloseBottom?: boolean;
    Shadows?: ShadowMode;
    ZIndex?: number;
};

type FormattedUserStyles = FormattedFeatureTypeStyleRules[];
type FormattedFeatureTypeStyleRules = FormattedFeatureTypeStyleRule[];
type FormattedFeatureTypeStyleRule = {
    filters: FilterObject[];
    maxScaleDenominator: ScaleDenominator[];
    minScaleDenominator: ScaleDenominator[];
    pointSymbolizers: CesiumPointSymbolizer[];
    lineSymbolizers: CesiumLineSymbolizer[];
    polygonSymbolizers: CesiumPolygonSymbolizer[];
    textSymbolizers: CesiumTextSymbolizer[];
    rasterSymbolizers: CesiumRasterSymbolizer[];
};
interface FilterObject {
    operator: "and" | "or" | null;
    comparisons: any;
}
type ScaleDenominator = number;
type CesiumPointSymbolizer = {
    size: number;
    headingKey: string;
    externalGraphicUrl: string;
};
type CesiumLineSymbolizer = CesiumPolylineDescriptor | CesiumLineDescriptor;
type CesiumPolygonSymbolizer = {
    outlineColor: Color;
    outlineAlpha: number;
    outlineWidth: number;
    fillColor: Color;
    fillAlpha: number;
};
type CesiumTextSymbolizer = {
    font: string;
    fontSize: string;
    color: Color;
    outlineColor: Color;
    outlineWidth: number;
    horizontalOrigin: HorizontalOrigin;
    verticalOrigin: VerticalOrigin;
    pixelOffset: Cartesian2;
    textKey: string;
};
type ColorMapEntry = {
    color: Color;
    quantity: number;
};
type CesiumRasterSymbolizer = {
    opacity: number;
    colorMap: ColorMapEntry[];
};
interface SortedXmlRules {
    filters: (Element | FilterObject)[];
    minScaleDenominators: (Element | ScaleDenominator)[];
    maxScaleDenominators: (Element | ScaleDenominator)[];
    textSymbolizers: (Element | CesiumTextSymbolizerObject)[];
    lineSymbolizers: (Element | CesiumLineSymbolizerObject | CesiumLineDescriptor)[];
    pointSymbolizers: (Element | CesiumPointSymbolizerObject)[];
    polygonSymbolizers: (Element | CesiumPolygonSymbolizerObject)[];
    rasterSymbolizers: (Element | CesiumRasterSymbolizerObject)[];
}

interface FeatureClusters {
    Constructor: FeatureClusters;
    _minimumDistance: number;
    _minimumClusterSize: number;
    _rawFeaturesArray: FeatureArray;
    _clusters: Cluster[];
    _scene: Scene;
}
type GeoJsonGetAllResult = [Array<indexedPoint>, Array<indexedLine>, Array<indexedPolygon>];

interface GeoJsonGeometry {
    type: "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon" | "GeometryCollection";
    coordinates?: [];
}

interface GeoJsonAoi {
    geometry: GeoJsonGeometry;
    properties?: any;
}

interface ViewRecord {
    id: bigint;
    title: string;
    description?: string;
}

export declare module WesDataSource {
    export declare class WesDataSource extends DataSource {
        Constructor: WesDataSource;
        _name: string;
        _changed: CesiumEvent;
        _error: CesiumEvent;
        _isLoading: boolean;
        _loading: CesiumEvent;
        _isLoaded: boolean;
        _type: string;
        _entityCollection: EntityCollection;
        _entityCluster: EntityCluster;
        _url: string;
        _show: boolean;
        _viewer: Viewer;
        _scratchRectangle: Rectangle;
        _isInitialized: boolean;
        _isCancelledIdMap: Set<number>;
        _currentLoadId: number;
        _fetchRequestAbortController: AbortController;
        _removed: boolean;
        initialize: Function;
        stop: Function;
        isCancelled: Function;
        _setLoading: Function;
        fetchJson: Function;
    }
}
