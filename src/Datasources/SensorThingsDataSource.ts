/* eslint-disable */
import {
    Cartesian3,
    Color,
    CompositeEntityCollection,
    DeveloperError,
    Entity,
    EntityCollection,
    Viewer,
    defined,
    PropertyBag,
    ModelGraphics,
    PolylineGraphics,
    PolygonGraphics,
    PositionProperty,
    PolygonHierarchy
} from "cesium";
import WesDataSource from "./WesDataSource";
import GeoJsonDecoder from "../Utils/GeoJsonDecoder";
import { OGCFeature, ServiceInfo } from "../Types/types";
import {
    showThings,
    showFeaturesOfInterest,
    showDatastreams,
    createShapeEntity,
    averageTableCreate,
    tableCreate,
    heightReferenceCheck,
    buildLineHasNoHeight,
    buildPolygonHasNoHeight,
    buildLine,
    buildPoint,
    buildPolygon
} from "../Utils/Utils";
import { translate as t } from "../i18n/Translator";

type CheckDataTypeInfoObj = {
    id: string;
    name: string;
    description: string;
    observationType: string;
    symbol: string;
    observationLink: string;
    tableType?: string;
    results?: CheckDataTypeInfoObjResult[];
    result?: string;
    phenomenonTime?: string;
};

type CheckDataTypeInfoObjResult = {
    result: string;
    phenomenonTime: string;
};

type ObservedProperty = {
    name: string;
    id: string;
    observationType?: string;
    uomSymbol?: string;
    uomName?: string;
};

type SensorThingsGeometryObject = {
    type: string;
    model?: ModelGraphics;
    position?: Cartesian3 | Cartesian3[];
    polyline?: PolylineGraphics;
    polygon?: PolygonGraphics;
};

type RawThingInfo = {
    iotId: string;
    iotSelfLink: string;
    Datastreams: any;
    HistoricalLocationsIotNavigationLink: string;
    Locations: any;
    TaskingCapabilitiesIotNavigationLink: string;
    description: string;
    name: string;
    properties: any;
};

export default class SensorThingsDataSource extends WesDataSource {
    _links: any;
    _supportedLocationTypes: Array<string>;
    _numericalAverageTypes: Array<string>;
    _observedProperties: any;
    _entityCollection: CompositeEntityCollection;
    _things: EntityCollection;
    _featuresOfInterest: EntityCollection;
    _datastreams: EntityCollection;
    _showFeaturesOfInterest: boolean;
    _showThings: boolean;
    _showObservedAreas: boolean;
    _showDatastreams: boolean;

