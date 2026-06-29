import { CleanRequirementOptions, defaultCleanRequirementOptions } from './types';

const markdownTableLinePattern = /^\s*\|.*\|\s*$/;
const markdownTableDividerPattern = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;
const sentenceEndingPattern = /[。！？.!?；;：:]$/;
const listOrHeadingPattern = /^\s*(#{1,6}\s|[-*+]\s+|\d+[.)、]\s+|[一二三四五六七八九十]+[、.]|第[一二三四五六七八九十\d]+[章节]|>\s+)/;
const codeFencePattern = /^\s*```/;

function isMarkdownTableLine(line: string): boolean {
  return markdownTableLinePattern.test(line) || markdownTableDividerPattern.test(line);
}

function normalizeVisibleSpacing(line: string): string {
  const placeholder = '__REQ_INPUT_FULL_WIDTH_SPACE__';
  return line
    .replace(/　/g, placeholder)
    .replace(/[\t ]+/g, ' ')
    .replace(new RegExp(placeholder, 'g'), ' ')
    .trim();
}

function shouldMergeLine(previousLine: string | undefined, currentLine: string, preserveMarkdownTables: boolean): boolean {
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

  let normalizedText = (input || '').replace(/\r\n?/g, '\n');

  if (mergedOptions.removeInvisibleChars) {
    normalizedText = normalizedText.replace(/[\u200B-\u200D\uFEFF\u2060]/g, '');
  }

  let insideCodeFence = false;
  let lines = normalizedText.split('\n').map((line) => {
    if (codeFencePattern.test(line)) {
      insideCodeFence = !insideCodeFence;
      return line.trimEnd();
    }

    if (insideCodeFence) {
      return line;
    }

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
    const cleanedText = lines.join('\n');
    return mergedOptions.trimExtraSpaces ? cleanedText.trim() : cleanedText;
  }

  const mergedLines: string[] = [];
  insideCodeFence = false;

  lines.forEach((line) => {
    if (codeFencePattern.test(line)) {
      insideCodeFence = !insideCodeFence;
      mergedLines.push(line);
      return;
    }

    const previousLine = mergedLines[mergedLines.length - 1];

    if (!insideCodeFence && shouldMergeLine(previousLine, line, mergedOptions.preserveMarkdownTables)) {
      mergedLines[mergedLines.length - 1] = `${previousLine}${line.match(/^[,，.。!?！？]/) ? '' : ' '}${line}`;
      return;
    }

    mergedLines.push(line);
  });

  const cleanedText = mergedLines.join('\n');
  return mergedOptions.trimExtraSpaces ? cleanedText.trim() : cleanedText;
}
