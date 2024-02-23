import { OGCFeature } from "../Wes";

export function getTddRuleMatches(rawFeature: OGCFeature, userStyle: any): any[] {
    const matchedRules = [];
    const rules = userStyle.FeatureTypeStyle.Rule;
    for (const rule of rules) {
        if (matchesFilter(rawFeature, rule.Filter)) {
            matchedRules.push(rule);
        }
    }
    return matchedRules;
}

function matchesFilter(rawFeature: OGCFeature, filter: any): boolean {
    if (filter == null) return true;
    if (rawFeature.properties == null) return false;
    const op = Object.keys(filter)[0];
    const criteria = filter[op].Value;
    const featVal = rawFeature.properties[filter[op].Property];
    switch (op) {
        case "And": {
            const keys = Object.keys(filter[op]);
            for (let i = 0; i < keys.length; i++) {
                if (Array.isArray(filter[op][keys[i]])) {
                    for (let j = 0; j < filter[op][keys[i]].length; j++) {
                        const element = new Object();
                        element[keys[i]] = filter[op][keys[i]][j];
                        if (!matchesFilter(rawFeature, element)) return false;
                    }
                } else {
                    const filt = new Object();
                    filt[keys[i]] = filter[op][keys[i]];
                    if (!matchesFilter(rawFeature, filt)) return false;
                }
            }
            return true;
        }
        case "Or": {
            const keys = Object.keys(filter[op]);
            for (let i = 0; i < keys.length; i++) {
                if (Array.isArray(filter[op][keys[i]])) {
                    for (let j = 0; j < filter[op][keys[i]].length; j++) {
                        const element = new Object();
                        element[keys[i]] = filter[op][keys[i]][j];
                        if (matchesFilter(rawFeature, element)) return true;
                    }
                } else {
                    const filt = new Object();
                    filt[keys[i]] = filter[op][keys[i]];
                    if (matchesFilter(rawFeature, filt)) return true;
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
            return rawFeature.properties[filter[op].PropertyName] == null;
        case "PropertyIsNotNull":
            return rawFeature.properties[filter[op].PropertyName] != null;
        case "PropertyIsEqualTo":
            return rawFeature.properties[filter[op].PropertyName] === filter[op].Literal;
        case "PropertyIsNotEqualTo":
            return rawFeature.properties[filter[op].PropertyName] !== filter[op].Literal;
        default:
            return false;
    }
}
