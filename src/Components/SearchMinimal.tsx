import { ToolbarContextType, useToolbarStateContext } from "../Context/ToolbarStateContext";
import { CesiumWindow } from "../Types/types";
import { JSX, createEffect } from "solid-js";
import { Geocoder } from "cesium";
import { OPENED_LAYER_PAGE, USE_CESIUM_GEOCODER } from "../Constants";
import { translate as t } from "../i18n/Translator";
import GeogratisGeoCoderService from "../Utils/GeogratisGeoCoderService";

/**
 * Represents a component for handling search functionality and toggling search state.
 * @returns {JSX.Element} A JSX element representing the search component.
 */
export function SearchMinimal(): JSX.Element {
    const { openedLayerPage } = useToolbarStateContext() as ToolbarContextType;
    let searchRef: HTMLDivElement | undefined;
    let isSearchCreated = false;
    createEffect(() => {
        if (openedLayerPage() == OPENED_LAYER_PAGE.SEARCH) {
            if (!isSearchCreated) {
                if (!searchRef) {
                    return;
                }
                const geocoders = USE_CESIUM_GEOCODER ? undefined : [new GeogratisGeoCoderService()];
                new Geocoder({
                    container: searchRef,
                    geocoderServices: geocoders,
                    scene: (window as CesiumWindow).Map3DViewer.scene
                });
                isSearchCreated = true;
                const geoCoderForm = searchRef.querySelector("form");
                if (!geoCoderForm) {
                    return;
                }
                const geoCoderResults = searchRef.querySelector("div");
                if (!geoCoderResults) {
                    return;
                }
                const geoCoderInput = geoCoderForm.querySelector("input");
                if (!geoCoderInput) {
                    return;
                }
                const geoCoderSpan = geoCoderForm.querySelector("span");
                if (!geoCoderSpan) {
                    return;
                }
                geoCoderForm.classList.add("cslt-cesium-toolbar-search-form");
                geoCoderInput.classList.add("cslt-cesium-toolbar-search-input");
                geoCoderSpan.classList.add("cslt-cesium-toolbar-search-span");
                geoCoderSpan.classList.remove("cesium-geocoder-searchButton");
                const svg = geoCoderSpan.querySelector("svg");
                if (svg) {
                    geoCoderSpan.removeChild(svg);
                }
                geoCoderSpan.textContent = t("geocoderSearchButton");
                searchRef.appendChild(geoCoderForm);
                searchRef.appendChild(geoCoderResults);
                geoCoderResults.style.display = "unset";
                geoCoderResults.classList.add("cslt-cesium-toolbar-search-results");
            }
        }
    });

    return <div ref={searchRef} id="SearchInput" class="cslt-search-input" />;
}
