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
    const buttonStyle = {
        "font-size": "large"
    }
    const buttonImageStyle = {
        "max-height": "32px",
        "max-width": "32px"
    }
    return (
        <button id={props.id} type="button" class={className} style={buttonStyle} onClick={props.onClick}>
            <img src={props.icon} title={props.text} style={buttonImageStyle} />
        </button>
    ) as Element;
}
