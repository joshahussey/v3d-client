import { CesiumWindow, WesDatasources } from "../Wes";
import AoiDataSource from "../Datasources/AoiDataSource";
import { standAloneLayersServiceLabel, standAloneLayersServiceUID, standAloneLayersServiceUrl } from "../Constants";

export async function handleAoiEvent(event: string) {
    let eventContent = decodeURIComponent(decodeURIComponent(event));
    const params = new URLSearchParams(eventContent);

    const aoisContent = params.get("AOIS");
    if (!aoisContent) {
        console.error("Received AOI update event without AOI key.");
        return;
    }
    const aoisArr = JSON.parse(aoisContent);

    let geoJson = aoisArr && aoisArr.length > 0 ? aoisArr[0] : undefined;

    const viewer = (window as CesiumWindow).Map3DViewer;
    const datasources = viewer.dataSources as WesDatasources;

    let uncastAoiDatasource = datasources._dataSources.find(ds => (ds as any).uid === "AOI");
    let aoiDatasource: AoiDataSource;

    if (geoJson) {
        if (uncastAoiDatasource == null) {
            const serviceInfo = {
                serviceId: standAloneLayersServiceUID,
                serviceTitle: standAloneLayersServiceLabel,
                serviceUrl: standAloneLayersServiceUrl
            }
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
        uncastAoiDatasource = null;
    }
}
