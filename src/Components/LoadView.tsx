import { createEffect, createResource, createSignal, For, JSX, Show, Signal, Suspense } from "solid-js";
import { createStore, reconcile, unwrap } from "solid-js/store";
import { CesiumWindow, ViewRecord } from "../Types/types";
import { ToolbarContextType, useToolbarStateContext } from "../Context/ToolbarStateContext";
import { applyViewParameters, loadViewParameters } from "../Utils/SaveView";
import { zoomToLoadedView } from "../Utils/SaveView";
import { fuzzySearch } from "@thisbeyond/solid-select";
import { EditView } from "./EditView";

/**
 * @returns {JSX.Element} A JSX Element representing the Load View panel.
 */
export function LoadView(): JSX.Element {
    const [resource, { refetch }] = createResource(fetchViews, {
        storage: createDeepSignal
    });
    const [selectedView, setSelectedView] = createSignal<ViewRecord>();
    let editButtonRef: HTMLButtonElement | undefined;
    let loadButtonRef: HTMLButtonElement | undefined;
    createEffect(() => {
        if (editButtonRef) {
            editButtonRef.disabled = selectedView() == null;
        }
        if (loadButtonRef) {
            loadButtonRef.disabled = selectedView() == null;
        }
    });
    let viewListRef: HTMLUListElement | undefined;
    createEffect(() => {
        if (selectedView() != undefined && viewListRef) {
            for (const viewEntry of viewListRef.children) {
                if (viewEntry.id == selectedView()?.id.toString()) {
                    // Do UI changes to signify a view being selected.
                    viewEntry.classList.add("load-view-entry-selected");
                    (viewEntry.children[2].children[0] as HTMLInputElement).checked = true;
                } else {
                    // Get rid of UI changes for anything that is no longer selected.
                    (viewEntry.children[2].children[0] as HTMLInputElement).checked = false;
                    viewEntry.classList.remove("load-view-entry-selected");
                }
            }
        }
    });
    const [filterValue, setFilterValue] = createSignal<string>("");
    createEffect(() => {
        if (filterValue() != undefined && filterValue() != null && viewListRef != null) {
            for (const viewEntry of viewListRef.children) {
                const result = fuzzySearch(
                    filterValue(),
                    (viewEntry.children[0] as HTMLElement).innerText +
                        "" +
                        (viewEntry.children[1] as HTMLElement).innerText
                );
                if (result.score > 0 || filterValue() == "") {
                    // If fuzzySearch result > 0 or filterValue is empty, show the entry.
                    viewEntry.classList.remove("load-view-entry-hidden");
                    viewEntry.classList.add("grid");
                } else {
                    if (viewEntry.id == selectedView()?.id.toString()) {
                        // If the entry is selected, unselect it.
                        setSelectedView();
                        (viewEntry.children[2].children[0] as HTMLInputElement).checked = false;
                        viewEntry.classList.remove("load-view-entry-selected");
                    }
                    // If fuzzySearch result < 0, hide the entry.
                    viewEntry.classList.remove("grid");
                    viewEntry.classList.add("load-view-entry-hidden");
                }
            }
        }
    });

    const { isLoadOpened, setLoadOpened, isEditOpened, setEditOpened } = useToolbarStateContext() as ToolbarContextType;
    createEffect(() => {
        if (isEditOpened() && (!isLoadOpened() || selectedView() == null)) {
            setEditOpened(false);
        }
    });

    return (
        <>
            <Show when={!isEditOpened()}>
                <div class="load-view">
                    <div class="load-view-container grid">
                        <Suspense fallback={<p>Loading...</p>}>
                            <div class="load-view-header-label">Load View</div>
                            <input
                                type="text"
                                class="load-view-filter"
                                onKeyUp={e => setFilterValue(e.currentTarget.value)}
                                placeholder="Filter Views"
                            />
                            <nav class="load-view-layer-list-scroll">
                                <ul class="load-view-list cslt-list" ref={viewListRef as HTMLUListElement}>
                                    <For each={resource()}>
                                        {view => (
                                            <li
                                                class="load-view-entry grid"
                                                id={view.id.toString()}
                                                onClick={() => {
                                                    setSelectedView(view);
                                                }}
                                            >
                                                <span title={view.title} class="load-view-entry-title">
                                                    {view.title}
                                                </span>
                                                <p title={view.description} class="load-view-entry-description">
                                                    {view.description}
                                                </p>
                                                <div class="load-view-entry-button-div">
                                                    <input type="radio" class="load-view-entry-button" />
                                                </div>
                                            </li>
                                        )}
                                    </For>
                                </ul>
                            </nav>
                        </Suspense>
                        <button
                            class="load-view-load-button load-bottom-buttons"
                            ref={loadButtonRef}
                            onClick={() => {
                                const view = selectedView();
                                if (view) {
                                    handleLoad(view.id);
                                }
                            }}
                        >
                            Load
                        </button>
                        <button
                            class="load-view-delete-button load-bottom-buttons"
                            onClick={async () => {
                                const view = selectedView();
                                if (view) {
                                    const clear = await handleDelete(view.id, refetch);
                                    if (clear) setSelectedView();
                                }
                            }}
                        >
                            Delete
                        </button>
                        <button
                            class="load-view-edit-button load-bottom-buttons"
                            ref={editButtonRef}
                            onClick={async () => {
                                setEditOpened(true);
                            }}
                        >
                            Edit
                        </button>
                        <button
                            class="load-view-cancel-button load-bottom-buttons"
                            onClick={() => {
                                setLoadOpened(false);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Show>
            <Show when={isEditOpened() && selectedView()}>{editView(selectedView())})</Show>
        </>
    );
}

function editView(viewRecord: ViewRecord | undefined): JSX.Element {
    const view = viewRecord;
    if (view == undefined) {
        return <></>;
    }
    return EditView(view);
}

async function handleLoad(viewId: bigint) {
    const url = window.location.origin + "/view/" + viewId + "?sessionID=" + sessionStorage.getItem("sessionID");
    const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        headers: { "Content-Type": "application/json" },
        redirect: "follow"
    });
    const responseText = await response.text();

    localStorage.setItem("cesiumMapState", responseText);
    loadViewParameters();
    const cesiumWindow = window as CesiumWindow;
    const viewer = cesiumWindow.Map3DViewer;
    applyViewParameters(cesiumWindow.optionsMap);
    zoomToLoadedView(viewer);
}

async function handleDelete(
    viewId: bigint,
    refetch: (info?: unknown) => ViewRecord[] | Promise<ViewRecord[] | undefined> | null | undefined
): Promise<boolean> {
    const url = window.location.origin + "/view/" + viewId + "?sessionID=" + sessionStorage.getItem("sessionID");
    const response = await fetch(url, {
        method: "DELETE",
        mode: "cors",
        cache: "no-cache",
        headers: { "Content-Type": "application/json" },
        redirect: "follow"
    });
    const code = response.status;

    if (code < 200 || code > 300) {
        alert("Error: Unable to save view.");
        return false;
    }

    refetch();
    return true;
}

async function fetchViews(): Promise<ViewRecord[]> {
    const url = window.location.origin + "/views?sessionID=" + sessionStorage.getItem("sessionID");
    return (
        await fetch(url, {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json" },
            redirect: "follow"
        })
    ).json();
}

function createDeepSignal<T>(value: T): Signal<T> {
    const [store, setStore] = createStore({ value });

    return [
        () => store.value,
        (v: T) => {
            const unwrapped = unwrap(store.value);
            typeof v === "function" && (v = v(unwrapped));
            setStore("value", reconcile(v));
            return store.value;
        }
    ] as Signal<T>;
}
