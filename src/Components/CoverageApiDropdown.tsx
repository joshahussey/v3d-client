import { JSX, Show } from "solid-js";
import { createStore } from "solid-js/store";
import WesDataSource from "../Datasources/WesDataSource";
import CoverageApiDataSource from "../Datasources/CoverageApiDataSource";

/**
 * Represents a component for controlling settings related to a Coverage API data source.
 * @param {Object} datasource - The data source object containing configuration.
 * @param {WesDataSource} datasource.datasource - The WesDataSource instance used for data retrieval.
 * @returns {JSX.Element} A JSX element containing the controls for adjusting coverage settings.
 */
export function CoverageApiDropdown(datasource: { datasource: WesDataSource }): JSX.Element {
    const [settings, setSettings] = createStore(datasource.datasource);
    const setAlpha = (e: any) => {
        setSettings({ alpha: Number(e.target.value) });
    };
    const setHeight = (e: any) => {
        setSettings({ heightExaggeration: Number(e.target.value) });
    };
    const setResolution = (e: any) => {
        setSettings({ maxResolution: Number(e.target.value) });
    };
    return (
        <Show when={datasource.datasource instanceof CoverageApiDataSource}>
            <div class="grid-break" />
            <div class="selector-grid selector-row-two">
                <label class="selector-label" for="alpha">
                    Transparency:{" "}
                </label>
                <input
                    class="selector"
                    name="alpha"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={(settings as CoverageApiDataSource).alpha}
                    onChange={setAlpha}
                 />
            </div>
            <div class="selector-grid selector-row-three">
                <label class="selector-label" for="Height Scale">
                    Height Scale:{" "}
                </label>
                <input
                    class="selector"
                    name="Height Scale"
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={(settings as CoverageApiDataSource).heightExaggeration}
                    onChange={setHeight}
                 />
            </div>
            <div class="selector-grid selector-row-four">
                <label class="selector-label" for="Resolution">
                    Resolution:{" "}
                </label>
                <input
                    class="selector"
                    name="Resolution"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={(settings as CoverageApiDataSource).maxResolution}
                    onChange={setResolution}
                 />
            </div>
        </Show>
    );
}
