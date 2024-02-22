/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
    BillboardGraphics,
    Cartesian3,
    ConstantProperty,
    Entity,
    EntityCollection,
    HeadingPitchRoll,
    HeightReference,
    HorizontalOrigin,
    LabelStyle,
    Math as CesiumMath,
    ModelGraphics,
    PolygonHierarchy,
    PropertyBag,
    Quaternion,
    Transforms,
    VerticalOrigin,
    Viewer,
    PerspectiveFrustum,
    Resource,
    Property,
    PositionProperty,
    PointGraphics,
    Color
} from "cesium";
import GeoJsonDecoder from "../Utils/GeoJsonDecoder";
import WesDataSource from "./WesDataSource";
import {
    FormattedFeatureTypeStyleRules,
    FormattedUserStyles,
    GeoJsonGetAllResult,
    JsonCluster,
    OGCFeature,
    UserStyleDefinition
} from "../Wes";
import { BBox } from "geojson";
import { LabelGraphics } from "cesium";
import { buildLine, buildPoint, buildPolygon } from "../Utils/Utils";
import { SldParse, getMatchingRules } from "../Utils/Wes3dSldStyler";
import FastFeatureClusters from "../Utils/FastClustering";

//Boolean Properties//
const TRUE_PROPERTY = new ConstantProperty(true);
const FALSE_PROPERTY = new ConstantProperty(false);

//Config Properties//
const CLUSTER_MINIMUM_DISTANCE = 300;
const CLUSTER_WIDTH = new ConstantProperty(35);
const CLUSTER_HEIGHT = new ConstantProperty(35);
const CLUSTER_HEIGHT_CONSTANT = 150000;
const EYE_OFFSET = new Cartesian3(0, -30, 400);
const EYE_OFFSET_METAR = new Cartesian3(0, 0, 400);

//Number Properties//
const ZERO_PROPERTY = new ConstantProperty(0);
const ONE_PROPERTY = new ConstantProperty(1);
const POSTIVE_INFINITY_PROPERTY = new ConstantProperty(Number.POSITIVE_INFINITY);

//Color Properties//
const ORANGE_PROPERTY = new ConstantProperty(Color.ORANGE);
const BLUE_PROPERTY = new ConstantProperty(Color.BLUE);

//Cesium Enum Properties//
const HORIZONTAL_ORIGIN_CENTER = new ConstantProperty(HorizontalOrigin.CENTER);
const VERTICAL_ORIGIN_CENTER = new ConstantProperty(VerticalOrigin.CENTER);
type OgcCollectionInformation = {
    title: string;
    clusterColor: string;
    defaultStyle: string;
    isLive: string | boolean;
    propertyKey: string;
};

export default class FeaturesApiDataSource extends WesDataSource {
    _sld: FormattedUserStyles;
    _featureType: string;
    _entityCollection: EntityCollection;
    _modelClustering: boolean;
    _userStyle: number;
    _userStylesCount: number;
    _isHighlighted: boolean;
    _newModelClustering: boolean;
    _webgl: WebGLRenderingContext;
    _featureLocationPointGraphics: PointGraphics;
    _renderedFeatureIdSet: Set<string>;
    _renderedClusterSet: Set<Entity>;
    _fastFeatureClusters: FastFeatureClusters | undefined;
    _collectionInformation: OgcCollectionInformation;

    constructor(description: string, name: string, url: string, viewer: Viewer, uid: string) {
        super(description, name, url, viewer, uid);
        this._type = "FeaturesAPI";
        this._featureType = "";
        this._sld = [];
        this._entityCollection = new EntityCollection(this);
        this._modelClustering = false;
        this._userStyle = 0;
        this._userStylesCount = 0;
        this._isHighlighted = false;
        this._webgl = this._viewer.canvas.getContext("webgl2")!;
        this.clustering.enabled = false;
        this._newModelClustering = false;
        this._featureLocationPointGraphics = new PointGraphics({
            color: Color.fromBytes(0, 0, 0, 255),
            pixelSize: 10
        });
        this._renderedFeatureIdSet = new Set();
        this._renderedClusterSet = new Set();
        this._fastFeatureClusters = undefined;
        this._collectionInformation = {
            title: "Unknown",
            clusterColor: "Unknown",
            defaultStyle: "Unknown",
            isLive: false,
            propertyKey: ""
        };
        this._userStylesArray = [
            {
                index: 0,
                name: "Fallback",
                dataSource: this
            }
        ];
        this.initialize(10000);

        Object.defineProperties(this, {
            featureType: {
                get: function () {
                    return this._featureType;
                }
            },
            sld: {
                get: function () {
                    return this._sld;
                }
            },
            isHighlighted: {
                get: function () {
                    return this._isHighlighted;
                },
                set: function (value) {
                    this._isHighlighted = value;
                    const collection = this._entityCollection;
                    const features = collection.values;
                    collection.suspendEvents();
                    for (let i = 0; i < features.length; i++) {
                        if (features[i].model == null) continue;
                        const feature = features[i];
                        feature.model!.silhouetteSize = value === true ? ONE_PROPERTY : ZERO_PROPERTY;
                        feature.model!.silhouetteColor = value === true ? ORANGE_PROPERTY : undefined;
                    }
                    collection.resumeEvents();
                    return;
                }
            }
        });
    }

