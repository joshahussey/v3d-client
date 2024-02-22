import { Cesium3DTileset, ImageryLayer } from "cesium";
import { Wes3DTileSet, Wes3dMapLayer, WesImageryLayer } from "../Wes";
import WesDataSource from "../Datasources/WesDataSource";
import { JSX, createSignal } from "solid-js";
import CoverageApiDataSource from "../Datasources/CoverageApiDataSource";

/**
 * Represents a component for toggling the visibility status of a map layer.
 * @param {Object} layer - The layer objects representing different types of map layers.
 * @param {Wes3dMapLayer} layer.datasource - The Wes3dMapLayer instance representing a data source layer.
 * @param {WesImageryLayer} layer.imageryLayer - The WesImageryLayer instance representing an imagery layer.
 * @param {Wes3DTileSet} layer.primitiveLayer - The Wes3DTileSet instance representing a 3D tileset.
 * @returns {JSX.Element} A JSX element representing the show on map button.
 */
export function ShowOnMapCheckbox(layer: {
    datasource?: Wes3dMapLayer;
    imageryLayer?: WesImageryLayer;
    primitiveLayer?: Wes3DTileSet;
}): JSX.Element {
    let shown;
    if (layer.datasource && layer.datasource instanceof WesDataSource) {
        shown = layer.datasource.show;
    }
    if (layer.imageryLayer && layer.imageryLayer instanceof ImageryLayer) {
        shown = layer.imageryLayer.show;
    }
    if (layer.primitiveLayer && layer.primitiveLayer instanceof Cesium3DTileset) {
        shown = layer.primitiveLayer.show;
    }
    const [isShown, setIsShown] = createSignal(shown);
    function checkboxChanged(isChecked: boolean) {
        setIsShown(isChecked);
        if (layer.datasource && layer.datasource instanceof WesDataSource) {
            layer.datasource.show = isChecked;
        }
        if (layer.imageryLayer && layer.imageryLayer instanceof ImageryLayer) {
            layer.imageryLayer.show = isChecked;
        }
        if (layer.primitiveLayer && layer.primitiveLayer instanceof CoverageApiDataSource) {
            layer.primitiveLayer.show = isChecked;
        }
        if (layer.primitiveLayer && layer.primitiveLayer instanceof Cesium3DTileset) {
            layer.primitiveLayer.show = isChecked;
        }
    }
    return (
        <input
            type="checkbox"
            class="cesium-button shown-status-button layer-entry-button-flex"
            onChange={e => checkboxChanged(e.currentTarget.checked)}
            checked={isShown()}
        />
    );
}
