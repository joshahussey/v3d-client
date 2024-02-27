import { JSX, Show, Accessor } from "solid-js";
import { Wes3dMapLayer, WesImageryLayer, Wes3DTileSet, CesiumWindow } from "../Wes";
import CoverageApiDataSource from "../Datasources/CoverageApiDataSource";
import { BoundingSphere, Cartesian3, Cesium3DTileset, ImageryLayer, Matrix4, Rectangle } from "cesium";
import CelestialBodyDataSource from "../Datasources/CelestialBodyDataSource";
import { useInterfaceContext } from "../Context/UIContext";
import WesDataSource from "../Datasources/WesDataSource";

/**
 * Represents a component for the expanded menu that displays additional options based on toolbar state.
 * @returns {JSX.Element} A JSX element representing the expanded menu.
 */
export function LayerSettingsMenu(props: {
    opened: Accessor<boolean>;
    setOpened: (value: boolean) => void;
    datasource?: Wes3dMapLayer;
    imageryLayer?: WesImageryLayer;
    primitiveLayer?: Wes3DTileSet;
    isEnabled: boolean;
    ref: any;
}): JSX.Element {
    const { opened, setOpened, datasource, imageryLayer, primitiveLayer, isEnabled, ref } = props;
    const { sourcesWithLegends, setSourcesWithLegends, osmBuildingsLayer, setOsmBuildingsLayer } =
        useInterfaceContext() as any;
    const viewer = (window as CesiumWindow).Map3DViewer;
    const camera = viewer.camera;

    function zoomTo() {
        if (primitiveLayer) {
            viewer.zoomTo(primitiveLayer);
        }
        if (datasource) {
            if (datasource instanceof CoverageApiDataSource) {
                const bounds = datasource.geometryBounds;
                if (
                    bounds.maxY == null ||
                    bounds.minY == null ||
                    bounds.maxX == null ||
                    bounds.minX == null
                ) {
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
            } else if (datasource instanceof CelestialBodyDataSource) {
                const entities = datasource._entityCollection._entities.values;
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
                viewer.zoomTo(datasource);
            }
        }
        if (imageryLayer) {
            viewer.zoomTo(imageryLayer);
        }
    }
    
    function remove() {
        if (datasource && datasource instanceof WesDataSource) {
            (window as CesiumWindow).Map3DViewer.dataSources.remove(datasource);
            setSourcesWithLegends(
                sourcesWithLegends().filter((source: any) => source.uid !== datasource.uid)
            );
            if (datasource && datasource instanceof CelestialBodyDataSource) {
                datasource.setServiceRunning(false);
            }
        }
        if (imageryLayer && imageryLayer instanceof ImageryLayer) {
            (window as CesiumWindow).Map3DViewer.imageryLayers.remove(imageryLayer);
            setSourcesWithLegends(
                sourcesWithLegends().filter((source: any) => source.uid !== imageryLayer!.uid)
            );
        }
        if (primitiveLayer && primitiveLayer instanceof Cesium3DTileset) {
            const osmBuildingsId = osmBuildingsLayer();
            if (osmBuildingsId && primitiveLayer.uid == osmBuildingsId) {
                setOsmBuildingsLayer("");
            }
            (window as CesiumWindow).Map3DViewer.scene.primitives.remove(primitiveLayer);
            window.dispatchEvent(new Event("tilesetRemoved"));
        }
        if (datasource && datasource instanceof CoverageApiDataSource) {
            (window as CesiumWindow).Map3DViewer.scene.primitives.remove(datasource._renderedPrimitive);
            (window as CesiumWindow).removeEventListener("timeChanged", datasource._listener);
            datasource._removed = true;
            datasource._renderedPrimitive = undefined;
            if (datasource._hasLegend) {
                setSourcesWithLegends(
                    sourcesWithLegends().filter(source => source.uid !== datasource._uid)
                );
            }
            (window as CesiumWindow).Map3DViewer.dataSources.remove(datasource, true);
            window.dispatchEvent(new Event("tilesetRemoved"));
        }
    }

    function openSettings() {
        setOpened(!opened())
    }

    return (
        <ul 
        id="layerSettingsMenu" 
        class="layer-settings-menu-hidden" 
        ref={ref}>
            <li>
                <Show when={true}>
                    <span onClick={openSettings}> Show Settings </span>
                </Show>
            </li>
            <li>
                <Show when={true}>
                    <span onClick={zoomTo}> Zoom To Layer </span>
                </Show>
            </li>
            <li>
                <Show when={true}>
                    <span onClick={remove}> Remove Layer </span>
                </Show>
            </li>
        </ul>
    );
}
