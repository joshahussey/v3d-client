import { Rectangle } from "cesium";

export function validateBoundingBox(bounds: Rectangle) {
    try {
        Rectangle.validate(bounds);
        return true;
    } catch {
        return false;
    }
}
