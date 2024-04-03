// WES Data Types
//
import {
    Cartesian2,
    ImageryLayer,
    Cesium3DTileset,
    Viewer,
    ImageryLayerCollection,
    DataSourceCollection,
    Color,
    GroundPrimitive,
    HorizontalOrigin,
    VerticalOrigin,
    Scene,
    JulianDate,
    GeoJsonDataSource,
    PrimitiveCollection,
    WebMapServiceImageryProvider,
    WebMapTileServiceImageryProvider,
    ArcGisMapServerImageryProvider,
    IonImageryProvider,
    PolylineOutlineMaterialProperty,
    ShadowMode,
    ColorBlendMode,
    LabelStyle,
    Material,
    Timeline
} from "cesium";
import GeoJSON from "geojson";
import WesDataSource from "./Datasources/WesDataSource";
import FeaturesApiDataSource from "./Datasources/FeaturesApiDataSource";
import CoverageApiDataSource from "./Datasources/CoverageApiDataSource";
import { Accessor, Setter } from "solid-js";
import CelestialBodyDataSource from "./Datasources/CelestialBodyDataSource";
import { indexedPoint, indexedLine, indexedPolygon } from "./Utils/Utils";
export interface WesDatasources extends DataSourceCollection {
    _dataSources: WesDataSource[];
}
export interface WesImagerylayers extends ImageryLayerCollection {
    _layers: WesImageryLayer[];
}

export type CoverageResponse = {
    type: "Coverage";
    domain: CoverageDomain;
    parameters: CoverageParameters;
    ranges: CoverageRanges;
};

export type CoverageDomain = {
    type: "Domain";
    domainType: CoverageDomainTypes;
    axes: CoverageDomainAxes;
    referencing: CoverageReferencing;
};

export type CoverageParameters = {
    [key: string]: {
        type: string;
        description: string;
        unit: CoverageUnit;
        observedProperty: CoverageProperty;
    };
};

export type CoverageRanges = {
    [key: string]: {
        type: string;
        dataType: string;
        axisNames: string[];
        shape: number[];
        values: number[];
    };
};

export type CoverageDomainTypes = "Grid";
export type CoverageDomainAxes = {
    [key: string]: CoverageAxis | { values: string[] } | undefined;
    x: CoverageAxis;
    y: CoverageAxis;
    z?: CoverageAxis;
    t?: { values: string[] };
};

export type CoverageReferencing = CoverageReferenceObject[];

export type CoverageUnit = {
    unit: {
        symbol: string;
    };
};

export type CoverageProperty = {
    id: string;
    label: { [key: string]: string };
};

export type CoverageAxis = AxesRange | number[];

export type AxesRange = {
    start: number;
    stop: number;
    num: number;
};

export type CoverageReferenceObject = {
    coordinates: keyof CoverageDomainAxes;
    system: {
        [key: string]: string;
        type: string;
    };
};

export type LegendSource = {
    uid: string;
    minValue?: number;
    maxValue?: number;
    id: string;
    uom?: string;
    currentTime: JulianDate;
    lowerTimeBound: JulianDate;
    upperTimeBound: JulianDate;
    symbolizer?: CesiumRasterSymbolizer
}
export type CoverageAxesObject = object & {
    x: AxisObject;
    y: AxisObject;
}

export type FeaturesCollectionTemporal = {
    interval: string[][];
    resolution: string;
    trs: string;
};
export type AxisObject = object & {
    start: number;
    stop: number;
    num: number;
}
export type CesiumWindow = Window &
    typeof globalThis & {
        aoiBufferPrimitives?: Array<GroundPrimitive>;
        sourcesWithLegends: Accessor<LegendSource[]>;
        setSourcesWithLegends: Setter<LegendSource[]>;
        setTimeMap: Setter<Map<number, number>>;
        timeMap: Accessor<Map<number, number>>;
        Map3DViewer: Viewer;
        Map3DController: Map3DController;
        optionsMap: Accessor<any>;
        timeline?: Timeline;
    };

export type WesTerrainObject = {
    uid: string;
    name: string;
    url: string;
    type: "Terrain";
};

export type WesImageryObject = {
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
    serviceInfo: ServiceInfo;
    bounds: ImageryBounds;
};

export type WesPrimitiveObject = {
    uid: string;
    name: string;
    type: string;
    show: boolean;
    url: string;
    serviceInfo: ServiceInfo;
};