    constructor(description: string, name: string, url: string, viewer: Viewer, uid: string, serviceInfo: ServiceInfo) {
        super(description, name, url, viewer, uid, serviceInfo);
        this._type = "SensorThingsDataSource";
        this._links = new Object();
        this._supportedLocationTypes = ["application/geo+json", "application/vnd.geo+json"];
        this._numericalAverageTypes = ["OM_CountObservation", "OM_Measurement"];
        this._observedProperties = new Object();
        this._entityCollection = new CompositeEntityCollection([], this);
        this._things = new EntityCollection(this);
        this._featuresOfInterest = new EntityCollection(this);
        this._datastreams = new EntityCollection(this);
        this._entityCollection.addCollection(this._things);
        this._entityCollection.addCollection(this._featuresOfInterest);
        this._entityCollection.addCollection(this._datastreams);
        this._showFeaturesOfInterest = true;
        this._showThings = true;
        this._showObservedAreas = true;
        this._showDatastreams = true;

        Object.defineProperties(this, {
            things: {
                get: function () {
                    return this._things;
                }
            },

            thingsId: {
                get: function () {
                    return this._things.id;
                }
            },

            datastreams: {
                get: function () {
                    return this._datastreams;
                }
            },

            datastreamsId: {
                get: function () {
                    return this._datastreams.Id;
                }
            },

            featuresOfInterest: {
                get: function () {
                    return this._featuresOfInterest;
                }
            },

            featuresId: {
                get: function () {
                    return this._featuresOfInterest.id;
                }
            },

            links: {
                get: function () {
                    return this._links;
                }
            },

            observedProperties: {
                get: function () {
                    return this._observedProperties;
                }
            },

            show: {
                get: function () {
                    const showValues = {
                        Things: this._showThings,
                        FeaturesOfInterest: this._showFeaturesOfInterest,
                        ObservedAreas: this._showDatastreams
                    };
                    return showValues;
                },
                set: function (value) {
                    this._show = value;
                    if (value === "false" || value === false) {
                        showThings(this, value, null);
                        showFeaturesOfInterest(this, value, null);
                        showDatastreams(this, value, null);
                    } else {
                        showThings(this, value, null);
                    }
                }
            },

            showThings: {
                get: function () {
                    return this._showThings;
                },
                //inputTuple: [value, selectedThing]
                set: function (inputTuple: [boolean, Entity]) {
                    showThings(this, inputTuple[0], inputTuple[1]);
                }
            },

            showFeatures: {
                get: function () {
                    return this._showFeaturesOfInterest;
                },
                //inputTuple: [value, selectedThing]
                set: function (inputTuple: [boolean, Entity]) {
                    const collection = this._things;
                    const things = collection.values;
                    collection.suspendEvents();
                    if (inputTuple[1] == null) {
                        this._showThings = inputTuple[0];
                        for (let i = 0; i < things.length; i++) {
                            const thing = things[i];
                            thing.show = inputTuple[0];
                        }
                    } else {
                        inputTuple[1].show = inputTuple[0];
                    }
                    collection.resumeEvents();
                }
            },

            showObservedAreas: {
                get: function () {
                    return this._showFeaturesOfInterest;
                },
                //inputTuple: [value, selectedThing]
                set: function (inputTuple: [boolean, Entity]) {
                    const collection = this._things;
                    const things = collection.values;
                    collection.suspendEvents();
                    if (inputTuple[1] == null) {
                        this._showThings = inputTuple[0];
                        for (let i = 0; i < things.length; i++) {
                            const thing = things[i];
                            thing.show = inputTuple[0];
                        }
                    } else {
                        inputTuple[1].show = inputTuple[0];
                    }
                    collection.resumeEvents();
                }
            }
        });

        this.loadService();
    }

    locationSupportCheck(entityLocation: any) {
        //keep
        const encodingType = entityLocation.encodingType;
        let isSupported = false;
        let typeCount = this._supportedLocationTypes.length;
        while (typeCount) {
            const i = typeCount - 1;
            if (encodingType === this._supportedLocationTypes[i]) {
                isSupported = true;
                return isSupported;
            }
            typeCount--;
        }
        return isSupported;
    }

    getRoot() {
        //keep
        if (!defined(this._url)) {
            throw new DeveloperError(t("sensorthingsDatasourceGetRootError1"));
        }
        const url = this._url;
        if (url.endsWith("/")) {
            this._url = url;
        } else {
            this._url = `${url}/`;
        }
        return this.fetchJson(url, { f: "json" });
    }

    getLinks(rootData: any) {
        //keep
        return new Promise((resolve, reject) => {
            if (rootData == null) {
                this._setLoading(false);
                reject(t("sensorthingsDatasourceGetLinksError1"));
            } else {
                rootData.value.forEach((element: any, index: number) => {
                    const keyArr = Object.keys(rootData.value[index]);
                    const nameKey = keyArr[0];
                    const urlKey = keyArr[1];
                    this._links[rootData.value[index][nameKey]] = rootData.value[index][urlKey];
                });
                resolve(this._links);
            }
        });
    }

    async loadService() {
        //keep
        //set entity collection/set loading status & raise loading event
        const allEntities = this._entityCollection;
        this._setLoading(true);

        //fetch root json and create links
        const serviceRoot = await this.getRoot();
        await this.getLinks(serviceRoot);

        //Prepare environment for rendering and render things, FOI's, and Observed Ares
        allEntities.suspendEvents();
        this.getFeaturesOfInterest();
        this.getDatastreamAreasAndObservedProperties();
        this.buildThings();
        allEntities.resumeEvents();
    }

