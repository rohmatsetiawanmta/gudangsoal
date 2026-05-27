// src/components/MathRenderer.jsx
import { useEffect, useRef } from "react";
import katex from "katex";
import { marked } from "marked";
import "katex/dist/katex.min.css";

marked.setOptions({ breaks: true });

export default function MathRenderer({ text = "", block = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !text) return;

    // 1. Lindungi LaTeX dari markdown parser
    const mathBlocks = [];
    const protectedText = text.replace(
      /(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g,
      (match) => {
        mathBlocks.push(match);
        return `%%MATH${mathBlocks.length - 1}%%`;
      }
    );

    // 2. Render markdown
    const html = block
      ? marked.parse(protectedText)
      : marked.parseInline(protectedText);

    // 3. Restore LaTeX lalu render KaTeX
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
  }, [text, block]);

  return block ? (
    <div ref={ref} className="math-content" style={{ lineHeight: "1.75" }} />
  ) : (
    <span ref={ref} className="math-content" />
  );
}