    async loadService() {
        await this.fetchCollectionInformation();
        await this.fetchStyles();
        this.checkType();
        this.enableClustering();
        this.clusterIfMetar();
        await this.firstLoad();
    }

    enableClustering() {
        if (this._collectionInformation.clusterColor !== "Unknown") {
            this._newModelClustering = true;
        }
    }

    async fetchCollectionInformation() {
        const collectionInformation = await this.fetchJson(this._url, {
            f: "json"
        });
        this._collectionInformation.title = collectionInformation.title;
        this._collectionInformation.clusterColor = collectionInformation.preview.groupColor
            ? collectionInformation.preview.groupColor
            : this._collectionInformation.clusterColor;
        this._collectionInformation.propertyKey = Object.keys(collectionInformation.preview.properties).find(
            key => collectionInformation.preview.properties[key] === "tooltip"
        )!;
        this._collectionInformation.defaultStyle = collectionInformation.defaultStyle
            ? collectionInformation.defaultStyle
            : this._collectionInformation.defaultStyle;
        this._collectionInformation.isLive = collectionInformation.live ? true : false;
        this._update = this._collectionInformation.isLive;
    }

    async fetchStyles() {
        const links = await this.fetchJson(this._url, { f: "json" });
        if (links.styles == null) return null;
        const parsedSldTuple = await SldParse(links.styles[0].links[0].href.split("?")[0], this);
        this._userStylesArray = parsedSldTuple![0] as UserStyleDefinition[];
        this._sld = parsedSldTuple![1] as FormattedUserStyles;
        this._userStylesCount = this._sld.length;
    }

    async firstLoad() {
        this._isLoading = true;
        this._loading.raiseEvent([this, true]);
        const rawFeaturesArray = await this.getFeaturesArray(this._bbox);
        if (!rawFeaturesArray) {
            return;
        }
        if (
            this._newModelClustering &&
            (this._viewer.scene.camera.positionCartographic.height > CLUSTER_HEIGHT_CONSTANT ||
                rawFeaturesArray.length > 2000)
        ) {
            this._fastFeatureClusters = new FastFeatureClusters(this._viewer, rawFeaturesArray);
            this._renderedFeatureIdSet = this._fastFeatureClusters.renderedFeatures();
            this._entityCollection.suspendEvents();
            this.fastClusterRenderLoop();
            this._entityCollection.resumeEvents();
            this._isLoading = false;
            this._loading.raiseEvent([this, false]);
            this._isLoaded = true;
            return;
        }
        console.log("Loading without Clustering");
        this._entityCollection.suspendEvents();
        this.renderLoop(rawFeaturesArray);
        this._entityCollection.resumeEvents();
        this._isLoading = false;
        this._loading.raiseEvent([this, false]);
        this._isLoaded = true;
    }

    async updateService(id: number | null): Promise<void> {
        if (!this._isLoaded) {
            return;
        }
        const rawFeaturesArray = await this.getFeaturesArray(this._bbox, id);
        if (rawFeaturesArray == null || rawFeaturesArray.length === 0) {
            return;
        }
        if (
            this._newModelClustering &&
            (this._viewer.scene.camera.positionCartographic.height > CLUSTER_HEIGHT_CONSTANT ||
                rawFeaturesArray.length > 2000)
        ) {
            this._fastFeatureClusters = new FastFeatureClusters(this._viewer, rawFeaturesArray);
            this._entityCollection.suspendEvents();
            this.fastClusterUpdateLoop();
            this._entityCollection.resumeEvents();
            this._isLoading = false;
            this._loading.raiseEvent([this, false]);
            return;
        }
        console.log("updating without cluster");
        this._entityCollection.suspendEvents();
        this.removeFeatures(rawFeaturesArray);
        this._entityCollection.resumeEvents();
        this._isLoading = false;
        this._loading.raiseEvent([this, false]);
        this.updateLoop(rawFeaturesArray);
        return;
    }

    checkType(): void {
        let type = "default";
        const checkTypeArr = this._url.split("/");
        const lowerCheckTypeArr = checkTypeArr.map((element: string) => {
            return element.toLowerCase();
        });
        if (lowerCheckTypeArr.includes("faa")) {
            type = "faa";
        } else if (lowerCheckTypeArr.includes("ais")) {
            type = "ais";
        } else if (lowerCheckTypeArr.includes("metar")) {
            type = "metar";
        } else if (this._collectionInformation.title === "Iceberg Individual Observations") {
            type = "iceberg";
        }
        this._featureType = type;
    }

