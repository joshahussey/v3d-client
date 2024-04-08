import { JulianDate } from "cesium";
import Moment from "moment";
import { DatasourceTypes } from "../Constants";
import { Show } from "solid-js";
import { CesiumRasterSymbolizer, LegendSource } from "../Types/types";
export function LegendEntry(description: {source: LegendSource}) {
    const minValue = Math.trunc(description.source.minValue as number);
    const middleValue = Math.trunc((description.source.maxValue as number + (description.source.minValue as number)) / 2);
    const maxValue = Math.trunc(description.source.maxValue as number);
    const legendDiv = produceColoredLegend(minValue, middleValue, maxValue, description.source.symbolizer);
    return (
        <div class="legend-entry">
            <div>{description.source.id}:&nbsp;</div>
            <Show when={description.source.lowerTimeBound != null} fallback={<div />}>
                <div>
                    {formatDate(description.source.lowerTimeBound)}
                    &nbsp; - &nbsp;
                    {formatDate(description.source.upperTimeBound)}
                </div>
            </Show>
            <Show
                when={
                    description.source.type !== DatasourceTypes.OgcFeaturesAPI &&
                    description.source.type !== DatasourceTypes.Celestial
                }
                fallback={
                    <>
                        <div />
                        <div />
                    </>
                }
            >
                <div>{description.source.uom}</div>
                {legendDiv}
            </Show>
            <div>{formatDate(description.source.currentTime)}</div>
        </div>
    );
}

/**
 * Format Julian dates for display in legend.
 * Returns empty string if no date is provided.
 * @param {JulianDate} date - The date to format (Optional)
 * @returns {string} - The formatted date.
 */
function formatDate(date?: JulianDate): string {
    if (!date) return "";
    return Moment(JulianDate.toDate(date)).format("DD/MM/YYYY");
}

function produceColoredLegend(
    minValue: number,
    middleValue: number,
    maxValue: number,
    symbolizer?: CesiumRasterSymbolizer
) {
    if (symbolizer && symbolizer.colorMap && symbolizer.colorMap.length) {
        const denominator = symbolizer.colorMap.length - 1;
        let gradientString = "linear-gradient(to right";

        let index = 0;
        symbolizer.colorMap.forEach(entry => {
            gradientString += ", ";
            gradientString += entry.color.toCssColorString();
            gradientString += " ";
            const location = (100 * index) / denominator;
            gradientString += location;
            gradientString += "%";
            index++;
        });

        gradientString += ")";

        return (
            <div class="legend-colors-manual" style={{ background: gradientString }}>
                <div>{minValue}</div>
                <div>{middleValue}</div>
                <div>{maxValue}</div>
            </div>
        );
    }
    return (
        <div class="legend-colors">
            <div>{minValue}</div>
            <div>{middleValue}</div>
            <div>{maxValue}</div>
        </div>
    );
}
