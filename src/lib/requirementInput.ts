export type RequirementType =
  | '功能需求'
  | '接口需求'
  | '页面交互需求'
  | '后台管理需求'
  | '数据报表需求'
  | '活动营销需求'
  | '库存/交易类需求';

export type GenerateTarget =
  | '生成测试点'
  | '生成测试用例'
  | '生成需求疑问'
  | '生成风险点'
  | '完整测试分析';

export type UploadedFileStatus = '上传成功' | '上传失败' | '等待解析';
export type UploadedFileType = 'word' | 'pdf' | 'markdown' | 'excel' | 'txt' | 'unknown';
export type ReadableUploadedFileType = Extract<UploadedFileType, 'markdown' | 'txt'>;
export type RequirementInputMode = 'upload' | 'text';
export type ParseStatus = 'idle' | 'parsing' | 'success' | 'error';

export interface UploadedFileItem {
  id: string;
  name: string;
  size: string;
  status: UploadedFileStatus;
  type: UploadedFileType;
  content: string;
  errorMessage?: string;
}

export interface CleanRules {
  removeEmptyLines: boolean;
  removeExtraSpaces: boolean;
  removeGarbledChars: boolean;
  keepHeadingLevel: boolean;
  keepTableContent: boolean;
  mergeAbnormalLineBreaks: boolean;
}

export interface RequirementDraft {
  projectName: string;
  requirementName: string;
  requirementType: RequirementType;
  generateTarget: GenerateTarget;
  inputMode: RequirementInputMode;
  requirementText: string;
  cleanRules: CleanRules;
}

export interface RequirementInputState extends RequirementDraft {
  uploadedFiles: UploadedFileItem[];
  rawContent: string;
  cleanedContent: string;
  parseStep: number;
  parseStatus: ParseStatus;
}

export const REQUIREMENT_DRAFT_STORAGE_KEY = 'requirement-input-parse-draft';

export const requirementTypeOptions: RequirementType[] = [
  '功能需求',
  '接口需求',
  '页面交互需求',
  '后台管理需求',
  '数据报表需求',
  '活动营销需求',
  '库存/交易类需求',
];

export const generateTargetOptions: GenerateTarget[] = [
  '生成测试点',
  '生成测试用例',
  '生成需求疑问',
  '生成风险点',
  '完整测试分析',
];

export const defaultCleanRules: CleanRules = {
  removeEmptyLines: true,
  removeExtraSpaces: true,
  removeGarbledChars: true,
  keepHeadingLevel: true,
  keepTableContent: true,
  mergeAbnormalLineBreaks: true,
};

export const sampleRequirementText = `1. 项目概述
本需求文档描述了电商平台会员中心的功能需求，旨在提升用户管理能力与购物体验。

2. 功能需求
2.1 会员注册
- 用户可通过手机号、邮箱进行注册。
- 注册时需填写验证码，验证码有效期为 5 分钟。
- 注册成功后自动登录并跳转至个人中心。

2.2 登录与登出
- 支持账号密码登录。
- 支持短信验证码登录。
- 用户可主动退出登录。`;

export const mockUploadedFiles: UploadedFileItem[] = [
  {
    id: 'mock-md-1',
    name: '电商平台需求规格说明书_v2.1.md',
    size: '24 KB',
    status: '上传成功',
    type: 'markdown',
    content: sampleRequirementText,
  },
  {
    id: 'mock-txt-1',
    name: '会员中心功能需求补充说明.txt',
    size: '12 KB',
    status: '上传成功',
    type: 'txt',
    content: sampleRequirementText,
  },
];

export const initialRequirementInputState: RequirementInputState = {
  projectName: '电商平台 3.0 版本',
  requirementName: '会员中心功能需求',
  requirementType: '功能需求',
  generateTarget: '生成测试用例',
  inputMode: 'upload',
  requirementText: sampleRequirementText,
  uploadedFiles: mockUploadedFiles,
  cleanRules: defaultCleanRules,
  rawContent: '',
  cleanedContent: '',
  parseStep: -1,
  parseStatus: 'idle',
};

const headingPattern = /^\s*((\d+(\.\d+)*[.、]?)|([一二三四五六七八九十]+[、.])|(（[一二三四五六七八九十]+）)|(\([一二三四五六七八九十]+\)))\s*/;
const listPattern = /^\s*[-*•]\s+/;
const tablePattern = /\|/;
const terminalPunctuationPattern = /[。！？!?；;：:]$/;

