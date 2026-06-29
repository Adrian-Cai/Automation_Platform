import fs from 'fs/promises';
import { TextDecoder } from 'util';
import { RequirementFileType } from './types';

const supportedExtensions = new Set(['txt', 'text', 'md', 'markdown', 'pdf', 'docx', 'xlsx', 'xls', 'csv']);

export function getRequirementFileType(fileName: string): RequirementFileType {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';

  if (['md', 'markdown'].includes(extension)) {
    return 'markdown';
  }

  if (['doc', 'docx'].includes(extension)) {
    return 'word';
  }

  if (extension === 'pdf') {
    return 'pdf';
  }

  if (['txt', 'text'].includes(extension)) {
    return 'text';
  }

  if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return 'excel';
  }

  return 'unknown';
}

export function assertSupportedRequirementFile(originalFileName: string): void {
  const extension = originalFileName.split('.').pop()?.toLowerCase() ?? '';
  if (!supportedExtensions.has(extension)) {
    throw new Error('不支持的文件格式，仅支持 TXT、Markdown、PDF、DOCX、XLS/XLSX、CSV');
  }

  if (extension === 'doc') {
    throw new Error('暂不支持旧版 .doc 文件，请转换为 .docx 后上传');
  }
}

function decodeTextBuffer(buffer: Buffer): string {
  const utf8Text = buffer.toString('utf8');
  const invalidCharCount = (utf8Text.match(/�/g) || []).length;

  if (invalidCharCount <= 3) {
    return utf8Text;
  }

  try {
    return new TextDecoder('gb18030').decode(buffer);
  } catch {
    return utf8Text;
  }
}

async function parseTextFile(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  return decodeTextBuffer(buffer);
}

async function parsePdfFile(filePath: string): Promise<string> {
  const pdfParseModule = await import('pdf-parse');
  const pdfParse = (pdfParseModule as any).default || pdfParseModule;
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);
  return String(data?.text || '').trim();
}

async function parseDocxFile(filePath: string): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await (mammoth as any).extractRawText({ path: filePath });
  return String(result?.value || '').trim();
}

function rowsToMarkdownTable(rows: unknown[][]): string {
  const validRows = rows.filter((row) => Array.isArray(row) && row.some((cell) => String(cell ?? '').trim().length > 0));
  if (validRows.length === 0) {
    return '';
  }

  const maxColumnCount = Math.max(...validRows.map((row) => row.length));
  const headers = Array.from({ length: maxColumnCount }).map((_, index) => {
    const value = String(validRows[0]?.[index] ?? '').trim();
    return value || `字段${index + 1}`;
  });

  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
  ];

  validRows.slice(1).forEach((row) => {
    const cells = headers.map((_, index) => String(row[index] ?? '').replace(/\n/g, ' ').trim());
    lines.push(`| ${cells.join(' | ')} |`);
  });

  return lines.join('\n');
}

async function parseExcelFile(filePath: string): Promise<string> {
  const XLSX = await import('xlsx');
  const workbook = (XLSX as any).readFile(filePath);
  const sections: string[] = [];

  workbook.SheetNames.forEach((sheetName: string) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = (XLSX as any).utils.sheet_to_json(sheet, { header: 1, raw: false }) as unknown[][];
    const table = rowsToMarkdownTable(rows);
    if (table) {
      sections.push(`## Sheet: ${sheetName}\n\n${table}`);
    }
  });

  return sections.join('\n\n').trim();
}

export async function parseRequirementFile(filePath: string, originalFileName: string): Promise<string> {
  const type = getRequirementFileType(originalFileName);

  switch (type) {
    case 'text':
    case 'markdown':
      return parseTextFile(filePath);
    case 'pdf':
      return parsePdfFile(filePath);
    case 'word':
      return parseDocxFile(filePath);
    case 'excel':
      return parseExcelFile(filePath);
    default:
      throw new Error('不支持的文件格式');
  }
}
