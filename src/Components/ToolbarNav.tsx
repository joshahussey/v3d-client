import { JSX, createEffect } from "solid-js";
import { useToolbarStateContext } from "../Context/ToolbarStateContext";
import { ToolbarButton } from "./Components";

/**
 * Represents a component for rendering the toolbar navigation with various buttons.
 * @returns {JSX.Element} A JSX element representing the toolbar navigation.
 */
export function ToolbarNav(): JSX.Element {
    const {
        isLayersOpened,
        setLayersOpened,
        isLayersOrderOpened,
        setLayersOrderOpened,
        isBasemapTerrainOpened,
        setBasemapTerrainOpened
    } = useToolbarStateContext() as any;
    const layerOrderIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fit=""
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
            focusable="false"
            fill={isLayersOrderOpened() ? "#212121" : "#939393"}
            class="toolbar-button-image"
        >
            <g id="swap_vert">
                <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/>
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
            fill={isBasemapTerrainOpened() ? "#212121" : "#939393"}
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
            fill={isLayersOpened() ? "#212121" : "#939393"}
            class="toolbar-button-image"
        >
            <g id="layers">
                <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z" />
            </g>
        </svg>
    );
    return (
        <div class="cslt-toolbar-expanded">
            <div class="csltToolbarHeader">
                <span class="toolbarLayersLabel">Layers</span>
                <ToolbarButton
                    id="Layers"
                    icon={layerOrderIcon}
                    onClick={() => {
                        if (!isLayersOpened()) {
                            setLayersOpened(!isLayersOpened())
                        }
                        setLayersOrderOpened(!isLayersOrderOpened());
                    }}
                    text="Layers"
                />
                <ToolbarButton
                    id="Layers"
                    icon={basemapTerrainOpenedIcon}
                    onClick={() => {
                        if (!isLayersOpened()) {
                            setLayersOpened(!isLayersOpened())
                        }
                        setBasemapTerrainOpened(!isBasemapTerrainOpened());
                    }}
                    text="Layers"
                />
                <ToolbarButton
                    id="Layers"
                    icon={layersOpened}
                    onClick={() => {
                        setLayersOpened(!isLayersOpened());
                    }}
                    text="Layers"
                />
            </div>
        </div>
    );
}
