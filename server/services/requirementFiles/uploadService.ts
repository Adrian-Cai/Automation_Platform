import { randomUUID } from 'crypto';
import { RequirementFileRepository } from '../../repositories/RequirementFileRepository';
import { cleanRequirementText } from './textCleaner';
import { assertSupportedRequirementFile, getRequirementFileType, parseRequirementFile } from './fileParser';
import { deleteStoredRequirementFile, saveRequirementUploadFile, sanitizeOriginalFileName } from './storage';
import {
  CleanRequirementOptions,
  defaultCleanRequirementOptions,
  RequirementFileRecord,
  RequirementFileUploadResult,
} from './types';

export interface RequirementUploadFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadRequirementFilesInput {
  files: RequirementUploadFile[];
  projectId: string;
  sessionKey?: string;
  cleanConfig?: Partial<CleanRequirementOptions>;
}

const maxFileSize = Number(process.env.REQUIREMENT_FILE_MAX_SIZE || 20 * 1024 * 1024);

export class RequirementFileUploadService {
  constructor(private readonly repository: RequirementFileRepository) {}

  async uploadFiles(input: UploadRequirementFilesInput): Promise<RequirementFileUploadResult> {
    const files = input.files || [];
    if (files.length === 0) {
      throw new Error('请选择要上传的需求附件');
    }

    const cleanConfig: CleanRequirementOptions = {
      ...defaultCleanRequirementOptions,
      ...(input.cleanConfig || {}),
    };

    const records: RequirementFileRecord[] = [];

    for (const file of files) {
      const safeOriginalName = sanitizeOriginalFileName(file.originalname);
      if (file.size > maxFileSize) {
        throw new Error(`文件 ${safeOriginalName} 超过大小限制，单个文件最大支持 20MB`);
      }

      assertSupportedRequirementFile(safeOriginalName);

      const storedFile = await saveRequirementUploadFile(file.buffer, safeOriginalName, input.projectId);
      const fileId = `req_file_${randomUUID().replace(/-/g, '')}`;
      const fileType = getRequirementFileType(safeOriginalName);

      try {
        const rawText = await parseRequirementFile(storedFile.filePath, safeOriginalName);
        if (!rawText.trim()) {
          throw new Error('未提取到有效文本，可能是扫描件或空文件');
        }

        const cleanedText = cleanRequirementText(rawText, cleanConfig);
        const record = await this.repository.saveParsedFile({
          fileId,
          sessionKey: input.sessionKey,
          projectId: input.projectId,
          fileName: storedFile.fileName,
          originalFileName: safeOriginalName,
          fileType,
          mimeType: file.mimetype || '',
          fileSize: file.size,
          filePath: storedFile.filePath,
          parseStatus: 'success',
          rawText,
          cleanedText,
          cleanConfig,
        });
        records.push(record);
      } catch (error) {
        await deleteStoredRequirementFile(storedFile.filePath).catch(() => undefined);
        throw new Error(`${safeOriginalName} 解析失败：${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return {
      files: records,
      mergedText: records.map((record) => record.cleanedText || '').filter(Boolean).join('\n\n'),
    };
  }

  async listFiles(projectId: string): Promise<RequirementFileRecord[]> {
    return this.repository.findByProjectId(projectId || 'default');
  }

  async getFileContent(fileId: string): Promise<RequirementFileRecord | null> {
    return this.repository.findByFileId(fileId);
  }

  async deleteFile(fileId: string): Promise<RequirementFileRecord | null> {
    const existing = await this.repository.deleteByFileId(fileId);
    if (existing) {
      await deleteStoredRequirementFile(existing.filePath).catch(() => undefined);
    }
    return existing;
  }
}