    clusterIfMetar() {
        if (this._featureType !== "metar") return;
        this.clustering.enabled = true;
        this.clustering.clusterEvent.addEventListener((cluster, clusterEntity) => {
            const text = cluster.length.toString();
            const canvasWidth = 56;
            const canvasHeight = 56;
            const fontSize = 40;
            const font = "Browalia";
            const clusterCanvas: HTMLCanvasElement = document.createElement("CANVAS") as HTMLCanvasElement;
            clusterCanvas.width = canvasWidth;
            clusterCanvas.height = canvasHeight;
            const billboardImage = clusterCanvas.getContext("2d")!;
            billboardImage.arc(canvasWidth / 2, canvasHeight / 2, (canvasWidth - 6) / 2, 0, 2 * Math.PI, false);
            billboardImage.strokeStyle = "#000000";
            billboardImage.lineWidth = 3;
            billboardImage.fillStyle = "#8B0000";
            billboardImage.stroke();
            billboardImage.fill();
            billboardImage.fillStyle = "#FFFFFF";
            billboardImage.lineWidth = 1.5;
            billboardImage.font = this.chooseFontSize(billboardImage, text, canvasWidth - 6, fontSize, font);
            billboardImage.textAlign = "center";
            billboardImage.textBaseline = "middle";
            billboardImage.strokeText(text, canvasWidth / 2, canvasHeight / 2);
            billboardImage.fillText(text, canvasWidth / 2, canvasHeight / 2);
            clusterEntity.billboard.image = clusterCanvas as unknown as string;
            clusterEntity.billboard.width = 35;
            clusterEntity.billboard.height = 35;
            //clusterEntity.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
            clusterEntity.billboard.show = true;
            clusterEntity.label.show = false;
        });
        return;
    }

    chooseModel(featureRules: FormattedFeatureTypeStyleRules) {
        let modelUrl = "./glbmodels/Box.glb";
        let graphicUrl = null;
        if (
            featureRules[0].pointSymbolizers.length &&
            featureRules[0].pointSymbolizers[0].externalGraphicUrl !== "Unknown"
        ) {
            graphicUrl = featureRules[0].pointSymbolizers[0].externalGraphicUrl;
        }
        switch (this._featureType) {
            case "faa":
                if (graphicUrl != null) {
                    modelUrl = "./glbmodels/CivilianPlane.glb";
                    const aircraftType = (graphicUrl as string).split("/").pop()!.toLowerCase();
                    switch (aircraftType) {
                        case "nc-plane.png":
                            modelUrl = "./glbmodels/MilitaryPlane.glb";
                            break;
                        case "helicopter.png":
                            modelUrl = "./glbmodels/Helicopter.glb";
                            break;
                        case "uav.png":
                            modelUrl = "./glbmodels/Helicopter.glb";
                            break;
                    }
                }
                break;
            case "ais":
                modelUrl = "./glbmodels/OceanFreighter.glb";
                break;
            case "metar":
                //modelUrl = "./glbmodels/InternetTower.glb";
                modelUrl = "";
                break;
            case "iceberg":
                if (graphicUrl != null) {
                    modelUrl = "./glbmodels/iceberg.glb";
                    const icebergType = (graphicUrl as string).split("/").pop()!.toLowerCase();
                    switch (icebergType) {
                        case "blocky_berg2.gif":
                        case "blocky_berg2_50.gif":
                            console.log("blocky_berg");
                            break;
                        case "domed_berg.gif":
                        case "domed_berg_50.gif":
                            console.log("domed_berg");
                            break;
                        case "drydock_berg.gif":
                        case "drydock_berg_50.gif":
                            console.log("drydock_berg");
                            break;
                        case "nontab_berg.gif":
                        case "nontab_berg_50.gif":
                            modelUrl = "./glbmodels/iceberg2.glb";
                            console.log("nontab_berg");
                            break;
                        case "pinnacled_berg.gif":
                        case "pinnacled_berg_50.gif":
                            console.log("pinnacled_berg");
                            modelUrl = "./glbmodels/iceberg2.glb";
                            break;
                        case "tab_berg.gif":
                        case "tab_berg_50.gif":
                            console.log("tab_berg");
                            modelUrl = "./glbmodels/iceberg2.glb";
                            break;
                        case "triangle.gif":
                        case "triange_50.gif":
                            console.log("triangle");
                            modelUrl = "./glbmodels/iceberg2.glb";
                            break;
                        case "wedge_berg.gif":
                        case "wedge_berg_50.gif":
                            console.log("wedge_berg");
                            break;
                    }
                }

                break;
        }
        return modelUrl;
    }

