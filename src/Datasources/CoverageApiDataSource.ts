import {
    BoundingSphere,
    Cartesian3,
    Color,
    ColorMaterialProperty,
    ComponentDatatype,
    ConstantProperty,
    Entity,
    EntityCollection,
    Geometry,
    GeometryAttribute,
    GeometryAttributes,
    GeometryInstance,
    GeometryPipeline,
    JulianDate,
    PerInstanceColorAppearance,
    PolylineGraphics,
    Primitive,
    PrimitiveType,
    Viewer
} from "cesium";
import WesDataSource from "./WesDataSource";
import KDBush from "kdbush";
import {
    AxesRange,
    CesiumRasterSymbolizer,
    CesiumWindow,
    CoverageAxesObject,
    CoverageResponse,
    FormattedUserStyles,
    UserStyleDefinition,
    ServiceInfo,
    ImageryBounds,
    LegendSource
} from "../Types/types";
import { SldParse } from "../Utils/Wes3dSldStyler";
import { translate as t } from "../i18n/Translator"
import { DatasourceTypes } from "../Constants";

type QueryParameters = {
    [key: string]: string;
};

type CoverageDomainSet = {
    generalGrid: CoverageDomainGeneralGrid;
    type: "DomainSet";
};

type CoverageDomainGeneralGrid = {
    axis: (RegularDomainAxis | IrregularDomainAxis)[];
    axisLabels: string[];
    gridLimits: CoverageGridLimits;
    srsName: string;
    type: "GeneralGridCoverage";
};

type CoverageGridLimits = {
    axis: IndexAxis[];
    type: "GridLimits";
    srsName: string;
    axisLabels: string[];
};

type IndexAxis = {
    type: "IndexAxis";
    axisLabels: string;
    lowerBound: number;
    upperBound: number;
};

type RegularDomainAxis = {
    axisLabels: string;
    uomLabel: string;
    upperBound: number;
    lowerBound: number;
    resolution: number;
    type: "RegularAxis";
};

type IrregularDomainAxis = {
    axisLabels: string;
    uomLabel: string;
    coordinate: string[];
    type: "IrregularAxis";
};

/**
 * Enum representing different dimensions of coverage data.
 * @enum {string}
 */
enum Dimensions {
    D3T = "3d-temporal",
    D3 = "3d",
    D2T = "2d-temporal",
    D2 = "2d"
}

const LINE_WIDTH_PROPERTY = new ConstantProperty(5);
const HEIGHT_SCALE_FACTOR = 300;
const MAX_COVERAGE_RESOLUTION = 50000;
const DEFAULT_ALPHA = 0.5;

const CesiumClient = window as CesiumWindow;
/**
 * Class representing a data source for rendering coverage information.
 * @extends {WesDataSource}
 */
export default class CoverageApiDataSource extends WesDataSource {
    _id: string;
    _uid: string;
    _listener?;
    _index: string;
    _collectionInformation?: { defaultStyle: string; };
    _maxResolution: number;
    _parameterKey: string;
    _selectedTime: number;
    _elementSize: number;
    _tree?: KDBush;
    _xIndex?: number;
    _yIndex?: number;
    _zIndex?: number;
    _tIndex?: number;
    _xIncrement?: number;
    _yIncrement?: number;
    _xStart?: number;
    _yStart?: number;
    _xStop?: number;
    _yStop?: number;
    _size1?: number;
    _size2?: number;
    _size3?: number;
    _size4?: number;
    _shape?: number[];
    _values?: number[];
    _dimensions?: Dimensions;
    _maxValue?: number;
    _minValue?: number;
    _bc?: number;
    _renderStyles?: string;
    _heightExaggeration: number;
    _alpha: number;
    _renderedPrimitive?: Primitive;
    _pointsInViewport: number[];
    _timeRange?: [string, string];
    _promptOpen: boolean;
    _upperTimeBound?: JulianDate;
    _lowerTimeBound?: JulianDate;
    _currentTimeString?: string;
    _timeIndex?: number;
    _timeStamps?: string[];
    _timeIndexMap: Map<number, number>;
    _hasLegend: boolean;
    _uom?: string;
    _userStyles?: UserStyleDefinition[];
    _formattedStyles?: FormattedUserStyles;
    _rasterSymbolizer?: CesiumRasterSymbolizer;
    _geometryBounds: ImageryBounds;
    show: boolean;
    maxResolution: number;
    heightExaggeration: number;
    alpha: number;
    geometryBounds: ImageryBounds;

    /**
     * Constructor for CoverageApiDataSource class.
     * @param {string} description - Description of the data source.
     * @param {string} name - Name of the data source.
     * @param {string} url - URL of the data source.
     * @param {Viewer} viewer - Cesium Viewer object.
     * @param {string} id - ID of the data source.
     * @param {number} index - Index of the data source.
     * @param {string} uid - Unique identifier.
     */
    constructor(
        description: string,
        name: string,
        url: string,
        viewer: Viewer,
        id: string,
        index: string,
        uid: string,
        geometryBounds: ImageryBounds,
        serviceInfo: ServiceInfo
    ) {
        super(description, name, url, viewer, uid, serviceInfo);
        this._id = id;
        this._index = index;
        this._geometryBounds = geometryBounds;
        this.geometryBounds = this._geometryBounds;
        this._listener = () => {
            this.updateService(null);
        };
        this._maxResolution = MAX_COVERAGE_RESOLUTION;
        this.maxResolution = this._maxResolution;
        this._heightExaggeration = HEIGHT_SCALE_FACTOR;
        this.heightExaggeration = this._heightExaggeration;
        this._parameterKey = id;
        this.initialize(Number.POSITIVE_INFINITY);
        this._selectedTime = 0;
        this._elementSize = 0;
        this._alpha = DEFAULT_ALPHA;
        this.alpha = this._alpha;
        this._pointsInViewport = [];
        this._promptOpen = false;
        this._uid = uid;
        this._timeIndex = undefined;
        this._timeIndexMap = new Map();
        this._hasLegend = true;
        this.show = true;
        Object.defineProperties(this, {
            show: {
                get: function () {
                    if (!this._renderedPrimitive) return null;
                    return this._renderedPrimitive.show;
                },
                set: function (value) {
                    if (this._renderedPrimitive) {
                        this._renderedPrimitive.show = value;
                        this._show = value;
                    }
                }
            },

            maxResolution: {
                get: function () {
                    return this._maxResolution;
                },
                set: function (value) {
                    this._maxResolution = value;
                    this._renderCoverage();
                }
            },

            heightExaggeration: {
                get: function () {
                    return this._heightExaggeration;
                },
                set: function (value) {
                    this._heightExaggeration = value;
                    this._renderCoverage();
                }
            },

            alpha: {
                get: function () {
                    return this._alpha;
                },
                set: function (value) {
                    this._alpha = value;
                    this._renderCoverage();
                }
            },

            geometryBounds: {
                get: function () {
                    return this._geometryBounds;
                }
            }
        });
    }

