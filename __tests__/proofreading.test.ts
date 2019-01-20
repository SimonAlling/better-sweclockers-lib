import { processText, processNodeWith } from "../src/proofreading";

const processNode = processNodeWith(processText);

it("can proofread some text", () => {
  const text = "4 GHz eller 4\u00A0GHz";
  expect(processText(text)).toMatchInlineSnapshot(
    `"4<pre class=\\"mistake\\" title=\\"Förslag: hårt mellanslag\\"> </pre>GHz eller 4<pre class=\\"verified\\"><pre class=\\"any\\">\u00A0</pre></pre>GHz"`
  );
});

it("can process a text node", () => {
  const p = document.createElement("p");
  p.innerHTML = "4 GHz eller 4&nbsp;GHz";
  processNode(p);
  expect(p.innerHTML).toMatchInlineSnapshot(
    `"<span>4<pre class=\\"mistake\\" title=\\"Förslag: hårt mellanslag\\"> </pre>GHz eller 4<pre class=\\"verified\\"><pre class=\\"any\\">&nbsp;</pre></pre>GHz</span>"`
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
    `"<span>en länk </span><a href=\\"https://example.com/3-53/1111\\"><span>4<pre class=\\"mistake\\" title=\\"Förslag: hårt mellanslag\\"> </pre>GHz</span></a>"`
  );
});
