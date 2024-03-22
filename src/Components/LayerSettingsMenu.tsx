import { JSX, Show, Accessor } from "solid-js";
import { Wes3dMapLayer, WesImageryLayer, Wes3DTileSet, CesiumWindow } from "../Wes";
import CoverageApiDataSource from "../Datasources/CoverageApiDataSource";
import { BoundingSphere, Cartesian3, Cesium3DTileset, GeoJsonDataSource, ImageryLayer, KmlDataSource, Matrix4, Rectangle } from "cesium";
import CelestialBodyDataSource from "../Datasources/CelestialBodyDataSource";
import { useInterfaceContext } from "../Context/UIContext";
import WesDataSource from "../Datasources/WesDataSource";
import { translate as t } from "../i18n/Translator";
import FeaturesApiDataSource from "../Datasources/FeaturesApiDataSource";

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
    onFocusOutEvent: () => void;
    setLayerSettingsMenuShown: (value: boolean) => void;
}): JSX.Element {
    const {
        opened,
        setOpened,
        datasource,
        imageryLayer,
        primitiveLayer,
        isEnabled,
        ref,
        onFocusOutEvent,
        setLayerSettingsMenuShown
    } = props;
    const { sourcesWithLegends, setSourcesWithLegends, osmBuildingsLayer, setOsmBuildingsLayer } =
        useInterfaceContext() as any;
    const viewer = (window as CesiumWindow).Map3DViewer;
    const camera = viewer.camera;

    function zoomTo() {
        setLayerSettingsMenuShown(false);
        if (primitiveLayer) {
            viewer.zoomTo(primitiveLayer);
        }
        if (datasource) {
            if (datasource instanceof CoverageApiDataSource || datasource instanceof FeaturesApiDataSource) {
                const bounds = datasource.geometryBounds;
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
        setLayerSettingsMenuShown(false);
        if (datasource && datasource instanceof WesDataSource) {
            (window as CesiumWindow).Map3DViewer.dataSources.remove(datasource);
            setSourcesWithLegends(sourcesWithLegends().filter((source: any) => source.uid !== datasource.uid));
            if (datasource && datasource instanceof CelestialBodyDataSource) {
                datasource.setServiceRunning(false);
            }
        }
        if (imageryLayer && imageryLayer instanceof ImageryLayer) {
            (window as CesiumWindow).Map3DViewer.imageryLayers.remove(imageryLayer);
            setSourcesWithLegends(sourcesWithLegends().filter((source: any) => source.uid !== imageryLayer!.uid));
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
                setSourcesWithLegends(sourcesWithLegends().filter(source => source.uid !== datasource._uid));
            }
            (window as CesiumWindow).Map3DViewer.dataSources.remove(datasource, true);
            window.dispatchEvent(new Event("tilesetRemoved"));
        }
        if (datasource && (datasource instanceof GeoJsonDataSource || datasource instanceof KmlDataSource)) {
            (window as CesiumWindow).Map3DViewer.dataSources.remove(datasource);
        }
    }

    function openSettings() {
        setLayerSettingsMenuShown(false);
        setOpened(!opened());
    }

    return (
        <ul
            id="layerSettingsMenu"
            class="layer-settings-menu-hidden"
            ref={ref}
            tabIndex={1}
            onFocusOut={onFocusOutEvent}
        >
            <li onClick={openSettings}>
                <Show when={true}>
                    <svg
                        class="layerSettingsMenuIcon"
                        xmlns="http://www.w3.org/2000/svg"
                        fit=""
                        preserveAspectRatio="xMidYMid meet"
                        viewBox="0 0 24 24"
                        focusable="false"
                    >
                        <g id="tune">
                            <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
                        </g>
                    </svg>
                    <span class="layerSettingsMenuText"> {t("layerSettingsMenuSettings")} </span>
                </Show>
            </li>
            <li onClick={zoomTo}>
                <Show when={true}>
                    <svg
                        class="layerSettingsMenuIcon"
                        xmlns="http://www.w3.org/2000/svg"
                        fit=""
                        preserveAspectRatio="xMidYMid meet"
                        viewBox="0 0 24 24"
                        focusable="false"
                    >
                        <g id="zoom_in">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm2.5-4h-2v2H9v-2H7V9h2V7h1v2h2v1z" />
                        </g>
                    </svg>
                    <span class="layerSettingsMenuText"> {t("layerSettingsMenuZoom")} </span>
                </Show>
            </li>
            <li onClick={remove}>
                <Show when={true}>
                    <svg
                        class="layerSettingsMenuIcon"
                        xmlns="http://www.w3.org/2000/svg"
                        fit=""
                        preserveAspectRatio="xMidYMid meet"
                        viewBox="0 0 24 24"
                        focusable="false"
                    >
                        <g id="delete_cache165">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </g>
                    </svg>
                    <span class="layerSettingsMenuText"> {t("layerSettingsMenuRemove")} </span>
                </Show>
            </li>
        </ul>
    );
}