function shouldPreserveLineBreak(previousLine: string, nextLine: string, rules: CleanRules): boolean {
  if (!previousLine.trim() || !nextLine.trim()) {
    return true;
  }

  if (rules.keepHeadingLevel && (headingPattern.test(previousLine) || headingPattern.test(nextLine))) {
    return true;
  }

  if (listPattern.test(previousLine) || listPattern.test(nextLine)) {
    return true;
  }

  if (rules.keepTableContent && (tablePattern.test(previousLine) || tablePattern.test(nextLine))) {
    return true;
  }

  return terminalPunctuationPattern.test(previousLine.trim());
}

function mergeAbnormalLineBreaks(input: string, rules: CleanRules): string {
  const lines = input.split('\n');
  const merged: string[] = [];

  for (const line of lines) {
    const currentLine = line.trimEnd();
    const previousLine = merged[merged.length - 1];

    if (previousLine === undefined || shouldPreserveLineBreak(previousLine, currentLine, rules)) {
      merged.push(currentLine);
    } else {
      const connector = /[，,]$/.test(previousLine.trimEnd()) ? '' : '，';
      merged[merged.length - 1] = `${previousLine.trimEnd()}${connector}${currentLine.trimStart()}`;
    }
  }

  return merged.join('\n');
}

export function isReadableUploadedFileType(type: UploadedFileType): type is ReadableUploadedFileType {
  return type === 'markdown' || type === 'txt';
}

export function getReadableUploadErrorMessage(type: UploadedFileType): string {
  if (type === 'word' || type === 'pdf' || type === 'excel') {
    return '当前仅支持读取 Markdown/TXT 文本内容，Word/PDF/Excel 文件需要先转换为可读文本后再上传。';
  }

  return '不支持的文件格式，请上传 Markdown 或 TXT 文本文件。';
}

export function buildUploadedFileContent(files: UploadedFileItem[]): string {
  return files
    .filter(
      (file) => file.status !== '上传失败' && isReadableUploadedFileType(file.type) && file.content.trim().length > 0
    )
    .map((file) => `# ${file.name}\n${file.content.trim()}`)
    .join('\n\n');
}

export function cleanRequirementText(input: string, rules: CleanRules): string {
  let output = input.replace(/\r\n?/g, '\n');

  if (rules.removeGarbledChars) {
    output = output.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  }

  if (rules.removeExtraSpaces) {
    output = output
      .split('\n')
      .map((line) => {
        if (rules.keepTableContent && tablePattern.test(line)) {
          return line.trim();
        }

        return line.replace(/[ \t]{2,}/g, ' ').trim();
      })
      .join('\n');
  }

  if (rules.mergeAbnormalLineBreaks) {
    output = mergeAbnormalLineBreaks(output, rules);
  }

  if (rules.removeEmptyLines) {
    output = output
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .join('\n');
  }

  return output.trim();
}

export function getFileType(fileName: string): UploadedFileType {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';

  if (extension === 'doc' || extension === 'docx') return 'word';
  if (extension === 'pdf') return 'pdf';
  if (extension === 'md') return 'markdown';
  if (extension === 'xls' || extension === 'xlsx') return 'excel';
  if (extension === 'txt') return 'txt';

  return 'unknown';
}

export function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  }

  const sizeInKb = sizeInBytes / 1024;
  if (sizeInKb < 1024) {
    return `${sizeInKb.toFixed(sizeInKb >= 100 ? 0 : 1)} KB`;
  }

  const sizeInMb = sizeInKb / 1024;
  return `${sizeInMb.toFixed(2)} MB`;
}

function isCleanRules(value: unknown): value is CleanRules {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const rules = value as Partial<Record<keyof CleanRules, unknown>>;
  return Object.keys(defaultCleanRules).every((key) => typeof rules[key as keyof CleanRules] === 'boolean');
}

function isRequirementDraft(value: unknown): value is RequirementDraft {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const draft = value as Partial<RequirementDraft>;
  return (
    typeof draft.projectName === 'string' &&
    typeof draft.requirementName === 'string' &&
    requirementTypeOptions.includes(draft.requirementType as RequirementType) &&
    generateTargetOptions.includes(draft.generateTarget as GenerateTarget) &&
    (draft.inputMode === 'upload' || draft.inputMode === 'text') &&
    typeof draft.requirementText === 'string' &&
    isCleanRules(draft.cleanRules)
  );
}

export function loadDraftFromStorage(storage: Storage = window.localStorage): RequirementDraft | null {
  try {
    const rawDraft = storage.getItem(REQUIREMENT_DRAFT_STORAGE_KEY);
    if (!rawDraft) {
      return null;
    }

    const parsedDraft: unknown = JSON.parse(rawDraft);
    return isRequirementDraft(parsedDraft) ? parsedDraft : null;
  } catch {
    return null;
  }
}

export function saveDraftToStorage(draft: RequirementDraft, storage: Storage = window.localStorage): void {
  storage.setItem(REQUIREMENT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}
