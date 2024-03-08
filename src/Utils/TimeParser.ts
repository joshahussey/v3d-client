import { Resource } from "cesium";
import { translate as t } from "../i18n/Translator";

let wmsDoc: XMLDocument;

export async function isLiveFeatures(url: string): Promise<boolean | JSON> {
    const queryParameters = {
        f: "json"
    };
    const collection = await Resource.fetchJson({ url, queryParameters });
    if (collection?.extent?.temporal) return collection.extent.temporal;
    return false;
}

export async function isLiveWms(name: string, url: string): Promise<boolean> {
    if (url.endsWith("?")) {
        url = url.split("?")[0];
    }
    if (!url.endsWith("wms/")) {
        if (url.endsWith("/")) {
            url = url + "wms/";
        } else {
            url = url + "/wms/";
        }
    }
    const options = {
        url: url,
        queryParameters: {
            REQUEST: "GetCapabilities",
            FORMAT: "application/xml"
        }
    };
    const xml = await Resource.fetchXML(options);
    if (!xml) return false;
    const capability = xml.getElementsByTagName("Capability")[0];
    if (!capability) return false;
    const extendedCapabilities = capability.getElementsByTagName("_ExtendedCapabilities")[0];
    if (!extendedCapabilities) return false;
    const collection = extendedCapabilities.getElementsByTagNameNS(
        "http://schema.compusult.net/extensions/ogc/capabilities",
        "Datasets"
    );
    let set;
    for (const item of collection) {
        const datasets = item.getElementsByTagNameNS(
            "http://schema.compusult.net/extensions/ogc/capabilities",
            "Dataset"
        );
        for (const dataset of datasets) {
            if (dataset.getAttribute("name") === name) {
                set = dataset;
            }
        }
    }
    if (!set) return false;
    const properties = set.getElementsByTagNameNS(
        "http://schema.compusult.net/extensions/ogc/capabilities",
        "Property"
    );
    for (const property in properties) {
        if (!Object.prototype.hasOwnProperty.call(properties[property], "getAttribute")) continue;
        if (properties[property].getAttribute("name") === "Live") {
            if (properties[property].getAttribute("value") === "true") {
                wmsDoc = xml;
                return true;
            }
        }
    }
    return false;
}

export async function createLiveWmsTimesArray(name: string, url: string): Promise<string[]> {
    if (url.endsWith("?")) {
        url = url.split("?")[0];
    }
    if (!url.endsWith("wms/")) {
        if (url.endsWith("/")) {
            url = url + "wms/";
        } else {
            url = url + "/wms/";
        }
    }
    const options = {
        url: url,
        queryParameters: {
            REQUEST: "GetCapabilities",
            FORMAT: "application/xml"
        }
    };
    const xml = await Resource.fetchXML(options);
    if (!xml) {
        return [];
    }
    const layers = xml.getElementsByTagName("Layer");
    const topLevelLayers = [];
    for (const layer of layers) {
        if (layer.getAttributeNames().length === 0) {
            topLevelLayers.push(layer);
        }
    }
    let thisLayer;
    for (const layer of topLevelLayers) {
        const innerLayer = layer.getElementsByTagName("Layer");
        if (innerLayer[0].getElementsByTagName("Title")[0].innerHTML === name) {
            thisLayer = layer;
        }
    }
    if (!thisLayer) {
        return [];
    }
    const dimension = thisLayer.getElementsByTagName("Dimension")[0];
    const timeRange = dimension.innerHTML.split("/");
    const startTime = timeRange[0];
    const endTime = timeRange[1];
    const periodDescription = timeRange[2];
    const period = iso8601PeriodToObject(periodDescription);

    const start = new Date(startTime);
    let end;
    if (!(endTime === "current")) {
        end = new Date(endTime);
    } else {
        end = new Date();
    }
    const currentDate = start;
    const times = [];
    while (currentDate < end) {
        times.push(currentDate.toISOString());
        currentDate.setFullYear(currentDate.getFullYear() + period.years);
        currentDate.setMonth(currentDate.getMonth() + period.months);
        currentDate.setDate(currentDate.getDate() + period.days);
        currentDate.setHours(currentDate.getHours() + period.hours);
        currentDate.setMinutes(currentDate.getMinutes() + period.minutes);
        currentDate.setSeconds(currentDate.getSeconds() + period.seconds);
    }
    return times;
}

export async function createLiveWmsPeriodString(name: string): Promise<{ iso8601: string; start: Date; end: Date }> {
    if (!wmsDoc) {
        throw new Error(t("timeParserCreateLiveWmsPeriodStringError1"));
    }
    const layers = wmsDoc.getElementsByTagName("Layer");
    const topLevelLayers = [];
    for (const layer of layers) {
        if (layer.getAttributeNames().length === 0) {
            topLevelLayers.push(layer);
        }
    }
    let thisLayer;
    for (const layer of topLevelLayers) {
        const innerLayer = layer.getElementsByTagName("Layer");
        if (innerLayer[0].getElementsByTagName("Title")[0].innerHTML === name) {
            thisLayer = layer;
        }
    }
    if (!thisLayer) {
        throw new Error(t("timeParserCreateLiveWmsPeriodStringError2"));
    }
    const dimension = thisLayer.getElementsByTagName("Dimension")[0];
    const timeRange = dimension.innerHTML.split("/");
    const startTime = timeRange[0];
    const endTime = timeRange[1];
    const periodDescription = timeRange[2];
    const start = new Date(startTime);
    let end;
    if (!(endTime === "current")) {
        end = new Date(endTime);
    } else {
        end = new Date();
    }
    const descriptorString = `${start.toISOString()}/${end.toISOString()}/${periodDescription}`;
    const descriptor = {
        iso8601: descriptorString,
        start: start,
        end: end
    };
    return descriptor;
}

export function iso8601PeriodToObject(iso8601PeriodString: string) {
    const period = {
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    };
    let currentNumberString = "";
    let isTime = false;
    for (let i = 1; i < iso8601PeriodString.length; i++) {
        if (isTime) {
            switch (iso8601PeriodString[i]) {
                case "H":
                    period.hours = Number(currentNumberString);
                    currentNumberString = "";
                    break;
                case "M":
                    period.minutes = Number(currentNumberString);
                    currentNumberString = "";
                    break;
                case "S":
                    period.seconds = Number(currentNumberString);
                    currentNumberString = "";
                    break;
                default:
                    currentNumberString = currentNumberString + iso8601PeriodString[i];
            }
            continue;
        }
        switch (iso8601PeriodString[i]) {
            case "Y":
                period.years = Number(currentNumberString);
                currentNumberString = "";
                break;
            case "M":
                period.months = Number(currentNumberString);
                currentNumberString = "";
                break;
            case "D":
                period.days = Number(currentNumberString);
                currentNumberString = "";
                break;
            case "T":
                isTime = true;
                break;
            default:
                currentNumberString = currentNumberString + iso8601PeriodString[i];
        }
    }
    return period;
}
