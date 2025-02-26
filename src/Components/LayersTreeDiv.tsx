import { BasemapSelector } from "./BasemapSelector";
import { TerrainSelector } from "./TerrainSelector";
import { JSX } from "solid-js";
import { ServiceInfo, Wes3DTileSet, WesImageryLayer } from "../Types/types";
import WesDataSource from "../Datasources/WesDataSource";
import { LayersListDiv } from "./LayersListDiv";

export type ServiceEntryInput = {
    service: ServiceInfo;
    layers: WesImageryLayer[] | WesDataSource[] | Wes3DTileSet[];
};

/**
 * Represents a component for displaying a list of different types of layers.
 * @returns {JSX.Element} A JSX element representing the layers div.
 */
export function LayersTreeDiv(): JSX.Element {
    return (
        <div class="layers-view-layer-tree-panel">
            <nav class="layers-view-layer-list-scroll">
                <ul id="layer-list" class="flex flex-center-start cslt-list layers-view-layer-list-container">
                    <BasemapSelector />
                    <TerrainSelector />
                    <LayersListDiv />
                </ul>
            </nav>
        </div>
    );
}
