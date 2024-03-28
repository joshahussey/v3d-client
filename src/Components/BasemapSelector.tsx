import { Select, createOptions } from "@thisbeyond/solid-select";
import { UIContextType, useInterfaceContext } from "../Context/UIContext";
import { translate as t } from "../i18n/Translator";

/**
 * @description
 * This component is a selector for the basemap.
 * @example
 * <BasemapSelector />
 */
export function BasemapSelector() {
    const { baseLayers, selectedLayer, setSelectedLayer } = useInterfaceContext() as UIContextType;
    const baseMapLayers = baseLayers();
    const properties = createOptions(baseMapLayers, {
        key: "name"
    });

    return (
        <li id="baseMapListItem">
            <label class="selector-layer-label" id="baseMapSelectListLabel" for="basemaps">
                {t("basemapSelectorLabel")}
            </label>
            <Select
                class="selector-layer"
                id="baseMapSelectList"
                initialValue={selectedLayer()}
                placeholder={t("selectPlaceholder")}
                emptyPlaceholder={t("selectEmptyListPlaceholder")}
                name="basemaps"
                {...properties}
                onChange={setSelectedLayer}
            />
        </li>
    );
}
