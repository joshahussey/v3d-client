import {
    Cartesian3,
    Color,
    ConstantProperty,
    SampledPositionProperty,
    JulianDate,
    LinearApproximation,
    Entity,
    EntityCollection,
    PointGraphics,
    Resource,
    Viewer
} from "cesium";
import WesDataSource from "./WesDataSource";
import { CesiumWindow, ServiceInfo, LegendSource } from "../Types/types";
import { Kilometer, EciVec3, eciToGeodetic, gstime, propagate, twoline2satrec } from "satellite.js";
import { DatasourceTypes } from "../Constants";
const CesiumClient = window as CesiumWindow;

// How many seconds into the future should the satellite position be calculated.
const UPDATE_FREQUENCY_SECONDS = 30;

export default class CelestialBodyDataSource extends WesDataSource {
    _tleArray: Array<Array<string>>;
    _date: Date;
    _firstDate: Date;
    _lastDate: Date;
    _listener?: () => void;
    _isCurrent: boolean;
    constructor(description: string, name: string, url: string, viewer: Viewer, uid: string, serviceInfo: ServiceInfo) {
        super(description, name, url, viewer, uid, serviceInfo);
        this._type = "Celestial";

        //Listener for when the timeline value changes
        this._listener = this.listener.bind(this);
        this._tleArray = [];
        if (this._url.endsWith("/")) {
            this._url = this._url.slice(0, -1);
        }
        this._url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle";
        this._date = new Date();
        this._firstDate = new Date();
        this._lastDate = new Date();
        this._isCurrent = true;
        this._show = false;
        this._update = true;
        this.initialize(UPDATE_FREQUENCY_SECONDS * 1000);
    }

    listener = () => {
        this._isCurrent = false;
        this.updateService(0, true);

        this._viewer.clock.canAnimate = true;
        this._viewer.clock.shouldAnimate = true;

        const tempTimeMap = CesiumClient.timeMap();
        tempTimeMap.set(this.uid, [JulianDate.fromDate(this._firstDate), JulianDate.fromDate(this._lastDate)]);
        CesiumClient.setTimeMap(tempTimeMap);

        const sourcesWithLegends = CesiumClient.sourcesWithLegends();
        const source = sourcesWithLegends.find((src: LegendSource) => src.uid == this.uid);
        if (source == null) {
            this.loadService();
            return;
        }
        if (JulianDate.lessThan(this._viewer.clock.currentTime, source.lowerTimeBound)) {
            source.lowerTimeBound = this._viewer.clock.currentTime;
        }
        if (JulianDate.greaterThan(this._viewer.clock.currentTime, source.upperTimeBound)) {
            source.upperTimeBound = this._viewer.clock.currentTime;
        }
        CesiumClient.setSourcesWithLegends(sourcesWithLegends);
    };

    getKey(url: string) {
        return "cesiumCelestial-".concat(url);
    }
    async retrieveTLE() {
        const key = this.getKey(this._url);
        const cached = localStorage.getItem(key);
        if (cached) {
            const cacheComponents = cached.split("|");
            const cacheTime = parseInt(cacheComponents[0]);
            const cachedTime = Date.now() - cacheTime;
            const maxCacheTimeMillis = 24 * 60 * 60 * 1000;

            if (cachedTime > maxCacheTimeMillis) {
                localStorage.removeItem(key);
            } else {
                return JSON.parse(cacheComponents[1]);
            }
        }
        return this.fetchTLE();
    }
    async fetchTLE() {
        const rawTLE = await Resource.fetch({ url: this._url });
        let tleArray = rawTLE.split("\n");
        tleArray = tleArray.map((line: string) => line.trim());
        if (tleArray.length % 3 !== 0) {
            tleArray.splice(-1);
        }

        const formattedTLEArray: Array<Array<string>> = [];
        let satCount = tleArray.length;
        while (satCount) {
            formattedTLEArray.push([tleArray[satCount - 3], tleArray[satCount - 2], tleArray[satCount - 1]]);
            satCount -= 3;
        }

        this._tleArray = formattedTLEArray;
        localStorage.setItem(this.getKey(this._url), Date.now().toString() + "|" + JSON.stringify(formattedTLEArray));
        return formattedTLEArray;
    }

