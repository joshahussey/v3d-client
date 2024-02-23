import { Accessor, Setter } from "solid-js";
import FeaturesApiDataSource from "../Datasources/FeaturesApiDataSource";
import { Cartesian3, Cesium3DTileset, ImageryLayer, Rectangle, Viewer } from "cesium";
import CelestialBodyDataSource from "../Datasources/CelestialBodyDataSource";
import { CesiumWindow } from "../Wes";

function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}

function createLayerStub(enumerable: any, layer: any): { [key: string]: any } {
    const layerStub: { [key: string]: any } = { uid: layer.uid };
    for (const parameter of enumKeys(enumerable)) {
        const key = enumerable[parameter];
        const value = layer[key];
        if (value !== undefined) {
            layerStub[key] = value;
        }
    }
    return layerStub;
}

const Controller = (window as CesiumWindow).Map3DController;

export enum FeaturesApiParameters {
    HIGHLIGHT_STATUS = "_isHighlighted",
    CURRENT_STYLE = "_userStyle",
    SHOWN_STATUS = "show"
}

export enum CelestialParameters {
    SHOW_STATUS = "show"
}

export enum CoverageParameters {}

export enum EdrParameters {}

export enum GeoDataCubeParameters {}

export enum SensorthingsParameters {}

export enum imageryParameters {
    ALPHA = "alpha",
    SHOW_STATUS = "show"
}

export enum primitiveParameters {
    SHOW_STATUS = "show"
}

export function saveViewParameters(viewer: Viewer, optionsMap: Accessor<any>) {
    const mapState = Controller.getMapState();
    const savedLayerParameters: { [key: string]: any }[] = [];
    const optionsList = optionsMap().keys();
    for (const option of optionsList) {
        const isFeaturesDatasource = option instanceof FeaturesApiDataSource;
        if (isFeaturesDatasource) {
            savedLayerParameters.push(createLayerStub(FeaturesApiParameters, option));
            continue;
        }
        const isCelestialBody = option instanceof CelestialBodyDataSource;
        if (isCelestialBody) {
            savedLayerParameters.push(createLayerStub(CelestialParameters, option));
            continue;
        }
        const isImageryLayer = option instanceof ImageryLayer;
        if (isImageryLayer) {
            savedLayerParameters.push(createLayerStub(imageryParameters, option));
            continue;
        }
        const isPrimitive = option instanceof Cesium3DTileset;
        if (isPrimitive) {
            savedLayerParameters.push(createLayerStub(primitiveParameters, option));
            continue;
        }
    }
    const position = [viewer.camera.position.x, viewer.camera.position.y, viewer.camera.position.z];
    const direction = [viewer.camera.direction.x, viewer.camera.direction.y, viewer.camera.direction.z];
    const up = [viewer.camera.up.x, viewer.camera.up.y, viewer.camera.up.z];
    const cameraPosition = [...position, ...direction, ...up];
    mapState.cameraPosition = cameraPosition;
    mapState.saveLayerParameters = savedLayerParameters;
    Controller.setMapState(mapState);
}

export function loadViewParameters() {
    window.dispatchEvent(new Event("mapStateChanged"));
}

export function applyViewParameters(viewer: Viewer, optionsMap: Accessor<any>) {
    const mapState = Controller.getMapState();
    const optionsList = optionsMap().keys();
    const savedLayerParameters: { [key: string]: any }[] = mapState.saveLayerParameters;
    if (savedLayerParameters) {
        savedLayerParameters.forEach((layerParameter: any) => {
            for (const option of optionsList) {
                if (option.uid === layerParameter.uid) {
                    for (const key of Object.keys(layerParameter)) {
                        if (key === "uid") continue;
                        option[key] = layerParameter[key];
                    }
                    break;
                }
            }
        });
    }
}

export function zoomToLoadedView(viewer: Viewer) {
    const mapState = Controller.getMapState();
    const cameraPosition = mapState.cameraPosition;
    if (cameraPosition) {
        if (cameraPosition.length === 9) {
            const destination = new Cartesian3(...cameraPosition.slice(0, 3));
            const direction = new Cartesian3(...cameraPosition.slice(3, 6));
            const up = new Cartesian3(...cameraPosition.slice(6, 9));
            viewer.camera.flyTo({
                destination: destination,
                orientation: {
                    direction: direction,
                    up: up
                },
                duration: 0.5
            });
        }
    }
}
