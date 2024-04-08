/* eslint-disable */
import { HorizontalOrigin, Resource, VerticalOrigin, Color, Cartesian2 } from "cesium";
import { hexToRgbA } from "./Utils";
import { PolylineOutlineMaterialProperty } from "cesium";
import {
    CesiumLineDescriptor,
    CesiumLineSymbolizer,
    CesiumPointSymbolizer,
    CesiumPolygonSymbolizer,
    CesiumPolylineDescriptor,
    CesiumRasterSymbolizer,
    CesiumTextSymbolizer,
    FilterObject,
    FormattedFeatureTypeStyleRule,
    FormattedFeatureTypeStyleRules,
    FormattedUserStyles,
    OGCFeature,
    ScaleDenominator,
    SortedXmlRules,
    UserStyleDefinition
} from "../Types/types";
import WesDataSource from "../Datasources/WesDataSource";
import { translate as t } from "../i18n/Translator";

type Symbolizer =
    | CesiumTextSymbolizerObject
    | CesiumPointSymbolizerObject
    | CesiumPolygonSymbolizerObject
    | CesiumLineSymbolizerObject
    | CesiumScaleDenominatorSymbolizerObject;
type CesiumScaleDenominatorSymbolizerObject = number;
export interface CesiumPointSymbolizerObject {
    size: string | number;
    headingKey: string;
    externalGraphicUrl: string;
}
export interface CesiumLineSymbolizerObject {
    [key: string]: Color | number | string;
    color: string | Color;
    alpha: string | number;
    width: string | number;
}
export interface CesiumPolygonSymbolizerObject {
    [key: string]: string | Color | number;
    outlineColor: string | Color;
    outlineAlpha: string | number;
    outlineWidth: string | number;
    fillColor: string | Color;
    fillAlpha: string | number;
}
export interface CesiumTextSymbolizerObject {
    [key: string]:
        | string
        | number
        | Color
        | HorizontalOrigin
        | VerticalOrigin
        | [string, string]
        | Cartesian2
        | [number, number];
    font: string;
    fontSize: string | number;
    color: string | Color;
    outlineColor: string | Color;
    outlineWidth: string | number;
    horizontalOrigin: string | HorizontalOrigin;
    verticalOrigin: string | VerticalOrigin;
    pixelOffset: [string, string] | Cartesian2 | [number, number];
    textKey: string;
}

interface CesiumColorMapEntryObject {
    [key: string]: string | Color | number;
    color: string | Color;
    quantity: string | number;
}

export interface CesiumRasterSymbolizerObject {
    [key: string]: number | CesiumColorMapEntryObject[];
    opacity: number;
    colors: CesiumColorMapEntryObject[];
}

const namespaceMapping: { [key: string]: string } = {
    se: "http://www.opengis.net/se",
    ogc: "http://www.opengis.net/ogc",
    sld: "http://www.opengis.net/sld"
};

const comparisonOperatorMapping: { [key: string]: string } = {
    "ogc:PropertyIsEqualTo": "==",
    "ogc:PropertyIsNotEqualTo": "!=",
    "ogc:PropertyIsLessThan": "<",
    "ogc:PropertyIsGreaterThan": ">",
    "ogc:PropertyIsLessThanOrEqualTo": "<=",
    "ogc:PropertyIsGreaterThanOrEqualTo": ">=",
    "ogc:PropertyIsNull": "isNull",
    "ogc:PropertyIsNotNull": "isNotNull",
    //'ogc:PropertyIsBetween'
    "ogc:PropertyIsLike": "isLike"
};

const lineAttributeMapping: { [key: string]: string } = {
    stroke: "color",
    "stroke-opacity": "alpha",
    "stroke-width": "width"
    // "stroke-linejoin": "lineJoin", //Not supported
    // "stroke-linecap": "lineCap", //Not supported
    // "stroke-dasharray": "dashArray", //Not supported
    // "stroke-dashoffset": "dashOffset", //Not supported
};

const polygonAttributeMapping: { [key: string]: string } = {
    stroke: "outlineColor",
    "stroke-opacity": "outlineAlpha",
    "stroke-width": "outlineWidth",
    // "stroke-linejoin": "lineJoin", //Not supported
    // "stroke-linecap": "lineCap", //Not supported
    // "stroke-dasharray": "dashArray", //Not supported
    // "stroke-dashoffset": "dashOffset", //Not supported
    fill: "fillColor",
    "fill-opacity": "fillAlpha"
};

type SldParse = {
    sld: XMLDocument;
};

const textAttributeMapping: { [key: string]: string } = {
    "font-family": "font",
    // 'font-style': 'normal', //Not Supported
    // 'font-weight': 'normal', //Not Supported
    "font-size": "fontSize",
    fill: "color"
};

export async function SldParse(url: string, caller: WesDataSource, layerName?: string) {
    const xmlUrl = encodeURI(url);
    const xml = await Resource.fetchXML({
        url: xmlUrl,
        queryParameters: { f: "sld10" }
    });
    if (xml == null) return null;
    if (layerName) {
        const namedLayersArr = getElementsArrayByTagName(xml, "NamedLayer");
        for (let i = 0; i < namedLayersArr.length; i++) {
            const layer = namedLayersArr[i];
            const nameElem = getElementsArrayByTagName(layer, "Name");

            const innerName = nameElem[0].textContent;

            if (innerName === layerName) {
                return [
                    userStylesDefinitionArray(layer as unknown as XMLDocument, caller),
                    parseRulesFromSld(layer as unknown as XMLDocument)
                ];
            }
        }
    } else {
        return [userStylesDefinitionArray(xml as XMLDocument, caller), parseRulesFromSld(xml as XMLDocument)];
    }
}

