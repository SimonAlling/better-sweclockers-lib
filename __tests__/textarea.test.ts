import {
  insert,
  placeCursorIn,
  replaceSelectionWith,
  selectedTextIn,
  selectRangeIn,
  wrap_tag,
  wrap_verbatim
} from "../src/textarea";

it("can find the selected text in a textarea", () => {
  const textarea = document.createElement("textarea");
  textarea.value = "katten Bamse ftw";
  selectRangeIn(textarea, 7, 12);
  expect(selectedTextIn(textarea)).toMatchInlineSnapshot(`"Bamse"`);
});

it("can set the selected range in a textarea", () => {
  const textarea = document.createElement("textarea");
  textarea.value = "katten Bamse ftw";
  selectRangeIn(textarea, 7, 12);
  expect(selectedTextIn(textarea)).toMatchInlineSnapshot(`"Bamse"`);
});

function textareaWithSelection(): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  textarea.value = "katten Bamse ftw";
  selectRangeIn(textarea, 7, 12);
  return textarea;
}

it("can wrap something verbatim", () => {
  const textarea = textareaWithSelection();
  wrap_verbatim({
    cursor: "KEEP_SELECTION",
    before: "(((",
    after: ")))"
  })(textarea);
  expect(textarea.value).toMatchInlineSnapshot(`"katten (((Bamse))) ftw"`);
  expect(selectedTextIn(textarea)).toMatchInlineSnapshot(`"Bamse"`);
});

it("can wrap something in a simple inline tag", () => {
  const textarea = textareaWithSelection();
  wrap_tag({
    tag: "b",
    parameterized: false,
    block: false
  })(textarea);
  expect(textarea.value).toMatchInlineSnapshot(`"katten [b]Bamse[/b] ftw"`);
  expect(selectedTextIn(textarea)).toMatchInlineSnapshot(`"Bamse"`);
});

it("can wrap something in a simple block tag", () => {
  const textarea = textareaWithSelection();
  wrap_tag({
    tag: "code",
    parameterized: false,
    block: true
  })(textarea);
  expect(textarea.value).toMatchInlineSnapshot(`
"katten [code]
Bamse
[/code] ftw"
`);
  expect(selectedTextIn(textarea)).toMatchInlineSnapshot(`"Bamse"`);
});

it("can wrap something in a parameterized inline tag", () => {
  const textarea = textareaWithSelection();
  wrap_tag({
    tag: "url",
    parameterized: true,
    block: false
  })(textarea);
  expect(textarea.value).toMatchInlineSnapshot(
    `"katten [url=\\"\\"]Bamse[/url] ftw"`
  );
  expect(selectedTextIn(textarea)).toMatchInlineSnapshot(`""`);
  expect(textarea.selectionEnd).toBe(`katten [url="`.length);
});

it("can wrap something in a parameterized block tag", () => {
  const textarea = textareaWithSelection();
  wrap_tag({
    tag: "code",
    parameterized: true,
    block: true
  })(textarea);
  expect(textarea.value).toMatchInlineSnapshot(`
"katten [code=\\"\\"]
Bamse
[/code] ftw"
`);
  expect(selectedTextIn(textarea)).toMatchInlineSnapshot(`""`);
  expect(textarea.selectionEnd).toBe(`katten [code="`.length);
});

const replaceSelectionWithEnDashIn = replaceSelectionWith("–");
const insertEnDashIn = insert("–");

it("can place the cursor in a textarea", () => {
  const textarea = textareaWithSelection();
  placeCursorIn(textarea, 2);
  expect(textarea.value).toMatchInlineSnapshot(`"katten Bamse ftw"`);
  expect(selectedTextIn(textarea).length).toBe(0);
  expect(textarea.selectionStart).toBe(2);
  expect(textarea.selectionEnd).toBe(2);
  expect(document.activeElement).toBe(textarea);
});

it("can insert something at the cursor position", () => {
  const textarea = document.createElement("textarea");
  textarea.value = "Bamse  en välkänd katt.";
  placeCursorIn(textarea, 6);
  insertEnDashIn(textarea);
  expect(textarea.value).toMatchInlineSnapshot(`"Bamse – en välkänd katt."`);
  expect(selectedTextIn(textarea)).toMatchInlineSnapshot(`""`);
  expect(textarea.selectionEnd).toBe(7);
});

it("can insert something instead of selected text", () => {
  const textarea = document.createElement("textarea");
  textarea.value = "Bamse -- en välkänd katt.";
  selectRangeIn(textarea, 6, 8);
  replaceSelectionWithEnDashIn(textarea);
  expect(textarea.value).toMatchInlineSnapshot(`"Bamse – en välkänd katt."`);
  expect(selectedTextIn(textarea)).toMatchInlineSnapshot(`""`);
  expect(textarea.selectionEnd).toBe(7);
});

it("can insert something after selected text", () => {
  const textarea = textareaWithSelection();
  insertEnDashIn(textarea);
  expect(textarea.value).toMatchInlineSnapshot(`"katten Bamse– ftw"`);
  expect(selectedTextIn(textarea)).toMatchInlineSnapshot(`""`);
  expect(textarea.selectionEnd).toBe(13);
});
