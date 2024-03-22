import { JSX } from "solid-js";
import { WesImageryLayer, Wes3DTileSet } from "../Wes";
import WesDataSource from "../Datasources/WesDataSource";
import { RemoveLayerSettingsMenuItem } from "./RemoveLayerSettingsMenuItem";

/**
 * Represents a component for a service options menu that displays when a button is clicked.
 * @returns {JSX.Element} A JSX element representing the menu.
 */
export function ServiceSettingsMenu(props: {
    layers: (WesDataSource | WesImageryLayer | Wes3DTileSet)[];
    ref: HTMLUListElement | undefined;
    onFocusOutEvent: () => void;
    setServiceSettingsMenuShown: (value: boolean) => void;
}): JSX.Element {
    const { layers, ref, onFocusOutEvent, setServiceSettingsMenuShown } = props;

    return (
        <ul
            class="settings-menu-hidden"
            ref={ref}
            tabIndex={1}
            onFocusOut={onFocusOutEvent}
        >
            <RemoveLayerSettingsMenuItem layers={layers} onDone={() => {setServiceSettingsMenuShown(false)}}/>
        </ul>
    );
}