    /**
     * Asynchronously loads service data.
     * Makes request to service and validates the response.
     * Populatres object fields with data from response.
     * @async
     */
    async loadService() {
        try {
            this._isLoading = true;

            CesiumClient.addEventListener("timeChanged", this._listener as EventListener);
            const domainSet = await this.getDomainSet(this._url.split("?")[0]);
            if (!domainSet) return;
            this._checkBounds(domainSet);
            this._getSelectedTime();
            this._getTimeRange();
            const response = await this.getData(this._url.split("?")[0]);
            const isValid = this.validateResponse(response);
            if (!isValid) return;
            this._values = response.ranges[this._parameterKey].values;
            this._uom = response.parameters[this._parameterKey].unit.symbol;
            this._setShape(response);
            this._setIndexes(response);
            this._setElementSize();
            this._defineTree(response);
            this._setIncrements(response);
            this.setColorMinMax();
            this._populateTree(response);
            this._pointsInViewport = this._requestFromTree();
            const styles = await this._fetchStyles();
            if (styles) {
                this._userStyles = styles[0] as UserStyleDefinition[];
                this._formattedStyles = styles[1] as FormattedUserStyles;
            }
            if (
                this._formattedStyles &&
                this._formattedStyles[0] &&
                this._formattedStyles[0][0] &&
                this._formattedStyles[0][0].rasterSymbolizers &&
                this._formattedStyles[0][0].rasterSymbolizers[0]
            ) {
                const rasterSymbolizer = this._formattedStyles[0][0].rasterSymbolizers[0];
                if (rasterSymbolizer.colorMap && rasterSymbolizer.colorMap.length)
                    this._rasterSymbolizer = rasterSymbolizer;
            }
            if (this._rasterSymbolizer) {
                const colorMap = this._rasterSymbolizer.colorMap;
                this._minValue = colorMap[0].quantity;
                this._maxValue = colorMap[colorMap.length - 1].quantity;
                //this._alpha = this._rasterSymbolizer.opacity;
            }
            this._initSourcesWithLayers();
            if (!this._pointsInViewport) return;
            this._renderCoverage();
        } finally {
            this._isLoading = false;
        }
    }

    /**
     * Updates the service data.
     */
    updateService(id: number|null) {
        id;
        if (
            !this._show ||
            !this._values ||
            this._xStart == null ||
            this._yStart == null ||
            this._xIncrement == null ||
            this._yIncrement == null ||
            this._minValue == null ||
            this._maxValue == null
        )
            return;
        this._getSelectedTime();
        if (this._checkRequestRequired()) this._getNewCoverageData();
        this._pointsInViewport = this._requestFromTree();
        if (!this._pointsInViewport) return;
        this._renderCoverage();
    }

    async _fetchStyles() {
        let url = this._url;
        if (url.endsWith("/")) url = url.slice(0, -1);
        const urlArr = url.split("/");
        urlArr.pop();
        url = urlArr.join("/");
        const response = await this.fetchJson(url, { f: "json" });
        let styleUrl = "";
        if (
            response.styles &&
            response.styles.length &&
            response.styles[0].links &&
            response.styles[0].links.length &&
            response.styles[0].links[0].href
        ) {
            styleUrl = response.styles[0].links[0].href;
        }
        if (styleUrl === "" && response.collections) {
            styleUrl = response.collections[0]?.styles[0]?.links[0]?.href;
        }
        if (styleUrl == null) return null;
        return await SldParse(styleUrl.split("?")[0], this, this._parameterKey);
    }

    /**
     * Asynchronously fetches new coverage data, processes it, and triggers rendering.
     * @returns {Promise<void>} A Promise that resolves once the data retrieval and rendering are complete.
     */
    async _getNewCoverageData(): Promise<void> {
        this._getTimeRange();
        const response = await this.getData(this._url.split("?")[0]);
        const isValid = this.validateResponse(response);
        if (!isValid) return;
        this._values = response.ranges[this._parameterKey].values;
        this._setShape(response);
        this._setIndexes(response);
        this._setElementSize();
        this._defineTree(response);
        this._setIncrements(response);
        this.setColorMinMax();
        this._populateTree(response);
    }

    /**
     * Checks if a new data request is required based on the current time index.
     * @throws {Error} Throws an error if the time index is null.
     * @returns {boolean} True if a new data request is required, false otherwise.
     */
    _checkRequestRequired(): boolean {
        if (this._timeIndex == null) return false;
        if (this._timeIndexMap.has(this._timeIndex)) return false;
        return true;
    }

    /**
     * Checks the bounds of the coverage domain and extracts time-related information.
     * @param {CoverageDomainSet} domainSet - The coverage domain set containing axis information.
     * @returns {void}
     */
    _checkBounds(domainSet: CoverageDomainSet): void {
        const domainAxes = domainSet.generalGrid.axis;
        for (let i = 0; i < domainAxes.length; i++) {
            const axis = domainAxes[i];
            if (axis.axisLabels === "t") {
                if (axis.type !== "IrregularAxis") return;
                if (axis.coordinate.length < 2) return;
                this._timeStamps = axis.coordinate;
                this._lowerTimeBound = JulianDate.fromDate(new Date(axis.coordinate[0]));
                this._upperTimeBound = JulianDate.fromDate(new Date(axis.coordinate[axis.coordinate.length - 1]));
                const tOld = axis.coordinate[axis.coordinate.length - 2];
                const tNew = axis.coordinate[axis.coordinate.length - 1];
                const tempTimeMap = CesiumClient.timeMap();
                tempTimeMap.set(this._uid, [this._lowerTimeBound, this._upperTimeBound]);
                CesiumClient.setTimeMap(tempTimeMap);
                this._timeRange = [tOld, tNew];
                return;
            }
        }
    }

