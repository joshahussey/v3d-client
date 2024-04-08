import { EntityCollection, JulianDate, Viewer } from "cesium";
import WesDataSource from "./WesDataSource";
import { requestFeatures } from "../Utils/Requests";
import { CesiumWindow, FeaturesCollectionTemporal, LegendSource, ServiceInfo } from "../Types/types";
import { DatasourceTypes } from "../Constants";
import { iso8601PeriodToObject } from "../Utils/TimeParser";
const CesiumClient = window as CesiumWindow;

export default class FeaturesApiLiveDataSource extends WesDataSource {
    _timeStamps;
    _currentTimeString;
    constructor(
        description: string,
        name: string,
        url: string,
        viewer: Viewer,
        uid: string,
        temporal: FeaturesCollectionTemporal,
        serviceInfo: ServiceInfo
    ) {
        super(description, name, url, viewer, uid, serviceInfo);
        this._type = "FeaturesAPI";
        this._entityCollection = new EntityCollection(this);
        this.uid = uid;
        this._name = name;
        this.initialize(10000);
        this._timeStamps = createTimeStamps(temporal);
        this._currentTimeString = this._timeStamps[0];
        setBounds(this, temporal);
    }

    async loadService() {
        await requestFeatures(this._bbox, this._url);
    }
}

function createTimeStamps(temporal: FeaturesCollectionTemporal) {
    const startDate = new Date(temporal.interval[0][0]);
    const stopDate = temporal.interval[0][1] ? new Date(temporal.interval[0][1]) : new Date();
    const period = iso8601PeriodToObject(temporal.resolution);
    const timeStamps = [];
    const currentTime = startDate;
    while (currentTime < stopDate) {
        timeStamps.push(currentTime.toUTCString());
        currentTime.setFullYear(currentTime.getFullYear() + period.years);
        currentTime.setMonth(currentTime.getMonth() + period.months);
        currentTime.setDate(currentTime.getDate() + period.days);
        currentTime.setHours(currentTime.getHours() + period.hours);
        currentTime.setMinutes(currentTime.getMinutes() + period.minutes);
        currentTime.setSeconds(currentTime.getSeconds() + period.seconds);
    }
    return timeStamps;
}

function setBounds(datasource: FeaturesApiLiveDataSource, temporal: FeaturesCollectionTemporal) {
    const startDate = new Date(temporal.interval[0][0]);
    const stopDate = temporal.interval[0][1] ? new Date(temporal.interval[0][1]) : new Date();
    const start = JulianDate.fromDate(startDate);
    const stop = JulianDate.fromDate(stopDate);
    const tempTimeMap = CesiumClient.timeMap();
    tempTimeMap.set(datasource.uid, [start, stop]);
    CesiumClient.setTimeMap(tempTimeMap);
    const sourcesWithLegends = CesiumClient.sourcesWithLegends();

    const selectedDate =
        datasource._currentTimeString == null ? null : JulianDate.fromDate(new Date(datasource._currentTimeString));
    sourcesWithLegends.push({
        type: DatasourceTypes.OgcFeaturesAPI,
        uid: datasource.uid,
        id: datasource.name,
        currentTime: selectedDate,
        lowerTimeBound: start,
        upperTimeBound: stop
    } as LegendSource);
    CesiumClient.setSourcesWithLegends(sourcesWithLegends);
    return;
}
