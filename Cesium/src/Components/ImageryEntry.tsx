import { JSX, Show, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { DropDownButton } from "./DropDownButton";
import { DeleteLayerButton } from "./DeleteLayerButton";
import { WesImageryLayer } from "../Wes";
import { ShowOnMapCheckbox } from "./ShowOnMapCheckbox";

/**
 * Represents a component for displaying an entry for an imagery layer in a list.
 * @param {Object} layer - The layer object containing the WesImageryLayer instance.
 * @param {WesImageryLayer} layer.imageryLayer - The WesImageryLayer instance representing the imagery layer.
 * @returns {JSX.Element} A JSX element representing the imagery layer entry.
 */
export function ImageryEntry(layer: { imageryLayer: WesImageryLayer }): JSX.Element {
    const layers = (window as any).Map3DViewer.imageryLayers;
    const [opened, setOpened] = createSignal(false);
    const [settings, setSettings] = createStore(layer.imageryLayer);
    const [canLower, setCanLower] = createSignal(layers.indexOf(layer.imageryLayer) > 1, { equals: false });
    const [canRaise, setCanRaise] = createSignal(layers.indexOf(layer.imageryLayer) < layers.length - 1, {
        equals: false
    });
    const setAlpha = (e: any) => {
        setSettings({ alpha: e.target.value });
    };
    layers.layerAdded.addEventListener(() => {
        setCanLower(layers.indexOf(layer.imageryLayer) > 1);
        setCanRaise(layers.indexOf(layer.imageryLayer) < layers.length - 1);
    });
    layers.layerMoved.addEventListener(() => {
        setCanLower(layers.indexOf(layer.imageryLayer) > 1);
        setCanRaise(layers.indexOf(layer.imageryLayer) < layers.length - 1);
    });
    layers.layerRemoved.addEventListener(() => {
        setCanLower(layers.indexOf(layer.imageryLayer) > 1);
        setCanRaise(layers.indexOf(layer.imageryLayer) < layers.length - 1);
    });
    return (
        <li>
            <div class="layer-list-layer-entry">
                <ShowOnMapCheckbox imageryLayer={layer.imageryLayer} />
                <span class="layer-name">{layer.imageryLayer.name}</span>
                <DropDownButton opened={opened} setOpened={setOpened} />
                <div class="layer-up-down-buttons">
                    <Show when={canRaise()} fallback={<></>}>
                        <button class="cesium-button up-button" onClick={() => layers.raise(layer.imageryLayer)}>
                            &#9650;
                        </button>
                    </Show>
                    <Show when={canLower()} fallback={<></>}>
                        <button class="cesium-button down-button" onClick={() => layers.lower(layer.imageryLayer)}>
                            &#9660;
                        </button>
                    </Show>
                </div>
                <DeleteLayerButton imageryLayer={layer.imageryLayer} />
            </div>
            <Show when={opened()}>
                <div class="grid-break" />
                <div class="selector-grid selector-highlight">
                    <label class="selector-label" for="alpha">
                        Alpha:{" "}
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
