import { describe, expect, test } from "@jest/globals";
import { iso8601PeriodToObject } from "../src/Utils/TimeParser";
describe("PeriodStringToObject", () => {
    test("Should return proper period object", () => {
        expect(iso8601PeriodToObject("P6Y")).toStrictEqual({years: 6, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0});
    });
});
