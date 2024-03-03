import { JSX } from "solid-js";

/**
 * Represents a component for displaying the Wes logo.
 * @returns {JSX.Element} A JSX element representing the Wes logo.
 */
export function GeoCaHeaderDiv(): JSX.Element {
    return (
        <header class="geo-ca-header">
            <a class="geo-ca-logo" href={`https://geo.ca/home/index.html`}>
                <img
                    style={{ "vertical-align": "middle", width: "145.25px" }}
                    src="./Icons/geo-ca-logo.svg"
                    decoding="async"
                    loading="lazy"
                />
            </a>
            <button
                class="geo-ca-header-button geo-ca-search"
                onClick={() => window.open("https://app.geo.ca/", "_self")}
            >
                {"Search"}
            </button>
            <button class="geo-ca-header-button geo-ca-lang">{"Language"}</button>
        </header>
    );
}
