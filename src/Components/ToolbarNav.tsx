import { JSX } from "solid-js";
import { ToolbarContextType, useToolbarStateContext } from "../Context/ToolbarStateContext";
import { ToolbarButton } from "./Components";
import { translate as t } from "../i18n/Translator";
import { OPENED_LAYER_PAGE } from "../Constants";

/**
 * Represents a component for rendering the toolbar navigation with various buttons.
 * @returns {JSX.Element} A JSX element representing the toolbar navigation.
 */
export function ToolbarNav(): JSX.Element {
    const { openedLayerPage, setOpenedLayerPage } = useToolbarStateContext() as ToolbarContextType;
    const layerOrderIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
            fill={openedLayerPage() == OPENED_LAYER_PAGE.LAYER_ORDER ? "#212121" : "#939393"}
            class="toolbar-button-image"
        >
            <g id="swap_vert">
                <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z" />
            </g>
        </svg>
    );
    const layersOpened = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
            fill={openedLayerPage() == OPENED_LAYER_PAGE.LAYERS ? "#212121" : "#939393"}
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
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
            fill={openedLayerPage() == OPENED_LAYER_PAGE.SEARCH ? "#212121" : "#939393"}
            class="toolbar-button-image"
        >
            <g id="search">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </g>
        </svg>
    );

    const saveViewIcon = (
        <svg viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" class="toolbar-button-image">
            <defs />
            <g
                id="Icon-Set"
                transform="translate(-464.000000, -1087.000000)"
                fill={openedLayerPage() == OPENED_LAYER_PAGE.SAVE_VIEW ? "#212121" : "#939393"}
            >
                <path
                    d="M480,1117 C472.268,1117 466,1110.73 466,1103 C466,1095.27 472.268,1089 480,1089 C487.732,1089 494,1095.27 494,1103 C494,1110.73 487.732,1117 480,1117 L480,1117 Z M480,1087 C471.163,1087 464,1094.16 464,1103 C464,1111.84 471.163,1119 480,1119 C488.837,1119 496,1111.84 496,1103 C496,1094.16 488.837,1087 480,1087 L480,1087 Z M486,1102 L481,1102 L481,1097 C481,1096.45 480.553,1096 480,1096 C479.447,1096 479,1096.45 479,1097 L479,1102 L474,1102 C473.447,1102 473,1102.45 473,1103 C473,1103.55 473.447,1104 474,1104 L479,1104 L479,1109 C479,1109.55 479.447,1110 480,1110 C480.553,1110 481,1109.55 481,1109 L481,1104 L486,1104 C486.553,1104 487,1103.55 487,1103 C487,1102.45 486.553,1102 486,1102 L486,1102 Z"
                    id="plus-circle"
                />
            </g>
        </svg>
    );

    const loadViewIcon = (
        <svg viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" class="toolbar-button-image">
            <defs />
            <g
                id="Icon-Set"
                transform="translate(-261.000000, -99.000000)"
                fill={openedLayerPage() == OPENED_LAYER_PAGE.LOAD_VIEW ? "#212121" : "#939393"}
            >
                <path
                    d="M281,127 C281,128.104 280.104,129 279,129 L265,129 C263.896,129 263,128.104 263,127 L263,105 C263,103.896 263.896,103 265,103 L279,103 C280.104,103 281,103.896 281,105 L281,127 L281,127 Z M279,101 L279,99 L277,99 L277,101 L273,101 L273,99 L271,99 L271,101 L267,101 L267,99 L265,99 L265,101 C262.791,101 261,102.791 261,105 L261,127 C261,129.209 262.791,131 265,131 L279,131 C281.209,131 283,129.209 283,127 L283,105 C283,102.791 281.209,101 279,101 L279,101 Z M278,109 L266,109 C265.448,109 265,109.448 265,110 C265,110.553 265.448,111 266,111 L278,111 C278.552,111 279,110.553 279,110 C279,109.448 278.552,109 278,109 L278,109 Z M278,121 L266,121 C265.448,121 265,121.447 265,122 C265,122.553 265.448,123 266,123 L278,123 C278.552,123 279,122.553 279,122 C279,121.447 278.552,121 278,121 L278,121 Z M278,115 L266,115 C265.448,115 265,115.448 265,116 C265,116.553 265.448,117 266,117 L278,117 C278.552,117 279,116.553 279,116 C279,115.448 278.552,115 278,115 L278,115 Z"
                    id="notebook"
                />
            </g>
        </svg>
    );

    const catalogIcon = (
        <svg
            viewBox="0 0 32 32"
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
            class="toolbar-button-image"
        >
            <g
                transform="translate(0.000000,32.000000) scale(0.100000,-0.100000)"
                fill={openedLayerPage() == OPENED_LAYER_PAGE.CATALOG ? "#212121" : "#939393"}
                stroke="none"
            >
                <path d="M73 249 c-59 -68 -61 -72 -61 -124 0 -31 6 -59 13 -65 12 -10 151 -60 166 -60 5 0 32 29 60 65 46 56 53 71 55 115 3 60 -10 73 -30 28 -8 -18 -32 -52 -53 -76 l-38 -43 -72 22 c-56 17 -73 26 -73 41 0 10 1 18 3 18 1 0 31 -9 67 -20 36 -11 68 -20 72 -20 14 0 129 143 121 150 -7 6 -44 15 -148 36 -15 3 -36 -15 -82 -67z m120 15 c44 -10 32 -27 -15 -20 -22 4 -45 9 -50 12 -14 9 2 25 20 20 10 -3 29 -8 45 -12z m43 -179 c-26 -30 -50 -55 -54 -55 -25 0 -142 47 -142 57 0 17 14 16 90 -8 l65 -20 39 46 c21 25 41 43 44 41 3 -3 -16 -30 -42 -61z" />
            </g>
        </svg>
    );

    return (
        <div class="cslt-toolbar-expanded">
            <div class="csltToolbarHeader">
                <span
                    class="toolbarLayersLabel"
                    onClick={() => {
                        if (openedLayerPage() == OPENED_LAYER_PAGE.CLOSED) {
                            setOpenedLayerPage(OPENED_LAYER_PAGE.LAYERS);
                        } else {
                            setOpenedLayerPage(OPENED_LAYER_PAGE.CLOSED);
                        }
                    }}
                >
                    {t("toolbarNavLayers")}
                </span>
                <ToolbarButton
                    id="SearchButton"
                    icon={searchOpenedIcon}
                    onClick={() => {
                        if (openedLayerPage() == OPENED_LAYER_PAGE.SEARCH) {
                            setOpenedLayerPage(OPENED_LAYER_PAGE.CLOSED);
                        } else {
                            setOpenedLayerPage(OPENED_LAYER_PAGE.SEARCH);
                        }
                    }}
                    text={t("searchButtonText")}
                />
                <ToolbarButton
                    id="LayerOrderButton"
                    icon={layerOrderIcon}
                    onClick={() => {
                        if (openedLayerPage() == OPENED_LAYER_PAGE.LAYER_ORDER) {
                            setOpenedLayerPage(OPENED_LAYER_PAGE.CLOSED);
                        } else {
                            setOpenedLayerPage(OPENED_LAYER_PAGE.LAYER_ORDER);
                        }
                    }}
                    text={t("layerOrderButtonText")}
                />
                <ToolbarButton
                    id="SaveViewButton"
                    icon={saveViewIcon}
                    onClick={() => {
                        if (openedLayerPage() == OPENED_LAYER_PAGE.SAVE_VIEW) {
                            setOpenedLayerPage(OPENED_LAYER_PAGE.CLOSED);
                        } else {
                            setOpenedLayerPage(OPENED_LAYER_PAGE.SAVE_VIEW);
                        }
                    }}
                    text={t("saveViewButtonText")}
                />
                <ToolbarButton
                    id="LoadViewButton"
                    icon={loadViewIcon}
                    onClick={() => {
                        if (openedLayerPage() == OPENED_LAYER_PAGE.LOAD_VIEW) {
                            setOpenedLayerPage(OPENED_LAYER_PAGE.CLOSED);
                        } else {
                            setOpenedLayerPage(OPENED_LAYER_PAGE.LOAD_VIEW);
                        }
                    }}
                    text={t("loadViewButtonText")}
                />
                <ToolbarButton
                    id="CatalogViewButton"
                    icon={catalogIcon}
                    onClick={() => {
                        if (openedLayerPage() == OPENED_LAYER_PAGE.CATALOG) {
                            setOpenedLayerPage(OPENED_LAYER_PAGE.CLOSED);
                        } else {
                            setOpenedLayerPage(OPENED_LAYER_PAGE.CATALOG);
                        }
                    }}
                    text={t("openCatalogText")}
                />
                <ToolbarButton
                    id="LayersButton"
                    icon={layersOpened}
                    onClick={() => {
                        if (openedLayerPage() == OPENED_LAYER_PAGE.LAYERS) {
                            setOpenedLayerPage(OPENED_LAYER_PAGE.CLOSED);
                        } else {
                            setOpenedLayerPage(OPENED_LAYER_PAGE.LAYERS);
                        }
                    }}
                    text={t("layersButtonText")}
                />
            </div>
        </div>
    );
}
