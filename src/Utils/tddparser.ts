import { And, Filter, Or, PropertyComparison, Rule, UserStyle, ValueComparison, ValueOperator } from "../Types/tdd";
import { OGCFeature } from "../Types/types";

export function getTddRuleMatches(rawFeature: OGCFeature, userStyle: UserStyle): Rule[] {
    const matchedRules = [];
    const rules = userStyle.FeatureTypeStyle.Rule;
    for (const rule of rules) {
        if (matchesFilter(rawFeature, rule.Filter)) {
            matchedRules.push(rule);
        }
    }
    return matchedRules;
}

function matchesFilter(rawFeature: OGCFeature, filter: Filter | undefined): boolean {
    if (filter == null) return true;
    if (rawFeature.properties == null) return false;
    const op: ValueOperator = Object.keys(filter)[0] as ValueOperator;
    const criteria = (filter as ValueComparison)[op].Value;
    const featVal = rawFeature.properties[(filter as ValueComparison)[op].Property];
    switch (op as string) {
        case "And": {
            const keys = Object.keys((filter as And)[op as "And"]);
            for (let i = 0; i < keys.length; i++) {
                if (Array.isArray((filter as And)[op as "And"][keys[i] as keyof Filter])) {
                    for (let j = 0; j < ((filter as And)[op as "And"][keys[i] as keyof Filter] as (ValueComparison | PropertyComparison)[]).length; j++) {
                        const element = new Object() as {[key: string]: Filter};
                        element[keys[i] as keyof Filter] = ((filter as And)[op as "And"][keys[i] as keyof Filter] as (ValueComparison | PropertyComparison)[])[j];
                        if (!matchesFilter(rawFeature, element as Filter)) return false;
                    }
                } else {
                    const filt = new Object() as {[key: string]: Filter};
                    filt[keys[i]] = (filter as And)[op as "And"][keys[i] as keyof Filter];
                    if (!matchesFilter(rawFeature, filt as Filter)) return false;
                }
            }
            return true;
        }
        case "Or": {
            const keys = Object.keys((filter as Or)[op as "Or"]);
            for (let i = 0; i < keys.length; i++) {
                if (Array.isArray((filter as Or)[op as "Or"][keys[i] as keyof Filter])) {
                    for (let j = 0; j < ((filter as Or)[op as "Or"][keys[i] as keyof Filter] as (ValueComparison | PropertyComparison)[]).length; j++) {
                        const element = new Object() as {[key: string]: Filter};
                        element[keys[i]] = ((filter as Or)[op as "Or"][keys[i] as keyof Filter] as (ValueComparison | PropertyComparison)[])[j];
                        if (matchesFilter(rawFeature, element as Filter)) return true;
                    }
                } else {
                    const filt = new Object() as {[key: string]: Filter};
                    filt[keys[i]] = (filter as Or)[op as "Or"][keys[i] as keyof Filter];
                    if (matchesFilter(rawFeature, filt as Filter)) return true;
                }
            }
            return false;
        }
        case "==":
            return featVal === criteria;
        case "!=":
            return featVal !== criteria;
        case "<":
            return featVal < criteria;
        case "<=":
            return featVal <= criteria;
        case ">":
            return featVal > criteria;
        case ">=":
            return featVal >= criteria;
        case "PropertyIsNull":
            return rawFeature.properties[(filter as PropertyComparison)[op as "PropertyIsNull"].PropertyName] == null;
        case "PropertyIsNotNull":
            return rawFeature.properties[(filter as PropertyComparison)[op as "PropertyIsNotNull"].PropertyName] != null;
        case "PropertyIsEqualTo":
            return rawFeature.properties[(filter as PropertyComparison)[op as "PropertyIsEqualTo"].PropertyName] === (filter as PropertyComparison)[op as "PropertyIsEqualTo"].Literal;
        case "PropertyIsNotEqualTo":
            return rawFeature.properties[(filter as PropertyComparison)[op as "PropertyIsNotEqualTo"].PropertyName] !== (filter as PropertyComparison)[op as "PropertyIsNotEqualTo"].Literal;
        default:
            return false;
    }
}
