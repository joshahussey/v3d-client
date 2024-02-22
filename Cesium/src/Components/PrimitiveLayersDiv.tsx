import { For, JSX, createEffect, createSignal } from "solid-js";
import { useInterfaceContext } from "../Context/UIContext";
import { PrimitiveEntry } from "./PrimitiveEntry";

/**
 * Represents a component for displaying a list of primitive layers (3D tilesets) in reverse order.
 * @returns {JSX.Element} A JSX element representing the primitive layers.
 */
export function PrimitiveLayersDiv(): JSX.Element {
    const { tileSets } = useInterfaceContext() as any;
    const [reversedTilesets, setReversedTilesets] = createSignal(tileSets().slice().reverse(), { equals: false });
    createEffect(() => {
        setReversedTilesets(tileSets().slice().reverse());
    });
    setReversedTilesets(tileSets().slice().reverse());
    return <For each={reversedTilesets()}>{tileset => <PrimitiveEntry tileset={tileset} />}</For>;
}
