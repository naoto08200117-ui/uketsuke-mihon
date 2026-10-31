// CSV の読み込みの前半（要件定義書8章。T07）：文字コードを見分けて文字にし、RFC 4180 の形でレコードに分ける。
// 値の確かめ・数式の注入の ' を外すのは csvImport.ts

// UTF-8（BOM あり・なし）をまず試し、壊れていれば Shift_JIS（Excel の「CSV（コンマ区切り）」）。両方だめなら null。
// TextDecoder は先頭の BOM を自動で外す
export function decodeCsv(buffer: ArrayBuffer): string | null {
  for (const label of ["utf-8", "shift_jis"]) {
    try {
      return new TextDecoder(label, { fatal: true }).decode(buffer);
    } catch {
      // この文字コードでは読めないので、次を試す
    }
  }
  return null;
}

export type ParseResult = { ok: true; records: string[][] } | { ok: false };

// " で囲んだ中のコンマ・改行はそのまま、"" は " にする。改行は CRLF・LF・CR のどれでもよい。
// レコードが maxRecords を超えた・最後まで " が閉じていない → ok: false（V-15）
export function parseCsv(text: string, maxRecords: number): ParseResult {
  const records: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  // 今のレコードに、まだ記録していない中身（空のセルを含む）があるか
  let pending = false;
  // セルの先頭か（" で囲むのは先頭に " があるときだけ。途中の " はそのままの文字）
  let cellStart = true;

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQuotes) {
      if (c !== '"') cell += c;
      else if (text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else inQuotes = false;
      continue;
    }
    if (c === '"' && cellStart) {
      inQuotes = true;
      cellStart = false;
      pending = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
      cellStart = true;
      pending = true;
    } else if (c === "\r" || c === "\n") {
      row.push(cell);
      records.push(row);
      if (records.length > maxRecords) return { ok: false };
      row = [];
      cell = "";
      cellStart = true;
      pending = false;
      if (c === "\r" && text[i + 1] === "\n") i += 1;
    } else {
      cell += c;
      cellStart = false;
      pending = true;
    }
  }
  if (inQuotes) return { ok: false };
  // 最後のレコードの後に改行がないとき
  if (pending) {
    row.push(cell);
    records.push(row);
  }
  if (records.length > maxRecords) return { ok: false };
  return { ok: true, records };
}
