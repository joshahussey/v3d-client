import { JSX } from "solid-js";
import { ToolbarStateContext } from "../Context/ToolbarStateContext";
import { InterfaceProvider } from "../Context/UIContext";
import { ExpandedMenu, ToolbarNav } from "../Components/Components";
import { Slider } from "../Components/Slider";
import { Legend } from "../Components/Legend";
import { CesiumWindow } from "../Types/types";
import { translate as t } from "../i18n/Translator";
import { LoadingIndicator } from "../Components/LoadingIndicator";
import { SettingsButton } from "../Components/SettingsButton";

/**
 * Represents the root of the UI elements.
 * @returns {JSX.Element} A JSX element representing the UI element root.
 */
export function GeoCaUI(): JSX.Element {
    const viewer = (window as CesiumWindow).Map3DViewer;
    const buttonStyle = {
        "font-size": "large"
    };
    const buttonImageStyle = {
        "max-height": "32px",
        "max-width": "32px"
    };
    return (
        <>
            <header id="primary-header" class="cslt-primary-header flex">
                <ToolbarStateContext>
                    <InterfaceProvider>
                        <div style={{ display: "grid" }}>
                            <div id="cslt-toolbar" class="cslt-toolbar-menu">
                                <ToolbarNav />
                                <div class="top-right-cesium-buttons-div">
                                    <button
                                        id="Home"
                                        type="button"
                                        class="cesium-button top-right-cesium-button"
                                        style={buttonStyle}
                                        onClick={() => {
                                            viewer.camera.flyHome(0.5);
                                        }}
                                    >
                                        <img
                                            src="./Icons/home_black.png"
                                            title={t("geoCaHomeButtonTitle")}
                                            style={buttonImageStyle}
                                        />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <ExpandedMenu />
                            </div>
                        </div>
                        <LoadingIndicator />
                        <Slider />
                        <SettingsButton />
                        <Legend />
                    </InterfaceProvider>
                </ToolbarStateContext>
            </header>
        </>
    );
}
