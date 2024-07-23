import { JSX, Show, createSignal, Accessor } from "solid-js";
import { Wes3DTileSet } from "../Types/types";
import { ShowOnMapCheckbox } from "./ShowOnMapCheckbox";
import { makeCheckboxStatus } from "./ServiceEntry";
import { LayerSettingsButton } from "./LayerSettingsButton";
import { translate as t } from "../i18n/Translator";

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
                <span class="layer-name" title={tileset.name}>
                    {tileset.name}
                </span>
                <LayerSettingsButton
                    opened={opened}
                    setOpened={setOpened}
                    primitiveLayer={tileset}
                    isEnabled={tileset.enabled as boolean}
                />
                <Show when={tileset.enabled != undefined && !tileset.enabled}>
                    <button
                        class="cesium-button osm-warning-button"
                        title={t("primitiveEntryOsmWarningButton")}
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
            </div>
            <Show when={opened()}>
                <div class="grid-break" />
                <span />
            </Show>
        </li>
    );
}
