-- ============================================================
-- AI工作台-需求输入与解析 数据库建表脚本
-- 适用数据库：MySQL 8.x / MariaDB 10.6+
-- 字符集：utf8mb4
-- 说明：
--   1. 本脚本只负责“需求输入与解析”页面相关业务表设计。
--   2. 用户表复用系统现有 Auto_Users，不在本脚本中重复创建。
--   3. 所有业务主键采用 BIGINT AUTO_INCREMENT，便于与现有 Auto_* 表风格保持一致。
--   4. 状态类字段使用 VARCHAR 而非 ENUM，便于后续扩展状态值且减少线上变更成本。
--   5. AI 原始输入、清洗结果、Prompt、模型响应等大文本使用 LONGTEXT。
--   6. 结构化解析结果使用 JSON 字段，适合保存 AI 返回的可扩展结构。
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. 需求解析任务主表
-- 表名：AI_Requirement_Parse_Task
-- 用途：保存一次需求输入与解析任务，是当前页面的核心主表。
-- 页面映射：需求标题、产品线、优先级、原始需求文本、清洗后文本、解析进度、右侧统计摘要。
-- ============================================================
CREATE TABLE IF NOT EXISTS AI_Requirement_Parse_Task (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_no VARCHAR(64) NOT NULL COMMENT '任务编号，业务唯一标识，例如 REQ-PARSE-20260609-000001',
    title VARCHAR(255) NOT NULL COMMENT '需求标题，对应页面“需求标题”输入框',
    product_line VARCHAR(128) NULL COMMENT '产品线，对应页面“产品线”输入框',
    priority VARCHAR(20) NULL DEFAULT 'P1' COMMENT '需求优先级，例如 P0/P1/P2/P3',
    raw_text LONGTEXT NULL COMMENT '原始需求文本，来源于用户粘贴内容和附件提取内容合并结果',
    cleaned_text LONGTEXT NULL COMMENT '清洗后的需求文本，用于展示“内容清洗对比”的清洗后内容',
    status VARCHAR(32) NOT NULL DEFAULT 'draft' COMMENT '任务状态：draft草稿、pending待解析、running解析中、success成功、failed失败、cancelled取消',
    progress INT NOT NULL DEFAULT 0 COMMENT '整体解析进度，取值 0-100',
    current_stage VARCHAR(64) NULL COMMENT '当前解析阶段：input需求录入、cleaning文本清洗、structuring结构化解析、test_point_generation测试点生成',
    document_word_count INT NOT NULL DEFAULT 0 COMMENT '文档字数，对应右侧“文档字数”统计',
    module_count INT NOT NULL DEFAULT 0 COMMENT '识别模块数量，对应右侧“识别模块”统计',
    question_count INT NOT NULL DEFAULT 0 COMMENT '需求疑问数量，对应右侧“需求疑问”统计',
    risk_count INT NOT NULL DEFAULT 0 COMMENT '风险点数量，对应右侧“风险点”统计',
    created_by BIGINT NULL COMMENT '创建人ID，关联 Auto_Users.id',
    started_at DATETIME NULL COMMENT '开始解析时间',
    completed_at DATETIME NULL COMMENT '解析完成时间',
    error_message TEXT NULL COMMENT '解析失败时的错误信息，用于排障和前端友好提示',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_ai_req_parse_task_no (task_no),
    KEY idx_ai_req_parse_task_created_by (created_by),
    KEY idx_ai_req_parse_task_status (status),
    KEY idx_ai_req_parse_task_product_line (product_line),
    KEY idx_ai_req_parse_task_created_at (created_at),
    CONSTRAINT fk_ai_req_parse_task_created_by
        FOREIGN KEY (created_by) REFERENCES Auto_Users(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_ai_req_parse_task_progress
        CHECK (progress >= 0 AND progress <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台-需求输入与解析任务主表';

-- ============================================================
-- 2. 需求附件表
-- 表名：AI_Requirement_Attachment
-- 用途：保存上传文件元数据及文件内容提取结果。
-- 页面映射：左侧“上传需求附件”“已上传文件”。
-- ============================================================
CREATE TABLE IF NOT EXISTS AI_Requirement_Attachment (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '所属解析任务ID，关联 AI_Requirement_Parse_Task.id',
    original_file_name VARCHAR(255) NOT NULL COMMENT '用户上传时的原始文件名',
    file_type VARCHAR(64) NULL COMMENT '文件类型或扩展名，例如 txt、md、pdf、docx、xlsx',
    mime_type VARCHAR(128) NULL COMMENT '文件 MIME 类型',
    file_size BIGINT NOT NULL DEFAULT 0 COMMENT '文件大小，单位字节',
    storage_path VARCHAR(512) NOT NULL COMMENT '文件存储路径或对象存储 Key',
    file_hash VARCHAR(128) NULL COMMENT '文件哈希，用于去重和完整性校验',
    extracted_text LONGTEXT NULL COMMENT '从附件中提取出的纯文本内容',
    upload_status VARCHAR(32) NOT NULL DEFAULT 'uploaded' COMMENT '上传/解析状态：uploaded已上传、extracting提取中、extracted已提取、failed失败',
    extract_error TEXT NULL COMMENT '附件文本提取失败原因',
    created_by BIGINT NULL COMMENT '上传人ID，关联 Auto_Users.id',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    PRIMARY KEY (id),
    KEY idx_ai_req_attachment_task_id (task_id),
    KEY idx_ai_req_attachment_created_by (created_by),
    KEY idx_ai_req_attachment_file_hash (file_hash),
    CONSTRAINT fk_ai_req_attachment_task
        FOREIGN KEY (task_id) REFERENCES AI_Requirement_Parse_Task(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ai_req_attachment_created_by
        FOREIGN KEY (created_by) REFERENCES Auto_Users(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台-需求附件表';

-- ============================================================
-- 3. 清洗规则字典表
-- 表名：AI_Cleaning_Rule
-- 用途：维护可复用的文本清洗规则。
-- 页面映射：左侧“清洗规则”，如删除空行、删除多余空格、删除不可见字符等。
-- ============================================================
CREATE TABLE IF NOT EXISTS AI_Cleaning_Rule (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    code VARCHAR(64) NOT NULL COMMENT '规则编码，程序侧稳定引用，例如 remove_empty_lines',
    name VARCHAR(128) NOT NULL COMMENT '规则名称，对应页面展示文案',
    description VARCHAR(255) NULL COMMENT '规则说明，解释清洗逻辑',
    enabled_by_default TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否默认启用：1是、0否',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '页面展示排序，数值越小越靠前',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用该规则：1启用、0停用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_ai_cleaning_rule_code (code),
    KEY idx_ai_cleaning_rule_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台-文本清洗规则字典表';

-- ============================================================
-- 4. 任务清洗规则关联表
-- 表名：AI_Task_Cleaning_Rule
-- 用途：记录某个解析任务实际选择并应用了哪些清洗规则。
-- 页面映射：左侧“清洗规则”的勾选状态，以及“内容清洗对比”的清洗统计。
-- ============================================================
CREATE TABLE IF NOT EXISTS AI_Task_Cleaning_Rule (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '所属解析任务ID',
    rule_id BIGINT NOT NULL COMMENT '清洗规则ID',
    enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '当前任务是否启用该规则：1启用、0不启用',
    applied TINYINT(1) NOT NULL DEFAULT 0 COMMENT '该规则是否已经执行：1已执行、0未执行',
    before_line_count INT NULL COMMENT '执行该规则前的文本行数',
    after_line_count INT NULL COMMENT '执行该规则后的文本行数',
    affected_count INT NULL COMMENT '该规则影响的行数或字符数，便于展示清洗效果',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_ai_task_cleaning_rule (task_id, rule_id),
    KEY idx_ai_task_cleaning_rule_id (rule_id),
    CONSTRAINT fk_ai_task_cleaning_task
        FOREIGN KEY (task_id) REFERENCES AI_Requirement_Parse_Task(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ai_task_cleaning_rule
        FOREIGN KEY (rule_id) REFERENCES AI_Cleaning_Rule(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台-解析任务清洗规则关联表';

-- ============================================================
-- 5. 任务解析配置表
-- 表名：AI_Task_Parse_Config
-- 用途：保存单次解析任务的AI解析选项和模型参数。
-- 页面映射：顶部“解析配置”中的生成需求摘要、扫描歧义与风险、生成测试点建议。
-- ============================================================
CREATE TABLE IF NOT EXISTS AI_Task_Parse_Config (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '所属解析任务ID，一个任务对应一份解析配置',
    generate_summary TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否生成需求摘要：1是、0否',
    scan_ambiguity_risk TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否扫描歧义与风险：1是、0否',
    generate_test_points TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否生成测试点建议：1是、0否',
    model_name VARCHAR(128) NULL COMMENT 'AI模型名称，例如 gpt-4.1、deepseek、qwen 等',
    prompt_version VARCHAR(64) NULL COMMENT 'Prompt模板版本号，用于追溯解析效果',
    temperature DECIMAL(4,2) NULL COMMENT '模型温度参数，控制输出随机性',
    max_tokens INT NULL COMMENT '模型最大输出 Token 数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_ai_parse_config_task_id (task_id),
    CONSTRAINT fk_ai_parse_config_task
        FOREIGN KEY (task_id) REFERENCES AI_Requirement_Parse_Task(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台-需求解析配置表';

-- ============================================================
-- 6. 解析阶段日志表
-- 表名：AI_Parse_Stage_Log
-- 用途：记录解析流程每个阶段的执行状态和耗时，支持前端轮询展示进度。
-- 页面映射：中间“解析进度”：需求录入、文本清洗、结构化解析、测试点生成。
-- ============================================================
CREATE TABLE IF NOT EXISTS AI_Parse_Stage_Log (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '所属解析任务ID',
    stage_code VARCHAR(64) NOT NULL COMMENT '阶段编码：input、cleaning、structuring、test_point_generation',
    stage_name VARCHAR(128) NOT NULL COMMENT '阶段名称，例如 需求录入、文本清洗、结构化解析、测试点生成',
    status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT '阶段状态：pending待处理、running处理中、success成功、failed失败、skipped跳过',
    progress INT NOT NULL DEFAULT 0 COMMENT '阶段进度，取值 0-100',
    started_at DATETIME NULL COMMENT '阶段开始时间',
    completed_at DATETIME NULL COMMENT '阶段完成时间',
    duration_ms INT NULL COMMENT '阶段耗时，单位毫秒',
    error_message TEXT NULL COMMENT '阶段失败原因',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_ai_stage_log_task_stage (task_id, stage_code),
    KEY idx_ai_stage_log_task_id (task_id),
    KEY idx_ai_stage_log_status (status),
    CONSTRAINT fk_ai_stage_log_task
        FOREIGN KEY (task_id) REFERENCES AI_Requirement_Parse_Task(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_ai_stage_log_progress
        CHECK (progress >= 0 AND progress <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台-需求解析阶段日志表';

-- ============================================================
-- 7. 需求解析结果汇总表
-- 表名：AI_Requirement_Parse_Result
-- 用途：保存一次解析任务的整体结果摘要和完整结构化JSON。
-- 页面映射：解析报告、需求摘要、结构化解析输出。
-- ============================================================
CREATE TABLE IF NOT EXISTS AI_Requirement_Parse_Result (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '所属解析任务ID，一个任务最多一份汇总结果',
    summary TEXT NULL COMMENT '需求摘要，由AI生成',
    business_goal TEXT NULL COMMENT '业务目标，AI从需求中提炼',
    user_roles TEXT NULL COMMENT '涉及用户角色，例如运营人员、管理员、普通用户',
    scope_description TEXT NULL COMMENT '需求范围说明',
    out_of_scope TEXT NULL COMMENT '非需求范围或暂不支持内容',
    structured_json JSON NULL COMMENT '完整结构化解析结果，保存AI输出的模块、需求点、问题、风险等原始结构',
    ai_model VARCHAR(128) NULL COMMENT '生成该结果使用的AI模型',
    prompt_version VARCHAR(64) NULL COMMENT '生成该结果使用的Prompt版本',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_ai_parse_result_task_id (task_id),
    CONSTRAINT fk_ai_parse_result_task
        FOREIGN KEY (task_id) REFERENCES AI_Requirement_Parse_Task(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台-需求解析结果汇总表';

-- ============================================================
-- 8. 功能模块表
-- 表名：AI_Requirement_Module
-- 用途：保存AI识别出来的功能模块。
-- 页面映射：右侧“识别到的功能模块”。
-- ============================================================
CREATE TABLE IF NOT EXISTS AI_Requirement_Module (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '所属解析任务ID',
    module_name VARCHAR(255) NOT NULL COMMENT '功能模块名称，例如 优惠券规则、订单结算、权限管理',
    module_description TEXT NULL COMMENT '功能模块描述',
    business_priority VARCHAR(32) NULL COMMENT '业务优先级，例如 high、medium、low 或 P0/P1/P2',
    confidence_score DECIMAL(5,4) NULL COMMENT 'AI识别置信度，范围 0.0000-1.0000',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '页面展示顺序',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_ai_req_module_task_id (task_id),
    KEY idx_ai_req_module_sort (task_id, sort_order),
    CONSTRAINT fk_ai_req_module_task
        FOREIGN KEY (task_id) REFERENCES AI_Requirement_Parse_Task(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_ai_req_module_confidence
        CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台-需求功能模块表';

-- ============================================================
-- 9. 结构化需求条目表
-- 表名：AI_Requirement_Item
-- 用途：保存AI从原始文本中拆解出的具体需求点。
-- 页面映射：解析报告中的结构化需求，也作为需求疑问、风险、测试点建议的来源。
-- ============================================================
CREATE TABLE IF NOT EXISTS AI_Requirement_Item (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '所属解析任务ID',
    module_id BIGINT NULL COMMENT '所属功能模块ID，允许为空表示暂未归类',
    requirement_code VARCHAR(64) NULL COMMENT '需求点编号，例如 REQ-001',
    requirement_type VARCHAR(64) NULL COMMENT '需求类型：functional功能、non_functional非功能、constraint约束、business_rule业务规则',
    title VARCHAR(255) NULL COMMENT '需求点标题',
    description TEXT NULL COMMENT '需求点描述',
    acceptance_criteria TEXT NULL COMMENT '验收标准或完成条件',
    source_text TEXT NULL COMMENT '该需求点对应的来源原文片段，便于追溯AI结论',
    priority VARCHAR(32) NULL COMMENT '需求点优先级，例如 P0/P1/P2/P3',
    confidence_score DECIMAL(5,4) NULL COMMENT 'AI识别置信度，范围 0.0000-1.0000',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '模块内展示顺序',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_ai_req_item_task_id (task_id),
    KEY idx_ai_req_item_module_id (module_id),
    KEY idx_ai_req_item_code (task_id, requirement_code),
    CONSTRAINT fk_ai_req_item_task
        FOREIGN KEY (task_id) REFERENCES AI_Requirement_Parse_Task(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ai_req_item_module
        FOREIGN KEY (module_id) REFERENCES AI_Requirement_Module(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_ai_req_item_confidence
        CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台-结构化需求条目表';

-- ============================================================
-- 10. 需求疑问表
-- 表名：AI_Requirement_Question
-- 用途：保存AI识别出的需求疑问、歧义点、待补充信息。
-- 页面映射：右侧“需求疑问”。
-- ============================================================
CREATE TABLE IF NOT EXISTS AI_Requirement_Question (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '所属解析任务ID',
    requirement_item_id BIGINT NULL COMMENT '关联的结构化需求点ID，允许为空表示全局问题',
    question_type VARCHAR(64) NULL COMMENT '疑问类型：ambiguity表述歧义、missing_rule规则缺失、missing_boundary边界缺失、missing_exception异常缺失、inconsistent_description前后矛盾',
    question_content TEXT NOT NULL COMMENT '疑问内容，用于页面展示',
    source_text TEXT NULL COMMENT '触发该疑问的原文片段',
    severity VARCHAR(32) NULL COMMENT '严重程度：low低、medium中、high高、critical严重',
    status VARCHAR(32) NOT NULL DEFAULT 'open' COMMENT '处理状态：open待处理、answered已回答、ignored已忽略、resolved已解决',
    answer_content TEXT NULL COMMENT '用户或业务方补充的答复内容',
    answered_by BIGINT NULL COMMENT '回答人ID，关联 Auto_Users.id',
    answered_at DATETIME NULL COMMENT '回答时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_ai_req_question_task_id (task_id),
    KEY idx_ai_req_question_item_id (requirement_item_id),
    KEY idx_ai_req_question_status (status),
    KEY idx_ai_req_question_answered_by (answered_by),
    CONSTRAINT fk_ai_req_question_task
        FOREIGN KEY (task_id) REFERENCES AI_Requirement_Parse_Task(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ai_req_question_item
        FOREIGN KEY (requirement_item_id) REFERENCES AI_Requirement_Item(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_ai_req_question_answered_by
        FOREIGN KEY (answered_by) REFERENCES Auto_Users(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台-需求疑问表';

-- ============================================================
-- 11. 风险提示表
-- 表名：AI_Requirement_Risk
-- 用途：保存AI识别出的需求风险和处理建议。
-- 页面映射：右侧“风险提示”。
-- ============================================================
CREATE TABLE IF NOT EXISTS AI_Requirement_Risk (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '所属解析任务ID',
    requirement_item_id BIGINT NULL COMMENT '关联的结构化需求点ID，允许为空表示全局风险',
    risk_type VARCHAR(64) NULL COMMENT '风险类型：business_rule_missing业务规则缺失、boundary_missing边界缺失、data_dependency数据依赖、integration_risk集成风险、performance_risk性能风险、security_risk安全风险、testability_risk可测性风险',
    risk_title VARCHAR(255) NULL COMMENT '风险标题',
    risk_description TEXT NOT NULL COMMENT '风险描述，用于页面展示',
    severity VARCHAR(32) NULL COMMENT '风险等级：low低、medium中、high高、critical严重',
    possibility VARCHAR(32) NULL COMMENT '发生可能性：low低、medium中、high高',
    suggestion TEXT NULL COMMENT '风险处理建议',
    status VARCHAR(32) NOT NULL DEFAULT 'open' COMMENT '处理状态：open待处理、accepted已接受、ignored已忽略、resolved已解决',
    resolved_by BIGINT NULL COMMENT '处理人ID，关联 Auto_Users.id',
    resolved_at DATETIME NULL COMMENT '处理时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_ai_req_risk_task_id (task_id),
    KEY idx_ai_req_risk_item_id (requirement_item_id),
    KEY idx_ai_req_risk_status (status),
    KEY idx_ai_req_risk_severity (severity),
    KEY idx_ai_req_risk_resolved_by (resolved_by),
    CONSTRAINT fk_ai_req_risk_task
        FOREIGN KEY (task_id) REFERENCES AI_Requirement_Parse_Task(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ai_req_risk_item
        FOREIGN KEY (requirement_item_id) REFERENCES AI_Requirement_Item(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_ai_req_risk_resolved_by
        FOREIGN KEY (resolved_by) REFERENCES Auto_Users(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台-需求风险提示表';

-- ============================================================
-- 12. 测试点建议表
-- 表名：AI_Test_Point_Suggestion
-- 用途：保存AI根据需求点生成的测试点建议，后续可转换为正式测试点或测试用例。
-- 页面映射：顶部“生成测试点建议”配置，以及右下角“生成测试点”后续流程。
-- ============================================================
CREATE TABLE IF NOT EXISTS AI_Test_Point_Suggestion (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '所属解析任务ID',
    module_id BIGINT NULL COMMENT '所属功能模块ID，允许为空',
    requirement_item_id BIGINT NULL COMMENT '来源需求点ID，允许为空表示从全局需求生成',
    test_point_title VARCHAR(255) NOT NULL COMMENT '测试点标题',
    test_point_description TEXT NULL COMMENT '测试点描述',
    test_type VARCHAR(64) NULL COMMENT '测试类型：positive正向、negative反向、boundary边界、exception异常、compatibility兼容、performance性能、security安全',
    priority VARCHAR(32) NULL COMMENT '测试点优先级，例如 P0/P1/P2/P3',
    precondition TEXT NULL COMMENT '前置条件',
    test_steps TEXT NULL COMMENT '建议测试步骤',
    expected_result TEXT NULL COMMENT '预期结果',
    generated_by_ai TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否AI生成：1是、0人工新增',
    status VARCHAR(32) NOT NULL DEFAULT 'draft' COMMENT '状态：draft草稿、confirmed已确认、discarded已废弃、converted已转换为正式测试用例',
    converted_case_id BIGINT NULL COMMENT '转换后的正式测试用例ID，可关联 Auto_TestCase.id',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_ai_test_point_task_id (task_id),
    KEY idx_ai_test_point_module_id (module_id),
    KEY idx_ai_test_point_item_id (requirement_item_id),
    KEY idx_ai_test_point_status (status),
    KEY idx_ai_test_point_converted_case_id (converted_case_id),
    CONSTRAINT fk_ai_test_point_task
        FOREIGN KEY (task_id) REFERENCES AI_Requirement_Parse_Task(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ai_test_point_module
        FOREIGN KEY (module_id) REFERENCES AI_Requirement_Module(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_ai_test_point_item
        FOREIGN KEY (requirement_item_id) REFERENCES AI_Requirement_Item(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台-测试点建议表';

-- ============================================================
-- 13. AI模型调用日志表
-- 表名：AI_Model_Call_Log
-- 用途：记录每次AI调用的Prompt、响应、耗时和Token消耗，便于审计、排障、成本统计、Prompt优化。
-- 页面映射：不直接展示在当前页面，但支撑解析失败排查和解析报告追溯。
-- ============================================================
CREATE TABLE IF NOT EXISTS AI_Model_Call_Log (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT NOT NULL COMMENT '所属解析任务ID',
    stage_code VARCHAR(64) NULL COMMENT '调用所属阶段，例如 cleaning、structuring、test_point_generation',
    model_name VARCHAR(128) NULL COMMENT 'AI模型名称',
    prompt_version VARCHAR(64) NULL COMMENT 'Prompt模板版本号',
    prompt_text LONGTEXT NULL COMMENT '本次调用的完整Prompt文本，可能包含需求内容，需按安全策略控制访问',
    response_text LONGTEXT NULL COMMENT '模型原始响应文本',
    request_tokens INT NULL COMMENT '请求Token数',
    response_tokens INT NULL COMMENT '响应Token数',
    total_tokens INT NULL COMMENT '总Token数',
    latency_ms INT NULL COMMENT '调用耗时，单位毫秒',
    status VARCHAR(32) NOT NULL DEFAULT 'success' COMMENT '调用状态：success成功、failed失败、timeout超时',
    error_message TEXT NULL COMMENT '调用失败原因',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_ai_model_call_task_id (task_id),
    KEY idx_ai_model_call_stage (task_id, stage_code),
    KEY idx_ai_model_call_status (status),
    KEY idx_ai_model_call_created_at (created_at),
    CONSTRAINT fk_ai_model_call_task
        FOREIGN KEY (task_id) REFERENCES AI_Requirement_Parse_Task(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工作台-AI模型调用日志表';

-- ============================================================
-- 14. 默认清洗规则初始化数据
-- 说明：使用 ON DUPLICATE KEY UPDATE 保证脚本可重复执行。
-- ============================================================
INSERT INTO AI_Cleaning_Rule (code, name, description, enabled_by_default, sort_order, is_active)
VALUES
    ('remove_empty_lines', '删除空行', '移除连续空白行，减少无效文本噪音', 1, 10, 1),
    ('trim_extra_spaces', '删除多余空格', '合并连续半角/全角空格，保留必要分隔', 1, 20, 1),
    ('remove_invisible_chars', '删除不可见字符', '清除零宽字符、BOM 等不可见字符', 1, 30, 1),
    ('merge_abnormal_line_breaks', '合并异常换行', '修复句内异常断行，提升AI理解稳定性', 1, 40, 1),
    ('preserve_markdown_tables', '保留 Markdown 表格', '避免文本清洗破坏 Markdown 表格结构', 1, 50, 1)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    enabled_by_default = VALUES(enabled_by_default),
    sort_order = VALUES(sort_order),
    is_active = VALUES(is_active),
    updated_at = CURRENT_TIMESTAMP;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- ER关系摘要：
-- Auto_Users 1 - N AI_Requirement_Parse_Task
-- AI_Requirement_Parse_Task 1 - N AI_Requirement_Attachment
-- AI_Requirement_Parse_Task 1 - 1 AI_Task_Parse_Config
-- AI_Requirement_Parse_Task 1 - N AI_Task_Cleaning_Rule N - 1 AI_Cleaning_Rule
-- AI_Requirement_Parse_Task 1 - N AI_Parse_Stage_Log
-- AI_Requirement_Parse_Task 1 - 1 AI_Requirement_Parse_Result
-- AI_Requirement_Parse_Task 1 - N AI_Requirement_Module 1 - N AI_Requirement_Item
-- AI_Requirement_Item 1 - N AI_Requirement_Question
-- AI_Requirement_Item 1 - N AI_Requirement_Risk
-- AI_Requirement_Item 1 - N AI_Test_Point_Suggestion
-- AI_Requirement_Parse_Task 1 - N AI_Model_Call_Log
-- ============================================================
