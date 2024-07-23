import { UIContextType, useInterfaceContext } from "../Context/UIContext";
import { JSX, Show, createEffect, onMount } from "solid-js";
import { Clock, JulianDate, Timeline } from "cesium";
import Moment from "moment";
import { CesiumWindow } from "../Types/types";

//REMOVE WHEN CESIUM IS FIXED
interface CsltTimeline extends Timeline {
    prototype: {
        makeLabel(date: JulianDate): string;
    };
    addEventListener(type: string, listener: (e: SetTimeEvent) => void, useCapture?: boolean): void;
}

type SetTimeEvent = Event & {
    timeSeconds: number;
    timeJulian: JulianDate;
    clock: Clock;
};

const CesiumClient = window as CesiumWindow;
let timeLineMounted = false;
export function Slider(): JSX.Element {
    const { displayClock } = useInterfaceContext() as UIContextType;
    let clockDiv: HTMLDivElement | undefined;
    function onTimelineScrubfunction(e: SetTimeEvent) {
        const clock = e.clock;
        clock.currentTime = e.timeJulian;
        clock.shouldAnimate = false;
        (window as CesiumWindow).dispatchEvent(new Event("timeChanged"));
    }

    createEffect(() => {
        if (displayClock() && clockDiv) {
            onMount(() => {
                (Timeline as unknown as CsltTimeline).prototype.makeLabel = function (date: JulianDate) {
                    return Moment(JulianDate.toDate(date)).format("DD/MM/YYYY");
                };
                if (!CesiumClient.timeline) {
                    CesiumClient.timeline = new Timeline(clockDiv, CesiumClient.Map3DViewer.clock);
                    (CesiumClient.timeline as unknown as CsltTimeline).addEventListener(
                        "settime",
                        onTimelineScrubfunction,
                        false
                    );
                    document.querySelector(".cesium-timeline-ruler")?.remove();
                    timeLineMounted = true;
                }
            });
        }
    });
    createEffect(() => {
        if (displayClock() && clockDiv) {
            if (timeLineMounted) {
                if (CesiumClient.timeline !== undefined) {
                    CesiumClient.timeline.destroy();
                }
                CesiumClient.timeline = new Timeline(clockDiv, CesiumClient.Map3DViewer.clock);
                (CesiumClient.timeline as unknown as CsltTimeline).addEventListener(
                    "settime",
                    onTimelineScrubfunction,
                    false
                );
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
