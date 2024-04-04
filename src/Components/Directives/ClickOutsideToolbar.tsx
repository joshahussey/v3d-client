import { Accessor, onCleanup } from "solid-js";

/**
 * Attaches a click outside event listener to a specified element, triggering a callback
 * when a click occurs outside both the provided element and a target element.
 *
 * @param {Element} el - The element to which the click outside event listener will be attached.
 * @param {Accessor<() => any>} accessor - A function accessor that returns a callback function
 *                                        to be executed when the click outside event is detected.
 */
export default function ClickOutsideToolbar(el: Element, accessor: Accessor<() => void>) {
    function clickOut(e: MouseEvent) {
        if (e.target instanceof Node) {
            if (!document.getElementById("cslt-toolbar")?.contains(e.target) && !el.contains(e.target)) {
                accessor()?.();
            }
        }
    }
    document.body.addEventListener("click", clickOut);
    onCleanup(() => document.body.removeEventListener("click", clickOut));
}
