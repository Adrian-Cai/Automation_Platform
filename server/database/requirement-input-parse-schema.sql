-- 需求输入与解析页面数据库结构
-- 适用范围：附件上传、文本清洗、AI 结构化解析、解析结果回溯
-- 注意：生产环境执行前请先备份数据库。

CREATE TABLE IF NOT EXISTS Auto_RequirementParseSession (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '解析任务ID',
  session_key VARCHAR(64) NOT NULL COMMENT '前端会话唯一标识',
  project_id VARCHAR(64) NOT NULL DEFAULT 'default' COMMENT '项目ID或业务空间ID',
  title VARCHAR(255) NULL COMMENT '需求标题',
  product_line VARCHAR(128) NULL COMMENT '产品线',
  priority VARCHAR(32) NOT NULL DEFAULT 'P1' COMMENT '默认优先级',
  raw_text LONGTEXT NULL COMMENT '页面手工输入与附件合并前文本',
  cleaned_text LONGTEXT NULL COMMENT '清洗后文本',
  clean_config JSON NULL COMMENT '清洗规则配置',
  parse_options JSON NULL COMMENT 'AI解析选项，例如摘要、风险扫描、用例建议',
  parse_status VARCHAR(32) NOT NULL DEFAULT 'draft' COMMENT 'draft/parsing/success/failed',
  parse_error TEXT NULL COMMENT '解析失败原因',
  created_by BIGINT NULL COMMENT '创建人ID，暂允许为空',
  updated_by BIGINT NULL COMMENT '更新人ID，暂允许为空',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_requirement_parse_session_key (session_key),
  KEY idx_requirement_parse_project_id (project_id),
  KEY idx_requirement_parse_status (parse_status),
  KEY idx_requirement_parse_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='需求输入与解析页面任务表';

CREATE TABLE IF NOT EXISTS Auto_RequirementFile (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '附件ID',
  file_id VARCHAR(64) NOT NULL COMMENT '业务文件ID，前端使用',
  session_key VARCHAR(64) NULL COMMENT '关联解析任务session_key，可为空',
  project_id VARCHAR(64) NOT NULL DEFAULT 'default' COMMENT '项目ID或业务空间ID',
  file_name VARCHAR(255) NOT NULL COMMENT '服务端存储文件名',
  original_file_name VARCHAR(255) NOT NULL COMMENT '用户上传原文件名',
  file_type VARCHAR(32) NOT NULL COMMENT 'text/markdown/pdf/word/excel/unknown',
  mime_type VARCHAR(128) NULL COMMENT 'MIME类型',
  file_size BIGINT NOT NULL DEFAULT 0 COMMENT '文件大小，单位字节',
  file_path VARCHAR(500) NOT NULL COMMENT '服务端文件存储路径',
  parse_status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT 'pending/parsing/success/failed',
  parse_error TEXT NULL COMMENT '附件解析失败原因',
  created_by BIGINT NULL COMMENT '上传人ID，暂允许为空',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_requirement_file_id (file_id),
  KEY idx_requirement_file_project_id (project_id),
  KEY idx_requirement_file_session_key (session_key),
  KEY idx_requirement_file_parse_status (parse_status),
  KEY idx_requirement_file_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='需求输入与解析附件表';

CREATE TABLE IF NOT EXISTS Auto_RequirementFileContent (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '附件内容ID',
  file_id VARCHAR(64) NOT NULL COMMENT '关联Auto_RequirementFile.file_id',
  raw_text LONGTEXT NULL COMMENT '附件原始抽取文本',
  cleaned_text LONGTEXT NULL COMMENT '附件清洗后文本',
  clean_config JSON NULL COMMENT '本次清洗配置',
  text_hash VARCHAR(64) NULL COMMENT '清洗后文本SHA256，用于去重和变更判断',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_requirement_file_content_file_id (file_id),
  KEY idx_requirement_file_content_hash (text_hash),
  CONSTRAINT fk_requirement_file_content_file_id
    FOREIGN KEY (file_id) REFERENCES Auto_RequirementFile(file_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='需求输入与解析附件文本内容表';

CREATE TABLE IF NOT EXISTS Auto_RequirementStructuredResult (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '结构化解析结果ID',
  result_id VARCHAR(64) NOT NULL COMMENT '业务结果ID',
  session_key VARCHAR(64) NOT NULL COMMENT '关联解析任务session_key',
  summary TEXT NULL COMMENT '需求摘要',
  business_background TEXT NULL COMMENT '业务背景',
  functional_requirements JSON NULL COMMENT '功能需求JSON数组',
  non_functional_requirements JSON NULL COMMENT '非功能需求JSON数组',
  constraints_json JSON NULL COMMENT '约束条件JSON数组',
  acceptance_criteria JSON NULL COMMENT '验收标准JSON数组',
  open_questions JSON NULL COMMENT '待确认问题JSON数组',
  risk_points JSON NULL COMMENT '风险点JSON数组',
  modules_json JSON NULL COMMENT '识别到的功能模块JSON数组',
  source_file_ids JSON NULL COMMENT '来源附件file_id数组',
  model_name VARCHAR(128) NULL COMMENT 'AI模型名称',
  prompt_version VARCHAR(64) NULL COMMENT 'Prompt版本',
  parse_status VARCHAR(32) NOT NULL DEFAULT 'success' COMMENT 'success/failed',
  parse_error TEXT NULL COMMENT 'AI结构化解析失败原因',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_requirement_structured_result_id (result_id),
  KEY idx_requirement_structured_session_key (session_key),
  KEY idx_requirement_structured_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='需求输入与解析AI结构化结果表';
