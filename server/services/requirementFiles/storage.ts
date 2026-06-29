import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const storageRoot = process.env.REQUIREMENT_FILE_STORAGE_ROOT || path.resolve(process.cwd(), 'storage', 'requirements');

export interface StoredRequirementFile {
  fileName: string;
  filePath: string;
  extension: string;
}

export function sanitizeOriginalFileName(fileName: string): string {
  return path.basename(fileName || 'requirement-file').replace(/[\\/:*?"<>|]/g, '_');
}

export function getFileExtension(fileName: string): string {
  const extension = path.extname(fileName || '').replace('.', '').toLowerCase();
  return extension;
}

function getDatePath(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export async function saveRequirementUploadFile(
  buffer: Buffer,
  originalFileName: string,
  projectId: string
): Promise<StoredRequirementFile> {
  const extension = getFileExtension(originalFileName);
  const safeProjectId = String(projectId || 'default').replace(/[^a-zA-Z0-9_-]/g, '_');
  const directory = path.join(storageRoot, safeProjectId, getDatePath());
  await fs.mkdir(directory, { recursive: true });

  const fileName = `${randomUUID()}${extension ? `.${extension}` : ''}`;
  const filePath = path.join(directory, fileName);
  await fs.writeFile(filePath, buffer);

  return {
    fileName,
    filePath,
    extension,
  };
}

export async function deleteStoredRequirementFile(filePath: string): Promise<void> {
  if (!filePath) {
    return;
  }

  const resolvedPath = path.resolve(filePath);
  const resolvedRoot = path.resolve(storageRoot);

  if (!resolvedPath.startsWith(resolvedRoot)) {
    throw new Error('非法文件路径，拒绝删除');
  }

  try {
    await fs.unlink(resolvedPath);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== 'ENOENT') {
      throw error;
    }
  }
}
