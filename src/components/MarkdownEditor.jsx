// src/components/MarkdownEditor.jsx
import { useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Minus,
} from "lucide-react";

const TOOLS = [
  { icon: Bold, label: "Bold", wrap: ["**", "**"], default: "teks tebal" },
  { icon: Italic, label: "Italic", wrap: ["*", "*"], default: "teks miring" },
  {
    icon: Underline,
    label: "Underline",
    wrap: ["__", "__"],
    default: "teks garis bawah",
  },
  null, // divider
  { icon: List, label: "Bullet", wrap: ["\n- ", ""], default: "item" },
  {
    icon: ListOrdered,
    label: "Numbering",
    wrap: ["\n1. ", ""],
    default: "item",
  },
  null, // divider
  { icon: Minus, label: "Divider", wrap: ["\n---\n", ""], default: "" },
];

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 4,
}) {
  const ref = useRef(null);

  const insertFormat = (wrap, defaultText) => {
    const el = ref.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || defaultText;
    const before = value.slice(0, start);
    const after = value.slice(end);

    // Kalau bullet/numbering dan ada banyak baris yang diselect, format tiap baris
    const isList = wrap[0].startsWith("\n-") || wrap[0].startsWith("\n1");
    let inserted = "";

    if (isList && selected.includes("\n")) {
      const prefix = wrap[0].replace("\n", "");
      const lines = selected.split("\n").map((line) => prefix + " " + line);
      inserted = "\n" + lines.join("\n");
    } else {
      inserted = wrap[0] + selected + wrap[1];
    }

    const newValue = before + inserted + after;
    onChange(newValue);

    setTimeout(() => {
      el.focus();
      const newPos = start + inserted.length;
      el.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid #e2ddd5",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          padding: "6px 10px",
          background: "#f2efe8",
          borderBottom: "1px solid #e2ddd5",
          flexWrap: "wrap",
        }}
      >
        {TOOLS.map((tool, i) => {
          if (tool === null)
            return (
              <div
                key={i}
                style={{
                  width: "1px",
                  height: "16px",
                  background: "#e2ddd5",
                  margin: "0 4px",
                }}
              />
            );
          const { icon: Icon, label, wrap, default: def } = tool;
          return (
            <button
              key={label}
              type="button"
              title={label}
              onClick={() => insertFormat(wrap, def)}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                border: "none",
                background: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b6860",
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#e2ddd5")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <Icon size={14} />
            </button>
          );
        })}

        <div style={{ marginLeft: "auto" }}>
          <span
            style={{
              fontSize: "11px",
              color: "#b4b2a9",
              fontFamily: "monospace",
            }}
          >
            $LaTeX$ • $$display$$
          </span>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          padding: "12px 14px",
          border: "none",
          outline: "none",
          fontSize: "14px",
          fontFamily: "monospace",
          color: "#0f0e17",
          resize: "vertical",
          lineHeight: "1.7",
          background: "white",
        }}
        onFocus={(e) =>
          (e.currentTarget.parentElement.style.borderColor = "#e84c2b")
        }
        onBlur={(e) =>
          (e.currentTarget.parentElement.style.borderColor = "#e2ddd5")
        }
      />
    </div>
  );
}
