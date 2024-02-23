import { describe, expect, test } from "@jest/globals";
import { heightReferenceCheck } from "../src/Utils/Utils";
import { HeightReference } from "cesium";
describe("heightReferenceCheck", () => {
    test("Should return HeightReference.CLAMP_TO_GROUND", () => {
        expect(heightReferenceCheck([0, 0, 0])).toBe(HeightReference.CLAMP_TO_GROUND);
    });
    test("Should return HeightReference.RELATIVE_TO_GROUND", () => {
        expect(heightReferenceCheck([0, 0, 1])).toBe(HeightReference.RELATIVE_TO_GROUND);
    });
});
