import { JSX, Show } from "solid-js";
import { ServiceInfo, Wes3DTileSet, WesImageryLayer } from "../Wes";
import WesDataSource from "../Datasources/WesDataSource";
import { LayersOrderDiv } from "./LayersOrderDiv";
import { useToolbarStateContext } from "../Context/ToolbarStateContext";
import { LayersTreeDiv } from "./LayersTreeDiv";
import { SearchMinimal } from "./SearchMinimal";

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
        isSearchOpened,
        isLayersTreeOpened,
    } = useToolbarStateContext() as any;
    let layerViewRef: any;

    return (
        <div class="layers-view" ref={layerViewRef}>
            <Show when={isLayersTreeOpened()}>
                <LayersTreeDiv />
            </Show>
            <Show when={isLayersOrderOpened()}>
                <LayersOrderDiv closeLayerOrderPanel={setLayersOrderOpened} />
            </Show>
            <Show when={isSearchOpened()}>
                <SearchMinimal />
            </Show>
        </div>
    );
}
