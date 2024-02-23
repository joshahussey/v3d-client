import { BasemapSelector } from "./BasemapSelector";
import { TerrainSelector } from "./TerrainSelector";
import { JSX, Show, createEffect, createSignal } from "solid-js";
import { ServiceInfo, Wes3DTileSet, WesImageryLayer } from "../Wes";
import WesDataSource from "../Datasources/WesDataSource";
import { LayersListDiv } from "./LayersListDiv";
import { LayersOrderDiv } from "./LayersOrderDiv";
import { useInterfaceContext } from "../Context/UIContext";

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
    const [layerOrderPanelOpened, setLayerOrderPanelOpened] = createSignal<boolean>(false);
    let layerOrderButtonRef: any;
    let layerHeaderRef: any;
    let layerViewRef: any;
    createEffect(() => {
        if (layerOrderPanelOpened()) {
            layerViewRef.classList.add("layers-view-width-order-opened");
            layerHeaderRef.classList.remove("layers-view-layers-label-order-closed");
            layerHeaderRef.classList.add("layers-view-layers-label-order-opened");
        } else {
            layerViewRef.classList.remove("layers-view-width-order-opened");
            layerHeaderRef.classList.remove("layers-view-layers-label-order-opened");
            layerHeaderRef.classList.add("layers-view-layers-label-order-closed");
        }
    });

    createEffect(() => {
        if (imageLayers().length == 0) {
            setLayerOrderPanelOpened(false);
        }
    });

    return (
        <div class="layers-view" ref={layerViewRef}>
            <span class="layers-view-layers-label" ref={layerHeaderRef}>
                Map Layers
            </span>
            <div class="layers-view-layer-tree-panel">
                <nav class="layers-view-layer-list-scroll">
                    <ul id="layer-list" class="flex flex-center-start cslt-list layers-view-layer-list-container">
                        <BasemapSelector />
                        <TerrainSelector />
                        <LayersListDiv />
                    </ul>
                </nav>
                <div class="layers-list-layer-order-button-div">
                    <button
                        class="cesium-button layers-list-layer-order-button"
                        ref={layerOrderButtonRef}
                        disabled={imageLayers().length == 0}
                        onClick={async () => {
                            setLayerOrderPanelOpened(!layerOrderPanelOpened());
                        }}
                    >
                        Manage Layers {layerOrderPanelOpened() ? <>&#9664;</> : <>&#9654;</>}
                    </button>
                </div>
            </div>
            <Show when={layerOrderPanelOpened()}>
                <LayersOrderDiv closeLayerOrderPanel={setLayerOrderPanelOpened} />
            </Show>
        </div>
    );
}
