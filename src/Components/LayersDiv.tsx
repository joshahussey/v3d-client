import { JSX, Show } from "solid-js";
import { ServiceInfo, Wes3DTileSet, WesImageryLayer } from "../Wes";
import WesDataSource from "../Datasources/WesDataSource";
import { LayersOrderDiv } from "./LayersOrderDiv";
import { useToolbarStateContext } from "../Context/ToolbarStateContext";
import { LayersTreeDiv } from "./LayersTreeDiv";

export type ServiceEntryInput = {
    service: ServiceInfo;
    layers: WesImageryLayer[] | WesDataSource[] | Wes3DTileSet[];
};

/**
 * Represents a component for displaying a list of different types of layers.
 * @returns {JSX.Element} A JSX element representing the layers div.
 */
export function LayersDiv(): JSX.Element {
    const {
        isLayersOrderOpened,
        setLayersOrderOpened,
    } = useToolbarStateContext() as any;

    let layerViewRef: any;

    return (
        <div class="layers-view" ref={layerViewRef}>
            <Show when={!isLayersOrderOpened()}>
                <LayersTreeDiv/>
            </Show>
            <Show when={isLayersOrderOpened()}>
                <LayersOrderDiv closeLayerOrderPanel={setLayersOrderOpened} />
            </Show>
        </div>
    );
}
