import { JSX } from "solid-js";
import { translate as t } from "../i18n/Translator";
import { createOptions, Select } from "@thisbeyond/solid-select";
import { CesiumWindow } from "../Types/types";
import {
    AOI_DATASOURCE_ID,
    AOI_DRAW_PIXEL_WIDTH,
    arcgisWorldStreetMapUID,
    bingMapsUID,
    celestrakUID,
    cesiumBuiltInUID,
    CLUSTER_HEIGHT,
    CLUSTER_HEIGHT_CONSTANT,
    CLUSTER_WIDTH,
    csltAsterUID,
    csltLandsat8UID,
    csltOpenTopoUID,
    csltOsmUID,
    DEFAULT_ALLOWED_ZOOM_DISTANCE,
    googleHybridUID,
    googlePhotorealisticUID,
    HOME_POSITION,
    OGC_MAPS_TILE_SIZE,
    osmBuildingsUID,
    osmUID,
    standAloneLayersServiceUID,
    standAloneLayersServiceUrl,
    stJohnsWmtsUID,
    usgsShadedReliefUID,
    wgsEllipsoidUID
} from "../Constants";

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

export function SettingsMenuItems(): JSX.Element[] {
    const settingsMenuOptions: JSX.Element[] = [];

    function setLanguage(language: { name: string }) {
        if (language.name === "English") {
            localStorage.setItem("userLanguage", "en");
        } else {
            localStorage.setItem("userLanguage", "fr");
        }
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
            title={t("settingsItemDataProvider")}
            hoverText={t("settingsItemDataProviderHover")}
            input={makeTextboxWithDelete(
                getLocalStorageItem("dataProvider"),
                e => setLocalStorageItem("dataProvider", e),
                () => {
                    removeLocalStorageItem("dataProvider");
                }
            )}
        />
    );

    settingsMenuOptions.push(
        <SettingsMenuItem
            title={t("settingsItemMapState")}
            hoverText={t("settingsItemMapState")}
            input={makeTextboxWithDelete(
                getLocalStorageItem("cesiumMapState"),
                e => setLocalStorageItem("cesiumMapState", e),
                () => {
                    removeLocalStorageItem("cesiumMapState");
                }
            )}
        />
    );

    return settingsMenuOptions;
}

