import { JSX, Show, createSignal, Accessor } from "solid-js";
import WesDataSource from "../Datasources/WesDataSource";
import { ShowOnMapCheckbox } from "./ShowOnMapCheckbox";
import { UserStyleSelector } from "./UserStyleSelector";
import { HighlightSelector } from "./HighlightSelector";
import FeaturesApiDataSource from "../Datasources/FeaturesApiDataSource";
import { CoverageApiDropdown } from "./CoverageApiDropdown";
import { makeCheckboxStatus } from "./ServiceEntry";
import { LayerSettingsButton } from "./LayerSettingsButton";
import { KmlDataSource } from "cesium";
import { translate as t } from "../i18n/Translator";

/**
 * Represents a component for displaying a single entry in a data source list.
 * @param {Object} props - An object containing the parameters
 * @param {WesDataSource} props.datasource - The WesDataSource instance for the data source.
 * @param {makeCheckboxStatus} props.syncServiceCheckboxCallback - A function used to synchronize the layer's service's checkbox.
 * @param {Accessor<number>} props.serviceCheckBoxState - A function to access the layer's service's checkbox state.
 * @returns {JSX.Element} A JSX element representing the data source entry.
 */
export function DatasourceEntry(props: {
    datasource: WesDataSource;
    syncServiceCheckboxCallback: makeCheckboxStatus;
    serviceCheckBoxState: Accessor<number>;
}): JSX.Element {
    const { datasource, syncServiceCheckboxCallback, serviceCheckBoxState } = props;
    const [opened, setOpened] = createSignal(false);
    return (
        <li>
            <div class="layer-list-layer-entry">
                <span class="layer-name" title={datasource.name}>
                    {datasource.name}
                </span>
                <LayerSettingsButton opened={opened} setOpened={setOpened} datasource={datasource} isEnabled={true} />
                <Show when={datasource instanceof KmlDataSource}>
                    <button
                        class="cesium-button kml-warning-button"
                        title={t("kmlDepthTestWarningIconText")}
                        disabled={true}
                    >
                        &#9888;
                    </button>
                </Show>
                <ShowOnMapCheckbox
                    datasource={datasource}
                    syncServiceCheckboxCallback={syncServiceCheckboxCallback}
                    serviceCheckBoxState={serviceCheckBoxState}
                />
            </div>
            <Show when={opened()}>
                <div class="grid-break" />
                <UserStyleSelector datasource={datasource} />
                <Show when={datasource instanceof FeaturesApiDataSource}>
                    <HighlightSelector datasource={datasource as FeaturesApiDataSource} />
                </Show>
                <CoverageApiDropdown datasource={datasource} />
            </Show>
        </li>
    );
}
