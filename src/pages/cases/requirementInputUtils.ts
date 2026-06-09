export type RequirementFileType = "markdown" | "word" | "pdf" | "text" | "excel" | "unknown";

export interface RequirementDraft {
  title: string;
  rawText: string;
  cleanedText: string;
  productLine: string;
  priority: string;
  enableAiSummary: boolean;
  enableRiskScan: boolean;
  enableCaseSuggestion: boolean;
  updatedAt: string;
}

export interface CleanRequirementOptions {
  removeEmptyLines: boolean;
  trimExtraSpaces: boolean;
  removeInvisibleChars: boolean;
  mergeBrokenLines: boolean;
  preserveMarkdownTables: boolean;
}

export const defaultCleanRequirementOptions: CleanRequirementOptions = {
  removeEmptyLines: true,
  trimExtraSpaces: true,
  removeInvisibleChars: true,
  mergeBrokenLines: true,
  preserveMarkdownTables: true,
};

const storageKey = "automation-platform.requirement-input-draft";
const markdownTableLinePattern = /^\s*\|.*\|\s*$/;
const markdownTableDividerPattern = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;
const sentenceEndingPattern = /[。！？.!?；;：:]$/;
const listOrHeadingPattern = /^\s*(#{1,6}\s|[-*+]\s+|\d+[.)、]\s+|>\s+)/;

function isMarkdownTableLine(line: string): boolean {
  return markdownTableLinePattern.test(line) || markdownTableDividerPattern.test(line);
}

function normalizeVisibleSpacing(line: string): string {
  const placeholder = "__REQ_INPUT_FULL_WIDTH_SPACE__";
  return line
    .replace(/　/g, placeholder)
    .replace(/[\t ]+/g, " ")
    .replace(new RegExp(placeholder, "g"), " ")
    .trim();
}

function shouldMergeLine(previousLine: string, currentLine: string, preserveMarkdownTables: boolean): boolean {
  if (!previousLine || !currentLine) {
    return false;
  }

  if (preserveMarkdownTables && (isMarkdownTableLine(previousLine) || isMarkdownTableLine(currentLine))) {
    return false;
  }

  if (listOrHeadingPattern.test(previousLine) || listOrHeadingPattern.test(currentLine)) {
    return false;
  }

  if (sentenceEndingPattern.test(previousLine)) {
    return false;
  }

  return true;
}

export function cleanRequirementText(
  input: string,
  options: Partial<CleanRequirementOptions> = {}
): string {
  const mergedOptions: CleanRequirementOptions = {
    ...defaultCleanRequirementOptions,
    ...options,
  };

  let normalizedText = input.replace(/\r\n?/g, "\n");

  if (mergedOptions.removeInvisibleChars) {
    normalizedText = normalizedText.replace(/[\u200B-\u200D\uFEFF\u2060]/g, "");
  }

  let lines = normalizedText.split("\n").map((line) => {
    if (mergedOptions.preserveMarkdownTables && isMarkdownTableLine(line)) {
      return line.trim();
    }

    if (mergedOptions.trimExtraSpaces) {
      return normalizeVisibleSpacing(line);
    }

    return line;
  });

  if (mergedOptions.removeEmptyLines) {
    lines = lines.filter((line) => line.length > 0);
  }

  if (!mergedOptions.mergeBrokenLines) {
    const cleanedText = lines.join("\n");
    return mergedOptions.trimExtraSpaces ? cleanedText.trim() : cleanedText;
  }

  const mergedLines: string[] = [];

  lines.forEach((line) => {
    const previousLine = mergedLines[mergedLines.length - 1];

    if (shouldMergeLine(previousLine, line, mergedOptions.preserveMarkdownTables)) {
      mergedLines[mergedLines.length - 1] = `${previousLine}${line.match(/^[,，.。!?！？]/) ? "" : " "}${line}`;
      return;
    }

    mergedLines.push(line);
  });

  const cleanedText = mergedLines.join("\n");
  return mergedOptions.trimExtraSpaces ? cleanedText.trim() : cleanedText;
}

export function getFileType(fileName: string): RequirementFileType {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (["md", "markdown"].includes(extension)) {
    return "markdown";
  }

  if (["doc", "docx"].includes(extension)) {
    return "word";
  }

  if (extension === "pdf") {
    return "pdf";
  }

  if (["txt", "text"].includes(extension)) {
    return "text";
  }

  if (["xls", "xlsx", "csv"].includes(extension)) {
    return "excel";
  }

  return "unknown";
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function loadDraftFromStorage(): RequirementDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawDraft = window.localStorage.getItem(storageKey);
    if (!rawDraft) {
      return null;
    }

    return JSON.parse(rawDraft) as RequirementDraft;
  } catch (error) {
    console.warn("Failed to load requirement draft", error);
    return null;
  }
}

export function saveDraftToStorage(draft: RequirementDraft): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  } catch (error) {
    console.warn("Failed to save requirement draft", error);
  }
}
