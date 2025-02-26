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
    Timeline,
    KmlDataSource,
    UrlTemplateImageryProvider
} from "cesium";
import GeoJSON from "geojson";
import WesDataSource from "../Datasources/WesDataSource";
import FeaturesApiDataSource from "../Datasources/FeaturesApiDataSource";
import CoverageApiDataSource from "../Datasources/CoverageApiDataSource";
import { Accessor, Setter } from "solid-js";
import CelestialBodyDataSource from "../Datasources/CelestialBodyDataSource";
import { indexedPoint, indexedLine, indexedPolygon } from "../Utils/Utils";
import {
    CesiumPointSymbolizerObject,
    CesiumLineSymbolizerObject,
    CesiumPolygonSymbolizerObject,
    CesiumTextSymbolizerObject,
    CesiumRasterSymbolizerObject
} from "../Utils/Wes3dSldStyler";
import { addCatalogObj, WGS84BoundingBox, zoomDim } from "./3dMapControllerTypes";
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
    symbol: string;
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
    type: string;
    minValue?: number;
    maxValue?: number;
    id: string;
    uom?: string;
    currentTime: JulianDate;
    lowerTimeBound: JulianDate;
    upperTimeBound: JulianDate;
    symbolizer?: CesiumRasterSymbolizer;
};
export type CoverageAxesObject = object & {
    x: AxisObject;
    y: AxisObject;
};

export type FeaturesCollectionTemporal = {
    interval: string[][];
    resolution: string;
    trs: string;
};
export type AxisObject = object & {
    start: number;
    stop: number;
    num: number;
};
export type CesiumWindow = Window &
    typeof globalThis & {
        aoiBufferPrimitives?: Array<GroundPrimitive>;
        sourcesWithLegends: Accessor<LegendSource[]>;
        setSourcesWithLegends: Setter<LegendSource[]>;
        setTimeMap: Setter<Map<string, [JulianDate, JulianDate]>>;
        timeMap: Accessor<Map<string, [JulianDate, JulianDate]>>;
        Map3DViewer: Viewer;
        optionsMap: Accessor<Map<Wes3dMapLayer, WesLayerPropertiesObject>>;
        timeline?: Timeline;
        fireBroadcastEvent: (event: string, eventId: string, _hasPayload: boolean) => void;
    };

export type WesTerrainObject = {
    uid: string;
    name: string;
    url: string;
    type: "Terrain";
};

export type WesImageryObject =
    | csltWMSOption
    | csltWMTSOption
    | csltArcGISWMSOption
    | csltOGCMapOption
    | csltGpkgOption
    | csltCOGOption;

export type csltWMTSOption = {
    uid: string;
    type: string;
    name: string;
    description: string;
    url: string;
    serviceInfo: ServiceInfo;
    bounds: ImageryBounds;
    layer: string;
    style: string;
    format: string;
    tileMatrixSetID: string;
    maximumLevel: number;
    credit: string;
    show: boolean;
    alpha: number;
};
export type csltOGCMapOption = {
    uid: string;
    type: string;
    name: string;
    show: boolean;
    url: string;
    serviceInfo: ServiceInfo;
    bounds: ImageryBounds;
    description: string;
    credit: string;
};
export type csltWMSOption = {
    uid: string;
    type: string;
    name: string;
    description: string;
    url: string;
    serviceInfo: ServiceInfo;
    bounds: ImageryBounds;
    layers: string;
    parameters: { [key: string]: string };
    credit: string;
    show: boolean;
    alpha: number;
};
export type csltArcGISWMSOption = {
    uid: string;
    type: string;
    name: string;
    id: string;
    description: string;
    url: string;
    serviceInfo: ServiceInfo;
    bounds: ImageryBounds;
    credit: string;
    show: boolean;
};
export type csltCesiumBuiltInOption = {
    uid: string;
    cesiumBuiltinType: string;
    name: string;
    description: string;
    type: string;
    baseMapLayer: boolean;
    IonResourceAssetId: number;
    show: boolean;
};
export type csltGpkgOption = {
    uid: string;
    name: string;
    description: string;
    type: string;
    gpkgType: string;
    gpkgTableName: string;
    serviceInfo: ServiceInfo;
    tileWidth: number;
    tileHeight: number;
    bounds: WGS84BoundingBox;
    matrixDimensions: zoomDim[];
};
export type csltCOGOption = {
    uid: string;
    name: string;
    description: string;
    url: string;
    type: string;
    projection: string;
    serviceInfo: ServiceInfo;
};

