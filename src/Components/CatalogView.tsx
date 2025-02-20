import { useToolbarStateContext, ToolbarContextType } from "../Context/ToolbarStateContext";
import { CesiumWindow, ServiceInfo } from "../Types/types";
import { Stac } from "./Stac/stac.es.js";
import ClickOutsideToolbar from "./Directives/ClickOutsideToolbar";
import { createSignal } from "solid-js";
import "./Stac/components3d.css";
import { addCOG, raiseMapStateChangedEvent } from "../Utils/Controller";
import { addCOGObject } from "../Types/3dMapControllerTypes";

export function CatalogView() {
    const { setCatalogOpened } = useToolbarStateContext() as ToolbarContextType;

    type StacCallbackInputType = { asset: StacAssetObject; feature: StacItem };
    function addStacItemToMap(stacItemProj: StacCallbackInputType) {
        const arg = {
            uid: `${stacItemProj.feature.id}/${stacItemProj.asset.title}`,
            url: stacItemProj.asset.href,
            name: stacItemProj.asset.title,
            description: stacItemProj.asset.description,
            type: "COG",
            projection: stacItemProj.feature.properties["proj:epsg"]?.toString() ?? "4326",
            serviceInfo: {
                serviceTitle: stacItemProj.feature.id,
                serviceId: stacItemProj.feature.id,
                serviceUrl: stacItemProj.feature.links.href
            } as ServiceInfo
        } as addCOGObject;
        addCOG([arg] as [addCOGObject]);
        raiseMapStateChangedEvent();
    }

    (window as CesiumWindow).setCatalogOpen = function (isOpen: boolean) {
        setCatalogOpened(isOpen);
    };
    const bbox = createSignal("");
    const intersects = createSignal("");
    const datetime = createSignal("");
    const selectCallback = addStacItemToMap;
    /*const classificationParameters =
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
        "&resourceTypeClassifications=urn:ogc:serviceType:OgcApiTiles";*/

    return (
        // <iframe
        //     use:ClickOutsideToolbar={() => setCatalogOpened(false)}
        //     class="cslt-toolbar-iframe"
        //     id="CatalogView"
        //     src={"/wes/CSWSearchClient/pages/view.jsp?entryPoint=browseCatalog&is3DClient=true"} // + classificationParameters}
        //     width="1000px"
        //     height="720px"
        // />
        <Stac
            url="https://earth-search.aws.element84.com/v0"
            bboxSignal={bbox}
            intersectsSignal={intersects}
            datetimeSignal={datetime}
            selectCallback={selectCallback}
        />
    );
}
