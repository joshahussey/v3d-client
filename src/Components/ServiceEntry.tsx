import { For, JSX, Show, createSignal, createEffect } from "solid-js";
import { ImageryEntry } from "./ImageryEntry";
import { PrimitiveEntry } from "./PrimitiveEntry";
import { DatasourceEntry } from "./DatasourceEntry";
import { ServiceEntryInput } from "./LayersDiv";
import { WesImageryLayer, Wes3DTileSet } from "../Wes";
import WesDataSource from "../Datasources/WesDataSource";
import { ImageryLayer, Cesium3DTileset } from "cesium";

export type makeCheckboxStatus = () => void;

/**
 * Represents a component for displaying an entry for an Service in the layer tree.
 * @param {ServiceEntryInput} entry - The ServiceEntryInput object containing service information and a list of layers.
 * @returns {JSX.Element} A JSX element representing the service entry.
 */
export function ServiceEntry(entry: ServiceEntryInput): JSX.Element {
    const [opened, setOpened] = createSignal(true);

    //[0 = unchecked, 1 = checked, 2 = indeterminate]
    const [checkboxState, setCheckboxState] = createSignal(0);

    const allLayerDivs: JSX.Element[] = [];
    for (const layer of entry.layers.sort(function(a, b){return a.name.localeCompare(b.name)})) {
        if (layer instanceof ImageryLayer) {
            allLayerDivs.push(
                <ImageryEntry
                    imageryLayer={layer}
                    syncServiceCheckboxCallback={makeCheckboxStatus}
                    serviceCheckBoxState={checkboxState}
                />
            );
        } else if (layer instanceof Cesium3DTileset) {
            allLayerDivs.push(
                <PrimitiveEntry
                    tileset={layer}
                    syncServiceCheckboxCallback={makeCheckboxStatus}
                    serviceCheckBoxState={checkboxState}
                />
            );
        } else if (layer instanceof WesDataSource) {
            allLayerDivs.push(
                <DatasourceEntry
                    datasource={layer}
                    syncServiceCheckboxCallback={makeCheckboxStatus}
                    serviceCheckBoxState={checkboxState}
                />
            );
        }
    }

    let checkboxRef: any;
    createEffect(() => {
        if (checkboxState() != undefined) {
            checkboxRef.indeterminate = checkboxState() == 2;
        }
    });

    function makeCheckboxStatus() {
        function isShown(layer: WesImageryLayer | Wes3DTileSet | WesDataSource) {
            return layer.show;
        }
        if (!entry.layers.every(isShown) && entry.layers.some(isShown)) {
            setCheckboxState(2);
        } else if (entry.layers.every(isShown)) {
            setCheckboxState(1);
        } else {
            setCheckboxState(0);
        }
    }

    function checkboxStatus() {
        switch (checkboxState()) {
            case 0:
                return false;
            case 1:
                return true;
            case 2:
                return true;
        }
    }
    makeCheckboxStatus();

    function booleanToCheckBoxStatus(state: boolean) {
        if (state) {
            setCheckboxState(1);
        } else {
            setCheckboxState(0);
        }
    }

    return (
        <li>
            <div class="service-div">
                <Show when={opened()} fallback={<></>}>
                    <button class="cesium-button service-dropdown-button" onClick={() => setOpened(!opened())}>
                        &minus;
                    </button>
                </Show>
                <Show when={!opened()} fallback={<></>}>
                    <button class="cesium-button service-dropdown-button" onClick={() => setOpened(!opened())}>
                        &plus;
                    </button>
                </Show>
                <input
                    type="checkbox"
                    class="cesium-button shown-status-button layer-entry-button-flex"
                    checked={checkboxStatus()}
                    onChange={e => booleanToCheckBoxStatus(e.currentTarget.checked)}
                    ref={checkboxRef}
                />
                <span class="layer-name" title={entry.service.serviceTitle}>
                    {entry.service.serviceTitle}
                </span>
            </div>
            <Show when={opened()}>
                <div class="service-grid-break" />
                <div class="service-layers-div">
                    <ul class="cslt-list service-layers-list">
                        <For each={allLayerDivs}>{layerDiv => layerDiv}</For>
                    </ul>
                </div>
            </Show>
        </li>
    );
}