    /**
     * Turns on/off the datasource, including turning on/off animations in the client.
     * Adds/Removes the datasource from the legend.
     * Adds/Removes the datasource bounds from the timeMap.
     *
     * This can probably be removed once we get Celestrak moved to a publishable service, which then simplifies the
     * time controls for this datasource. Currently there are multiple places where the timeMap, service bounds and
     * current time are modified, which is less than ideal.
     *
     * @param {boolean} running - Whether the CelestialBodyDataSource should be running.
     */
    async setServiceRunning(running: boolean) {
        if (this._viewer.clock.canAnimate == running && this._viewer.clock.shouldAnimate == running) {
            return
        }
        this._viewer.clock.canAnimate = running;
        this._viewer.clock.shouldAnimate = running;
        const tempTimeMap = CesiumClient.timeMap();
        if (running) {
            const nextDate = new Date(this._date.getTime());
            nextDate.setSeconds(nextDate.getSeconds() + UPDATE_FREQUENCY_SECONDS);

            if (this._firstDate.getTime() == this._date.getTime() && this._date.getTime() == this._lastDate.getTime()) {
                tempTimeMap.set(this.uid, [JulianDate.fromDate(this._firstDate), JulianDate.fromDate(nextDate)]);
            } else {
                tempTimeMap.set(this.uid, [JulianDate.fromDate(this._firstDate), JulianDate.fromDate(this._lastDate)]);
            }
            const sourcesWithLegends = CesiumClient.sourcesWithLegends();
            sourcesWithLegends.push({
                type: DatasourceTypes.Celestial,
                uid: this.uid,
                id: this.name,
                currentTime: JulianDate.fromDate(this._date),
                lowerTimeBound: JulianDate.fromDate(this._firstDate),
                upperTimeBound: JulianDate.fromDate(this._lastDate)
            } as LegendSource);
            CesiumClient.setSourcesWithLegends(sourcesWithLegends);
        } else {
            tempTimeMap.delete(this.uid);
            CesiumClient.setSourcesWithLegends(
                CesiumClient.sourcesWithLegends().filter((source: LegendSource) => source.uid !== this.uid)
            );
        }
        CesiumClient.setTimeMap(tempTimeMap);
    }

    async loadService() {
        //Setup for loading and exit function if already loading
        const isLoading = this.setForLoad();
        if (isLoading) {
            return;
        }
        CesiumClient.addEventListener("timeChanged", this.listener);
        //Assign easy names
        const celestialBodies = this._entityCollection as EntityCollection;

        //Fetch and create the TLE array.
        const tleArray = await this.retrieveTLE();

        let satCount = tleArray.length;
        while (satCount) {
            const i = satCount - 1;

            //Create the celestial body entity and add it to the collection.
            const tle = tleArray[i];
            let celestialBody: Entity | false;
            try {
                celestialBody = this.create(tle); // as Entity;
                if (celestialBody != false) {
                    this.updateCelestialPosition(celestialBody);
                }
            } catch (err) {
                celestialBody = false;
            }

            if (celestialBody === false) {
                satCount--;
                continue;
            }
            celestialBodies.add(celestialBody);
            satCount--;
        }
        this.doneLoad(true);
        return;
    }

    setDate(specifiedDate: Date | null = null) {
        if (specifiedDate != null) {
            this._date = specifiedDate;
        } else {
            this._date = new Date();
        }
        if (this._date < this._firstDate) {
            this._firstDate = this._date;
        }
        if (this._date > this._lastDate) {
            this._lastDate = this._date;
        }
    }

