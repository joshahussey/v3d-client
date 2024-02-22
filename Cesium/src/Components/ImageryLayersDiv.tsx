import { For, JSX, createEffect, createSignal } from "solid-js";
import { ImageryEntry } from "./ImageryEntry";
import { useInterfaceContext } from "../Context/UIContext";

/**
 * Represents a component for displaying a list of imagery layers in reverse order.
 * @returns {JSX.Element} A JSX element representing the imagery layers.
 */
export function ImageryLayersDiv(): JSX.Element {
    const { imageLayers } = useInterfaceContext() as any;
    const [reversedImageryLayers, setReversedImageryLayers] = createSignal(imageLayers().slice().reverse(), {
        equals: false
    });
    createEffect(() => {
        setReversedImageryLayers(imageLayers().slice().reverse());
    });
    setReversedImageryLayers(imageLayers().slice().reverse());
    return <For each={reversedImageryLayers()}>{imageryLayer => <ImageryEntry imageryLayer={imageryLayer} />}</For>;
}
