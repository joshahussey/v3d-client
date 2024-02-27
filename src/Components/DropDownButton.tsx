import { Accessor, JSX } from "solid-js";

/**
 * Represents a component for a button that toggles between dropdown states.
 * @param {Object} open - An object containing the state and setter for the dropdown's open state.
 * @param {Accessor<boolean>} open.opened - An accessor function for the open state.
 * @param {(value: boolean) => void} open.setOpened - A function to set the open state.
 * @param {boolean} open.isEnabled - Whether the dropdown button should be enabled.
 * @returns {JSX.Element} A JSX element representing the dropdown button.
 */
export function DropDownButton(open: {
    opened: Accessor<boolean>;
    setOpened: (value: boolean) => void;
    isEnabled?: boolean;
}): JSX.Element {
    return (
        <button
            class="cesium-button dropdown-button layer-entry-button-flex"
            disabled={open.isEnabled != undefined && !open.isEnabled}
            onClick={() => open.setOpened(!open.opened())}
        >
            {<>&#8230;</>}
        </button>
    );
}
