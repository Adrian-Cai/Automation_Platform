export type RequirementFileType = 'markdown' | 'word' | 'pdf' | 'text' | 'excel' | 'unknown';
export type RequirementFileParseStatus = 'pending' | 'parsing' | 'success' | 'failed';

export interface CleanRequirementOptions {
  removeEmptyLines: boolean;
  trimExtraSpaces: boolean;
  removeInvisibleChars: boolean;
  mergeBrokenLines: boolean;
  preserveMarkdownTables: boolean;
}

export interface RequirementFileRecord {
  fileId: string;
  projectId: string;
  fileName: string;
  originalFileName: string;
  fileType: RequirementFileType;
  fileSize: number;
  filePath: string;
  mimeType: string;
  parseStatus: RequirementFileParseStatus;
  parseError?: string;
  rawText?: string;
  cleanedText?: string;
  cleanConfig: CleanRequirementOptions;
  uploadedAt: string;
  updatedAt: string;
}

export interface RequirementFileUploadResult {
  files: RequirementFileRecord[];
  mergedText: string;
}

export const defaultCleanRequirementOptions: CleanRequirementOptions = {
  removeEmptyLines: true,
  trimExtraSpaces: true,
  removeInvisibleChars: true,
  mergeBrokenLines: true,
  preserveMarkdownTables: true,
};
