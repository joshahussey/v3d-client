import { JSX } from "solid-js";
import { Wes3dMapLayer } from "../Types/types";
import { RemoveLayerSettingsMenuItem } from "./RemoveLayerSettingsMenuItem";

/**
 * Represents a component for a service options menu that displays when a button is clicked.
 * @returns {JSX.Element} A JSX element representing the menu.
 */
export function ServiceSettingsMenu(props: {
    layers: Wes3dMapLayer[];
    ref: HTMLUListElement | undefined;
    onFocusOutEvent: () => void;
    setServiceSettingsMenuShown: (value: boolean) => void;
}): JSX.Element {
    const { layers, ref, onFocusOutEvent, setServiceSettingsMenuShown } = props;

    return (
        <ul class="layer-settings-menu-hidden" ref={ref} tabIndex={1} onFocusOut={onFocusOutEvent}>
            <RemoveLayerSettingsMenuItem
                layers={layers}
                onDone={() => {
                    setServiceSettingsMenuShown(false);
                }}
            />
        </ul>
    );
}
