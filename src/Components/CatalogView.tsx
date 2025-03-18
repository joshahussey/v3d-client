import { useToolbarStateContext, ToolbarContextType } from "../Context/ToolbarStateContext";
import { ServiceInfo } from "../Types/types";
import { Stac } from "./Stac/stac.es.js";
import ClickOutsideToolbar from "./Directives/ClickOutsideToolbar";
import { createSignal, Show } from "solid-js";
import "./Stac/components3d.css";
import { addCOG, getMapState, raiseMapStateChangedEvent, setMapState } from "../Utils/Controller";
import { addCatalogObj, addCOGObject } from "../Types/3dMapControllerTypes";
import { createOptions, Select } from "@thisbeyond/solid-select";
import { OPENED_LAYER_PAGE } from "../Constants";
import { translate as t } from "../i18n/Translator";

export function CatalogView() {
    const defaultCatalog = {
        uid: "stac-fastapi",
        title: "stac-fastapi",
        url: "https://datacube.services.geo.ca/stac/api",
        type: "STAC"
    };
    const { setOpenedLayerPage } = useToolbarStateContext() as ToolbarContextType;
    const [isCatalogSelected, setIsCatalogSelected] = createSignal(false);
    const [selectedCatalog, setSelectedCatalog] = createSignal<addCatalogObj>(defaultCatalog);

    function parseCatalogOptions() {
        const mapState = getMapState();
        if (!mapState.catalogList.some((opt: addCatalogObj) => opt.uid === defaultCatalog.uid)) {
            mapState.catalogList.unshift(defaultCatalog);
        }
        return createOptions(mapState.catalogList, { key: "title" });
    }

    function removeCatalogOption(optToRemove: addCatalogObj) {
        if (optToRemove.uid === defaultCatalog.uid) {
            console.warn("Cannot remove default catalog.");
            return;
        }
        const mapState = getMapState();
        mapState.catalogList = mapState.catalogList.filter((opt: addCatalogObj) => opt.uid !== optToRemove.uid);
        setCatalogOptionsSignal(parseCatalogOptions());
        setSelectedCatalog(defaultCatalog);
        setMapState(mapState);
    }

    const [catalogOptionsSignal, setCatalogOptionsSignal] = createSignal(parseCatalogOptions());

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
        setOpenedLayerPage(OPENED_LAYER_PAGE.LAYERS);
    }

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
        <>
            <Show when={!isCatalogSelected()}>
                <div id="catalogSelectorDiv">
                    <div id="catalogSelectorSelectDiv">
                        <Select
                            class="catalogSelector"
                            placeholder="Select Catalog."
                            onChange={setSelectedCatalog}
                            initialValue={selectedCatalog()}
                            {...catalogOptionsSignal()}
                        />
                    </div>

                    <div id="catalogSelectorButtonsDiv">
                        <button
                            id="catalogDeleteButton"
                            onClick={() => {
                                removeCatalogOption(selectedCatalog());
                            }}
                        >
                            {t("catalogRemove")}
                        </button>
                        <button
                            id="catalogViewButton"
                            onClick={() => {
                                setIsCatalogSelected(true);
                            }}
                        >
                            {t("catalogView")}
                        </button>
                    </div>
                </div>
            </Show>
            <Show when={isCatalogSelected()}>
                <div use:ClickOutsideToolbar={() => setOpenedLayerPage(OPENED_LAYER_PAGE.CLOSED)}>
                    <Stac
                        url={selectedCatalog().url}
                        bboxSignal={bbox}
                        intersectsSignal={intersects}
                        datetimeSignal={datetime}
                        selectCallback={selectCallback}
                    />
                </div>
            </Show>
        </>
    );
}
