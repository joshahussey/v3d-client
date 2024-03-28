import { ToolbarContextType, useToolbarStateContext } from "../Context/ToolbarStateContext";
import { CesiumWindow } from "../Wes";
import { JSX, createEffect } from "solid-js";
import { Geocoder } from "cesium";
import ClickOutsideToolbar from "./Directives/ClickOutsideToolbar";
import { USE_CESIUM_GEOCODER } from "../Constants";
import WesGeoCoderService from "../Utils/WesGeoCoderService";
import { translate as t } from "../i18n/Translator";

/**
 * Represents a component for handling search functionality and toggling search state.
 * @returns {JSX.Element} A JSX element representing the search component.
 */
export function Search(): JSX.Element {
    const { isSearchOpened, setSearchOpened } = useToolbarStateContext() as ToolbarContextType;
    let searchRef: any;
    let isSearchCreated = false;
    createEffect(() => {
        if (isSearchOpened() != undefined) {
            if (!isSearchCreated) {
                const geocoders = USE_CESIUM_GEOCODER ? undefined : [new WesGeoCoderService()];
                new Geocoder({
                    container: searchRef,
                    geocoderServices: geocoders,
                    scene: (window as CesiumWindow).Map3DViewer.scene
                });
                isSearchCreated = true;
                const geoCoderForm = searchRef.querySelector("form")!;
                const geoCoderResults = searchRef.querySelector("div")!;
                const geoCoderInput = geoCoderForm.querySelector("input")!;
                const geoCoderSpan = geoCoderForm.querySelector("span")!;
                geoCoderForm.classList.add("cslt-cesium-toolbar-search-form");
                geoCoderInput.classList.add("cslt-cesium-toolbar-search-input");
                geoCoderSpan.classList.add("cslt-cesium-toolbar-search-span");
                geoCoderSpan.classList.remove("cesium-geocoder-searchButton");
                geoCoderSpan.removeChild(geoCoderSpan.querySelector("svg")!);
                const img = document.createElement("img");
                img.src = "./Icons/search.png";
                geoCoderSpan.appendChild(img);
                searchRef.appendChild(geoCoderForm);
                searchRef.appendChild(geoCoderResults);
                geoCoderResults.style.display = "unset";
                geoCoderResults.classList.add("cslt-cesium-toolbar-search-results");
            }
        }
    });

    return (
        <div class="search-panel" >
            <div class="search-panel-header-div">
                <span class="search-panel-header-label"> {t("searchPanelSearch")} </span>
            </div>
            <div ref={searchRef} id="SearchInput" class="cslt-search-input" />
        </div>
    );
}