    /**
     * Determines the time range for data rendering based on the current time index and available time stamps.
     * @returns {void}
     */
    _getTimeRange(): void {
        if (this._timeStamps == null) return;
        if (this._timeIndex == null) this._timeIndex = 0;
        this._timeRange = [this._timeStamps[this._timeIndex], this._timeStamps[this._timeIndex]];
        this._timeIndexMap.set(0, 0);
        return;
        // if (this._timeIndex < 3) {
        //     this._timeRange = [this._timeStamps[0], this._timeStamps[4]];
        //     this._timeIndexMap.set(0, 0);
        //     this._timeIndexMap.set(1, 1);
        //     this._timeIndexMap.set(2, 2);
        //     this._timeIndexMap.set(3, 3);
        //     this._timeIndexMap.set(4, 4);
        // } else if (this._timeIndex > this._timeStamps.length - 4) {
        //     this._timeRange = [this._timeStamps[this._timeStamps.length - 5], this._timeStamps[this._timeStamps.length - 1]];
        //     this._timeIndexMap.set(this._timeStamps.length - 5, 0);
        //     this._timeIndexMap.set(this._timeStamps.length - 4, 1);
        //     this._timeIndexMap.set(this._timeStamps.length - 3, 2);
        //     this._timeIndexMap.set(this._timeStamps.length - 2, 3);
        //     this._timeIndexMap.set(this._timeStamps.length - 1, 4);
        // } else {
        //     this._timeRange = [this._timeStamps[this._timeIndex - 2], this._timeStamps[this._timeIndex + 2]];
        //     this._timeIndexMap.set(this._timeIndex - 2, 0);
        //     this._timeIndexMap.set(this._timeIndex - 1, 1);
        //     this._timeIndexMap.set(this._timeIndex, 2);
        //     this._timeIndexMap.set(this._timeIndex + 1, 3);
        //     this._timeIndexMap.set(this._timeIndex + 2, 4);
        // }
    }

    /**
     * Retrieves the selected time based on the current viewer's time and updates the time index accordingly.
     * @returns {void}
     */
    _getSelectedTime(): void {
        if (!this._timeStamps) return;
        const currentTime = CesiumClient.Map3DViewer.clock.currentTime;
        let timeIndex = 0;
        let secondsDiffHolder = 0;
        for (let i = 0; i < this._timeStamps.length; i++) {
            const julianDate = JulianDate.fromDate(new Date(this._timeStamps[i]));
            const secondsDiff = Math.abs(JulianDate.secondsDifference(currentTime, julianDate));
            if (i === 0) {
                secondsDiffHolder = secondsDiff;
            } else if (secondsDiff < secondsDiffHolder) {
                secondsDiffHolder = secondsDiff;
                timeIndex = i;
            }
        }
        this._timeIndex = timeIndex;
        this._currentTimeString = this._timeStamps[timeIndex];
    }

    async _initSourcesWithLayers() {
        const sourcesWithLegends = CesiumClient.sourcesWithLegends();
        const selectedDate =
            this._currentTimeString == null ? null : JulianDate.fromDate(new Date(this._currentTimeString));
        const styles = this._formattedStyles;
        let sourceWithLegend: LegendSource;
        if (
            styles &&
            styles.length &&
            styles[0].length &&
            styles[0][0].rasterSymbolizers &&
            styles[0][0].rasterSymbolizers[0]
        ) {
            const symbolizer = styles[0][0].rasterSymbolizers[0];
            sourceWithLegend = {
                uid: this._uid,
                minValue: this._minValue,
                maxValue: this._maxValue,
                id: this._id,
                uom: this._uom,
                currentTime: selectedDate as JulianDate,
                lowerTimeBound: this._lowerTimeBound as JulianDate,
                upperTimeBound: this._upperTimeBound as JulianDate,
                symbolizer: symbolizer,
                type: DatasourceTypes.OgcCoveragesAPI
            };
        } else {
            sourceWithLegend = {
                uid: this._uid,
                minValue: this._minValue,
                maxValue: this._maxValue,
                id: this._id,
                uom: this._uom,
                currentTime: selectedDate as JulianDate,
                lowerTimeBound: this._lowerTimeBound as JulianDate,
                upperTimeBound: this._upperTimeBound as JulianDate,
                type: DatasourceTypes.OgcCoveragesAPI
            };
        }

        sourcesWithLegends.push(sourceWithLegend);

        CesiumClient.setSourcesWithLegends(sourcesWithLegends);
    }

    /**
     * Retrieve data from the spatial tree within the bounding box.
     * @returns {Array} An array of data points within the bounding box.
     */
    _requestFromTree(): number[] {
        if (!this._tree || this._bbox == null) return [];
        return this._tree.range(
            this._bbox[0] - Math.abs(this._bbox[0] * 0.25),
            this._bbox[1] - Math.abs(this._bbox[1] * 0.15),
            this._bbox[2],
            this._bbox[3] + Math.abs(this._bbox[3] * 0.15)
        );
    }

    /**
     * Populate the spatial tree with data based on the provided response.
     * @param {CoverageResponse} response - The response containing coverage data.
     */
    _populateTree(response: CoverageResponse) {
        if (
            !this._tree ||
            this._xStart == null ||
            this._yStart == null ||
            this._xIndex == null ||
            this._yIndex == null ||
            !this._xIncrement ||
            !this._yIncrement
        )
            return;
        const xLength = response.ranges[this._parameterKey].shape[this._xIndex];
        const yLength = response.ranges[this._parameterKey].shape[this._yIndex];
        const xycells = xLength * yLength;
        for (let i = 0; i < xycells; i++) {
            const x = this.flatToMultiIndex(i, "x");
            const y = this.flatToMultiIndex(i, "y");
            if (x == null || y == null) return;
            const xDeg = this._xStart + x * this._xIncrement;
            const yDeg = this._yStart + y * this._yIncrement;
            if (x == null || y == null) {
                console.error(t("coverageDatasourcePopulateTreeError1"));
                return;
            }
            this._tree.add(xDeg, yDeg);
        }
        this._tree.finish();
    }

    /**
     * Set incremental values for the x and y axes based on the provided response.
     * @param {CoverageResponse} response - The response containing coverage data.
     */
    _setIncrements(response: CoverageResponse) {
        if ((response.domain.axes.x as number[]).length | (response.domain.axes.y as number[]).length) return;
        const xDomain = response.domain.axes.x as AxesRange;
        const yDomain = response.domain.axes.y as AxesRange;
        this._xStart = xDomain.start;
        this._yStart = yDomain.start;
        this._xStop = xDomain.stop;
        this._yStop = yDomain.stop;
        this._xIncrement = Number(((xDomain.stop - xDomain.start) / xDomain.num).toFixed(3));
        this._yIncrement = Number(((yDomain.stop - yDomain.start) / yDomain.num).toFixed(3));
    }