export function ConstantsMenuItems() {
    const constantsMenuOptions: JSX.Element[] = [];

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="HOME_POSITION"
            hoverText="HOME_POSITION"
            input={makeTextbox(JSON.stringify(HOME_POSITION), e => updateLocalStorageConstants("HOME_POSITION", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="DEFAULT_ALLOWED_ZOOM_DISTANCE"
            hoverText="DEFAULT_ALLOWED_ZOOM_DISTANCE"
            input={makeTextbox(DEFAULT_ALLOWED_ZOOM_DISTANCE.toString(), e =>
                updateLocalStorageConstants("DEFAULT_ALLOWED_ZOOM_DISTANCE", e)
            )}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="AOI_DATASOURCE_ID"
            hoverText="AOI_DATASOURCE_ID"
            input={makeTextbox(AOI_DATASOURCE_ID, e => updateLocalStorageConstants("AOI_DATASOURCE_ID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="AOI_DRAW_PIXEL_WIDTH"
            hoverText="AOI_DRAW_PIXEL_WIDTH"
            input={makeTextbox(AOI_DRAW_PIXEL_WIDTH.toString(), e =>
                updateLocalStorageConstants("AOI_DRAW_PIXEL_WIDTH", e)
            )}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="standAloneLayersServiceUID"
            hoverText="standAloneLayersServiceUID"
            input={makeTextbox(standAloneLayersServiceUID, e =>
                updateLocalStorageConstants("standAloneLayersServiceUID", e)
            )}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="standAloneLayersServiceUrl"
            hoverText="standAloneLayersServiceUrl"
            input={makeTextbox(standAloneLayersServiceUrl, e =>
                updateLocalStorageConstants("standAloneLayersServiceUrl", e)
            )}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="bingMapsUID"
            hoverText="bingMapsUID"
            input={makeTextbox(bingMapsUID, e => updateLocalStorageConstants("bingMapsUID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="googleHybridUID"
            hoverText="googleHybridUID"
            input={makeTextbox(googleHybridUID, e => updateLocalStorageConstants("googleHybridUID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="osmUID"
            hoverText="osmUID"
            input={makeTextbox(osmUID, e => updateLocalStorageConstants("osmUID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="arcgisWorldStreetMapUID"
            hoverText="arcgisWorldStreetMapUID"
            input={makeTextbox(arcgisWorldStreetMapUID, e => updateLocalStorageConstants("arcgisWorldStreetMapUID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="usgsShadedReliefUID"
            hoverText="usgsShadedReliefUID"
            input={makeTextbox(usgsShadedReliefUID, e => updateLocalStorageConstants("usgsShadedReliefUID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="csltOsmUID"
            hoverText="csltOsmUID"
            input={makeTextbox(csltOsmUID, e => updateLocalStorageConstants("csltOsmUID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="csltAsterUID"
            hoverText="csltAsterUID"
            input={makeTextbox(csltAsterUID, e => updateLocalStorageConstants("csltAsterUID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="csltLandsat8UID"
            hoverText="csltLandsat8UID"
            input={makeTextbox(csltLandsat8UID, e => updateLocalStorageConstants("csltLandsat8UID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="csltOpenTopoUID"
            hoverText="csltOpenTopoUID"
            input={makeTextbox(csltOpenTopoUID, e => updateLocalStorageConstants("csltOpenTopoUID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="stJohnsWmtsUID"
            hoverText="stJohnsWmtsUID"
            input={makeTextbox(stJohnsWmtsUID, e => updateLocalStorageConstants("stJohnsWmtsUID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="osmBuildingsUID"
            hoverText="osmBuildingsUID"
            input={makeTextbox(osmBuildingsUID, e => updateLocalStorageConstants("osmBuildingsUID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="celestrakUID"
            hoverText="celestrakUID"
            input={makeTextbox(celestrakUID, e => updateLocalStorageConstants("celestrakUID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="cesiumBuiltInUID"
            hoverText="cesiumBuiltInUID"
            input={makeTextbox(cesiumBuiltInUID, e => updateLocalStorageConstants("cesiumBuiltInUID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="googlePhotorealisticUID"
            hoverText="googlePhotorealisticUID"
            input={makeTextbox(googlePhotorealisticUID, e => updateLocalStorageConstants("googlePhotorealisticUID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="wgsEllipsoidUID"
            hoverText="wgsEllipsoidUID"
            input={makeTextbox(wgsEllipsoidUID, e => updateLocalStorageConstants("wgsEllipsoidUID", e))}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="CLUSTER_WIDTH"
            hoverText="CLUSTER_WIDTH"
            input={makeTextbox(CLUSTER_WIDTH.getValue().toString(), e =>
                updateLocalStorageConstants("CLUSTER_WIDTH", e)
            )}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="CLUSTER_HEIGHT"
            hoverText="CLUSTER_HEIGHT"
            input={makeTextbox(CLUSTER_HEIGHT.getValue().toString(), e =>
                updateLocalStorageConstants("CLUSTER_HEIGHT", e)
            )}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="CLUSTER_HEIGHT_CONSTANT"
            hoverText="CLUSTER_HEIGHT_CONSTANT"
            input={makeTextbox(CLUSTER_HEIGHT_CONSTANT.toString(), e =>
                updateLocalStorageConstants("CLUSTER_HEIGHT_CONSTANT", e)
            )}
        />
    );

    constantsMenuOptions.push(
        <SettingsMenuItem
            title="OGC_MAPS_TILE_SIZE"
            hoverText="OGC_MAPS_TILE_SIZE"
            input={makeTextbox(OGC_MAPS_TILE_SIZE.toString(), e =>
                updateLocalStorageConstants("OGC_MAPS_TILE_SIZE", e)
            )}
        />
    );

    return constantsMenuOptions;
}

function setLocalStorageItem(itemKey: string, value: string) {
    localStorage.setItem(itemKey, value);
}

function getLocalStorageItem(itemKey: string): string | null {
    return localStorage.getItem(itemKey);
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
