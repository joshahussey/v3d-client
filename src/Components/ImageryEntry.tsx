import { JSX, Show, createSignal, Accessor } from "solid-js";
import { createStore } from "solid-js/store";
import { DropDownButton } from "./DropDownButton";
import { DeleteLayerButton } from "./DeleteLayerButton";
import { ZoomToLayerButton } from "./ZoomToLayerButton";
import { WesImageryLayer } from "../Wes";
import { ShowOnMapCheckbox } from "./ShowOnMapCheckbox";
import { makeCheckboxStatus } from "./ServiceEntry";

/**
 * Represents a component for displaying an entry for an imagery layer in a list.
 * @param {Object} props - The object containing the input parameters.
 * @param {WesImageryLayer} props.imageryLayer - The WesImageryLayer instance representing the imagery layer.
 * @param {makeCheckboxStatus} props.syncServiceCheckboxCallback - A function used to synchronize the layer's service's checkbox.
 * @param {Accessor<number>} props.serviceCheckBoxState - A function to access the layer's service's checkbox state.
 * @returns {JSX.Element} A JSX element representing the imagery layer entry.
 */
export function ImageryEntry(props: {
    imageryLayer: WesImageryLayer;
    syncServiceCheckboxCallback: makeCheckboxStatus;
    serviceCheckBoxState: Accessor<number>;
}): JSX.Element {
    const { imageryLayer, syncServiceCheckboxCallback, serviceCheckBoxState } = props;
    const [opened, setOpened] = createSignal(false);
    const [settings, setSettings] = createStore(imageryLayer);
    const setAlpha = (e: any) => {
        setSettings({ alpha: e.target.value });
    };
    return (
        <li>
            <div class="layer-list-layer-entry">
                <ShowOnMapCheckbox
                    imageryLayer={imageryLayer}
                    syncServiceCheckboxCallback={syncServiceCheckboxCallback}
                    serviceCheckBoxState={serviceCheckBoxState}
                />
                <span class="layer-name" title={imageryLayer.name}>{imageryLayer.name}</span>
                <DropDownButton opened={opened} setOpened={setOpened} />
                <ZoomToLayerButton imageryLayer={imageryLayer} />
                <DeleteLayerButton imageryLayer={imageryLayer} />
            </div>
            <Show when={opened()}>
                <div class="selector-grid selector-highlight">
                    <label class="selector-label" for="alpha">
                        Transparency:{" "}
                    </label>
                    <input
                        class="selector"
                        name="alpha"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={settings.alpha}
                        onChange={setAlpha}
                    />
                </div>
            </Show>
        </li>
    );
}
