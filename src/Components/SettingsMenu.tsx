import { createSignal, For, JSX, Show } from "solid-js";
import { translate as t } from "../i18n/Translator";
import { ConstantsMenuItems, SettingsMenuItems } from "./SettingsMenuItems";

export function SettingsMenu(props: {
    setSettingsMenuShown: (value: boolean) => void;
    settingChanged: (value: boolean) => void;
}): JSX.Element {
    const { setSettingsMenuShown, settingChanged } = props;
    const [constantsOpened, setConstantsOpened] = createSignal(false);

    function clickedOutsideMenu() {
        setSettingsMenuShown(false);
    }

    const closeButtonSvg = (
        <svg
            fill="#000000"
            height="1.25rem"
            width="1.25rem"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 460.775 460.775"
        >
            <path
                d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55
                   c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55
                   c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505
                   c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55
                   l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719
                   c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"
            />
        </svg>
    );

    return (
        <div id="myModal" class="settings-menu" onClick={() => clickedOutsideMenu()}>
            <div class="settings-menu-content" onClick={e => e.stopPropagation()}>
                <div class="settings-menu-header">
                    <span class="settings-menu-title">{t("settingsMenuTitle")}</span>
                    <button
                        class="settings-menu-close"
                        onClick={() => {
                            setSettingsMenuShown(false);
                        }}
                    >
                        {closeButtonSvg}
                    </button>
                </div>
                <nav class="settings-menu-scroll">
                    <For each={SettingsMenuItems(settingChanged)}>{e => e}</For>
                    <br />
                    <div style={{ display: "flex" }}>
                        <button
                            type="button"
                            class="constants-collapsible"
                            onClick={() => setConstantsOpened(!constantsOpened())}
                        >
                            <span
                                style={{
                                    display: "grid",
                                    "grid-template-columns": "repeat(2, 1fr)",
                                    "align-items": "center"
                                }}
                            >
                                <span style={{ "justify-self": "left" }}>{t("settingsMenuConstants")}</span>
                                <Show when={constantsOpened()} fallback={<></>}>
                                    <span style={{ "justify-self": "right" }}>
                                        <svg
                                            width="24"
                                            height="24"
                                            xmlns="http://www.w3.org/2000/svg"
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            <g id="keyboard_arrow_up" transform="rotate(180 12 11.545)">
                                                <path
                                                    d="m7.41,7.84l4.59,4.58l4.59,-4.58l1.41,1.41l-6,6l-6,-6l1.41,-1.41z"
                                                    id="svg_1"
                                                />
                                            </g>
                                        </svg>
                                    </span>
                                </Show>
                                <Show when={!constantsOpened()} fallback={<></>}>
                                    <span style={{ "justify-self": "right" }}>
                                        <svg
                                            width="24"
                                            height="24"
                                            xmlns="http://www.w3.org/2000/svg"
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            <g id="keyboard_arrow_down">
                                                <path
                                                    d="m7.41,7.84l4.59,4.58l4.59,-4.58l1.41,1.41l-6,6l-6,-6l1.41,-1.41z"
                                                    id="svg_1"
                                                />
                                            </g>
                                        </svg>
                                    </span>
                                </Show>
                            </span>
                        </button>
                    </div>
                    <Show when={constantsOpened()}>
                        <div class="constants-collapsible-content">
                            <ConstantsMenuItems settingChanged={settingChanged} />
                            <button
                                class="reset-constants-button"
                                onClick={() => {
                                    localStorage.removeItem("constants");
                                    settingChanged(true);
                                    setConstantsOpened(false);
                                    setConstantsOpened(true);
                                }}
                            >
                                <span class=""> {t("settingsResetConstants")} </span>
                            </button>
                        </div>
                    </Show>
                </nav>
            </div>
        </div>
    );
}
