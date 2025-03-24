import { Cartesian3, Color, ConstantProperty, Entity, HeightReference, PolygonHierarchy } from "cesium";
import SensorThingsDataSource from "../Datasources/SensorThingsDataSource";
import { OGCFeature, GeoJsonGetAllResult, MapState } from "../Types/types";
import GeoJsonDecoder from "./GeoJsonDecoder";
import * as GeoJSON from "geojson";
import { Feature } from "geojson";
import { Geometry } from "geojson";
import { FeatureCollection } from "geojson";
import { GeometryCollection } from "geojson";
import { translate as t } from "../i18n/Translator";
import proj4 from "proj4";
import { getProjectionString } from "./Projections";

export type indexedPoint = [GeoJSON.Point["coordinates"], number];
export type indexedLine = [GeoJSON.LineString["coordinates"], number];
export type indexedPolygon = [GeoJSON.Polygon["coordinates"], number];

export function showThings(that: SensorThingsDataSource, value: boolean, selectedThing: Entity | null) {
    const collection = that._things;
    const things = collection.values;
    collection.suspendEvents();
    if (selectedThing == null) {
        that._showThings = value;
        for (let i = 0; i < things.length; i++) {
            const thing = things[i];
            thing.show = value;
        }
    } else {
        selectedThing.show = value;
    }
    collection.resumeEvents();
}

export function showFeaturesOfInterest(
    that: SensorThingsDataSource,
    value: boolean,
    associatedFeatures: Entity | null
) {
    const collection = that._featuresOfInterest;
    const features = collection.values;
    const valueAsProperty = new ConstantProperty(value);
    collection.suspendEvents();
    if (associatedFeatures == null) {
        that._showFeaturesOfInterest = value;
        for (let i = 0; i < features.length; i++) {
            const feature = features[i];
            if (feature.ellipse != null) {
                feature.ellipse.show = valueAsProperty;
            } else if (feature.polyline != null) {
                feature.polyline.show = valueAsProperty;
            } else if (feature.polygon != null) {
                feature.polygon.show = valueAsProperty;
            }
        }
    } else {
        that._showFeaturesOfInterest = value;
        associatedFeatures.show = value;
        if (associatedFeatures.ellipse != null) {
            associatedFeatures.ellipse.show = valueAsProperty;
        } else if (associatedFeatures.polyline != null) {
            associatedFeatures.polyline.show = valueAsProperty;
        } else if (associatedFeatures.polygon != null) {
            associatedFeatures.polygon.show = valueAsProperty;
        }
    }
    collection.resumeEvents();
}

export function showDatastreams(that: SensorThingsDataSource, value: boolean, associatedStreams: Entity | null) {
    const collection = that._datastreams;
    const datastreams = collection.values;
    const valueAsProperty = new ConstantProperty(value);
    collection.suspendEvents();
    if (associatedStreams == null) {
        that._showDatastreams = value;
        for (let i = 0; i < datastreams.length; i++) {
            const datastream = datastreams[i];
            if (datastream.ellipse != null) {
                datastream.ellipse.show = valueAsProperty;
            } else if (datastream.polyline != null) {
                datastream.polyline.show = valueAsProperty;
            } else if (datastream.polygon != null) {
                datastream.polygon.show = valueAsProperty;
            }
        }
    } else {
        that._showDatastreams = value;
        associatedStreams.show = value;
        if (associatedStreams.ellipse != null) {
            associatedStreams.ellipse.show = valueAsProperty;
        } else if (associatedStreams.polyline != null) {
            associatedStreams.polyline.show = valueAsProperty;
        } else if (associatedStreams.polygon != null) {
            associatedStreams.polygon.show = valueAsProperty;
        }
    }
    collection.resumeEvents();
}

