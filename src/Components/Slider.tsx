import { UIContextType, useInterfaceContext } from "../Context/UIContext";
import { Show, createEffect, onMount } from "solid-js";
import { JulianDate, Timeline } from "cesium";
import Moment from "moment";
import { CesiumWindow } from "../Wes";

const CesiumClient = window as CesiumWindow;
let timeLineMounted = false;
export function Slider() {
    const { displayClock } = useInterfaceContext() as UIContextType;
    let clockDiv: HTMLDivElement;
    function onTimelineScrubfunction(e) {
        const clock = e.clock;
        clock.currentTime = e.timeJulian;
        clock.shouldAnimate = false;
        (window as CesiumWindow).dispatchEvent(new Event("timeChanged"));
    }

    createEffect(() => {
        if (displayClock()) {
            onMount(() => {
                Timeline.prototype.makeLabel = function (date: JulianDate) {
                    return Moment(JulianDate.toDate(date)).format("DD/MM/YYYY");
                };
                if (!CesiumClient.timeline) {
                    CesiumClient.timeline = new Timeline(clockDiv, CesiumClient.Map3DViewer.clock);
                    CesiumClient.timeline.addEventListener("settime", onTimelineScrubfunction, false);
                    document.querySelector(".cesium-timeline-ruler")?.remove();
                    timeLineMounted = true;
                }
            });
        }
    });
    createEffect(() => {
        if (displayClock()) {
            if (timeLineMounted) {
                CesiumClient.timeline.destroy();
                CesiumClient.timeline = new Timeline(clockDiv, CesiumClient.Map3DViewer.clock);
                CesiumClient.timeline.addEventListener("settime", onTimelineScrubfunction, false);
                document.querySelector(".cesium-timeline-ruler")?.remove();
            }
        }
    });

    return (
        <Show when={displayClock()}>
            <div ref={clockDiv} class="slider-div" />
        </Show>
    );
}
