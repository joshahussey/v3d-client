import { Math as CesiumMath, Cartesian3, Scene, SceneTransforms, Cartesian2, Viewer } from "cesium";
import {
    FeatureArray,
    GeoJSONCoordinate,
    OGCFeature,
    PixelPosition,
    FeatureWeightIdentifier,
    FeaturesJson,
    Cluster,
    JsonCluster
} from "../Wes";

export default class FeatureClusters {
    _minimumDistance: number;
    _minimumClusterSize: number;
    _rawFeaturesArray: FeatureArray;
    _clusters: Cluster[];
    _scene: Scene;
    _viewer: Viewer;
    constructor(viewer: Viewer, rawFeaturesArray: FeatureArray, minimumDistance = 80, minimumClusterSize = 2) {
        this._minimumDistance = minimumDistance;
        this._minimumClusterSize = minimumClusterSize;
        this._rawFeaturesArray = rawFeaturesArray;
        this._clusters = [];
        this._viewer = viewer;
        this._scene = viewer.scene;
        Object.defineProperties(this, {
            clusters: {
                get: function () {
                    return this._clusters;
                }
            },
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

    getCartesian3Array(): Cartesian3[] {
        let coordinateArray: GeoJSONCoordinate[];
        if (this._rawFeaturesArray[0].geometry.coordinates.length === 3) {
            coordinateArray = this._rawFeaturesArray.map((element: OGCFeature) => element.geometry.coordinates);
        } else {
            coordinateArray = this._rawFeaturesArray.map(
                (element: OGCFeature) => [...element.geometry.coordinates, 0] as GeoJSONCoordinate
            );
        }
        return Cartesian3.fromDegreesArrayHeights(coordinateArray.flat());
    }

    getWindowCoordinateArray(cartesian3Array: Cartesian3[]) {
        const windowCoordinateArray: Array<FeatureWeightIdentifier> = [];
        let numCoordinates = cartesian3Array.length - 1;
        while (numCoordinates) {
            //TODO: At certain altitude check distance before scene transform
            const cartesian3 = SceneTransforms.wgs84ToWindowCoordinates(this._scene, cartesian3Array[numCoordinates]);
            const coordinateArray: PixelPosition = [cartesian3.x, cartesian3.y];
            const featureWeightIdentifier: FeatureWeightIdentifier = this.addWeights(coordinateArray);
            windowCoordinateArray.unshift(featureWeightIdentifier);
            numCoordinates--;
        }
        return windowCoordinateArray;
    }

    getWindowSpaceDifference(
        windowPosition1: FeatureWeightIdentifier,
        windowPosition2: FeatureWeightIdentifier
    ): number {
        const xDifference = Math.abs(windowPosition1[0] - windowPosition2[0]);
        const yDifference = Math.abs(windowPosition1[1] - windowPosition2[1]);
        const windowDistance = Math.hypot(xDifference, yDifference);
        return windowDistance;
    }

    getClusterSpaceDifference(windowPosition1: Cartesian2, windowPosition2: Cartesian2) {
        console.log(`pos1x ${windowPosition1.x}`);
        console.log(`pos2x ${windowPosition2.x}`);
        const xDifference = Math.abs(windowPosition1.x - windowPosition2.x);
        const yDifference = Math.abs(windowPosition1.y - windowPosition2.y);
        const windowDistance = Math.hypot(xDifference, yDifference);
        console.log(`windowDistance ${windowDistance}`);
        return windowDistance;
    }

    isWithinClusterArea(windowPosition1: FeatureWeightIdentifier, windowPosition2: FeatureWeightIdentifier): boolean {
        const simpleConditions =
            Math.abs(windowPosition1[0] - windowPosition2[0]) > this._minimumDistance ||
            Math.abs(windowPosition1[1] - windowPosition2[1]) > this._minimumDistance;
        if (simpleConditions) {
            return false;
        }
        const windowDistance = this.getWindowSpaceDifference(windowPosition1, windowPosition2);
        return windowDistance <= this._minimumDistance ? true : false;
    }

    addWeights(coordinateArray: PixelPosition): FeatureWeightIdentifier {
        const featureWeightIdentifier: FeatureWeightIdentifier = [
            coordinateArray[0],
            coordinateArray[1],
            0,
            new Set<number>()
        ];
        return featureWeightIdentifier;
    }

    weigh(windowCoordinateArray: FeatureWeightIdentifier[]): void {
        let numCoordinates = windowCoordinateArray.length - 1;
        while (numCoordinates) {
            let secondFeatureIndex = numCoordinates - 1;
            while (secondFeatureIndex) {
                if (
                    this.isWithinClusterArea(
                        windowCoordinateArray[numCoordinates],
                        windowCoordinateArray[secondFeatureIndex]
                    )
                ) {
                    this.tallyWeight(windowCoordinateArray[numCoordinates]);
                    this.tallyWeight(windowCoordinateArray[secondFeatureIndex]);
                    this.trackClusterMembers(numCoordinates, secondFeatureIndex, windowCoordinateArray);
                }
                secondFeatureIndex--;
            }
            numCoordinates--;
        }
    }

    tallyWeight(windowCoordinate: FeatureWeightIdentifier): void {
        windowCoordinate[2]++;
    }

    trackClusterMembers(firstIndex: number, secondIndex: number, windowCoordinateArray: FeatureWeightIdentifier[]) {
        windowCoordinateArray[firstIndex][3].add(secondIndex);
        windowCoordinateArray[secondIndex][3].add(firstIndex);
    }

    getMaxIndex(windowCoordinateArray: FeatureWeightIdentifier[]): number {
        const index = windowCoordinateArray.reduce(
            (maxIndex, currentCoordinateArray, currentArrayIndex, windowCoordinateArray) => {
                while (windowCoordinateArray[maxIndex] == null) {
                    maxIndex++;
                }
                if (currentCoordinateArray != null) {
                    return currentCoordinateArray[2] > windowCoordinateArray[maxIndex][2]
                        ? currentArrayIndex
                        : maxIndex;
                }
                return maxIndex;
            },
            0
        );
        return index;
    }

    addToClusters(
        windowCoordinateArray: FeatureWeightIdentifier[],
        indexOfMax: number,
        latitude: number,
        longitude: number
    ) {
        this._clusters.push([true, indexOfMax, windowCoordinateArray[indexOfMax][3].size + 1, latitude, longitude]);
    }

    reWeigh(windowCoordinateArray: FeatureWeightIdentifier[], clusteredSet: Set<number>): FeatureWeightIdentifier[] {
        let numCoordinates = windowCoordinateArray.length - 1;
        while (numCoordinates) {
            if (windowCoordinateArray[numCoordinates] != null) {
                windowCoordinateArray[numCoordinates][3] = new Set(
                    [...windowCoordinateArray[numCoordinates][3]].filter(x => !clusteredSet.has(x))
                );
                windowCoordinateArray[numCoordinates][2] = windowCoordinateArray[numCoordinates][3].size;
            }
            numCoordinates--;
        }
        return windowCoordinateArray;
    }

    nullClusteredItems(windowCoordinateArray: Array<FeatureWeightIdentifier | null>, indexOfMax: number) {
        const clusteredSet = windowCoordinateArray[indexOfMax]![3];
        clusteredSet.forEach(e => {
            windowCoordinateArray[e] = null;
        });
        this.reWeigh(windowCoordinateArray as FeatureWeightIdentifier[], clusteredSet);
        windowCoordinateArray[indexOfMax] = null;
    }

    addNonClusterable(windowCoordinateArray: Array<FeatureWeightIdentifier | null>) {
        windowCoordinateArray.forEach((e, index: number) => {
            if (e === null) {
                return;
            }
            if (e[2] === 0) {
                this._clusters.push([false, index, 0, 0, 0]);
                windowCoordinateArray[index] = null;
            }
        });
    }

    mapClusters() {
        const newRawFeaturesArray: FeaturesJson = [];
        this._clusters.forEach((cluster: Cluster) => {
            if (cluster[0] === true) {
                let jsonCluster: JsonCluster;
                if (this._rawFeaturesArray[cluster[1]].geometry.coordinates.length === 3) {
                    jsonCluster = [
                        cluster[0],
                        cluster[1],
                        cluster[2],
                        cluster[3],
                        cluster[4],
                        this._rawFeaturesArray[cluster[1]].geometry.coordinates[2]
                    ];
                } else {
                    jsonCluster = [cluster[0], cluster[1], cluster[2], cluster[3], cluster[4], 0];
                }
                newRawFeaturesArray.push(jsonCluster);
            } else {
                newRawFeaturesArray.push(this._rawFeaturesArray[cluster[1]]);
            }
        });
        return newRawFeaturesArray;
    }
    createTotalCluster(rawFeaturesArray: FeatureArray) {
        const height = 0;
        const latLong = this.getMapCenter();
        if (latLong == null) {
            console.log("Must be looking at world to cluster");
            return;
        }
        const lat = latLong[1];
        const long = latLong[0];
        return [[true, 0, rawFeaturesArray.length, long, lat, height]];
    }

    getMapCenter() {
        const windowPosition = new Cartesian2(
            this._viewer.container.clientWidth / 2,
            this._viewer.container.clientHeight / 2
        );
        const pickRay = this._viewer.scene.camera.getPickRay(windowPosition);
        if (pickRay == null) {
            console.log("PickRay Required");
            return;
        }
        const pickPosition = this._viewer.scene.globe.pick(pickRay, this._viewer.scene);
        if (pickPosition == null) {
            console.log("PickPosition required");
            return;
        }
        const pickPositionCartographic = this._viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
        return [
            pickPositionCartographic.longitude * (180 / Math.PI),
            pickPositionCartographic.latitude * (180 / Math.PI)
        ];
    }

    getClusterCenter(indexOfMax: number, windowCoordinateArray: FeatureWeightIdentifier[]) {
        const clusteredSet = windowCoordinateArray[indexOfMax]![3];
        let xmin = 0;
        let xmax = 0;
        let ymin = 0;
        let ymax = 0;
        clusteredSet.forEach(e => {
            xmin = windowCoordinateArray[e][0] < xmin ? windowCoordinateArray[e][0] : xmin;
            xmax = windowCoordinateArray[e][0] > xmax ? windowCoordinateArray[e][0] : xmax;
            ymin = windowCoordinateArray[e][1] < ymin ? windowCoordinateArray[e][1] : ymin;
            ymax = windowCoordinateArray[e][1] > ymax ? windowCoordinateArray[e][1] : ymax;
        });
        const centerX = xmin + (xmax - xmin) / 2;
        const centerY = ymin + (ymax - ymin) / 2;
        const clusterCenter = this._viewer.camera.pickEllipsoid(new Cartesian2(centerX, centerY));
        const clusterCenterCartographic = this._viewer.scene.globe.ellipsoid.cartesianToCartographic(clusterCenter!);
        return [
            CesiumMath.toDegrees(clusterCenterCartographic.longitude),
            CesiumMath.toDegrees(clusterCenterCartographic.latitude)
        ];
    }

    mergeClusters() {
        this._clusters.forEach((cluster, index) => {
            const clusterPosition = SceneTransforms.wgs84ToWindowCoordinates(
                this._scene,
                new Cartesian3(cluster[3], cluster[4], 0)
            );
            for (let i = index + 1; i < this._clusters.length; i++) {
                const clusterPosition2 = SceneTransforms.wgs84ToWindowCoordinates(
                    this._scene,
                    new Cartesian3(this._clusters[i][3], this._clusters[i][4], 0)
                );
                console.log(`clusterPos1 ${clusterPosition}`);
                console.log(`clusterPos2 ${clusterPosition2}`);
                if (this.getClusterSpaceDifference(clusterPosition, clusterPosition2) < 60) {
                    cluster[2] = cluster[2] + this._clusters[i][2];
                    this._clusters.splice(i, 1);
                    i--;
                }
            }
        });
    }

    cluster() {
        if (this._scene.camera.positionCartographic.height < 200000 && this._rawFeaturesArray.length < 300)
            return this._rawFeaturesArray;
        if (this._scene.camera.positionCartographic.height > 950000 && this._rawFeaturesArray.length > 500)
            return this.createTotalCluster(this._rawFeaturesArray);
        const cartesian3Array = this.getCartesian3Array();
        const windowCoordinateArray = this.getWindowCoordinateArray(cartesian3Array);
        this.weigh(windowCoordinateArray);
        let indexOfMax = this.getMaxIndex(windowCoordinateArray);
        let centerCoordinates = this.getClusterCenter(indexOfMax, windowCoordinateArray);
        this.addToClusters(windowCoordinateArray, indexOfMax, centerCoordinates[0], centerCoordinates[1]);
        this.nullClusteredItems(windowCoordinateArray, indexOfMax);
        this.addNonClusterable(windowCoordinateArray);
        let isNotClustered = windowCoordinateArray.some((element: FeatureWeightIdentifier | null) => element != null);
        while (isNotClustered) {
            indexOfMax = this.getMaxIndex(windowCoordinateArray);
            centerCoordinates = this.getClusterCenter(indexOfMax, windowCoordinateArray);
            this.addToClusters(windowCoordinateArray, indexOfMax, centerCoordinates[0], centerCoordinates[1]);
            this.nullClusteredItems(windowCoordinateArray, indexOfMax);
            this.addNonClusterable(windowCoordinateArray);
            isNotClustered = windowCoordinateArray.some((element: FeatureWeightIdentifier | null) => element != null);
        }
        //this.mergeClusters();
        return this.mapClusters();
    }
}