    /**
     * Define a spatial tree instance based on the dimensions provided in the response.
     * @param {CoverageResponse} response - The response containing coverage data.
     */
    _defineTree(response: CoverageResponse) {
        if (this._xIndex == null || this._yIndex == null) return;
        const x = response.ranges[this._parameterKey].shape[this._xIndex];
        const y = response.ranges[this._parameterKey].shape[this._yIndex];
        this._tree = new KDBush(x * y, 64);
    }

    /**
     * Set indexes for the x, y, z, and t axes based on their names in the response.
     * @param {CoverageResponse} response - The response containing coverage data.
     */
    _setIndexes(response: CoverageResponse) {
        this._xIndex = response.ranges[this._parameterKey].axisNames.indexOf("x");
        this._yIndex = response.ranges[this._parameterKey].axisNames.indexOf("y");
        this._zIndex = response.ranges[this._parameterKey].axisNames.indexOf("z");
        this._tIndex = response.ranges[this._parameterKey].axisNames.indexOf("t");
    }

    /**
     * Calculate RGB color representation based on a given value.
     * @param {number} value - The value to calculate color for.
     * @returns {Array} An array representing the RGB color.
     */
    _getColors(value: number): number[] {
        if (this._rasterSymbolizer) {
            return this._getColorsSld(value);
        }
        const minColor = this._minValue as number;
        const maxColor = this._maxValue as number;
        value = value > maxColor ? maxColor : value < minColor ? minColor : value;
        let red = 0.0;
        let green = 0.0;
        let blue = 0.0;
        const colorFromHeight = ((value - minColor) * 100) / (maxColor - minColor);
        if (colorFromHeight < 50) {
            blue = colorFromHeight > 25 ? 1 - (2 * (colorFromHeight - 25)) / 50 : 1.0;
            green = colorFromHeight > 25 ? 1.0 : (2 * colorFromHeight) / 50;
        } else {
            green = colorFromHeight > 75 ? 1 - (2 * (colorFromHeight - 75)) / 50 : 1.0;
            red = colorFromHeight > 75 ? 1.0 : (2 * colorFromHeight) / 50.0;
        }
        return [
            Color.floatToByte(red),
            Color.floatToByte(green),
            Color.floatToByte(blue),
            Color.floatToByte(this._alpha)
        ];
    }

    _getColorsSld(value: number): number[] {
        if (!this._rasterSymbolizer) {
            return [0, 0, 0, 0];
        }
        const colorMap = this._rasterSymbolizer.colorMap;

        const minVal = colorMap[0].quantity;
        const maxVal = Number(colorMap[colorMap.length - 1].quantity);
        value = Math.min(Math.max(value, minVal), maxVal);

        //        value = Math.min(
        //    Math.max(value, colorMap[colorMap.length - 1].quantity),
        //    colorMap[0].quantity,
        //  );

        let colorIndex = 0;
        for (let i = colorMap.length - 1; i >= 0; i--) {
            if (value > colorMap[i].quantity) {
                colorIndex = i;
                break;
            }

            if (value === colorMap[i].quantity) {
                const color = colorMap[i].color;
                return [
                    Color.floatToByte(color.red),
                    Color.floatToByte(color.green),
                    Color.floatToByte(color.blue),
                    Color.floatToByte(this._alpha)
                ];
            }
        }

        const fraction =
            (value - Number(colorMap[colorIndex].quantity)) /
            (Number(colorMap[colorIndex + 1].quantity) - Number(colorMap[colorIndex].quantity));

        let lerped = new Color();
        lerped = Color.lerp(colorMap[colorIndex].color, colorMap[colorIndex + 1].color, fraction, lerped);

        return [
            Color.floatToByte(lerped.red),
            Color.floatToByte(lerped.green),
            Color.floatToByte(lerped.blue),
            Color.floatToByte(this._alpha)
        ];
    }

    /**
     * Calculate Cartesian coordinates and color for a point in space.
     * @param {number} centerX - The x index of the center point.
     * @param {number} centerY - The y index of the center point.
     * @param {number} offsetX - The offset in x direction.
     * @param {number} offsetY - The offset in y direction.
     * @returns {Array} An array containing Cartesian coordinates and color information.
     */
    _getCartesianAndColor(
        centerX: number,
        centerY: number,
        offsetX: number,
        offsetY: number,
        isLastX?: boolean
    ): [Cartesian3, number[], boolean] {
        if (
            this._minValue == null ||
            this._values == null ||
            this._xStart == null ||
            this._yStart == null ||
            this._xIncrement == null ||
            this._yIncrement == null
        ) {
            throw new Error(t("coverageDatasourceGetCatesianAndColorError1"));
        }
        let x = this._xStart + (centerX + offsetX) * this._xIncrement;
        if (isLastX) {
            x = 180;
        }
        const y = this._yStart + (centerY + offsetY) * this._yIncrement;
        const z =
            this._values[
                this.multiToFlatIndex(
                    centerX + offsetX,
                    centerY + offsetY,
                    undefined,
                    this._timeIndexMap.get(this._timeIndex as number) as number
                ) as number
            ];
        const color = this._getColors(z);
        const cart: Cartesian3 = Cartesian3.fromDegrees(x, y, (1 + z - this._minValue) * this._heightExaggeration);
        if (z == null) return [cart, color, false];
        return [cart, color, true];
    }

