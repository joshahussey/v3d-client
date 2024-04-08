import { Select, createOptions } from "@thisbeyond/solid-select";
import { JSX, createSignal } from "solid-js";
import FeaturesApiDataSource from "../Datasources/FeaturesApiDataSource";
import { translate as t } from "../i18n/Translator";

type highLightOption = {
    name: string;
    value: boolean;
}

/**
 * Represents a component for selecting highlighting options for a FeaturesApiDataSource layer.
 * @param {Object} layer - The layer object containing the FeaturesApiDataSource instance.
 * @param {FeaturesApiDataSource} layer.datasource - The FeaturesApiDataSource instance representing the data source layer.
 * @returns {JSX.Element} A JSX element representing the highlight selector.
 */
export function HighlightSelector(layer: { datasource: FeaturesApiDataSource }): JSX.Element {
    const [isHighlighted, setIsHighlighted] = createSignal(layer.datasource.isHighlighted);
    const properties = createOptions(
        [
            { name: t("highlightSelectorOn"), value: true },
            { name: t("highlightSelectorOff"), value: false }
        ],
        {
            key: "name"
        }
    );
    const initialValue = isHighlighted() == true ? { name: t("highlightSelectorOn"), value: true } : { name: t("highlightSelectorOff"), value: false };
    const selectHighlighting = (highlighted: highLightOption) => {
        if (highlighted == null) return;
        setIsHighlighted(highlighted.value);
        layer.datasource.isHighlighted = highlighted.value;
    };
    return (
        <>
            <div class="selector-grid selector-highlight">
                <label class="selector-label" for="styles">
                    {t("highlightSelectorHighlighting")}
                </label>
                <Select
                    class="selector"
                    initialValue={initialValue}
                    placeholder={t("selectPlaceholder")}
                    emptyPlaceholder={t("selectEmptyListPlaceholder")}
                    name="styles"
                    {...properties}
                    onChange={selectHighlighting}
                />
            </div>
        </>
    );
}
