import { Cartesian3, Scene, SceneTransforms, Viewer } from "cesium";
import { FeatureArray, OGCFeature } from "../Types/types";
import KDBush from "kdbush";
export default class FastFeatureClusters {
    _minimumDistance: number;
    _minimumClusterSize: number;
    _rawFeaturesArray: FeatureArray;
    _clusters: Set<OGCFeature>;
    _scene: Scene;
    _viewer: Viewer;
    _kdbush: KDBush;
    _clusteredSet: Set<number>;
    _renderedFeaturesSet: Set<string>;
    _renderedFeaturesMap: Map<string, OGCFeature>;
    constructor(viewer: Viewer, rawFeaturesArray: FeatureArray, minimumDistance = 110, minimumClusterSize = 4) {
        this._minimumDistance = minimumDistance;
        this._minimumClusterSize = minimumClusterSize;
        this._rawFeaturesArray = rawFeaturesArray;
        this._clusters = new Set();
        this._viewer = viewer;
        this._scene = viewer.scene;
        this._kdbush = new KDBush(this._rawFeaturesArray.length, 64);
        this._clusteredSet = new Set();
        this._renderedFeaturesSet = new Set();
        this._renderedFeaturesMap = new Map();
        this.fastCluster();
        Object.defineProperties(this, {
            minimumDistance: {
                get: function () {
                    return this._minimumDistance;
                },
                set: function (value) {
                    this._minimumDistance = value;
                }
            },
            minimumClusterSize: {
                get: function () {
                    return this._minimumClusterSize;
                },
                set: function (value) {
                    this._minimumClusterSize = value;
                }
            }
        });
    }

    fastCluster() {
        this.populateKDBush();
        this.createClusters();
    }

    populateKDBush() {
        this._rawFeaturesArray.forEach((ogcFeature: OGCFeature) => {
            ogcFeature.isClustered = false;
            const height = ogcFeature.geometry.coordinates.length === 3 ? ogcFeature.geometry.coordinates[2] : 0;
            const screenSpaceCoordinate = SceneTransforms.wgs84ToWindowCoordinates(
                this._scene,
                Cartesian3.fromDegrees(ogcFeature.geometry.coordinates[0], ogcFeature.geometry.coordinates[1], height)
            );
            ogcFeature.screenSpaceCoordinate = screenSpaceCoordinate;
            if (screenSpaceCoordinate) {
                this._kdbush.add(screenSpaceCoordinate.x, screenSpaceCoordinate.y);
            } else {
                this._kdbush.numItems = this._kdbush.numItems - 1;
            }
        });
        this._kdbush.finish();
    }

    createClusters() {
        this._rawFeaturesArray.forEach((ogcFeature: OGCFeature) => {
            if (ogcFeature.isClustered === true || !ogcFeature.screenSpaceCoordinate) return;
            const boundingBox = this.getBoundingBox(ogcFeature);
            const neighbours = this._kdbush.range(
                boundingBox.minX,
                boundingBox.minY,
                boundingBox.maxX,
                boundingBox.maxY
            );
            if (neighbours.length < this._minimumClusterSize) {
                ogcFeature.isClustered = true;
                this._renderedFeaturesSet.add(ogcFeature.id);
                this._renderedFeaturesMap.set(ogcFeature.id, ogcFeature);
                return;
            }

            let numFeaturesInCluster = 0;
            const currentNeighbours: number[] = [];
            neighbours.forEach(neighbour => {
                if (this._clusteredSet.has(neighbour)) return;
                currentNeighbours.push(neighbour);
                numFeaturesInCluster++;
                return this._rawFeaturesArray;
            });
            if (numFeaturesInCluster < this._minimumClusterSize) {
                ogcFeature.isClustered = true;
                this._renderedFeaturesSet.add(ogcFeature.id);
                this._renderedFeaturesMap.set(ogcFeature.id, ogcFeature);
                return;
            }
            currentNeighbours.forEach(neighbour => {
                this._rawFeaturesArray[neighbour].isClustered = true;
                this._clusteredSet.add(neighbour);
            });
            ogcFeature.isClustered = true;
            ogcFeature.numberInCluster = numFeaturesInCluster;
            this._clusters.add(ogcFeature);
        });
    }

    getBoundingBox(ogcFeature: OGCFeature) {
        const displacement = this._minimumDistance / 2;
        const minX = ogcFeature.screenSpaceCoordinate.x - displacement;
        const maxX = ogcFeature.screenSpaceCoordinate.x + displacement;
        const minY = ogcFeature.screenSpaceCoordinate.y - displacement;
        const maxY = ogcFeature.screenSpaceCoordinate.y + displacement;
        return { minX, maxX, minY, maxY };
    }

    numberOfRenderedFeatures() {
        return this._renderedFeaturesSet.size;
    }

    renderedFeatures() {
        return this._renderedFeaturesSet;
    }

    renderedFeatureMap() {
        return this._renderedFeaturesMap;
    }

    clusters() {
        return this._clusters;
    }

    numberOfClusters() {
        return this._clusters.size;
    }
}
