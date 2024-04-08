import { BBox } from "geojson";
import { OGCFeature } from "../Types/types";
import { Resource } from "cesium";

export async function requestFeatures(bbox: BBox, url: string) {
    let bboxArray = [];
    if (bbox[0] - bbox[2] > 180) {
        bboxArray = [
            [180, bbox[1], bbox[0], bbox[3]],
            [bbox[2], bbox[1], -180, bbox[3]]
        ];
    } else {
        bboxArray.push(bbox);
    }
    const rawFeaturesArray: OGCFeature[] = [];
    for (let i = 0; i < 2; i++) {
        if (bboxArray[i] == null) continue;
        const bbox = bboxArray[i];
        const bboxString = `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`;
        const partialRawFeaturesJson = await Resource.fetchJson({
            url: `${url}items`,
            queryParameters: {
                f: "json",
                limit: 10000,
                bbox: bboxString
            }
        });
        if (partialRawFeaturesJson?.features != null) {
            partialRawFeaturesJson.features.forEach((ogcFeature: OGCFeature) => {
                rawFeaturesArray.push(ogcFeature);
            });
        }
    }
    return rawFeaturesArray;
}
