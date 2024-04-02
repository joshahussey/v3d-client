import { createSignal } from "solid-js";
import { CesiumWindow, ViewRecord } from "../types";
import { ToolbarContextType, useToolbarStateContext } from "../Context/ToolbarStateContext";
import { MAX_CHARS_100, MAX_CHARS_1024, VIEWS_SERVLET_URL } from "../Constants";
import { saveViewParameters } from "../Utils/SaveView";

export function EditView(view: ViewRecord) {
    const { setEditOpened, setLoadOpened } = useToolbarStateContext() as ToolbarContextType;

    const [title, setTitle] = createSignal(view.title);
    const [description, setDescription] = createSignal(view.description);
    const [viewId] = createSignal(view.id);

    return (
        <div class="edit-view">
            <div class="edit-view-label-div">
                <span class="edit-view-label">Edit View</span>
            </div>
            <form
                class="edit-view-form"
                onSubmit={async e => {
                    e.preventDefault();

                    if (await edit(viewId(), title(), description() || "")) {
                        setEditOpened(false);
                        setLoadOpened(false);
                    }
                }}
            >
                <label class="edit-view-form-title-label">Title</label>
                <textarea
                    class="edit-view-form-title"
                    value={title()}
                    onInput={e => setTitle(e.currentTarget.value)}
                    rows="1"
                    cols="48"
                    placeholder="Title"
                />
                <label class="edit-view-form-description-label">Description</label>
                <textarea
                    class="edit-view-form-description"
                    value={description()}
                    onInput={e => setDescription(e.currentTarget.value)}
                    rows="4"
                    cols="48"
                    placeholder="Description"
                />
                <button type="submit" class="edit-view-form-save-button">
                    Save
                </button>
                <button
                    onClick={() => {
                        setEditOpened(false);
                    }}
                    type="button"
                    class="edit-view-form-cancel-button"
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

async function edit(id: bigint, title: string, description: string): Promise<boolean> {
    if (!title || title.match("/^s*$/")) {
        alert("A title is required to save a view.");
        return false;
    } else if (title.length > MAX_CHARS_100) {
        alert(`Error: Title must not exceed ${MAX_CHARS_100} characters.`);
        return false;
    } else if (description.length > MAX_CHARS_1024) {
        alert(`Error: Description must not exceed ${MAX_CHARS_1024} characters.`);
        return false;
    }

    const cesiumWindow = window as CesiumWindow;
    saveViewParameters(cesiumWindow.Map3DViewer, cesiumWindow.optionsMap);
    const mapState = cesiumWindow.Map3DController.getMapState();

    const args = {
        type: "editView",
        viewId: id,
        title,
        description,
        mapState
    };

    const response = await fetch(VIEWS_SERVLET_URL, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: { "Content-Type": "application/json" },
        redirect: "follow",
        body: JSON.stringify(args)
    });

    const status = response.status;
    if (status < 200 || status > 300) {
        console.error("Edit Cesium view request failed.", response.body);
        alert("Editing view failed.");
        return false;
    }
    return true;
}