    async getFeaturesOfInterest() {
        const encodedQuery = "FeaturesOfInterest?$select=name,id,encodingType,feature";
        const url = this._url + encodedQuery;
        const featuresOfInterest = await this.fetchJson(url, { f: "json" });

        //	featureCount = featuresOfInterest['@iot.count'];
        //	if (featureCount > 99) {
        //		featureCount = 99;
        //	}

        let featureCount = featuresOfInterest.value.length;

        while (featureCount) {
            const i = featureCount - 1;
            const featureOfInterest = createShapeEntity(
                featuresOfInterest.value[i].feature,
                featuresOfInterest.value[i]["@iot.id"],
                featuresOfInterest.value[i]["name"]
            );
            if (featureOfInterest) {
                this._featuresOfInterest.add(featureOfInterest);
            }
            featureCount--;
        }
    }

    async getDatastreamAreasAndObservedProperties() {
        const queryString = `?${encodeURIComponent(
            "$top=10000&$select=name,id,Datastreams&$expand=Datastreams($select=id,observationType,name,observedArea,unitOfMeasurement)&$count=true"
        )}`;
        const url = this._links.ObservedProperties + queryString;
        const observedPropsJson = await this.fetchJson(url, { f: "json" });
        const observedPropsArr = observedPropsJson.value;

        let i = observedPropsArr.length;
        while (i) {
            let streamCount = 0;
            if (observedPropsArr[i - 1].Datastreams == null) {
                i--;
                continue;
            }
            const observedProperty: ObservedProperty = {
                name: observedPropsArr[i - 1].name,
                id: observedPropsArr[i - 1]["@iot.id"].toString()
            };
            if (observedPropsArr[i - 1].Datastreams.length !== 0) {
                streamCount = observedPropsArr[i - 1].Datastreams.length;
                observedProperty.observationType = observedPropsArr[i - 1].Datastreams[0].observationType;
                observedProperty.uomSymbol = observedPropsArr[i - 1].Datastreams[0].unitOfMeasurement.symbol;
                observedProperty.uomName = observedPropsArr[i - 1].Datastreams[0].unitOfMeasurement.name;
            }

            let datastreamEnt: Entity | undefined;
            while (streamCount) {
                const isDefined = this._datastreams.getById(
                    observedPropsArr[i - 1].Datastreams[streamCount - 1]["@iot.id"]
                );
                if (isDefined == null) {
                    //CHECK HERE IN THE MORNING!!!!************************************************************
                    const temp = createShapeEntity(
                        observedPropsArr[i - 1].Datastreams[streamCount - 1].observedArea,
                        observedPropsArr[i - 1].Datastreams[streamCount - 1]["@iot.id"],
                        observedPropsArr[i - 1].Datastreams[streamCount - 1].name
                    );
                    if (temp != null && temp != false) {
                        datastreamEnt = temp;
                    }
                } else {
                    datastreamEnt = new Entity({
                        show: this._show,
                        id: observedPropsArr[i - 1].Datastreams[streamCount - 1]["@iot.id"],
                        name: observedPropsArr[i - 1].Datastreams[streamCount - 1].name
                    });
                }
                if (datastreamEnt != null) {
                    this._datastreams.add(datastreamEnt);
                }

                streamCount--;
            }
            this._observedProperties[observedProperty.id] = observedProperty;
            i--;
        }

        this.buildObservedPropertyAverages();
    }

    async buildObservedPropertyAverages() {
        const url = `${this._links.ObservedProperties}?${encodeURIComponent(
            "$top=10000&$select=Datastreams,id&$expand=Datastreams($select=Observations),Datastreams/Observations($top=1)"
        )}`;
        const observationData = await this.fetchJson(url, { f: "json" });
        let numOfObservedProps = observationData.value.length;
        const observedProps = observationData.value;
        while (numOfObservedProps) {
            const i = numOfObservedProps - 1;
            const observedPropId = observedProps[i]["@iot.id"];
            if (!Object.prototype.hasOwnProperty.call(this._observedProperties, observedPropId)) {
                numOfObservedProps--;
                continue;
            }
            if (!("observationType" in this._observedProperties[observedPropId])) {
                numOfObservedProps--;
                continue;
            } else if (
                !this._numericalAverageTypes.includes(
                    this._observedProperties[observedPropId].observationType.split("/").pop()
                )
            ) {
                numOfObservedProps--;
                continue;
            }
            let numOfDatastreams = observedProps[i].Datastreams.length;
            const resultCount = numOfDatastreams;
            let resultSum = 0;
            while (numOfDatastreams) {
                const j = numOfDatastreams - 1;
                if (observedProps[i].Datastreams[j].Observations[0] != null) {
                    if ("result" in observedProps[i].Datastreams[j].Observations[0]) {
                        if (observedProps[i].Datastreams[j].Observations[0].result != null) {
                            resultSum = resultSum + Number(observedProps[i].Datastreams[j].Observations[0].result);
                        }
                    }
                }

                numOfDatastreams--;
            }
            const resultAve = resultSum / resultCount;

            if (observedPropId in this._observedProperties) {
                this._observedProperties[observedPropId].resultAverage = resultAve;
            }
            numOfObservedProps--;
        }
    }

