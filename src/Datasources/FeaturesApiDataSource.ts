import {
    BillboardGraphics,
    Cartesian3,
    ConstantProperty,
    Entity,
    EntityCollection,
    HeadingPitchRoll,
    HeightReference,
    Math as CesiumMath,
    ModelGraphics,
    PolygonHierarchy,
    PropertyBag,
    Transforms,
    Viewer,
    Property,
    PositionProperty,
    PointGraphics,
    Color,
    ShadowMode,
    ColorBlendMode,
    ColorMaterialProperty,
    Cartesian2,
    ImageMaterialProperty,
    DistanceDisplayCondition,
    defined,
    Resource,
    SceneMode
} from "cesium";
import GeoJsonDecoder from "../Utils/GeoJsonDecoder";
import WesDataSource from "./WesDataSource";
import { GeoJsonGetAllResult, JsonCluster, OGCFeature, ServiceInfo, ImageryBounds } from "../Types/types";
import { BBox } from "geojson";
import { LabelGraphics } from "cesium";
import { buildLine, buildPoint, buildPolygon } from "../Utils/Utils";
import FastFeatureClusters from "../Utils/FastClustering";
import { getTddRuleMatches } from "../Utils/tddparser";
import { translate as t } from "../i18n/Translator";
import {
    BLProps,
    Billboard,
    Label,
    MaterialColor,
    MaterialImage,
    MaterialProperty,
    PointSymbolizer,
    PolygonSymbolizer,
    PropertyLookup,
    RGBA,
    Rule,
    Styled3dLayerDescriptor,
    UserStyle
} from "../Types/tdd";
import {
    CLUSTER_HEIGHT,
    CLUSTER_HEIGHT_CONSTANT,
    CLUSTER_WIDTH,
    HEIGHT_REFERENCE_CLAMP_TO_GROUND,
    HEIGHT_REFERENCE_RELATIVE_TO_GROUND,
    ONE_PROPERTY,
    TWO_PROPERTY,
    ORANGE_PROPERTY,
    TRUE_PROPERTY,
    VERTICAL_ORIGIN_BOTTOM,
    ZERO_PROPERTY,
    BLUE_PROPERTY,
    FEATURES_KEYFRAME_INTERVAL
} from "../Constants";
import { styleDefaultClusters, styleGeoJsonBillboard } from "../Utils/ClusterStyling";

//DELETE WHEN CESIUM FIXES THIS BUG
interface resource_fixed extends Resource {
    createIfNeeded: (url: string) => Resource;
}

type OgcCollectionInformation = {
    title: string;
    clusterColor: string;
    defaultStyle: string;
    isLive: string | boolean;
    propertyKey: string;
};

export default class FeaturesApiDataSource extends WesDataSource {
    _tdd?: Styled3dLayerDescriptor;
    _featureType: string;
    _entityCollection: EntityCollection;
    _modelClustering: boolean;
    _userStyle: number;
    _userStylesCount: number;
    _isHighlighted: boolean;
    _newModelClustering: boolean;
    _webgl: WebGLRenderingContext | null;
    _frame: number;
    _lastTimestamp: Date | null;
    _features: OGCFeature[];
    _featureLocationPointGraphics: PointGraphics;
    _renderedFeatureIdSet: Set<string>;
    _renderedClusterSet: Set<Entity>;
    _fastFeatureClusters: FastFeatureClusters | undefined;
    _collectionInformation: OgcCollectionInformation;
    _canvasCache: {
        [key: string]: HTMLCanvasElement | Promise<HTMLCanvasElement> | HTMLImageElement | Promise<HTMLImageElement>;
    };
    _geometryBounds: ImageryBounds;
    _itemsLink: string = "";
    isHighlighted: boolean;
    depthDistCond: Property;
    lastRawFeaturesArray: OGCFeature[] | undefined;