export function tableCreate() {
    const body = document.getElementsByTagName("body")[0];
    const div = document.createElement("div");
    div.setAttribute("class", "cslt-table-div");
    div.setAttribute("id", "data-table-div");
    const tbl = document.createElement("table");
    tbl.setAttribute("id", "data-table");
    tbl.setAttribute("class", "cslt-table");
    const tbdy = document.createElement("tbody");
    tbdy.setAttribute("class", "cslt-table-body");
    tbdy.setAttribute("id", "data-table-body");
    const titleRow = document.createElement("tr");
    const titleColumn = document.createElement("td");
    const title = document.createTextNode("Datastreams");
    titleColumn.appendChild(title);
    titleColumn.setAttribute("colspan", "100%");
    titleRow.appendChild(titleColumn);
    titleRow.setAttribute("class", "cslt-table-title");
    tbdy.appendChild(titleRow);

    tbl.appendChild(tbdy);
    div.appendChild(tbl);
    body.appendChild(div);
    return tbl;
}

export function averageTableCreate() {
    const body = document.getElementsByTagName("body")[0];
    const div = document.createElement("div");
    div.setAttribute("class", "cslt-average-table-div");
    div.setAttribute("id", "average-table-div");
    const tbl = document.createElement("table");
    tbl.setAttribute("id", "average-table");
    tbl.setAttribute("class", "cslt-table");
    const tbdy = document.createElement("tbody");
    tbdy.setAttribute("class", "cslt-table-body");
    tbdy.setAttribute("id", "average-table-body");
    const titleRow = document.createElement("tr");
    const titleColumn = document.createElement("td");
    const title = document.createTextNode("Averages");
    titleColumn.appendChild(title);
    titleColumn.setAttribute("colspan", "100%");
    titleRow.appendChild(titleColumn);
    titleRow.setAttribute("class", "cslt-table-title");
    tbdy.appendChild(titleRow);

    tbl.appendChild(tbdy);
    div.appendChild(tbl);
    body.appendChild(div);
    return tbl;
}

export function heightReferenceCheck(point: Array<number>) {
    let heightReference = HeightReference.CLAMP_TO_GROUND;
    if (point[2] !== 0) {
        heightReference = HeightReference.RELATIVE_TO_GROUND;
    }
    return heightReference;
}

export function createShapeEntity(geoJson: OGCFeature, id: string, name: string) {
    if (typeof geoJson != "object") {
        return;
    }

    const geom = new GeoJsonDecoder(geoJson);
    const shapes = geom.getAll();
    let caseType = "default";
    if ((shapes as GeoJsonGetAllResult)[0].length !== 0) {
        caseType = "point";
    } else if ((shapes as GeoJsonGetAllResult)[1].length !== 0) {
        caseType = "line";
    } else if ((shapes as GeoJsonGetAllResult)[2].length !== 0) {
        caseType = "polygon";
    }
    let position;
    let shape;
    let shouldAdd = false;

    switch (caseType) {
        case "point": {
            shouldAdd = true;
            const point = buildPoint(shapes as GeoJsonGetAllResult);
            position = Cartesian3.fromDegrees(point[0], point[1], point[2]);
            shape = new Entity({
                id: id,
                name: name,
                show: true,
                position: position,
                ellipse: {
                    show: false,
                    semiMinorAxis: 30,
                    semiMajorAxis: 30,
                    material: Color.CYAN
                }
            });
            break;
        }
        case "line": {
            shouldAdd = true;
            const lineNoHeight = buildLineHasNoHeight(shapes as GeoJsonGetAllResult);
            if (lineNoHeight === false) {
                const line = buildLine(shapes as GeoJsonGetAllResult);
                const positions = Cartesian3.fromDegreesArrayHeights(line);
                shape = new Entity({
                    id: id,
                    name: name,
                    show: true,
                    polyline: {
                        show: false,
                        positions: positions,
                        width: 3,
                        material: Color.PURPLE
                    }
                });
            } else {
                const positions = Cartesian3.fromDegreesArray(lineNoHeight);
                shape = new Entity({
                    id: id,
                    name: name,
                    show: true,
                    polyline: {
                        show: false,
                        positions: positions,
                        width: 3,
                        material: Color.PURPLE,
                        clampToGround: true
                    }
                });
            }

            break;
        }
        case "polygon": {
            shouldAdd = true;
            const polygonNoHeight = buildPolygonHasNoHeight(shapes as GeoJsonGetAllResult);
            if ((polygonNoHeight as unknown as boolean) === false) {
                const polygon = buildPolygon(shapes as GeoJsonGetAllResult);
                const rings = polygon.length;
                let ringNum = rings;
                const holeArr = [];
                let holeObj;
                let polygonHier;

                while (ringNum) {
                    if (ringNum > 1) {
                        position = Cartesian3.fromDegreesArrayHeights(polygon[ringNum - 1]);
                        holeObj = {
                            positions: position
                        };
                        holeArr.push(holeObj);
                    } else {
                        position = Cartesian3.fromDegreesArrayHeights(polygon[ringNum - 1]);
                        polygonHier = {
                            positions: position,
                            holes: holeArr
                        };
                    }
                    ringNum--;
                }

                shape = new Entity({
                    id: id,
                    name: name,
                    show: true,
                    polygon: {
                        show: false,
                        hierarchy: polygonHier as PolygonHierarchy,
                        material: Color.ORANGE.withAlpha(0.4)
                    }
                });
            } else {
                const rings = (polygonNoHeight as Array<Array<number>>).length;
                let ringNum = rings;
                const holeArr = [];
                let holeObj;
                let polygonHier;

                while (ringNum) {
                    if (ringNum > 1) {
                        position = Cartesian3.fromDegreesArray((polygonNoHeight as Array<Array<number>>)[ringNum - 1]);
                        holeObj = {
                            positions: position
                        };
                        holeArr.push(holeObj);
                    } else {
                        position = Cartesian3.fromDegreesArray((polygonNoHeight as Array<Array<number>>)[ringNum - 1]);
                        polygonHier = {
                            positions: position,
                            holes: holeArr
                        };
                    }
                    ringNum--;
                }

                shape = new Entity({
                    id: id,
                    name: name,
                    show: true,
                    polygon: {
                        show: false,
                        hierarchy: polygonHier as PolygonHierarchy,
                        material: Color.ORANGE.withAlpha(0.4)
                    }
                });
            }

            break;
        }
    }
    if (shouldAdd) {
        return shape;
    } else {
        return false;
    }
}

