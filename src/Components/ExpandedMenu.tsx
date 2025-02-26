import { JSX, Show } from "solid-js";
import { LayersDiv } from "./Components";
import { CatalogView } from "./CatalogView";
import { ToolbarContextType, useToolbarStateContext } from "../Context/ToolbarStateContext";
import { OPENED_LAYER_PAGE } from "../Constants";

/**
 * Represents a component for the expanded menu that displays additional options based on toolbar state.
 * @returns {JSX.Element} A JSX element representing the expanded menu.
 */
export function ExpandedMenu(): JSX.Element {
    const { openedLayerPage } = useToolbarStateContext() as ToolbarContextType;

    return (
        <Show when={openedLayerPage() !== OPENED_LAYER_PAGE.CLOSED}>
            <div id="ExpandedMenu" class="cslt-toolbar-expanded">
                <Show when={openedLayerPage() !== OPENED_LAYER_PAGE.CATALOG}>
                    <LayersDiv />
                </Show>
                <Show when={openedLayerPage() == OPENED_LAYER_PAGE.CATALOG}>
                    <CatalogView />
                </Show>
            </div>
        </Show>
    );
}
