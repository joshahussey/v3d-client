import { Rectangle, Matrix4, Cartesian3, BoundingSphere, EntityCollection } from "cesium";
import { CesiumWindow, WesImageryLayer, Wes3dMapLayer, Wes3DTileSet } from "../Types/types";
import CoverageApiDataSource from "../Datasources/CoverageApiDataSource";
import CelestialBodyDataSource from "../Datasources/CelestialBodyDataSource";
import { JSX } from "solid-js";
import WesDataSource from "../Datasources/WesDataSource";

/**
 * @param {Object} layer - Object containing the layer associated with the button.
 * @param {Wes3dMapLayer} layer.datasource - An optional datasource associated with the button.
 * @param {WesImageryLayer} layer.imageryLayer - An optional imagery layer associated with the button.
 * @param {Wes3DTileSet} layer.primitiveLayer - An optional primitive layer associated with the button.
 * @param {boolean} layer.isEnabled - Whether the button should be enabled.
 * @returns {JSX.Element} - A JSX Element representing the button.
 */
export function ZoomToLayerButton(layer: {
    datasource?: Wes3dMapLayer;
    imageryLayer?: WesImageryLayer;
    primitiveLayer?: Wes3DTileSet;
    isEnabled?: boolean;
}): JSX.Element {
    const viewer = (window as CesiumWindow).Map3DViewer;
    const camera = viewer.camera;
    return (
        <button
            class="cesium-button zoom-to-tiles-button layer-entry-button-flex"
            disabled={layer.isEnabled != undefined && !layer.isEnabled}
            onClick={() => {
                if (layer.primitiveLayer) {
                    viewer.zoomTo(layer.primitiveLayer);
                }
                if (layer.datasource) {
                    if (layer.datasource instanceof CoverageApiDataSource) {
                        const bounds = layer.datasource.geometryBounds;
                        if (bounds.maxY == null || bounds.minY == null || bounds.maxX == null || bounds.minX == null) {
                            return;
                        } else {
                            const destination = camera.getRectangleCameraCoordinates(
                                Rectangle.fromDegrees(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY)
                            );

                            let mag = Cartesian3.magnitude(destination);
                            mag += mag * 0.5;
                            Cartesian3.normalize(destination, destination);
                            Cartesian3.multiplyByScalar(destination, mag, destination);

                            camera.flyTo({
                                destination: destination,
                                duration: 0,
                                endTransform: Matrix4.IDENTITY
                            });
                        }
                    } else if (layer.datasource instanceof CelestialBodyDataSource) {
                        const entities = (layer.datasource._entityCollection as EntityCollection)._entities.values;
                        const boundingSpheres = [];
                        const boundingSphereScratch = new BoundingSphere();
                        for (let i = 0, len = entities.length; i < len; i++) {
                            if (entities[i]._show) {
                                viewer.dataSourceDisplay.getBoundingSphere(entities[i], false, boundingSphereScratch);
                                boundingSpheres.push(BoundingSphere.clone(boundingSphereScratch));
                            }
                        }

                        // Prevent Cesium from zooming so far out that it crashes
                        // or the centerpoint is so far away it doesn't render the globe.
                        // Somewhere between 2.5 and 5 billion radius, the earth disappears.
                        const MAX_POSSIBLE_ZOOM_RADIUS = 50000000;
                        const boundingSphere = BoundingSphere.fromBoundingSpheres(boundingSpheres);
                        if (boundingSphere.radius > MAX_POSSIBLE_ZOOM_RADIUS) {
                            boundingSphere.radius = MAX_POSSIBLE_ZOOM_RADIUS;
                            boundingSphere.center = Cartesian3.fromDegrees(0, 0, 0);
                        }

                        //Zoom to calculated bounding sphere
                        camera.flyToBoundingSphere(boundingSphere, {
                            duration: 0
                        });
                    } else {
                        viewer.zoomTo(layer.datasource as WesDataSource);
                    }
                }
                if (layer.imageryLayer) {
                    viewer.zoomTo(layer.imageryLayer);
                }
            }}
        >
            <img src="./Icons/zoom_in.png" class="layer-entry-button-image" />
        </button>
    );
}
