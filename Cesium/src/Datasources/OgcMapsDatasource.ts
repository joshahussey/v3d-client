import {
    Ellipsoid,
    GeographicTilingScheme,
    ImageryProvider,
    Resource,
    UrlTemplateImageryProvider,
    Viewer
} from "cesium";
import WesDataSource from "./WesDataSource";

export default class OgcMapsDatasource extends WesDataSource {
    provider?: ImageryProvider;
    constructor(description: string, name: string, url: string, viewer: Viewer, uid: string) {
        super(description, name, url, viewer, uid);
        this._url = url;
        this.initialize(1000);
    }
    loadService() {
        const urlArray = this._url.split("/");
        if (urlArray[urlArray.length - 1] !== "map") {
            this._url = this._url + "/map";
        }
        this.setProvider();
    }
    setProvider() {
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
        this.provider = new UrlTemplateImageryProvider({
            url: resource,
            minimumLevel: 1,
            maximumLevel: 20,
            tilingScheme: new GeographicTilingScheme({ ellipsoid: Ellipsoid.WGS84 }),
            tileWidth: 1500,
            tileHeight: 1500
        })!;
    }
}
