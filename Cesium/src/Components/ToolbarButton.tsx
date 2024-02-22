type ToolbarButtonType = {
    id: string;
    onClick: () => void;
    class?: string;
    icon?: string;
    text?: string;
};

/**
 * Represents a reusable component for rendering a toolbar button with customizable properties.
 * @param {ToolbarButtonType} props - The properties for configuring the button.
 * @returns {JSX.Element} A JSX element representing the toolbar button.
 */
export function ToolbarButton(props: ToolbarButtonType): Element {
    let className = "cesium-button";
    if (props.class) {
        className = props.class;
    }
    return (
        <button id={props.id} type="button" class={className} style="font-size: large" onClick={props.onClick}>
            <img src={props.icon} title={props.text} />
        </button>
    ) as Element;
}