function userStylesDefinitionArray(sld: XMLDocument, caller: WesDataSource) {
    const userStylesDefinitionArray: UserStyleDefinition[] = [];
    const userStyles = getUserStyles(sld);
    userStyles.forEach((userStyle, i: number) => {
        const nameElement = getElementsArrayByTagName(userStyle, "Name");
        const name = nameElement[0].textContent;
        userStylesDefinitionArray.push({
            index: i,
            name: name!,
            dataSource: caller
        });
    });
    return userStylesDefinitionArray;
}

function getElementsArrayByTagName(
    documentOrElement: XMLDocument | HTMLElement | Element,
    tagName: string
): HTMLElement[] {
    const tagNameParts = tagName.split(":");
    const hasNamespace = tagNameParts.length === 2;
    let sldElements: HTMLElement[] = [];
    if (hasNamespace) {
        sldElements = [].slice.call(
            documentOrElement.getElementsByTagNameNS(namespaceMapping[tagNameParts[0]], tagNameParts[1])
        );
    } else {
        for (const key in namespaceMapping) {
            sldElements = [].slice.call(documentOrElement.getElementsByTagNameNS(namespaceMapping[key], tagName));
            if (sldElements.length) {
                break;
            }
        }
        if (!sldElements.length) {
            sldElements = [].slice.call(documentOrElement.getElementsByTagName(tagName));
        }
    }
    return sldElements;
}

function parseRulesFromSld(sld: XMLDocument) {
    const userStyles = getUserStyles(sld);
    const defaultFeatureTypeStyles = getDefaultFeatureTypeStyles(userStyles);
    const styleRulesArray = parseStyleRulesFromFeatureTypeStyles(defaultFeatureTypeStyles);
    const sortedXmlRules = sortSymbolizersInStyleRules(styleRulesArray);
    const convertedRules = convertAttributesToCesiumFormat(sortedXmlRules);
    const formattedUserStyles = formatConvertedRules(convertedRules);
    return formattedUserStyles;
}

function getUserStyles(sld: XMLDocument) {
    if (sld == null) return [];
    return getElementsArrayByTagName(sld, "UserStyle");
}

function getDefaultFeatureTypeStyles(userStyles: HTMLElement[]) {
    if (!userStyles.length) return userStyles;
    const featureTypeStylesArray: HTMLElement[] = [];
    for (let i = 0; i < userStyles.length; i++) {
        const isDefault = getElementsArrayByTagName(userStyles[i], "IsDefault");
        if (isDefault.length > 0 && isDefault[0].textContent != ("false" || "0" || 0 || false)) {
            featureTypeStylesArray.unshift(getElementsArrayByTagName(userStyles[i], "FeatureTypeStyle")[0]);
            continue;
        }
        featureTypeStylesArray.push(getElementsArrayByTagName(userStyles[i], "FeatureTypeStyle")[0]);
    }
    return featureTypeStylesArray;
}

function parseStyleRulesFromFeatureTypeStyles(featureTypeStyles: HTMLElement[]) {
    const stylesArray: HTMLElement[][] = [];
    if (!featureTypeStyles.length) return stylesArray;
    featureTypeStyles.forEach(featureTypeStyle => {
        const rulesArray = getElementsArrayByTagName(featureTypeStyle, "Rule");
        stylesArray.push(rulesArray);
    });
    return stylesArray;
}

function sortSymbolizersInStyleRules(styleRulesArray: HTMLElement[][]) {
    const sortedStyleRules: SortedXmlRules[][] = [];
    if (!styleRulesArray.length) return sortedStyleRules;
    styleRulesArray.forEach(rulesArray => {
        const sortedXmlRulesArray: SortedXmlRules[] = [];
        rulesArray.forEach(xmlRule => {
            const sortedXmlRule: SortedXmlRules = {
                filters: [],
                minScaleDenominators: [],
                maxScaleDenominators: [],
                textSymbolizers: [],
                lineSymbolizers: [],
                pointSymbolizers: [],
                polygonSymbolizers: [],
                rasterSymbolizers: []
            };
            for (let i = 0; i < xmlRule.children.length; i++) {
                const type = xmlRule.children[i].localName;
                switch (type) {
                    case "Filter": {
                        sortedXmlRule.filters.push(xmlRule.children[i]);
                        break;
                    }
                    case "MinScaleDenominator": {
                        sortedXmlRule.minScaleDenominators.push(xmlRule.children[i]);
                        break;
                    }
                    case "MaxScaleDenominator": {
                        sortedXmlRule.maxScaleDenominators.push(xmlRule.children[i]);
                        break;
                    }
                    case "TextSymbolizer": {
                        sortedXmlRule.textSymbolizers.push(xmlRule.children[i]);
                        break;
                    }
                    case "LineSymbolizer": {
                        sortedXmlRule.lineSymbolizers.push(xmlRule.children[i]);
                        break;
                    }
                    case "PointSymbolizer": {
                        sortedXmlRule.pointSymbolizers.push(xmlRule.children[i]);
                        break;
                    }
                    case "PolygonSymbolizer": {
                        sortedXmlRule.polygonSymbolizers.push(xmlRule.children[i]);
                        break;
                    }
                    case "RasterSymbolizer": {
                        sortedXmlRule.rasterSymbolizers.push(xmlRule.children[i]);
                    }
                }
            }
            sortedXmlRulesArray.push(sortedXmlRule);
        });
        sortedStyleRules.push(sortedXmlRulesArray);
    });
    return sortedStyleRules;
}

