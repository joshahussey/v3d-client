import { Select, createOptions } from "@thisbeyond/solid-select";
import { JSX, createSignal } from "solid-js";
import WesDataSource from "../Datasources/WesDataSource";

/**
 * Represents a component for selecting a user-defined style for a map layer.
 * @param {Object} layer - The layer object representing a data source layer.
 * @param {WesDataSource} layer.datasource - The WesDataSource instance representing a data source layer.
 * @returns {JSX.Element} A JSX element representing the user style selector.
 */
export function UserStyleSelector(layer: { datasource: WesDataSource }): JSX.Element {
    const [userStyles, setUserStyles] = createSignal(layer.datasource._userStylesArray != undefined ? layer.datasource._userStylesArray : []);
    const [selectedStyle, setSelectedStyle] = createSignal(
        layer.datasource._userStylesArray != undefined && layer.datasource._userStyle != undefined ? layer.datasource._userStylesArray[layer.datasource._userStyle] : undefined
    );
    const userStylesArray = userStyles();
    const properties = createOptions(userStylesArray, {
        key: "name"
    });

    const selectStyle = (style: any) => {
        if (!style) return;
        if (selectedStyle() !== style) {
            setSelectedStyle(style);
            layer.datasource._userStyle = userStylesArray.indexOf(style);
            if (layer.datasource.restyle !== undefined) {
                layer.datasource.restyle();
            }
        }
    };
    return (
        <>
            <div class="selector-grid selector-row-one">
                <label class="selector-label" for="styles">
                    Style:{" "}
                </label>
                <Select
                    class="selector"
                    initialValue={selectedStyle()}
                    name="styles"
                    {...properties}
                    onChange={selectStyle}
                />
            </div>
        </>
    );
}
