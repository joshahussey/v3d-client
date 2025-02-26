import { JSX, For, createSignal, createEffect, Setter } from "solid-js";
import { UIContextType, useInterfaceContext } from "../Context/UIContext";
import { translate as t } from "../i18n/Translator";
import { CesiumWindow, WesImageryLayer } from "../Types/types";
import { OPENED_LAYER_PAGE } from "../Constants";

/**
 * @param {Object} props - An object containing the parameters
 * @param {Setter<OPENED_LAYER_PAGE>} props.closeLayerOrderPanel - A function used to close the layer panel from the 'Close' button.
 * @returns {JSX.Element} A JSX element containing the layers order panel.
 */
export function LayersOrderDiv(props: { closeLayerOrderPanel: Setter<OPENED_LAYER_PAGE> }): JSX.Element {
    const { closeLayerOrderPanel } = props;
    const { imageLayers } = useInterfaceContext() as UIContextType;
    const layers = (window as CesiumWindow).Map3DViewer.imageryLayers;

    const [selectedLayer, setSelectedLayer] = createSignal(layers.get(1) as WesImageryLayer, { equals: false });
    const [canLower, setCanLower] = createSignal(
        layers.indexOf(selectedLayer()) > 1 && layers.indexOf(selectedLayer()) != -1,
        { equals: false }
    );
    const [canRaise, setCanRaise] = createSignal(
        layers.indexOf(selectedLayer()) < layers.length - 1 && layers.indexOf(selectedLayer()) != -1,
        { equals: false }
    );

    function allowDrop(e: DragEvent) {
        e.preventDefault();
    }

    function drag(e: DragEvent) {
        e.dataTransfer?.setData("text", (e.currentTarget as HTMLLIElement).id);
    }

    function drop(e: DragEvent) {
        e.preventDefault();
        let draggedLayer;
        let dropLayer;
        //Get the ImageryLayer object corresponding to the layer being dragged and the layer being dropped onto.
        for (let i = 0; i < layers.length; i++) {
            if (e.dataTransfer?.getData("text") === (layers.get(i) as WesImageryLayer).uid) {
                draggedLayer = layers.get(i) as WesImageryLayer;
            }
            if ((e.currentTarget as HTMLLIElement).id === (layers.get(i) as WesImageryLayer).uid) {
                dropLayer = layers.get(i) as WesImageryLayer;
            }
        }
        if (draggedLayer == null || dropLayer == null || draggedLayer.uid === dropLayer.uid) {
            return;
        }
        //Check if we need to move the dragged layer up or down
        if (layers.indexOf(draggedLayer) < layers.indexOf(dropLayer)) {
            //While the dragged layer is below the layer being dropped onto, raise the dragged layer.
            while (layers.indexOf(draggedLayer) < layers.indexOf(dropLayer)) {
                layers.raise(draggedLayer);
            }
        } else if (layers.indexOf(draggedLayer) > layers.indexOf(dropLayer)) {
            //While the dragged layer is above the layer being dropped onto, lower the dragged layer.
            while (layers.indexOf(draggedLayer) > layers.indexOf(dropLayer)) {
                layers.lower(draggedLayer);
            }
        }
    }

    let layerOrderListRef: HTMLUListElement | undefined;
    createEffect(() => {
        if (selectedLayer() != undefined && layerOrderListRef) {
            for (const layerEntry of layerOrderListRef.children) {
                if (layerEntry.id == selectedLayer().uid.toString()) {
                    // Do UI changes to signify a layer being selected.
                    layerEntry.classList.add("layer-order-entry-selected");
                    (layerEntry.children[0].children[1] as HTMLInputElement).checked = true;
                } else {
                    // Get rid of UI changes for anything that is no longer selected.
                    (layerEntry.children[0].children[1] as HTMLInputElement).checked = false;
                    layerEntry.classList.remove("layer-order-entry-selected");
                }
            }
        }
    });

    createEffect(() => {
        if (selectedLayer() != undefined) {
            setCanLower(layers.indexOf(selectedLayer()) > 1);
            setCanRaise(layers.indexOf(selectedLayer()) < layers.length - 1);
        }
    });

    layers.layerAdded.addEventListener(() => {
        setCanLower(layers.indexOf(selectedLayer()) > 1 && layers.indexOf(selectedLayer()) != -1);
        setCanRaise(layers.indexOf(selectedLayer()) < layers.length - 1 && layers.indexOf(selectedLayer()) != -1);
    });
    layers.layerMoved.addEventListener(() => {
        setCanLower(layers.indexOf(selectedLayer()) > 1 && layers.indexOf(selectedLayer()) != -1);
        setCanRaise(layers.indexOf(selectedLayer()) < layers.length - 1 && layers.indexOf(selectedLayer()) != -1);
    });
    layers.layerRemoved.addEventListener(() => {
        setCanLower(layers.indexOf(selectedLayer()) > 1 && layers.indexOf(selectedLayer()) != -1);
        setCanRaise(layers.indexOf(selectedLayer()) < layers.length - 1 && layers.indexOf(selectedLayer()) != -1);
    });

    const [reversedImageryLayers, setReversedImageryLayers] = createSignal(imageLayers().slice().reverse(), {
        equals: false
    });
    createEffect(() => {
        setReversedImageryLayers(imageLayers().slice().reverse());
    });
    setReversedImageryLayers(imageLayers().slice().reverse());

    return (
        <div class="layers-view-layer-order-panel">
            <nav class="layers-view-layer-order-scroll">
                <ul class="cslt-list layer-order-list" ref={layerOrderListRef}>
                    <For each={reversedImageryLayers()}>
                        {layer => (
                            <li
                                onClick={() => {
                                    setSelectedLayer(layer);
                                }}
                                id={layer.uid.toString()}
                                draggable="true"
                                onDragStart={e => drag(e)}
                                onDrop={e => drop(e)}
                                onDragOver={e => allowDrop(e)}
                            >
                                <div class="layer-order-entry">
                                    <span class="layer-order-name" title={layer.name}>
                                        {layer.name}
                                    </span>
                                    <input type="radio" class="layer-order-selection-button" />
                                </div>
                            </li>
                        )}
                    </For>
                </ul>
            </nav>
            <div class="layer-order-button-div">
                <button
                    class="cesium-button layer-order-button"
                    onClick={() => layers.raise(selectedLayer())}
                    disabled={!canRaise()}
                >
                    &#9650;
                </button>
                <button
                    class="cesium-button layer-order-button"
                    onClick={() => layers.lower(selectedLayer())}
                    disabled={!canLower()}
                >
                    &#9660;
                </button>
                <button class="cesium-button" onClick={() => closeLayerOrderPanel(OPENED_LAYER_PAGE.CLOSED)}>
                    {t("layersOrderDivClose")}
                </button>
            </div>
        </div>
    );
}
