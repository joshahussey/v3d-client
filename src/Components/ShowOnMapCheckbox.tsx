import { Cesium3DTileset, GeoJsonDataSource, ImageryLayer, KmlDataSource } from "cesium";
import { Wes3DTileSet, Wes3dMapLayer, WesImageryLayer } from "../Types/types";
import WesDataSource from "../Datasources/WesDataSource";
import { JSX, createSignal, Accessor, createEffect } from "solid-js";
import CoverageApiDataSource from "../Datasources/CoverageApiDataSource";
import CelestialBodyDataSource from "../Datasources/CelestialBodyDataSource";
import { makeCheckboxStatus } from "./ServiceEntry";

/**
 * Represents a component for toggling the visibility status of a map layer.
 * @param {Object} layer - The layer objects representing different types of map layers.
 * @param {Wes3dMapLayer} layer.datasource - The Wes3dMapLayer instance representing a data source layer.
 * @param {WesImageryLayer} layer.imageryLayer - The WesImageryLayer instance representing an imagery layer.
 * @param {Wes3DTileSet} layer.primitiveLayer - The Wes3DTileSet instance representing a 3D tileset.
 * @param {boolean} layer.isEnabled - Whether the checkbox button should be enabled.
 * @param {makeCheckboxStatus} props.syncServiceCheckboxCallback - A function used to synchronize the layer's service's checkbox.
 * @param {Accessor<number>} props.serviceCheckBoxState - A function to access the layer's service's checkbox state.
 * @returns {JSX.Element} A JSX element representing the show on map button.
 */
export function ShowOnMapCheckbox(props: {
    datasource?: Wes3dMapLayer;
    imageryLayer?: WesImageryLayer;
    primitiveLayer?: Wes3DTileSet;
    isEnabled?: boolean;
    syncServiceCheckboxCallback: makeCheckboxStatus;
    serviceCheckBoxState: Accessor<number>;
}): JSX.Element {
    const { datasource, imageryLayer, primitiveLayer, isEnabled, syncServiceCheckboxCallback, serviceCheckBoxState } =
        props;

    let shown;
    if (datasource && datasource instanceof WesDataSource) {
        if (datasource.isLoading && datasource instanceof CoverageApiDataSource) {
            shown = true;
        } else {
            shown = datasource.show;
        }
    }
    if (imageryLayer && imageryLayer instanceof ImageryLayer) {
        shown = imageryLayer.show;
    }
    if (primitiveLayer && primitiveLayer instanceof Cesium3DTileset) {
        shown = primitiveLayer.show;
    }
    const [isShown, setIsShown] = createSignal(shown);
    function checkboxChanged(isChecked: boolean, syncServiceCheckbox: boolean = true) {
        setIsShown(isChecked);
        if (datasource && datasource instanceof WesDataSource) {
            datasource.show = isChecked;
            if (datasource instanceof CelestialBodyDataSource) {
                datasource.setServiceRunning(isChecked);
            }
        }
        if (datasource && datasource instanceof GeoJsonDataSource) {
            datasource.show = isChecked;
        }
        if (datasource && datasource instanceof KmlDataSource) {
            datasource.show = isChecked;
        }
        if (imageryLayer && imageryLayer instanceof ImageryLayer) {
            imageryLayer.show = isChecked;
        }
        if (primitiveLayer && primitiveLayer instanceof CoverageApiDataSource) {
            primitiveLayer.show = isChecked;
        }
        if (primitiveLayer && primitiveLayer instanceof Cesium3DTileset) {
            primitiveLayer.show = isChecked;
        }
        if (syncServiceCheckbox) {
            syncServiceCheckboxCallback();
        }
    }
    let checkBoxRef: HTMLInputElement | undefined;
    createEffect(() => {
        if (serviceCheckBoxState != undefined && serviceCheckBoxState() != 2) {
            if (serviceCheckBoxState() == 0 && checkBoxRef?.checked != false) {
                checkboxChanged(false, false);
            } else if (serviceCheckBoxState() == 1 && checkBoxRef?.checked != true) {
                checkboxChanged(true, false);
            }
        }
    });
    return (
        <input
            type="checkbox"
            disabled={isEnabled != undefined && !isEnabled}
            class="cesium-button shown-status-button"
            onChange={e => checkboxChanged(e.currentTarget.checked)}
            checked={isShown()}
            ref={checkBoxRef}
        />
    );
}