function convertAttributesToCesiumFormat(sortedStyleRules: SortedXmlRules[][]) {
    const convertedStyleRules: SortedXmlRules[][] = [];
    if (!sortedStyleRules.length) return convertedStyleRules;
    sortedStyleRules.forEach(featureStyle => {
        const convertedXmlRules: SortedXmlRules[] = [];
        featureStyle.forEach(sortedXmlRule => {
            const filters: FilterObject[] = [];
            const lineSymbolizers: CesiumLineSymbolizerObject[] = [];
            const maxScaleDenominators: CesiumScaleDenominatorSymbolizerObject[] = [];
            const minScaleDenominators: CesiumScaleDenominatorSymbolizerObject[] = [];
            const pointSymbolizers: CesiumPointSymbolizerObject[] = [];
            const polygonSymbolizers: CesiumPolygonSymbolizerObject[] = [];
            const textSymbolizers: CesiumTextSymbolizerObject[] = [];
            const rasterSymbolizers: CesiumRasterSymbolizerObject[] = [];
            sortedXmlRule.filters.forEach(filter => {
                filters.push(convertFilterToCesium(filter as Element));
            });
            sortedXmlRule.lineSymbolizers.forEach(lineSymbolizer => {
                lineSymbolizers.push(convertLineSymbolizerToCesium(lineSymbolizer as Element));
            });
            sortedXmlRule.maxScaleDenominators.forEach(maxScaleDenominator => {
                maxScaleDenominators.push(convertScaleDenominatorToCesium(maxScaleDenominator as Element));
            });
            sortedXmlRule.minScaleDenominators.forEach(minScaleDenominator => {
                minScaleDenominators.push(convertScaleDenominatorToCesium(minScaleDenominator as Element));
            });
            sortedXmlRule.pointSymbolizers.forEach(pointSymbolizer => {
                pointSymbolizers.push(convertPointSymbolizerToCesium(pointSymbolizer as Element));
            });
            sortedXmlRule.polygonSymbolizers.forEach(polygonSymbolizer => {
                polygonSymbolizers.push(convertPolygonSymbolizerToCesium(polygonSymbolizer as Element));
            });
            sortedXmlRule.textSymbolizers.forEach(textSymbolizer => {
                textSymbolizers.push(convertTextSymbolizerToCesium(textSymbolizer as Element));
            });
            sortedXmlRule.rasterSymbolizers.forEach(rasterSymbolizer => {
                rasterSymbolizers.push(convertRasterSymbolizerToCesium(rasterSymbolizer as Element));
            });
            convertedXmlRules.push({
                filters,
                lineSymbolizers,
                maxScaleDenominators,
                minScaleDenominators,
                pointSymbolizers,
                polygonSymbolizers,
                textSymbolizers,
                rasterSymbolizers
            });
        });
        convertedStyleRules.push(convertedXmlRules);
    });
    return convertedStyleRules;
}

function convertFilterToCesium(filter: Element) {
    const hasAnd = getElementsArrayByTagName(filter, "And").length;
    const hasOr = getElementsArrayByTagName(filter, "Or").length;
    const filterParameters: FilterObject = {
        operator: hasAnd ? "and" : hasOr ? "or" : null,
        comparisons: []
    };
    if (filterParameters.operator === null) {
        for (const expression in comparisonOperatorMapping) {
            const filterElements = getElementsArrayByTagName(filter, expression);
            const mappedExpression = comparisonOperatorMapping[expression];
            filterElements.forEach(filterElement => {
                let specialCharacters = null;
                const property = getElementsArrayByTagName(filterElement, "PropertyName")[0].textContent;
                let literal: HTMLElement | string = getElementsArrayByTagName(filterElement, "Literal")[0];
                if (literal) {
                    literal = literal.textContent!;
                }
                if (mappedExpression === "isLike") {
                    specialCharacters = {
                        wildCard: (filterElement.attributes as any)["WildCard"].textContent,
                        singleChar: (filterElement.attributes as any)["singleChar"].textContent,
                        escape: (filterElement.attributes as any)["escape"].textContent
                    };
                }
                filterParameters.comparisons.push({
                    operator: mappedExpression,
                    property,
                    literal,
                    specialCharacters
                });
            });
        }
    } else {
        const operatorElement = filter.children[0];
        for (let i = 0; i < operatorElement.children.length; i++) {
            const wrapper = document.createElement("ogc:Filter");
            const clone = operatorElement.children[i].cloneNode(true);
            wrapper.append(clone);
            filterParameters.comparisons.push(convertFilterToCesium(wrapper));
        }
    }
    return filterParameters;
}

function convertLineSymbolizerToCesium(lineSymbolizer: Element): CesiumLineSymbolizerObject {
    const cesiumLineSymbolizer: CesiumLineSymbolizerObject = {
        color: "#000000",
        alpha: "1",
        width: "5px"
    };
    const svgParameters = getElementsArrayByTagName(lineSymbolizer, "SvgParameter");
    svgParameters.forEach(svgParameterElement => {
        const svgParameter = svgParameterElement.attributes[0].textContent;
        if (svgParameter! in lineAttributeMapping) {
            cesiumLineSymbolizer[lineAttributeMapping[svgParameter!]] = svgParameterElement.textContent!;
        }
    });
    return cesiumLineSymbolizer;
}

function convertScaleDenominatorToCesium(scaleDenominator: Element) {
    return Number(scaleDenominator.textContent!);
}