export type WesDataSourceObject = {
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

export type WesLayerPropertiesObject = WesImageryObject | WesDataSourceObject | WesPrimitiveObject | WesTerrainObject;

export type ServiceInfo = {
    serviceTitle: string;
    serviceId: string;
    serviceUrl: string;
};

export type ImageryBounds = {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
export interface WesGeoJsonDataSource extends GeoJsonDataSource {
    description: string;
    uid: string;
    name: string;
    type: string;
    url: string;
    show: boolean;
    id: string;
    serviceInfo: ServiceInfo;
    bounds: ImageryBounds;
}
export interface WesImageryLayer extends ImageryLayer {
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
    serviceInfo: ServiceInfo;
}
export interface WesPrimitiveCollection extends PrimitiveCollection {
    name?: string;
    uid?: string;
    url: string;
}
export interface WesWebMapServiceImageryProvider extends WebMapServiceImageryProvider {
    name?: string;
}
export interface WesWebMapTileServiceImageryProvider extends WebMapTileServiceImageryProvider {
    name?: string;
}
export interface WesArcGisMapServerImageryProvider extends ArcGisMapServerImageryProvider {
    name?: string;
}
export interface Wes3DTileSet extends Cesium3DTileset {
    _url: string;
    name: string;
    type: string;
    uid: string;
    enabled?: boolean;
    serviceInfo: ServiceInfo;
}
export type WesImageryProvider =
    | WesWebMapServiceImageryProvider
    | WesWebMapTileServiceImageryProvider
    | WesArcGisMapServerImageryProvider
    | IonImageryProvider;

export type Wes3dMapLayer =
    | WesImageryLayer
    | WesPrimitiveCollection
    | FeaturesApiDataSource
    | WesDataSource
    | CelestialBodyDataSource
    | CoverageApiDataSource
    | Wes3DTileSet;

export type Map3DController = any;
export type MapState = {
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
export type UserStyleDefinition = {
    index: number;
    name: string;
    dataSource: WesDataSource;
};
export type Cluster = [boolean, number, number, number, number];
export type FeatureArray = OGCFeature[];
export type PixelPosition = [number, number];
export type GeoJSONCoordinate = [number, number, number];
export type FeatureWeightIdentifier = [number, number, number, Set<number>];
export type JsonCluster = [...Cluster, number];
export type FeaturesJson = Array<JsonCluster | OGCFeature>;
export interface OGCFeature extends GeoJSON.Feature {
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

export type CesiumPolylineDescriptor = {
    material: PolylineOutlineMaterialProperty;
    width: number;
};

export type CesiumLineDescriptor = {
    material: Color;
    width: number;
};

export type TddRule = {
    Name?: string;
    Title?: string;
    Abstract?: string;
    Filter?: TddFilter;
    ElseFilter?: TddFilter;
    PointSymbolizer?: TddPointSymbolizer;
    LineSymbolizer?: any;
    PolygonSymbolizer?: TddPolygonSymbolizer;
    RasterSymbolizer?: any;
};

export type TddFilter = {
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

export type TddPropertyComparisonFilter = {
    PropertyName: string;
    Literal: string | number;
};

export type TddPropertyExistsFilter = {
    PropertyName: string;
};

export type TddPointSymbolizer = {
    Point?: PointProperty;
    Model?: ModelProperty;
    Label?: LabelProperty;
    Billboard?: BillboardProperty;
};

export type PointProperty = {
    Color: RGBA;
    OutlineColor?: RGBA;
    OutlineWidth?: number;
    Size: number;
};

export type ModelProperty = {
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

export type RGBA = [number, number, number, number];

type Font = {
    family: string;
    size: number;
}

export type LabelProperty = {
    Text: string | { PropertyName: string };
    Font?: Font;
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

export type BillboardProperty = {
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

export type TddPolygonSymbolizer = {
    ExtrudedHeight?: number;
    TextureRotation?: number;
    Fill?: boolean;
    Material?: Material;
    Outline?: boolean;
    OutlineColor?: RGBA;
    OutlineWidth?: number;
    CloseTop?: boolean;
    CloseBottom?: boolean;
    Shadows?: ShadowMode;
    ZIndex?: number;
};

export type FormattedUserStyles = FormattedFeatureTypeStyleRules[];
export type FormattedFeatureTypeStyleRules = FormattedFeatureTypeStyleRule[];
export type FormattedFeatureTypeStyleRule = {
    filters: FilterObject[];
    maxScaleDenominator: ScaleDenominator[];
    minScaleDenominator: ScaleDenominator[];
    pointSymbolizers: CesiumPointSymbolizer[];
    lineSymbolizers: CesiumLineSymbolizer[];
    polygonSymbolizers: CesiumPolygonSymbolizer[];
    textSymbolizers: CesiumTextSymbolizer[];
    rasterSymbolizers: CesiumRasterSymbolizer[];
};export interface FilterObject {
    operator: "and" | "or" | null;
    comparisons: any;
}
export type ScaleDenominator = number;
export type CesiumPointSymbolizer = {
    size: number;
    headingKey: string;
    externalGraphicUrl: string;
};
export type CesiumLineSymbolizer = CesiumPolylineDescriptor | CesiumLineDescriptor;
export type CesiumPolygonSymbolizer = {
    outlineColor: Color;
    outlineAlpha: number;
    outlineWidth: number;
    fillColor: Color;
    fillAlpha: number;
};
export type CesiumTextSymbolizer = {
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
export type ColorMapEntry = {
    color: Color;
    quantity: number;
};
export type CesiumRasterSymbolizer = {
    opacity: number;
    colorMap: ColorMapEntry[];
};
export interface SortedXmlRules {
    filters: (Element | FilterObject)[];
    minScaleDenominators: (Element | ScaleDenominator)[];
    maxScaleDenominators: (Element | ScaleDenominator)[];
    textSymbolizers: (Element | CesiumTextSymbolizer)[];
    lineSymbolizers: (Element | CesiumLineSymbolizer | CesiumLineDescriptor)[];
    pointSymbolizers: (Element | CesiumPointSymbolizer)[];
    polygonSymbolizers: (Element | CesiumPolygonSymbolizer)[];
    rasterSymbolizers: (Element | CesiumRasterSymbolizer)[];
}
export interface FeatureClusters {
    Constructor: FeatureClusters;
    _minimumDistance: number;
    _minimumClusterSize: number;
    _rawFeaturesArray: FeatureArray;
    _clusters: Cluster[];
    _scene: Scene;
}
export type GeoJsonGetAllResult = [Array<indexedPoint>, Array<indexedLine>, Array<indexedPolygon>];
export interface GeoJsonGeometry {
    type: "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon" | "GeometryCollection";
    coordinates?: [];
}
export interface GeoJsonAoi {
    geometry: GeoJsonGeometry;
    properties?: any;
}
export interface ViewRecord {
    id: bigint;
    title: string;
    description?: string;
}
