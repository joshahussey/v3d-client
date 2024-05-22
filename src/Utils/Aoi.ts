import { CesiumWindow, GeoJsonAoi, WesDatasources } from "../Types/types";
import AoiDataSource from "../Datasources/AoiDataSource";
import { standAloneLayersServiceLabel, standAloneLayersServiceUID, standAloneLayersServiceUrl } from "../Constants";

export async function updateAoi(aoiJson: GeoJsonAoi[]) {
    const geoJson = aoiJson && aoiJson.length > 0 ? aoiJson[0] : undefined;

    const viewer = (window as CesiumWindow).Map3DViewer;
    const datasources = viewer.dataSources as WesDatasources;

    let uncastAoiDatasource = datasources._dataSources.find(ds => ds.uid === "AOI");
    let aoiDatasource: AoiDataSource;

    if (geoJson) {
        if (uncastAoiDatasource == null) {
            const serviceInfo = {
                serviceId: standAloneLayersServiceUID,
                serviceTitle: standAloneLayersServiceLabel,
                serviceUrl: standAloneLayersServiceUrl
            };
            aoiDatasource = new AoiDataSource(viewer, geoJson, serviceInfo);
            viewer.dataSources.add(aoiDatasource);
            aoiDatasource.initialize();
        } else {
            aoiDatasource = uncastAoiDatasource as AoiDataSource;
            aoiDatasource.setAoiObject(geoJson);
            aoiDatasource.loadService();
        }
    } else if (uncastAoiDatasource) {
        viewer.dataSources.remove(uncastAoiDatasource);
        uncastAoiDatasource = undefined;
    }
}
