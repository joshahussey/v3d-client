import { Cesium3DTileStyle, Color, ConstantProperty, HeightReference, VerticalOrigin } from "cesium";
import { translate as t } from "./i18n/Translator";

const defaultConstantsJson = {
    CLUSTER_WIDTH_HEIGHT: 35,
    CLUSTER_HEIGHT_CONSTANT: 50000
};

let constants: typeof defaultConstantsJson | undefined;
createConstants();
if (constants == undefined) {
    localStorage.setItem("constants", JSON.stringify(defaultConstantsJson));
    constants = defaultConstantsJson;
}

export const BLUE_TILE_STYLE = new Cesium3DTileStyle({ color: { conditions: [["true", "color('#165284FF')"]] } });
export const TRANSPARENT_TILE_STYLE = new Cesium3DTileStyle({
    color: { conditions: [["true", "color('#16528401')"]] }
});
export const HOME_POSITION = [-140.99778, 41.6751050889, -52.6480987209, 83.23324];
export enum DatasourceTypes {
    Cesium3DTileset = "Cesium3DTileset",
    GeoJsonDataSource = "GeoJsonDataSource",
    KmlDataSource = "KmlDataSource",
    CzmlDataSource = "CzmlDataSource",
    OgcFeaturesAPI = "FeaturesAPI",
    OgcCoveragesAPI = "CoveragesAPI",
    OgcMapsAPI = "OgcMapsAPI",
    Celestial = "Celestial"
}

let VIEWS_SERVLET_URL = localStorage.getItem("dataProvider") + "/wes/CesiumViews";
export function getViewsServletUrl() {
    VIEWS_SERVLET_URL = localStorage.getItem("dataProvider") + "/wes/CesiumViews";
    return VIEWS_SERVLET_URL;
}

export enum OPENED_LAYER_PAGE {
    CLOSED = 0,
    SEARCH = 1,
    LAYER_ORDER = 2,
    SAVE_VIEW = 3,
    LOAD_VIEW = 4,
    CATALOG = 5,
    LAYERS = 6
}

export enum VIEW_TYPES {
    NO_VIEWS = 0,
    LOCAL_VIEWS = 1,
    EXTERNAL_VIEWS = 2,
    DOWNLOAD_VIEWS = 3
}
export const VIEW_TYPE = VIEW_TYPES.DOWNLOAD_VIEWS;

export const MAX_CHARS_100 = 100;
export const MAX_CHARS_1024 = 1024;
export const DEFAULT_ALLOWED_ZOOM_DISTANCE = 10;

// Geocoder state
//const geocoderString = localStorage.getItem("useCesiumGeocoder");
export const USE_CESIUM_GEOCODER = false; //!geocoderString || /^true$/i.test(geocoderString);

// The WES events that will be caught an propagated from the 2D client
// Any 2D events not in this set will be ignored by the 3D client.
export const WES_3D_EVENTS = new Set(["net.compusult.wes.client.cesium.Wes3dAoiEvent"]);

export const AOI_DATASOURCE_ID = "AOI";

export const AOI_COLOR = new Color(...[Color.HOTPINK.red, Color.HOTPINK.green, Color.HOTPINK.blue, 1]);
export const AOI_DRAW_PIXEL_WIDTH = 10;
export const BUFFER_COLOR = new Color(...[Color.TEAL.red, Color.TEAL.green, Color.TEAL.blue, 0.5]);

export const standAloneLayersServiceLabel = t("constantsOverlaysLabel");
export const standAloneLayersServiceUID = "56179caa-20b4-497b-a09e-719fd5705a91";
export const standAloneLayersServiceUrl = "";

//Basemap UIDs
export const bingMapsUID = "5112f39f-9613-4291-a506-d25323bc25a5";
export const googleHybridUID = "b288d2d5-3d02-4e33-9a47-50601fbca3e5";
export const osmUID = "4310df21-282c-4e4d-b5d1-e9bc89deeed4";
export const arcgisWorldStreetMapUID = "d297f111-506f-4138-ae5b-d3fe0ae392d9";
export const usgsShadedReliefUID = "8f12a798-7e66-42c8-b47c-bf1bd6e404b1";
export const csltOsmUID = "8f12a798-7e66-42c8-b47c-bf1bd6e404b1";
export const csltAsterUID = "6c64ecd6-2c5b-4df1-9669-08bd7c3c9601";
export const csltLandsat8UID = "6d88da16-9d0b-4796-a756-525cf75d0ff8";
export const csltOpenTopoUID = "11849e11-52dc-474a-9336-e1a97ad255df";
export const stJohnsWmtsUID = "3ff8eab4-b9cb-4bde-8dc0-fd5acc24ca9c";

//Imagery UIDs
//Google Hybrid has the same UID as the googleHybrid entry above.

//Primitive UIDs
export const osmBuildingsUID = "a73f3684-6fa6-4931-9ffd-6a59c8b65d42";

//Datasource Layers UIDs
export const celestrakUID = "2c1ae7bd-0244-41e2-8c79-ef788d34fa87";

//Terrain UIDs
export const cesiumBuiltInUID = "36ed260c-9688-44ba-af13-4fe2da562d3e";
export const googlePhotorealisticUID = "db1b1516-2ce3-44e6-9ef3-da6882c7a46c";
export const wgsEllipsoidUID = "0f9f94c0-93ab-4aa1-957d-74fac18ad526";

//Boolean Properties//
export const TRUE_PROPERTY = new ConstantProperty(true);
// const FALSE_PROPERTY = new ConstantProperty(false);

//Config Properties//
// const CLUSTER_MINIMUM_DISTANCE = 300;
export const CLUSTER_WIDTH = new ConstantProperty(constants.CLUSTER_WIDTH_HEIGHT);
export const CLUSTER_HEIGHT = new ConstantProperty(constants.CLUSTER_WIDTH_HEIGHT);
export const CLUSTER_HEIGHT_CONSTANT = constants.CLUSTER_HEIGHT_CONSTANT;
// export const EYE_OFFSET = new Cartesian3(0, -30, 400);
// export const EYE_OFFSET_METAR = new Cartesian3(0, 0, 400);

//Number Properties//
export const ZERO_PROPERTY = new ConstantProperty(0);
export const ONE_PROPERTY = new ConstantProperty(1);
export const TWO_PROPERTY = new ConstantProperty(2);
// export const POSTIVE_INFINITY_PROPERTY = new ConstantProperty(Number.POSITIVE_INFINITY);

//Color Properties//
export const ORANGE_PROPERTY = new ConstantProperty([255, 165, 0, 1]);
export const BLUE_PROPERTY = new ConstantProperty([0, 0, 255, 1]);

//Cesium Enum Properties//
export const VERTICAL_ORIGIN_BOTTOM = new ConstantProperty(VerticalOrigin.BOTTOM);
export const HEIGHT_REFERENCE_CLAMP_TO_GROUND = new ConstantProperty(HeightReference.CLAMP_TO_GROUND);
export const HEIGHT_REFERENCE_RELATIVE_TO_GROUND = new ConstantProperty(HeightReference.RELATIVE_TO_GROUND);

// Tile size used for OGC Maps
export const OGC_MAPS_TILE_SIZE = 2000;

//Features Datasource Properties//
export const FEATURES_KEYFRAME_INTERVAL = 10;

function createConstants() {
    const constantsString = localStorage.getItem("constants");
    if (constantsString) {
        constants = JSON.parse(constantsString);
    }
}
