// MIT © 2017 azu
import { Dictionary } from "../../domain/Dictionary/Dictionary";
import { Rule } from "prh/lib/rule";
import { createDictionary } from "../../domain/Dictionary/DictionaryFactory";
import { DictionaryExpected } from "../../domain/Dictionary/DictionaryExpected";
import { DictionaryPattern } from "../../domain/Dictionary/DictionaryPattern";
import { DictionarySpec } from "../../domain/Dictionary/DictionarySpec";
import { getUniqueTokens } from "./Prh";
import { DictionaryWordClassesSerializer } from "../../domain/Dictionary/DictionaryWordClasses";
import { DictionaryDescription } from "../../domain/Dictionary/DictionaryDescription";

function addPatterns(dictionary: Dictionary, rule: Rule): Dictionary {
    const pattern = rule.raw.pattern || rule.raw.patterns;
    if (Array.isArray(pattern)) {
        return pattern.reduce((dict: Dictionary, patternString: string) => {
            return dict.addPattern(new DictionaryPattern(patternString));
        }, dictionary);
    }
    if (typeof pattern === "string") {
        return dictionary.addPattern(new DictionaryPattern(pattern));
    }
    return dictionary.addPattern(new DictionaryPattern(rule.toJSON().pattern));
}

function addSpecs(dictionary: Dictionary, rule: Rule): Dictionary {
    return rule.specs.reduce((dict: Dictionary, spec) => {
        return dict.addSpec(
            new DictionarySpec({
                from: spec.from,
                to: spec.to
            })
        );
    }, dictionary);
}

function addDescription(dictionary: Dictionary, rule: Rule): Dictionary {
    if (rule.raw.prh) {
        return dictionary.updateDescription(new DictionaryDescription(rule.raw.prh));
    }
    return dictionary;
}

export function addWordClass(dictionary: Dictionary): Promise<Dictionary> {
    return getUniqueTokens(dictionary).then(tokens => {
        return dictionary.updateWordClasses(DictionaryWordClassesSerializer.fromJSON(tokens));
    });
}

export function prhRuleToDictionary(rule: Rule): Promise<Dictionary> {
    const dictionary = createDictionary();
    const expected = dictionary.inputExpected(new DictionaryExpected(rule.expected));
    const patterns = addPatterns(expected, rule);
    const specs = addSpecs(patterns, rule);
    const description = addDescription(specs, rule);
    return Promise.resolve(description);
}