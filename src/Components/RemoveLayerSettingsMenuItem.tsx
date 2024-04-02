import { Cesium3DTileset, GeoJsonDataSource, ImageryLayer, KmlDataSource } from "cesium";
import { CesiumWindow, Wes3DTileSet, WesImageryLayer } from "../types";
import WesDataSource from "../Datasources/WesDataSource";
import CoverageApiDataSource from "../Datasources/CoverageApiDataSource";
import { UIContextType, useInterfaceContext } from "../Context/UIContext";
import { JSX, Show } from "solid-js";
import CelestialBodyDataSource from "../Datasources/CelestialBodyDataSource";
import { translate as t } from "../i18n/Translator";

/**
 * Represents a component for a button to delete a layer from the map.
 * @param {(WesDataSource | WesImageryLayer | Wes3DTileSet)[]} props.layers A list of layer objects to remove.
 * @param {() => void} props.onDone - A function to call upon completion of layer removal.
 * @returns {JSX.Element} A JSX element representing the delete layer button.
 */
export function RemoveLayerSettingsMenuItem(props: {
    layers: (WesDataSource | WesImageryLayer | Wes3DTileSet)[];
    onDone: () => void;
}): JSX.Element {
    const { layers, onDone } = props;
    const { sourcesWithLegends, setSourcesWithLegends, osmBuildingsLayer, setOsmBuildingsLayer } =
        useInterfaceContext() as UIContextType;

    function removeLayers() {
        onDone()
        for (const layer of layers) {
            if (layer && layer instanceof WesDataSource) {
                (window as CesiumWindow).Map3DViewer.dataSources.remove(layer);
                setSourcesWithLegends(sourcesWithLegends().filter(source => source.uid !== layer.uid));
                if (layer && layer instanceof CelestialBodyDataSource) {
                    layer.setServiceRunning(false);
                }
            }
            if (layer && layer instanceof ImageryLayer) {
                (window as CesiumWindow).Map3DViewer.imageryLayers.remove(layer);
                setSourcesWithLegends(sourcesWithLegends().filter(source => source.uid !== layer.uid));
            }
            if (layer && layer instanceof Cesium3DTileset) {
                const osmBuildingsId = osmBuildingsLayer();
                if (osmBuildingsId && layer.uid == osmBuildingsId) {
                    setOsmBuildingsLayer("");
                }
                (window as CesiumWindow).Map3DViewer.scene.primitives.remove(layer);
                window.dispatchEvent(new Event("tilesetRemoved"));
            }
            if (layer && layer instanceof CoverageApiDataSource) {
                (window as CesiumWindow).Map3DViewer.scene.primitives.remove(layer._renderedPrimitive);
                (window as CesiumWindow).removeEventListener("timeChanged", layer._listener);
                layer._removed = true;
                layer._renderedPrimitive = undefined;
                if (layer._hasLegend) {
                    setSourcesWithLegends(sourcesWithLegends().filter(source => source.uid !== layer._uid));
                }
                (window as CesiumWindow).Map3DViewer.dataSources.remove(layer, true);
                window.dispatchEvent(new Event("tilesetRemoved"));
            }
            if (layer && (layer instanceof GeoJsonDataSource || layer instanceof KmlDataSource)) {
                (window as CesiumWindow).Map3DViewer.dataSources.remove(layer);
            }
        }
    }

    return (
        <li onClick={removeLayers}>
            <Show when={true}>
                <svg
                    class="settings-menu-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid meet"
                    viewBox="0 0 24 24"
                >
                    <g id="delete_cache165">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </g>
                </svg>
                <span class="settings-menu-text">
                    {layers.length > 1 ? t("serviceSettingsMenuRemove") : t("layerSettingsMenuRemove")}
                </span>
            </Show>
        </li>
    );
}
