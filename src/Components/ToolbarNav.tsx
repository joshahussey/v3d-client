import { JSX, createEffect } from "solid-js";
import { useToolbarStateContext } from "../Context/ToolbarStateContext";
import { ToolbarButton } from "./Components";
import { translate as t } from "../i18n/Translator";
import { MapModeRockerButton } from "./MapModeRockerButton";

/**
 * Represents a component for rendering the toolbar navigation with various buttons.
 * @returns {JSX.Element} A JSX element representing the toolbar navigation.
 */
export function ToolbarNav(): JSX.Element {
    const {
        isLayersOpened,
        setLayersOpened,
        isLayersTreeOpened,
        setLayersTreeOpened,
        isLayersOrderOpened,
        setLayersOrderOpened,
        isBasemapTerrainOpened,
        setBasemapTerrainOpened,
        isSearchOpened,
        setSearchOpened,
    } = useToolbarStateContext() as any;
    const layerOrderIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fit=""
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
            focusable="false"
            fill={isLayersOpened() && isLayersOrderOpened() ? "#212121" : "#939393"}
            class="toolbar-button-image"
        >
            <g id="swap_vert">
                <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z" />
            </g>
        </svg>
    );
    const basemapTerrainOpenedIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fit=""
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
            focusable="false"
            fill={isLayersOpened() && isBasemapTerrainOpened() ? "#212121" : "#939393"}
            class="toolbar-button-image"
        >
            <g id="map">
                <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
            </g>
        </svg>
    );
    const layersOpened = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fit=""
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
            focusable="false"
            fill={isLayersOpened() && isLayersTreeOpened() ? "#212121" : "#939393"}
            class="toolbar-button-image"
        >
            <g id="layers">
                <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z" />
            </g>
        </svg>
    );
    const searchOpenedIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fit=""
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
            focusable="false"
            fill={isLayersOpened() && isSearchOpened() ? "#212121" : "#939393"}
            class="toolbar-button-image">
            <g id="search">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z">
                </path>
            </g>
        </svg>
    );
    createEffect(() => {
        if (isSearchOpened()) {
            setLayersOpened(true);
            setLayersTreeOpened(false);
            setLayersOrderOpened(false);
            setBasemapTerrainOpened(false);
        }
    }
    );
    createEffect(() => {
        if (isLayersOrderOpened()) {
            setLayersOpened(true);
            setLayersTreeOpened(false);
            setSearchOpened(false);
            setBasemapTerrainOpened(false);
        }
    }
    );
    createEffect(() => {
        if (isBasemapTerrainOpened()) {
            setLayersOpened(true);
            setLayersTreeOpened(true);
            setSearchOpened(false);
            setLayersOrderOpened(false);
        }
    }
    );
    createEffect(() => {
        if (isLayersTreeOpened()) {
            setLayersOpened(true);
            setSearchOpened(false);
            setLayersOrderOpened(false);
        }
    }
    );
    createEffect(() => {
        if (!isLayersTreeOpened() && !isLayersOrderOpened() && !isSearchOpened()){
            setLayersOpened(false);
        }
    }
    );

    return (
        <div class="cslt-toolbar-expanded">
            <div class="csltToolbarHeader">
                <span
                    class="toolbarLayersLabel"
                    onClick={() => {
                        if(!isLayersOpened() && !isLayersTreeOpened() && !isLayersOrderOpened() && !isSearchOpened()){
                            setLayersTreeOpened(true);
                            setLayersOpened(true);
                        } else {
                            setLayersOpened(!isLayersOpened());
                        }
                    }}
                >
                    {t("toolbarNavLayers")}
                </span>
                <MapModeRockerButton />
                <ToolbarButton id="SearchButton"
                    icon={searchOpenedIcon}
                    onClick={() => { setSearchOpened(!isSearchOpened()); }}
                    text={t("searchButtonText")} />
                <ToolbarButton
                    id="LayerOrderButton"
                    icon={layerOrderIcon}
                    onClick={() => { setLayersOrderOpened(!isLayersOrderOpened()); }}
                    text={t("layerOrderButtonText")}
                />
                <ToolbarButton
                    id="BasemapTerrainButton"
                    icon={basemapTerrainOpenedIcon}
                    onClick={() => { setBasemapTerrainOpened(!isBasemapTerrainOpened()); }}
                    text={t("basemapTerrainButtonText")}
                />
                <ToolbarButton
                    id="LayersButton"
                    icon={layersOpened}
                    onClick={() => { setLayersTreeOpened(!isLayersTreeOpened()); }}
                    text={t("layersButtonText")}
                />
            </div>
        </div>
    );
}