/**
 * Converts a HEX formatted colour to RGBA colour values.
 *
 * @param string} hex A HEX formatted colour.
 * @returns array} rgba An array of RGBA values.
 */
export function hexToRgbA(hex: string) {
    let c: string[] | string | number;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split("");
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = `0x${c.join("")}` as unknown as number;
        return [(c >> 16) & 255, (c >> 8) & 255, c & 255, 255];
    }
    throw new Error(t("utilsHexToRgbAError1"));
}

export function colorFromRGBGradient(value: number, min: number, max: number) {
    value = value > max ? max : value < min ? min : value;
    let red = 0.0;
    let green = 0.0;
    let blue = 0.0;
    const colorFromHeight = ((value - min) * 100) / (max - min);
    if (colorFromHeight < 50) {
        blue = colorFromHeight > 25 ? 1 - (2 * (colorFromHeight - 25)) / 50 : 1.0;
        green = colorFromHeight > 25 ? 1.0 : (2 * colorFromHeight) / 50;
    } else {
        green = colorFromHeight > 75 ? 1 - (2 * (colorFromHeight - 75)) / 50 : 1.0;
        red = colorFromHeight > 75 ? 1.0 : (2 * colorFromHeight) / 50.0;
    }
    return [Color.floatToByte(red), Color.floatToByte(green), Color.floatToByte(blue), Color.floatToByte(1.0)];
}

export function rgbaToHex(rgba: number[]) {
    if (rgba.length !== 4) {
        return "#000000";
    }
    const [red, green, blue, alpha] = rgba;
    const redHex = componentToHex(red);
    const greenHex = componentToHex(green);
    const blueHex = componentToHex(blue);
    const alphaHex = componentToHex(alpha);
    return "#" + redHex + greenHex + blueHex + alphaHex;
}

function componentToHex(c: number) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

/**
 * Builds a point from the coordinates array returned from the getAll() function.
 *
 * @param array} geoJsonGetAllResult The coordinates array from the getAll() function.
 * @param number} pointIndex  The index of the point in the points array within the coordinates array. Defaults to zero if null.
 * @return array} An array containing the 3 Dimensional point, formatted [x,y,z].
 */
