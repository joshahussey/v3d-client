import { JSX, createEffect } from "solid-js";
import { useToolbarStateContext } from "../Context/ToolbarStateContext";
import { Geocoder } from "cesium";
import { CesiumWindow } from "../Wes";
/**
 * Represents a component for handling search functionality and toggling search state.
 * @returns {JSX.Element} A JSX element representing the search component.
 */
export function Search(): JSX.Element {
    const { isSearchOpened, setSearchOpened } = useToolbarStateContext() as any;

    let searchRef: any;
    createEffect(() => {
        if (isSearchOpened) {
            new Geocoder({
                container: searchRef,
                scene: (window as CesiumWindow).Map3DViewer.scene
            });
            const geoCoderForm = searchRef.querySelector("form")!;
            const geoCoderResults = searchRef.querySelector("div")!;
            const geoCoderInput = geoCoderForm.querySelector("input")!;
            const geoCoderSpan = geoCoderForm.querySelector("span")!;
            searchRef.appendChild(geoCoderSpan);
            geoCoderForm.classList.add("cslt-cesium-toolbar-search-form");
            geoCoderInput.classList.add("cslt-cesium-toolbar-search-input");
            geoCoderSpan.classList.add("cslt-cesium-toolbar-search-span");
            geoCoderSpan.classList.remove("cesium-geocoder-searchButton");
            geoCoderSpan.removeChild(geoCoderSpan.querySelector("svg")!);
            const img = document.createElement("img");
            img.src = "./Icons/search.png";
            geoCoderSpan.appendChild(img);
            const searchInput = document.getElementById("SearchInput")!;
            searchInput.appendChild(geoCoderForm);
            searchInput.appendChild(geoCoderResults);
            geoCoderResults.style.display = "unset";
            geoCoderResults.classList.add("cslt-cesium-toolbar-search-results");
            const navigationControls = document.getElementsByClassName("navigation-controls");
            navigationControls[0].children[1].classList.add("display-none");
        }
    });

    return (
        <div
            id="SearchDiv"
            class="cesium-button cslt-search-div"
            ref={searchRef}
            onClick={() => {
                setSearchOpened(!isSearchOpened());
            }}
            title="Search"
        />
    );
}
