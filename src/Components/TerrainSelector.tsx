import { Select, createOptions } from "@thisbeyond/solid-select";
import { createEffect } from "solid-js";
import { UIContextType, useInterfaceContext } from "../Context/UIContext";
import { JSX } from "solid-js";
import { cesiumBuiltInUID, googlePhotorealisticUID, OPENED_LAYER_PAGE, osmBuildingsUID } from "../Constants";
import { ToolbarContextType, useToolbarStateContext } from "../Context/ToolbarStateContext";
import { translate as t } from "../i18n/Translator";
import { saveViewParameters } from "../Utils/SaveView";
import { CesiumWindow, Wes3dMapLayer, WesLayerPropertiesObject, cslt3DTilesOption } from "../Types/types";

/**
 * Represents a component for selecting a terrain layer from available terrain sets.
 * @returns {JSX.Element} A JSX element representing the terrain selector.
 */
export function TerrainSelector(): JSX.Element {
    const { terrainSets, selectedTerrain, setSelectedTerrain, tileSets } = useInterfaceContext() as UIContextType;
    const { setOpenedLayerPage } = useToolbarStateContext() as ToolbarContextType;
    const terrainSetsArray = terrainSets();
    const properties = createOptions(terrainSetsArray, {
        key: "name"
    });

    createEffect(() => {
        if (selectedTerrain().uid == googlePhotorealisticUID) {
            (document.getElementById("baseMapSelectList") as HTMLSelectElement).disabled = true;
            (document.getElementById("baseMapListItem") as HTMLElement).children[1].classList.add(
                "selector-layer-disabled"
            );
            (document.getElementById("baseMapSelectListLabel") as HTMLElement).classList.add(
                "selector-layer-label-disabled"
            );
        } else {
            (document.getElementById("baseMapSelectList") as HTMLSelectElement).disabled = false;
            (document.getElementById("baseMapListItem") as HTMLElement).children[1].classList.remove(
                "selector-layer-disabled"
            );
            (document.getElementById("baseMapSelectListLabel") as HTMLElement).classList.remove(
                "selector-layer-label-disabled"
            );
        }
    });
    createEffect(() => {
        let refresh = false;
        for (const tileSet of tileSets()) {
            if (tileSet.uid !== osmBuildingsUID) continue;

            // If the selected terrain layer is not Cesium Built In, turn off and disable OSM Buildings.
            if (selectedTerrain().uid != cesiumBuiltInUID) {
                if (tileSet.show || tileSet.enabled) {
                    tileSet.show = false;
                    tileSet.enabled = false;
                    refresh = true;
                }
                // Otherwise, re-enable OSM Buildings.
            } else if (!tileSet.enabled) {
                tileSet.enabled = true;
                tileSet.show = true;
                refresh = true;
            }
            const cesiumWindow = window as CesiumWindow;
            const optionsMap = cesiumWindow.optionsMap();
            optionsMap.forEach((value: WesLayerPropertiesObject, key: Wes3dMapLayer) => {
                if (key.uid === osmBuildingsUID) {
                    (value as cslt3DTilesOption).show = tileSet.show;
                    optionsMap.set(key, value);
                }
            });
            saveViewParameters(cesiumWindow.Map3DViewer, cesiumWindow.optionsMap);
        }
        if (refresh) {
            // On the next UI tick, close and reopen the layer panel to refresh the UI.

            // eslint-disable-next-line no-undef
            process.nextTick(() => {
                setOpenedLayerPage(OPENED_LAYER_PAGE.CLOSED);
            });
            // eslint-disable-next-line no-undef
            process.nextTick(() => {
                setOpenedLayerPage(OPENED_LAYER_PAGE.LAYERS);
            });
        }
    });

    return (
        <li>
            <label class="selector-layer-label" for="terrain">
                {t("terrainSelectorLabel")}
            </label>
            <Select
                class="selector-layer"
                initialValue={selectedTerrain()}
                placeholder={t("selectPlaceholder")}
                emptyPlaceholder={t("selectEmptyListPlaceholder")}
                name="terrain"
                {...properties}
                onChange={setSelectedTerrain}
            />
        </li>
    );
}