export function buildPoint(geoJsonGetAllResult: GeoJsonGetAllResult, pointIndex?: number) {
    if (pointIndex == undefined) {
        pointIndex = 0;
    }
    const x = geoJsonGetAllResult[0][pointIndex][0][0];
    const y = geoJsonGetAllResult[0][pointIndex][0][1];
    const z = geoJsonGetAllResult[0][pointIndex][0][2];

    return [x, y, z];
}

/**
 * Builds a line from the coordinates array returned from the getAll() function.
 *
 * @param array} geoJsonGetAllResult The coordinates array from the getAll() function.
 * @param number} lineIndex The index of the linestring in the lines array within the coordinates array. Defaults to zero if null.
 * @return array} lineDegreesArray An array containing the 3 Dimensional line.
 */
export function buildLine(geoJsonGetAllResult: GeoJsonGetAllResult, lineIndex?: number) {
    if (lineIndex == undefined) {
        lineIndex = 0;
    }
    let x;
    let y;
    let z;
    let lineDegreesArray: number[] = [];
    geoJsonGetAllResult[1][lineIndex][0].forEach(function (linePoint: GeoJSON.Position) {
        x = linePoint[0];
        y = linePoint[1];
        z = linePoint[2];
        lineDegreesArray = lineDegreesArray.concat(x, y, z);
    });

    return lineDegreesArray;
}

/**
 * Builds a polygon from the coordinates array returned from the getAll() function.
 *
 * @param array} geoJsonGetAllResult The coordinates array from the getAll() function.
 * @param number} polygonIndex The index of the polygon in the polygons array within the coordinates array. Defaults to zero if null.
 * @return array} polygonRingArray An array containing the 3 Dimensional polygon.
 */
export function buildPolygon(geoJsonGetAllResult: GeoJsonGetAllResult, polygonIndex?: number) {
    if (polygonIndex == undefined) {
        polygonIndex = 0;
    }
    let x;
    let y;
    let z;
    const polygonRingArray: number[][] = [];
    geoJsonGetAllResult[2][polygonIndex][0].forEach(function (ring: GeoJSON.Position[]) {
        let ringPointArray: number[] = [];
        ring.forEach(function (point: GeoJSON.Position) {
            x = point[0];
            y = point[1];
            z = point[3];
            ringPointArray = ringPointArray.concat(x, y, z);
        });
        polygonRingArray.push(ringPointArray);
    });

    return polygonRingArray;
}

/**
 * Builds a 2D polygon from the coordinates array returned from the getAll() function.
 *
 * @param array} geoJsonGetAllResult The coordinates array from the getAll() function.
 * @param number} polygonIndex The index of the polygon in the polygons array within the coordinates array. Defaults to zero if null.
 * @return array} polygonRingArray An array containing the 2 Dimensional polygon.
 */
export function buildPolygonHasNoHeight(
    geoJsonGetAllResult: GeoJsonGetAllResult,
    polygonIndex?: number
): Array<Array<number>> | boolean {
    if (polygonIndex == null) {
        polygonIndex = 0;
    }
    let x;
    let y;
    const polygonRingArray: number[][] = [];
    let hasHeight = false;
    geoJsonGetAllResult[2][polygonIndex][0].forEach(function (ring: GeoJSON.Position[]) {
        ring.forEach(function (point) {
            if (point[2] != 0) {
                hasHeight = true;
                return false;
            }
        });
    });
    if (hasHeight == false) {
        geoJsonGetAllResult[2][polygonIndex][0].forEach(function (ring: GeoJSON.Position[]) {
            let ringPointArray: number[] = [];
            ring.forEach(function (point) {
                x = point[0];
                y = point[1];
                ringPointArray = ringPointArray.concat([x, y]);
            });
            polygonRingArray.push(ringPointArray);
        });
    }
    return polygonRingArray;
}

/**
 * Builds a 2D line from the coordinates array returned from the getAll() function.
 *
 * @param array} geoJsonGetAllResult The coordinates array from the getAll() function.
 * @param number} lineIndex The index of the linestring in the lines array within the coordinates array. Defaults to zero if null.
 * @return array} lineDegreesArray An array containing the 2 Dimensional line.
 */
