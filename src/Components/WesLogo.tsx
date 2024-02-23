import { JSX } from "solid-js";

/**
 * Represents a component for displaying the Wes logo.
 * @returns {JSX.Element} A JSX element representing the Wes logo.
 */
export function WesLogo(): JSX.Element {
    return (
        <div class="wes-logo">
            <img src="./Icons/wes_logo.png" alt="Wes" />
        </div>
    );
}
