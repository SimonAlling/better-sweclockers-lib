import { processText, processNode } from "../src/proofreading";

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

it("can process superscript", () => {
  const p = document.createElement("p");
  p.innerHTML = `några mm<sup class="bbSup">2</sup> eller mm<sup class="bbSup">3</sup>`;
  processNode(p);
  expect(p.innerHTML).toMatchInlineSnapshot(
    `"<span>några mm</span><sup class=\\"bbSup\\"><span class=\\"proofread mistake\\" title=\\"Förslag: tecknet ² istället för en upphöjd tvåa\\">2</span></sup><span> eller mm</span><sup class=\\"bbSup\\"><span class=\\"proofread mistake\\" title=\\"Förslag: tecknet ³ istället för en upphöjd trea\\">3</span></sup>"`
  );
  const q = document.createElement("p");
  q.innerHTML = `några mm² eller mm³`;
  processNode(q);
  expect(q.innerHTML).toMatchInlineSnapshot(
    `"<span>några mm<span class=\\"proofread verified\\">²</span> eller mm<span class=\\"proofread verified\\">³</span></span>"`
  );
});