export function buildLineHasNoHeight(geoJsonGetAllResult: GeoJsonGetAllResult, lineIndex?: number) {
    if (lineIndex == undefined) {
        lineIndex = 0;
    }
    let hasHeight = false;
    geoJsonGetAllResult[1][lineIndex][0].forEach(function (linePoint: GeoJSON.Position) {
        if (linePoint[2] != 0) {
            hasHeight = true;
        }
    });
    if (hasHeight == false) {
        let lineDegreesArray: number[] = [];
        geoJsonGetAllResult[1][lineIndex][0].forEach(function (linePoint: GeoJSON.Position) {
            const x = linePoint[0];
            const y = linePoint[1];
            lineDegreesArray = lineDegreesArray.concat([x, y]);
        });
        return lineDegreesArray;
    } else {
        return false;
    }
}

/**
 * Determines whether a point is 3 Dimensional or 2 Dimensional, returns a point formatted in 3 Dimensions, defaulting a 2D point Z value to 0.
 *
 * @param array} arr The array containing the point.
 * @return array} coordinates An array containing the 3 Dimensional point.
 */
export function findPoint(arr: number[]) {
    const x = arr[0];
    const y = arr[1];
    const z = arr.length == 3 ? arr[2] : 0;
    const coordinates = [Number(x), Number(y), Number(z)];
    return coordinates;
}

/**
 * Determines whether a line is 3 Dimensional or 2 Dimensional, returns a line formatted in 3 Dimensions, defaulting 2D line Z values to 0.
 *
 * @param array} arr The array containing the line.
 * @return array} line An array containing the 3 Dimensional line.
 */
export function findLine(arr: number[][]) {
    const line: GeoJSON.LineString["coordinates"] = [];
    arr.forEach(function (element) {
        const x = element[0];
        const y = element[1];
        const z = element.length == 3 ? element[2] : 0;
        line.push([Number(x), Number(y), Number(z)]);
    });
    return line;
}

/**
 * Determines whether a polygon is 3 Dimensional or 2 Dimensional, returns a polygon formatted in 3 Dimensions, defaulting 2D polygon Z values to 0.
 *
 * @param array} arr The array containing the polygon.
 * @return array} rings The array contaiing the 3 Dimensional polygon.
 */
export function findPolygon(arr: number[][][]) {
    const rings: GeoJSON.LineString["coordinates"][] = [];
    let points: GeoJSON.Point["coordinates"][] = [];
    //ring
    arr.forEach(function (ring) {
        //line
        points = [];
        ring.forEach(function (point) {
            //point
            const x = point[0];
            const y = point[1];
            const z = point.length == 3 ? point[2] : 0;
            points.push([Number(x), Number(y), Number(z)]);
        });
        rings.push(points);
    });
    return rings;
}

/**
 * The switch called by the main switch to sort and index the geometry types of a GeoJSON object.
 *
 * @param object} object A GeoJSON object
 * @param string} type A GeoJSON feature type, if null, checks the object.
 * @return array} coordinates A coordinates array for the specified type, of the format [points, lines, polygons].
 */
export function geometryObjectSwitch(
    object:
        | GeoJSON.Point
        | GeoJSON.LineString
        | GeoJSON.Polygon
        | GeoJSON.MultiPoint
        | GeoJSON.MultiLineString
        | GeoJSON.MultiPolygon
        | Feature
        | Geometry
        | FeatureCollection
        | GeometryCollection,
    type?: string
): GeoJsonGetAllResult {
    if (type == undefined) {
        type = object.type.toLowerCase();
    }
    const points: indexedPoint[] = [];
    const lines: indexedLine[] = [];
    const polygons: indexedPolygon[] = [];
    switch (type) {
        case "point": {
            const point = findPoint((object as GeoJSON.Point).coordinates);
            points.push([point, 0]);
            break;
        }
        case "linestring": {
            const line = findLine((object as GeoJSON.LineString).coordinates);
            lines.push([line, 0]);
            break;
        }
        case "polygon": {
            const polygon = findPolygon((object as GeoJSON.Polygon).coordinates);
            polygons.push([polygon, 0]);
            break;
        }
        case "multipoint":
            (object as GeoJSON.MultiPoint).coordinates.forEach(function (element, i) {
                const point = findPoint(element);
                points.push([point, i]);
            });
            break;

        case "multilinestring":
            (object as GeoJSON.MultiLineString).coordinates.forEach(function (element, i) {
                const line = findLine(element);
                lines.push([line, i]);
            });
            break;

        case "multipolygon":
            (object as GeoJSON.MultiPolygon).coordinates.forEach(function (element, i) {
                const polygon = findPolygon(element);
                polygons.push([polygon, i]);
            });
    }
    const coordinates = [points, lines, polygons];
    return coordinates as GeoJsonGetAllResult;
}

