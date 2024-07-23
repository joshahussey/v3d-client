import { For, JSX, createSignal, createEffect } from "solid-js";
import { UIContextType, useInterfaceContext } from "../Context/UIContext";
import { ServiceEntry } from "./ServiceEntry";
import { ServiceInfo, WesImageryLayer, Wes3DTileSet } from "../Types/types";
import { ServiceEntryInput } from "./LayersDiv";
import WesDataSource from "../Datasources/WesDataSource";
import { useToolbarStateContext, ServiceStatusEntry, ToolbarContextType } from "../Context/ToolbarStateContext";
type allLayersType = WesImageryLayer | WesDataSource | Wes3DTileSet;

/**
 * Represents a component for displaying a list of all layers in reverse order.
 * @returns {JSX.Element} A JSX element representing the layers.
 */
export function LayersListDiv(): JSX.Element {
    const { serviceExpandedMap, setServiceExpandedMap } = useToolbarStateContext() as ToolbarContextType;
    const { imageLayers, datasources, tileSets } = useInterfaceContext() as UIContextType;

    const [allLayers, setAllLayers] = createSignal<allLayersType[]>(
        (imageLayers().slice() as allLayersType[]).concat(
            datasources().slice() as allLayersType[],
            tileSets().slice() as allLayersType[]
        ),
        {
            equals: false
        }
    );
    const [serviceMap, setServiceMap] = createSignal(new Map());

    /**
     * Given a list of strings representing the unique service IDs of services in the service expansion list.
     *
     * @param {string[]} servList
     * @returns {void}
     */
    function cleanServiceExpanded(servList: string[]): void {
        setServiceExpandedMap([
            ...serviceExpandedMap.filter((service: ServiceStatusEntry) => servList.includes(service.serviceUid))
        ]);
    }
    cleanServiceExpanded(allLayers().map((serv: allLayersType) => serv.serviceInfo.serviceId));

    createEffect(() => {
        setAllLayers(
            (imageLayers().slice() as allLayersType[]).concat(
                datasources().slice() as allLayersType[],
                tileSets().slice() as allLayersType[]
            )
        );
    });
    createEffect(() => {
        const serviceMapped = new Map();
        for (const l of allLayers()) {
            if (!l.serviceInfo || !l.serviceInfo.serviceId || l.serviceInfo.serviceId == "") {
                if (serviceMapped.has("")) {
                    serviceMapped.get("").push(l);
                } else {
                    serviceMapped.set("", [l]);
                }
            } else {
                let found = false;
                for (const key of serviceMapped.keys()) {
                    if (key.serviceId == l.serviceInfo.serviceId) {
                        serviceMapped.get(key).push(l);
                        found = true;
                    }
                }
                if (!found) {
                    serviceMapped.set(l.serviceInfo, [l]);
                }
            }
        }
        setServiceMap(serviceMapped);
    });

    setAllLayers(
        (imageLayers().slice() as allLayersType[]).concat(
            datasources().slice() as allLayersType[],
            tileSets().slice() as allLayersType[]
        )
    );

    function mapToObjects(map: Map<ServiceInfo, Array<WesImageryLayer | WesDataSource | Wes3DTileSet>>) {
        const arrOfObjects = [];
        for (const key of map.keys()) {
            const l = map.get(key);
            if (l != undefined) {
                const srvcAndLayers: ServiceEntryInput = {
                    service: key,
                    layers: l
                };
                arrOfObjects.push(srvcAndLayers);
            }
        }
        return arrOfObjects.sort(function (a, b) {
            return a.service.serviceTitle.localeCompare(b.service.serviceTitle);
        });
    }

    return <For each={mapToObjects(serviceMap())}>{entry => <ServiceEntry {...entry} />}</For>;
}
