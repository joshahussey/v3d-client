import { Accessor, createContext, createSignal, Setter, useContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

export type ServiceStatusEntry = { serviceUid: string; serviceOpenedStatus: boolean };
export type ToolbarContextType = {
    isLayersOpened: Accessor<boolean>;
    setLayersOpened: Setter<boolean>;
    isSaveOpened: Accessor<boolean>;
    setSaveOpened: Setter<boolean>;
    isLoadOpened: Accessor<boolean>;
    setLoadOpened: Setter<boolean>;
    isCatalogOpened: Accessor<boolean>;
    setCatalogOpened: Setter<boolean>;
    isSearchOpened: Accessor<boolean>;
    setSearchOpened: Setter<boolean>;
    isEditOpened: Accessor<boolean>;
    setEditOpened: Setter<boolean>;
    isLayersOrderOpened: Accessor<boolean>;
    setLayersOrderOpened: Setter<boolean>;
    isBasemapTerrainOpened: Accessor<boolean>;
    setBasemapTerrainOpened: Setter<boolean>;
    isLayersTreeOpened: Accessor<boolean>;
    setLayersTreeOpened: Setter<boolean>;
    serviceExpandedMap: ServiceStatusEntry[];
    setServiceExpandedMap: SetStoreFunction<ServiceStatusEntry[]>;
}
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
const ToolbarContext = createContext<ToolbarContextType>();
export function useToolbarStateContext() {
    return useContext(ToolbarContext);
}