    /**
     * Render the coverage data using different visualization styles.
     * This method populates the viewer with graphical representations of the coverage data based on the chosen visualization style.
     * @private
     */
    _renderCoverage() {
        if (
            !this._tree ||
            this._values == null ||
            this._xStart == null ||
            this._yStart == null ||
            this._xIndex == null ||
            this._yIndex == null ||
            !this._xIncrement ||
            !this._yIncrement
        )
            return;
        const indexFactor = Math.ceil(this._pointsInViewport.length / this._maxResolution);
        if (this._renderedPrimitive) {
            this._viewer.scene.primitives.remove(this._renderedPrimitive);
        }
        this._renderStyles = "surface";
        switch (this._renderStyles) {
            case "surface": {
                const isWorld = this._bbox.join("") === "-180-9018090";
                const geometryInstances = [];
                const highestIndex = this._pointsInViewport.reduce((a, b) => Math.max(a, b), Number.NEGATIVE_INFINITY);
                const lowestIndex = this._pointsInViewport.reduce((a, b) => Math.min(a, b), Number.POSITIVE_INFINITY);
                const xLowest = this.flatToMultiIndexCorrect(lowestIndex, "x");
                const yLowest = this.flatToMultiIndexCorrect(lowestIndex, "y");
                const xHighest = this.flatToMultiIndexCorrect(highestIndex, "x");
                const yHighest = this.flatToMultiIndexCorrect(highestIndex, "y");
                if (xLowest == null || xHighest == null || yLowest == null || yHighest == null) {
                    console.error(t("coverageDatasourceRenderCoverageError1"));
                    return;
                }
                const xLength = Math.abs(xHighest - xLowest) + this._elementSize - 1;
                const yLength = Math.abs(yHighest - yLowest);
                const counter = 1;
                if (this._minValue == null) return;
                for (let i = 0; i < xLength; i += 2) {
                    for (let j = 0; j < yLength; j += 2) {
                        const positions = [];
                        const colors = [];
                        const indices = [];
                        const ii = i + 1 + xLowest;
                        const jj = j + 1 + yLowest;

                        const [cart1, color1, notNull1] = this._getCartesianAndColor(ii, jj, 0, 0);
                        if (!notNull1) continue;
                        const [cart2, color2, notNull2] = this._getCartesianAndColor(ii, jj, 0, -1);
                        const [cart3, color3, notNull3] = this._getCartesianAndColor(ii, jj, -1, -1);
                        const [cart4, color4, notNull4] = this._getCartesianAndColor(ii, jj, -1, 0);

                        positions.push(
                            cart1.x,
                            cart1.y,
                            cart1.z,
                            cart2.x,
                            cart2.y,
                            cart2.z,
                            cart3.x,
                            cart3.y,
                            cart3.z,
                            cart4.x,
                            cart4.y,
                            cart4.z
                        );
                        colors.push(
                            color1[0],
                            color1[1],
                            color1[2],
                            color1[3],
                            color2[0],
                            color2[1],
                            color2[2],
                            color2[3],
                            color3[0],
                            color3[1],
                            color3[2],
                            color3[3],
                            color4[0],
                            color4[1],
                            color4[2],
                            color4[3]
                        );
                        if (notNull2 && notNull3) indices.push(0, 1, 2);
                        if (cart3 !== null && cart4 !== null) indices.push(0, 2, 3);

                        if (j < yLength - 1 && i < xLength - 1) {
                            const [cart5, color5, notNull5] = this._getCartesianAndColor(ii, jj, -1, 1);
                            const [cart6, color6, notNull6] = this._getCartesianAndColor(ii, jj, 0, 1);
                            const [cart7, color7, notNull7] = this._getCartesianAndColor(ii, jj, 1, 1);
                            const [cart8, color8, notNull8] = this._getCartesianAndColor(ii, jj, 1, 0);
                            const [cart9, color9, notNull9] = this._getCartesianAndColor(ii, jj, 1, -1);
                            positions.push(
                                cart5.x,
                                cart5.y,
                                cart5.z,
                                cart6.x,
                                cart6.y,
                                cart6.z,
                                cart7.x,
                                cart7.y,
                                cart7.z,
                                cart8.x,
                                cart8.y,
                                cart8.z,
                                cart9.x,
                                cart9.y,
                                cart9.z
                            );
                            colors.push(
                                color5[0],
                                color5[1],
                                color5[2],
                                color5[3],
                                color6[0],
                                color6[1],
                                color6[2],
                                color6[3],
                                color7[0],
                                color7[1],
                                color7[2],
                                color7[3],
                                color8[0],
                                color8[1],
                                color8[2],
                                color8[3],
                                color9[0],
                                color9[1],
                                color9[2],
                                color9[3]
                            );
                            if (notNull4 && notNull5) indices.push(0, 3, 4);
                            if (notNull5 && notNull6) indices.push(0, 4, 5);
                            if (notNull6 && notNull7) indices.push(0, 5, 6);
                            if (notNull7 && notNull8) indices.push(0, 6, 7);
                            if (notNull8 && notNull9) indices.push(0, 7, 8);
                            if (notNull9 && notNull2) indices.push(0, 8, 1);
                        } else if (j < yLength - 1 && i == xLength - 1) {
                            const [cart5, color5, notNull5] = this._getCartesianAndColor(ii, jj, -1, 1);
                            const [cart6, color6, notNull6] = this._getCartesianAndColor(ii, jj, 0, 1);
                            positions.push(cart5.x, cart5.y, cart5.z, cart6.x, cart6.y, cart6.z);
                            colors.push(
                                color5[0],
                                color5[1],
                                color5[2],
                                color5[3],
                                color6[0],
                                color6[1],
                                color6[2],
                                color6[3]
                            );
                            if (notNull4 && notNull5) indices.push(0, 3, 4);
                            if (notNull5 && notNull6) indices.push(0, 4, 5);
                            if (isWorld) {
                                const [cart7, color7, notNull7] = this._getCartesianAndColor(xLowest, jj, 0, 1, true);
                                const [cart8, color8, notNull8] = this._getCartesianAndColor(xLowest, jj, 0, 0, true);
                                const [cart9, color9, notNull9] = this._getCartesianAndColor(xLowest, jj, 0, -1, true);
                                positions.push(
                                    cart7.x,
                                    cart7.y,
                                    cart7.z,
                                    cart8.x,
                                    cart8.y,
                                    cart8.z,
                                    cart9.x,
                                    cart9.y,
                                    cart9.z
                                );
                                colors.push(
                                    color7[0],
                                    color7[1],
                                    color7[2],
                                    color7[3],
                                    color8[0],
                                    color8[1],
                                    color8[2],
                                    color8[3],
                                    color9[0],
                                    color9[1],
                                    color9[2],
                                    color9[3]
                                );
                                if (notNull6 && notNull7) indices.push(0, 5, 6);
                                if (notNull7 && notNull8) indices.push(0, 6, 7);
                                if (notNull8 && notNull9) indices.push(0, 7, 8);
                                if (notNull9 && notNull2) indices.push(0, 8, 1);
                            }
                        }

                        // else if (j < yLength - 1 && (i == xLength - 1)) {
                        //     const [cart5, color5] = this._getCartesianAndColor(ii, jj, -1, 1);
                        //     const [cart6, color6] = this._getCartesianAndColor(ii, jj, 0, 1);
                        //     const [cart10, color10] = this._getCartesianAndColor(xLowest, jj, 0, 1, true);
                        //     const [cart11, color11] = this._getCartesianAndColor(xLowest, jj, 0, 0, true);
                        //     const [cart12, color12] = this._getCartesianAndColor(xLowest, jj, 0, -1, true);
                        //     positions.push(cart5.x, cart5.y, cart5.z, cart6.x, cart6.y, cart6.z, cart10.x, cart10.y, cart10.z, cart11.x, cart11.y, cart11.z, cart12.x, cart12.y, cart12.z);
                        //     colors.push(color5[0], color5[1], color5[2], color5[3], color6[0], color6[1], color6[2], color6[3], color10[0], color10[1], color10[2], color10[3], color11[0], color11[1], color11[2], color11[3], color12[0], color12[1], color12[2], color12[3]);
                        //     if(cart5 !== null && cart6 !== null) indices.push(0, 3, 4);
                        //     if(cart5 !== null && cart6 !== null) indices.push(0, 4, 5);
                        //     if(cart5 !== null && cart6 !== null) indices.push(0, 5, 6);
                        //     if(cart5 !== null && cart6 !== null) indices.push(0, 6, 7);
                        //     if(cart5 !== null && cart6 !== null) indices.push(0, 7, 8);
                        //     if(cart5 !== null && cart6 !== null) indices.push(0, 8, 1);
                        // }
                        else if (j == yLength - 1 && i < xLength - 1) {
                            const [cart5, color5, notNull5] = this._getCartesianAndColor(ii, jj, 1, 0);
                            const [cart6, color6, notNull6] = this._getCartesianAndColor(ii, jj, 1, -1);
                            positions.push(cart5.x, cart5.y, cart5.z, cart6.x, cart6.y, cart6.z);
                            colors.push(
                                color5[0],
                                color5[1],
                                color5[2],
                                color5[3],
                                color6[0],
                                color6[1],
                                color6[2],
                                color6[3]
                            );
                            if (notNull5 && notNull6) indices.push(0, 4, 5);
                            if (notNull6 && notNull2) indices.push(0, 5, 1);
                        } else if (j == yLength - 1 && i == xLength - 1 && isWorld) {
                            const [cart5, color5, notNull5] = this._getCartesianAndColor(xLowest, jj, 0, 0, true);
                            const [cart6, color6, notNull6] = this._getCartesianAndColor(xLowest, jj, 0, -1, true);
                            positions.push(cart5.x, cart5.y, cart5.z, cart6.x, cart6.y, cart6.z);
                            colors.push(
                                color5[0],
                                color5[1],
                                color5[2],
                                color5[3],
                                color6[0],
                                color6[1],
                                color6[2],
                                color6[3]
                            );
                            if (notNull5 && notNull6) indices.push(0, 4, 5);
                            if (notNull6 && notNull2) indices.push(0, 5, 1);
                        }

                        // if ((j == yLength - 1 ) && (i == xLength - 1 )) {
                        //     const [cart10, color10] = this._getCartesianAndColor(xLowest , jj, 0, -1);
                        //     const [cart11, color11] = this._getCartesianAndColor(xLowest , jj, 0, -0);
                        //     positions.push(cart10.x, cart10.y, cart10.z, cart11.x, cart11.y, cart11.z);
                        //     colors.push(color10[0], color10[1], color10[2], color10[3], color11[0], color11[1], color11[2], color11[3]);
                        //     indices.push(0, 6, 1)
                        //     indices.push(0, 7, 6)
                        // }

                        const geometryAttributes = new GeometryAttributes();
                        geometryAttributes.position = new GeometryAttribute({
                            componentDatatype: ComponentDatatype.DOUBLE,
                            componentsPerAttribute: 3,
                            values: positions
                        });
                        geometryAttributes.color = new GeometryAttribute({
                            componentDatatype: ComponentDatatype.UNSIGNED_BYTE,
                            componentsPerAttribute: 4,
                            normalize: true,
                            values: new Uint8Array(colors)
                        });
                        const geometry = new Geometry({
                            attributes: geometryAttributes,
                            primitiveType: PrimitiveType.TRIANGLES,
                            boundingSphere: BoundingSphere.fromVertices(positions),
                            indices: new Uint32Array(indices)
                        });
                        GeometryPipeline.computeNormal(geometry);
                        geometryInstances.push(
                            new GeometryInstance({
                                geometry: geometry,
                                id: `coverageinstance${counter}`
                            })
                        );
                    }
                }

                this._renderedPrimitive = this._viewer.scene.primitives.add(
                    new Primitive({
                        asynchronous: false,
                        geometryInstances: geometryInstances,
                        appearance: new PerInstanceColorAppearance()
                    })
                ); //{ flat: true }) }));
                break;
            }

            case "polyline": {
                for (let i = 0; i < this._pointsInViewport.length; i = i + indexFactor) {
                    const xIndex = this.flatToMultiIndex(this._pointsInViewport[i], "x");
                    const yIndex = this.flatToMultiIndex(this._pointsInViewport[i], "y");
                    if (xIndex == null || yIndex == null) return;
                    const xDeg = this._xStart + this._xIncrement * xIndex;
                    const yDeg = this._yStart + this._yIncrement * yIndex;
                    const minColor = -20; //this._minValue;
                    const maxColor = 40; //this._maxValue;
                    const currentValue = this._values[this._pointsInViewport[i]];
                    const colorFromHeight = ((currentValue - minColor) * 100) / (maxColor - minColor);
                    const green = (colorFromHeight > 50 ? 1 - (2 * (colorFromHeight - 50)) / 100.0 : 1.0) * 255;
                    const red = (colorFromHeight > 50 ? 1.0 : (2 * colorFromHeight) / 100.0) * 255;
                    const blue = 0.0;
                    const lineColor = new ColorMaterialProperty(Color.fromBytes(red, green, blue, 127));
                    (this._entityCollection as EntityCollection).add(
                        new Entity({
                            polyline: new PolylineGraphics({
                                positions: [
                                    Cartesian3.fromDegrees(xDeg, yDeg, 0),
                                    Cartesian3.fromDegrees(
                                        xDeg,
                                        yDeg,
                                        this._values[this._pointsInViewport[i] + 1] * this._heightExaggeration
                                    )
                                ],
                                width: LINE_WIDTH_PROPERTY,
                                material: lineColor
                            }),
                            name: this._values[this._pointsInViewport[i]].toString()
                        })
                    );
                }
            }
        }
    }