    async getFeaturesArray(bboxTotal: BBox, id?: number | null) {
        bboxTotal = this.setBoundingBox(bboxTotal);
        //if(bboxTotal[0] === -180 && bboxTotal[1]===-90 && bboxTotal[2]===180 && bboxTotal[3]===90){
        //    bboxTotal = [180,90,-180,-90]
        //}
        let bboxArray = [];
        if (bboxTotal[0] - bboxTotal[2] > 180) {
            bboxArray = [
                [180, bboxTotal[1], bboxTotal[0], bboxTotal[3]],
                [bboxTotal[2], bboxTotal[1], -180, bboxTotal[3]]
            ];
        } else {
            bboxArray.push(bboxTotal);
        }
        const rawFeaturesArray: OGCFeature[] = [];
        for (let i = 0; i < 2; i++) {
            if (bboxArray[i] == null) continue;
            const bbox = bboxArray[i];
            const bboxString = `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`;
            if (id != null && this.isCancelled(id)) {
                return;
            }
            const partialRawFeaturesJson = await this.fetchJson(`${this._url}items`, {
                f: "json",
                limit: 10000,
                bbox: bboxString
            });
            if (partialRawFeaturesJson != null && partialRawFeaturesJson.features != null) {
                partialRawFeaturesJson.features.forEach((ogcFeature: OGCFeature) => {
                    rawFeaturesArray.push(ogcFeature);
                });
            }
        }
        if (rawFeaturesArray.length === 0) {
            return rawFeaturesArray;
        }
        return rawFeaturesArray;
    }

    setBoundingBox(bbox: BBox) {
        if (bbox == null) {
            bbox = this._bbox;
        } else {
            this._bbox = bbox;
        }
        return bbox;
    }

    createFeatureLocationPoint(feature: Entity) {
        feature.point = this._featureLocationPointGraphics;
    }

    createFastClusteredClusterEntity(location: Cartesian3) {
        const feature = new Entity({
            show: this._show,
            position: location,
            billboard: new BillboardGraphics()
        });
        return feature;
    }

    styleFastCluster(cluster: Entity, ogcFeature: OGCFeature) {
        cluster.properties = new PropertyBag({
            clusterSize: ogcFeature.numberInCluster
        });
        const text = ogcFeature.numberInCluster.toString();
        const canvasWidth = 56;
        const canvasHeight = 56;
        const fontSize = 40;
        const font = "Browalia";
        const clusterCanvas: HTMLCanvasElement = document.createElement("CANVAS") as HTMLCanvasElement;
        clusterCanvas.width = canvasWidth;
        clusterCanvas.height = canvasHeight;
        const billboardImage = clusterCanvas.getContext("2d")!;
        billboardImage.arc(canvasWidth / 2, canvasHeight / 2, (canvasWidth - 6) / 2, 0, 2 * Math.PI, false);
        billboardImage.imageSmoothingQuality = "high";
        billboardImage.strokeStyle = "#000000";
        billboardImage.lineWidth = 3;
        billboardImage.fillStyle = this._collectionInformation.clusterColor; //"#8B0000";
        billboardImage.stroke();
        billboardImage.fill();
        billboardImage.fillStyle = "#FFFFFF";
        billboardImage.lineWidth = 1.5;
        billboardImage.font = this.chooseFontSize(billboardImage, text, canvasWidth - 6, fontSize, font);
        billboardImage.textAlign = "center";
        billboardImage.textBaseline = "middle";
        billboardImage.strokeText(text, canvasWidth / 2, canvasHeight / 2);
        billboardImage.fillText(text, canvasWidth / 2, canvasHeight / 2);
        cluster.billboard!.image = new ConstantProperty(clusterCanvas);
        cluster.billboard!.width = CLUSTER_WIDTH;
        cluster.billboard!.height = CLUSTER_HEIGHT;
        //cluster.billboard!.disableDepthTestDistance = POSTIVE_INFINITY_PROPERTY;
        cluster.billboard!.show = TRUE_PROPERTY;
    }

