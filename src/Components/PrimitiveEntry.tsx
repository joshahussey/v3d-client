import { JSX, Show, createSignal, Accessor } from "solid-js";
import { DropDownButton } from "./DropDownButton";
import { DeleteLayerButton } from "./DeleteLayerButton";
import { Wes3DTileSet } from "../Wes";
import { ShowOnMapCheckbox } from "./ShowOnMapCheckbox";
import { ZoomToLayerButton } from "./ZoomToLayerButton";
import { osmBuildingsUID } from "../Constants";
import { makeCheckboxStatus } from "./ServiceEntry";

/**
 * Represents a component for displaying an entry for a primitive layer (3D tileset) in a list.
 * @param {Object} props - The object containing the input parameters.
 * @param {WesImageryLayer} props.tileset - The Wes3DTileSet instance representing the primitive layer.
 * @param {makeCheckboxStatus} props.syncServiceCheckboxCallback - A function used to synchronize the layer's service's checkbox.
 * @param {Accessor<number>} props.serviceCheckBoxState - A function to access the layer's service's checkbox state.
 * @returns {JSX.Element} A JSX element representing the primitive layer entry.
 */
export function PrimitiveEntry(props: {
    tileset: Wes3DTileSet;
    syncServiceCheckboxCallback: makeCheckboxStatus;
    serviceCheckBoxState: Accessor<number>;
}): JSX.Element {
    const { tileset, syncServiceCheckboxCallback, serviceCheckBoxState } = props;
    const [opened, setOpened] = createSignal(false);
    return (
        <li>
            <div class="layer-list-layer-entry">
                <Show when={tileset.enabled != undefined && !tileset.enabled}>
                    <button
                        class="cesium-button osm-warning-button"
                        title="Open Street Map Buildings can only be utilized when the selected terrain is 'Cesium Builtin Terrain'"
                        disabled={true}
                    >
                        &#9888;
                    </button>
                </Show>
                <Show when={tileset.enabled == undefined || tileset.enabled}>
                    <ShowOnMapCheckbox
                        primitiveLayer={tileset}
                        syncServiceCheckboxCallback={syncServiceCheckboxCallback}
                        serviceCheckBoxState={serviceCheckBoxState}
                        isEnabled={tileset.enabled}
                    />
                </Show>
                <span class="layer-name" title={tileset.name}>{tileset.name}</span>
                <DropDownButton opened={opened} setOpened={setOpened} isEnabled={tileset.enabled} />
                <ZoomToLayerButton primitiveLayer={tileset} isEnabled={tileset.enabled} />
                <Show when={tileset.uid != osmBuildingsUID}>
                    <DeleteLayerButton primitiveLayer={tileset} isEnabled={tileset.enabled} />
                </Show>
            </div>
            <Show when={opened()}>
                <div class="grid-break" />
                <span />
            </Show>
        </li>
    );
}
