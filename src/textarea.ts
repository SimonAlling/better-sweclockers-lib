import * as BB from "bbcode-tags";
import { isNumber } from "ts-type-guards";

export type WrapAction = Readonly<{
    cursor: CursorBehavior
    before: string
    after: string
}>;

export type TagWrapAction = Readonly<{
    tag: string
    parameterized: boolean
    block: boolean
}>;

export type Action = (textarea: HTMLTextAreaElement) => void;

export type CursorBehavior = number | "KEEP_SELECTION";

function wrap(textarea: HTMLTextAreaElement, w: WrapAction): void {
    const replacement = w.before + selectedTextIn(textarea) + w.after;
    replaceSelectionIn(
        textarea,
        replacement,
        (
            w.cursor === "KEEP_SELECTION"
            ? { start: w.before.length, end: replacement.length - w.after.length }
            : w.cursor
        ),
    );
}

export function wrap_verbatim(w: WrapAction): Action {
    return textarea => wrap(textarea, w);
}

export function wrap_tag(w: TagWrapAction): Action {
    const spacing = w.block ? "\n" : "";
    return wrap_verbatim({
        before: BB.start(w.tag, w.parameterized ? "" : undefined) + spacing,
        after: spacing + BB.end(w.tag),
        cursor: (
            w.parameterized
            ? 1 + w.tag.length + 2 // 1 for '[', 2 for '="'
            : "KEEP_SELECTION"
        ),
    });
}

export function selectedTextIn(textarea: HTMLTextAreaElement): string {
    return textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
}

export function replaceSelectionWith(str: string): Action {
    return textarea => replaceSelectionIn(textarea, str);
}

export function insert(str: string): Action {
    return textarea => {
        placeCursorIn(textarea, textarea.selectionEnd);
        replaceSelectionIn(textarea, str);
    };
}

export function replaceSelectionIn(textarea: HTMLTextAreaElement, str: string, cursor?: number | { start: number, end: number }): void {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = textarea.value;
    textarea.value = content.substring(0, start) + str + content.substring(end);
    if (cursor === undefined) {
        // Place cursor after inserted text.
        placeCursorIn(textarea, start + str.length);
    } else if (isNumber(cursor)) {
        // Place cursor specified number of characters into inserted text.
        placeCursorIn(textarea, start + cursor);
    } else {
        // Select specified range.
        selectRangeIn(textarea, start + cursor.start, start + cursor.end);
    }
}

export function placeCursorIn(textarea: HTMLTextAreaElement, position: number): void {
    selectRangeIn(textarea, position, position);
}

export function selectRangeIn(textarea: HTMLTextAreaElement, start: number, end: number): void {
    textarea.focus();
    textarea.setSelectionRange(start, end);
}
