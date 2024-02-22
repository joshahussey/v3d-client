import { JSX, Show, createSignal } from "solid-js";
import WesDataSource from "../Datasources/WesDataSource";
import { DropDownButton } from "./DropDownButton";
import { DeleteLayerButton } from "./DeleteLayerButton";
import { ShowOnMapCheckbox } from "./ShowOnMapCheckbox";
import { UserStyleSelector } from "./UserStyleSelector";
import { HighlightSelector } from "./HighlightSelector";
import FeaturesApiDataSource from "../Datasources/FeaturesApiDataSource";
import { CoverageApiDropdown } from "./CoverageApiDropdown";

/**
 * Represents a component for displaying a single entry in a data source list.
 * @param {Object} layer - The layer object containing the data source.
 * @param {WesDataSource} layer.datasource - The WesDataSource instance for the data source.
 * @returns {JSX.Element} A JSX element representing the data source entry.
 */
export function DatasourceEntry(layer: { datasource: WesDataSource }): JSX.Element {
    const [opened, setOpened] = createSignal(false);
    return (
        <li>
            <div class="layer-list-layer-entry">
                <ShowOnMapCheckbox datasource={layer.datasource} />
                <span class="layer-name">{layer.datasource.name}</span>
                <DropDownButton opened={opened} setOpened={setOpened} />
                <DeleteLayerButton datasource={layer.datasource} />
            </div>
            <Show when={opened()}>
                <div class="grid-break" />
                <UserStyleSelector datasource={layer.datasource} />
                <Show when={layer.datasource instanceof FeaturesApiDataSource}>
                    <HighlightSelector datasource={layer.datasource as FeaturesApiDataSource} />
                </Show>
                <CoverageApiDropdown datasource={layer.datasource} />
            </Show>
        </li>
    );
}
