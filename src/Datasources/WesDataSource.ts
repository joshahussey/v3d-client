import {
    Math as CesiumMath,
    Event as CesiumEvent,
    defined,
    DeveloperError,
    EntityCluster,
    EntityCollection,
    Rectangle,
    Resource,
    Viewer,
    CompositeEntityCollection,
    CustomDataSource
} from "cesium";
import { BBox } from "geojson";
import { UserStyleDefinition, ServiceInfo } from "../Types/types";
import { translate as t } from "../i18n/Translator";

const MOVEMENT_DELAY_MS = 50;

export default class WesDataSource extends CustomDataSource {
    _name: string;
    _description: string;
    _changed: CesiumEvent;
    _error: CesiumEvent;
    _isLoading: boolean;
    _loading: CesiumEvent;
    _isLoaded: boolean;
    _type: string;
    _entityCollection: EntityCollection | CompositeEntityCollection;
    _entityCluster: EntityCluster;
    _url: string;
    serviceInfo: ServiceInfo;
    _show: boolean;
    _viewer: Viewer;
    _scratchRectangle: Rectangle;
    _isInitialized: boolean;
    _isCancelledIdMap: Set<number>;
    _currentLoadId: number;
    _fetchRequestAbortController: AbortController;
    _removed: boolean;
    _bbox: BBox;
    _refreshCounterms: number;
    _previousBbox: BBox;
    _date: Date;
    _wasMoving: boolean;
    _newStop: boolean;
    _timeMovementStoppedms: number;
    _update: boolean;
    _userStylesArray: UserStyleDefinition[];
    _userStyle: number;
    _featureType: string;
    uid: string;
    idGenerator: Generator<number>;

    constructor(description: string, name: string, url: string, viewer: Viewer, uid: string, serviceInfo: ServiceInfo) {
        super();
        if (uid == null) {
            uid = name;
        }
        this._name = name;
        this._description = description;
        this._changed = new CesiumEvent();
        this._error = new CesiumEvent();
        this._isLoading = false;
        this._loading = new CesiumEvent();
        this._isLoaded = false;
        this._type = "";
        this._entityCollection = new EntityCollection(this);
        this._entityCluster = new EntityCluster();
        this._url = url.endsWith("/") ? url : `${url}/`;
        this.serviceInfo = serviceInfo;
        this._show = true;
        this._viewer = viewer;
        this._scratchRectangle = new Rectangle();
        this._isInitialized = false;
        this._isCancelledIdMap = new Set();
        this._currentLoadId = 0;
        this._fetchRequestAbortController = new AbortController();
        this._removed = false;
        this._bbox = [180, 90, -180, -90];
        this._previousBbox = [180, 90, -180, -90];
        this._refreshCounterms = 0;
        this._date = new Date();
        this._wasMoving = false;
        this._newStop = true;
        this._timeMovementStoppedms = 0;
        this._update = false;
        this._userStylesArray = [];
        this._userStyle = 0;
        this.idGenerator = this.loadCycleIdGenerator();
        this._featureType = "";
        this.uid = uid;

        Object.defineProperties(this, {
            name: {
                get: function () {
                    return this._name;
                }
            },

            changedEvent: {
                get: function () {
                    return this._changed;
                }
            },

            errorEvent: {
                get: function () {
                    return this._error;
                }
            },

            isLoading: {
                get: function () {
                    return this._isLoading;
                }
            },

            loadingEvent: {
                get: function () {
                    return this._loading;
                }
            },

            isLoaded: {
                get: function () {
                    return this._isLoaded;
                }
            },

            type: {
                get: function () {
                    return this._type;
                }
            },

            entities: {
                get: function () {
                    return this._entityCollection;
                }
            },

            clustering: {
                get: function () {
                    return this._entityCluster;
                },
                set: function (value) {
                    if (!defined(value)) {
                        throw new DeveloperError(t("wesDatasourceClusteringSetError1"));
                    }
                    this._entityCluster = value;
                }
            },

            url: {
                get: function () {
                    return this._url;
                },
                set: function (value) {
                    this._url = value;
                }
            },

            show: {
                get: function () {
                    return this._show;
                },
                set: function (value) {
                    this._show = value;
                    const collection = this._entityCollection;
                    const features = collection.values;
                    collection.suspendEvents();
                    for (let i = 0; i < features.length; i++) {
                        const feature = features[i];
                        feature.show = value;
                    }
                    collection.resumeEvents();
                },
                configurable: true
            },

            viewer: {
                get: function () {
                    return this._viewer;
                }
            }
        });
    }

    stop(): void {
        this._removed = true;
    }

    isCancelled(id: number): boolean {
        if (this._isCancelledIdMap.has(id)) {
            this._isCancelledIdMap.delete(id);
            return true;
        }
        return false;
    }

