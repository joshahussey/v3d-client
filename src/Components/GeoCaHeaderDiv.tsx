import { JSX } from "solid-js";
import { translate as t } from "../i18n/Translator";

/**
 * Represents a component for displaying the Wes logo.
 * @returns {JSX.Element} A JSX element representing the Wes logo.
 */
export function GeoCaHeaderDiv(): JSX.Element {
    let languageButtonRef: HTMLButtonElement | undefined;
    function setLanguage() {
        if (languageButtonRef != undefined) {
            if ((languageButtonRef.textContent || languageButtonRef.innerText) === "English") {
                localStorage.setItem("userLanguage", "en");
            } else {
                localStorage.setItem("userLanguage", "fr");
            }
            window.location.reload();
        }
    }

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
                {t("geoHeaderSearchButton")}
            </button>
            <button ref={languageButtonRef} class="geo-ca-header-button geo-ca-lang" onClick={setLanguage}>
                {t("geoHeaderLanguageButton")}
            </button>
        </header>
    );
}
