import { Select, createOptions } from "@thisbeyond/solid-select";
import { createEffect } from "solid-js";
import { useInterfaceContext } from "../Context/UIContext";
import { JSX } from "solid-js";
import { cesiumBuiltInUID, googlePhotorealisticUID, osmBuildingsUID } from "../Constants";
import { useToolbarStateContext } from "../Context/ToolbarStateContext";

/**
 * Represents a component for selecting a terrain layer from available terrain sets.
 * @returns {JSX.Element} A JSX element representing the terrain selector.
 */
export function TerrainSelector(): JSX.Element {
    const { terrainSets, selectedTerrain, setSelectedTerrain, tileSets } = useInterfaceContext() as any;
    const { setLayersOpened } = useToolbarStateContext() as any;
    const terrainSetsArray = terrainSets();
    const properties = createOptions(terrainSetsArray, {
        key: "name"
    });

    createEffect(() => {
        if (selectedTerrain().uid == googlePhotorealisticUID) {
            (document.getElementById("baseMapSelectList") as HTMLSelectElement).disabled = true;
            (document.getElementById("baseMapListItem") as HTMLElement).children[1].classList.add("selector-layer-disabled");
            (document.getElementById("baseMapSelectListLabel") as HTMLElement).classList.add("selector-layer-label-disabled");
        } else {
            (document.getElementById("baseMapSelectList") as HTMLSelectElement).disabled = false;
            (document.getElementById("baseMapListItem") as HTMLElement).children[1].classList.remove("selector-layer-disabled");
            (document.getElementById("baseMapSelectListLabel") as HTMLElement).classList.remove("selector-layer-label-disabled");
        }
    });
    createEffect(() => {
        let refresh = false;
        for (const tileSet of tileSets()) {
            // If the selected terrain layer is not Cesium Built In, turn off and disable OSM Buildings.
            if (selectedTerrain().uid != cesiumBuiltInUID) {
                if (tileSet.uid == osmBuildingsUID && (tileSet.show || tileSet.enabled)) {
                    tileSet.show = false;
                    tileSet.enabled = false;
                    refresh = true;
                    break;
                }
            // Otherwise, re-enable OSM Buildings.
            } else {
                if (tileSet.uid == osmBuildingsUID && !tileSet.enabled) {
                    tileSet.enabled = true;
                    refresh = true;
                    break;
                }
            }
        }
        if (refresh) {
            // On the next UI tick, close and reopen the layer panel to refresh the UI.
            process.nextTick(() => {
                setLayersOpened(false);
            });
            process.nextTick(() => {
                setLayersOpened(true);
            });
        }
    });

    return (
        <li>
            <label class="selector-layer-label" for="terrain">
                Terrain:{" "}
            </label>
            <Select
                class="selector-layer"
                initialValue={selectedTerrain()}
                name="terrain"
                {...properties}
                onChange={setSelectedTerrain}
            />
        </li>
    );
}