    async buildThings() {
        //keep

        const queryString = `?$top=10000&$expand=${encodeURIComponent(
            "Locations($select=encodingType,location),Datastreams($select=id,observationType,ObservedProperty),Datastreams/ObservedProperty($select=id)"
        )}`;
        const url = this._links.Things + queryString;
        const rawThingsJson = await this.fetchJson(url, { f: "json" });
        const rawThings = rawThingsJson.value;
        let count = rawThings.length;
        count = 9; //<-wtf?
        while (count) {
            try {
                const i = count - 1;
                const rawThing = rawThings[i];
                const rawThingInfo: RawThingInfo = { ...rawThing };
                const propertyBag = this.getCustomThingProperties(rawThingInfo);
                const renderLocationAndType = this.getPositionRef(rawThingInfo);
                if (renderLocationAndType != undefined && renderLocationAndType != false) {
                    const thing = new Entity({
                        show: this._show,
                        id: rawThingInfo.iotId,
                        name: rawThingInfo.name,
                        description: rawThingInfo.description,
                        properties: propertyBag
                    });
                    switch (renderLocationAndType.type) {
                        case "model":
                            thing.model = renderLocationAndType.model;
                            thing.position = renderLocationAndType.position as unknown as PositionProperty;
                            break;
                        case "polyline":
                            thing.polyline = renderLocationAndType.polyline;
                            break;
                        case "polygon":
                            thing.polygon = renderLocationAndType.polygon;
                            break;
                    }
                    this._things.add(thing);
                }
                count--;
            } catch (err) {
                console.warn(err);
                count--;
            }
        }
    }

    getCustomThingProperties(rawThing: RawThingInfo) {
        //Keep
        const thingProperties = new PropertyBag();
        const datastreamsIdArr = [] as string[];
        const observedPropsArr = [] as string[];

        if (rawThing.properties != null) {
            for (const key in rawThing.properties) {
                thingProperties.addProperty(key, rawThing.properties[key]);
            }
        }
        if (rawThing.Datastreams != null) {
            let streamCount = rawThing.Datastreams.length;
            while (streamCount) {
                const i = streamCount - 1;
                datastreamsIdArr.push(rawThing.Datastreams[i].iotId);
                if (!observedPropsArr.includes(rawThing.Datastreams[i].ObservedProperty.iotId)) {
                    observedPropsArr.push(rawThing.Datastreams[i].ObservedProperty.iotId);
                }

                streamCount--;
            }
        }
        thingProperties.addProperty("DatastreamIDs", datastreamsIdArr);
        thingProperties.addProperty("ObservedPropertyIDs", observedPropsArr);
        thingProperties.addProperty("FeaturesOfInterest", []);
        return thingProperties;
    }

    getPositionRef(rawThing: RawThingInfo) {
        //keep
        if (rawThing.Locations == null) {
            return false;
        }

        const numberOfLocations = rawThing.Locations.length;

        switch (numberOfLocations) {
            case 0:
                console.warn(t("sensorthingsDatasourceGetPositionRefError1"));
                return false;
            case 1: {
                const isSupportedType = this.locationSupportCheck(rawThing.Locations[0]);
                if (isSupportedType) {
                    const thingLocationAndType = this.getThingLocationAndType(rawThing.Locations[0].location);
                    if (thingLocationAndType !== false) {
                        return thingLocationAndType;
                    } else {
                        console.warn(t("sensorthingsDatasourceGetPositionRefError2"));
                        return false;
                    }
                } else {
                    console.warn(t("sensorthingsDatasourceGetPositionRefError3"));
                    return false;
                }
            }
            case "default": {
                console.warn(t("sensorthingsDatasourceGetPositionRefError4"));
                let locationCount = numberOfLocations;
                while (locationCount) {
                    const i = locationCount - 1;
                    const isSupportedType = this.locationSupportCheck(rawThing.Locations[i].location);
                    if (isSupportedType) {
                        const thingLocationAndType = this.getThingLocationAndType(rawThing.Locations[0].location);
                        if (thingLocationAndType !== false) {
                            return thingLocationAndType;
                        }
                    }
                    locationCount--;
                }

                console.warn(t("sensorthingsDatasourceGetPositionRefError5"));
                return false;
            }
            default: {
                console.error(t("sensorthingsDatasourceGetPositionRefError6"));
                return false;
            }
        }
    }