function convertPointSymbolizerToCesium(pointSymbolizer: Element) {
    const cesiumPointSymbolizer: CesiumPointSymbolizerObject = {
        size: "",
        headingKey: "",
        externalGraphicUrl: ""
    };
    const sizeElement = getElementsArrayByTagName(pointSymbolizer, "Size");
    if (sizeElement.length) {
        cesiumPointSymbolizer.size = sizeElement[0].textContent!;
        const sizeLiteral = getElementsArrayByTagName(sizeElement[0], "Literal");
        if (sizeLiteral.length) {
            cesiumPointSymbolizer.size = sizeLiteral[0].textContent!;
        }
    }
    const rotationElement = getElementsArrayByTagName(pointSymbolizer, "Rotation");
    if (rotationElement.length) {
        const headingKeyObject = getElementsArrayByTagName(rotationElement[0], "PropertyName");
        if (headingKeyObject.length) {
            cesiumPointSymbolizer.headingKey = headingKeyObject[0].textContent!;
        }
    }
    const externalGraphicElement = getElementsArrayByTagName(pointSymbolizer, "ExternalGraphic");
    if (externalGraphicElement.length) {
        const onlineResourceElement = getElementsArrayByTagName(externalGraphicElement[0], "OnlineResource");
        if (onlineResourceElement.length) {
            cesiumPointSymbolizer.externalGraphicUrl = (onlineResourceElement[0].attributes as any)["xlink:href"].value;
        }
    }
    return cesiumPointSymbolizer;
}
function convertPolygonSymbolizerToCesium(polygonSymbolizer: Element) {
    const cesiumPolygonSymbolizer: CesiumPolygonSymbolizerObject = {
        outlineColor: "#000000",
        outlineAlpha: "1",
        outlineWidth: "5px",
        fillColor: "#000000",
        fillAlpha: "1"
    };
    const svgParameters = getElementsArrayByTagName(polygonSymbolizer, "SvgParameter");
    svgParameters.forEach(svgParameterElement => {
        const svgParameter = svgParameterElement.attributes[0].textContent;
        if (svgParameter! in polygonAttributeMapping) {
            cesiumPolygonSymbolizer[polygonAttributeMapping[svgParameter!]] = svgParameterElement.textContent!;
            const literalElement = getElementsArrayByTagName(svgParameterElement, "Literal");
            if (literalElement.length) {
                cesiumPolygonSymbolizer[polygonAttributeMapping[svgParameter!]] = literalElement[0].textContent!;
            }
        }
    });
    return cesiumPolygonSymbolizer;
}

function convertTextSymbolizerToCesium(textSymbolizer: Element) {
    const cesiumTextSymbolizer: CesiumTextSymbolizerObject = {
        font: "30px sans-serif",
        fontSize: "10px",
        color: "#000000",
        outlineColor: "#FFFFFF",
        outlineWidth: "0",
        horizontalOrigin: "0.5",
        verticalOrigin: "0.5",
        pixelOffset: ["", ""],
        textKey: "Unknown"
    };

    const outlineElement = getElementsArrayByTagName(textSymbolizer, "Halo");
    if (outlineElement.length) {
        const outlineColorElement = getElementsArrayByTagName(outlineElement[0], "CssParameter");
        const outlineColor = outlineColorElement[0];
        if (outlineColor && outlineColor.textContent) cesiumTextSymbolizer.outlineColor = outlineColor.textContent;
        const outlineWidthElement = getElementsArrayByTagName(outlineElement[0], "Radius");
        const outlineWidth = outlineWidthElement[0];
        if (outlineWidth && outlineWidth.textContent) {
            cesiumTextSymbolizer.outlineWidth = outlineWidth.textContent;
        }
    }
    const horizontalOriginElement = getElementsArrayByTagName(textSymbolizer, "AnchorPointX");
    const horizontalOrigin = horizontalOriginElement[0];
    if (horizontalOrigin && horizontalOrigin.textContent)
        cesiumTextSymbolizer.horizontalOrigin = horizontalOrigin.textContent;
    const verticalOriginElement = getElementsArrayByTagName(textSymbolizer, "AnchorPointY");
    const verticalOrigin = verticalOriginElement[0];
    if (verticalOrigin && verticalOrigin.textContent) cesiumTextSymbolizer.verticalOrigin = verticalOrigin.textContent;

    const horizontalDisplacementElement = getElementsArrayByTagName(textSymbolizer, "DisplacementX");
    const verticalDisplacementElement = getElementsArrayByTagName(textSymbolizer, "DisplacementY");
    const horizontalDisplacement = horizontalDisplacementElement[0];
    const verticalDisplacement = verticalDisplacementElement[0];

    if (
        horizontalDisplacement &&
        horizontalDisplacement.textContent &&
        verticalDisplacement &&
        verticalDisplacement.textContent
    )
        cesiumTextSymbolizer.pizelOffset = [horizontalDisplacement.textContent, verticalDisplacement.textContent];

    const fillElement = getElementsArrayByTagName(textSymbolizer, "Fill");
    if (fillElement.length) {
        let colorElement = getElementsArrayByTagName(fillElement[0], "CssParameter");
        if (!colorElement.length) {
            colorElement = getElementsArrayByTagName(fillElement[0], "SvgParameter");
        }
        cesiumTextSymbolizer.color = colorElement[0].textContent!;
    }
    const labelElement = getElementsArrayByTagName(textSymbolizer, "Label");
    const textKeyElement = getElementsArrayByTagName(labelElement[0], "PropertyName");
    if (textKeyElement.length) {
        cesiumTextSymbolizer.textKey = textKeyElement[0].textContent!;
    }
    const svgParameters = getElementsArrayByTagName(textSymbolizer, "SvgParameter");
    svgParameters.forEach(svgParameterElement => {
        const svgParameter = svgParameterElement.attributes[0].textContent;
        if (svgParameter! in textAttributeMapping && svgParameter! !== "fill") {
            cesiumTextSymbolizer[textAttributeMapping[svgParameter!]] = svgParameterElement.textContent!;
        }
    });
    const cssParameters = getElementsArrayByTagName(textSymbolizer, "CssParameter");
    cssParameters.forEach(cssParameterElement => {
        const cssParameter = cssParameterElement.attributes[0].textContent;
        if (cssParameter! in textAttributeMapping && cssParameter! !== "fill") {
            cesiumTextSymbolizer[textAttributeMapping[cssParameter!]] = cssParameterElement.textContent!;
        }
    });
    return cesiumTextSymbolizer;
}

