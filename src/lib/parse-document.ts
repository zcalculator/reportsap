import Papa from "papaparse";
import * as XLSX from "xlsx";
import { XMLParser } from "fast-xml-parser";

export type ParsedContent = {
  text: string;
  structured?: Record<string, unknown>[];
};

/**
 * Parse CSV file and return text content for AI extraction
 */
export function parseCSV(buffer: Buffer): ParsedContent {
  const text = buffer.toString("utf-8");
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const structured = result.data as Record<string, unknown>[];
  const textContent = result.data
    .map((row) => Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(" | "))
    .join("\n");

  return {
    text: textContent || text,
    structured,
  };
}

/**
 * Parse Excel (xlsx, xls) file and return text content for AI extraction
 */
export function parseExcel(buffer: Buffer): ParsedContent {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheets: string[] = [];
  const structured: Record<string, unknown>[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    structured.push(...json);
    sheets.push(
      `Sheet: ${sheetName}\n` +
        json.map((row) => JSON.stringify(row)).join("\n")
    );
  }

  return {
    text: sheets.join("\n\n"),
    structured,
  };
}

/**
 * Parse XML file and return text content for AI extraction
 */
export function parseXML(buffer: Buffer): ParsedContent {
  const text = buffer.toString("utf-8");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const parsed = parser.parse(text);

  return {
    text: JSON.stringify(parsed, null, 2),
    structured: Array.isArray(parsed) ? parsed : [parsed],
  };
}

/**
 * Parse plain text (fallback for unstructured files)
 */
export function parseText(buffer: Buffer): ParsedContent {
  return {
    text: buffer.toString("utf-8"),
  };
}

/**
 * Route to appropriate parser based on file type
 */
export function parseDocument(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): ParsedContent {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (
    mimeType.includes("csv") ||
    ext === "csv"
  ) {
    return parseCSV(buffer);
  }

  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    ["xlsx", "xls"].includes(ext || "")
  ) {
    return parseExcel(buffer);
  }

  if (
    mimeType.includes("xml") ||
    ext === "xml"
  ) {
    return parseXML(buffer);
  }

  // Fallback: treat as text
  return parseText(buffer);
}
