// src/components/MathRenderer.jsx
import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export default function MathRenderer({ text = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !text) return;

    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);

    ref.current.innerHTML = parts
      .map((part) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          try {
            return katex.renderToString(part.slice(2, -2), {
              displayMode: true,
              throwOnError: false,
            });
          } catch {
            return part;
          }
        }
        if (part.startsWith("$") && part.endsWith("$")) {
          try {
            return katex.renderToString(part.slice(1, -1), {
              displayMode: false,
              throwOnError: false,
            });
          } catch {
            return part;
          }
        }
        return part;
      })
      .join("");
  }, [text]);

  return <span ref={ref} />;
}