function convertRasterSymbolizerToCesium(rasterSymbolizer: Element) {
    const cesiumRasterSymbolizer: CesiumRasterSymbolizerObject = {
        opacity: 1.0,
        colors: []
    };

    const opacity = getElementsArrayByTagName(rasterSymbolizer, "Opacity")[0];
    if (opacity && opacity.textContent) cesiumRasterSymbolizer.opacity = Number(opacity.textContent);

    getElementsArrayByTagName(rasterSymbolizer, "ColorMapEntry").forEach(entry => {
        const color = entry.getAttribute("color");
        const quantity = entry.getAttribute("quantity");
        if (color && quantity) {
            cesiumRasterSymbolizer.colors.push({
                color: Color.fromCssColorString(color),
                quantity: quantity
            });
        }
    });
    return cesiumRasterSymbolizer;
}

function formatConvertedRules(sortedXmlRules: SortedXmlRules[][]): FormattedUserStyles {
    const userStyles: FormattedUserStyles = [];
    if (!sortedXmlRules.length) return userStyles;
    sortedXmlRules.forEach(userStyle => {
        const formattedRules: FormattedFeatureTypeStyleRules = [];
        userStyle.forEach(xmlRule => {
            const filterArray: FilterObject[] = [];
            const maxScaleDenominatorArray: ScaleDenominator[] = [];
            const minScaleDenominatorArray: ScaleDenominator[] = [];
            const pointSymbolizerArray: CesiumPointSymbolizer[] = [];
            const lineSymbolizerArray: CesiumLineSymbolizer[] = [];
            const polygonSymbolizerArray: CesiumPolygonSymbolizer[] = [];
            const textSymbolizerArray: CesiumTextSymbolizer[] = [];
            const rasterSymbolizerArray: CesiumRasterSymbolizer[] = [];
            xmlRule.filters.forEach(filter => {
                filterArray.push(filter as FilterObject);
                return;
            });
            xmlRule.maxScaleDenominators.forEach(denominator => {
                maxScaleDenominatorArray.push(denominator as ScaleDenominator);
            });
            xmlRule.minScaleDenominators.forEach(denominator => {
                minScaleDenominatorArray.push(denominator as ScaleDenominator);
            });
            xmlRule.pointSymbolizers.forEach(pointSymbolizer => {
                pointSymbolizerArray.push(formatPointSymbolizer(pointSymbolizer as CesiumPointSymbolizerObject));
            });
            xmlRule.lineSymbolizers.forEach(lineSymbolizer => {
                formatLineSymbolizer(lineSymbolizer as CesiumLineSymbolizerObject);
            });
            if (xmlRule.lineSymbolizers.length >= 2) {
                lineSymbolizerArray.push(createOutlineFromMultipleLines(xmlRule.lineSymbolizers));
            } else if (xmlRule.lineSymbolizers.length) {
                lineSymbolizerArray.push(createLineObject(xmlRule.lineSymbolizers[0]));
            }
            xmlRule.polygonSymbolizers.forEach(polygonSymbolizer => {
                polygonSymbolizerArray.push(
                    formatPolygonSymbolizer(polygonSymbolizer as CesiumPolygonSymbolizerObject)
                );
            });
            xmlRule.textSymbolizers.forEach(textSymbolizer => {
                textSymbolizerArray.push(formatTextSymbolizer(textSymbolizer as CesiumTextSymbolizerObject));
            });
            xmlRule.rasterSymbolizers.forEach(rasterSymbolizer => {
                rasterSymbolizerArray.push(formatRasterSymbolizer(rasterSymbolizer as CesiumRasterSymbolizerObject));
            });
            const formattedRule: FormattedFeatureTypeStyleRule = {
                filters: filterArray,
                maxScaleDenominator: maxScaleDenominatorArray,
                minScaleDenominator: minScaleDenominatorArray,
                pointSymbolizers: pointSymbolizerArray,
                lineSymbolizers: lineSymbolizerArray,
                polygonSymbolizers: polygonSymbolizerArray,
                textSymbolizers: textSymbolizerArray,
                rasterSymbolizers: rasterSymbolizerArray
            };
            formattedRules.push(formattedRule);
        });
        userStyles.push(formattedRules);
    });
    return userStyles;
}

function formatPointSymbolizer(cesiumPointSymbolizer: CesiumPointSymbolizerObject) {
    const formattedPointSymbolizer: CesiumPointSymbolizer = {
        size: 40,
        headingKey: "",
        externalGraphicUrl: ""
    };
    changeStringsToNumbers(cesiumPointSymbolizer); //checked
    cesiumPointSymbolizer.size =
        cesiumPointSymbolizer.size == null ? formattedPointSymbolizer.size : cesiumPointSymbolizer.size;
    cesiumPointSymbolizer.headingKey =
        cesiumPointSymbolizer.headingKey == null
            ? formattedPointSymbolizer.headingKey
            : cesiumPointSymbolizer.headingKey;
    cesiumPointSymbolizer.externalGraphicUrl =
        cesiumPointSymbolizer.externalGraphicUrl == null
            ? formattedPointSymbolizer.externalGraphicUrl
            : cesiumPointSymbolizer.externalGraphicUrl;
    return {
        size: cesiumPointSymbolizer.size as number,
        headingKey: cesiumPointSymbolizer.headingKey,
        externalGraphicUrl: cesiumPointSymbolizer.externalGraphicUrl
    };
}

function formatLineSymbolizer(cesiumLineSymbolizer: CesiumLineSymbolizerObject) {
    const formattedLineSymbolizer = {
        color: Color.BLACK,
        alpha: 1,
        width: 3
    };
    changeStringsToNumbers(cesiumLineSymbolizer); //checked
    changeColorsToRgba(cesiumLineSymbolizer); //checked
    cesiumLineSymbolizer.color =
        cesiumLineSymbolizer.color == null ? formattedLineSymbolizer.color : cesiumLineSymbolizer.color;
    cesiumLineSymbolizer.alpha =
        cesiumLineSymbolizer.alpha == null ? formattedLineSymbolizer.alpha : cesiumLineSymbolizer.alpha;
    cesiumLineSymbolizer.width =
        cesiumLineSymbolizer.width == null ? formattedLineSymbolizer.width : cesiumLineSymbolizer.width;
    return {
        color: cesiumLineSymbolizer.color,
        alpha: cesiumLineSymbolizer.alpha,
        width: cesiumLineSymbolizer.width
    };
}