    updateService(id: number, timeChanged: boolean = false) {
        const previousLoadCycleId = id - 1;
        if (!this._isLoaded) {
            return this.loadService();
        }
        const isLoading = this.setForLoad();
        if (isLoading) {
            this.cancelLoadCycle(previousLoadCycleId);
        }

        if (!this._isCurrent) {
            this.setDate(JulianDate.toDate(this._viewer.clock.currentTime));
        } else {
            //Set the current date
            this.setDate();
        }

        // Calculate the time X seconds into the future
        const endTime = new Date(this._date.getTime());
        endTime.setSeconds(endTime.getSeconds() + UPDATE_FREQUENCY_SECONDS);
        const julianEndTime = JulianDate.fromDate(endTime);

        // Set the timeMap to be [this._firstDate, this._lastDate]
        const tempTimeMap = CesiumClient.timeMap();
        if (JulianDate.greaterThan(julianEndTime, JulianDate.fromDate(this._lastDate))) {
            tempTimeMap.set(this.uid, [JulianDate.fromDate(this._firstDate), julianEndTime]);
        } else {
            tempTimeMap.set(this.uid, [JulianDate.fromDate(this._firstDate), JulianDate.fromDate(this._lastDate)]);
        }
        CesiumClient.setTimeMap(tempTimeMap);

        // Update the upper bound time for the service to the new end time.
        const sourcesWithLegends = CesiumClient.sourcesWithLegends();
        const source = sourcesWithLegends.find((src: LegendSource) => src.uid == this.uid);
        if (source == null) {
            this.loadService();
            return;
        }
        source.upperTimeBound = julianEndTime;
        CesiumClient.setSourcesWithLegends(sourcesWithLegends);

        //Assign easy names
        const celestialBodies = this._entityCollection.values;
        let satCount = celestialBodies.length;

        //Iterate through satellites and update positions
        cancellable: {
            while (--satCount) {
                if (this.isCancelled(id)) {
                    break cancellable;
                }
                //Update the individual satellite positions
                const sat = celestialBodies[satCount - 1];
                if (timeChanged) {
                    this.updateCelestialPosition(sat, timeChanged);
                }
                this.updateCelestialPosition(sat);
            }
            this.doneLoad(true);
        }
    }

    updateCelestialPosition(sat: Entity, timeChanged: boolean = false) {
        if (sat.properties == null || sat.properties.satrec == null) {
            return;
        }
        const satrec = sat.properties.satrec.valueOf();

        // Get the date X seconds into the future
        let date;
        if (timeChanged) {
            date = this._date;

            if (date.getTime() > sat.properties.launchYear.valueOf().getTime()) {
                sat.show = true;
            } else {
                sat.show = false;
                return;
            }
        } else {
            date = new Date(this._date.getTime());
            date.setSeconds(date.getSeconds() + UPDATE_FREQUENCY_SECONDS);
        }

        // Get the position of the satellite at the future date
        const positionAndVelocity = propagate(satrec, date);
        if (!positionAndVelocity.position || !positionAndVelocity.velocity) {
            return;
        }

        const gmst = gstime(date);
        const position = eciToGeodetic(positionAndVelocity.position as EciVec3<Kilometer>, gmst);
        let cesPosition;
        try {
            cesPosition = Cartesian3.fromRadians(position.longitude, position.latitude, position.height * 1000);
        } catch (err) {
            return;
        }
        if (sat.position == null) {
            return;
        }
        (sat.position as SampledPositionProperty).addSample(JulianDate.fromDate(date), cesPosition);
        return;
    }

