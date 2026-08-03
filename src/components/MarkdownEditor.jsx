// src/components/MarkdownEditor.jsx
import { useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Minus,
  Image,
  Table,
} from "lucide-react";
import api from "../lib/api";

const TOOLS = [
  { icon: Bold, label: "Bold", wrap: ["**", "**"], default: "teks tebal" },
  { icon: Italic, label: "Italic", wrap: ["*", "*"], default: "teks miring" },
  {
    icon: Underline,
    label: "Underline",
    wrap: ["__", "__"],
    default: "teks garis bawah",
  },
  null,
  { icon: Table, label: "Tabel", wrap: null, default: null, isTable: true },
  { icon: List, label: "Bullet", wrap: ["\n- ", ""], default: "item" },
  {
    icon: ListOrdered,
    label: "Numbering",
    wrap: ["\n1. ", ""],
    default: "item",
  },
  null,
  { icon: Minus, label: "Divider", wrap: ["\n---\n", ""], default: "" },
];

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 4,
  hideImage = false,
}) {
  const ref = useRef(null);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const insertFormat = (wrap, defaultText) => {
    const el = ref.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || defaultText;
    const before = value.slice(0, start);
    const after = value.slice(end);

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

  const insertAtCursor = (text) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const before = value.slice(0, start);
    const after = value.slice(start);
    const newValue = before + text + after;
    onChange(newValue);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        const filename = data.filename;
        insertAtCursor(`[${filename}|500]`);
      } else {
        alert(data.error || "Gagal upload gambar");
      }
    } catch {
      alert("Gagal upload gambar");
    } finally {
      setUploading(false);
      // Reset input biar bisa upload file yang sama lagi
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const insertTable = () => {
    const template = `\n| Kolom 1 | Kolom 2 | Kolom 3 |\n| --- | --- | --- |\n| Data 1 | Data 2 | Data 3 |\n| Data 4 | Data 5 | Data 6 |\n`;
    insertAtCursor(template);
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
          background: "var(--gs-hover)",
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
                  background: "var(--gs-border)",
                  margin: "0 4px",
                }}
              />
            );
          const { icon: Icon, label, wrap, default: def, isTable } = tool;
          return (
            <button
              key={label}
              type="button"
              title={label}
              onClick={() =>
                isTable ? insertTable() : insertFormat(wrap, def)
              }
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
                color: "var(--gs-text-muted)",
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--gs-border)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <Icon size={14} />
            </button>
          );
        })}
        {!hideImage && (
          <>
            <div
              style={{
                width: "1px",
                height: "16px",
                background: "var(--gs-border)",
                margin: "0 4px",
              }}
            />

            {/* Upload gambar */}
            <button
              type="button"
              title="Upload Gambar"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                border: "none",
                background: "none",
                cursor: uploading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: uploading ? "var(--gs-text-hint)" : "var(--gs-text-muted)",
                transition: "background .15s",
              }}
              onMouseEnter={(e) => {
                if (!uploading) e.currentTarget.style.background = "var(--gs-border)";
              }}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              {uploading ? (
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    border: "2px solid #e2ddd5",
                    borderTopColor: "var(--gs-text-muted)",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    display: "block",
                  }}
                />
              ) : (
                <Image size={14} />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </>
        )}
        <div style={{ marginLeft: "auto" }}>
          <span
            style={{
              fontSize: "11px",
              color: "var(--gs-text-hint)",
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
          color: "var(--gs-text)",
          resize: "vertical",
          lineHeight: "1.7",
          background: "var(--gs-surface)",
        }}
        onFocus={(e) =>
          (e.currentTarget.parentElement.style.borderColor = "#e84c2b")
        }
        onBlur={(e) =>
          (e.currentTarget.parentElement.style.borderColor = "var(--gs-border)")
        }
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
