import { DatasourceLayersDiv } from "./DatasourceLayersDiv";
import { ImageryLayersDiv } from "./ImageryLayersDiv";
import { BasemapSelector } from "./BasemapSelector";
import { TerrainSelector } from "./TerrainSelector";
import { PrimitiveLayersDiv } from "./PrimitiveLayersDiv";
import { JSX } from "solid-js";

/**
 * Represents a component for displaying a list of different types of layers.
 * @returns {JSX.Element} A JSX element representing the layers div.
 */
export function LayersDiv(): JSX.Element {
    return (
        <div class="layers-view">
            <span class="layers-view-layers-label">Map Layers</span>
            <ul id="layer-list" class="flex flex-center-start cslt-list layers-view-layer-list-container">
                <BasemapSelector />
                <TerrainSelector />
                <DatasourceLayersDiv />
                <ImageryLayersDiv />
                <PrimitiveLayersDiv />
            </ul>
        </div>
    );
}