    fastClusterRenderLoop() {
        const clusterSet = this._fastFeatureClusters!.clusters();
        clusterSet.forEach(ogcFeature => {
            const location = this.getLocation(ogcFeature);
            const cluster = this.createFastClusteredClusterEntity(location as Cartesian3);
            this._renderedClusterSet.add(cluster);
            this.styleFastCluster(cluster, ogcFeature);
            this._entityCollection.add(cluster);
        });
        const featuresToBeRenderedMap = this._fastFeatureClusters!.renderedFeatureMap();
        this._renderedFeatureIdSet.forEach(featureId => {
            const ogcFeature = featuresToBeRenderedMap.get(featureId) as OGCFeature;
            const location = this.getLocation(ogcFeature);
            const matchedRules = getMatchingRules(ogcFeature, this._sld[this._userStyle]);
            const feature = this.createFeature(ogcFeature, location!);
            this._renderedFeatureIdSet.add(feature.id);
            this.styleFeature(feature, ogcFeature, location as Cartesian3, matchedRules);
            this._entityCollection.add(feature);
        });
    }
    fastClusterUpdateLoop() {
        this._renderedClusterSet.forEach(cluster => {
            this._entityCollection.remove(cluster);
        });
        this._renderedClusterSet.clear();
        const featureIdsToRenderSet = this._fastFeatureClusters?.renderedFeatures();
        const featureIdsToJsonMap = this._fastFeatureClusters?.renderedFeatureMap();
        const newRenderedFeatureIdSet: Set<string> = new Set();
        featureIdsToRenderSet?.forEach(featureId => {
            let feature = this._entityCollection.getById(featureId);
            if (!feature && this._renderedFeatureIdSet.has(featureId)) {
                console.log(`${featureId} does not exist but is in the RenderedSet. Dubious.`);
                return;
            }
            if (featureIdsToJsonMap == null) {
                console.log("ID to JSON Map Null.");
                return;
            }
            const ogcFeature = featureIdsToJsonMap.get(featureId);
            if (ogcFeature == null) {
                console.log("ogcFeature is null.");
                return;
            }
            const location = this.getLocation(ogcFeature);
            if (!(location instanceof Cartesian3)) {
                console.log("Feature is not point. Cannot be model clustered");
                return;
            }
            const matchedRules = getMatchingRules(ogcFeature, this._sld[this._userStyle]);
            if (feature) {
                this.updateFeatureLocation(feature, location);
                this.updateFeatureStyle(feature, ogcFeature, location, matchedRules);
                newRenderedFeatureIdSet.add(featureId);
                this._renderedFeatureIdSet.delete(featureId);
                return;
            } else {
                feature = this.createFeature(ogcFeature, location);
                this.styleFeature(feature, ogcFeature, location, matchedRules);
                newRenderedFeatureIdSet.add(featureId);
                this._entityCollection.add(feature);
            }
        });
        this._renderedFeatureIdSet.forEach(featureId => {
            this._entityCollection.removeById(featureId);
        });
        this._renderedFeatureIdSet = newRenderedFeatureIdSet;
        const clusterSet = this._fastFeatureClusters!.clusters();
        clusterSet.forEach(ogcFeature => {
            const location = this.getLocation(ogcFeature);
            const cluster = this.createFastClusteredClusterEntity(location as Cartesian3);
            this._renderedClusterSet.add(cluster);
            this.styleFastCluster(cluster, ogcFeature);
            this._entityCollection.add(cluster);
        });
    }

    renderLoop(ogcFeaturesArray: Array<OGCFeature>) {
        ogcFeaturesArray.forEach(ogcFeature => {
            const location = this.getLocation(ogcFeature);
            const matchedRules = getMatchingRules(ogcFeature, this._sld[this._userStyle]);
            // const isScaleMatch = this.checkScale(matchedRules, location as Cartesian3);
            // if(!isScaleMatch) return;
            const feature = this.createFeature(ogcFeature, location!);
            this.styleFeature(feature, ogcFeature, location as Cartesian3, matchedRules);
            this._renderedFeatureIdSet.add(feature.id);
            this._entityCollection.add(feature);
        });
    }

    async updateLoop(ogcFeaturesArray: OGCFeature[]) {
        this._renderedClusterSet.forEach(cluster => {
            this._entityCollection.remove(cluster);
        });
        this._renderedClusterSet.clear();
        ogcFeaturesArray.forEach(ogcFeature => {
            const location = this.getLocation(ogcFeature);
            let feature = this._entityCollection.getById(ogcFeature.id);
            const matchedRules = getMatchingRules(ogcFeature, this._sld[this._userStyle]);
            // const isScaleMatch = this.checkScale(matchedRules, location as Cartesian3);
            // if (feature && !isScaleMatch){
            //     this._entityCollection.remove(feature);
            // }
            if (!feature) {
                feature = this.createFeature(ogcFeature, location!);
                this._renderedFeatureIdSet.add(feature.id);
                this._entityCollection.add(feature);
                this.styleFeature(feature, ogcFeature, location as Cartesian3, matchedRules);
                return;
            }
            this.updateFeatureLocation(feature, location!);
            this.updateFeatureStyle(feature, ogcFeature, location as Cartesian3, matchedRules);
            return;
        });
    }

    removeFeatures(ogcFeaturesArray: OGCFeature[]) {
        this._entityCollection.values.forEach(entity => {
            if (ogcFeaturesArray.find(ogcFeature => ogcFeature.id === entity.id) == null) {
                this._renderedFeatureIdSet.delete(entity.id);
                this._entityCollection.remove(entity);
                //entity.show = false;
            }
        });
    }

    chooseFontSize(
        context: CanvasRenderingContext2D,
        text: string,
        canvasWidth: number,
        maxFontSize: number,
        font: string
    ): string {
        context.font = `${maxFontSize.toString()}px ${font}`;
        const textDetails = context.measureText(text);
        if (textDetails.width <= canvasWidth) {
            return context.font;
        }
        return this.chooseFontSize(context, text, canvasWidth, maxFontSize - 5, font);
    }

