import { Cesium3DTileStyle, Color } from "cesium";

export const BLUE_TILE_STYLE = new Cesium3DTileStyle({
    color: { conditions: [["true", "color('#165284FF')"]] }
});
export const TRANSPARENT_TILE_STYLE = new Cesium3DTileStyle({
    color: { conditions: [["true", "color('#16528401')"]] }
});
export const OSM_BUILDINGS_LAYER_NAME = "Open Street Map Buildings";
export const PHOTOREALISTIC_TERRAIN_NAME = "Google Photorealistic";
export const HOME_POSITION = [
    18744291.886510782, -14560003.619680682, 17094002.336306103, -0.641279398519268, 0.49700819569225574,
    -0.5845883906215505, -0.657132680791887, 0.037612071507881054, 0.7528359528557029
];
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

export const VIEWS_SERVLET_URL = window.location.origin + "/wes/CesiumViews";
export const MAX_CHARS_100 = 100;
export const MAX_CHARS_1024 = 1024;

// Geocoder state
const geocoderString = localStorage.getItem("useCesiumGeocoder");
export const USE_CESIUM_GEOCODER = !geocoderString || /^true$/i.test(geocoderString);

// The WES events that will be caught an propagated from the 2D client
// Any 2D events not in this set will be ignored by the 3D client.
export const WES_3D_EVENTS = new Set(["net.compusult.wes.client.cesium.Wes3dAoiEvent"]);

export const AOI_DATASOURCE_ID = "AOI";
export const AOI_BUFFER_DATASOURCE_ID = "AOI_BUFFER";
export const AOI_BUFFER_METRES_KEY = "wes_3d_buffer_metres";

export const AOI_COLOR = Color.HOTPINK;
export const AOI_DRAW_PIXEL_WIDTH = 10;
export const BUFFER_COLOR = Color.AQUA.withAlpha(0.5);

export const standAloneLayersServiceLabel = "Overlays";
export const standAloneLayersServiceUID = "56179caa-20b4-497b-a09e-719fd5705a91";
export const standAloneLayersServiceUrl = "";

//Basemap UIDs
export const bingMapsUID = "5112f39f-9613-4291-a506-d25323bc25a5";
export const googleHybridUID = "b288d2d5-3d02-4e33-9a47-50601fbca3e5";
export const osmUID = "4310df21-282c-4e4d-b5d1-e9bc89deeed4";
export const arcgisWorldStreetMapUID = "d297f111-506f-4138-ae5b-d3fe0ae392d9";
export const usgsShadedReliefUID = "66986db9-70e0-4dd4-a580-0c0228745e4b";
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
