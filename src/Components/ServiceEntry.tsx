import { For, JSX, Show, createSignal, createEffect } from "solid-js";
import { ImageryEntry } from "./ImageryEntry";
import { PrimitiveEntry } from "./PrimitiveEntry";
import { DatasourceEntry } from "./DatasourceEntry";
import { ServiceEntryInput } from "./LayersDiv";
import { WesImageryLayer, Wes3DTileSet } from "../Types/types";
import WesDataSource from "../Datasources/WesDataSource";
import { ImageryLayer, Cesium3DTileset, KmlDataSource } from "cesium";
import { useToolbarStateContext, ServiceStatusEntry, ToolbarContextType } from "../Context/ToolbarStateContext";
import { GeoJsonDataSource } from "cesium";
import SensorThingsDataSource from "../Datasources/SensorThingsDataSource";
import CoverageApiDataSource from "../Datasources/CoverageApiDataSource";
import { ServiceSettingsButton } from "./ServiceSettingsButton";

export type makeCheckboxStatus = () => void;

/**
 * Represents a component for displaying an entry for an Service in the layer tree.
 * @param {ServiceEntryInput} entry - The ServiceEntryInput object containing service information and a list of layers.
 * @returns {JSX.Element} A JSX element representing the service entry.
 */
export function ServiceEntry(entry: ServiceEntryInput): JSX.Element {
    const { serviceExpandedMap, setServiceExpandedMap } = useToolbarStateContext() as ToolbarContextType;
    const isExpanded = getServiceExpandedStatus(entry.service.serviceId);
    const [opened, setOpened] = createSignal(isExpanded != null ? isExpanded : true);
    if (isExpanded === null) {
        addServiceExpanded(entry.service.serviceId, true);
    }

    /**
     * Adds a new entry to the list of service expansion objects
     *
     * @param {string} serviceUid Unique ID of a service
     * @param {boolean} opened Whether the service is currently expanded or unexpanded.
     * @returns {void}
     */
    function addServiceExpanded(serviceUid: string, opened: boolean): void {
        if (serviceExpandedMap.findIndex((service: ServiceStatusEntry) => service.serviceUid === serviceUid) != -1) {
            return;
        }
        setServiceExpandedMap([...serviceExpandedMap, { serviceUid: serviceUid, serviceOpenedStatus: opened }]);
    }

    /**
     * Returns whether a service with the ID given is currently expanded or not in the service expansion list.
     *
     * @param {string} serviceUid Unique ID of a service
     * @returns {boolean | null}
     */
    function getServiceExpandedStatus(serviceUid: string): boolean | null {
        const service = serviceExpandedMap.find((service: ServiceStatusEntry) => service.serviceUid === serviceUid);

        if (service != undefined) {
            return service.serviceOpenedStatus;
        }
        return null;
    }

    /**
     * Sets the service status entry of the given service unique ID in the service expansion list.
     *
     * @param {string} serviceUid
     * @param {boolean} opened
     * @returns {void}
     */
    function setServiceExpanded(serviceUid: string, opened: boolean): void {
        setServiceExpandedMap(
            (service: ServiceStatusEntry) => service.serviceUid === serviceUid,
            "serviceOpenedStatus",
            opened
        );
    }

    //[0 = unchecked, 1 = checked, 2 = indeterminate]
    const [checkboxState, setCheckboxState] = createSignal(0);

    const allLayerDivs: JSX.Element[] = [];
    for (const layer of entry.layers.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    })) {
        if (layer instanceof ImageryLayer) {
            allLayerDivs.push(
                <ImageryEntry
                    imageryLayer={layer}
                    syncServiceCheckboxCallback={makeCheckboxStatus}
                    serviceCheckBoxState={checkboxState}
                />
            );
        } else if (layer instanceof Cesium3DTileset) {
            allLayerDivs.push(
                <PrimitiveEntry
                    tileset={layer}
                    syncServiceCheckboxCallback={makeCheckboxStatus}
                    serviceCheckBoxState={checkboxState}
                />
            );
        } else if (
            layer instanceof KmlDataSource ||
            layer instanceof GeoJsonDataSource ||
            layer instanceof WesDataSource
        ) {
            allLayerDivs.push(
                <DatasourceEntry
                    datasource={layer}
                    syncServiceCheckboxCallback={makeCheckboxStatus}
                    serviceCheckBoxState={checkboxState}
                />
            );
        }
    }

    let checkboxRef: HTMLInputElement | undefined;
    createEffect(() => {
        if (checkboxState() != undefined && checkboxRef != null) {
            checkboxRef.indeterminate = checkboxState() == 2;
        }
    });

    function makeCheckboxStatus() {
        function isShown(layer: WesImageryLayer | Wes3DTileSet | WesDataSource) {
            if (layer instanceof SensorThingsDataSource) {
                return layer.show.Things && layer.show.FeaturesOfInterest && layer.show.ObservedAreas;
            }
            if (layer instanceof CoverageApiDataSource) {
                return layer.show || layer.isLoading;
            }
            return layer.show;
        }
        if (!entry.layers.every(isShown) && entry.layers.some(isShown)) {
            setCheckboxState(2);
        } else if (entry.layers.every(isShown)) {
            setCheckboxState(1);
        } else {
            setCheckboxState(0);
        }
    }

    function checkboxStatus() {
        switch (checkboxState()) {
            case 0:
                return false;
            case 1:
                return true;
            case 2:
                return true;
        }
    }
    makeCheckboxStatus();

    function booleanToCheckBoxStatus(state: boolean) {
        if (state) {
            setCheckboxState(1);
        } else {
            setCheckboxState(0);
        }
    }

    return (
        <li>
            <div class="service-div">
                <Show when={opened()} fallback={<></>}>
                    <button
                        class="cesium-button service-dropdown-button"
                        onClick={() => {
                            const opnd = opened();
                            setOpened(!opnd);
                            setServiceExpanded(entry.service.serviceId, !opnd);
                        }}
                    >
                        <svg
                            width="24"
                            height="24"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="xMidYMid meet"
                        >
                            <g id="keyboard_arrow_up" transform="rotate(180 12 11.545)">
                                <path d="m7.41,7.84l4.59,4.58l4.59,-4.58l1.41,1.41l-6,6l-6,-6l1.41,-1.41z" id="svg_1" />
                            </g>
                        </svg>
                    </button>
                </Show>
                <Show when={!opened()} fallback={<></>}>
                    <button
                        class="cesium-button service-dropdown-button"
                        onClick={() => {
                            const opnd = opened();
                            setOpened(!opnd);
                            setServiceExpanded(entry.service.serviceId, !opnd);
                        }}
                    >
                        <svg
                            width="24"
                            height="24"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="xMidYMid meet"
                        >
                            <g id="keyboard_arrow_down">
                                <path d="m7.41,7.84l4.59,4.58l4.59,-4.58l1.41,1.41l-6,6l-6,-6l1.41,-1.41z" id="svg_1" />
                            </g>
                        </svg>
                    </button>
                </Show>
                <span class="layer-name" title={entry.service.serviceTitle}>
                    {entry.service.serviceTitle}
                </span>
                <ServiceSettingsButton layers={entry.layers} />
                <input
                    type="checkbox"
                    class="cesium-button shown-status-button"
                    checked={checkboxStatus()}
                    onChange={e => booleanToCheckBoxStatus(e.currentTarget.checked)}
                    ref={checkboxRef}
                />
            </div>
            <Show when={opened()}>
                <div class="service-grid-break" />
                <div class="service-layers-div">
                    <ul class="cslt-list service-layers-list">
                        <For each={allLayerDivs}>{layerDiv => layerDiv}</For>
                    </ul>
                </div>
            </Show>
        </li>
    );
}
