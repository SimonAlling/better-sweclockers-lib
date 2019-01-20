import { compose } from "@typed/compose";
import { proofreadWith, highlightWith } from "highlight-mistakes";
import { RULES, PATTERN_DOPPELGANGERS } from "sweclockers-writing-rules";

import * as CONFIG from "./config";

type StringTransformer = (s: string) => string;

export function processNodeWith(f: StringTransformer): (node: Node) => void {
    return node => {
        if (node.nodeType === Node.TEXT_NODE) {
            const span = document.createElement("span");
            span.innerHTML = f(node.textContent || "");
            (node.parentNode as Node).replaceChild(span, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(processNodeWith(f));
        }
    };
}

export function markWith(className: string): (info: string | null) => StringTransformer {
    const isMistake = className === CONFIG.CLASS.MARK.mistake;
    return info => s => [
        `<pre class="${className}"`,
        (isMistake && info !== null ? ` title="Förslag: ${info}"` : ""),
        `>${s}</pre>`,
    ].join("");
}

export const processText = compose(
    highlightWith({
        pattern: PATTERN_DOPPELGANGERS,
        mark: markWith(CONFIG.CLASS.MARK.any)(null),
    }),
    proofreadWith({
        rules: RULES,
        markMistake: markWith(CONFIG.CLASS.MARK.mistake),
        markVerified: markWith(CONFIG.CLASS.MARK.verified),
    }),
);
