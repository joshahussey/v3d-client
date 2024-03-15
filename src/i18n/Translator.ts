import en_translations from "./en/translations.json";
import fr_translations from "./fr/translations.json";

type NameType = keyof typeof en_translations;

function replaceArray(stringValue: string, replace: string[]): string {
    let replaceString = stringValue;
    for (let i = 0; i < replace.length; i++) {
        replaceString = replaceString.replace("{INPUT}", replace[i]);
    }
    return replaceString;
}

export function translate(key: NameType, insertValues?: string[]): string {
    const userLanguage = getUserLanguage();
    if (userLanguage === "en") {
        if (typeof insertValues !== "undefined") {
            return replaceArray(en_translations[key], insertValues);
        } else {
            return en_translations[key];
        }
    } else if (userLanguage === "fr") {
        if (typeof insertValues !== "undefined") {
            return replaceArray(fr_translations[key], insertValues);
        } else {
            return fr_translations[key];
        }
    } else {
        console.error(`Could not find user language, returning string: ${key} in default language.`);
        if (typeof insertValues !== "undefined") {
            return replaceArray(en_translations[key], insertValues);
        } else {
            return en_translations[key];
        }
    }
}

function getUserLanguage() {
    let userLanguage;
    const userLangLocalStorage = localStorage.getItem("userLanguage");
    if (userLangLocalStorage != null) {
        userLanguage = userLangLocalStorage;
    }
    if (userLanguage != undefined) {
        return userLanguage;
    } else {
        return navigator.language.slice(0, 2);
    }
}
