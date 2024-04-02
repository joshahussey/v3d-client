import { BasemapSelector } from "./BasemapSelector";
import { TerrainSelector } from "./TerrainSelector";
import { JSX, Show } from "solid-js";
import { ServiceInfo, Wes3DTileSet, WesImageryLayer } from "../types";
import WesDataSource from "../Datasources/WesDataSource";
import { LayersListDiv } from "./LayersListDiv";
import { ToolbarContextType, useToolbarStateContext } from "../Context/ToolbarStateContext";

export type ServiceEntryInput = {
    service: ServiceInfo;
    layers: WesImageryLayer[] | WesDataSource[] | Wes3DTileSet[];
};

/**
 * Represents a component for displaying a list of different types of layers.
 * @returns {JSX.Element} A JSX element representing the layers div.
 */
export function LayersTreeDiv(): JSX.Element {
    const {
        isBasemapTerrainOpened
    } = useToolbarStateContext() as ToolbarContextType;

    return (
        <div class="layers-view-layer-tree-panel">
            <nav class="layers-view-layer-list-scroll">
                <ul id="layer-list" class="flex flex-center-start cslt-list layers-view-layer-list-container">
                    <Show when={isBasemapTerrainOpened()}>
                        <BasemapSelector />
                        <TerrainSelector />
                    </Show>
                    <LayersListDiv />
                </ul>
            </nav>
        </div>
    );
}
