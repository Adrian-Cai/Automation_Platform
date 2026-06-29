import { createHash } from 'crypto';
import { DataSource } from 'typeorm';
import { CleanRequirementOptions, RequirementFileRecord } from '../services/requirementFiles/types';

interface SaveRequirementFileInput {
  fileId: string;
  sessionKey?: string;
  projectId: string;
  fileName: string;
  originalFileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  parseStatus: string;
  parseError?: string | null;
  rawText?: string;
  cleanedText?: string;
  cleanConfig: CleanRequirementOptions;
}

function hashText(text: string): string {
  return createHash('sha256').update(text || '').digest('hex');
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (!value) {
    return fallback;
  }
  if (typeof value === 'object') {
    return value as T;
  }
  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return fallback;
  }
}

function mapRequirementFileRow(row: any): RequirementFileRecord {
  const cleanConfig = parseJson<CleanRequirementOptions>(row.clean_config, {
    removeEmptyLines: true,
    trimExtraSpaces: true,
    removeInvisibleChars: true,
    mergeBrokenLines: true,
    preserveMarkdownTables: true,
  });

  return {
    fileId: row.file_id,
    projectId: row.project_id,
    fileName: row.original_file_name,
    originalFileName: row.original_file_name,
    fileType: row.file_type,
    fileSize: Number(row.file_size || 0),
    filePath: row.file_path,
    mimeType: row.mime_type || '',
    parseStatus: row.parse_status,
    parseError: row.parse_error || undefined,
    rawText: row.raw_text || '',
    cleanedText: row.cleaned_text || '',
    cleanConfig,
    uploadedAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

export class RequirementFileRepository {
  constructor(private readonly dataSource: DataSource) {}

  async ensureTables(): Promise<void> {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS Auto_RequirementFile (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        file_id VARCHAR(64) NOT NULL,
        session_key VARCHAR(64) NULL,
        project_id VARCHAR(64) NOT NULL DEFAULT 'default',
        file_name VARCHAR(255) NOT NULL,
        original_file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(32) NOT NULL,
        mime_type VARCHAR(128) NULL,
        file_size BIGINT NOT NULL DEFAULT 0,
        file_path VARCHAR(500) NOT NULL,
        parse_status VARCHAR(32) NOT NULL DEFAULT 'pending',
        parse_error TEXT NULL,
        created_by BIGINT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_requirement_file_id (file_id),
        KEY idx_requirement_file_project_id (project_id),
        KEY idx_requirement_file_session_key (session_key),
        KEY idx_requirement_file_parse_status (parse_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS Auto_RequirementFileContent (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        file_id VARCHAR(64) NOT NULL,
        raw_text LONGTEXT NULL,
        cleaned_text LONGTEXT NULL,
        clean_config JSON NULL,
        text_hash VARCHAR(64) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_requirement_file_content_file_id (file_id),
        KEY idx_requirement_file_content_hash (text_hash),
        CONSTRAINT fk_requirement_file_content_file_id
          FOREIGN KEY (file_id) REFERENCES Auto_RequirementFile(file_id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async saveParsedFile(input: SaveRequirementFileInput): Promise<RequirementFileRecord> {
    await this.ensureTables();

    await this.dataSource.query(
      `INSERT INTO Auto_RequirementFile
        (file_id, session_key, project_id, file_name, original_file_name, file_type, mime_type, file_size, file_path, parse_status, parse_error)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.fileId,
        input.sessionKey || null,
        input.projectId,
        input.fileName,
        input.originalFileName,
        input.fileType,
        input.mimeType,
        input.fileSize,
        input.filePath,
        input.parseStatus,
        input.parseError || null,
      ]
    );

    await this.dataSource.query(
      `INSERT INTO Auto_RequirementFileContent
        (file_id, raw_text, cleaned_text, clean_config, text_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [input.fileId, input.rawText || '', input.cleanedText || '', JSON.stringify(input.cleanConfig), hashText(input.cleanedText || '')]
    );

    const record = await this.findByFileId(input.fileId);
    if (!record) {
      throw new Error('保存附件后读取失败');
    }
    return record;
  }

  async findByProjectId(projectId: string): Promise<RequirementFileRecord[]> {
    await this.ensureTables();
    const rows = await this.dataSource.query(
      `SELECT f.*, c.raw_text, c.cleaned_text, c.clean_config
       FROM Auto_RequirementFile f
       LEFT JOIN Auto_RequirementFileContent c ON c.file_id = f.file_id
       WHERE f.project_id = ?
       ORDER BY f.created_at DESC`,
      [projectId]
    );
    return rows.map(mapRequirementFileRow);
  }

  async findByFileId(fileId: string): Promise<RequirementFileRecord | null> {
    await this.ensureTables();
    const rows = await this.dataSource.query(
      `SELECT f.*, c.raw_text, c.cleaned_text, c.clean_config
       FROM Auto_RequirementFile f
       LEFT JOIN Auto_RequirementFileContent c ON c.file_id = f.file_id
       WHERE f.file_id = ?
       LIMIT 1`,
      [fileId]
    );
    return rows.length > 0 ? mapRequirementFileRow(rows[0]) : null;
  }

  async deleteByFileId(fileId: string): Promise<RequirementFileRecord | null> {
    await this.ensureTables();
    const existing = await this.findByFileId(fileId);
    if (!existing) {
      return null;
    }
    await this.dataSource.query('DELETE FROM Auto_RequirementFile WHERE file_id = ?', [fileId]);
    return existing;
  }
}