    async associateDatastreamsAndFeatures(selectedThing: any, value: boolean) {
        const datastreams = selectedThing.properties.DatastreamIDs.valueOf();
        let numStreams = datastreams.length;
        if (selectedThing.properties.FeaturesOfInterest.valueOf().length !== 0) {
            const features = selectedThing.properties.FeaturesOfInterest.valueOf();
            let numFeatures = features.length;
            while (numStreams) {
                const i = numStreams - 1;
                const datastream = this._datastreams.getById(datastreams[i]);
                if (datastream != undefined) {
                    showDatastreams(this, value, datastream);
                }
                numStreams--;
            }
            while (numFeatures) {
                const i = numFeatures - 1;
                const feature = this._featuresOfInterest.getById(features[i]);
                if (feature != undefined) {
                    showFeaturesOfInterest(this, value, feature);
                }
                numFeatures--;
            }
        } else {
            const featuresArr = [] as string[];
            while (numStreams) {
                const i = numStreams - 1;
                const url = `${this._links.Datastreams}(${
                    datastreams[i]
                })/Observations?$top=1&$expand=FeatureOfInterest${encodeURIComponent(
                    "($select=id)"
                )}&$select=FeatureOfInterest`;
                const featureID = await this.fetchJson(url, { f: "json" });

                if (featureID.value.length !== 0) {
                    if (featuresArr.includes(featureID.value[0].FeatureOfInterest["@iot.id"])) {
                        numStreams--;
                        continue;
                    }
                    featuresArr.push(featureID.value[0].FeatureOfInterest["@iot.id"]);
                    const feature = this._featuresOfInterest.getById(featureID.value[0].FeatureOfInterest["@iot.id"]);
                    if (feature != undefined) {
                        showFeaturesOfInterest(this, value, feature);
                    }
                }
                numStreams--;
            }
            selectedThing.properties.FeaturesOfInterest = featuresArr;
        }
    }

    buildAverageTable(thing: any) {
        averageTableCreate();
        const tbody = document.getElementById("average-table-body");
        if (tbody != null) {
            const observedPropArr = thing.properties.ObservedPropertyIDs.valueOf();
            let observedPropCount = observedPropArr.length;

            let name;
            let nameCol;
            let result;
            let resultCol;
            const row = document.createElement("tr");
            while (observedPropCount) {
                const i = observedPropCount - 1;
                if (!Object.prototype.hasOwnProperty.call(this._observedProperties, observedPropArr[i])) {
                    observedPropCount--;
                    continue;
                }
                if ("resultAverage" in this._observedProperties[observedPropArr[i]]) {
                    if (this._observedProperties[observedPropArr[i]] != null) {
                        name = document.createTextNode(
                            `${this._observedProperties[observedPropArr[i]].name.toUpperCase()}: `
                        );
                        nameCol = document.createElement("td");
                        nameCol.setAttribute("class", "cslt-average-name");
                        result = document.createTextNode(
                            (
                                Math.round(
                                    (this._observedProperties[observedPropArr[i]].resultAverage + Number.EPSILON) * 100
                                ) / 100
                            ).toString()
                        );
                        resultCol = document.createElement("td");
                        nameCol.appendChild(name);
                        resultCol.appendChild(result);
                        row.appendChild(nameCol);
                        row.appendChild(resultCol);
                    }
                }

                observedPropCount--;
            }
            tbody.appendChild(row);
        }
    }

