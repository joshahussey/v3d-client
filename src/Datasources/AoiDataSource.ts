import {
    Cartesian3,
    CircleGeometry,
    Entity,
    GeometryInstance,
    GroundPrimitive,
    HeightReference,
    Material,
    MaterialAppearance,
    PolygonHierarchy,
    Rectangle,
    RectangleGeometry,
    Viewer
} from "cesium";
import WesDataSource from "./WesDataSource";
import { AOI_COLOR, AOI_DATASOURCE_ID, AOI_DRAW_PIXEL_WIDTH, BUFFER_COLOR } from "../Constants";
import { CesiumWindow, GeoJsonAoi, ServiceInfo } from "../Types/types";
import { translate as t } from "../i18n/Translator";

type AoiDrawables = {
    entities: Entity[];
    primitives: GroundPrimitive[];
};

export default class AoiDataSource extends WesDataSource {
    _aoiObject?: GeoJsonAoi;

    constructor(viewer: Viewer, aoiObject: GeoJsonAoi, serviceInfo: ServiceInfo) {
        super(t("aoiDatasourceAreaOfInterest"), "AOI", "", viewer, AOI_DATASOURCE_ID, serviceInfo);
        this._type = "AOIDataSource";
        this._aoiObject = aoiObject;
        const cesiumWindow = window as CesiumWindow;
        if (!cesiumWindow.aoiBufferPrimitives) cesiumWindow.aoiBufferPrimitives = [];
    }

    setAoiObject(aoiObject: GeoJsonAoi) {
        this._aoiObject = aoiObject;
    }

    async loadService() {
        if (!this._aoiObject) return;

        const buffer: number = this._aoiObject.properties?.wes_3d_buffer_metres as number;
        const entities = this.entities;

        entities.suspendEvents();
        entities.removeAll();

        const cesiumWindow = window as CesiumWindow;
        if (!cesiumWindow.aoiBufferPrimitives) cesiumWindow.aoiBufferPrimitives = [];
        const bufferPrimitives = cesiumWindow.aoiBufferPrimitives;
        const groundPrimitives = cesiumWindow.Map3DViewer.scene.groundPrimitives;
        for (const primitive of bufferPrimitives) {
            cesiumWindow.Map3DViewer.scene.groundPrimitives.remove(primitive);
        }

        const type = this._aoiObject.geometry.type;
        const coordsUncasted = this._aoiObject.geometry.coordinates;
        const ids = this.generateId();

        switch (type) {
            case "Point": {
                const coords = coordsUncasted as number[];
                // eslint-disable-next-line no-undef
                process.nextTick(() => {
                    entities.suspendEvents();
                    const drawables = this._getPointDrawables(coords, ids.next().value, buffer);
                    drawables.entities.forEach(e => entities.add(e));
                    entities.resumeEvents();
                    drawables.primitives.forEach(p => {
                        const primitive = groundPrimitives.add(p);
                        bufferPrimitives.push(primitive);
                    });
                });
                break;
            }
            case "MultiPoint": {
                const coords = coordsUncasted as number[][];
                // eslint-disable-next-line no-undef
                process.nextTick(() => {
                    entities.suspendEvents();
                    for (const position of coords) {
                        const drawables = this._getPointDrawables(position, ids.next().value, buffer);
                        drawables.entities.forEach(e => entities.add(e));
                        drawables.primitives.forEach(p => {
                            const primitive = groundPrimitives.add(p);
                            bufferPrimitives.push(primitive);
                        });
                        break;
                    }
                    entities.resumeEvents();
                });
                break;
            }
            case "LineString": {
                const coords = coordsUncasted as number[][];
                // eslint-disable-next-line no-undef
                process.nextTick(() => {
                    entities.suspendEvents();
                    const drawables = this._getPolygonDrawables([coords], ids.next().value, buffer);
                    drawables.entities.forEach(e => entities.add(e));
                    entities.resumeEvents();
                    drawables.primitives.forEach(p => {
                        const primitive = groundPrimitives.add(p);
                        bufferPrimitives.push(primitive);
                    });
                });
                break;
            }
            case "MultiLineString": {
                const coords = coordsUncasted as number[][][];
                // eslint-disable-next-line no-undef
                process.nextTick(() => {
                    entities.suspendEvents();
                    for (const lineStringCoords of coords) {
                        const drawables = this._getPolygonDrawables([lineStringCoords], ids.next().value);
                        drawables.entities.forEach(e => entities.add(e));
                        drawables.primitives.forEach(p => {
                            const primitive = groundPrimitives.add(p);
                            bufferPrimitives.push(primitive);
                        });
                    }
                    entities.resumeEvents();
                });
                break;
            }
            case "Polygon": {
                const coords = coordsUncasted as number[][][];
                // eslint-disable-next-line no-undef
                process.nextTick(() => {
                    entities.suspendEvents();
                    const drawables = this._getPolygonDrawables(coords, ids.next().value);
                    drawables.entities.forEach(e => entities.add(e));
                    entities.resumeEvents();
                    drawables.primitives.forEach(p => {
                        const primitive = groundPrimitives.add(p);
                        bufferPrimitives.push(primitive);
                    });
                });
                break;
            }
            case "MultiPolygon": {
                const coords = coordsUncasted as number[][][][];
                // eslint-disable-next-line no-undef
                process.nextTick(() => {
                    entities.suspendEvents();
                    for (const polygon of coords) {
                        const drawables = this._getPolygonDrawables(polygon, ids.next().value);
                        drawables.entities.forEach(e => entities.add(e));
                        drawables.primitives.forEach(p => {
                            const primitive = groundPrimitives.add(p);
                            bufferPrimitives.push(primitive);
                        });
                    }
                    entities.resumeEvents();
                });
                break;
            }
            case "GeometryCollection":
                console.error(t("aoiDatasourceLoadServiceError1"));
                break;
        }

        entities.resumeEvents();
    }

