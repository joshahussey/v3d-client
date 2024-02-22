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
    OgcMapsAPI = "OgcMapsAPI"
}

export const MAX_CHARS_100 = 100;
export const MAX_CHARS_1024 = 1024;

// The WES events that will be caught an propagated from the 2D client
// Any 2D events not in this set will be ignored by the 3D client.
export const WES_3D_EVENTS = new Set( [ "net.compusult.wes.client.cesium.Wes3dAoiEvent" ] );

export const AOI_DATASOURCE_ID = "AOI";
export const AOI_BUFFER_DATASOURCE_ID = "AOI_BUFFER";
export const AOI_BUFFER_METRES_KEY = "wes_3d_buffer_metres";

export const AOI_COLOR = Color.HOTPINK;
export const AOI_DRAW_PIXEL_WIDTH = 10;
export const BUFFER_COLOR = Color.AQUA.withAlpha(0.5);
export const DO_RECTANGLE_AOI_BUFFERS = false;