    async buildThingDataTable(thing: any) {
        tableCreate();
        const dataInfo = await this.checkDataType(thing);
        let obsData: any;
        dataInfo.forEach(async element => {
            switch (element.tableType) {
                case "numVsTime":
                    obsData = await this.getObservationDataNumVsTime(element);
                    this.tableTypeNumVsTime(obsData);
                    break;
                case "Count":
                    obsData = await this.getObservationDataCount(element);
                    this.tableTypeCount(obsData);
                    break;

                case "Unknown":
                    this.tableTypeUnknown(element);
                    break;
            }
        });
    }

    async checkDataType(thing: any) {
        //rewrite

        const observedPropIDs = thing.properties.ObservedPropertyIDs.valueOf();
        let propCount = observedPropIDs.length;
        const dataInfoObjectsArr = [];
        while (propCount) {
            const i = propCount - 1;
            if (!Object.prototype.hasOwnProperty.call(this._observedProperties, observedPropIDs[i])) {
                propCount--;
                continue;
            }
            const observedProp = this._observedProperties[observedPropIDs[i]];
            const infoObj: CheckDataTypeInfoObj = {
                id: observedProp.id,
                name: observedProp.name,
                description: observedProp.uomName,
                observationType: observedProp.observationType,
                symbol: observedProp.uomSymbol,
                observationLink: `${this._links.Things}(${thing.id})/Datastreams?`
            };
            dataInfoObjectsArr.push(infoObj);
            propCount--;
        }
        const datastreamParams = await this.chooseDataDisplayType(dataInfoObjectsArr);
        return datastreamParams;
    }

    chooseDataDisplayType(dataInfo: CheckDataTypeInfoObj[]) {
        //keep
        dataInfo.forEach((element, index) => {
            const obsType = element.observationType.split("/").pop();
            if (obsType != undefined && this._numericalAverageTypes.includes(obsType)) {
                dataInfo[index].tableType = "numVsTime";
            } else {
                dataInfo[index].tableType = "Unknown";
            }
        });
        return dataInfo;
    }

    //desc
    //name
    //results(Obj- phenomenonTime, result)
    //
    tableTypeNumVsTime(dataInfo: CheckDataTypeInfoObj) {
        //keep

        //get Table Body
        const tbody = document.getElementById("data-table-body");
        if (tbody != null) {
            //add Header Row for the dataStream
            let header;
            if (dataInfo.results != undefined && dataInfo.results.length !== 0) {
                header = document.createTextNode(
                    `${dataInfo.name}: ${dataInfo.results[dataInfo.results.length - 1].result}`
                );
            } else {
                header = document.createTextNode(`${dataInfo.name}: NoResults`);
                const headCol = document.createElement("td");
                headCol.setAttribute("colspan", "100%");
                const headRow = document.createElement("tr");
                headRow.setAttribute("class", "cslt-table-header");
                headCol.appendChild(header);
                headRow.appendChild(headCol);
                tbody.appendChild(headRow);
                return;
            }

            const headCol = document.createElement("td");
            headCol.setAttribute("colspan", "100%");
            const headRow = document.createElement("tr");
            headRow.setAttribute("class", "cslt-table-header");
            headCol.appendChild(header);
            headRow.appendChild(headCol);
            tbody.appendChild(headRow);

            const chartCanvas = document.createElement("canvas");
            chartCanvas.setAttribute("class", "chart-numVsTime");
            chartCanvas.setAttribute("id", `chart${dataInfo.name}`);
            //generate array of labels and data
            const labels = [];
            const data = [];
            dataInfo.results.forEach(function (element) {
                labels.push(element.phenomenonTime);
                data.push(Number(element.result));
            });
            //const chart =
            /*new Chart(chartContext, {
                type: "line",
        
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: dataInfo.description,
                            data: data,
                        },
                    ],
                },
        
                options: {},
            });*/

            const chartCol = document.createElement("td");
            chartCol.setAttribute("colspan", "100%");
            const chartRow = document.createElement("tr");
            chartCol.appendChild(chartCanvas);
            chartRow.appendChild(chartCol);
            tbody.appendChild(chartRow);

            //Plot a chart.
        }
    }

