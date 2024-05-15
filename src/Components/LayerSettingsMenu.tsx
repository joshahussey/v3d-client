import { JSX, Show, Accessor } from "solid-js";
import { WesImageryLayer, Wes3DTileSet } from "../Types/types";
import WesDataSource from "../Datasources/WesDataSource";
import { translate as t } from "../i18n/Translator";
import { RemoveLayerSettingsMenuItem } from "./RemoveLayerSettingsMenuItem";
import { zoomTo } from "../Utils/ZoomTo";

/**
 * Represents a component for a layer options menu that displays when a button is clicked.
 * @param {Accessor<boolean>} props.opened Accessor for whether a layer's settings is open
 * @param {(value: boolean) => void} props.setOpened Sets whether a layer's settings is open
 * @param {WesDataSource} props.datasource A datasource associated with the layer, if it exists
 * @param {WesImageryLayer} props.imageryLayer A imageryLayer associated with the layer, if it exists
 * @param {Wes3DTileSet} props.primitiveLayer A primitiveLayer associated with the layer, if it exists
 * @param {HTMLUListElement | undefined} props.ref A reference to the settings menu
 * @param {() => void} props.onFocusOutEvent The onFocusOut event
 * @param {(value: boolean) => void} props.setLayerSettingsMenuShown sets whether the layer settings is shown
 * @returns {JSX.Element} A JSX element representing the menu.
 */
export function LayerSettingsMenu(props: {
    opened: Accessor<boolean>;
    setOpened: (value: boolean) => void;
    datasource?: WesDataSource;
    imageryLayer?: WesImageryLayer;
    primitiveLayer?: Wes3DTileSet;
    ref: HTMLUListElement | undefined;
    onFocusOutEvent: () => void;
    setLayerSettingsMenuShown: (value: boolean) => void;
}): JSX.Element {
    const {
        opened,
        setOpened,
        datasource,
        imageryLayer,
        primitiveLayer,
        ref,
        onFocusOutEvent,
        setLayerSettingsMenuShown
    } = props;

    function openSettings() {
        setLayerSettingsMenuShown(false);
        setOpened(!opened());
    }

    function getLayer() {
        if (imageryLayer) {
            return imageryLayer;
        }
        if (datasource) {
            return datasource;
        }
        if (primitiveLayer) {
            return primitiveLayer;
        }
    }

    return (
        <ul
            id="layerSettingsMenu"
            class="layer-settings-menu-hidden"
            ref={ref}
            tabIndex={1}
            onFocusOut={onFocusOutEvent}
        >
            <li onClick={openSettings}>
                <Show when={true}>
                    <svg
                        class="layer-settings-menu-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid meet"
                        viewBox="0 0 24 24"
                    >
                        <g id="tune">
                            <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
                        </g>
                    </svg>
                    <span class="layer-settings-menu-text"> {t("layerSettingsMenuSettings")} </span>
                </Show>
            </li>
            <li
                onClick={() => {
                    setLayerSettingsMenuShown(false);
                    zoomTo(getLayer() as WesDataSource | WesImageryLayer | Wes3DTileSet);
                }}
            >
                <Show when={true}>
                    <svg
                        class="layer-settings-menu-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid meet"
                        viewBox="0 0 24 24"
                    >
                        <g id="zoom_in">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm2.5-4h-2v2H9v-2H7V9h2V7h1v2h2v1z" />
                        </g>
                    </svg>
                    <span class="layer-settings-menu-text"> {t("layerSettingsMenuZoom")} </span>
                </Show>
            </li>
            <RemoveLayerSettingsMenuItem
                layers={[getLayer()] as (WesDataSource | WesImageryLayer | Wes3DTileSet)[]}
                onDone={() => {
                    setLayerSettingsMenuShown(false);
                }}
            />
        </ul>
    );
}