    /**
     * Creates a Cesium entity from a TLE.
     *
     * @param {array} tle An array containing individual lines of a TLE, [0] is the name, [1] and [2] are the first and second lines of a 2LE respectively.
     * @return object | boolean} celestialBody A Cesium entity. Returns false if the entity already exists.
     */
    create(tle: Array<string>) {
        const name = tle[0];
        const date = this._date;

        // Check to see if the entity already exists prior to creation.
        if (this._entityCollection.getById(name)) {
            return false;
        }

        const satrec = twoline2satrec(tle[1], tle[2]);
        const satLaunchYear = this.getLaunchDateFromRevs(tle[1], tle[2]);

        // Get the position of the satellite at the given date
        const positionAndVelocity = propagate(satrec, date);
        const gmst = gstime(date);
        if (positionAndVelocity.position === false) {
            return false;
        }
        const position = eciToGeodetic(positionAndVelocity.position as EciVec3<Kilometer>, gmst);
        const cesPosition = Cartesian3.fromRadians(position.longitude, position.latitude, position.height * 1000);
        const samplePosProperty = new SampledPositionProperty();
        samplePosProperty.addSample(JulianDate.fromDate(date), cesPosition);
        samplePosProperty.setInterpolationOptions({
            interpolationDegree: 1,
            interpolationAlgorithm: LinearApproximation
        });
        const point: PointGraphics = new PointGraphics();
        point.outlineColor = new ConstantProperty(Color.BLACK);
        point.color = new ConstantProperty(Color.WHITE);
        point.pixelSize = new ConstantProperty(4);
        point.outlineWidth = new ConstantProperty(1.5);

        //Create the entity object.
        const celestialBody = new Entity({
            show: this._show,
            id: name,
            name: name,
            position: samplePosProperty,
            properties: {
                satrec: satrec,
                launchYear: satLaunchYear
            },
            point
        });

        if (this._show === false) {
            celestialBody.show = false;
        }

        return celestialBody;
    }

    /**
     * Attempts to calculate the launch date of a satellite from the data given in the tle.
     * It uses revlutions per day revolutions at epoch and the epoch date to calculate this.
     *
     * This method has issues with older satellites overflowing revolutions at epoch. If this occurs,
     * we use the first date of the launch year given in the tle.
     *
     * @param {string} tle1 Description line 1 of the tle
     * @param {string} tle2 Description line 2 of the tle
     * @returns {Date} Either the exact launch date, or the first date in the launch year.
     */
    getLaunchDateFromRevs(tle1: string, tle2: string): Date {
        //Calculate Epoch Year/Day/Time
        let epochYear = parseInt(tle1.split(" ").filter(Boolean)[3].substring(0, 2));
        const epochDays = parseFloat(tle1.split(" ").filter(Boolean)[3].substring(2));
        if (epochYear <= parseInt(new Date().getFullYear().toString().substring(2, 4))) {
            epochYear = 2000 + epochYear;
        } else {
            epochYear = 1900 + epochYear;
        }
        const decimalData = epochDays % 1;
        const seconds = decimalData * 60 * 60 * 24;
        const s = seconds % 60;
        const m = ((seconds % 3600) / 60) | 0;
        const h = (seconds / 3600) | 0;
        //Create a Date object for the Epoch
        const epochDate = new Date(epochYear, 0, epochDays | 0, h, m, s);
        //Get Revolutions around earth per day
        const revsPerDay = parseFloat(tle2.split(" ").filter(Boolean)[7].substring(0, 11));
        //Get number of revolutions at epoch
        const revsAtEpoch = parseInt(tle2.split(" ").filter(Boolean)[7].substring(11, 16)) || 0;
        //Calculate days since launch
        const daysSinceLaunch = revsAtEpoch / revsPerDay;
        const launchDate = new Date(epochDate.getTime());
        launchDate.setDate(launchDate.getDate() - daysSinceLaunch);

        /* Check if the indicated launch year is earlier than our calculated one.
         * This can happen because the tle only has a 5 digit number, so old satellites with greater
         * than 99999 revolutions will roll over back to 0.
         * If indicated launch year is older, use the first day of the indicated year as our launch date.
         */
        const launchYearDate = this.getLaunchYear(tle1);
        if (launchYearDate.getFullYear() < launchDate.getFullYear()) {
            return launchYearDate;
        } else {
            return launchDate;
        }
    }

    /**
     * Gets the launch year indicated in the tle and returns the first possible datetime value of that year.
     *
     * @param {string} tleFirstLine The first description line of the tle.
     * @returns {Date} January 1st 00:00:00.000 of the launch year indicated in the tle.
     */
    getLaunchYear(tleFirstLine: string): Date {
        let launchYear = tleFirstLine.split(" ")[2].substring(0, 2);
        if (launchYear <= new Date().getFullYear().toString().substring(2, 4)) {
            launchYear = "20" + launchYear;
        } else {
            launchYear = "19" + launchYear;
        }
        return new Date(parseInt(launchYear), 0, 0);
    }
}