    tableTypeCount(dataInfo: CheckDataTypeInfoObj) {
        //keep
        //get Table Body
        const tbody = document.getElementById("data-table-body");
        if (tbody != null) {
            //add Header Row for the dataStream
            const header = document.createTextNode(dataInfo.description);
            const headCol = document.createElement("td");
            headCol.setAttribute("colspan", "100%");
            const headRow = document.createElement("tr");
            headRow.setAttribute("class", "cslt-table-header");
            headCol.appendChild(header);
            headRow.appendChild(headCol);
            tbody.appendChild(headRow);
            //Add Data Row for the datastream
            let dataTimeString: string = "";
            if (dataInfo.phenomenonTime != undefined) {
                dataTimeString = dataInfo.phenomenonTime.toString();
            }
            const dataTime = document.createTextNode(dataTimeString);

            const dataResult = document.createTextNode(`${dataInfo.name}: ${dataInfo.result}${dataInfo.symbol}`);

            const dataTimeCol = document.createElement("td");
            const dataResultCol = document.createElement("td");
            dataTimeCol.setAttribute("colspan", "50%");
            dataResultCol.setAttribute("colspan", "50%");
            dataTimeCol.appendChild(dataTime);
            dataResultCol.appendChild(dataResult);
            const dataRow = document.createElement("tr");
            dataRow.appendChild(dataTimeCol);
            dataRow.appendChild(dataResultCol);
            tbody.appendChild(dataRow);
        }
    }

    tableTypeUnknown(dataInfo: CheckDataTypeInfoObj) {
        //keep
        //get Table Body
        const tbody = document.getElementById("data-table-body");
        if (tbody != null) {
            //add Header Row for the dataStream
            const header = document.createTextNode(dataInfo.description);
            const headCol = document.createElement("td");
            headCol.setAttribute("colspan", "100%");
            const headRow = document.createElement("tr");
            headRow.setAttribute("class", "cslt-table-header");
            headCol.appendChild(header);
            headRow.appendChild(headCol);
            tbody.appendChild(headRow);
            //Add Data Row for the datastream
            const dataLink = document.createElement("a");
            dataLink.setAttribute("href", dataInfo.observationLink);
            dataLink.setAttribute("class", "cslt-table-link");
            const linkText = document.createTextNode(dataInfo.observationLink);
            const dataCol = document.createElement("td");
            dataCol.setAttribute("colspan", "100%");
            const dataRow = document.createElement("tr");
            dataLink.appendChild(linkText);
            dataCol.appendChild(dataLink);
            dataRow.appendChild(dataCol);
            tbody.appendChild(dataRow);
        }
    }

    getObservationDataCount(dataInfo: CheckDataTypeInfoObj) {
        //keep
        const url = `${dataInfo.observationLink}$expand=ObservedProperty${encodeURIComponent(
            "($select=id)"
        )},Observations${encodeURIComponent("($top=20)")}&$select=ObservedProperty,Observations`;

        const jsonReturn = this.fetchJson(url, { f: "json" });
        if (jsonReturn != undefined) {
            return new Promise(resolve => {
                jsonReturn
                    .then(function (data) {
                        const dataObj: CheckDataTypeInfoObj = {
                            ...dataInfo,
                            phenomenonTime: new Date(data.value[0].phenomenonTime).toDateString(),
                            result: data.value[0].result
                        };
                        return dataObj;
                    })
                    .then(function (dataInfo) {
                        resolve(dataInfo);
                    });
            });
        }
    }

    getObservationDataNumVsTime(dataInfo: CheckDataTypeInfoObj) {
        //keep
        const url = `${dataInfo.observationLink}$expand=ObservedProperty${encodeURIComponent(
            "($select=id)"
        )},Observations${encodeURIComponent("($top=20)")}&$select=ObservedProperty,Observations`;

        const jsonReturn = this.fetchJson(url, { f: "json" });
        if (jsonReturn != undefined) {
            return new Promise(resolve => {
                jsonReturn
                    .then(function (data) {
                        const results = [] as CheckDataTypeInfoObjResult[];
                        let i = -1;
                        data.value.forEach(function (element: any, index: number) {
                            if (element.ObservedProperty["@iot.id"] == dataInfo.id) {
                                i = index;
                            }
                        });
                        if (i !== -1) {
                            data.value[i].Observations.forEach(function (element: any) {
                                const dataObj: CheckDataTypeInfoObjResult = {
                                    phenomenonTime: new Date(element.phenomenonTime).toDateString(),
                                    result: element.result
                                };
                                results.push(dataObj);
                            });
                        }

                        const dataObj = { ...dataInfo, results };
                        return dataObj;
                    })
                    .then(function (dataInfo) {
                        resolve(dataInfo);
                    });
            });
        }
    }

