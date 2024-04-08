/**
 * FeaturesAPIDatasource.js contains a class for creating custom datasources for implementation in Cesium.
 * Supported geojson geometries and collections:
 *
 * -Point
 * -LineString
 * -Polygon
 * -MultiPoint
 * -MultiLineString
 * -MultiPolygon
 * -Feature
 * -FeatureCollection
 * -GeometryCollection
 *
 * @requires cesium.js
 *
 * @function GeoJsonDecoder
 *
 * @param {object} geoJsonObj A GeoJSON formatted object to be stored and manipulated by the class methods.
 *
 * @author Josh Hussey
 * @version 1.0.0 December 1st, 2022
 *
 */

import { Event as CesiumEvent } from "cesium";
import { OGCFeature } from "../Types/types";
import { mainSwitch } from "./Utils";

export default class GeoJsonDecorder {
    _type: string;
    _error: CesiumEvent;
    _objectType: string;
    _object: OGCFeature;

    constructor(geoJsonObj: OGCFeature) {
        this._type = "GeoJsonObj";
        this._error = new CesiumEvent();
        this._objectType = geoJsonObj.type.toString().toLowerCase();
        this._object = geoJsonObj;

        Object.defineProperties(this, {
            type: {
                get: function () {
                    return this._type;
                }
            },

            objectType: {
                get: function () {
                    return this._ObjectType;
                }
            }
        });
    }

    /**
     * Defines getters and setters available to the class.
     */

    /**
     * Gets the first point in the object. Returns false if no point exists.
     *
     * @return array|boolean} coordinates[0][0][0] An array containing the first 3 dimensional point in the coordinates array, of the format [x,y,z]. | false
     */
    getPoint() {
        const coordinates = mainSwitch(this._object);
        if (coordinates[0].length == 0) {
            console.warn("No Point");
            return false;
        }
        return coordinates[0][0][0];
    }

    /**
     * Gets the first line in the object. Returns false if no line exists.
     *
     * @return array|boolean} coordinates[2][0][0] An array containing the first 3 dimensional line in the coordinates array. | false
     */
    getLine() {
        const coordinates = mainSwitch(this._object);
        if (coordinates[1].length == 0) {
            console.warn("No Line");
            return false;
        }
        return coordinates[1][0][0];
    }

    /**
     * Gets the first polygon in the object. Returns false if no polygon exists.
     *
     * @return array|boolean} coordinates[2][0][0] An array containing the first 3 dimensional polygon in the coordinates array. | false
     */
    getPolygon() {
        const coordinates = mainSwitch(this._object);
        if (coordinates[2].length == 0) {
            console.warn("No Polygon");
            return false;
        }
        return coordinates[2][0][0];
    }

    /**
     * Gets the points in the object. Returns false if no points exist.
     *
     * @return array|boolean} coordinates[0] An array containing all 3 dimensional points in the coordinates array. | false
     */
    getPoints() {
        const coordinates = mainSwitch(this._object);
        if (coordinates[0].length == 0) {
            console.warn("No Points");
            return false;
        }
        return coordinates[0];
    }

    /**
     * Gets the lines in the object. Returns false if no lines exist.
     *
     * @return array|boolean} coordinates[1] An array containing all 3 dimensional lines in the coordinates array. | false
     */
    getLines() {
        const coordinates = mainSwitch(this._object);
        if (coordinates[1].length == 0) {
            console.warn("No Lines");
            return false;
        }
        return coordinates[1];
    }

    /**
     * Gets the polygons in the object. Returns false if no polygons exist.
     *
     * @return array|boolean} coordinates[2] An array containing all 3 dimensional points in the coordinates array. | false
     */
    getPolygons() {
        const coordinates = mainSwitch(this._object);
        if (coordinates[2].length == 0) {
            console.warn("No Polygons");
            return false;
        }
        return coordinates[2];
    }

    /**
     * Gets all of the geometries in the object. Returns false if no geometries exist.
     *
     * @return array|boolean} coordinates An array containing all geometries. | false
     */
    getAll() {
        const coordinates = mainSwitch(this._object);
        if (coordinates[0].length == 0 && coordinates[1].length == 0 && coordinates[2].length == 0) {
            console.warn("No Points, Lines, or Polygons");
            return false;
        }
        return coordinates;
    }
}
