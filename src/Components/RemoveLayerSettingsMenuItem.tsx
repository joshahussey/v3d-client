import { Cesium3DTileset, GeoJsonDataSource, ImageryLayer, KmlDataSource } from "cesium";
import { CesiumWindow, WesDatasources } from "../Types/types";
import WesDataSource from "../Datasources/WesDataSource";
import CoverageApiDataSource from "../Datasources/CoverageApiDataSource";
import { UIContextType, useInterfaceContext } from "../Context/UIContext";
import { JSX, Show } from "solid-js";
import CelestialBodyDataSource from "../Datasources/CelestialBodyDataSource";
import { translate as t } from "../i18n/Translator";
import { Wes3dMapLayer } from "../Types/types";
import FeaturesApiDataSource from "../Datasources/FeaturesApiDataSource";

/**
 * Represents a component for a button to delete a layer from the map.
 * @param {(WesDataSource | WesImageryLayer | Wes3DTileSet)[]} props.layers A list of layer objects to remove.
 * @param {() => void} props.onDone - A function to call upon completion of layer removal.
 * @returns {JSX.Element} A JSX element representing the delete layer button.
 */
export function RemoveLayerSettingsMenuItem(props: { layers: Wes3dMapLayer[]; onDone: () => void }): JSX.Element {
    const { layers, onDone } = props;
    const { sourcesWithLegends, setSourcesWithLegends, osmBuildingsLayer, setOsmBuildingsLayer } =
        useInterfaceContext() as UIContextType;

    function removeLayers() {
        onDone();
        const cesiumWindow = window as CesiumWindow;
        const viewer = cesiumWindow.Map3DViewer;
        for (const layer of layers) {
            if (layer && layer instanceof WesDataSource) {
                viewer.dataSources.remove(layer);
                setSourcesWithLegends(sourcesWithLegends().filter(source => source.uid !== layer.uid));
                if (layer && layer instanceof CelestialBodyDataSource) {
                    layer.setServiceRunning(false);
                }
                if (layer && layer instanceof FeaturesApiDataSource) {
                    viewer.scene.camera.changed.removeEventListener(layer.reCluster);
                }
                layer.stop();
            }
            if (layer && layer instanceof ImageryLayer) {
                viewer.imageryLayers.remove(layer);
                setSourcesWithLegends(sourcesWithLegends().filter(source => source.uid !== layer.uid));
            }
            if (layer && layer instanceof Cesium3DTileset) {
                const osmBuildingsId = osmBuildingsLayer();
                if (osmBuildingsId && layer.uid == osmBuildingsId) {
                    setOsmBuildingsLayer("");
                }
                viewer.scene.primitives.remove(layer);
                window.dispatchEvent(new Event("tilesetRemoved"));
            }
            if (layer && layer instanceof CoverageApiDataSource) {
                viewer.scene.primitives.remove(layer._renderedPrimitive);
                cesiumWindow.removeEventListener("timeChanged", layer._listener as EventListener);
                layer._removed = true;
                layer._renderedPrimitive = undefined;
                if (layer._hasLegend) {
                    setSourcesWithLegends(sourcesWithLegends().filter(source => source.uid !== layer._uid));
                }
                viewer.dataSources.remove(layer, true);
                window.dispatchEvent(new Event("tilesetRemoved"));
            }
            if (layer && layer instanceof GeoJsonDataSource) {
                viewer.dataSources.remove(layer);
            }
            if (layer && layer instanceof KmlDataSource) {
                viewer.dataSources.remove(layer);
                let kmlCount = 0;
                for (let i = 0; i < (viewer.dataSources as WesDatasources)._dataSources.length; i++) {
                    const dataSource = (viewer.dataSources as WesDatasources)._dataSources[i];
                    if (dataSource instanceof KmlDataSource) {
                        kmlCount += 1;
                    }
                }
                if (kmlCount == 0) {
                    viewer.scene.globe.depthTestAgainstTerrain = true;
                }
            }
        }
    }

    return (
        <li onClick={removeLayers}>
            <Show when={true}>
                <svg
                    class="layer-settings-menu-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid meet"
                    viewBox="0 0 24 24"
                >
                    <g id="delete_cache165">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </g>
                </svg>
                <span class="layer-settings-menu-text">
                    {layers.length > 1 ? t("serviceSettingsMenuRemove") : t("layerSettingsMenuRemove")}
                </span>
            </Show>
        </li>
    );
}