    /**
     * Set the element size based on the shape of the coverage data and indices.
     * This method calculates and sets the element size for the coverage data.
     * @private
     */
    _setElementSize() {
        if (!this._shape || this._xIndex == null || this._yIndex == null) return;
        this._elementSize =
            this._shape.reduce((a, b) => a * b) / (this._shape[this._xIndex] * this._shape[this._yIndex]);
    }

    /**
     * Fetch coverage domainset from the specified URL and return it as JSON.
     * @param {string} url - The URL to fetch the coverage domainset from.
     * @returns {Promise} A promise that resolves with the fetched coverage domainset.
     */
    async getDomainSet(url: string): Promise<CoverageDomainSet> {
        if (!url.endsWith("/")) url = `${url}/`;
        if (!url.endsWith("/coverage/")) url = `${url}coverage/`;
        const domainSet = await this.fetchJson(`${url}domainset`, {
            f: "json"
        });
        return domainSet;
    }

    /**
     * Fetch coverage data from the specified URL and return it as JSON.
     * @param {string} dataUrl - The URL to fetch the coverage data from.
     * @returns {Promise} A promise that resolves with the fetched coverage data.
     */
    async getData(dataUrl: string): Promise<CoverageResponse> {
        if (!dataUrl.endsWith("/")) dataUrl = `${dataUrl}/`;
        if (!dataUrl.endsWith("/coverage/")) dataUrl = `${dataUrl}coverage/`;
        const queryParameters: QueryParameters = {
            f: "json",
            bbox: "-180, -90, 180, 90", //this._bbox.join(","),
            crs: "crs:84",
            properties: this._index.toString()
        };
        if (this._timeRange) {
            let startTime = this._timeRange[0];
            if (!startTime.includes("T")) {
                startTime += "T00:00:00Z";
            }
            const startTimeAsDate = new Date(startTime);
            startTime = startTimeAsDate.toISOString();

            let endTime = this._timeRange[1];
            if (!endTime.includes("T")) {
                endTime += "T00:00:00Z";
            }
            const endTimeAsDate = new Date(endTime);
            endTime = endTimeAsDate.toISOString();
            queryParameters.datetime = `${startTime}/${endTime}`;
        }
        const data = await this.fetchJson(dataUrl, queryParameters);
        return data;
    }

