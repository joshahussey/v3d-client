import { useToolbarStateContext } from "../Context/ToolbarStateContext";
import { saveViewParameters } from "../Utils/SaveView";
import { CesiumWindow } from "../Wes";
import { createSignal } from "solid-js";
import { MAX_CHARS_100, MAX_CHARS_1024, VIEWS_SERVLET_URL } from "../Constants";
import { JSX } from "solid-js";

/**
 * @returns {JSX.Element} - A JSX Element containing the Save View panel
 */
export function SaveView(): JSX.Element {
    const [title, setTitle] = createSignal("");
    const [description, setDescription] = createSignal("");

    const { setSaveOpened } = useToolbarStateContext() as any;

    return (
        <div class="save-view">
            <div class="save-view-label-div">
                <span class="save-view-label"> Save View </span>
            </div>
            <form
                class="save-view-form"
                onSubmit={async e => {
                    e.preventDefault();

                    const success = await submitSave(title(), description());
                    if (success) {
                        setTitle("");
                        setDescription("");
                        setSaveOpened(false);
                    }
                }}
            >
                <label class="save-view-form-title-label">Title</label>
                <textarea
                    class="save-view-form-title"
                    value={title()}
                    onInput={e => setTitle(e.currentTarget.value)}
                    rows="1"
                    cols="48"
                    placeholder="Title"
                />
                <label class="save-view-form-description-label">Description</label>
                <textarea
                    class="save-view-form-description"
                    value={description()}
                    onInput={e => setDescription(e.currentTarget.value)}
                    rows="4"
                    cols="48"
                    placeholder="Description"
                />
                <button type="submit" class="save-view-form-save-button">
                    Save
                </button>
                <button
                    onClick={() => {
                        setSaveOpened(false);
                        setTitle("");
                        setDescription("");
                    }}
                    type="button"
                    class="save-view-form-cancel-button"
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

async function submitSave(title: string, description: string): Promise<boolean> {
    if (!title || title.match("/^s*$/")) {
        alert("A title is required to save a view.");
        return false;
    } else if (title.length > MAX_CHARS_100) {
        alert(`Error: Title must not exceed ${MAX_CHARS_100} characters.`);
    } else if (description.length > MAX_CHARS_1024) {
        alert(`Error: Description must not exceed ${MAX_CHARS_1024} characters.`);
    }

    const cesiumWindow = window as CesiumWindow;
    saveViewParameters(cesiumWindow.Map3DViewer, cesiumWindow.optionsMap);
    const mapState = cesiumWindow.Map3DController.getMapState();

    const args = {
        type: "createView",
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
        alert("Saving view failed.");
        return false;
    }
    return true;
}