    styleClusterEntity(clusterEntity: Entity, cluster: JsonCluster) {
        const text = cluster[2].toString();
        const canvasWidth = 56;
        const canvasHeight = 56;
        const fontSize = 40;
        const font = "Browalia";
        const clusterCanvas: HTMLCanvasElement = document.createElement("CANVAS") as HTMLCanvasElement;
        clusterCanvas.width = canvasWidth;
        clusterCanvas.height = canvasHeight;
        const billboardImage = clusterCanvas.getContext("2d")!;
        billboardImage.arc(canvasWidth / 2, canvasHeight / 2, (canvasWidth - 6) / 2, 0, 2 * Math.PI, false);
        billboardImage.strokeStyle = "#000000";
        billboardImage.lineWidth = 3;
        billboardImage.fillStyle = "#1E90FF";
        billboardImage.stroke();
        billboardImage.fill();
        billboardImage.fillStyle = "#FFFFFF";
        billboardImage.lineWidth = 1.5;
        billboardImage.font = this.chooseFontSize(billboardImage, text, canvasWidth - 6, fontSize, font);
        billboardImage.textAlign = "center";
        billboardImage.textBaseline = "middle";
        billboardImage.strokeText(text, canvasWidth / 2, canvasHeight / 2);
        billboardImage.fillText(text, canvasWidth / 2, canvasHeight / 2);
        clusterEntity.billboard = new BillboardGraphics({
            image: clusterCanvas,
            width: 35,
            height: 35,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        });
    }

    createFeature(feature: OGCFeature, location: Cartesian3 | ConstantProperty | PolygonHierarchy): Entity {
        switch (feature.geometry.type.toLowerCase()) {
            case "point": {
                return this.createPointEntity(location as Cartesian3, feature.id);
            }
            case "linestring": {
                return this.createPolyLineEntity(location as ConstantProperty, feature.id);
            }
            case "polygon": {
                return this.createPolygonEntity(location as PolygonHierarchy, feature.id);
            }
        }
        return this.createPointEntity(location as Cartesian3, feature.id);
    }

    getLocation(feature: OGCFeature) {
        const featureType = feature.geometry.type.toLowerCase();
        switch (featureType) {
            case "point": {
                return this.getPointPosition(feature);
            }
            case "linestring": {
                return this.getLineStringPosition(feature);
            }
            case "polygon": {
                return this.getPolygonPosition(feature);
            }
        }
    }

    getPointPosition(feature: OGCFeature) {
        const shapes = new GeoJsonDecoder(feature).getAll();
        const point = buildPoint(shapes as GeoJsonGetAllResult);
        return Cartesian3.fromDegrees(point[0], point[1], point[2]);
    }

    getLineStringPosition(feature: OGCFeature) {
        const shapes = new GeoJsonDecoder(feature).getAll();
        const linestring = buildLine(shapes as GeoJsonGetAllResult);
        return new ConstantProperty(Cartesian3.fromDegreesArrayHeights(linestring));
    }

    getPolygonPosition(feature: OGCFeature) {
        const shapes = new GeoJsonDecoder(feature).getAll();
        const polygon = buildPolygon(shapes as GeoJsonGetAllResult);
        let numberOfRings = polygon.length;
        const holesArray: PolygonHierarchy[] = [];
        let polygonHierarchy = new PolygonHierarchy();
        while (numberOfRings) {
            if (numberOfRings > 1) {
                holesArray.push({
                    positions: Cartesian3.fromDegreesArrayHeights(polygon[numberOfRings - 1])
                } as PolygonHierarchy);
                numberOfRings--;
            } else {
                polygonHierarchy = {
                    positions: Cartesian3.fromDegreesArrayHeights(polygon[numberOfRings - 1]),
                    holes: holesArray
                };
                numberOfRings--;
            }
            return polygonHierarchy;
        }
    }

    createPointEntity(location: Cartesian3, id: string) {
        const feature = new Entity({
            show: this._show,
            id,
            position: location
        });
        return feature;
    }

    createPolyLineEntity(location: ConstantProperty, id: string) {
        const feature = new Entity({
            show: this._show,
            id,
            polyline: {
                positions: location
            }
        });
        return feature;
    }

    createPolygonEntity(location: PolygonHierarchy, id: string) {
        const feature = new Entity({
            show: this._show,
            id,
            polygon: {
                hierarchy: location
            }
        });
        return feature;
    }

    styleFeature(
        feature: Entity,
        rawFeature: OGCFeature,
        location: Cartesian3,
        matchedRules: FormattedFeatureTypeStyleRules
    ) {
        if (feature.properties && feature.properties.hasBeenStyled) {
            this.updateFeatureStyle(feature, rawFeature, location, matchedRules);
            return;
        }
        this.addFeatureInfo(feature, rawFeature, location);
        if (!this._userStylesCount || !matchedRules.length) {
            this.fallbackStyles(feature, location);
            return;
        }
        if (this._featureType !== "faa" && this._featureType !== "ais") {
            this.addFeatureBillboard(feature, matchedRules);
        }
        this.addFeatureLabel(feature, matchedRules);
        if (feature.polyline == null && feature.polygon == null) {
            this.addModelGraphics(feature, matchedRules);
            if (
                matchedRules[0].pointSymbolizers[0].headingKey != null &&
                matchedRules[0].pointSymbolizers[0].headingKey !== ""
            ) {
                this.addModelOrientation(feature, matchedRules[0].pointSymbolizers[0].headingKey, location);
            }
        }
        if (feature.polyline) {
            this.addPolyLineGraphics(feature, matchedRules);
        }
        if (feature.polygon) {
            this.addPolygonGraphics(feature, matchedRules);
        }
        feature.properties?.addProperty("hasBeenStyled", true);
    }

