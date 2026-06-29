import { CleanRequirementOptions, RequirementFileType } from '@/pages/cases/requirementInputUtils';

export type RequirementFileParseStatus = 'pending' | 'parsing' | 'success' | 'failed';

export interface RequirementFileDto {
  fileId: string;
  projectId: string;
  fileName: string;
  originalFileName?: string;
  fileType: RequirementFileType;
  fileSize: number;
  filePath?: string;
  mimeType?: string;
  parseStatus: RequirementFileParseStatus;
  parseError?: string;
  rawText?: string;
  cleanedText?: string;
  cleanConfig?: CleanRequirementOptions;
  uploadedAt: string;
  updatedAt?: string;
}

export interface UploadRequirementFilesResponse {
  files: RequirementFileDto[];
  mergedText: string;
}

interface ApiResponse<T> {
  code?: number;
  success?: boolean;
  message?: string;
  data: T;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null) as ApiResponse<T> | null;

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || '请求失败');
  }

  return payload?.data as T;
}

export async function uploadRequirementFiles(params: {
  files: File[];
  projectId: string;
  sessionKey?: string;
  cleanConfig: CleanRequirementOptions;
}): Promise<UploadRequirementFilesResponse> {
  const formData = new FormData();
  params.files.forEach((file) => formData.append('files', file));
  formData.append('projectId', params.projectId || 'default');
  if (params.sessionKey) {
    formData.append('sessionKey', params.sessionKey);
  }
  formData.append('cleanConfig', JSON.stringify(params.cleanConfig));

  const response = await fetch('/api/requirements/files/upload', {
    method: 'POST',
    body: formData,
  });

  return parseResponse<UploadRequirementFilesResponse>(response);
}

export async function listRequirementFiles(projectId: string): Promise<RequirementFileDto[]> {
  const response = await fetch(`/api/requirements/files?projectId=${encodeURIComponent(projectId || 'default')}`);
  return parseResponse<RequirementFileDto[]>(response);
}

export async function deleteRequirementFile(fileId: string): Promise<void> {
  const response = await fetch(`/api/requirements/files/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
  });
  await parseResponse<{ fileId: string }>(response);
}
