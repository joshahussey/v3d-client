import { createEffect, JSX, Show } from "solid-js";
import { LoadingRequestCode, UIContextType, useInterfaceContext } from "../Context/UIContext";

export function LoadingIndicator(): JSX.Element {
    const { isLoading } = useInterfaceContext() as UIContextType;

    function fadeOut(el: HTMLDivElement) {
        if (el != null) {
            const interval = setInterval(function () {
                let opacity = Number(el.style.opacity);
                if (opacity > 0) {
                    opacity -= 0.1;
                    el.style.opacity = opacity.toString();
                } else {
                    clearInterval(interval);
                }
            }, 50);
        }
    }

    let finishedLoadingRef: HTMLDivElement | undefined;
    let errorLoadingRef: HTMLDivElement | undefined;
    createEffect(() => {
        if (isLoading() === LoadingRequestCode.FINISHED && finishedLoadingRef != undefined) {
            finishedLoadingRef.style.opacity = "1";
            setTimeout(() => fadeOut(finishedLoadingRef), 5000);
        } else if (isLoading() === LoadingRequestCode.ERROR && errorLoadingRef != undefined) {
            errorLoadingRef.style.opacity = "1";
            setTimeout(() => fadeOut(errorLoadingRef), 5000);
        }
    });
    return (
        <>
            <Show when={isLoading() === LoadingRequestCode.STARTED}>
                <div class="loading-indicator">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32px"
                        height="32px"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="xMidYMid"
                    >
                        <circle
                            cx="50"
                            cy="50"
                            fill="none"
                            stroke="#ffffff"
                            stroke-width="10"
                            r="35"
                            stroke-dasharray="164.93361431346415 56.97787143782138"
                        >
                            <animateTransform
                                attributeName="transform"
                                type="rotate"
                                repeatCount="indefinite"
                                dur="1s"
                                values="0 50 50;360 50 50"
                                keyTimes="0;1"
                            />
                        </circle>
                    </svg>
                </div>
            </Show>
            <Show when={isLoading() === LoadingRequestCode.FINISHED}>
                <div class="loading-indicator" style={{ opacity: "1" }} ref={finishedLoadingRef}>
                    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" version="1.1">
                        <g>
                            <g
                                stroke="none"
                                id="svg_1"
                                fill-rule="nonzero"
                                fill="none"
                                stroke-miterlimit="10"
                                stroke-linejoin="miter"
                                stroke-linecap="butt"
                                stroke-dasharray="none"
                                stroke-width="0"
                                transform="translate(1.40659 1.40659) scale(2.81 2.81)"
                            >
                                <polygon
                                    stroke="none"
                                    id="svg_2"
                                    fill-rule="nonzero"
                                    fill=" rgb(0,158,4)"
                                    stroke-miterlimit="10"
                                    stroke-linejoin="miter"
                                    stroke-linecap="butt"
                                    stroke-dasharray="none"
                                    points="4.272517681121826,7.601451056647704 2.4918086528778076,5.820741966790649 3.3802781105041504,4.93227203566363 4.272517681121826,5.824511664782733 6.936669826507568,3.160359926964418 7.825139045715332,4.048829152507835 "
                                />
                                <path
                                    stroke="none"
                                    id="svg_3"
                                    fill-rule="nonzero"
                                    fill="rgb(0,158,4)"
                                    stroke-miterlimit="10"
                                    stroke-linejoin="miter"
                                    stroke-dasharray="none"
                                    stroke-linecap="butt"
                                    d="m5.15847,10.81351c-3.11819,0 -5.65504,-2.53685 -5.65504,-5.65504c0,-3.11819 2.53685,-5.65504 5.65504,-5.65504c3.11819,0 5.65504,2.53685 5.65504,5.65504c0,3.11819 -2.53685,5.65504 -5.65504,5.65504zm0,-10.0534c-2.42526,0 -4.39836,1.97311 -4.39836,4.39836s1.97311,4.39836 4.39836,4.39836s4.39836,-1.97311 4.39836,-4.39836s-1.97311,-4.39836 -4.39836,-4.39836z"
                                />
                            </g>
                        </g>
                    </svg>
                </div>
            </Show>
            <Show when={isLoading() === LoadingRequestCode.ERROR}>
                <div class="loading-indicator" style={{ opacity: "1" }} ref={errorLoadingRef}>
                    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" version="1.1">
                        <g>
                            <g
                                stroke="none"
                                id="svg_1"
                                fill-rule="nonzero"
                                fill="none"
                                stroke-miterlimit="10"
                                stroke-linejoin="miter"
                                stroke-linecap="butt"
                                stroke-dasharray="none"
                                stroke-width="0"
                                transform="translate(1.40659 1.40659) scale(2.81 2.81)"
                            >
                                <path
                                    stroke="none"
                                    id="svg_2"
                                    fill-rule="nonzero"
                                    fill="rgb(236,0,0)"
                                    stroke-miterlimit="10"
                                    stroke-linejoin="miter"
                                    stroke-dasharray="none"
                                    stroke-linecap="butt"
                                    d="m2.79158,8.27792c-0.16019,0 -0.32025,-0.06174 -0.44252,-0.18534c-0.24441,-0.24695 -0.24441,-0.64748 0,-0.89443l4.77708,-4.82917c0.24416,-0.24695 0.64062,-0.24695 0.88478,0c0.24441,0.24708 0.24441,0.64761 0,0.89456l-4.77683,4.82904c-0.12227,0.1236 -0.28233,0.18534 -0.44252,0.18534z"
                                />
                                <path
                                    stroke="none"
                                    id="svg_3"
                                    fill-rule="nonzero"
                                    fill="rgb(236,0,0)"
                                    stroke-miterlimit="10"
                                    stroke-linejoin="miter"
                                    stroke-dasharray="none"
                                    stroke-linecap="butt"
                                    d="m7.56866,8.27792c-0.16006,0 -0.32037,-0.06174 -0.44239,-0.18534l-4.77721,-4.82904c-0.24441,-0.24708 -0.24441,-0.64761 0,-0.89456c0.24441,-0.24695 0.6405,-0.24695 0.88491,0l4.77696,4.82917c0.24441,0.24695 0.24441,0.64748 0,0.89443c-0.12189,0.1236 -0.2822,0.18534 -0.44227,0.18534z"
                                />
                                <path
                                    stroke="none"
                                    id="svg_4"
                                    fill-rule="nonzero"
                                    fill="rgb(236,0,0)"
                                    stroke-miterlimit="10"
                                    stroke-linejoin="miter"
                                    stroke-dasharray="none"
                                    stroke-linecap="butt"
                                    d="m10.18597,10.92377l-10.0117,0c-0.34553,0 -0.62573,-0.28313 -0.62573,-0.63255l0,-10.12086c0,-0.3493 0.2802,-0.63255 0.62573,-0.63255l10.0117,0c0.34565,0 0.62573,0.28326 0.62573,0.63255l0,10.12086c0,0.34942 -0.28008,0.63255 -0.62573,0.63255zm-9.38596,-1.26511l8.76023,0l0,-8.85575l-8.76023,0l0,8.85575z"
                                />
                            </g>
                        </g>
                    </svg>
                </div>
            </Show>
        </>
    );
}
