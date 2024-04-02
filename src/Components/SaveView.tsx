import { ToolbarContextType, useToolbarStateContext } from "../Context/ToolbarStateContext";
import { saveViewParameters } from "../Utils/SaveView";
import { CesiumWindow } from "../types";
import { createSignal } from "solid-js";
import { MAX_CHARS_100, MAX_CHARS_1024, VIEWS_SERVLET_URL } from "../Constants";
import { JSX } from "solid-js";
import { translate as t } from "../i18n/Translator";

/**
 * @returns {JSX.Element} - A JSX Element containing the Save View panel
 */
export function SaveView(): JSX.Element {
    const [title, setTitle] = createSignal("");
    const [description, setDescription] = createSignal("");

    const { setSaveOpened } = useToolbarStateContext() as ToolbarContextType;

    return (
        <div class="save-view">
            <div class="save-view-label-div">
                <span class="save-view-label"> {t("saveViewSaveView")} </span>
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
                    {t("saveViewSave")}
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
                    {t("saveViewCancel")}
                </button>
            </form>
        </div>
    );
}

async function submitSave(title: string, description: string): Promise<boolean> {
    if (!title || title.match("/^s*$/")) {
        alert(t("saveViewSubmitSaveError1"));
        return false;
    } else if (title.length > MAX_CHARS_100) {
        alert(t("saveViewSubmitSaveError2", [MAX_CHARS_100.toString()]));
    } else if (description.length > MAX_CHARS_1024) {
        alert(t("saveViewSubmitSaveError3", [MAX_CHARS_1024.toString()]));
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
        alert(t("saveViewSubmitSaveError4"));
        return false;
    }
    return true;
}