    updateFeatureLocation(feature: Entity, location: Cartesian3 | ConstantProperty | PolygonHierarchy): Entity {
        if (feature.polyline == null && feature.polygon == null) {
            return this.updatePointLocation(location as Cartesian3, feature);
        }
        if (feature.polyline) {
            return this.updatePolyLineLocation(location as ConstantProperty, feature);
        }
        if (feature.polygon) {
            return this.updatePolygonLocation(location as PolygonHierarchy, feature);
        }
        return this.createPointEntity(location as Cartesian3, feature.id);
    }

    updatePointLocation(location: Cartesian3, feature: Entity) {
        feature.position! = location as unknown as PositionProperty;
        return feature;
    }
    updatePolyLineLocation(location: ConstantProperty, feature: Entity) {
        feature.polyline!.positions = location;
        return feature;
    }
    updatePolygonLocation(location: PolygonHierarchy, feature: Entity) {
        feature.polygon!.hierarchy = location as unknown as Property;
        return feature;
    }

    updateFeatureStyle(
        feature: Entity,
        rawFeature: OGCFeature,
        location: Cartesian3,
        matchedRules: FormattedFeatureTypeStyleRules
    ) {
        this.addFeatureInfo(feature, rawFeature, location);
        if (!this._userStylesCount || !matchedRules.length) {
            this.fallbackStyles(feature, location);
            return;
        }
        if (feature.polyline == null && feature.polygon == null) {
            if (
                matchedRules[0].pointSymbolizers[0].headingKey != null &&
                matchedRules[0].pointSymbolizers[0].headingKey !== ""
            ) {
                this.addModelOrientation(feature, matchedRules[0].pointSymbolizers[0].headingKey, location);
            }
        }
        return;
    }

    fallbackStyles(feature: Entity, location: Cartesian3) {
        //TODO: fallback styles not implemented yet
    }

    addFeatureInfo(feature: Entity, rawFeature: OGCFeature, location: Cartesian3 | null = null) {
        if (rawFeature.properties) {
            feature.properties = new PropertyBag();
            for (const key in rawFeature.properties) {
                if ({}.hasOwnProperty.call(rawFeature.properties, key)) {
                    feature.properties.addProperty(key, rawFeature.properties[key]);
                }
            }
            feature.properties.addProperty("json", rawFeature);
            const matchedRules = getMatchingRules(rawFeature, this._sld[this._userStyle]);
            if (matchedRules) {
                feature.properties.addProperty("matchingRules", matchedRules);
            }
            if (location) {
                feature.properties.addProperty("cartesian3Location", location);
            }
        }
    }

    processGraphicURL(graphicURL: string, feature: Entity) {
        const processedURL = graphicURL.replace(/\$\{\w+\}/gi, function (x) {
            return feature.properties![x.replace(/\$|{|}/gi, "")];
        });
        return processedURL;
    }

    async addFeatureBillboard(feature: Entity, matchedRules: FormattedFeatureTypeStyleRules) {
        if (!matchedRules.some(rule => rule.pointSymbolizers)) return;
        const imageUrl = this.getGraphicUrl(feature, matchedRules);
        if (imageUrl === "") return;
        let eyeOffset = EYE_OFFSET;
        if (this._featureType === "metar") {
            eyeOffset = EYE_OFFSET_METAR;
        }

        let height: number | ConstantProperty = 40;
        if (matchedRules[0].pointSymbolizers.length && typeof matchedRules[0].pointSymbolizers[0].size == "number") {
            height = matchedRules[0].pointSymbolizers[0].size;
        }
        outer: if (imageUrl !== "" && imageUrl !== "Unknown") {
            const image = await Resource.fetchImage({ url: imageUrl });
            if (image == null) break outer;
            const aspectRatio = image.width / image.height;
            let width: number | ConstantProperty = height * aspectRatio;
            if (width > 100) {
                width = 100;
                height = width / aspectRatio;
            }
            width = new ConstantProperty(width);
            height = new ConstantProperty(height);
            feature.billboard = new BillboardGraphics({
                image: imageUrl,
                show: TRUE_PROPERTY,
                eyeOffset,
                horizontalOrigin: HORIZONTAL_ORIGIN_CENTER,
                verticalOrigin: VERTICAL_ORIGIN_CENTER,
                width,
                height
            });
        }
    }

    getGraphicUrl(feature: Entity, matchedRules: FormattedFeatureTypeStyleRules) {
        let imageUrl = "";
        matchedRules.forEach(rule => {
            if (rule.pointSymbolizers.length && rule.pointSymbolizers[0].externalGraphicUrl) {
                imageUrl = this.processGraphicURL(rule.pointSymbolizers[0].externalGraphicUrl, feature);
            }
        });
        return imageUrl;
    }

