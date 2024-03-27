import { JSX, Show } from "solid-js";
import { LayersDiv } from "./Components";
import { useToolbarStateContext } from "../Context/ToolbarStateContext";

/**
 * Represents a component for the expanded menu that displays additional options based on toolbar state.
 * @returns {JSX.Element} A JSX element representing the expanded menu.
 */
export function ExpandedMenu(): JSX.Element {
    const { isLayersOpened, isSaveOpened, isLoadOpened, isCatalogOpened, isSearchOpened } = useToolbarStateContext() as any;

    return (
        <Show when={isLayersOpened()}>
            <div id="ExpandedMenu" class="cslt-toolbar-expanded">
                <Show when={isLayersOpened()}>
                    <LayersDiv />
                </Show>
            </div>
        </Show>
    );
}
