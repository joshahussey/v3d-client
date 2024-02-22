import { For, JSX, createEffect, createSignal } from "solid-js";
import { DatasourceEntry } from "./DatasourceEntry";
import { useInterfaceContext } from "../Context/UIContext";

/**
 * Represents a component for displaying a list of data source layers in reverse order.
 * @returns {JSX.Element} A JSX element representing the data source layers.
 */
export function DatasourceLayersDiv(): JSX.Element {
    const { datasources } = useInterfaceContext() as any;
    const dataSourceArray = datasources();
    dataSourceArray.slice().reverse();
    const [reversedDatasources, setReversedDatasourcesArray] = createSignal(dataSourceArray, {
        equals: false
    });
    createEffect(() => {
        setReversedDatasourcesArray(datasources().slice().reverse());
    });
    return <For each={reversedDatasources()}>{datasource => <DatasourceEntry datasource={datasource} />}</For>;
}
