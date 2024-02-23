import { JSX, createEffect } from "solid-js";
import { useToolbarStateContext } from "../Context/ToolbarStateContext";
import { ToolbarButton } from "./Components";
import { CesiumWindow } from "../Wes";

/**
 * Represents a component for rendering the toolbar navigation with various buttons.
 * @returns {JSX.Element} A JSX element representing the toolbar navigation.
 */
export function ToolbarNav(): JSX.Element {
    const viewer = (window as CesiumWindow).Map3DViewer;
    const {
        isLayersOpened,
        setLayersOpened,
        isSaveOpened,
        setSaveOpened,
        isLoadOpened,
        setLoadOpened,
        isCatalogOpened,
        setCatalogOpened,
        isSearchOpened,
        setSearchOpened
    } = useToolbarStateContext() as any;
    createEffect(() => {
        if (isLayersOpened()) {
            setSaveOpened(false);
            setLoadOpened(false);
            setCatalogOpened(false);
            setSearchOpened(false);
        }
    });
    createEffect(() => {
        if (isSaveOpened()) {
            setLayersOpened(false);
            setLoadOpened(false);
            setCatalogOpened(false);
            setSearchOpened(false);
        }
    });
    createEffect(() => {
        if (isLoadOpened()) {
            setSaveOpened(false);
            setLayersOpened(false);
            setCatalogOpened(false);
            setSearchOpened(false);
        }
    });
    createEffect(() => {
        if (isCatalogOpened()) {
            setSaveOpened(false);
            setLoadOpened(false);
            setLayersOpened(false);
            setSearchOpened(false);
        }
    });
    createEffect(() => {
        if (isSearchOpened()) {
            setSaveOpened(false);
            setLoadOpened(false);
            setLayersOpened(false);
            setCatalogOpened(false);
        }
    });
    return (
        <ul id="toolbar-navigation" class="toolbar-navigation flex">
            <li>
                <ToolbarButton
                    id="Home"
                    icon="./Icons/home.png"
                    onClick={() => {
                        viewer.camera.flyHome(0.5);
                    }}
                    text="Home"
                />
            </li>
            <li>
                <ToolbarButton
                    id="Layers"
                    icon="./Icons/layers.png"
                    onClick={() => {
                        setLayersOpened(!isLayersOpened());
                    }}
                    text="Layers"
                />
            </li>
            <li>
                <ToolbarButton
                    id="SaveButton"
                    icon="./Icons/save.png"
                    onClick={() => {
                        setSaveOpened(!isSaveOpened());
                    }}
                    text="Save view"
                />
            </li>
            <li>
                <ToolbarButton
                    id="LoadButton"
                    icon="./Icons/load.png"
                    onClick={() => {
                        setLoadOpened(!isLoadOpened());
                    }}
                    text="Load view"
                />
            </li>
            <li>
                <ToolbarButton
                    id="CatalogueButton"
                    icon="./Icons/browse_catalog_v4.png"
                    onClick={() => {
                        setCatalogOpened(!isCatalogOpened());
                    }}
                    text="Browse catalogue"
                />
            </li>
            <li>
                <ToolbarButton
                    id="SearchButton"
                    icon="./Icons/search_location.png"
                    onClick={() => {
                        setSearchOpened(!isSearchOpened());
                    }}
                    text="Search"
                />
            </li>
        </ul>
    );
}
