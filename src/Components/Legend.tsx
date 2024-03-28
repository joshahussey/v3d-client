import { UIContextType, useInterfaceContext } from "../Context/UIContext";
import { For, Show } from "solid-js";
import { LegendEntry } from "./LegendEntry";

export function Legend() {
    const { sourcesWithLegends } = useInterfaceContext() as UIContextType;
    return (
        <Show when={sourcesWithLegends().length > 0}>
            <div class="legend-div">
                <For each={sourcesWithLegends()}>{source => <LegendEntry source={source} />}</For>
            </div>
        </Show>
    );
}
