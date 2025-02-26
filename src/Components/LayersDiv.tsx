import { JSX, Match, Switch } from "solid-js";
import { ServiceInfo, Wes3DTileSet, WesImageryLayer } from "../Types/types";
import WesDataSource from "../Datasources/WesDataSource";
import { LayersOrderDiv } from "./LayersOrderDiv";
import { ToolbarContextType, useToolbarStateContext } from "../Context/ToolbarStateContext";
import { LayersTreeDiv } from "./LayersTreeDiv";
import { SearchMinimal } from "./SearchMinimal";
import { LoadView } from "./LoadView";
import { SaveView } from "./SaveView";
import { OPENED_LAYER_PAGE } from "../Constants";

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
    const { openedLayerPage, setOpenedLayerPage } = useToolbarStateContext() as ToolbarContextType;

    return (
        <div class="layers-view">
            <Switch>
                <Match when={openedLayerPage() == OPENED_LAYER_PAGE.LAYERS}>
                    <LayersTreeDiv />
                </Match>
                <Match when={openedLayerPage() == OPENED_LAYER_PAGE.LAYER_ORDER}>
                    <LayersOrderDiv closeLayerOrderPanel={setOpenedLayerPage} />
                </Match>
                <Match when={openedLayerPage() == OPENED_LAYER_PAGE.SEARCH}>
                    <SearchMinimal />
                </Match>
                <Match when={openedLayerPage() == OPENED_LAYER_PAGE.SAVE_VIEW}>
                    <SaveView />
                </Match>
                <Match when={openedLayerPage() == OPENED_LAYER_PAGE.LOAD_VIEW}>
                    <LoadView />
                </Match>
            </Switch>
        </div>
    );
}
