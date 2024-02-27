import { BasemapSelector } from "./BasemapSelector";
import { TerrainSelector } from "./TerrainSelector";
import { JSX, Show, createEffect, createSignal, onMount } from "solid-js";
import { ServiceInfo, Wes3DTileSet, WesImageryLayer } from "../Wes";
import WesDataSource from "../Datasources/WesDataSource";
import { LayersListDiv } from "./LayersListDiv";
import { LayersOrderDiv } from "./LayersOrderDiv";
import { useInterfaceContext } from "../Context/UIContext";
import { useToolbarStateContext } from "../Context/ToolbarStateContext";

export type ServiceEntryInput = {
    service: ServiceInfo;
    layers: WesImageryLayer[] | WesDataSource[] | Wes3DTileSet[];
};

/**
 * Represents a component for displaying a list of different types of layers.
 * @returns {JSX.Element} A JSX element representing the layers div.
 */
export function LayersDiv(): JSX.Element {
    const { imageLayers } = useInterfaceContext() as any;
    const {
        isLayersOrderOpened,
        setLayersOrderOpened,
        isBasemapTerrainOpened
    } = useToolbarStateContext() as any;
    const [firstOpen, setFirstOpen] = createSignal(true);

    let layerViewRef: any;
    createEffect(() => {
        if (isLayersOrderOpened()) {
            layerViewRef.classList.add("layers-view-width-order-opened");
        } else {
            layerViewRef.classList.remove("layers-view-width-order-opened");
        }
    });

    createEffect(() => {
        if (imageLayers().length == 0) {
            setLayersOrderOpened(false);
        }
    });

    return (
        <div class="layers-view" ref={layerViewRef}>
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
            <Show when={isLayersOrderOpened()}>
                <LayersOrderDiv closeLayerOrderPanel={setLayersOrderOpened} />
            </Show>
        </div>
    );
}
