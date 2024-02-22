import { useToolbarStateContext } from "../Context/ToolbarStateContext";
import ClickOutsideToolbar from "./Directives/ClickOutsideToolbar";

export function CatalogView() {
    const { setCatalogOpened } = useToolbarStateContext() as any;

    (window as any).setCatalogOpen = function (isOpen: boolean) {
        setCatalogOpened(isOpen);
    };

    const classificationParameters =
        "&resourceTypeClassifications=urn:ogc:serviceType:WebMapService" +
        "&resourceTypeClassifications=urn:ogc:serviceType:WebMapTileService" +
        "&resourceTypeClassifications=urn:ogc:serviceType:LiveWebMapService" +
        //"&resourceTypeClassifications=urn:ogc:serviceType:WebFeatureService" +
        "&resourceTypeClassifications=urn:ogc:serviceType:WebCoverageService" +
        "&resourceTypeClassifications=urn:ogc:serviceType:3DTiles" +
        //"&resourceTypeClassifications=urn:ogc:serviceType:ArcGisFeatureServer" +
        //"&resourceTypeClassifications=urn:ogc:serviceType:ArcGisMapServer" +
        "&resourceTypeClassifications=urn:ogc:serviceType:OgcApiCoverages" +
        "&resourceTypeClassifications=urn:ogc:serviceType:OgcApiFeature" +
        "&resourceTypeClassifications=urn:ogc:serviceType:OgcApiMaps" +
        "&resourceTypeClassifications=urn:ogc:serviceType:OgcApiProcesses" +
        "&resourceTypeClassifications=urn:ogc:serviceType:OgcApiTiles";

    return (
        <iframe
            use:ClickOutsideToolbar={() => setCatalogOpened(false)}
            class="cslt-toolbar-iframe"
            id="CatalogView"
            src={"/wes/CSWSearchClient/pages/view.jsp?entryPoint=browseCatalog" + classificationParameters}
            width="1000px"
            height="720px"
        />
    );
}