    /**
     * Determine the sizing of the grid based on the provided axes.
     * This method calculates and returns the sizing information for the grid.
     * @param {CoverageAxesObject} axes - The axes information for the coverage data.
     * @returns {Object} An object containing x, y sizes, and start/stop longitude and latitude.
     */
    determineGridSizing(axes: CoverageAxesObject): {
        x: number;
        y: number;
        startLong: number;
        stopLong: number;
        startLat: number;
        stopLat: number;
    } {
        const xDomain = axes.x.stop - axes.x.start;
        const yDomain = axes.y.stop - axes.y.start;
        const xSize = xDomain / axes.x.num;
        const ySize = yDomain / axes.y.num;
        return {
            x: xSize,
            y: ySize,
            startLong: axes.x.start,
            stopLong: axes.x.stop,
            startLat: axes.y.start,
            stopLat: axes.y.stop
        };
    }

    /**
     * Set the parameter key for the coverage data.
     * This method sets the parameter key to be used for accessing coverage data.
     */
    getParameterKey() {
        if (this._collectionInformation) {
        this._parameterKey = this._collectionInformation.defaultStyle;
        }
    }

    /**
     * Validate the response received from the server.
     * This method checks if the received response and its parameters are valid for the coverage data.
     * @param {CoverageResponse} response - The response received from the server.
     * @returns {boolean} True if the response is valid, otherwise false.
     */
    validateResponse(response: CoverageResponse): boolean {
        const ranges = response.ranges;
        for (const band of Object.keys(ranges)) {
            const parameter = ranges[band];
            if (parameter.axisNames.length !== parameter.shape.length) {
                console.error(t("coverageDatasourceValidateResponseError1"));
                return false;
            }
            if (parameter.values.length !== parameter.shape.reduce((a, b) => a * b)) {
                console.error(t("coverageDatasourceValidateResponseError2"));
                return false;
            }
            for (const axis of Object.keys(response.domain.axes)) {
                if (axis === "t") continue;
                if (!parameter.axisNames.includes(axis)) {
                    console.error(t("coverageDatasourceValidateResponseError3", [axis]));
                    return false;
                }
                const axisValue = response.domain.axes[axis];
                if (axisValue && (axisValue as number[]).length == null) {
                    if ((axisValue as AxesRange).num !== parameter.shape[parameter.axisNames.indexOf(axis)]) {
                        console.error(t("coverageDatasourceValidateResponseError4", [axis])
                        );
                        return false;
                    }
                }
            }
            return true;
        }
        console.error(t("coverageDatasourceValidateResponseError5"));
        return false;
    }

    /**
     * Check if the coverage data has a time dimension.
     * This method checks if the coverage data includes a time dimension.
     * @param {CoverageResponse} response - The response received from the server.
     * @returns {boolean} True if the coverage data has a time dimension, otherwise false.
     */
    checkForTimeDimension(response: CoverageResponse): boolean {
        if (response.domain.axes.t) {
            return true;
        }
        return false;
    }

    /**
     * Check if the coverage data has an elevation dimension.
     * This method checks if the coverage data includes an elevation dimension.
     * @param {CoverageResponse} response - The response received from the server.
     * @returns {boolean} True if the coverage data has an elevation dimension, otherwise false.
     */
    checkForElevation(response: CoverageResponse): boolean {
        if (response.domain.axes.z) {
            return true;
        }
        return false;
    }

    /**
     * Check the dimensions of the coverage data.
     * This method determines the dimensionality of the coverage data based on the presence of height and time dimensions.
     * @param {CoverageResponse} response - The response received from the server.
     * @returns {string} The dimensions of the coverage data (D2, D2T, D3, or D3T).
     */
    checkDimensions(response: CoverageResponse): Dimensions {
        const hasHeight = this.checkForElevation(response);
        const hasTime = this.checkForTimeDimension(response);
        if (hasHeight && hasTime) {
            return Dimensions.D3T;
        }
        if (hasHeight) {
            return Dimensions.D3;
        }
        if (hasTime) {
            return Dimensions.D2T;
        }
        return Dimensions.D2;
    }

