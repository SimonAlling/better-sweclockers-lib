import { processText, processNodeWith } from "../src/proofreading";

const processNode = processNodeWith(processText);

it("can proofread some text", () => {
  const text = "4 GHz eller 4\u00A0GHz";
  expect(processText(text)).toMatchInlineSnapshot(
    `"4<span class=\\"proofread mistake\\" title=\\"Förslag: hårt mellanslag\\"> </span>GHz eller 4<span class=\\"proofread verified\\"><span class=\\"proofread any\\"> </span></span>GHz"`
  );
});

it("can process a text node", () => {
  const p = document.createElement("p");
  p.innerHTML = "4 GHz eller 4&nbsp;GHz";
  processNode(p);
  expect(p.innerHTML).toMatchInlineSnapshot(
    `"<span>4<span class=\\"proofread mistake\\" title=\\"Förslag: hårt mellanslag\\"> </span>GHz eller 4<span class=\\"proofread verified\\"><span class=\\"proofread any\\">&nbsp;</span></span>GHz</span>"`
  );
});

it("can process a node with children", () => {
  const p = document.createElement("p");
  p.textContent = "en länk ";
  const a = document.createElement("a");
  a.href = "https://example.com/3-53/1111";
  a.textContent = "4 GHz";
  p.appendChild(a);
  processNode(p);
  expect(p.innerHTML).toMatchInlineSnapshot(
    `"<span>en länk </span><a href=\\"https://example.com/3-53/1111\\"><span>4<span class=\\"proofread mistake\\" title=\\"Förslag: hårt mellanslag\\"> </span>GHz</span></a>"`
  );
});
