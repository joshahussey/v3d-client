import { Accessor, createContext, createSignal, JSX, Setter, useContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import { OPENED_LAYER_PAGE } from "../Constants";

export type ServiceStatusEntry = { serviceUid: string; serviceOpenedStatus: boolean };
export type ToolbarContextType = {
    openedLayerPage: Accessor<OPENED_LAYER_PAGE>;
    setOpenedLayerPage: Setter<OPENED_LAYER_PAGE>;
    isEditOpened: Accessor<boolean>;
    setEditOpened: Setter<boolean>;
    serviceExpandedMap: ServiceStatusEntry[];
    setServiceExpandedMap: SetStoreFunction<ServiceStatusEntry[]>;
};
export function ToolbarStateContext(props: {
    children: number | boolean | Node | JSX.ArrayElement | (string & object) | null | undefined;
}) {
    const [openedLayerPage, setOpenedLayerPage] = createSignal(OPENED_LAYER_PAGE.LAYERS);
    const [isEditOpened, setEditOpened] = createSignal(false);
    const [serviceExpandedMap, setServiceExpandedMap] = createStore<ServiceStatusEntry[]>([]);
    return (
        <ToolbarContext.Provider
            value={{
                openedLayerPage,
                setOpenedLayerPage,
                isEditOpened,
                setEditOpened,
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
