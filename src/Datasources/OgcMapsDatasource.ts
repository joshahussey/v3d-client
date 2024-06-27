import {
    Ellipsoid,
    GeographicTilingScheme,
    ImageryProvider,
    Resource,
    UrlTemplateImageryProvider,
    Viewer,
    Rectangle
} from "cesium";
import { ServiceInfo, ImageryBounds } from "../Types/types";
import WesDataSource from "./WesDataSource";
import { translate as t } from "../i18n/Translator";
import { OGC_MAPS_TILE_SIZE } from "../Constants";
export default class OgcMapsDatasource extends WesDataSource {
    provider?: ImageryProvider;
    _bounds: ImageryBounds;
    constructor(
        description: string,
        name: string,
        url: string,
        viewer: Viewer,
        uid: string,
        bounds: ImageryBounds,
        serviceInfo: ServiceInfo
    ) {
        super(description, name, url, viewer, uid, serviceInfo);
        this._url = url;
        this._bounds = bounds;
        this.initialize(1000);
    }
    loadService() {
        const urlArray = this._url.split("/");
        if (urlArray[urlArray.length - 1] !== "map") {
            this._url = this._url + "/map";
        }
        this.setProvider();
    }
    async getProvider(): Promise<ImageryProvider> {
        if (this.provider) {
            return this.provider;
        } else {
            throw t("OgcMapCouldNotGetProviderError");
        }
    }

    setProvider() {
        const extents = Rectangle.fromDegrees(
            this._bounds.minX,
            this._bounds.minY,
            this._bounds.maxX,
            this._bounds.maxY
        );
        const resource = new Resource({
            url: this._url,
            queryParameters: {
                f: "png",
                bbox: "{westDegrees},{southDegrees},{eastDegrees},{northDegrees}",
                crs: "crs:84",
                width: "{width}",
                height: "{height}"
            }
        });
        const provider = new UrlTemplateImageryProvider({
            url: resource,
            minimumLevel: 1,
            maximumLevel: 30,
            tilingScheme: new GeographicTilingScheme({ ellipsoid: Ellipsoid.WGS84 }),
            tileWidth: OGC_MAPS_TILE_SIZE,
            tileHeight: OGC_MAPS_TILE_SIZE,
            rectangle: extents
        });
        if (provider != undefined) {
            this.provider = provider;
        }
    }
}
