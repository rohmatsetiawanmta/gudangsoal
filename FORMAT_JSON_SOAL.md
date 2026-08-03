# Format JSON Soal — Gudang Soal

Dokumen ini menjelaskan format JSON untuk import soal, baik satu per satu maupun bulk.

---

## Format Dasar

```json
{
  "body":        "Teks soal — LaTeX: $...$ inline, $$...$$ display",
  "options":     [...],
  "answer":      "...",
  "explanation": "Pembahasan (opsional)",
  "tipe":        "pilihan_ganda",
  "difficulty":  "easy"
}
```

### Nilai yang diterima

| Field | Nilai yang valid | Default jika tidak ada |
|---|---|---|
| `tipe` | `pilihan_ganda` · `isian_singkat` · `isian_numerik` · `checklist` · `multiple_choice_table` · `menjodohkan` · `isian_multi` | `pilihan_ganda` |
| `difficulty` | `"easy"` / `1` · `"medium"` / `2` · `"hard"` / `3` | `easy` |
| `explanation` | String teks bebas | *(kosong)* |

> `difficulty` juga menerima: `mudah`, `sedang`, `sulit`, `susah`.

---

## Tipe Soal

### `pilihan_ganda`

Satu jawaban benar dari beberapa pilihan. `answer` berisi label huruf jawaban yang benar.

```json
{
  "tipe": "pilihan_ganda",
  "difficulty": "medium",
  "body": "Nilai $x$ jika $2x + 3 = 11$ adalah ...",
  "options": [
    {"label": "A", "text": "2"},
    {"label": "B", "text": "4"},
    {"label": "C", "text": "6"},
    {"label": "D", "text": "8"}
  ],
  "answer": "B",
  "explanation": "$2x = 8$, maka $x = 4$"
}
```

---

### `isian_singkat`

Jawaban teks bebas singkat. `options` selalu array kosong.

```json
{
  "tipe": "isian_singkat",
  "difficulty": "easy",
  "body": "Teorema yang menyatakan $a^2 + b^2 = c^2$ disebut teorema ...",
  "options": [],
  "answer": "Pythagoras",
  "explanation": "..."
}
```

---

### `isian_numerik`

Jawaban harus angka (bulat atau desimal), tanpa satuan. `options` selalu array kosong.

```json
{
  "tipe": "isian_numerik",
  "difficulty": "hard",
  "body": "Jumlah 15 suku pertama barisan $3, 7, 11, ...$ adalah ...",
  "options": [],
  "answer": "465",
  "explanation": "$S_{15} = \\frac{15}{2}(2 \\cdot 3 + 14 \\cdot 4) = 465$"
}
```

---

### `checklist`

Lebih dari satu jawaban bisa benar. `answer` adalah **array** label yang benar.

```json
{
  "tipe": "checklist",
  "difficulty": "medium",
  "body": "Pernyataan yang BENAR tentang $f(x) = x^2$ adalah ...",
  "options": [
    {"label": "A", "text": "Grafiknya simetri terhadap sumbu-$y$"},
    {"label": "B", "text": "Nilai minimumnya adalah 0"},
    {"label": "C", "text": "Fungsi ini ganjil"},
    {"label": "D", "text": "Domain-nya semua bilangan real"}
  ],
  "answer": ["A", "B", "D"],
  "explanation": "C salah karena $f(-x) = f(x)$, bukan $-f(x)$."
}
```

---

### `multiple_choice_table`

Setiap baris pernyataan dipilih salah satu kolom. `cols` bisa diisi teks apapun (tidak harus Benar/Salah).

```json
{
  "tipe": "multiple_choice_table",
  "difficulty": "medium",
  "body": "Tentukan benar atau salah setiap pernyataan berikut.",
  "options": [
    {"label": "1", "text": "$\\sqrt{2}$ adalah bilangan irasional", "cols": ["Benar", "Salah"]},
    {"label": "2", "text": "$0$ adalah bilangan asli",              "cols": ["Benar", "Salah"]},
    {"label": "3", "text": "Setiap bilangan prima adalah ganjil",   "cols": ["Benar", "Salah"]}
  ],
  "answer": {"1": "Benar", "2": "Salah", "3": "Salah"},
  "explanation": "0 bukan bilangan asli. 2 adalah prima tapi genap."
}
```

> `answer`: key = `label` baris, value = salah satu string dari `cols` baris tersebut.

---

### `menjodohkan`

Pasangkan item kiri ke item kanan. `options` adalah **objek** dengan key `left` dan `right`.  
`answer` memetakan **index kiri → index kanan** (keduanya 0-based).

```json
{
  "tipe": "menjodohkan",
  "difficulty": "easy",
  "body": "Jodohkan setiap rumus dengan namanya.",
  "options": {
    "left":  ["$a^2 + b^2 = c^2$", "$A = \\pi r^2$", "$V = \\frac{4}{3}\\pi r^3$"],
    "right": ["Volume bola", "Teorema Pythagoras", "Luas lingkaran"]
  },
  "answer": {"0": 1, "1": 2, "2": 0},
  "explanation": "..."
}
```

> Contoh `"0": 1` → item kiri ke-0 dipasangkan ke item kanan ke-1 ("Teorema Pythagoras").

---

### `isian_multi`

Beberapa sub-jawaban terpisah. `options` dan `answer` berurutan sesuai index.  
`satuan` boleh string kosong `""` jika tidak ada satuan.

```json
{
  "tipe": "isian_multi",
  "difficulty": "medium",
  "body": "Diketahui barisan aritmetika $5, 9, 13, ...$. Tentukan:",
  "options": [
    {"label": "Suku pertama", "satuan": ""},
    {"label": "Beda",         "satuan": ""},
    {"label": "Suku ke-20",   "satuan": ""}
  ],
  "answer": ["5", "4", "81"],
  "explanation": "$a = 5$, $b = 4$, $U_{20} = 5 + 19 \\times 4 = 81$"
}
```

> `answer[i]` adalah jawaban untuk `options[i]`.

---

## Bulk Import (Array)

Untuk **Bulk Import JSON**, bungkus semua soal dalam array.  
Setiap soal boleh punya `tipe` dan `difficulty` yang berbeda-beda.

```json
[
  {
    "tipe": "pilihan_ganda",
    "difficulty": "easy",
    "body": "...",
    "options": [{"label": "A", "text": "..."}, {"label": "B", "text": "..."}],
    "answer": "A",
    "explanation": "..."
  },
  {
    "tipe": "isian_numerik",
    "difficulty": "hard",
    "body": "...",
    "options": [],
    "answer": "42"
  },
  {
    "tipe": "checklist",
    "difficulty": "medium",
    "body": "...",
    "options": [{"label": "A", "text": "..."}, {"label": "B", "text": "..."}],
    "answer": ["A", "C"]
  }
]
```

---

## Ringkasan Struktur `options` dan `answer`

| Tipe | `options` | `answer` |
|---|---|---|
| `pilihan_ganda` | `[{label, text}]` | `"A"` (string label) |
| `isian_singkat` | `[]` | `"teks jawaban"` |
| `isian_numerik` | `[]` | `"42"` (string angka) |
| `checklist` | `[{label, text}]` | `["A", "C"]` (array label) |
| `multiple_choice_table` | `[{label, text, cols}]` | `{"1": "Benar", "2": "Salah"}` |
| `menjodohkan` | `{left: [], right: []}` | `{"0": 1, "1": 0}` (index→index) |
| `isian_multi` | `[{label, satuan}]` | `["val1", "val2"]` (array string) |
