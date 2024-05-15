import { createSignal, createEffect } from "solid-js";
import { Wes3DTileSet, Wes3dMapLayer, WesImageryLayer } from "../Types/types";
import { ServiceSettingsMenu } from "./ServiceSettingsMenu";

export function ServiceSettingsButton(props: { layers: (Wes3dMapLayer | WesImageryLayer | Wes3DTileSet)[] }): Element {
    const { layers } = props;
    const [serviceSettingsMenuShown, setServiceSettingsMenuShown] = createSignal(false);

    let serviceSettingsMenuRef: HTMLUListElement | undefined;
    let serviceSettingsMenuButtonRef: HTMLButtonElement | undefined;
    createEffect(() => {
        if (serviceSettingsMenuShown() != undefined && serviceSettingsMenuRef && serviceSettingsMenuButtonRef) {
            if (serviceSettingsMenuShown()) {
                serviceSettingsMenuRef.classList.remove("layer-settings-menu-hidden");
                serviceSettingsMenuRef.classList.add("layer-settings-menu");
                serviceSettingsMenuRef.style.top = `${serviceSettingsMenuButtonRef.getBoundingClientRect().top}px`;
                serviceSettingsMenuRef.style.left =
                    serviceSettingsMenuButtonRef.getBoundingClientRect().left -
                    (serviceSettingsMenuRef.getBoundingClientRect().right -
                        serviceSettingsMenuRef.getBoundingClientRect().left) +
                    "px";
                serviceSettingsMenuRef.focus();
            } else {
                serviceSettingsMenuRef.classList.remove("layer-settings-menu");
                serviceSettingsMenuRef.classList.add("layer-settings-menu-hidden");
            }
        }
    });

    function onFocusOutEvent() {
        if (serviceSettingsMenuShown()) {
            window.addEventListener("click", cancelClickEvent, true);
            setServiceSettingsMenuShown(false);
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
                ref={serviceSettingsMenuButtonRef}
                class="cesium-button dropdown-button layer-entry-button-flex"
                onClick={() => {
                    setServiceSettingsMenuShown(!serviceSettingsMenuShown());
                }}
            >
                {<>&#8230;</>}
            </button>
            <ServiceSettingsMenu
                ref={serviceSettingsMenuRef}
                layers={layers}
                onFocusOutEvent={onFocusOutEvent}
                setServiceSettingsMenuShown={setServiceSettingsMenuShown}
            />
        </>
    ) as Element;
}
