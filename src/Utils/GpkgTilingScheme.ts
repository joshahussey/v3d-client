import { GeographicTilingScheme } from "cesium";
import { zoomDim } from "../Types/3dMapControllerTypes";

export default class GpkgTilingScheme extends GeographicTilingScheme {
    dimMap: Map<number, Dimension>;

    constructor(matrixDims: zoomDim[]) {
        super();
        this.dimMap = new Map();
        matrixDims.forEach((dimension: zoomDim) => {
            console.log("Processing dim.", dimension.level, dimension.width, dimension.height);
            this.dimMap.set(dimension.level, {
                width: dimension.width,
                height: dimension.height
            });
        });
    }

    getNumberOfXTilesAtLevel(level: number): number {
        const retrieved = this.dimMap.get(level);
        return retrieved ? retrieved.width : 0;
    }

    getNumberOfYTilesAtLevel(level: number): number {
        const retrieved = this.dimMap.get(level);
        return retrieved ? retrieved.height : 0;
    }
}
type Dimension = {
    width: number;
    height: number;
};