    addFeatureLabel(feature: Entity, featureRules: FormattedFeatureTypeStyleRules) {
        if (feature.properties == null) {
            return;
        }
        for (let i = 0; i < featureRules.length; i++) {
            if (featureRules[i].textSymbolizers == null) {
                return;
            }
            for (let j = 0; j < featureRules[i].textSymbolizers.length; j++) {
                if (featureRules[i].textSymbolizers[j].textKey !== "Unknown") {
                    const textRules = featureRules[i].textSymbolizers[j];
                    let style = LabelStyle.FILL_AND_OUTLINE;
                    if (textRules.outlineWidth === 0) {
                        style = LabelStyle.FILL;
                    }
                    if (!textRules.textKey) {
                        console.warn("Could not find label text");
                        feature.properties.addProperty(textRules.textKey, "");
                    }
                    feature.label = new LabelGraphics({
                        text: feature.properties![textRules.textKey].getValue(),
                        font: textRules.font,
                        pixelOffset: textRules.pixelOffset,
                        scale: 1,
                        fillColor: textRules.color, //make this fillColor in styler
                        outlineColor: textRules.outlineColor,
                        outlineWidth: textRules.outlineWidth,
                        horizontalOrigin: textRules.horizontalOrigin,
                        verticalOrigin: textRules.verticalOrigin,
                        style,
                        show: true
                    });
                    return;
                }
            }
        }
    }

    addModelGraphics(feature: Entity, matchedRules: FormattedFeatureTypeStyleRules) {
        const uri = this.chooseModel(matchedRules);
        if (uri === "") {
            return;
        }
        feature.model! = new ModelGraphics({
            uri,
            scale: 1,
            minimumPixelSize: 80,
            heightReference: HeightReference.RELATIVE_TO_GROUND,
            show: true
        });
        if (this._isHighlighted) {
            feature.model.silhouetteSize = ONE_PROPERTY;
            feature.model.silhouetteColor = ORANGE_PROPERTY;
        }
    }

    addModelOrientation(feature: Entity, headingKey: string, location: Cartesian3) {
        if (feature.properties == null) {
            return;
        }
        const rawHeading = feature.properties![headingKey];
        const orientation = this.getOrientation(rawHeading, location);
        feature.orientation = new ConstantProperty(orientation);
    }

    addPolyLineGraphics(feature: Entity, matchedRules: FormattedFeatureTypeStyleRules) {
        if (!matchedRules[0].lineSymbolizers.length) {
            return;
        }
        feature.polyline!.material = matchedRules[0].lineSymbolizers[0].material;
        feature.polyline!.width = new ConstantProperty(matchedRules[0].lineSymbolizers[0].width);
        feature.polyline!.clampToGround = TRUE_PROPERTY;
    }

    addPolygonGraphics(feature: Entity, matchedRules: FormattedFeatureTypeStyleRules) {
        let isStyled = false;
        matchedRules.forEach(rule => {
            if (isStyled) return;
            if (rule.polygonSymbolizers.length) {
                feature.polygon!.fill = TRUE_PROPERTY;
                feature.polygon!.material = rule.polygonSymbolizers[0].fillColor;
                feature.polygon!.outline = TRUE_PROPERTY;
                feature.polygon!.outlineWidth = new ConstantProperty(rule.polygonSymbolizers[0].outlineWidth);
                feature.polygon!.outlineColor = rule.polygonSymbolizers[0].outlineColor;
                feature.polygon!.height = ZERO_PROPERTY;
                isStyled = true;
            }
        });
    }

    getOrientation(heading: number, position: Cartesian3): Quaternion {
        const adjustedHeading = heading + 90;
        const radHead = CesiumMath.toRadians(adjustedHeading);
        const hpr = new HeadingPitchRoll(radHead, 0, 0);
        const orientation = Transforms.headingPitchRollQuaternion(position, hpr);
        return orientation;
    }

    checkScale(matchedRules: FormattedFeatureTypeStyleRules, location: Cartesian3) {
        //Check if it is a point position (AKA Polygon and Line scale not implemented);
        if (!(location instanceof Cartesian3)) return true;
        let isScaleMatch: boolean | null = true;
        matchedRules.forEach(rule => {
            const maxScaleDenominator = rule.maxScaleDenominator.length ? rule.maxScaleDenominator[0] : null;
            const minScaleDenominator = rule.minScaleDenominator.length ? rule.minScaleDenominator[0] : null;
            if (maxScaleDenominator == null && minScaleDenominator == null) return true;
            const distance = Cartesian3.distance(this._viewer.camera.position, location);
            const webgl = this._webgl;
            const tanThetaV = Math.tan(0.5 * (this._viewer.camera.frustum as PerspectiveFrustum).fovy);
            const pixelHeightMetersPerPixel = (2.0 * distance * tanThetaV) / webgl!.drawingBufferHeight;
            const standardizedScaleDenominator = pixelHeightMetersPerPixel / 0.00028;
            isScaleMatch = maxScaleDenominator == null ? null : maxScaleDenominator >= standardizedScaleDenominator;
            if (isScaleMatch === false) return;
            isScaleMatch =
                minScaleDenominator == null ? isScaleMatch : minScaleDenominator <= standardizedScaleDenominator;
        });
        return isScaleMatch;
    }
}
