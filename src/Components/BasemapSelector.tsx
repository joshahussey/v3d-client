import { Select, createOptions } from "@thisbeyond/solid-select";
import { useInterfaceContext } from "../Context/UIContext";

/**
 * @description
 * This component is a selector for the basemap.
 * @example
 * <BasemapSelector />
 */
export function BasemapSelector() {
    const { baseLayers, selectedLayer, setSelectedLayer } = useInterfaceContext() as any;
    const baseMapLayers = baseLayers();
    const properties = createOptions(baseMapLayers, {
        key: "name"
    });

    return (
        <li id="baseMapListItem">
            <label class="selector-layer-label" id="baseMapSelectListLabel" for="basemaps">
                Basemap:{" "}
            </label>
            <Select
                class="selector-layer"
                id="baseMapSelectList"
                initialValue={selectedLayer()}
                name="basemaps"
                {...properties}
                onChange={setSelectedLayer}
            />
        </li>
    );
}
