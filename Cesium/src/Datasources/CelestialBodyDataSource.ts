import { Cartesian3, Color, ConstantProperty, Entity, EntityCollection, PointGraphics, Resource, Viewer } from "cesium";
import WesDataSource from "./WesDataSource";
import { Kilometer, EciVec3, eciToGeodetic, gstime, propagate, twoline2satrec } from "satellite.js";

export default class CelestialBodyDataSource extends WesDataSource {
    _tleArray: Array<Array<string>>;
    _date: Date;
    constructor(description: string, name: string, url: string, viewer: Viewer, uid: string) {
        super(description, name, url, viewer, uid);
        this._type = "Celestial";
        this._tleArray = [];
        if (this._url.endsWith("/")) {
            this._url = this._url.slice(0, -1);
        }
        this._url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle";
        this._date = new Date();
        this._show = false;
        this._update = true;
        this.initialize(3000);
    }
    getKey(url: string) {
        return "cesiumCelestial-".concat(url);
    }
    async retrieveTLE() {
        const key = this.getKey(this._url);
        const cached = localStorage.getItem(key);
        if (cached) {
            const cacheComponents = cached.split("|");
            const cacheTime = Date.parse(cacheComponents[0]);
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
    async loadService() {
        //Setup for loading and exit function if already loading
        const isLoading = this.setForLoad();
        if (isLoading) {
            return;
        }

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
                celestialBody = this.create(tle) as Entity;
            } catch (err) {
                //        console.warn(err);
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

    setDate() {
        this._date = new Date();
    }

    updateService(id: number) {
        const previousLoadCycleId = id - 1;
        if (!this._isLoaded) {
            return this.loadService();
        }
        const isLoading = this.setForLoad();
        if (isLoading) {
            this.cancelLoadCycle(previousLoadCycleId);
        }

        //Set the current date
        this.setDate();

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
                const sat = celestialBodies[satCount];
                this.updateCelestialPosition(sat);
            }
            this.doneLoad(true);
        }
    }

    updateCelestialPosition(sat: any) {
        const date = this._date;
        const satrec = sat.properties.satrec.valueOf();

        // Get the position of the satellite at the given date
        const positionAndVelocity = propagate(satrec, date);
        const gmst = gstime(date);
        const position = eciToGeodetic(positionAndVelocity.position as EciVec3<Kilometer>, gmst);
        let cesPosition;
        try {
            cesPosition = Cartesian3.fromRadians(position.longitude, position.latitude, position.height * 1000);
        } catch (err) {
            return;
        }
        //Update Entity Position
        sat.position = cesPosition;
        return;
    }

    /**
     * Creates a Cesium entity from a TLE.
     *
     * @param array} tle An array containing individual lines of a TLE, [0] is the name, [1] and [2] are the first and second lines of a 2LE respectively.
     * @return object | boolean} celestialBody A Cesium entity. Returns false if the entity already exists.
     */
    create(tle: Array<string>) {
        const name = tle[0];
        const date = this._date;

        // Check to see if the entity already exists prior to creation.
        if (this._entityCollection.getById(name)) {
            //      console.warn("Multiple entries returned for the same Celestial Body");
            return false;
        }

        const satrec = twoline2satrec(tle[1], tle[2]);

        // Get the position of the satellite at the given date
        const positionAndVelocity = propagate(satrec, date);
        const gmst = gstime(date);
        if (positionAndVelocity.position === false) {
            return false;
        }
        const position = eciToGeodetic(positionAndVelocity.position as EciVec3<Kilometer>, gmst);
        const cesPosition = Cartesian3.fromRadians(position.longitude, position.latitude, position.height * 1000);
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
            position: cesPosition,
            properties: {
                satrec: satrec
            },
            point
            // model: {
            // 	show: true,
            // 	color: Cesium.Color.RED,
            // 	minimumPixelSize: 20,
            // 	heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            // 	uri: "./glbmodels/StarLink.glb",
            // }
        });

        if (this._show === false) {
            celestialBody.show = false;
        }

        return celestialBody;
    }
}