function formatPolygonSymbolizer(cesiumPolygonSymbolizer: CesiumPolygonSymbolizerObject) {
    const formattedPolygonSymbolizer = {
        outlineColor: Color.BLACK,
        outlineAlpha: 1,
        outlineWidth: 5,
        fillColor: Color.WHITE,
        fillAlpha: 1
    };
    changeStringsToNumbers(cesiumPolygonSymbolizer);
    changeColorsToRgba(cesiumPolygonSymbolizer);
    cesiumPolygonSymbolizer.outlineColor =
        cesiumPolygonSymbolizer.outlineColor == null
            ? formattedPolygonSymbolizer.outlineColor
            : cesiumPolygonSymbolizer.outlineColor;
    cesiumPolygonSymbolizer.outlineAlpha =
        cesiumPolygonSymbolizer.outlineAlpha == null
            ? formattedPolygonSymbolizer.outlineAlpha
            : cesiumPolygonSymbolizer.outlineAlpha;
    cesiumPolygonSymbolizer.outlineWidth =
        cesiumPolygonSymbolizer.outlineWidth == null
            ? formattedPolygonSymbolizer.outlineWidth
            : cesiumPolygonSymbolizer.outlineWidth;
    cesiumPolygonSymbolizer.fillColor =
        cesiumPolygonSymbolizer.fillColor == null
            ? formattedPolygonSymbolizer.fillColor
            : cesiumPolygonSymbolizer.fillColor;
    cesiumPolygonSymbolizer.fillAlpha =
        cesiumPolygonSymbolizer.fillAlpha == null
            ? formattedPolygonSymbolizer.fillAlpha
            : cesiumPolygonSymbolizer.fillAlpha;
    return {
        outlineColor: cesiumPolygonSymbolizer.outlineColor,
        outlineAlpha: cesiumPolygonSymbolizer.outlineAlpha as number,
        outlineWidth: cesiumPolygonSymbolizer.outlineWidth as number,
        fillColor: cesiumPolygonSymbolizer.fillColor,
        fillAlpha: cesiumPolygonSymbolizer.fillAlpha as number
    };
}

function formatTextSymbolizer(cesiumTextSymbolizer: CesiumTextSymbolizerObject): CesiumTextSymbolizer {
    const formattedTextSymbolizer = {
        font: "vera",
        fontSize: "20px",
        color: Color.BLACK,
        outlineColor: Color.WHITE,
        outlineWidth: 5,
        horizontalOrigin: HorizontalOrigin.CENTER,
        verticalOrigin: VerticalOrigin.CENTER,
        pixelOffset: new Cartesian2(0, 0),
        textKey: ""
    };
    pickOrigin(cesiumTextSymbolizer); //checked
    changeColorsToRgba(cesiumTextSymbolizer); //checked
    createFontString(cesiumTextSymbolizer);
    changeStringsToNumbers(cesiumTextSymbolizer); //checked
    cesiumTextSymbolizer.pixelOffset = createCartesian2FromPixelOffset(cesiumTextSymbolizer);
    cesiumTextSymbolizer.font =
        cesiumTextSymbolizer.font == null ? formattedTextSymbolizer.font : cesiumTextSymbolizer.font;
    cesiumTextSymbolizer.fontSize =
        cesiumTextSymbolizer.fontSize == null ? formattedTextSymbolizer.fontSize : cesiumTextSymbolizer.fontSize;
    cesiumTextSymbolizer.color =
        cesiumTextSymbolizer.color == null ? formattedTextSymbolizer.color : (cesiumTextSymbolizer.color as Color);
    cesiumTextSymbolizer.outlineColor =
        cesiumTextSymbolizer.outlineColor == null
            ? formattedTextSymbolizer.outlineColor
            : (cesiumTextSymbolizer.outlineColor as Color);
    cesiumTextSymbolizer.outlineWidth =
        cesiumTextSymbolizer.outlineWidth == null
            ? formattedTextSymbolizer.outlineWidth
            : (cesiumTextSymbolizer.outlineWidth as number);
    cesiumTextSymbolizer.horizontalOrigin =
        cesiumTextSymbolizer.horizontalOrigin == null
            ? formattedTextSymbolizer.horizontalOrigin
            : (cesiumTextSymbolizer.horizontalOrigin as HorizontalOrigin);
    cesiumTextSymbolizer.verticalOrigin =
        cesiumTextSymbolizer.verticalOrigin == null
            ? formattedTextSymbolizer.verticalOrigin
            : (cesiumTextSymbolizer.verticalOrigin as VerticalOrigin);
    cesiumTextSymbolizer.pixelOffset =
        cesiumTextSymbolizer.pixelOffset == null
            ? formattedTextSymbolizer.pixelOffset
            : (cesiumTextSymbolizer.pixelOffset as Cartesian2);
    cesiumTextSymbolizer.textKey =
        cesiumTextSymbolizer.textKey == null ? formattedTextSymbolizer.textKey : cesiumTextSymbolizer.textKey;
    return {
        font: cesiumTextSymbolizer.font,
        fontSize: cesiumTextSymbolizer.fontSize as string,
        color: cesiumTextSymbolizer.color as Color,
        outlineColor: cesiumTextSymbolizer.outlineColor as Color,
        outlineWidth: cesiumTextSymbolizer.outlineWidth as number,
        horizontalOrigin: cesiumTextSymbolizer.horizontalOrigin as HorizontalOrigin,
        verticalOrigin: cesiumTextSymbolizer.verticalOrigin as VerticalOrigin,
        pixelOffset: cesiumTextSymbolizer.pixelOffset,
        textKey: cesiumTextSymbolizer.textKey
    };
}

