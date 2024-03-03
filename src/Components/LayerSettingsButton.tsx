import { JSX, createSignal, createEffect, Accessor } from "solid-js";
import { LayerSettingsMenu } from "./LayerSettingsMenu";
import { Wes3DTileSet, Wes3dMapLayer, WesImageryLayer } from "../Wes";

/**
 * Represents a reusable component for rendering a toolbar button with customizable properties.
 * @param {ToolbarButtonType} props - The properties for configuring the button.
 * @returns {JSX.Element} A JSX element representing the toolbar button.
 */
export function LayerSettingsButton(props: {
    opened: Accessor<boolean>;
    setOpened: (value: boolean) => void;
    datasource?: Wes3dMapLayer;
    imageryLayer?: WesImageryLayer;
    primitiveLayer?: Wes3DTileSet;
    isEnabled: boolean;
}): Element {
    const { opened, setOpened, datasource, imageryLayer, primitiveLayer, isEnabled } = props;
    const [layerSettingsMenuShown, setLayerSettingsMenuShown] = createSignal(false);

    let layerSettingsMenuRef: any;
    let layerSettingsMenuButtonRef: any;
    createEffect(() => {
        if (layerSettingsMenuShown() != undefined && layerSettingsMenuRef && layerSettingsMenuButtonRef) {
            if (layerSettingsMenuShown()) {
                layerSettingsMenuRef.classList.remove("layer-settings-menu-hidden");
                layerSettingsMenuRef.classList.add("layer-settings-menu");
                layerSettingsMenuRef.style.top = `calc(${layerSettingsMenuButtonRef.getBoundingClientRect().top}px - 4rem)`;
                layerSettingsMenuRef.style.left = layerSettingsMenuButtonRef.getBoundingClientRect().left - (layerSettingsMenuRef.getBoundingClientRect().right - layerSettingsMenuRef.getBoundingClientRect().left) + "px";
                layerSettingsMenuRef.focus();
            } else {
                layerSettingsMenuRef.classList.remove("layer-settings-menu");
                layerSettingsMenuRef.classList.add("layer-settings-menu-hidden");
            }
        }
    });

    function onFocusOutEvent() {
        if (layerSettingsMenuShown()) {
            window.addEventListener("click", cancelClickEvent, true);
            setLayerSettingsMenuShown(false);
        }
    }
    function cancelClickEvent(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        window.removeEventListener("click", cancelClickEvent, true);
    }

    return (
        <>
            <button
                id="layerSettingsMenuButton"
                ref={layerSettingsMenuButtonRef}
                class="cesium-button dropdown-button layer-entry-button-flex"
                disabled={isEnabled != undefined && !isEnabled}
                onClick={() => {
                    setLayerSettingsMenuShown(!layerSettingsMenuShown());
                }}
            >
                {<>&#8230;</>}
            </button>
            <LayerSettingsMenu
                ref={layerSettingsMenuRef}
                opened={opened}
                setOpened={setOpened}
                imageryLayer={imageryLayer}
                primitiveLayer={primitiveLayer}
                datasource={datasource}
                isEnabled={true}
                onFocusOutEvent={onFocusOutEvent}
                setLayerSettingsMenuShown={setLayerSettingsMenuShown}
            />
        </>
    ) as Element;
}
