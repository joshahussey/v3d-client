import { JSX } from "solid-js";
import { translate as t } from "../i18n/Translator";
import { createOptions, Select } from "@thisbeyond/solid-select";
import { CesiumWindow } from "../Types/types";
import { CLUSTER_HEIGHT_CONSTANT, CLUSTER_WIDTH, DEFAULT_ALLOWED_ZOOM_DISTANCE } from "../Constants";

function makeCheckbox(checked: boolean, onChange: (stateChanged: boolean) => void) {
    return (
        <input
            type="checkbox"
            class="settings-menu-item-input settings-menu-item-checkbox"
            checked={checked}
            onChange={e => onChange(e.currentTarget.checked)}
        />
    );
}

function makeSelect(options: object[], selectedOption: object, onChange: (option: object) => void) {
    const properties = createOptions(options, {
        key: "name"
    });
    return (
        <Select
            class="settings-menu-item-input settings-select"
            initialValue={selectedOption}
            placeholder={t("selectPlaceholder")}
            emptyPlaceholder={t("selectEmptyListPlaceholder")}
            name="basemaps"
            {...properties}
            onChange={onChange}
        />
    );
}

export function makeTextbox(defString: string, onChange: (text: string) => void) {
    return (
        <input
            type="text"
            class="settings-menu-item-input "
            placeholder={defString}
            onChange={e => onChange(e.currentTarget.value)}
            value={defString}
        />
    );
}

function updateSliderLabel(e: Event) {
    if (e.target && (e.target as HTMLElement).nextElementSibling) {
        ((e.target as HTMLElement).nextElementSibling as HTMLInputElement).value = (e.target as HTMLInputElement).value;
    }
}
export function makeSlider(
    minValue: number,
    maxValue: number,
    step: number,
    value: number,
    onChange: (value: string) => void
) {
    return (
        <div class="settings-menu-item-input">
            <input
                class="settings-menu-item-input settings-menu-item-slider"
                name="alpha"
                type="range"
                min={String(minValue)}
                max={String(maxValue)}
                step={String(step)}
                value={String(value)}
                onChange={e => onChange((e.target as HTMLInputElement).value)}
                onInput={e => updateSliderLabel(e)}
            />
            <output class="settings-menu-slider-value-label">{value}</output>
        </div>
    );
}

/*
function makeTextboxWithDelete(
    currentValue: string | null,
    changeAction: (text: string) => void,
    deleteAction: () => void
) {
    currentValue = currentValue ? currentValue : "";
    const textbox = makeTextbox(currentValue, changeAction) as HTMLInputElement;
    return (
        <div class="settings-menu-item-input">
            {textbox}
            <button
                class="settings-menu-close"
                onClick={() => {
                    deleteAction();
                    textbox.value = "";
                    textbox.placeholder = "";
                }}
            >
                <span class="delete-span">&times;</span>
            </button>
        </div>
    );
}
*/

export function SettingsMenuItem(props: { title: string; hoverText: string; input: JSX.Element }): JSX.Element {
    const { title, hoverText, input } = props;

    return (
        <div class="settings-menu-item-div">
            <span class="settings-menu-item-title" title={hoverText}>
                {" "}
                {title}{" "}
            </span>
            {input}
        </div>
    );
}

export function SettingsMenuItems(settingChanged: (value: boolean) => void): JSX.Element[] {
    const settingsMenuOptions: JSX.Element[] = [];

    function setLanguage(language: { name: string }) {
        let changed = false;
        if (language.name === "English") {
            if (localStorage.getItem("userLanguage") != "en") changed = true;
            localStorage.setItem("userLanguage", "en");
        } else {
            if (localStorage.getItem("userLanguage") != "fr") changed = true;
            localStorage.setItem("userLanguage", "fr");
        }
        settingChanged(changed);
    }
    function getLanguageVerbose() {
        const lang = localStorage.getItem("userLanguage");
        if (!lang || lang === "en") {
            return "English";
        } else {
            return "Français";
        }
    }
    settingsMenuOptions.push(
        <SettingsMenuItem
            title={t("settingsItemLanguage")}
            hoverText={t("settingsItemLanguage")}
            input={makeSelect(
                [{ name: "English" }, { name: "Français" }],
                { name: getLanguageVerbose() },
                (e: object) => setLanguage(e as { name: string })
            )}
        />
    );

    function setSubterrainCameraAllowed(checked: boolean) {
        if (!checked) {
            localStorage.setItem("minimumAllowedZoomDistance", DEFAULT_ALLOWED_ZOOM_DISTANCE.toString());
            (window as CesiumWindow).Map3DViewer.scene.screenSpaceCameraController.minimumZoomDistance =
                DEFAULT_ALLOWED_ZOOM_DISTANCE;
        } else {
            localStorage.setItem("minimumAllowedZoomDistance", "1");
            (window as CesiumWindow).Map3DViewer.scene.screenSpaceCameraController.minimumZoomDistance = 1;
        }
        settingChanged(true);
    }
    settingsMenuOptions.push(
        <SettingsMenuItem
            title={t("settingsItemSubterrain")}
            hoverText={t("settingsItemSubterrainHover")}
            input={makeCheckbox(localStorage.getItem("minimumAllowedZoomDistance") == "1", setSubterrainCameraAllowed)}
        />
    );

    settingsMenuOptions.push(
        <SettingsMenuItem
            title={t("settingsItemMapState")}
            hoverText={t("settingsItemMapState")}
            input={
                <button
                    class="clear-map-state"
                    onClick={() => {
                        removeLocalStorageItem("cesiumMapState");
                        settingChanged(true);
                    }}
                >
                    <span class=""> {t("settingsClearMapState")} </span>
                </button>
            }
        />
    );

    return settingsMenuOptions;
}

export function ConstantsMenuItems(props: { settingChanged: (value: boolean) => void }) {
    const { settingChanged } = props;
    const constantsMenuOptions: JSX.Element[] = [];

    constantsMenuOptions.push(
        <SettingsMenuItem
            title={t("settingsClusterDimensionTitle")}
            hoverText={t("settingsClusterDimensionHover")}
            input={makeSlider(10, 100, 1, CLUSTER_WIDTH.getValue().toString(), e => {
                updateLocalStorageConstants("CLUSTER_WIDTH_HEIGHT", e);
                settingChanged(true);
            })}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title={t("settingsClusterHeightTitle")}
            hoverText={t("settingsClusterHeightHover")}
            input={makeSlider(0, 100000, 1000, CLUSTER_HEIGHT_CONSTANT, e => {
                updateLocalStorageConstants("CLUSTER_HEIGHT_CONSTANT", e);
                settingChanged(true);
            })}
        />
    );

    return constantsMenuOptions;
}

function removeLocalStorageItem(itemKey: string) {
    localStorage.removeItem(itemKey);
}

export function updateLocalStorageConstants(constantName: string, constantValue: string) {
    const mapStateString = localStorage.getItem("constants");
    if (mapStateString) {
        const mapState = JSON.parse(mapStateString);
        if (mapState) {
            mapState[constantName] = constantValue;
            localStorage.setItem("constants", JSON.stringify(mapState));
        }
    } else {
        localStorage.setItem("constants", JSON.stringify({}));
    }
}
