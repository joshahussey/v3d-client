import { Cartesian3, Credit, GeocoderService, Rectangle } from "cesium";

// From https://geogratis.gc.ca/services/geoname/en/codes/province/
const provinceCodes = new Map([
    ["10", { name: "Newfoundland and Labrador", abbreviation: "NL" }],
    ["11", { name: "Prince Edward Island", abbreviation: "PE" }],
    ["12", { name: "Nova Scotia", abbreviation: "NS" }],
    ["13", { name: "New Brunswick", abbreviation: "NB" }],
    ["24", { name: "Quebec", abbreviation: "QC" }],
    ["35", { name: "Ontario", abbreviation: "ON" }],
    ["46", { name: "Manitoba", abbreviation: "MB" }],
    ["47", { name: "Saskatchewan", abbreviation: "SK" }],
    ["48", { name: "Alberta", abbreviation: "AB" }],
    ["59", { name: "British Columbia", abbreviation: "BC" }],
    ["60", { name: "Yukon", abbreviation: "YT" }],
    ["61", { name: "Northwest Territories", abbreviation: "NT" }],
    ["62", { name: "Nunavut", abbreviation: "NU" }],
    ["72", { name: "Undersea Feature", abbreviation: "UF" }],
    ["73", { name: "International Waters", abbreviation: "IW" }]
]);

export default class GeogratisGeoCoderService implements GeocoderService {
    credit: Credit | undefined;
    constructor() {
        this.credit = undefined;
    }

    async geocode(query: string): Promise<GeocoderService.Result[]> {
        const response = await fetch(`https://geogratis.gc.ca/services/geoname/en/geonames.json?q=${query}`, {
            method: "GET",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            redirect: "follow"
        });

        const status = response.status;
        if (status < 200 || status > 300) {
            console.error("Error searching gazetteer, response status: " + status);
            return [];
        }

        const jsonResponse = await response.json();

        const results: GeocoderService.Result[] = [];
        for (const entry of jsonResponse.items) {
            if (!entry.name || !entry.latitude || !entry.longitude) continue;

            let geom: Cartesian3 | Rectangle = Cartesian3.fromDegrees(entry.longitude, entry.latitude);

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

            let displayNameBuilt = "";
            if (entry.name) {
                displayNameBuilt += entry.name;
            }
            if (entry.location) {
                displayNameBuilt += ", " + entry.location;
            }
            if (entry.province) {
                displayNameBuilt += ", " + provinceCodes.get(entry.province.code)?.abbreviation;
            }

            results.push({
                displayName: displayNameBuilt,
                destination: geom
            });
        }

        return results;
    }
}
