import { createContext, createSignal, useContext } from "solid-js";
import { createStore } from "solid-js/store";

export type ServiceStatusEntry = { serviceUid: string; serviceOpenedStatus: boolean };
const ToolbarContext = createContext();
export function ToolbarStateContext(props: any) {
    const [isLayersOpened, setLayersOpened] = createSignal(false);
    const [isSaveOpened, setSaveOpened] = createSignal(false);
    const [isLoadOpened, setLoadOpened] = createSignal(false);
    const [isCatalogOpened, setCatalogOpened] = createSignal(false);
    const [isSearchOpened, setSearchOpened] = createSignal(false);
    const [isEditOpened, setEditOpened] = createSignal(false);
    const [isLayersOrderOpened, setLayersOrderOpened] = createSignal(false);
    const [isBasemapTerrainOpened, setBasemapTerrainOpened] = createSignal(false);
    const [isLayersTreeOpened, setLayersTreeOpened] = createSignal(true);
    const [serviceExpandedMap, setServiceExpandedMap] = createStore<ServiceStatusEntry[]>([]);
    return (
        <ToolbarContext.Provider
            value={{
                isLayersOpened,
                setLayersOpened,
                isLayersTreeOpened,
                setLayersTreeOpened,
                isSaveOpened,
                setSaveOpened,
                isLoadOpened,
                setLoadOpened,
                isCatalogOpened,
                setCatalogOpened,
                isSearchOpened,
                setSearchOpened,
                isEditOpened,
                setEditOpened,
                isLayersOrderOpened,
                setLayersOrderOpened,
                isBasemapTerrainOpened,
                setBasemapTerrainOpened,
                serviceExpandedMap,
                setServiceExpandedMap
            }}
        >
            {props.children}
        </ToolbarContext.Provider>
    );
}

export function useToolbarStateContext() {
    return useContext(ToolbarContext);
}
