import { Select, createOptions } from "@thisbeyond/solid-select";
import { JSX, createSignal } from "solid-js";
import FeaturesApiDataSource from "../Datasources/FeaturesApiDataSource";

/**
 * Represents a component for selecting highlighting options for a FeaturesApiDataSource layer.
 * @param {Object} layer - The layer object containing the FeaturesApiDataSource instance.
 * @param {FeaturesApiDataSource} layer.datasource - The FeaturesApiDataSource instance representing the data source layer.
 * @returns {JSX.Element} A JSX element representing the highlight selector.
 */
export function HighlightSelector(layer: { datasource: FeaturesApiDataSource }): JSX.Element {
    const [isHighlighted, setIsHighlighted] = createSignal((layer.datasource as any).isHighlighted);
    const properties = createOptions(
        [
            { name: "On", value: true },
            { name: "Off", value: false }
        ],
        {
            key: "name"
        }
    );
    const initialValue = isHighlighted() == true ? { name: "On", value: true } : { name: "Off", value: false };
    const selectHighlighting = (highlighted: any) => {
        if (highlighted == null) return;
        setIsHighlighted(highlighted);
        (layer.datasource as any).isHighlighted = highlighted.value;
    };
    return (
        <>
            <div class="selector-grid selector-highlight">
                <label class="selector-label" for="styles">
                    Highlighting:{" "}
                </label>
                <Select
                    class="selector"
                    initialValue={initialValue}
                    name="styles"
                    {...properties}
                    onChange={selectHighlighting}
                />
            </div>
        </>
    );
}