    /**
     * Determines if service is currently loading.
     *
     * @param {boolean} isLoading the boolean to set the value of this._isLoading to.
     * @returns void.
     */
    _setLoading(isLoading: boolean) {
        if (this._isLoading !== isLoading) {
            this._isLoading = isLoading;
            this._loading.raiseEvent([this, isLoading]);
        }
    }

    fetchJson(url: string, queryOptions: object) {
        if (!defined(url)) {
            throw t("wesDatasourceFetchJsonError1");
        }
        const signal = this._fetchRequestAbortController.signal;
        const options =
            queryOptions == null ? { url: url, signal } : { url: url, queryParameters: queryOptions, signal };
        return Resource.fetchJson(options);
    }

    /**
     * Sets necessary parameters for loading and suspends events.
     *
     * @returns {boolean} True if loading, false if not.
     */
    setForLoad(): boolean {
        if (this._isLoading) {
            return true;
        }
        this._setLoading(true);
        this._entityCollection.suspendEvents();
        return false;
    }

    /**
     * Removes loading parameters and resumes events.
     *
     * @param {boolean} value True if the datasource is to be marked as loaded. Null if the isLoaded value is to remain the same.
     * @returns {void}
     */
    doneLoad(value?: boolean): void {
        this._isLoaded = value ? true : this._isLoaded;
        this._setLoading(false);
        this._entityCollection.resumeEvents();
    }

    /**
     * Defines the bounding box for queries based on the viewable area.
     *
     * @returns {Array<number>} An array containing the viewer extents on the globe in degrees.
     */
    getViewerBoundingBoxDegrees(): BBox {
        const bbox = this._viewer.camera.computeViewRectangle(
            this._viewer.scene.globe.ellipsoid,
            this._scratchRectangle
        );
        if (bbox) {
            this._bbox = [
                Number(CesiumMath.toDegrees(bbox.west).toFixed(4)),
                Number(CesiumMath.toDegrees(bbox.south).toFixed(4)),
                Number(CesiumMath.toDegrees(bbox.east).toFixed(4)),
                Number(CesiumMath.toDegrees(bbox.north).toFixed(4))
            ]; //Top Corner Longitude, Top Corner Lattitude, Bottom corner Longitude, Bottom Corner Lattitude
        }
        return this._bbox;
    }

    initialize(intervalms = 30000) {
        if (!this._isInitialized) {
            this.getViewerBoundingBoxDegrees();
            this._refreshCounterms = this._date.getTime();
            this._isInitialized = true;
            this.loadService();
        }
        this.updateRequest(this.idGenerator as unknown as { next: () => number }, intervalms);
    }

    updateRequest(idGenerator: { next: () => number }, intervalms: number) {
        if (this._removed) {
            return;
        }
        let shouldRenderAfterMovement = false;
        const currentTimems = Date.now();
        const refreshIntervalms = currentTimems - this._refreshCounterms;
        this.getViewerBoundingBoxDegrees();
        const hasBoundingBoxChange = !(JSON.stringify(this._bbox) === JSON.stringify(this._previousBbox));
        if (hasBoundingBoxChange) {
            this._wasMoving = true;
            this._newStop = true;
        }
        if (this._wasMoving === true && hasBoundingBoxChange === false) {
            if (this._newStop === true) {
                this._timeMovementStoppedms = Date.now();
                this._newStop = false;
            } else {
                const movementDelayms = currentTimems - this._timeMovementStoppedms;
                if (movementDelayms < MOVEMENT_DELAY_MS) {
                    shouldRenderAfterMovement = false;
                } else {
                    shouldRenderAfterMovement = true;
                }
            }
        }
        if (this._update === false && this._isLoaded === true) {
            return;
        }
        if (this._name === "Latest Ice Concentrations") {
            shouldRenderAfterMovement = false;
            intervalms = 7200;
        }
        const renderConditions = (refreshIntervalms > intervalms && !hasBoundingBoxChange) || shouldRenderAfterMovement;
        this._previousBbox = this._bbox;
        if (renderConditions) {
            const id = idGenerator.next();
            if (this._show) {
                this._currentLoadId = id;
                this.updateService(id);
                this._previousBbox = this._bbox;
            }
            this._newStop = true;
            this._wasMoving = false;
            this._refreshCounterms = currentTimems;
        }
        requestAnimationFrame(() => {
            this.updateRequest(idGenerator, intervalms);
        });
    }

    loadService() {
        return;
    }

    updateService(id: number | null): number | Promise<void> | void {
        return id as number;
    }

    *loadCycleIdGenerator() {
        let id = 1;
        while (true) {
            yield id;
            id++;
        }
    }

    cancelLoadCycle(this: WesDataSource, id = this._currentLoadId) {
        this._fetchRequestAbortController.abort();
        this._isCancelledIdMap.add(id);
    }
}
