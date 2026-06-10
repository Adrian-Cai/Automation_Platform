-- -----------------------------------------------------------------------------
-- AI 工作台「需求输入与解析」建表脚本
-- -----------------------------------------------------------------------------
-- 数据库类型：MariaDB / MySQL 8.x 兼容语法
-- 字符集：utf8mb4，支持中文、Emoji 与完整 Unicode 文本
-- 设计目标：
--   1. 支撑需求文本/附件输入、文本清洗、AI 结构化解析、疑问/风险识别、测试点建议生成。
--   2. 以解析任务为主线，完整保留输入、配置、过程、结果与 AI 调用审计。
--   3. 可与既有 Auto_Users 用户表、Auto_AiCaseWorkspaces 工作台表对接。
-- 执行前置：
--   1. 请确保 Auto_Users 表已存在。
--   2. 如需要绑定既有 AI 用例工作台，请确保 Auto_AiCaseWorkspaces 表已存在。
--   3. 生产环境执行前建议由 DBA 审核字段长度、索引策略和外键策略。
-- -----------------------------------------------------------------------------

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. 需求解析任务主表
-- -----------------------------------------------------------------------------
-- 用途：记录一次「需求输入与解析」页面上的解析任务。
-- 页面映射：需求标题、产品线、优先级、原始需求文本、清洗后文本、解析进度、右侧统计摘要。
-- 关系：
--   - 一个用户可以创建多个解析任务。
--   - 一个解析任务可以绑定一个 AI 用例工作台 workspace_id，用于后续生成测试点/用例。
--   - 一个解析任务下挂附件、清洗规则、解析配置、阶段日志、解析结果、模块、需求点、疑问、风险与测试点建议。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Auto_AiRequirementParseTasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '需求解析任务ID',
  `task_key` varchar(64) NOT NULL COMMENT '任务稳定唯一键，建议使用UUID/ULID，供前端路由和异步轮询使用',
  `task_no` varchar(64) NOT NULL COMMENT '业务任务编号，例如 REQ-20260609-0001',
  `workspace_id` int(11) DEFAULT NULL COMMENT '关联AI用例工作台ID，可为空；解析完成后可将测试点同步到该工作台',
  `title` varchar(255) NOT NULL COMMENT '需求标题，对应页面解析配置中的需求标题',
  `product_line` varchar(128) DEFAULT NULL COMMENT '产品线，例如交易平台、用户中心、营销平台',
  `priority` enum('P0','P1','P2','P3','P4') NOT NULL DEFAULT 'P1' COMMENT '需求优先级，P0最高，P4最低',
  `raw_text` longtext DEFAULT NULL COMMENT '用户在页面粘贴的原始需求文本，或由附件抽取后合并的原始文本',
  `cleaned_text` longtext DEFAULT NULL COMMENT '经过清洗规则处理后的需求文本，用于AI解析和页面清洗后对比',
  `status` enum('draft','pending','running','success','failed','cancelled') NOT NULL DEFAULT 'draft' COMMENT '任务状态：草稿、待解析、解析中、成功、失败、已取消',
  `progress` tinyint unsigned NOT NULL DEFAULT 0 COMMENT '整体解析进度，取值0-100，对应页面解析进度条',
  `current_stage` enum('input','cleaning','structuring','test_point_generation','completed') DEFAULT 'input' COMMENT '当前阶段：需求录入、文本清洗、结构化解析、测试点生成、已完成',
  `document_word_count` int(11) NOT NULL DEFAULT 0 COMMENT '文档字数统计，对应右侧解析结果摘要中的文档字数',
  `module_count` int(11) NOT NULL DEFAULT 0 COMMENT '识别到的功能模块数量，对应右侧解析结果摘要中的识别模块',
  `question_count` int(11) NOT NULL DEFAULT 0 COMMENT '需求疑问数量，对应右侧解析结果摘要中的需求疑问',
  `risk_count` int(11) NOT NULL DEFAULT 0 COMMENT '风险点数量，对应右侧解析结果摘要中的风险点',
  `created_by` int(11) DEFAULT NULL COMMENT '创建人ID，关联Auto_Users.id',
  `updated_by` int(11) DEFAULT NULL COMMENT '最近更新人ID，关联Auto_Users.id',
  `started_at` datetime DEFAULT NULL COMMENT '开始解析时间，点击开始解析时写入',
  `completed_at` datetime DEFAULT NULL COMMENT '解析完成时间，成功/失败/取消时写入',
  `error_message` text DEFAULT NULL COMMENT '任务失败原因或取消原因，便于前端展示友好错误信息',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_ai_req_parse_task_key` (`task_key`),
  UNIQUE KEY `uniq_ai_req_parse_task_no` (`task_no`),
  KEY `idx_ai_req_parse_workspace` (`workspace_id`),
  KEY `idx_ai_req_parse_status` (`status`),
  KEY `idx_ai_req_parse_product_line` (`product_line`),
  KEY `idx_ai_req_parse_created_by` (`created_by`),
  KEY `idx_ai_req_parse_updated_at` (`updated_at`),
  CONSTRAINT `fk_ai_req_parse_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `Auto_AiCaseWorkspaces` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ai_req_parse_created_by` FOREIGN KEY (`created_by`) REFERENCES `Auto_Users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ai_req_parse_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `Auto_Users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_ai_req_parse_progress` CHECK (`progress` <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台需求输入与解析任务主表';

-- -----------------------------------------------------------------------------
-- 2. 需求附件表
-- -----------------------------------------------------------------------------
-- 用途：保存页面左侧上传附件信息，以及附件文本抽取结果。
-- 页面映射：上传需求附件、已上传文件。
-- 支持格式：txt、markdown、pdf、word、excel等，具体解析逻辑由服务层实现。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Auto_AiRequirementAttachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '附件ID',
  `task_id` int(11) NOT NULL COMMENT '关联需求解析任务ID',
  `file_key` varchar(64) NOT NULL COMMENT '附件稳定唯一键，建议使用UUID/ULID',
  `original_file_name` varchar(255) NOT NULL COMMENT '用户上传时的原始文件名',
  `file_ext` varchar(32) DEFAULT NULL COMMENT '文件扩展名，例如 txt、md、pdf、docx、xlsx',
  `mime_type` varchar(120) DEFAULT NULL COMMENT '文件MIME类型',
  `file_size` bigint unsigned NOT NULL DEFAULT 0 COMMENT '文件大小，单位字节',
  `storage_path` varchar(1000) NOT NULL COMMENT '文件存储路径或对象存储Key',
  `extract_status` enum('pending','running','success','failed','skipped') NOT NULL DEFAULT 'pending' COMMENT '文本抽取状态',
  `extracted_text` longtext DEFAULT NULL COMMENT '从附件中抽取出的文本内容，可与页面输入文本合并后进入清洗流程',
  `extract_error` text DEFAULT NULL COMMENT '文本抽取失败原因',
  `uploaded_by` int(11) DEFAULT NULL COMMENT '上传人ID，关联Auto_Users.id',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '上传时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_ai_req_attachment_file_key` (`file_key`),
  KEY `idx_ai_req_attachment_task` (`task_id`),
  KEY `idx_ai_req_attachment_uploaded_by` (`uploaded_by`),
  CONSTRAINT `fk_ai_req_attachment_task` FOREIGN KEY (`task_id`) REFERENCES `Auto_AiRequirementParseTasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ai_req_attachment_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `Auto_Users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台需求附件表';

-- -----------------------------------------------------------------------------
-- 3. 清洗规则字典表
-- -----------------------------------------------------------------------------
-- 用途：维护页面左侧「清洗规则」列表。
-- 说明：规则本身是字典数据，任务启用哪些规则由 Auto_AiRequirementTaskCleaningRules 记录。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Auto_AiRequirementCleaningRules` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '清洗规则ID',
  `rule_code` varchar(64) NOT NULL COMMENT '规则编码，服务端据此执行对应清洗逻辑',
  `rule_name` varchar(128) NOT NULL COMMENT '规则名称，例如删除空行、删除多余空格',
  `description` varchar(500) DEFAULT NULL COMMENT '规则说明，展示给用户理解清洗效果',
  `enabled_by_default` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否默认启用：1启用，0不启用',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '页面展示排序，数值越小越靠前',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '规则是否可用：1可用，0停用',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_ai_req_cleaning_rule_code` (`rule_code`),
  KEY `idx_ai_req_cleaning_rule_active_sort` (`is_active`,`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台需求文本清洗规则字典表';

-- -----------------------------------------------------------------------------
-- 4. 任务清洗规则关联表
-- -----------------------------------------------------------------------------
-- 用途：记录某个解析任务实际启用、执行过哪些清洗规则。
-- 页面映射：清洗规则的勾选状态、内容清洗对比的清洗统计。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Auto_AiRequirementTaskCleaningRules` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '任务清洗规则关联ID',
  `task_id` int(11) NOT NULL COMMENT '关联需求解析任务ID',
  `rule_id` int(11) NOT NULL COMMENT '关联清洗规则ID',
  `enabled` tinyint(1) NOT NULL DEFAULT 1 COMMENT '当前任务是否启用该规则：1启用，0不启用',
  `applied` tinyint(1) NOT NULL DEFAULT 0 COMMENT '该规则是否已执行：1已执行，0未执行',
  `before_line_count` int(11) DEFAULT NULL COMMENT '执行该规则前的文本行数',
  `after_line_count` int(11) DEFAULT NULL COMMENT '执行该规则后的文本行数',
  `changed_count` int(11) NOT NULL DEFAULT 0 COMMENT '该规则处理的变更数量，例如删除空行数量、合并空格数量',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_ai_req_task_cleaning_rule` (`task_id`,`rule_id`),
  KEY `idx_ai_req_task_cleaning_rule_id` (`rule_id`),
  CONSTRAINT `fk_ai_req_task_cleaning_task` FOREIGN KEY (`task_id`) REFERENCES `Auto_AiRequirementParseTasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ai_req_task_cleaning_rule` FOREIGN KEY (`rule_id`) REFERENCES `Auto_AiRequirementCleaningRules` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台需求解析任务清洗规则关联表';

-- -----------------------------------------------------------------------------
-- 5. 解析配置表
-- -----------------------------------------------------------------------------
-- 用途：保存页面「解析配置」区域的开关和模型参数。
-- 页面映射：生成需求摘要、扫描歧义与风险、生成测试点建议。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Auto_AiRequirementParseConfigs` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '解析配置ID',
  `task_id` int(11) NOT NULL COMMENT '关联需求解析任务ID，一个任务仅一条解析配置',
  `generate_summary` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否生成需求摘要：1是，0否',
  `scan_ambiguity_risk` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否扫描歧义与风险：1是，0否',
  `generate_test_points` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否生成测试点建议：1是，0否',
  `model_name` varchar(128) DEFAULT NULL COMMENT '解析使用的AI模型名称，例如 gpt-4.1、deepseek、qwen 等',
  `prompt_version` varchar(64) DEFAULT NULL COMMENT 'Prompt版本号，用于追踪解析效果和灰度发布',
  `temperature` decimal(4,2) NOT NULL DEFAULT 0.20 COMMENT '模型temperature参数，建议解析类任务保持低随机性',
  `max_tokens` int(11) DEFAULT NULL COMMENT '模型最大输出Token限制',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_ai_req_parse_config_task` (`task_id`),
  CONSTRAINT `fk_ai_req_parse_config_task` FOREIGN KEY (`task_id`) REFERENCES `Auto_AiRequirementParseTasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_ai_req_parse_config_temperature` CHECK (`temperature` >= 0 AND `temperature` <= 2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台需求解析配置表';

-- -----------------------------------------------------------------------------
-- 6. 解析阶段日志表
-- -----------------------------------------------------------------------------
-- 用途：记录解析流程各阶段状态，支撑页面进度条和异步轮询。
-- 页面映射：需求录入、文本清洗、结构化解析、测试点生成四个阶段。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Auto_AiRequirementParseStageLogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '解析阶段日志ID',
  `task_id` int(11) NOT NULL COMMENT '关联需求解析任务ID',
  `stage_code` enum('input','cleaning','structuring','test_point_generation') NOT NULL COMMENT '阶段编码',
  `stage_name` varchar(128) NOT NULL COMMENT '阶段名称，用于前端展示',
  `status` enum('pending','running','success','failed','skipped') NOT NULL DEFAULT 'pending' COMMENT '阶段状态',
  `progress` tinyint unsigned NOT NULL DEFAULT 0 COMMENT '阶段进度，取值0-100',
  `started_at` datetime DEFAULT NULL COMMENT '阶段开始时间',
  `completed_at` datetime DEFAULT NULL COMMENT '阶段完成时间',
  `duration_ms` int(11) DEFAULT NULL COMMENT '阶段耗时，单位毫秒',
  `error_message` text DEFAULT NULL COMMENT '阶段失败原因',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_ai_req_parse_stage` (`task_id`,`stage_code`),
  KEY `idx_ai_req_parse_stage_status` (`status`),
  CONSTRAINT `fk_ai_req_parse_stage_task` FOREIGN KEY (`task_id`) REFERENCES `Auto_AiRequirementParseTasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_ai_req_parse_stage_progress` CHECK (`progress` <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台需求解析阶段日志表';

-- -----------------------------------------------------------------------------
-- 7. 解析结果摘要表
-- -----------------------------------------------------------------------------
-- 用途：保存AI输出的整体摘要和结构化JSON快照。
-- 页面映射：解析结果报告、摘要、业务目标、范围、角色等结构化内容。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Auto_AiRequirementParseResults` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '解析结果ID',
  `task_id` int(11) NOT NULL COMMENT '关联需求解析任务ID，一个任务仅一条整体结果',
  `summary` text DEFAULT NULL COMMENT 'AI生成的需求摘要',
  `business_goal` text DEFAULT NULL COMMENT '业务目标或产品目标',
  `user_roles` text DEFAULT NULL COMMENT '涉及用户角色，例如运营人员、普通用户、管理员',
  `scope_description` text DEFAULT NULL COMMENT '需求范围说明',
  `out_of_scope` text DEFAULT NULL COMMENT '非需求范围说明，便于减少测试误判',
  `structured_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '完整结构化解析结果JSON快照，便于报告复现和兼容后续字段扩展',
  `ai_model` varchar(128) DEFAULT NULL COMMENT '生成该结果的AI模型名称',
  `prompt_version` varchar(64) DEFAULT NULL COMMENT '生成该结果使用的Prompt版本',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_ai_req_parse_result_task` (`task_id`),
  CONSTRAINT `fk_ai_req_parse_result_task` FOREIGN KEY (`task_id`) REFERENCES `Auto_AiRequirementParseTasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_ai_req_parse_result_json` CHECK (`structured_json` IS NULL OR json_valid(`structured_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台需求解析整体结果表';

-- -----------------------------------------------------------------------------
-- 8. 功能模块表
-- -----------------------------------------------------------------------------
-- 用途：保存AI从需求中识别出的功能模块。
-- 页面映射：右侧「识别到的功能模块」。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Auto_AiRequirementModules` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '功能模块ID',
  `task_id` int(11) NOT NULL COMMENT '关联需求解析任务ID',
  `module_key` varchar(64) NOT NULL COMMENT '模块稳定唯一键，供前端定位和后续测试点关联',
  `module_name` varchar(255) NOT NULL COMMENT '功能模块名称，例如优惠券规则、订单支付、用户登录',
  `module_description` text DEFAULT NULL COMMENT '功能模块描述',
  `business_priority` enum('high','medium','low') DEFAULT NULL COMMENT 'AI识别出的业务重要性',
  `confidence_score` decimal(5,4) DEFAULT NULL COMMENT 'AI识别置信度，0到1之间',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '页面展示排序',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_ai_req_module_key` (`task_id`,`module_key`),
  KEY `idx_ai_req_module_task_sort` (`task_id`,`sort_order`),
  CONSTRAINT `fk_ai_req_module_task` FOREIGN KEY (`task_id`) REFERENCES `Auto_AiRequirementParseTasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_ai_req_module_confidence` CHECK (`confidence_score` IS NULL OR (`confidence_score` >= 0 AND `confidence_score` <= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台需求功能模块表';

-- -----------------------------------------------------------------------------
-- 9. 结构化需求点表
-- -----------------------------------------------------------------------------
-- 用途：保存AI从原始文本中拆解出的具体需求条目。
-- 说明：需求点可属于某个功能模块，也允许 module_id 为空表示暂未归类。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Auto_AiRequirementItems` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '需求点ID',
  `task_id` int(11) NOT NULL COMMENT '关联需求解析任务ID',
  `module_id` int(11) DEFAULT NULL COMMENT '所属功能模块ID，可为空',
  `requirement_code` varchar(64) DEFAULT NULL COMMENT '需求点编号，例如 REQ-001，由AI或系统生成',
  `requirement_type` enum('functional','non_functional','business_rule','constraint','data','interface','other') NOT NULL DEFAULT 'functional' COMMENT '需求类型：功能、非功能、业务规则、约束、数据、接口、其他',
  `title` varchar(255) DEFAULT NULL COMMENT '需求点标题',
  `description` text DEFAULT NULL COMMENT '结构化后的需求描述',
  `acceptance_criteria` text DEFAULT NULL COMMENT '验收标准或完成条件',
  `source_text` text DEFAULT NULL COMMENT '该需求点对应的原文片段，用于可追溯',
  `priority` enum('P0','P1','P2','P3','P4') DEFAULT NULL COMMENT '需求点优先级，可继承任务优先级或由AI识别',
  `confidence_score` decimal(5,4) DEFAULT NULL COMMENT 'AI抽取该需求点的置信度，0到1之间',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '需求点在模块内的展示排序',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_ai_req_item_task` (`task_id`),
  KEY `idx_ai_req_item_module_sort` (`module_id`,`sort_order`),
  KEY `idx_ai_req_item_type` (`requirement_type`),
  CONSTRAINT `fk_ai_req_item_task` FOREIGN KEY (`task_id`) REFERENCES `Auto_AiRequirementParseTasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ai_req_item_module` FOREIGN KEY (`module_id`) REFERENCES `Auto_AiRequirementModules` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_ai_req_item_confidence` CHECK (`confidence_score` IS NULL OR (`confidence_score` >= 0 AND `confidence_score` <= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台结构化需求点表';

-- -----------------------------------------------------------------------------
-- 10. 需求疑问表
-- -----------------------------------------------------------------------------
-- 用途：保存AI识别出的歧义、缺失规则、缺失边界、前后不一致等问题。
-- 页面映射：右侧「需求疑问」。
-- 说明：requirement_item_id 可为空，表示疑问是全局性的或暂无法关联到某个具体需求点。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Auto_AiRequirementQuestions` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '需求疑问ID',
  `task_id` int(11) NOT NULL COMMENT '关联需求解析任务ID',
  `requirement_item_id` int(11) DEFAULT NULL COMMENT '关联需求点ID，可为空',
  `question_type` enum('ambiguity','missing_rule','missing_boundary','missing_exception','inconsistent_description','unclear_role','unclear_data','other') NOT NULL DEFAULT 'other' COMMENT '疑问类型：歧义、规则缺失、边界缺失、异常缺失、前后不一致、角色不清、数据不清、其他',
  `question_content` text NOT NULL COMMENT '疑问内容，展示给用户或产品经理确认',
  `source_text` text DEFAULT NULL COMMENT '触发该疑问的原文片段',
  `severity` enum('critical','major','minor','info') NOT NULL DEFAULT 'major' COMMENT '严重级别：严重、主要、轻微、提示',
  `status` enum('open','answered','ignored','resolved') NOT NULL DEFAULT 'open' COMMENT '处理状态：待处理、已回答、已忽略、已解决',
  `answer_content` text DEFAULT NULL COMMENT '用户或产品经理补充的回答内容',
  `answered_by` int(11) DEFAULT NULL COMMENT '回答人ID，关联Auto_Users.id',
  `answered_at` datetime DEFAULT NULL COMMENT '回答时间',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_ai_req_question_task_status` (`task_id`,`status`),
  KEY `idx_ai_req_question_item` (`requirement_item_id`),
  KEY `idx_ai_req_question_answered_by` (`answered_by`),
  CONSTRAINT `fk_ai_req_question_task` FOREIGN KEY (`task_id`) REFERENCES `Auto_AiRequirementParseTasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ai_req_question_item` FOREIGN KEY (`requirement_item_id`) REFERENCES `Auto_AiRequirementItems` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ai_req_question_answered_by` FOREIGN KEY (`answered_by`) REFERENCES `Auto_Users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台需求疑问表';

-- -----------------------------------------------------------------------------
-- 11. 风险提示表
-- -----------------------------------------------------------------------------
-- 用途：保存AI识别出的业务、测试、集成、性能、安全等风险。
-- 页面映射：右侧「风险提示」。
-- 说明：requirement_item_id 可为空，表示风险是全局性的或跨多个需求点。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Auto_AiRequirementRisks` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '风险提示ID',
  `task_id` int(11) NOT NULL COMMENT '关联需求解析任务ID',
  `requirement_item_id` int(11) DEFAULT NULL COMMENT '关联需求点ID，可为空',
  `risk_type` enum('business_rule_missing','boundary_missing','data_dependency','integration_risk','performance_risk','security_risk','testability_risk','compliance_risk','other') NOT NULL DEFAULT 'other' COMMENT '风险类型：业务规则缺失、边界缺失、数据依赖、集成、性能、安全、可测试性、合规、其他',
  `risk_title` varchar(255) DEFAULT NULL COMMENT '风险标题',
  `risk_description` text NOT NULL COMMENT '风险描述，说明为什么存在该风险',
  `severity` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium' COMMENT '风险级别：严重、高、中、低',
  `possibility` enum('high','medium','low','unknown') NOT NULL DEFAULT 'unknown' COMMENT '发生可能性：高、中、低、未知',
  `suggestion` text DEFAULT NULL COMMENT '风险处理建议或补充确认建议',
  `status` enum('open','accepted','ignored','resolved') NOT NULL DEFAULT 'open' COMMENT '处理状态：待处理、已接受、已忽略、已解决',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_ai_req_risk_task_status` (`task_id`,`status`),
  KEY `idx_ai_req_risk_item` (`requirement_item_id`),
  KEY `idx_ai_req_risk_severity` (`severity`),
  CONSTRAINT `fk_ai_req_risk_task` FOREIGN KEY (`task_id`) REFERENCES `Auto_AiRequirementParseTasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ai_req_risk_item` FOREIGN KEY (`requirement_item_id`) REFERENCES `Auto_AiRequirementItems` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台需求风险提示表';

-- -----------------------------------------------------------------------------
-- 12. 测试点建议表
-- -----------------------------------------------------------------------------
-- 用途：保存AI根据需求点生成的测试点建议，可作为后续测试点/用例生成入口。
-- 页面映射：下一步操作中的「生成测试点」，以及解析配置中的「生成测试点建议」。
-- 说明：状态 converted 表示已转换为正式测试点/用例或已同步到工作台。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Auto_AiRequirementTestPointSuggestions` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '测试点建议ID',
  `task_id` int(11) NOT NULL COMMENT '关联需求解析任务ID',
  `module_id` int(11) DEFAULT NULL COMMENT '关联功能模块ID，可为空',
  `requirement_item_id` int(11) DEFAULT NULL COMMENT '关联需求点ID，可为空',
  `test_point_key` varchar(64) NOT NULL COMMENT '测试点建议稳定唯一键，便于前端拖拽、确认和转换',
  `test_point_title` varchar(255) NOT NULL COMMENT '测试点标题',
  `test_point_description` text DEFAULT NULL COMMENT '测试点描述',
  `test_type` enum('positive','negative','boundary','exception','compatibility','performance','security','other') NOT NULL DEFAULT 'positive' COMMENT '测试类型：正向、反向、边界、异常、兼容、性能、安全、其他',
  `priority` enum('P0','P1','P2','P3','P4') NOT NULL DEFAULT 'P1' COMMENT '测试点优先级',
  `precondition` text DEFAULT NULL COMMENT '前置条件',
  `expected_result` text DEFAULT NULL COMMENT '预期结果',
  `generated_by_ai` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否AI生成：1是，0人工新增',
  `status` enum('draft','confirmed','discarded','converted') NOT NULL DEFAULT 'draft' COMMENT '状态：草稿、已确认、已丢弃、已转换',
  `converted_workspace_id` int(11) DEFAULT NULL COMMENT '转换后关联的AI用例工作台ID，可为空',
  `converted_node_id` varchar(64) DEFAULT NULL COMMENT '转换后工作台节点ID，可为空',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_ai_req_test_point_key` (`task_id`,`test_point_key`),
  KEY `idx_ai_req_test_point_task_status` (`task_id`,`status`),
  KEY `idx_ai_req_test_point_module` (`module_id`),
  KEY `idx_ai_req_test_point_item` (`requirement_item_id`),
  KEY `idx_ai_req_test_point_workspace` (`converted_workspace_id`),
  CONSTRAINT `fk_ai_req_test_point_task` FOREIGN KEY (`task_id`) REFERENCES `Auto_AiRequirementParseTasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ai_req_test_point_module` FOREIGN KEY (`module_id`) REFERENCES `Auto_AiRequirementModules` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ai_req_test_point_item` FOREIGN KEY (`requirement_item_id`) REFERENCES `Auto_AiRequirementItems` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ai_req_test_point_workspace` FOREIGN KEY (`converted_workspace_id`) REFERENCES `Auto_AiCaseWorkspaces` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台需求测试点建议表';

-- -----------------------------------------------------------------------------
-- 13. AI模型调用日志表
-- -----------------------------------------------------------------------------
-- 用途：记录每次AI调用的输入、输出、耗时、Token和错误，便于问题排查、成本统计、Prompt优化。
-- 说明：prompt_text 和 response_text 可能包含敏感需求内容，生产环境可按合规要求做脱敏或冷热分层存储。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Auto_AiRequirementModelCallLogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'AI模型调用日志ID',
  `task_id` int(11) NOT NULL COMMENT '关联需求解析任务ID',
  `stage_code` enum('input','cleaning','structuring','test_point_generation') DEFAULT NULL COMMENT '调用所属阶段',
  `model_name` varchar(128) DEFAULT NULL COMMENT 'AI模型名称',
  `prompt_version` varchar(64) DEFAULT NULL COMMENT 'Prompt版本号',
  `prompt_text` longtext DEFAULT NULL COMMENT '发送给模型的Prompt文本，可能包含需求内容',
  `response_text` longtext DEFAULT NULL COMMENT '模型原始返回文本，便于回放和排错',
  `request_tokens` int(11) NOT NULL DEFAULT 0 COMMENT '请求Token数量',
  `response_tokens` int(11) NOT NULL DEFAULT 0 COMMENT '响应Token数量',
  `total_tokens` int(11) NOT NULL DEFAULT 0 COMMENT '总Token数量',
  `latency_ms` int(11) DEFAULT NULL COMMENT '模型调用耗时，单位毫秒',
  `status` enum('success','failed','timeout','cancelled') NOT NULL COMMENT '调用状态：成功、失败、超时、已取消',
  `error_message` text DEFAULT NULL COMMENT '调用失败或超时的错误信息',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_ai_req_model_call_task` (`task_id`),
  KEY `idx_ai_req_model_call_stage` (`stage_code`),
  KEY `idx_ai_req_model_call_status` (`status`),
  KEY `idx_ai_req_model_call_created_at` (`created_at`),
  CONSTRAINT `fk_ai_req_model_call_task` FOREIGN KEY (`task_id`) REFERENCES `Auto_AiRequirementParseTasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台需求解析AI模型调用日志表';

-- -----------------------------------------------------------------------------
-- 14. 初始化清洗规则字典数据
-- -----------------------------------------------------------------------------
-- 说明：使用 ON DUPLICATE KEY UPDATE 保证脚本可重复执行；如生产环境由后台管理维护，可删除本段初始化数据。
-- -----------------------------------------------------------------------------
INSERT INTO `Auto_AiRequirementCleaningRules` (`rule_code`, `rule_name`, `description`, `enabled_by_default`, `sort_order`, `is_active`)
VALUES
  ('remove_empty_lines', '删除空行', '移除连续空白行，减少无效上下文', 1, 10, 1),
  ('trim_extra_spaces', '删除多余空格', '合并半角/全角多余空格，保留必要分隔', 1, 20, 1),
  ('remove_invisible_chars', '删除不可见字符', '清除零宽字符、BOM等不可见字符，避免模型误解析', 1, 30, 1),
  ('merge_abnormal_line_breaks', '合并异常换行', '修复句内异常断行，提高语义连续性', 1, 40, 1),
  ('preserve_markdown_tables', '保留Markdown表格', '清洗时保护Markdown表格结构，避免破坏字段说明', 1, 50, 1)
ON DUPLICATE KEY UPDATE
  `rule_name` = VALUES(`rule_name`),
  `description` = VALUES(`description`),
  `enabled_by_default` = VALUES(`enabled_by_default`),
  `sort_order` = VALUES(`sort_order`),
  `is_active` = VALUES(`is_active`),
  `updated_at` = current_timestamp();

SET FOREIGN_KEY_CHECKS = 1;
