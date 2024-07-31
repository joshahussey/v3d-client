import { Cartesian3, Credit, GeocodeType, GeocoderService, Rectangle } from "cesium";
import { getViewsServletUrl } from "../Constants";

export default class WesGeoCoderService implements GeocoderService {
    credit: Credit | undefined;
    constructor() {
        this.credit = undefined;
    }

    async geocode(query: string, type?: GeocodeType | undefined): Promise<GeocoderService.Result[]> {
        let stringReqType;

        switch (type) {
            case GeocodeType.AUTOCOMPLETE:
                stringReqType = "autocomplete";
                break;
            case GeocodeType.SEARCH:
            default:
                stringReqType = "search";
                break;
        }

        const args = {
            type: "geocode",
            geocodeType: stringReqType,
            query: query
        };

        const response = await fetch(getViewsServletUrl(), {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            redirect: "follow",
            body: JSON.stringify(args)
        });

        const status = response.status;
        if (status < 200 || status > 300) {
            console.error("Error searching gazetteer, response status: " + status);
            return [];
        }

        const jsonResponse = await response.json();

        const results: GeocoderService.Result[] = [];
        for (const entry of jsonResponse) {
            if (!entry.name || !entry.point) continue;

            let geom: Cartesian3 | Rectangle = Cartesian3.fromDegrees(entry.point[0], entry.point[1]);

            const bufferKmUntyped = entry.bufferKm;
            if (bufferKmUntyped) {
                const bufferM = +bufferKmUntyped * 1000;
                if (bufferM < 1) continue;

                const min = geom.clone();
                min.x -= bufferM;
                min.y -= bufferM;

                // Max
                geom.x += bufferM;
                geom.y += bufferM;

                geom = Rectangle.fromCartesianArray([min, geom]);
            }

            results.push({
                displayName: entry.name,
                destination: geom
            });
        }

        return results;
    }
}
