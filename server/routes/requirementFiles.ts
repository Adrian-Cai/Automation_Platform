import { Router } from 'express';
import multer from 'multer';
import { AppDataSource } from '../config/dataSource';
import { RequirementFileRepository } from '../repositories/RequirementFileRepository';
import { RequirementFileUploadService } from '../services/requirementFiles/uploadService';
import { CleanRequirementOptions } from '../services/requirementFiles/types';
import logger from '../utils/logger';
import { LOG_CONTEXTS } from '../config/logging';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.REQUIREMENT_FILE_MAX_SIZE || 20 * 1024 * 1024),
    files: Number(process.env.REQUIREMENT_FILE_MAX_COUNT || 10),
  },
});

const repository = new RequirementFileRepository(AppDataSource);
const uploadService = new RequirementFileUploadService(repository);

function parseCleanConfig(input: unknown): Partial<CleanRequirementOptions> | undefined {
  if (!input) {
    return undefined;
  }
  if (typeof input === 'object') {
    return input as Partial<CleanRequirementOptions>;
  }
  try {
    return JSON.parse(String(input)) as Partial<CleanRequirementOptions>;
  } catch {
    return undefined;
  }
}

function sendSuccess(res: any, data: unknown, message = 'success'): void {
  res.json({ code: 200, success: true, message, data });
}

function sendError(res: any, status: number, message: string): void {
  res.status(status).json({ code: status, success: false, message });
}

router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const files = (req.files || []) as Express.Multer.File[];
    const projectId = String(req.body.projectId || 'default');
    const sessionKey = req.body.sessionKey ? String(req.body.sessionKey) : undefined;
    const cleanConfig = parseCleanConfig(req.body.cleanConfig);

    const result = await uploadService.uploadFiles({
      files: files.map((file) => ({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      })),
      projectId,
      sessionKey,
      cleanConfig,
    });

    sendSuccess(res, result, '上传成功');
  } catch (error) {
    logger.errorLog(error, 'Requirement file upload failed', {
      event: 'REQUIREMENT_FILE_UPLOAD_FAILED',
      projectId: req.body?.projectId,
    });
    sendError(res, 400, error instanceof Error ? error.message : '上传失败');
  }
});

router.get('/', async (req, res) => {
  try {
    const projectId = String(req.query.projectId || 'default');
    const files = await uploadService.listFiles(projectId);
    sendSuccess(res, files);
  } catch (error) {
    logger.errorLog(error, 'Requirement file list failed', { event: 'REQUIREMENT_FILE_LIST_FAILED' });
    sendError(res, 500, error instanceof Error ? error.message : '查询失败');
  }
});

router.get('/:fileId/content', async (req, res) => {
  try {
    const record = await uploadService.getFileContent(req.params.fileId);
    if (!record) {
      return sendError(res, 404, '文件不存在');
    }
    sendSuccess(res, record);
  } catch (error) {
    logger.errorLog(error, 'Requirement file content failed', {
      event: 'REQUIREMENT_FILE_CONTENT_FAILED',
      fileId: req.params.fileId,
    });
    sendError(res, 500, error instanceof Error ? error.message : '查询失败');
  }
});

router.delete('/:fileId', async (req, res) => {
  try {
    const record = await uploadService.deleteFile(req.params.fileId);
    if (!record) {
      return sendError(res, 404, '文件不存在');
    }
    sendSuccess(res, { fileId: req.params.fileId }, '删除成功');
  } catch (error) {
    logger.errorLog(error, 'Requirement file delete failed', {
      event: 'REQUIREMENT_FILE_DELETE_FAILED',
      fileId: req.params.fileId,
    }, LOG_CONTEXTS.CASES);
    sendError(res, 500, error instanceof Error ? error.message : '删除失败');
  }
});

export default router;
