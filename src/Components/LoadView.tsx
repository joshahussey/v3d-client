import { createEffect, createResource, createSignal, For, JSX, Show, Signal, Suspense } from "solid-js";
import { createDropzone, UploadFile, fileUploader, createFileUploader } from "@solid-primitives/upload";
import { createStore, reconcile, unwrap } from "solid-js/store";
import { CesiumWindow, MapState, ViewRecord } from "../Types/types";
import { ToolbarContextType, useToolbarStateContext } from "../Context/ToolbarStateContext";
import { applyViewParameters, loadViewParameters } from "../Utils/SaveView";
import { zoomToLoadedView } from "../Utils/SaveView";
import { fuzzySearch } from "@thisbeyond/solid-select";
import { EditView } from "./EditView";
import { getViewsServletUrl, OPENED_LAYER_PAGE, VIEW_TYPE, VIEW_TYPES } from "../Constants";
import { setMapState } from "../Utils/Controller";
import { translate as t } from "../i18n/Translator";
import { validateMapState } from "../Utils/Utils";

fileUploader;

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

    const { openedLayerPage, setOpenedLayerPage, isEditOpened, setEditOpened } =
        useToolbarStateContext() as ToolbarContextType;
    createEffect(() => {
        if (isEditOpened() && (openedLayerPage() !== OPENED_LAYER_PAGE.LOAD_VIEW || selectedView() == null)) {
            setEditOpened(false);
        }
    });

    const [files, setFiles] = createSignal<UploadFile[]>([]);
    const [uploadMessage, setUploadMessage] = createSignal<string>("");
    createFileUploader();

    const { setRef: dropZoneRef } = createDropzone({
        onDrop: async files => {
            files.forEach(f => setFiles([f]));
            if (files.length > 0) {
                setUploadMessage(files[0].name);
            }
        } //,
        //onDragStart: files => files.forEach(f => console.log(f)),
        //onDragOver: files => console.log("drag over")
    });

    function loadUploadedMapState(mapStateJsonFile: File) {
        const fileReader = new FileReader();
        fileReader.onload = () => {
            try {
                const fileRead = fileReader.result;
                const mapStateJson = JSON.parse(fileRead as string) as MapState;
                if (!validateMapState(mapStateJson)) {
                    throw t("loadViewMapStateInvalidError");
                }
                if (mapStateJson.version) {
                    switch (mapStateJson.version) {
                        case 1.0: {
                            setMapState(mapStateJson);
                            loadViewParameters();
                            const cesiumWindow = window as CesiumWindow;
                            const viewer = cesiumWindow.Map3DViewer;
                            applyViewParameters(cesiumWindow.optionsMap);
                            zoomToLoadedView(viewer);
                            break;
                        }
                        default:
                            console.error("Unsupported version number for map state json");
                    }
                }
            } catch (e) {
                setUploadMessage(t("loadViewMapStateInvalidError"));
            }
        };
        fileReader.readAsText(mapStateJsonFile);
    }

    return (
        <>
            <Show when={!isEditOpened()}>
                <div class="load-view">
                    <Show when={VIEW_TYPE !== VIEW_TYPES.DOWNLOAD_VIEWS.valueOf()}>
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
                                {t("loadViewLoad")}
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
                                {t("loadViewDelete")}
                            </button>
                            <button
                                class="load-view-edit-button load-bottom-buttons"
                                ref={editButtonRef}
                                onClick={async () => {
                                    setEditOpened(true);
                                }}
                            >
                                {t("loadViewEdit")}
                            </button>
                            <button
                                class="load-view-cancel-button load-bottom-buttons"
                                onClick={() => {
                                    setOpenedLayerPage(OPENED_LAYER_PAGE.CLOSED);
                                }}
                            >
                                {t("loadViewCancel")}
                            </button>
                        </div>
                    </Show>
                    <Show when={VIEW_TYPE == VIEW_TYPES.DOWNLOAD_VIEWS.valueOf()}>
                        <div id="load-view-upload-div">
                            <div id="load-view-upload-dropzone" ref={dropZoneRef}>
                                <div id="load-view-inner-dropzone">
                                    {t("loadViewDropFileHere")}
                                    <br />
                                    <label for="file-upload" class="load-view-custom-file-upload">
                                        {t("loadViewChooseFile")}
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        use:fileUploader={{
                                            userCallback: fs => fs.forEach(f => console.log(f)),
                                            setFiles
                                        }}
                                    />
                                </div>
                            </div>
                            <div id="load-view-upload-buttons-div">
                                <span id="load-view-upload-file-name">{uploadMessage()}</span>
                                <button
                                    id="load-view-upload-file-load-button"
                                    onClick={() => {
                                        if (files().length > 0) {
                                            loadUploadedMapState(files()[0].file);
                                        } else {
                                            console.log("No file uploaded.");
                                        }
                                    }}
                                >
                                    {t("loadViewLoad")}
                                </button>
                            </div>
                        </div>
                    </Show>
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
    let responseText;
    if (VIEW_TYPE == VIEW_TYPES.EXTERNAL_VIEWS.valueOf()) {
        const args = {
            type: "loadView",
            sessionId: sessionStorage.getItem("sessionID"),
            viewId
        };
        const response = await fetch(getViewsServletUrl(), {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json" },
            redirect: "follow",
            body: JSON.stringify(args)
        });
        responseText = await response.text();
    } else if (VIEW_TYPE == VIEW_TYPES.LOCAL_VIEWS.valueOf()) {
        const url =
            window.location.origin +
            window.location.pathname +
            "/view/" +
            viewId +
            "?sessionID=" +
            sessionStorage.getItem("sessionID");
        const response = await fetch(url, {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            redirect: "follow"
        });
        responseText = await response.text();
    } else {
        return false;
    }
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
    let response;
    if (VIEW_TYPE == VIEW_TYPES.EXTERNAL_VIEWS.valueOf()) {
        const args = {
            type: "deleteView",
            sessionId: sessionStorage.getItem("sessionID"),
            viewId
        };
        sessionStorage.getItem("sessionID");
        response = await fetch(getViewsServletUrl(), {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json" },
            redirect: "follow",
            body: JSON.stringify(args)
        });
    } else if (VIEW_TYPE == VIEW_TYPES.LOCAL_VIEWS.valueOf()) {
        const url =
            window.location.origin +
            window.location.pathname +
            "/view/" +
            viewId +
            "?sessionID=" +
            sessionStorage.getItem("sessionID");
        response = await fetch(url, {
            method: "DELETE",
            mode: "cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            redirect: "follow"
        });
    } else {
        return false;
    }
    const code = response.status;

    if (code < 200 || code > 300) {
        alert("Error: Unable to save view.");
        return false;
    }

    refetch();
    return true;
}

async function fetchViews(): Promise<ViewRecord[]> {
    if (VIEW_TYPE == VIEW_TYPES.EXTERNAL_VIEWS.valueOf()) {
        const args = {
            type: "listViews",
            sessionId: sessionStorage.getItem("sessionID")
        };
        return (
            await fetch(getViewsServletUrl(), {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                headers: { "Content-Type": "application/json" },
                redirect: "follow",
                body: JSON.stringify(args)
            })
        ).json();
    } else if (VIEW_TYPE == VIEW_TYPES.LOCAL_VIEWS.valueOf()) {
        const url =
            window.location.origin +
            window.location.pathname +
            "views?sessionID=" +
            sessionStorage.getItem("sessionID");
        return (
            await fetch(url, {
                method: "GET",
                mode: "cors",
                cache: "no-cache",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                redirect: "follow"
            })
        ).json();
    } else {
        return [];
    }
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
