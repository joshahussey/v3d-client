import { JSX, createSignal, createEffect, Accessor } from "solid-js";
import { LayerSettingsMenu } from "./LayerSettingsMenu";
import { Wes3DTileSet, WesImageryLayer } from "../Types/types";
import WesDataSource from "../Datasources/WesDataSource";

/**
 * @param {Accessor<boolean>} props.opened Whether the layer settings is expanded.
 * @param {(value: boolean) => void} props.setOpened Opens/Closes the layer settings
 * @param {Wes3dMapLayer} props.datasource The datasource associated with the layer, if there is one
 * @param {WesImageryLayer} props.imageryLayer The imagery layer associated with the layer, if there is one
 * @param {Wes3DTileSet} props.primitiveLayer The primitive layer associated with the layer, if there is one
 * @param {boolean} props.isEnabled Whether the layer settings button should be enabled
 * @returns {JSX.Element} A JSX Element representing the layer settings button.
 */
export function LayerSettingsButton(props: {
    opened: Accessor<boolean>;
    setOpened: (value: boolean) => void;
    datasource?: WesDataSource;
    imageryLayer?: WesImageryLayer;
    primitiveLayer?: Wes3DTileSet;
    isEnabled: boolean;
}): JSX.Element {
    const { opened, setOpened, datasource, imageryLayer, primitiveLayer, isEnabled } = props;
    const [layerSettingsMenuShown, setLayerSettingsMenuShown] = createSignal(false);

    let layerSettingsMenuRef: HTMLUListElement | undefined;
    let layerSettingsMenuButtonRef: HTMLButtonElement | undefined;
    createEffect(() => {
        if (layerSettingsMenuShown() != undefined && layerSettingsMenuRef && layerSettingsMenuButtonRef) {
            if (layerSettingsMenuShown()) {
                layerSettingsMenuRef.classList.remove("layer-settings-menu-hidden");
                layerSettingsMenuRef.classList.add("layer-settings-menu");
                layerSettingsMenuRef.style.top = `${layerSettingsMenuButtonRef.getBoundingClientRect().top}px`;
                layerSettingsMenuRef.style.left =
                    layerSettingsMenuButtonRef.getBoundingClientRect().left -
                    (layerSettingsMenuRef.getBoundingClientRect().right -
                        layerSettingsMenuRef.getBoundingClientRect().left) +
                    "px";
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
                onFocusOutEvent={onFocusOutEvent}
                setLayerSettingsMenuShown={setLayerSettingsMenuShown}
            />
        </>
    ) as Element;
}