    async initialize() {
        this.loadService();
    }

    *generateId() {
        let i = 0;
        while (true) yield (i++).toString();
    }

    _getPointDrawables(coords: number[], id: string | void, buffer: number | undefined): AoiDrawables {
        const entities: Entity[] = [];
        const point = Cartesian3.fromDegrees(coords[0], coords[1]);

        entities.push(
            new Entity({
                id: `AOI_${id}`,
                name: "AOI",
                position: point,
                point: {
                    color: AOI_COLOR,
                    pixelSize: AOI_DRAW_PIXEL_WIDTH
                }
            })
        );

        if (buffer && buffer > 0) {
            entities.push(
                new Entity({
                    id: `AOI_Buffer_${id}`,
                    name: "AOI Buffer",
                    position: point,
                    ellipse: {
                        fill: true,
                        material: BUFFER_COLOR,
                        semiMajorAxis: buffer,
                        semiMinorAxis: buffer
                    }
                })
            );
        }

        return { entities, primitives: [] };
    }

    _getLineStringDrawables(coords: number[][], id: string | void): AoiDrawables {
        const cart3s: Cartesian3[] = [];

        for (const point of coords) {
            cart3s.push(Cartesian3.fromDegrees(point[0], point[1]));
        }

        const entity = new Entity({
            id: `AOI_${id}`,
            name: "AOI",
            polyline: {
                clampToGround: true,
                positions: cart3s,
                material: AOI_COLOR,
                width: AOI_DRAW_PIXEL_WIDTH
            }
        });
        return { entities: [entity], primitives: [] };
    }

    _getPolygonDrawables(coords: number[][][], id: string | void, buffer?: number): AoiDrawables {
        const entities = [];
        const primitives = [];
        const hierarchy = new PolygonHierarchy();
        let first = true;
        for (const ring of coords) {
            const cart3s = [];

            for (const point of ring) {
                cart3s.push(Cartesian3.fromDegrees(point[0], point[1]));
            }

            if (first) {
                first = false;
                hierarchy.positions = cart3s;
            } else {
                const subHierarchy = new PolygonHierarchy();
                subHierarchy.positions = cart3s;
                hierarchy.holes.push(subHierarchy);
            }
        }

        entities.push(
            new Entity({
                id: `AOI_${id}`,
                name: "AOI",
                polygon: {
                    heightReference: HeightReference.CLAMP_TO_GROUND,
                    height: 1, // Required to be able to use heightReference
                    hierarchy,
                    fill: false,
                    outline: true,
                    outlineColor: AOI_COLOR,
                    outlineWidth: AOI_DRAW_PIXEL_WIDTH
                }
            })
        );

        const shell = coords[0];
        if (
            buffer != null &&
            buffer > 0 &&
            shell.length == 5 &&
            shell[0][0] == shell[4][0] &&
            shell[0][1] == shell[4][1]
        ) {
            const p0 = Cartesian3.fromDegrees(shell[0][0], shell[0][1]);
            const p1 = Cartesian3.fromDegrees(shell[1][0], shell[1][1]);
            const p2 = Cartesian3.fromDegrees(shell[2][0], shell[2][1]);
            const p3 = Cartesian3.fromDegrees(shell[3][0], shell[3][1]);

            const a = new Cartesian3();
            const b = new Cartesian3();
            const c = new Cartesian3();
            const d = new Cartesian3();
            const e = new Cartesian3();
            const f = new Cartesian3();
            const g = new Cartesian3();
            const h = new Cartesian3();

            const diff01 = Cartesian3.distance(p0, p1);
            const diff12 = Cartesian3.distance(p1, p2);
            const diff23 = Cartesian3.distance(p2, p3);
            const diff30 = Cartesian3.distance(p3, p0);

            Cartesian3.lerp(p0, p1, -(buffer / diff01), a);
            Cartesian3.lerp(p1, p0, -(buffer / diff01), b);
            Cartesian3.lerp(p1, p2, -(buffer / diff12), c);
            Cartesian3.lerp(p2, p1, -(buffer / diff12), d);
            Cartesian3.lerp(p2, p3, -(buffer / diff23), e);
            Cartesian3.lerp(p3, p2, -(buffer / diff23), f);
            Cartesian3.lerp(p3, p0, -(buffer / diff30), g);
            Cartesian3.lerp(p0, p3, -(buffer / diff30), h);

            const geomInstances = [];

            const rectGeoms = [
                Rectangle.fromCartesianArray([p0, p3, f, a]),
                Rectangle.fromCartesianArray([p0, p1, h, c]),
                Rectangle.fromCartesianArray([p1, p2, b, e]),
                Rectangle.fromCartesianArray([p3, p2, g, d]),
                Rectangle.fromCartesianArray([p0, p1, p2, p3])
            ];

            for (const rect of rectGeoms) {
                geomInstances.push(
                    new GeometryInstance({
                        geometry: new RectangleGeometry({
                            rectangle: rect
                        })
                    })
                );
            }

            for (const point of [p0, p1, p2, p3]) {
                geomInstances.push(
                    new GeometryInstance({
                        geometry: new CircleGeometry({
                            center: point,
                            radius: buffer
                        })
                    })
                );
            }

            const appearance = new MaterialAppearance({
                material: Material.fromType("Color", { color: BUFFER_COLOR })
            });
            primitives.push(
                new GroundPrimitive({
                    appearance,
                    geometryInstances: geomInstances
                })
            );
        }
        return { entities, primitives };
    }
}
