import { JSX } from "solid-js";

type ToolbarButtonType = {
    id: string;
    onClick: () => void;
    class?: string;
    icon?: string | JSX.Element;
    text?: string;
    ref?: HTMLButtonElement | undefined;
};

/**
 * Represents a reusable component for rendering a toolbar button with customizable properties.
 * @param {ToolbarButtonType} props - The properties for configuring the button.
 * @returns {JSX.Element} A JSX element representing the toolbar button.
 */
export function ToolbarButton(props: ToolbarButtonType): Element {
    let className = "cesium-button toolbar-button";
    if (props.class) {
        className = props.class;
    }
    let icon;
    if (props.icon) {
        icon = props.icon;
    }
    return (
        <button
            id={props.id}
            type="button"
            class={className}
            onClick={props.onClick}
            ref={props.ref}
            title={props.text}
        >
            {icon}
        </button>
    ) as Element;
}
