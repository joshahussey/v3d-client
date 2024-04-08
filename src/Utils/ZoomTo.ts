import WesDataSource from "../Datasources/WesDataSource";
import { CesiumWindow, Wes3DTileSet, WesImageryLayer } from "../Types/types";
import {
    BoundingSphere,
    Cartesian3,
    Cesium3DTileset,
    GeoJsonDataSource,
    ImageryLayer,
    KmlDataSource,
    Matrix4,
    Rectangle
} from "cesium";
import CoverageApiDataSource from "../Datasources/CoverageApiDataSource";
import FeaturesApiDataSource from "../Datasources/FeaturesApiDataSource";
import CelestialBodyDataSource from "../Datasources/CelestialBodyDataSource";

/**
 * Zooms to a given layer
 *
 * @param {WesDataSource | WesImageryLayer | Wes3DTileSet | GeoJsonDataSource | KmlDataSource} layer Layer to zoom to.
 * @returns
 */
export function zoomTo(
    layer: WesDataSource | WesImageryLayer | Wes3DTileSet | GeoJsonDataSource | KmlDataSource
): void {
    const viewer = (window as CesiumWindow).Map3DViewer;
    const camera = viewer.camera;
    if (layer instanceof Cesium3DTileset) {
        viewer.zoomTo(layer);
    }
    if (layer instanceof CoverageApiDataSource || layer instanceof FeaturesApiDataSource) {
        const bounds = layer.geometryBounds;
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
    } else if (layer instanceof CelestialBodyDataSource) {
        const entities = layer._entityCollection._entities.values;
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
        viewer.zoomTo(layer);
    }
    if (layer instanceof ImageryLayer) {
        viewer.zoomTo(layer);
    }
}
