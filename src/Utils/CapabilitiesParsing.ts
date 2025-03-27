import { Resource } from "cesium";
import WMSCapabilities, { Layer2, Layer3, WMSCapabilitiesJSON } from "wms-capabilities";

/**
 * Given a capabilities url, parse the XML and return a WMSCapabilities object.
 * @param {string} capabilitiesUrl GetCapabilities URL for the service.
 * @returns {Promise<WMSCapabilitiesJSON | null>} An object representing the capabilities document, null if it failed to parse the document.
 */
export async function getWmsCapabilitiesJson(capabilitiesUrl: string): Promise<WMSCapabilitiesJSON | null> {
    const options = {
        url: capabilitiesUrl,
        queryParameters: {
            FORMAT: "application/xml"
        }
    };
    const capXml = await Resource.fetchText(options);
    if (!capXml) return null;
    return new WMSCapabilities(capXml, null).toJSON();
}

function getLeafLayers(layerObj: (Layer2 | Layer3)[]): (Layer2 | Layer3)[] {
    let layersToReturn: (Layer2 | Layer3)[] = [];
    for (const layer of layerObj) {
        if ((layer as Layer2).Layer) {
            layersToReturn = layersToReturn.concat(getLeafLayers((layer as Layer2).Layer));
        } else {
            layersToReturn.push(layer as Layer3);
        }
    }
    return layersToReturn;
}

/**
 * Given a WMSCapabilitiesJSON object and a layer name to find, returns the layer3 object matching that layer name.
 * @param {WMSCapabilitiesJSON} capabilitiesJson Object representing the capabilities document as a json. Can be obtained via getWmsCapabilitiesJson
 * @param {string} layerName Name of the layer to return
 * @returns {Layer3} Object representing the layer requested, undefined if it couldn't find the layer.
 */
export function getCapabilitiesLayerInformation(capabilitiesJson: WMSCapabilitiesJSON, layerName: string): Layer3[] {
    let returningLayers: (Layer2 | Layer3)[] = [];
    if (capabilitiesJson.Capability.Layer.Layer != null) {
        returningLayers = returningLayers.concat(getLeafLayers(capabilitiesJson.Capability.Layer.Layer));
        if (layerName.trim() !== "") {
            returningLayers.filter(layer => (layer as Layer3).Name === layerName);
        }
    } else {
        const leafLayerObj = capabilitiesJson.Capability.Layer as unknown as Layer3;
        if (leafLayerObj.Name === layerName || layerName.trim() === "") {
            returningLayers.push(leafLayerObj);
        }
    }
    return returningLayers as Layer3[];

    /*
    if (capabilitiesJson.Capability.Layer.Layer != null) {
        const topLevelLayersArray = capabilitiesJson.Capability.Layer.Layer as (Layer2 | Layer3)[];
        let leafLayerObj;
        for (let i = 0; i < topLevelLayersArray.length; i++) {
            let tempLayerObj = topLevelLayersArray[i];
            if ((tempLayerObj as Layer2).Layer) {
                tempLayerObj = tempLayerObj as Layer2;
                for (let j = 0; j < tempLayerObj.Layer.length; j++) {
                    if (tempLayerObj.Layer[j].Name === layerName) {
                        leafLayerObj = tempLayerObj.Layer[j];
                    }
                }
            } else {
                if ((tempLayerObj as Layer3).Name === layerName) {
                    leafLayerObj = tempLayerObj as Layer3;
                }
            }
        }
        if (leafLayerObj != null) {
            return leafLayerObj;
        }
    } else if (capabilitiesJson.Capability.Layer != null) {
        const leafLayerObj = capabilitiesJson.Capability.Layer as unknown as Layer3;
        if (leafLayerObj.Name === layerName) {
            return leafLayerObj;
        }
    }
    console.error("Failed to parse layer information for WMS: {} of {}", layerName, capabilitiesJson);
    */
}

/**
 * Given a WMSCapabilitiesJSON object, returns the format.
 * @param {WMSCapabilitiesJSON} capabilitiesJson Object representing the capabilities document as a json. Can be obtained via getWmsCapabilitiesJson
 * @returns {string} The format
 */
export function findImagePngFormat(capabilitiesJson: WMSCapabilitiesJSON): string {
    const formats = capabilitiesJson.Capability.Request.GetMap.Format;
    if (formats.find(format => format === "image/png")) {
        return "image/png";
    } else {
        return formats[0];
    }
}

export type layerInfo = { id: string; name: string };
export async function getArcGisRestCapabilitiesLayerInformation(
    capabilitiesUrl: string,
    layerId: string
): Promise<layerInfo[]> {
    let returningLayers: layerInfo[] = [];
    await fetch(
        capabilitiesUrl +
            "?" +
            new URLSearchParams({
                f: "pjson"
            }).toString()
    )
        .then(response => response.json())
        .then(data => {
            returningLayers = data.subLayers as [];
            if (layerId.trim() !== "") {
                returningLayers.filter((layer: layerInfo) => layer.id.toString() === layerId);
            }
        });
    return returningLayers;
}
