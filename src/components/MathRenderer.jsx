// src/components/MathRenderer.jsx
import { useEffect, useRef } from "react";
import katex from "katex";
import { marked } from "marked";
import mermaid from "mermaid";
import "katex/dist/katex.min.css";

marked.use({ gfm: true, breaks: true });

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  fontFamily: "inherit",
  fontSize: 14,
});

const IMAGE_BASE_URL = "https://gudangsoal.com/uploads/";

let mermaidCounter = 0;

export default function MathRenderer({ text = "", block = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !text) return;

    // 1. Parse custom image syntax [FILENAME|width] atau [FILENAME]
    let processed = text.replace(
      /\[([A-Z0-9]{6}(?:\.[a-z]+)?)(?:\|(\d+))?\]/g,
      (_, filename, width) => {
        const url = IMAGE_BASE_URL + filename;
        const w = width ? `width="${width}"` : 'style="max-width:100%"';
        return `<img src="${url}" ${w} style="height:auto;display:block;margin:8px 0;border-radius:8px;" alt="${filename}" />`;
      }
    );

    // 2. Lindungi LaTeX dari markdown parser
    const mathBlocks = [];
    const protectedText = processed.replace(
      /(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g,
      (match) => {
        mathBlocks.push(match);
        return `%%MATH${mathBlocks.length - 1}%%`;
      }
    );

    // 3. Render markdown
    const html = block
      ? marked.parse(protectedText)
      : marked.parseInline(protectedText);

    // 4. Restore LaTeX lalu render KaTeX
    const restored = html.replace(/%%MATH(\d+)%%/g, (_, idx) => {
      const latex = mathBlocks[parseInt(idx)];
      const isDisplay = latex.startsWith("$$");
      const inner = isDisplay ? latex.slice(2, -2) : latex.slice(1, -1);
      try {
        return katex.renderToString(inner, {
          displayMode: isDisplay,
          throwOnError: false,
        });
      } catch {
        return latex;
      }
    });

    ref.current.innerHTML = restored;

    // 5. Render mermaid code blocks
    const mermaidNodes = ref.current.querySelectorAll("code.language-mermaid");
    if (mermaidNodes.length === 0) return;

    mermaidNodes.forEach(async (codeEl) => {
      const pre = codeEl.parentElement;
      const diagramDef = codeEl.textContent;
      const id = `mermaid-${++mermaidCounter}`;

      try {
        const { svg } = await mermaid.render(id, diagramDef);
        const wrapper = document.createElement("div");
        wrapper.style.cssText = "overflow-x:auto;margin:16px 0;border-radius:10px;border:1px solid #e2ddd5;padding:16px;background:#faf9f6;";
        wrapper.innerHTML = svg;
        pre.replaceWith(wrapper);
      } catch {
        codeEl.style.cssText = "display:block;background:#fff3f0;border:1px solid #fca5a5;border-radius:8px;padding:12px;color:#b91c1c;font-size:12px;white-space:pre-wrap;";
        codeEl.textContent = `[Mermaid error]\n${diagramDef}`;
      }
    });
  }, [text, block]);

  return block ? (
    <div ref={ref} className="math-content" style={{ lineHeight: "1.75" }} />
  ) : (
    <span ref={ref} className="math-content" />
  );
}