    constructor(
        description: string,
        name: string,
        url: string,
        viewer: Viewer,
        uid: string,
        geometryBounds: ImageryBounds,
        serviceInfo: ServiceInfo
    ) {
        super(description, name, url, viewer, uid, serviceInfo);
        this._type = "FeaturesAPI";
        this._featureType = "";
        this._geometryBounds = geometryBounds;
        this._entityCollection = new EntityCollection(this);
        this._modelClustering = false;
        this._userStyle = 0;
        this._userStylesCount = 0;
        this._isHighlighted = false;
        this.isHighlighted = this._isHighlighted;
        this._webgl = this._viewer.canvas.getContext("webgl2");
        this._frame = 0;
        this._lastTimestamp = null;
        this._features = [];
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
        this._canvasCache = {};
        this.depthDistCond = new ConstantProperty(this._viewer.camera.positionCartographic.height + 6178137);
        this.initialize(10000);
        this._viewer.camera.changed.addEventListener(() => {
            this._frame = FEATURES_KEYFRAME_INTERVAL;
        });

        Object.defineProperties(this, {
            featureType: {
                get: function () {
                    return this._featureType;
                }
            },
            tdd: {
                get: function () {
                    return this._tdd;
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
                        feature.model.silhouetteSize = value === true ? ONE_PROPERTY : ZERO_PROPERTY;
                        feature.model.silhouetteColor = value === true ? ORANGE_PROPERTY : undefined;
                    }
                    collection.resumeEvents();
                    return;
                }
            },
            geometryBounds: {
                get: function () {
                    return this._geometryBounds;
                }
            }
        });
    }

    reCluster = () => {
        if (!this._show) {
            return;
        }
        this._renderedClusterSet.forEach(cluster => {
            this._entityCollection.remove(cluster);
        });
        this.lastRawFeaturesArray?.forEach((ogcFeature: OGCFeature) => {
            ogcFeature.isClustered = false;
        });
        if (
            this.lastRawFeaturesArray &&
            this._newModelClustering &&
            (this._viewer.scene.camera.positionCartographic.height > CLUSTER_HEIGHT_CONSTANT ||
                this.lastRawFeaturesArray.length > 2000)
        ) {
            this._fastFeatureClusters = new FastFeatureClusters(this._viewer, this.lastRawFeaturesArray);
            this._entityCollection.suspendEvents();
            const clusterSet = this._fastFeatureClusters.clusters();
            clusterSet.forEach(ogcFeature => {
                const location = this.getLocation(ogcFeature);
                const cluster = this.createFastClusteredClusterEntity(location as Cartesian3);
                this._renderedClusterSet.add(cluster);
                this.styleFastCluster(cluster, ogcFeature);
                this._entityCollection.add(cluster);
            });
            this._entityCollection.resumeEvents();
        }
    };

    async loadService() {
        await this.fetchCollectionInformation();
        await this.fetchStyles();
        this.enableClustering();
        await this.firstLoad();
    }

    enableClustering() {
        if (this._collectionInformation.clusterColor !== "Unknown") {
            this._newModelClustering = true;
            this._viewer.camera.percentageChanged = 0.5;
            this._viewer.camera.changed.addEventListener(this.reCluster);
        }
    }

    async fetchCollectionInformation() {
        const collectionInformation = await this.fetchJson(this._url, {
            f: "json"
        });
        if (collectionInformation == null) {
            return;
        }
        this._collectionInformation.title = collectionInformation.title;
        if (collectionInformation.preview != null) {
            this._collectionInformation.clusterColor = collectionInformation.preview.groupColor
                ? collectionInformation.preview.groupColor
                : this._collectionInformation.clusterColor;
            this._collectionInformation.propertyKey = Object.keys(collectionInformation.preview.properties).find(
                key => collectionInformation.preview.properties[key] === "tooltip"
            ) as string;
        }

        for (let i = 0; i < collectionInformation.links.length; i++) {
            if (collectionInformation.links[i].rel == "items") {
                this._itemsLink = collectionInformation.links[i].href;

                // Find the InfoBox iframe, used to show selected entity information, and allow it to make popups that escape the sandbox.
                const iframe = document.getElementsByClassName("cesium-infoBox-iframe")[0] as HTMLIFrameElement;
                if (
                    iframe.getAttribute("sandbox") !=
                    "allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
                ) {
                    iframe.setAttribute(
                        "sandbox",
                        "allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
                    );
                    (iframe as HTMLIFrameElement).src += "";
                }

                break;
            }
        }

        this._collectionInformation.defaultStyle = collectionInformation.defaultStyle
            ? collectionInformation.defaultStyle
            : this._collectionInformation.defaultStyle;

        this._collectionInformation.isLive = collectionInformation.live ? true : false;
        this._update = this._collectionInformation.isLive;
    }

    async fetchStyles() {
        const links = await this.fetchJson(this._url, { f: "json" });
        let url = "";
        if (links.styles == null) {
            this.clustering.enabled = true;
            styleDefaultClusters(this, this._viewer);
            styleGeoJsonBillboard(this, this._viewer);
            return null;
        }
        for (const style of links.styles) {
            style.links.forEach(function (link: { [key: string]: string }) {
                if (link.type === "application/json") {
                    url = link.href;
                }
            });
            if (url !== "") break;
        }
        let tdd = null;
        try {
            tdd = await this.fetchJson(url.split("?")[0], { f: "3dd" });
        } catch (err) {
            styleDefaultClusters(this, this._viewer);
            styleGeoJsonBillboard(this, this._viewer);
            return null;
        }
        this._userStylesArray = [];
        let count = 0;
        tdd.StyledLayerDescriptor.NamedLayer.UserStyle.forEach((UserStyle: UserStyle, index: number) => {
            count++;
            const styleName = UserStyle.Name
                ? UserStyle.Name
                : `${tdd.StyledLayerDescriptor.NamedLayer.Name} Style ${count}`;
            this._userStylesArray.push({ index: index, name: styleName as string, dataSource: this });
        });
        this._userStylesCount = this._userStylesArray.length;
        if (this._userStylesCount == 0) {
            this.clustering.enabled = true;
            styleDefaultClusters(this, this._viewer);
            styleGeoJsonBillboard(this, this._viewer);
        }
        this._tdd = tdd;
    }

    async firstLoad() {
        this._isLoading = true;
        this._loading.raiseEvent([this, true]);
        await this.getFeaturesArray(this._bbox, true);
        if (!this._features) {
            return;
        }
        if (
            this._newModelClustering &&
            (this._viewer.scene.camera.positionCartographic.height > CLUSTER_HEIGHT_CONSTANT ||
                this._features.length > 2000)
        ) {
            this._fastFeatureClusters = new FastFeatureClusters(this._viewer, this._features);
            this._renderedFeatureIdSet = this._fastFeatureClusters.renderedFeatures();
            this._entityCollection.suspendEvents();
            this.fastClusterRenderLoop();
            this._entityCollection.resumeEvents();
            this._isLoading = false;
            this._loading.raiseEvent([this, false]);
            this._isLoaded = true;
            return;
        }
        this._entityCollection.suspendEvents();
        this.renderLoop(this._features);
        this._entityCollection.resumeEvents();
        this._isLoading = false;
        this._loading.raiseEvent([this, false]);
        this._isLoaded = true;
    }

    async updateService(id: number | null): Promise<void> {
        if (!this._isLoaded) {
            return;
        }
        await this.getFeaturesArray(this._bbox, false, id);
        const rawFeaturesArray = this._features;
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
        this._isLoading = false;
        this._loading.raiseEvent([this, false]);
        this.updateLoop(rawFeaturesArray);
        return;
    }

    async getFeaturesArray(bboxTotal: BBox, keyFrame: boolean, id?: number | null) {
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
            this._frame += 1;
            if (this._frame >= FEATURES_KEYFRAME_INTERVAL) {
                this._frame = 0;
                keyFrame = true;
            }
            let datetimeString = "";
            if (!keyFrame && this._lastTimestamp) {
                const date = new Date(this._lastTimestamp);
                // Hack to account for DBWMS taking time to populate materialized view
                date.setMinutes(date.getMinutes() - 1);
                datetimeString = date.toISOString() + "/..";
            }
            const params = {
                f: "json",
                limit: 100000,
                bbox: bboxString,
                ...(datetimeString ? { datetime: datetimeString } : {})
            };
            const partialRawFeaturesJson = await this.fetchJson(`${this._url}items`, params);
            if (partialRawFeaturesJson != null) {
                if (partialRawFeaturesJson.features != null) {
                    partialRawFeaturesJson.features.forEach((ogcFeature: OGCFeature) => {
                        rawFeaturesArray.push(ogcFeature);
                    });
                }

                const timestamp = partialRawFeaturesJson.timeStamp;

                if (timestamp) {
                    const parsed = new Date(timestamp);
                    // https://stackoverflow.com/a/52869830
                    if (!(parsed instanceof Date && !isNaN(parsed.getTime()) && parsed.toISOString() === timestamp)) {
                        console.error(
                            `Unable to delta-poll service ${this._collectionInformation.title}: Invalid timestamp in features response: ${timestamp}`
                        );
                    } else {
                        this._lastTimestamp = partialRawFeaturesJson.timeStamp;
                    }
                }
            }
        }
        this.lastRawFeaturesArray = rawFeaturesArray;
        if (keyFrame) {
            this._features = rawFeaturesArray;
        } else {
            this._features = this._features.concat(rawFeaturesArray);
        }
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
        const billboardImage = clusterCanvas.getContext("2d");
        if (!billboardImage || !cluster.billboard) {
            return;
        }
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
        cluster.billboard.image = new ConstantProperty(clusterCanvas);
        cluster.billboard.width = CLUSTER_WIDTH;
        cluster.billboard.height = CLUSTER_HEIGHT;
        //cluster.billboard!.disableDepthTestDistance = POSTIVE_INFINITY_PROPERTY;
        cluster.billboard.show = TRUE_PROPERTY;
        if (this._viewer.scene.mode === SceneMode.SCENE3D) {
            cluster.billboard.heightReference = HEIGHT_REFERENCE_CLAMP_TO_GROUND;
        }
        cluster.billboard.verticalOrigin = VERTICAL_ORIGIN_BOTTOM;
        cluster.billboard.eyeOffset = new ConstantProperty(new Cartesian3(0, 0, -CLUSTER_HEIGHT_CONSTANT));
    }

    async fastClusterRenderLoop() {
        if (this._fastFeatureClusters == null) {
            return;
        }
        const clusterSet = this._fastFeatureClusters.clusters();
        clusterSet.forEach(ogcFeature => {
            const location = this.getLocation(ogcFeature);
            const cluster = this.createFastClusteredClusterEntity(location as Cartesian3);
            this._renderedClusterSet.add(cluster);
            this.styleFastCluster(cluster, ogcFeature);
            this._entityCollection.add(cluster);
        });
        const featuresToBeRenderedMap = this._fastFeatureClusters.renderedFeatureMap();
        this._renderedFeatureIdSet.forEach(async featureId => {
            const ogcFeature = featuresToBeRenderedMap.get(featureId) as OGCFeature;
            const location = this.getLocation(ogcFeature);
            const matchedStyles: Rule[][] = [];
            if (this._tdd?.StyledLayerDescriptor?.NamedLayer?.UserStyle != null) {
                this._tdd.StyledLayerDescriptor.NamedLayer.UserStyle.forEach((userStyle: UserStyle) => {
                    matchedStyles.push(getTddRuleMatches(ogcFeature, userStyle));
                });
            }
            const feature = this.createFeature(ogcFeature, location as Cartesian3);
            this._renderedFeatureIdSet.add(feature.id);
            this.styleFeature(feature, ogcFeature, location as Cartesian3, matchedStyles);
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
        featureIdsToRenderSet?.forEach(async featureId => {
            let feature = this._entityCollection.getById(featureId);
            if (!feature && this._renderedFeatureIdSet.has(featureId)) {
                console.log(t("featuresDatasourceFastClusterUpdateLoopError1", [featureId]));
                return;
            }
            if (featureIdsToJsonMap == null) {
                console.log(t("featuresDatasourceFastClusterUpdateLoopError2"));
                return;
            }
            const ogcFeature = featureIdsToJsonMap.get(featureId);
            if (ogcFeature == null) {
                console.log(t("featuresDatasourceFastClusterUpdateLoopError3"));
                return;
            }
            const location = this.getLocation(ogcFeature);
            if (!(location instanceof Cartesian3)) {
                console.log(t("featuresDatasourceFastClusterUpdateLoopError4"));
                return;
            }
            const matchedStyles: Rule[][] = [];
            if (this._tdd?.StyledLayerDescriptor?.NamedLayer?.UserStyle != null) {
                this._tdd.StyledLayerDescriptor.NamedLayer.UserStyle.forEach((userStyle: UserStyle) => {
                    matchedStyles.push(getTddRuleMatches(ogcFeature, userStyle));
                });
            }
            if (feature) {
                this.updateFeatureLocation(feature, location);
                this.updateFeatureStyle(feature, ogcFeature, location);
                newRenderedFeatureIdSet.add(featureId);
                this._renderedFeatureIdSet.delete(featureId);
                return;
            } else {
                feature = this.createFeature(ogcFeature, location);
                this.styleFeature(feature, ogcFeature, location, matchedStyles);
                newRenderedFeatureIdSet.add(featureId);
                this._entityCollection.add(feature);
            }
        });
        this._renderedFeatureIdSet.forEach(featureId => {
            this._entityCollection.removeById(featureId);
        });
        this._renderedFeatureIdSet = newRenderedFeatureIdSet;
        if (this._fastFeatureClusters == null) {
            return;
        }
        const clusterSet = this._fastFeatureClusters.clusters();
        clusterSet.forEach(ogcFeature => {
            const location = this.getLocation(ogcFeature);
            const cluster = this.createFastClusteredClusterEntity(location as Cartesian3);
            this._renderedClusterSet.add(cluster);
            this.styleFastCluster(cluster, ogcFeature);
            this._entityCollection.add(cluster);
        });
    }

    renderLoop(ogcFeaturesArray: Array<OGCFeature>) {
        this.setDistCond();
        ogcFeaturesArray.forEach(async ogcFeature => {
            const location = this.getLocation(ogcFeature);
            const matchedStyles: Rule[][] = [];
            if (this._tdd?.StyledLayerDescriptor?.NamedLayer?.UserStyle != null) {
                this._tdd.StyledLayerDescriptor.NamedLayer.UserStyle.forEach((userStyle: UserStyle) => {
                    matchedStyles.push(getTddRuleMatches(ogcFeature, userStyle));
                });
            }
            const feature = this.createFeature(ogcFeature, location as Cartesian3);
            if (feature.polygon) {
                this.createPolygonOutline(feature);
            }
            this.styleFeature(feature, ogcFeature, location as Cartesian3, matchedStyles);
            this._renderedFeatureIdSet.add(feature.id);
            this._entityCollection.add(feature);
        });
    }

    async updateLoop(ogcFeaturesArray: OGCFeature[]) {
        this.setDistCond();
        this._renderedClusterSet.forEach(cluster => {
            this._entityCollection.remove(cluster);
        });
        this._renderedClusterSet.clear();
        ogcFeaturesArray.forEach(async ogcFeature => {
            const location = this.getLocation(ogcFeature);
            let feature = this._entityCollection.getById(ogcFeature.id);
            if (!feature) {
                const matchedStyles: Rule[][] = [];
                if (this._tdd?.StyledLayerDescriptor?.NamedLayer?.UserStyle != null) {
                    this._tdd.StyledLayerDescriptor.NamedLayer.UserStyle.forEach((userStyle: UserStyle) => {
                        matchedStyles.push(getTddRuleMatches(ogcFeature, userStyle));
                    });
                }
                feature = this.createFeature(ogcFeature, location as Cartesian3);
                this._renderedFeatureIdSet.add(feature.id);
                this._entityCollection.add(feature);
                this.styleFeature(feature, ogcFeature, location as Cartesian3, matchedStyles);
                return;
            }
            this.updateFeatureLocation(feature, location as Cartesian3);
            this.updateFeatureStyle(feature, ogcFeature, location as Cartesian3);
            return;
        });
    }

    removeFeatures(ogcFeaturesArray: OGCFeature[]) {
        this._entityCollection.values.forEach(entity => {
            if (ogcFeaturesArray.find(ogcFeature => ogcFeature.id === entity.id) == null) {
                this._renderedFeatureIdSet.delete(entity.id);
                this._entityCollection.remove(entity);
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
        const billboardImage = clusterCanvas.getContext("2d");
        if (!billboardImage || !clusterEntity.billboard) {
            return;
        }
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

    createPolygonOutline(feature: Entity) {
        console.log(feature.polygon?.hierarchy);
        const lines = (feature.polygon?.hierarchy as unknown as PolygonHierarchy).positions;
        for (const line in lines) {
            console.log(line);
        }
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

    styleFeature(feature: Entity, rawFeature: OGCFeature, location: Cartesian3, matchedStyles: Rule[][]) {
        const matchedRules = matchedStyles[this._userStyle];
        if (feature.properties && feature.properties.hasBeenStyled) {
            this.updateFeatureStyle(feature, rawFeature, location);
            return;
        }
        this.addFeatureInfo(feature, rawFeature, location, matchedStyles);
        if (!this._userStylesCount || !matchedRules.length) {
            this.fallbackStyles(feature, location);
            return;
        }
        const pointMatches = matchedRules.filter(rule => rule.PointSymbolizer != null);
        if (pointMatches.length > 0) {
            const modelMatches = pointMatches.filter(rule => rule.PointSymbolizer?.Model != null);
            if (modelMatches.length > 0) {
                const model = new ModelGraphics();
                for (let i = 0; i < modelMatches.length; i++) {
                    if (modelMatches[i]?.PointSymbolizer != null) {
                        this.addModelGraphics(model, modelMatches[i].PointSymbolizer as PointSymbolizer, feature);
                        if (modelMatches[i].PointSymbolizer?.Model?.Orientation != null) {
                            this.updateModelOrientation(
                                feature,
                                modelMatches[i].PointSymbolizer as PointSymbolizer,
                                location
                            );
                        }
                    }
                }
                feature.model = model;
                if (feature.model.uri == null) {
                    console.warn("Model added with invalid uri.");
                }
            }
            const billboardMatches = pointMatches.filter(rule => rule.PointSymbolizer?.Billboard != null);
            const labelMatches = pointMatches.filter(rule => rule.PointSymbolizer?.Label != null);
            if (billboardMatches.length > 0 && labelMatches.length > 0) {
                const props: BLProps = {};
                for (let i = 0; i < billboardMatches.length; i++) {
                    if (billboardMatches[i].PointSymbolizer != null) {
                        if (billboardMatches[i].PointSymbolizer?.Billboard != null) {
                            this.getBillboardProperties(
                                props,
                                billboardMatches[i].PointSymbolizer?.Billboard as Billboard
                            );
                        }
                    }
                }
                for (let i = 0; i < labelMatches.length; i++) {
                    if (labelMatches[i].PointSymbolizer != null) {
                        this.getLabelProperties(props, feature, labelMatches[i].PointSymbolizer?.Label as Label);
                    }
                }

                const canv = this.buildLabelBillboardCanvas(props);
                const billyB = new BillboardGraphics();
                billyB.image = new ConstantProperty(canv);
                if (props["scale"] != null) {
                    billyB.scale = new ConstantProperty(props["scale"]);
                }
                if (props["distanceDisplayCondition"] != null) {
                    billyB.distanceDisplayCondition = new ConstantProperty(props["distanceDisplayCondition"]);
                }
                if (props["eyeOffset"] != null) {
                    billyB.eyeOffset = new ConstantProperty(props["eyeOffset"]);
                }
                billyB.show = TRUE_PROPERTY;
                billyB.verticalOrigin = VERTICAL_ORIGIN_BOTTOM;
                if (this._viewer.scene.mode === SceneMode.SCENE3D) {
                    billyB.heightReference = HEIGHT_REFERENCE_CLAMP_TO_GROUND;
                }
                billyB.disableDepthTestDistance = new ConstantProperty(8000000);
                feature.billboard = billyB;
            } else {
                if (billboardMatches.length > 0) {
                    const billboard = new BillboardGraphics();
                    for (let i = 0; i < billboardMatches.length; i++) {
                        this.addFeatureBillboard(billboard, billboardMatches[i].PointSymbolizer as PointSymbolizer);
                    }
                    feature.billboard = billboard;
                }
                if (labelMatches.length > 0) {
                    const label = new LabelGraphics();
                    for (let i = 0; i < labelMatches.length; i++) {
                        this.addFeatureLabel(label, feature, labelMatches[i].PointSymbolizer as PointSymbolizer);
                    }
                    feature.label = label;
                }
            }
        }
        const lineMatches = matchedRules.filter(rule => rule.LineSymbolizer != null);
        if (lineMatches.length > 0 && feature.polyline) {
            this.addPolyLineGraphics(feature, lineMatches);
        }
        const polygonMatches = matchedRules.filter(rule => rule.PolygonSymbolizer != null);
        if (polygonMatches.length > 0 && feature.polygon) {
            this.addPolygonGraphics(feature, polygonMatches[0].PolygonSymbolizer as PolygonSymbolizer);
        }
        feature.properties?.addProperty("hasBeenStyled", true);
    }

    buildLabelBillboardCanvas(props: BLProps) {
        const id = `${props["image"]}${props["text"]}`;
        const canv = this._canvasCache[id];
        if (defined(canv)) {
            return canv;
        }
        const canvas: HTMLCanvasElement = document.createElement("CANVAS") as HTMLCanvasElement;
        canvas.width = props["width" as keyof BLProps] ? Number(props["width" as keyof BLProps]) : 32;
        canvas.height = props["height" as keyof BLProps] ? Number(props["height" as keyof BLProps]) : 32;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return canvas;
        }
        ctx.font = `${(props["font"] as { [key: string]: string })["size"]}px ${
            (props["font"] as { [key: string]: string })["family"]
        }`;
        ctx.strokeStyle = Color.fromBytes(
            (props["fillColor"] as RGBA)[0],
            (props["fillColor"] as RGBA)[1],
            (props["fillColor"] as RGBA)[2],
            (props["fillColor"] as RGBA)[3]
        ).toCssColorString();
        ctx.fillStyle = Color.fromBytes(
            (props["outlineColor"] as RGBA)[0],
            (props["outlineColor"] as RGBA)[1],
            (props["outlineColor"] as RGBA)[2],
            (props["outlineColor"] as RGBA)[3]
        ).toCssColorString();
        ctx.lineWidth = (props["outlineWidth"] as number) / 3;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(props["text"] as string, canvas.width / 2, canvas.height / 2);
        ctx.strokeText(props["text"] as string, canvas.width / 2, canvas.height / 2);
        const resource = (Resource as unknown as resource_fixed).createIfNeeded(props["image"] as string);
        const promise = resource.fetchImage();
        if (!promise) {
            return canvas;
        }
        promise.then(image => {
            this.drawImage(ctx, image as HTMLImageElement, canvas.width, canvas.height);
            this._canvasCache[id] = canvas;
            return canvas;
        });
        this._canvasCache[id] = promise as Promise<HTMLImageElement>;
        return promise;
    }

    drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
        ctx.globalCompositeOperation = "destination-over";
        ctx.drawImage(image, 0, 0, width, height);
    }

    getBillboardProperties(props: BLProps, billboard: Billboard) {
        if (billboard.Image != null) {
            (props as { [key: string]: string | number })["image"] = billboard.Image as string;
        }
        if (billboard.Scale != null) {
            (props as { [key: string]: string | number })["scale"] = billboard.Scale;
        }
        if (billboard.DistanceDisplayCondition != null) {
            (props as { [key: string]: { near: number; far: number } })["distanceDisplayCondition"] =
                new DistanceDisplayCondition(
                    billboard.DistanceDisplayCondition.Near,
                    billboard.DistanceDisplayCondition.Far
                );
        }
        if (billboard.EyeOffset != null) {
            props["eyeOffset"] = new Cartesian3(
                billboard.EyeOffset.Height,
                billboard.EyeOffset.Width,
                billboard.EyeOffset.Height
            );
        }
    }

    getLabelProperties(props: BLProps, feature: Entity, label: Label) {
        if (label.Text != null) {
            if (Object.prototype.hasOwnProperty.call(label.Text, "PropertyName")) {
                if (feature.properties != null) {
                    props["text"] =
                        feature.properties[(label.Text as { PropertyName: string }).PropertyName].getValue();
                }
            } else {
                props["text"] = label.Text as string;
            }
        }
        if (label.Font != null) {
            props["font"] = label.Font;
        }
        if (label.BackgroundColor != null) {
            props["backgroundColor"] = label.BackgroundColor;
        }
        if (label.FillColor != null) {
            props["fillColor"] = label.FillColor;
        }
        if (label.OutlineColor != null) {
            props["outlineColor"] = label.OutlineColor;
        }
        if (label.OutlineWidth != null) {
            props["outlineWidth"] = label.OutlineWidth;
        }
    }

    addFeatureBillboard(billboard: BillboardGraphics, pointSymbolizer: PointSymbolizer) {
        if (pointSymbolizer.Billboard == null) {
            return;
        }
        billboard.image = new ConstantProperty(pointSymbolizer.Billboard.Image);
        billboard.scale = new ConstantProperty(pointSymbolizer.Billboard.Scale);
        if (pointSymbolizer.Billboard.DistanceDisplayCondition != null) {
            billboard.distanceDisplayCondition = new ConstantProperty(
                new DistanceDisplayCondition(
                    pointSymbolizer.Billboard.DistanceDisplayCondition.Near,
                    pointSymbolizer.Billboard.DistanceDisplayCondition.Far
                )
            );
        }
        billboard.eyeOffset = new ConstantProperty(new Cartesian3(0, 0, 500));
        billboard.verticalOrigin = VERTICAL_ORIGIN_BOTTOM;
        if (this._viewer.scene.mode === SceneMode.SCENE3D) {
            billboard.heightReference = HEIGHT_REFERENCE_CLAMP_TO_GROUND;
        }
        billboard.disableDepthTestDistance = new ConstantProperty(80000000);
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
        feature.position = location as unknown as PositionProperty;
        return feature;
    }
    updatePolyLineLocation(location: ConstantProperty, feature: Entity) {
        if (feature.polyline == null) {
            return feature;
        }
        feature.polyline.positions = location;
        return feature;
    }
    updatePolygonLocation(location: PolygonHierarchy, feature: Entity) {
        if (feature.polygon == null) {
            return feature;
        }
        feature.polygon.hierarchy = location as unknown as Property;
        return feature;
    }

    updateFeatureStyle(feature: Entity, rawFeature: OGCFeature, location: Cartesian3) {
        const matchedStyles = feature.properties?.matchedStyles?.getValue();
        const matchedRules = matchedStyles ? matchedStyles[this._userStyle] : undefined;
        this.addFeatureInfo(feature, rawFeature, location, matchedStyles);
        if (!this._userStylesCount || !matchedRules.length) {
            this.fallbackStyles(feature, location);
            return;
        }
        const modelMatches = matchedRules.filter(
            (rule: { PointSymbolizer: { Model: { Orientation: null } } }) =>
                rule.PointSymbolizer?.Model?.Orientation != null
        );
        if (modelMatches.length > 0) {
            this.updateModelOrientation(feature, modelMatches[0].PointSymbolizer, location);
        }
        return;
    }

    setDistCond() {
        this.depthDistCond = new ConstantProperty(this._viewer.camera.positionCartographic.height + 6178137);
    }

    fallbackStyles(feature: Entity, location: Cartesian3) {
        if (feature.position) {
            feature.billboard = new BillboardGraphics();
            feature.billboard.show = TRUE_PROPERTY;
            feature.billboard.disableDepthTestDistance = this.depthDistCond;
            feature.billboard.image = new ConstantProperty("./Icons/PinRed.png");
            feature.billboard.height = new ConstantProperty(28);
            feature.billboard.width = new ConstantProperty(19);
        }
        if (feature.polyline) {
            feature.polyline.material = new ColorMaterialProperty(Color.RED);
            feature.polyline.width = TWO_PROPERTY;
            feature.polyline.show = TRUE_PROPERTY;
        }
        if (feature.polygon) {
            feature.polygon.material = new ColorMaterialProperty(Color.fromAlpha(Color.RED, 0.5));
            feature.polygon.outline = TRUE_PROPERTY;
            feature.polygon.outlineColor = BLUE_PROPERTY;
            feature.polygon.outlineWidth = TWO_PROPERTY;
        }
        location;
    }

    addFeatureInfo(
        feature: Entity,
        rawFeature: OGCFeature,
        location: Cartesian3 | null = null,
        matchedStyles: Rule[][]
    ) {
        if (rawFeature.properties) {
            feature.properties = new PropertyBag();
            for (const key in rawFeature.properties) {
                if ({}.hasOwnProperty.call(rawFeature.properties, key)) {
                    feature.properties.addProperty(key, rawFeature.properties[key]);
                }
            }
            feature.properties.addProperty("json", rawFeature);
            if (matchedStyles?.length && !feature.properties.hasProperty("matchedStyles")) {
                feature.properties.addProperty("matchedStyles", matchedStyles);
            }
            if (location) {
                feature.properties.addProperty("cartesian3Location", location);
            }
            feature.properties.addProperty("itemsLink", this._itemsLink);
        }
    }

    restyle() {
        this._entityCollection.removeAll();
        this.firstLoad();
    }

    addFeatureLabel(label: LabelGraphics, feature: Entity, pointSymbolizer: PointSymbolizer) {
        if (pointSymbolizer.Label == null) {
            console.error("Label Symbolizer is null");
            return;
        }
        if (pointSymbolizer.Label.Text != null) {
            if (Object.prototype.hasOwnProperty.call(pointSymbolizer.Label.Text, "PropertyName")) {
                if (feature.properties != null) {
                    label.text =
                        feature.properties[
                            (pointSymbolizer.Label.Text as { PropertyName: string }).PropertyName
                        ].getValue();
                }
            } else {
                label.text = new ConstantProperty(pointSymbolizer.Label.Text);
            }
        }
        if (pointSymbolizer.Label.Font != null) {
            label.font = new ConstantProperty(
                `${pointSymbolizer.Label.Font.Size}px ${pointSymbolizer.Label.Font.Family}`
            );
        }
        if (pointSymbolizer.Label.FillColor != null) {
            label.fillColor = new ConstantProperty(
                Color.fromBytes(
                    pointSymbolizer.Label.FillColor[0],
                    pointSymbolizer.Label.FillColor[1],
                    pointSymbolizer.Label.FillColor[2],
                    pointSymbolizer.Label.FillColor[3]
                )
            );
        }
        if (pointSymbolizer.Label.OutlineColor != null) {
            label.outlineColor = new ConstantProperty(
                Color.fromBytes(
                    pointSymbolizer.Label.OutlineColor[0],
                    pointSymbolizer.Label.OutlineColor[1],
                    pointSymbolizer.Label.OutlineColor[2],
                    pointSymbolizer.Label.OutlineColor[3]
                )
            );
        }
        if (pointSymbolizer.Label.OutlineWidth != null) {
            label.outlineWidth = new ConstantProperty(pointSymbolizer.Label.OutlineWidth);
        }
        if (pointSymbolizer.Label.DistanceDisplayCondition != null) {
            label.distanceDisplayCondition = new ConstantProperty(
                new DistanceDisplayCondition(
                    pointSymbolizer.Label.DistanceDisplayCondition.Near,
                    pointSymbolizer.Label.DistanceDisplayCondition.Far
                )
            );
        }
        label.eyeOffset = new ConstantProperty(new Cartesian3(0, 0, -500));
        label.verticalOrigin = VERTICAL_ORIGIN_BOTTOM;
        if (this._viewer.scene.mode === SceneMode.SCENE3D) {
            label.heightReference = HEIGHT_REFERENCE_CLAMP_TO_GROUND;
        }
        label.disableDepthTestDistance = new ConstantProperty(80000000);
    }

    addModelGraphics(model: ModelGraphics, pointSymbolizer: PointSymbolizer, feature: Entity) {
        if (pointSymbolizer.Model == null) {
            return;
        }
        if (pointSymbolizer.Model.Url != null) {
            model.uri = new ConstantProperty(pointSymbolizer.Model.Url);
        }
        if (pointSymbolizer.Model.Shadows != null) {
            let shadows = ShadowMode.DISABLED;
            switch (pointSymbolizer.Model.Shadows) {
                case "DISABLED":
                    shadows = ShadowMode.DISABLED;
                    break;
                case "ENABLED":
                    shadows = ShadowMode.ENABLED;
                    break;
                case "CAST_ONLY":
                    shadows = ShadowMode.CAST_ONLY;
                    break;
                case "RECEIVE_ONLY":
                    shadows = ShadowMode.RECEIVE_ONLY;
                    break;
            }
            model.shadows = new ConstantProperty(shadows);
        }
        if (pointSymbolizer.Model.SilhouetteColor != null) {
            const silhouetteColor = Color.fromBytes(
                pointSymbolizer.Model.SilhouetteColor[0],
                pointSymbolizer.Model.SilhouetteColor[1],
                pointSymbolizer.Model.SilhouetteColor[2],
                pointSymbolizer.Model.SilhouetteColor[3]
            );
            model.silhouetteColor = new ConstantProperty(silhouetteColor);
        }
        if (pointSymbolizer.Model.SilhouetteSize != null) {
            const silhouetteSize = pointSymbolizer.Model.SilhouetteSize;
            model.silhouetteSize = new ConstantProperty(silhouetteSize);
        }
        if (pointSymbolizer.Model.Color != null) {
            const color = Color.fromBytes(
                pointSymbolizer.Model.Color[0],
                pointSymbolizer.Model.Color[1],
                pointSymbolizer.Model.Color[2],
                pointSymbolizer.Model.Color[3]
            );
            model.color = new ConstantProperty(color);
        }
        if (pointSymbolizer.Model.ColorBlendMode != null) {
            let colorBlendMode = ColorBlendMode.HIGHLIGHT;
            switch (pointSymbolizer.Model.ColorBlendMode) {
                case "HIGHLIGHT":
                    colorBlendMode = ColorBlendMode.HIGHLIGHT;
                    break;
                case "MIX":
                    colorBlendMode = ColorBlendMode.MIX;
                    break;
                case "REPLACE":
                    colorBlendMode = ColorBlendMode.REPLACE;
                    break;
            }
            model.colorBlendMode = new ConstantProperty(colorBlendMode);
        }
        if (pointSymbolizer.Model.ColorBlendAmount != null) {
            const colorBlendAmount = pointSymbolizer.Model.ColorBlendAmount;
            model.colorBlendAmount = new ConstantProperty(colorBlendAmount);
        }
        if (pointSymbolizer.Model.LightColor != null) {
            const lightColor = Color.fromBytes(
                pointSymbolizer.Model.LightColor[0],
                pointSymbolizer.Model.LightColor[1],
                pointSymbolizer.Model.LightColor[2],
                pointSymbolizer.Model.LightColor[3]
            );
            model.lightColor = new ConstantProperty(lightColor);
        }
        if (pointSymbolizer.Model.Scale != null) {
            const styleScale = pointSymbolizer.Model.Scale;
            let scale;
            if (typeof styleScale === "object" && Object.prototype.hasOwnProperty.call(styleScale, "PropertyName")) {
                if (feature.properties != null) {
                    scale = parseInt(
                        feature.properties[(styleScale as { PropertyName: string }).PropertyName].getValue()
                    );
                }
            } else if (typeof styleScale === "number") {
                scale = styleScale;
            }
            if (scale != undefined) {
                model.scale = new ConstantProperty(scale);
            }
        }
        if (pointSymbolizer.Model.MaximumScale != null) {
            const maximumScale = pointSymbolizer.Model.MaximumScale;
            model.maximumScale = new ConstantProperty(maximumScale);
        }
        if (pointSymbolizer.Model.MinimumPixelSize != null) {
            const minimumPixelSize = pointSymbolizer.Model.MinimumPixelSize;
            model.minimumPixelSize = new ConstantProperty(minimumPixelSize);
        } else {
            model.minimumPixelSize = new ConstantProperty(80);
        }
        if (pointSymbolizer.Model.DistanceDisplayCondition != null) {
            model.distanceDisplayCondition = new ConstantProperty(
                new DistanceDisplayCondition(
                    pointSymbolizer.Model.DistanceDisplayCondition.Near,
                    pointSymbolizer.Model.DistanceDisplayCondition.Far
                )
            );
        }
        model.heightReference = HEIGHT_REFERENCE_RELATIVE_TO_GROUND;
        model.show = TRUE_PROPERTY;
    }

    updateModelOrientation(feature: Entity, pointSymbolizer: PointSymbolizer, location: Cartesian3) {
        if (pointSymbolizer.Model?.Orientation) {
            let yaw = parseInt(pointSymbolizer.Model.Orientation.Yaw as string);
            let pitch = parseInt(pointSymbolizer.Model.Orientation.Pitch as string);
            let roll = parseInt(pointSymbolizer.Model.Orientation.Roll as string);
            if (feature.properties != null) {
                if (isNaN(yaw)) {
                    if (feature.properties != null) {
                        yaw =
                            feature.properties[
                                (pointSymbolizer.Model.Orientation.Yaw as PropertyLookup).PropertyName
                            ].getValue();
                    }
                }
                if (isNaN(pitch)) {
                    pitch =
                        feature.properties[
                            (pointSymbolizer.Model.Orientation.Pitch as PropertyLookup).PropertyName
                        ].getValue();
                }
                if (isNaN(roll)) {
                    roll =
                        feature.properties[
                            (pointSymbolizer.Model.Orientation.Roll as PropertyLookup).PropertyName
                        ].getValue();
                }
            }
            const hpr = new HeadingPitchRoll(
                CesiumMath.toRadians(yaw),
                CesiumMath.toRadians(pitch),
                CesiumMath.toRadians(roll)
            );
            feature.orientation = new ConstantProperty(Transforms.headingPitchRollQuaternion(location, hpr));
        }
    }

    addPolyLineGraphics(feature: Entity, matchedRules: Rule[]) {
        matchedRules;
        feature;
        // if (!matchedRules[0].lineSymbolizers.length) {
        //     return;
        // }
        // feature.polyline!.material = matchedRules[0].lineSymbolizers[0].material;
        // feature.polyline!.width = new ConstantProperty(matchedRules[0].lineSymbolizers[0].width);
        // feature.polyline!.clampToGround = TRUE_PROPERTY;
    }

    addPolygonGraphics(feature: Entity, polygonSymbolizer: PolygonSymbolizer) {
        if (!feature.polygon) {
            return;
        }
        const extrudedHeight = polygonSymbolizer.ExtrudedHeight ? polygonSymbolizer.ExtrudedHeight : undefined;
        const textureRotation = polygonSymbolizer.TextureRotation ? polygonSymbolizer.TextureRotation : 0;
        const fill = polygonSymbolizer.Fill ? polygonSymbolizer.Fill : false;
        let material;
        if (polygonSymbolizer.Material && (polygonSymbolizer.Material as MaterialColor).Color) {
            material = new ColorMaterialProperty(
                Color.fromBytes(
                    (polygonSymbolizer.Material as MaterialColor).Color[0],
                    (polygonSymbolizer.Material as MaterialColor).Color[1],
                    (polygonSymbolizer.Material as MaterialColor).Color[2],
                    (polygonSymbolizer.Material as MaterialColor).Color[3]
                )
            );
        } else if (
            polygonSymbolizer.Material &&
            (polygonSymbolizer.Material as MaterialProperty).MaterialProperty &&
            ((polygonSymbolizer.Material as MaterialProperty).MaterialProperty as MaterialImage).MaterialImage
        ) {
            material = new ImageMaterialProperty({
                image: ((polygonSymbolizer.Material as MaterialProperty).MaterialProperty as MaterialImage)
                    .MaterialImage.Image,
                repeat: new Cartesian2(
                    (
                        (polygonSymbolizer.Material as MaterialProperty).MaterialProperty as MaterialImage
                    ).MaterialImage.Repeat.x,
                    (
                        (polygonSymbolizer.Material as MaterialProperty).MaterialProperty as MaterialImage
                    ).MaterialImage.Repeat.y
                )
            });
        }
        const outline = polygonSymbolizer.Outline ? polygonSymbolizer.Outline : false;
        let outlineColor;
        if (polygonSymbolizer.OutlineColor != null) {
            outlineColor = Color.fromBytes(
                polygonSymbolizer.OutlineColor[0],
                polygonSymbolizer.OutlineColor[1],
                polygonSymbolizer.OutlineColor[2],
                polygonSymbolizer.OutlineColor[3]
            );
        }
        const outlineWidth = polygonSymbolizer.OutlineWidth ? polygonSymbolizer.OutlineWidth : undefined;
        const closeTop = polygonSymbolizer.CloseTop ? polygonSymbolizer.CloseTop : false;
        const closeBottom = polygonSymbolizer.CloseBottom ? polygonSymbolizer.CloseBottom : false;
        let shadows;
        if (polygonSymbolizer.Shadows != null) {
            switch (polygonSymbolizer.Shadows) {
                case "DISABLED":
                    shadows = ShadowMode.DISABLED;
                    break;
                case "ENABLED":
                    shadows = ShadowMode.ENABLED;
                    break;
                case "CAST_ONLY":
                    shadows = ShadowMode.CAST_ONLY;
                    break;
                case "RECEIVE_ONLY":
                    shadows = ShadowMode.RECEIVE_ONLY;
                    break;
            }
        }
        const zIndex = polygonSymbolizer.ZIndex ? polygonSymbolizer.ZIndex : undefined;
        if (extrudedHeight) {
            feature.polygon.extrudedHeight = new ConstantProperty(extrudedHeight);
        }
        feature.polygon.stRotation = new ConstantProperty(CesiumMath.toRadians(textureRotation));
        feature.polygon.fill = new ConstantProperty(fill);
        if (material) {
            feature.polygon.material = material;
        }
        if (outline) {
            feature.polygon.outline = new ConstantProperty(outline);
        }
        feature.polygon.outlineColor = new ConstantProperty(outlineColor);
        feature.polygon.outlineWidth = new ConstantProperty(outlineWidth);
        feature.polygon.closeTop = new ConstantProperty(closeTop);
        feature.polygon.closeBottom = new ConstantProperty(closeBottom);
        if (shadows) {
            feature.polygon.shadows = new ConstantProperty(shadows);
        }
        feature.polygon.zIndex = new ConstantProperty(zIndex);
        feature.polygon.heightReference = new ConstantProperty(HeightReference.RELATIVE_TO_GROUND);
    }
}
