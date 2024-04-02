import { JSX, Show } from "solid-js";
import { ServiceInfo, Wes3DTileSet, WesImageryLayer } from "../types";
import WesDataSource from "../Datasources/WesDataSource";
import { LayersOrderDiv } from "./LayersOrderDiv";
import { ToolbarContextType, useToolbarStateContext } from "../Context/ToolbarStateContext";
import { LayersTreeDiv } from "./LayersTreeDiv";
import { SearchMinimal } from "./SearchMinimal";

export type ServiceEntryInput = {
    service: ServiceInfo;
    layers: (WesImageryLayer | WesDataSource | Wes3DTileSet)[];
};

/**
 * Represents the component containing all other panels in the UI, such as the:
 *  - Layers Tree Panel
 *  - Basemap/Terrain Selector
 *  - Layer Order Panel
 *  - Search Panel
 * @returns {JSX.Element} A JSX element representing the layers div.
 */
export function LayersDiv(): JSX.Element {
    const {
        isLayersOrderOpened,
        setLayersOrderOpened,
        isSearchOpened,
        isLayersTreeOpened,
    } = useToolbarStateContext() as ToolbarContextType;

    return (
        <div class="layers-view">
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
