import { Cesium3DTileset, GeoJsonDataSource, ImageryLayer, KmlDataSource } from "cesium";
import { CesiumWindow, Wes3DTileSet, WesImageryLayer } from "../types";
import WesDataSource from "../Datasources/WesDataSource";
import CoverageApiDataSource from "../Datasources/CoverageApiDataSource";
import { UIContextType, useInterfaceContext } from "../Context/UIContext";
import { JSX } from "solid-js";
import CelestialBodyDataSource from "../Datasources/CelestialBodyDataSource";

/**
 * Represents a component for a button to delete a layer from the map.
 * @param {Object} layer - The layer objects representing different types of map layers.
 * @param {Wes3dMapLayer} layer.datasource - The Wes3dMapLayer instance representing a data source layer.
 * @param {WesImageryLayer} layer.imageryLayer - The WesImageryLayer instance representing an imagery layer.
 * @param {Wes3DTileSet} layer.primitiveLayer - The Wes3DTileSet instance representing a 3D tileset.
 * @param {boolean} layer.isEnabled - Whether the delete button should be enabled.
 * @returns {JSX.Element} A JSX element representing the delete layer button.
 */
export function DeleteLayerButton(layer: {
    datasource?: WesDataSource;
    imageryLayer?: WesImageryLayer;
    primitiveLayer?: Wes3DTileSet;
    isEnabled?: boolean;
}): JSX.Element {
    const { sourcesWithLegends, setSourcesWithLegends, osmBuildingsLayer, setOsmBuildingsLayer } =
        useInterfaceContext() as UIContextType;
    return (
        <button
            class="cesium-button remove-button layer-entry-button-flex"
            disabled={layer.isEnabled != undefined && !layer.isEnabled}
            onClick={() => {
                if (layer.datasource && layer.datasource instanceof WesDataSource) {
                    (window as CesiumWindow).Map3DViewer.dataSources.remove(layer.datasource);
                    setSourcesWithLegends(
                        sourcesWithLegends().filter(source => source.uid !== layer.datasource.uid)
                    );
                    if (layer.datasource && layer.datasource instanceof CelestialBodyDataSource) {
                        layer.datasource.setServiceRunning(false);
                    }
                }
                if (layer.imageryLayer && layer.imageryLayer instanceof ImageryLayer) {
                    (window as CesiumWindow).Map3DViewer.imageryLayers.remove(layer.imageryLayer);
                    setSourcesWithLegends(
                        sourcesWithLegends().filter(source => source.uid !== layer.imageryLayer!.uid)
                    );
                }
                if (layer.primitiveLayer && layer.primitiveLayer instanceof Cesium3DTileset) {
                    const osmBuildingsId = osmBuildingsLayer();
                    if (osmBuildingsId && layer.primitiveLayer.uid == osmBuildingsId) {
                        setOsmBuildingsLayer("");
                    }
                    (window as CesiumWindow).Map3DViewer.scene.primitives.remove(layer.primitiveLayer);
                    window.dispatchEvent(new Event("tilesetRemoved"));
                }
                if (layer.datasource && layer.datasource instanceof CoverageApiDataSource) {
                    (window as CesiumWindow).Map3DViewer.scene.primitives.remove(layer.datasource._renderedPrimitive);
                    (window as CesiumWindow).removeEventListener("timeChanged", layer.datasource._listener);
                    layer.datasource._removed = true;
                    layer.datasource._renderedPrimitive = undefined;
                    if (layer.datasource._hasLegend) {
                        setSourcesWithLegends(
                            sourcesWithLegends().filter(source => source.uid !== layer.datasource._uid)
                        );
                    }
                    (window as CesiumWindow).Map3DViewer.dataSources.remove(layer.datasource, true);
                    window.dispatchEvent(new Event("tilesetRemoved"));
                }
                if (layer.datasource && (layer.datasource instanceof GeoJsonDataSource || layer.datasource instanceof KmlDataSource)) {
                    (window as CesiumWindow).Map3DViewer.dataSources.remove(layer.datasource);
                }
            }}
        >
            <img class="layer-entry-button-image" src="./Icons/close.png" />
        </button>
    );
}