function formatRasterSymbolizer(cesiumRasterSymbolizer: CesiumRasterSymbolizerObject): CesiumRasterSymbolizer {
    const symbolizer: CesiumRasterSymbolizer = {
        opacity: 1.0,
        colorMap: []
    };

    const overwriteOpacity = cesiumRasterSymbolizer.opacity;
    if (overwriteOpacity) symbolizer.opacity = overwriteOpacity;

    cesiumRasterSymbolizer.colors.forEach(colorEntry => {
        const rawColor = colorEntry.color;
        const color: Color = typeof rawColor === "string" ? Color.fromCssColorString(rawColor) : (rawColor as Color);
        const rawQuantity = colorEntry.quantity;
        const quantity: number = typeof rawQuantity === "number" ? rawQuantity : Number(rawQuantity);
        symbolizer.colorMap.push({
            color: color,
            quantity: quantity
        });
    });

    return symbolizer;
}

function pickOrigin(cesiumTextSymbolizer: CesiumTextSymbolizerObject) {
    if (cesiumTextSymbolizer.verticalOrigin != null) {
        cesiumTextSymbolizer.verticalOrigin = pickVerticalOrigin(cesiumTextSymbolizer);
    } else {
        cesiumTextSymbolizer.verticalOrigin = VerticalOrigin.CENTER;
    }
    if (cesiumTextSymbolizer.horizontalOrigin != null) {
        cesiumTextSymbolizer.horizontalOrigin = pickHorizontalOrigin(cesiumTextSymbolizer);
    } else {
        cesiumTextSymbolizer.horizontalOrigin = HorizontalOrigin.CENTER;
    }
}

function pickVerticalOrigin(cesiumTextSymbolizer: CesiumTextSymbolizerObject) {
    if (cesiumTextSymbolizer.verticalOrigin == "0.5") {
        return VerticalOrigin.CENTER;
    } else if (cesiumTextSymbolizer.verticalOrigin < "0.5") {
        return VerticalOrigin.BOTTOM;
    } else {
        return VerticalOrigin.TOP;
    }
}

function pickHorizontalOrigin(cesiumTextSymbolizer: CesiumTextSymbolizerObject) {
    if (cesiumTextSymbolizer.horizontalOrigin == "0.5") {
        return HorizontalOrigin.CENTER;
    } else if (cesiumTextSymbolizer.horizontalOrigin < "0.5") {
        return HorizontalOrigin.LEFT;
    } else {
        return HorizontalOrigin.RIGHT;
    }
}

function validateColor(rgba: number[]) {
    if (!rgba.length || !(rgba.length === 3 || rgba.length === 4)) {
        return [255, 255, 255];
    }
    rgba.forEach(channel => {
        if (channel < 0 || channel > 255) {
            channel = 255;
        }
    });
    return rgba;
}

function changeColorsToRgba(
    cesiumSymbolizer:
        | CesiumTextSymbolizer
        | CesiumTextSymbolizerObject
        | CesiumPolygonSymbolizer
        | CesiumLineSymbolizerObject
        | CesiumPolygonSymbolizerObject
) {
    if ((cesiumSymbolizer as CesiumTextSymbolizer).color != null) {
        let rgbColor = hexToRgbA((cesiumSymbolizer as CesiumTextSymbolizer).color as string);
        rgbColor = validateColor(rgbColor);
        let transparency = 255;
        if ((cesiumSymbolizer as CesiumLineSymbolizerObject).alpha) {
            transparency = Number((cesiumSymbolizer as CesiumLineSymbolizerObject).alpha) * 255;
        }
        (cesiumSymbolizer as CesiumTextSymbolizer).color = Color.fromBytes(
            rgbColor[0],
            rgbColor[1],
            rgbColor[2],
            transparency
        );
    }
    if ((cesiumSymbolizer as CesiumPolygonSymbolizer).fillColor != null) {
        let rgbColor = hexToRgbA((cesiumSymbolizer as CesiumPolygonSymbolizer).fillColor as string);
        rgbColor = validateColor(rgbColor);
        let transparency = 255;
        if ((cesiumSymbolizer as CesiumPolygonSymbolizer).fillAlpha) {
            transparency = Number((cesiumSymbolizer as CesiumPolygonSymbolizer).fillAlpha) * 255;
        }
        (cesiumSymbolizer as CesiumPolygonSymbolizer).fillColor = Color.fromBytes(
            rgbColor[0],
            rgbColor[1],
            rgbColor[2],
            transparency
        );
    }
    if (cesiumSymbolizer.outlineColor != null) {
        let rgbColor = hexToRgbA(cesiumSymbolizer.outlineColor as string);
        rgbColor = validateColor(rgbColor);
        let transparency = 255;
        if ((cesiumSymbolizer as CesiumPolygonSymbolizer).outlineAlpha) {
            transparency = Number((cesiumSymbolizer as CesiumPolygonSymbolizer).outlineAlpha) * 255;
        }
        cesiumSymbolizer.outlineColor = Color.fromBytes(rgbColor[0], rgbColor[1], rgbColor[2], transparency);
    }
}

function createFontString(cesiumTextSymbolizer: CesiumTextSymbolizerObject) {
    if (cesiumTextSymbolizer.font != null && cesiumTextSymbolizer.fontSize != null) {
        cesiumTextSymbolizer.font = `${cesiumTextSymbolizer.fontSize}px ${cesiumTextSymbolizer.font}`;
    }
}

