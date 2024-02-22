import { JSX, Show, createSignal } from "solid-js";
import { DropDownButton } from "./DropDownButton";
import { DeleteLayerButton } from "./DeleteLayerButton";
import { Wes3DTileSet } from "../Wes";
import { ShowOnMapCheckbox } from "./ShowOnMapCheckbox";
import { ZoomToTilesButton } from "./ZoomToTilesButton";

/**
 * Represents a component for displaying an entry for a primitive layer (3D tileset) in a list.
 * @param {Object} layer - The layer object containing the Wes3DTileSet instance.
 * @param {Wes3DTileSet} layer.tileset - The Wes3DTileSet instance representing the primitive layer.
 * @returns {JSX.Element} A JSX element representing the primitive layer entry.
 */
export function PrimitiveEntry(layer: { tileset: Wes3DTileSet }): JSX.Element {
    const [opened, setOpened] = createSignal(false);
    return (
        <li>
            <div class="layer-list-layer-entry">
                <ShowOnMapCheckbox primitiveLayer={layer.tileset} />
                <span class="layer-name">{layer.tileset.name}</span>
                <DropDownButton opened={opened} setOpened={setOpened} />
                <ZoomToTilesButton primitiveLayer={layer.tileset} />
                <DeleteLayerButton primitiveLayer={layer.tileset} />
            </div>
            <Show when={opened()}>
                <div class="grid-break" />
                <span />
            </Show>
        </li>
    );
}
