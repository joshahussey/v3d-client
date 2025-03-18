import { ToolbarContextType, useToolbarStateContext } from "../Context/ToolbarStateContext";
import { downloadMapState, saveViewParameters } from "../Utils/SaveView";
import { CesiumWindow } from "../Types/types";
import { createSignal, Show } from "solid-js";
import {
    getViewsServletUrl,
    MAX_CHARS_100,
    MAX_CHARS_1024,
    OPENED_LAYER_PAGE,
    VIEW_TYPE,
    VIEW_TYPES
} from "../Constants";
import { JSX } from "solid-js";
import { translate as t } from "../i18n/Translator";
import { getMapState } from "../Utils/Controller";

/**
 * @returns {JSX.Element} - A JSX Element containing the Save View panel
 */
export function SaveView(): JSX.Element {
    const [title, setTitle] = createSignal("");
    const [description, setDescription] = createSignal("");

    const { setOpenedLayerPage } = useToolbarStateContext() as ToolbarContextType;

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
                        setOpenedLayerPage(OPENED_LAYER_PAGE.CLOSED);
                    }
                }}
            >
                <label class="save-view-form-title-label">{t("saveViewTitle")}</label>
                <textarea
                    class="save-view-form-title"
                    value={title()}
                    onInput={e => setTitle(e.currentTarget.value)}
                    rows="1"
                    cols="48"
                    placeholder={t("saveViewTitle")}
                />
                <Show when={VIEW_TYPE !== VIEW_TYPES.DOWNLOAD_VIEWS.valueOf()}>
                    <label class="save-view-form-description-label">{t("saveViewDescription")}</label>
                    <textarea
                        class="save-view-form-description"
                        value={description()}
                        onInput={e => setDescription(e.currentTarget.value)}
                        rows="4"
                        cols="48"
                        placeholder={t("saveViewDescription")}
                    />
                </Show>
                <button type="submit" class="save-view-form-save-button">
                    {t("saveViewSave")}
                </button>
                <button
                    onClick={() => {
                        setOpenedLayerPage(OPENED_LAYER_PAGE.CLOSED);
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

    if (VIEW_TYPE !== VIEW_TYPES.DOWNLOAD_VIEWS.valueOf()) {
        let response;
        if (VIEW_TYPE == VIEW_TYPES.EXTERNAL_VIEWS.valueOf()) {
            const mapState = getMapState();

            const args = {
                type: "createView",
                sessionId: sessionStorage.getItem("sessionID"),
                title,
                description,
                mapState
            };

            response = await fetch(getViewsServletUrl(), {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                headers: { "Content-Type": "application/json" },
                redirect: "follow",
                body: JSON.stringify(args)
            });
        } else if (VIEW_TYPE == VIEW_TYPES.LOCAL_VIEWS.valueOf()) {
            const mapState = JSON.stringify(getMapState());
            const args = {
                title,
                description,
                mapState
            };
            const url =
                window.location.origin +
                window.location.pathname +
                "/view/?sessionID=" +
                sessionStorage.getItem("sessionID");
            response = await fetch(url, {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                redirect: "follow",
                body: JSON.stringify(args)
            });
        } else {
            return false;
        }

        const status = response.status;
        if (status < 200 || status > 300) {
            alert(t("saveViewSubmitSaveError4"));
            return false;
        }
        return true;
    } else {
        const mapState = JSON.stringify(getMapState());
        const myFile = new File([mapState], `${title}.json`);
        downloadMapState(myFile);
        return true;
    }
}
