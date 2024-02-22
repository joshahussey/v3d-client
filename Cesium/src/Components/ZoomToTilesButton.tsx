import { CesiumWindow, WesImageryLayer, Wes3dMapLayer, Wes3DTileSet } from "../Wes";

export function ZoomToTilesButton(layer: {
    datasource?: Wes3dMapLayer;
    imageryLayer?: WesImageryLayer;
    primitiveLayer?: Wes3DTileSet;
}) {
    return (
        <button
            class="cesium-button zoom-to-tiles-button layer-entry-button-flex"
            onClick={() => {
                if (layer.primitiveLayer) (window as CesiumWindow).Map3DViewer.zoomTo(layer.primitiveLayer);
            }}
        >
            <img src="./Icons/search.png" class="layer-entry-button-image" />
        </button>
    );
}
