
import { JSX } from "solid-js";
import { ToolbarStateContext } from "../Context/ToolbarStateContext";
import { InterfaceProvider } from "../Context/UIContext";
import { ExpandedMenu, ToolbarNav } from "../Components/Components";
import { Slider } from "../Components/Slider";
import { Legend } from "../Components/Legend";
import { WesLogo } from "../Components/WesLogo";

/**
 * Represents a component for displaying a non-breaking space in the UI.
 * @returns {JSX.Element} A JSX element representing the non-breaking space.
 */
export function WesUI(): JSX.Element {
            return( <>
                <header id="primary-header" class="cslt-primary-header flex">
                    <ToolbarStateContext>
                        <InterfaceProvider>
                            <div class="grid">
                                <div id="cslt-toolbar" class="cslt-toolbar-menu grid">
                                    <ToolbarNav />
                                </div>
                                <div>
                                    <ExpandedMenu />
                                </div>
                            </div>
                            <Slider />
                            <Legend />
                        </InterfaceProvider>
                    </ToolbarStateContext>
                </header>
                <WesLogo />
            </> );
}
