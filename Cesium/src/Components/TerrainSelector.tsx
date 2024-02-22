import { Select, createOptions } from "@thisbeyond/solid-select";
import { createEffect } from "solid-js";
import { useInterfaceContext } from "../Context/UIContext";
import { JSX } from "solid-js";

/**
 * Represents a component for selecting a terrain layer from available terrain sets.
 * @returns {JSX.Element} A JSX element representing the terrain selector.
 */
export function TerrainSelector(): JSX.Element {
    const { terrainSets, selectedTerrain, setSelectedTerrain } = useInterfaceContext() as any;
    const terrainSetsArray = terrainSets();
    const properties = createOptions(terrainSetsArray, {
        key: "name"
    });

    createEffect(() => {
        //Google Photorealistic UUID: 89874ae8-45Da-498b-9ceb-5d5a965f1bfa
        if (selectedTerrain().uid == "89874ae8-45Da-498b-9ceb-5d5a965f1bfa") {
            (document.getElementById("baseMapSelectList") as HTMLSelectElement).disabled = true;
            (document.getElementById("baseMapListItem") as HTMLElement).children[1].classList.add("selector-layer-disabled");
            (document.getElementById("baseMapSelectListLabel") as HTMLElement).classList.add("selector-layer-label-disabled");
        } else {
            (document.getElementById("baseMapSelectList") as HTMLSelectElement).disabled = false;
            (document.getElementById("baseMapListItem") as HTMLElement).children[1].classList.remove("selector-layer-disabled");
            (document.getElementById("baseMapSelectListLabel") as HTMLElement).classList.remove("selector-layer-label-disabled");
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
