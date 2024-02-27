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
                layerSettingsMenuRef.style.top = layerSettingsMenuButtonRef.getBoundingClientRect().top + "px"
                layerSettingsMenuRef.style.left = (layerSettingsMenuButtonRef.getBoundingClientRect().left - (layerSettingsMenuRef.getBoundingClientRect().right - layerSettingsMenuRef.getBoundingClientRect().left)) + "px"
            } else {
                layerSettingsMenuRef.classList.remove("layer-settings-menu");
                layerSettingsMenuRef.classList.add("layer-settings-menu-hidden");
            }
        }
    });

    window.addEventListener('mouseup', function(event){
        if(
            (
                !(event.target?.closest("#" + layerSettingsMenuRef.id)) && 
                !(event.target?.closest("#layerSettingsMenuButton"))
            ) || (
                (event.target?.closest("#layerSettingsMenuButton")) &&
                layerSettingsMenuRef.classList.contains("layer-settings-menu")
            )
        ){
            setLayerSettingsMenuShown(false)
        }
    });

    return (
        <>
            <button
                id="layerSettingsMenuButton"
                ref={layerSettingsMenuButtonRef}
                class="cesium-button dropdown-button layer-entry-button-flex"
                disabled={isEnabled != undefined && !isEnabled}
                onClick={() => {
                    setLayerSettingsMenuShown(!layerSettingsMenuShown())
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
            />
        </>
    ) as Element;
}