/**
 * The main switch called to create or add to a coordinates array.
 *
 * @param object} object a GeoJSON object
 * @param array} coordinateArray A coordinates array if one already exists for the GeoJSON features to be appended to. If null, one is created.
 * @return array} coordinates A coordinates array for the specified type, of the format [points, lines, polygons].
 */
export function mainSwitch(
    object:
        | GeoJSON.Point
        | GeoJSON.LineString
        | GeoJSON.Polygon
        | GeoJSON.MultiPoint
        | GeoJSON.MultiLineString
        | GeoJSON.MultiPolygon
        | Feature
        | FeatureCollection
        | GeometryCollection,
    coordinateArray?: GeoJsonGetAllResult
) {
    let points: indexedPoint[] = [];
    let lines: indexedLine[] = [];
    let polygons: indexedPolygon[] = [];
    if (coordinateArray == null) {
        coordinateArray = [points, lines, polygons];
    }

    let coordinates: GeoJsonGetAllResult = [points, lines, polygons];
    const objectCategory =
        object.type.toLowerCase() == "feature" ||
        object.type.toLowerCase() == "geometrycollection" ||
        object.type.toLowerCase() == "featurecollection"
            ? object.type.toLowerCase()
            : "geometry";
    switch (objectCategory) {
        case "geometry": {
            const newCoordinates = geometryObjectSwitch(object);
            points = coordinateArray[0].concat(newCoordinates[0]);
            lines = coordinateArray[1].concat(newCoordinates[1]);
            polygons = coordinateArray[2].concat(newCoordinates[2]);
            coordinates = [points, lines, polygons];
            break;
        }

        case "feature": {
            coordinates = geometryObjectSwitch(
                (object as Feature).geometry,
                (object as Feature).geometry.type.toLowerCase()
            );
            break;
        }

        case "geometrycollection":
            (object as GeometryCollection).geometries.forEach(function (element) {
                const newCoordinates = mainSwitch(element, coordinateArray);
                points = coordinateArray[0].concat(newCoordinates[0]);
                lines = coordinateArray[1].concat(newCoordinates[1]);
                polygons = coordinateArray[2].concat(newCoordinates[2]);
                coordinates = [points, lines, polygons];
            });
            break;

        case "featurecollection":
            (object as FeatureCollection).features.forEach(function (element) {
                const newCoordinates = mainSwitch(element, coordinateArray);
                points = coordinateArray[0].concat(newCoordinates[0]);
                lines = coordinateArray[1].concat(newCoordinates[1]);
                polygons = coordinateArray[2].concat(newCoordinates[2]);
                coordinates = [points, lines, polygons];
            });
            break;
    }
    return coordinates;
}

export function createCogProjectionObject(epsgCode: number): {
    project: (pos: number[]) => number[];
    unproject: (pos: number[]) => number[];
} {
    const projString = getProjectionString(epsgCode);
    if (projString != null) {
        return {
            project: proj4("EPSG:4326", projString).forward,
            unproject: proj4("EPSG:4326", projString).inverse
        };
    } else {
        return {
            project: proj4("EPSG:4326", "EPSG:4326").forward,
            unproject: proj4("EPSG:4326", "EPSG:4326").inverse
        };
    }
}

export function validateMapState(json: MapState) {
    if (!json.accessToken) return false;
    if (!json.baseMapLayers) return false;
    if (!json.dataSources) return false;
    if (!json.imageLayers) return false;
    if (!json.primitiveLayers) return false;
    if (!json.terrainSets) return false;
    if (!json.cameraPosition) return false;
    if (!json.saveLayerParameters) return false;
    if (!json.catalogList) return false;
    if (!json.version) return false;
    return true;
}
