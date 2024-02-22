import { createContext, createSignal, useContext } from "solid-js";

const ToolbarContext = createContext();
export function ToolbarStateContext(props: any) {
    const [isLayersOpened, setLayersOpened] = createSignal(false);
    const [isSaveOpened, setSaveOpened] = createSignal(false);
    const [isLoadOpened, setLoadOpened] = createSignal(false);
    const [isCatalogOpened, setCatalogOpened] = createSignal(false);
    const [isSearchOpened, setSearchOpened] = createSignal(false);
    return (
        <ToolbarContext.Provider
            value={{
                isLayersOpened,
                setLayersOpened,
                isSaveOpened,
                setSaveOpened,
                isLoadOpened,
                setLoadOpened,
                isCatalogOpened,
                setCatalogOpened,
                isSearchOpened,
                setSearchOpened
            }}
        >
            {props.children}
        </ToolbarContext.Provider>
    );
}

export function useToolbarStateContext() {
    return useContext(ToolbarContext);
}