export type WesPrimitiveObject = cslt3DTilesOption;
export type cslt3DTilesOption = {
    uid: string;
    type: string;
    name: string;
    description: string;
    url: string;
    serviceInfo: ServiceInfo;
    show: boolean;
};

export type WesDataSourceObject =
    | csltOGCCoverageOption
    | csltOGCFeatureOption
    | csltSensorThingsOption
    | csltCelestialOption
    | csltGeoJsonOption
    | csltKMLOption;

export type csltSensorThingsOption = {
    uid: string;
    type: string;
    name: string;
    description: string;
    url: string;
    bounds: ImageryBounds;
    serviceInfo: ServiceInfo;
};
export type csltCelestialOption = {
    uid: string;
    type: string;
    name: string;
    description: string;
    url: string;
    serviceInfo: ServiceInfo;
};
export type csltGeoJsonOption = {
    uid: string;
    name: string;
    description: string;
    url: string;
    type: string;
    serviceInfo: ServiceInfo;
};
export type csltKMLOption = {
    uid: string;
    name: string;
    description: string;
    url: string;
    type: string;
    serviceInfo: ServiceInfo;
};
export type csltOGCFeatureOption = {
    uid: string;
    type: string;
    name: string;
    description: string;
    url: string;
    bounds: ImageryBounds;
    serviceInfo: ServiceInfo;
};
export type csltOGCCoverageOption = {
    uid: string;
    type: string;
    name: string;
    description: string;
    url: string;
    bounds: ImageryBounds;
    serviceInfo: ServiceInfo;
    sourceLayerIndex: string;
    id: string;
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
};
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
export interface WesKmlDataSource extends KmlDataSource {
    description: string;
    uid: string;
    name: string;
    url: string;
    serviceInfo: ServiceInfo;
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
export interface WesUrlTemplateImageryProvider extends UrlTemplateImageryProvider {
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
    | IonImageryProvider
    | WesUrlTemplateImageryProvider;

export type Wes3dMapLayer =
    | WesImageryLayer
    | WesPrimitiveCollection
    | FeaturesApiDataSource
    | WesDataSource
    | CelestialBodyDataSource
    | CoverageApiDataSource
    | Wes3DTileSet;

export type MapState = {
    accessToken: string;
    googleToken: string;
    baseMapLayers: WesImageryObject[];
    dataSources: WesDataSourceObject[];
    imageLayers: WesImageryObject[];
    primitiveLayers: WesPrimitiveObject[];
    terrainSets: WesTerrainObject[];
    cameraPosition: number[];
    saveLayerParameters: { show?: boolean; alpha?: number; uid: string }[];
    catalogList: addCatalogObj[];
    version: number;
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
        Yaw: string | number | { PropertyName: string };
        Pitch: string | number | { PropertyName: string };
        Roll: string | number | { PropertyName: string };
    };
    DistanceDisplayCondition?: {
        Near: number;
        Far: number;
    };
};

export type RGBA = [number, number, number, number];

type Font = {
    family: string;
    size: number;
};

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
};

export type BillboardProperty = {
    Image: string;
    Scale?: number;
    PixelOffset?: {
        Vertical: number;
        Horizontal: number;
    };
    EyeOffset?: {
        Height: number;
        Width: number;
        Depth: number;
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
};
export interface FilterObject {
    operator: "and" | "or" | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    textSymbolizers: (Element | CesiumTextSymbolizerObject)[];
    lineSymbolizers: (Element | CesiumLineSymbolizerObject | CesiumLineDescriptor)[];
    pointSymbolizers: (Element | CesiumPointSymbolizerObject)[];
    polygonSymbolizers: (Element | CesiumPolygonSymbolizerObject)[];
    rasterSymbolizers: (Element | CesiumRasterSymbolizerObject)[];
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
    properties?: {
        wes_3d_buffer_metres: number;
    };
}
export interface ViewRecord {
    id: bigint;
    title: string;
    description?: string;
}
export type satrec = {
    satnum: number;
    epochyr: number;
    epochdays: number;
    ndot: number;
    nddot: number;
    bstar: number;
    inclo: number;
    nodeo: number;
    ecco: number;
    argpo: number;
    mo: number;
    no: number;
    a: number;
    alta: number;
    altp: number;
    jdsatepoch: number;
    error: number;
    error_message: string;
};