    /**
     * Set the shape of the coverage data based on the parameter key.
     * This method sets the shape and block count of the coverage data.
     * @private
     */
    _setShape(response: CoverageResponse) {
        this._shape = response.ranges[this._parameterKey].shape;
        this._bc = (this._shape[1] || 1) * (this._shape[2] || 1);
    }

    /**
     * Set the minimum and maximum values for coloring the coverage data.
     * This method calculates and sets the minimum and maximum values for coloring.
     */
    setColorMinMax() {
        if (this._values == null) return;
        this._maxValue = this._values.reduce((a, b) => Math.max(a, b), Number.NEGATIVE_INFINITY);
        this._minValue = this._values.reduce((a, b) => (b == null ? a : Math.min(a, b)), Number.POSITIVE_INFINITY);
    }

    /**
     * Convert flat index to multi-dimensional index for the given axis.
     * This method converts a flat index to a multi-dimensional index for the specified axis.
     * @param {number} xyCell - The flat index of an array stripped to only XY.
     * @param {"x" | "y"} axisName - The axis name ("x" or "y") to convert for.
     * @returns {number | null} The multi-dimensional index or null if not possible.
     */
    flatToMultiIndex(xyCell: number, axisName: "x" | "y"): number | undefined {
        if (!this._shape || this._xIndex == null || this._yIndex == null || this._bc == null) return;
        const shape = this._shape;
        const flatIndex = xyCell * this._elementSize;
        let index = 0;
        if (axisName === "x") index = this._xIndex;
        else if (axisName === "y") index = this._yIndex;
        else console.error(t("coverageDatasourceFlatToMultiIndexError1"));
        const a = shape[0];
        const b = shape[1];
        const c = shape[2] || 1;
        const d = shape[3] || 1;
        switch (index) {
            case 0:
                return Math.floor(flatIndex / (this._bc === 1 ? 1 : b === 1 ? c : this._bc)) % a;
            case 1:
                return Math.floor(flatIndex / (c === 1 ? 1 : c)) % b;
            case 2:
                return Math.floor(flatIndex / (d === 1 ? 1 : d)) % c;
            case 3:
                return Math.floor(flatIndex / d) % d; // W dimension
            default:
                throw new Error(t("coverageDatasourceFlatToMultiIndexError2"));
        }
    }

    /**
     * Convert flat index to multi-dimensional index for the given axis.
     * This method converts a flat index to a multi-dimensional index for the specified axis.
     * @param {number} xyCell - The flat index of an array stripped to only XY.
     * @param {"x" | "y"} axisName - The axis name ("x" or "y") to convert for.
     * @returns {number | null} The multi-dimensional index or null if not possible.
     */
    flatToMultiIndexCorrect(xyCell: number, axisName: "x" | "y"): number | null {
        if (!this._shape || this._xIndex == null || this._yIndex == null || this._bc == null) return null;
        const shape = this._shape;
        const flatIndex = xyCell * this._elementSize;
        let index = 0;
        if (axisName === "x") index = this._xIndex;
        else if (axisName === "y") index = this._yIndex;
        else console.error(t("coverageDatasourceFlatToMultiIndexCorrectError1"));
        const cSize = shape[1];
        const bSize = shape[2] || 1;
        const aSize = shape[3] || 1;
        switch (index) {
            case 0:
                return Math.floor(flatIndex / (aSize * bSize * cSize));
            case 1:
                return Math.floor((flatIndex / (aSize * bSize)) % cSize);
            case 2:
                return Math.floor((flatIndex / aSize) % bSize);
            case 3:
                return flatIndex % aSize;
            default:
                throw new Error(t("coverageDatasourceFlatToMultiIndexCorrectError2"));
        }
    }

    /**
     * Convert multi-dimensional indices to flat index.
     * This method converts multi-dimensional indices to a flat index.
     * @param {number} x - The index along the x-axis.
     * @param {number} y - The index along the y-axis.
     * @param {number=} z - The index along the z-axis (optional).
     * @param {number=} t - The index along the time axis (optional).
     * @returns {number | null} The flat index or null if not possible.
     */
    multiToFlatIndex(x: number, y: number, z?: number, t?: number): number | undefined {
        if (!this._shape || this._xIndex == null || this._yIndex == null) return;
        const bLength = this._shape[1];
        const cLength = this._shape[2] || 1;
        const dLength = this._shape[3] || 1;
        if (this._zIndex !== null && z == null) z = 0;
        if (this._tIndex !== null && t == null) t = 0;
        const a = this._xIndex == 0 ? x : this._yIndex == 0 ? y : this._zIndex == 0 ? z : this._tIndex == 0 ? t : null;
        const b = this._xIndex == 1 ? x : this._yIndex == 1 ? y : this._zIndex == 1 ? z : this._tIndex == 1 ? t : null;
        const c = this._xIndex == 2 ? x : this._yIndex == 2 ? y : this._zIndex == 2 ? z : this._tIndex == 2 ? t : 0;
        const d = this._xIndex == 3 ? x : this._yIndex == 3 ? y : this._zIndex == 3 ? z : this._tIndex == 3 ? t : 0;
        if (a == null || b == null || c == null || d == null) return;
        return a * bLength * cLength * dLength + b * cLength * dLength + c * dLength + d;
    }

    /**
     * Convert column-major flat index to multi-dimensional index for the given axis.
     * This method converts a column-major flat index to a multi-dimensional index for the specified axis.
     * @param {number} xyCell - The column-major flat index value to convert.
     * @param {"x" | "y"} axisName - The axis name ("x" or "y") to convert for.
     * @returns {number | null} The multi-dimensional index or null if not possible.
     */
    columnflatToMultiIndex(xyCell: number, axisName: "x" | "y"): number | undefined {
        if (!this._shape || this._xIndex == null || this._yIndex == null) return;
        const shape = this._shape;
        const flatIndex = xyCell * this._elementSize;
        let index = 0;
        if (axisName === "x") index = this._xIndex;
        else if (axisName === "y") index = this._yIndex;
        else console.error(t("coverageDatasourceColumnflatToMultiIndexError1"));
        const a = shape[0];
        const b = shape[1];
        const c = shape[2] || 1;
        const d = shape[3] || 1;
        const ab = a * b;
        const abc = ab * c;

        switch (index) {
            case 0:
                return flatIndex % a;
            case 1:
                return Math.floor(flatIndex / a) % b;
            case 2:
                return Math.floor(flatIndex / ab) % c;
            case 3:
                return Math.floor(flatIndex / abc) % d;
            default:
                throw new Error(t("coverageDatasourceColumnflatToMultiIndexError2"));
        }
    }
}