    //["type",typeObject, pointPosition];
    getThingLocationAndType(geoJson: OGCFeature) {
        //keep
        if (typeof geoJson != "object") {
            return false;
        }
        const geom = new GeoJsonDecoder(geoJson);
        const shapes = geom.getAll();
        if (shapes === false) {
            return false;
        }
        let caseType = "default";
        if (shapes[0].length !== 0) {
            caseType = "point";
        } else if (shapes[1].length !== 0) {
            caseType = "line";
        } else if (shapes[2].length !== 0) {
            caseType = "polygon";
        }

        let lineObj;
        let polygonObj;
        let position;

        switch (caseType) {
            case "point": {
                const point = buildPoint(shapes);
                const hReference = heightReferenceCheck(point);
                position = Cartesian3.fromDegrees(point[0], point[1], point[2]);
                const modelUrl = this.chooseModel();
                const model = new ModelGraphics({
                    heightReference: hReference,
                    uri: modelUrl,
                    minimumPixelSize: 128,
                    maximumScale: 300
                });
                const obj: SensorThingsGeometryObject = {
                    type: "model",
                    model: model,
                    position: position
                };
                return obj;
            }
            case "line": {
                const lineNoHeight = buildLineHasNoHeight(shapes);
                if (lineNoHeight === false) {
                    const line = buildLine(shapes);

                    position = Cartesian3.fromDegreesArrayHeights(line);

                    lineObj = new PolylineGraphics({
                        positions: position,
                        width: 3,
                        material: Color.PURPLE
                    });
                } else {
                    position = Cartesian3.fromDegreesArray(lineNoHeight);
                    lineObj = new PolylineGraphics({
                        positions: position,
                        width: 3,
                        material: Color.PURPLE,
                        clampToGround: true
                    });
                }
                const obj: SensorThingsGeometryObject = {
                    type: "polyline",
                    polyline: lineObj
                };
                return obj;
            }
            case "polygon": {
                const polygonNoHeight = buildPolygonHasNoHeight(shapes);
                if (typeof polygonNoHeight === "boolean") {
                    const polygon = buildPolygon(shapes);
                    const rings = polygon.length;
                    let ringNum = rings;
                    const holeArr = [];
                    let polygonHier;

                    while (ringNum) {
                        if (ringNum > 1) {
                            position = Cartesian3.fromDegreesArrayHeights(polygon[ringNum - 1]);
                            const holeObj = new PolygonHierarchy(position);
                            holeArr.push(holeObj);
                        } else {
                            position = Cartesian3.fromDegreesArrayHeights(polygon[ringNum - 1]);
                            polygonHier = new PolygonHierarchy(position, holeArr);
                        }
                        ringNum--;
                    }

                    polygonObj = new PolygonGraphics({
                        hierarchy: polygonHier,
                        outlineWidth: 3,
                        material: Color.ORANGE.withAlpha(0.4)
                    });
                } else {
                    const rings = polygonNoHeight.length;
                    let ringNum = rings;
                    const holeArr = [];
                    let polygonHier;

                    while (ringNum) {
                        if (ringNum > 1) {
                            position = Cartesian3.fromDegreesArray(polygonNoHeight[ringNum - 1]);
                            const holeObj = new PolygonHierarchy(position);
                            holeArr.push(holeObj);
                        } else {
                            position = Cartesian3.fromDegreesArray(polygonNoHeight[ringNum - 1]);
                            polygonHier = new PolygonHierarchy(position, holeArr);
                        }
                        ringNum--;
                    }

                    polygonObj = new PolygonGraphics({
                        hierarchy: polygonHier,
                        outlineWidth: 3,
                        material: Color.ORANGE.withAlpha(0.4)
                    });
                }
                const obj: SensorThingsGeometryObject = {
                    type: "model",
                    polygon: polygonObj
                };
                return obj;
            }
            case "default":
                return false;
        }
    }

    chooseModel() {
        let model = "./glbmodels/Box.glb";
        const bikeDocksString = /\w*bike\w*/;
        const hasBikeDocks = bikeDocksString.exec(this._url) !== null;
        if (hasBikeDocks) {
            model = "./glbmodels/BikeStand.glb";
        }

        return model;
    }
}