function changeStringsToNumbers(cesiumSymbolizer: Symbolizer) {
    if ((cesiumSymbolizer as CesiumLineSymbolizerObject).width != null) {
        if ((cesiumSymbolizer as CesiumLineSymbolizerObject).width === "") {
            (cesiumSymbolizer as CesiumLineSymbolizerObject).width = 40;
        } else {
            (cesiumSymbolizer as CesiumLineSymbolizerObject).width = Number(
                (cesiumSymbolizer as CesiumLineSymbolizerObject).width
            );
        }
    }
    if ((cesiumSymbolizer as CesiumLineSymbolizerObject).outlineWidth != null) {
        if ((cesiumSymbolizer as CesiumLineSymbolizerObject).outlineWidth === "") {
            (cesiumSymbolizer as CesiumLineSymbolizerObject).outlineWidth = 3;
        } else {
            (cesiumSymbolizer as CesiumLineSymbolizerObject).outlineWidth = Number(
                (cesiumSymbolizer as CesiumTextSymbolizerObject).outlineWidth
            );
        }
    }
    if ((cesiumSymbolizer as CesiumTextSymbolizerObject).pixelOffset != null) {
        if (
            ((cesiumSymbolizer as CesiumTextSymbolizerObject).pixelOffset as [string, string]).every(
                (anchor: string) => anchor === ""
            )
        ) {
            (cesiumSymbolizer as CesiumTextSymbolizerObject).pixelOffset = [0, 0];
        } else {
            ((cesiumSymbolizer as CesiumTextSymbolizerObject).pixelOffset as [number, number])[0] = Number(
                ((cesiumSymbolizer as CesiumTextSymbolizerObject).pixelOffset as [string, string])[0]
            );
            ((cesiumSymbolizer as CesiumTextSymbolizerObject).pixelOffset as [number, number])[1] = Number(
                ((cesiumSymbolizer as CesiumTextSymbolizerObject).pixelOffset as [string, string])[1]
            );
        }
        if ((cesiumSymbolizer as CesiumTextSymbolizerObject).size != null) {
            if ((cesiumSymbolizer as CesiumTextSymbolizerObject).size === "") {
                (cesiumSymbolizer as CesiumTextSymbolizerObject).size = 40;
            } else {
                (cesiumSymbolizer as CesiumTextSymbolizerObject).size = Number(
                    (cesiumSymbolizer as CesiumTextSymbolizerObject).size
                );
            }
        }
    }
}

function createCartesian2FromPixelOffset(cesiumTextSymbolizer: CesiumTextSymbolizerObject) {
    return new Cartesian2((cesiumTextSymbolizer.pixelOffset as any)[0], (cesiumTextSymbolizer.pixelOffset as any)[1]);
}

function createOutlineFromMultipleLines(lineSymbolizers: CesiumLineSymbolizerObject[]): CesiumPolylineDescriptor {
    const outlineWidth = (lineSymbolizers[0].width as number) - (lineSymbolizers[1].width as number);
    const material = new PolylineOutlineMaterialProperty({
        color: lineSymbolizers[1].color as Color,
        outlineWidth,
        outlineColor: lineSymbolizers[0].color as Color
    });
    const width = lineSymbolizers[1].width as number;
    return { material, width };
}

function createLineObject(lineSymbolizer: CesiumLineSymbolizerObject): CesiumLineDescriptor {
    return {
        width: lineSymbolizer.width as number,
        material: lineSymbolizer.color
    };
}

export function getMatchingRules(rawFeature: OGCFeature, userStyle: FormattedFeatureTypeStyleRules) {
    const matchedRules: FormattedFeatureTypeStyleRules = [];
    if (rawFeature.properties == null) {
        return matchedRules;
    }
    userStyle.forEach(rule => {
        if (!rule.filters.length) {
            matchedRules.push(rule);
            return;
        }
        if (checkForFilterMatch(rule.filters[0], rawFeature)) {
            matchedRules.push(rule);
        }
    });
    return matchedRules;
}

function isLike(featureProperty: string, literalProperty: string, specialCharacters: any) {
    if (featureProperty == null) {
        return false;
    } else {
        // defines what the characters should be mapped to in the reg expression
        const specialCharMap = new Map([
            [specialCharacters.wildCard, ".*"],
            [specialCharacters.singleChar, "."],
            [specialCharacters.escape, "/"]
        ]);
        let regExString = "^";

        for (const char of literalProperty) {
            if (Array.from(specialCharMap.keys()).includes(char)) {
                regExString += specialCharMap.get(char);
            } else {
                regExString += char;
            }
        }
        regExString += "$";
        const regEx = new RegExp(regExString);
        return regEx.test(featureProperty);
    }
}

function checkForFilterMatch(filter: FilterObject, rawFeature: OGCFeature) {
    const properties = rawFeature.properties;
    //Determine whether to call .some() or .every() on the comparisons array. AKA whether all conditions, or at least one condition has to be met for styling.
    const operator = filter.operator == null || filter.operator === "and" ? "every" : "some";

    //Check the comparison for truth.
    const isMatch = filter.comparisons[operator](function (comparison: any) {
        const property = properties![comparison.property];
        const literal = comparison.literal;
        const specialChars = filter.comparisons[0].specialCharacters;
        let isLiteralMatch = false;
        switch (comparison.operator) {
            case "==":
                isLiteralMatch = property === literal;
                break;
            case "!=":
                isLiteralMatch = property !== literal;
                break;
            case "<":
                isLiteralMatch = property < literal;
                break;
            case ">":
                isLiteralMatch = property > literal;
                break;
            case "<=":
                isLiteralMatch = property <= literal;
                break;
            case ">=":
                isLiteralMatch = property >= literal;
                break;
            case "isNull":
                isLiteralMatch = property == null;
                break;
            case "isNotNull":
                isLiteralMatch = property != null;
                break;
            case "isLike":
                isLiteralMatch = isLike(property, literal, specialChars);
                break;
            case null:
            case "or":
            case "and":
                isLiteralMatch = checkForFilterMatch(comparison, rawFeature);
                break;
            case "default":
                console.error(t("wes3dSldStyleError1", comparison.operator));
                break;
        }
        //Set isMatch to isLiteralMatch
        return isLiteralMatch;
    });
    //Return isMatch
    return isMatch;
}
