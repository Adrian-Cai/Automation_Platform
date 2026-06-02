import type { RequirementModule, RequirementQuestion, RiskPoint, TestPoint, TestPointType, Priority, GeneratedFilter } from "./types";

export const modules: RequirementModule[] = [
  { id: "module-1", name: "用户登录认证", description: "覆盖账号密码登录、验证码校验、会话续期与登录失败锁定策略。", type: "核心流程" },
  { id: "module-2", name: "需求导入解析", description: "支持文本、文档与接口需求导入，提取结构化业务规则和验收标准。", type: "业务支撑" },
  { id: "module-3", name: "AI 测试点抽取", description: "根据需求语义识别测试范围、边界条件、异常路径和覆盖缺口。", type: "数据服务" },
  { id: "module-4", name: "用例生成编排", description: "将确认后的测试点转换为可编辑、可追踪、可批量执行的测试用例。", type: "核心流程" },
  { id: "module-5", name: "风险与覆盖率评估", description: "统计高优先级风险、模块覆盖率、疑问闭环状态与质量趋势。", type: "数据服务" },
  { id: "module-6", name: "Jenkins 执行集成", description: "对接流水线执行入口、任务轮询、回调落库和报告跳转。", type: "系统集成" },
  { id: "module-7", name: "权限与审计", description: "限制敏感操作权限，记录需求分析、用例生成和批量删除审计日志。", type: "业务支撑" },
];

export const requirementQuestions: RequirementQuestion[] = [
  { id: "q-1", description: "验证码连续输错 5 次后是否需要冻结账号，冻结时间是否可配置？", module: "用户登录认证", riskLevel: "P0", status: "待确认" },
  { id: "q-2", description: "需求文档中表格合并单元格解析失败时是否允许部分导入？", module: "需求导入解析", riskLevel: "P1", status: "待确认" },
  { id: "q-3", description: "AI 生成的测试点是否需要人工确认后才能进入用例生成？", module: "AI 测试点抽取", riskLevel: "P0", status: "已确认" },
  { id: "q-4", description: "批量生成用例时同一测试点重复触发是否覆盖已有用例？", module: "用例生成编排", riskLevel: "P1", status: "待确认" },
  { id: "q-5", description: "覆盖率统计是否排除当前日期未完成同步的数据？", module: "风险与覆盖率评估", riskLevel: "P2", status: "待确认" },
  { id: "q-6", description: "Jenkins 回调失败后平台是否主动补偿查询构建结果？", module: "Jenkins 执行集成", riskLevel: "P0", status: "待确认" },
  { id: "q-7", description: "普通测试人员是否可以删除已生成用例的测试点？", module: "权限与审计", riskLevel: "P1", status: "待确认" },
  { id: "q-8", description: "需求变更后历史测试点是否保留版本快照？", module: "需求导入解析", riskLevel: "P2", status: "已忽略" },
  { id: "q-9", description: "低置信度测试点是否需要单独标记并支持二次分析？", module: "AI 测试点抽取", riskLevel: "P1", status: "待确认" },
];

export const risks: RiskPoint[] = [
  { id: "risk-1", level: "P0", title: "登录安全策略不明确", description: "冻结策略、验证码重试和会话失效规则不清晰可能导致安全绕过。", module: "用户登录认证", suggestion: "增加异常登录、安全边界和会话超时测试。" },
  { id: "risk-2", level: "P1", title: "复杂需求格式解析不稳定", description: "合并单元格、图片说明和嵌套列表可能造成需求遗漏。", module: "需求导入解析", suggestion: "使用多格式样本进行兼容性与降级策略测试。" },
  { id: "risk-3", level: "P0", title: "AI 抽取结果未经确认直接流转", description: "未经人工确认的测试点可能引入错误用例并影响后续执行。", module: "AI 测试点抽取", suggestion: "验证确认门禁、批量确认和权限控制。" },
  { id: "risk-4", level: "P1", title: "用例重复生成", description: "重复点击或批量操作可能导致同一测试点生成多份重复用例。", module: "用例生成编排", suggestion: "增加幂等、去重和并发点击测试。" },
  { id: "risk-5", level: "P2", title: "统计口径偏差", description: "当前日期数据同步未完成时纳入统计会影响覆盖率判断。", module: "风险与覆盖率评估", suggestion: "验证 T-1 统计规则和空数据展示。" },
  { id: "risk-6", level: "P1", title: "流水线状态不同步", description: "Jenkins 回调延迟或失败时平台状态可能长时间停留在执行中。", module: "Jenkins 执行集成", suggestion: "覆盖回调失败、轮询补偿和超时终止场景。" },
];

export const testPoints: TestPoint[] = [
  { id: "tp-001", code: "TP-001", module: "用户登录认证", description: "验证正确账号密码和有效验证码可成功登录并进入工作台。", type: "功能测试", priority: "P0", generated: true, caseCount: 3, relatedRisk: "登录安全策略不明确", remark: "需覆盖 PC 和移动端登录入口。" },
  { id: "tp-002", code: "TP-002", module: "用户登录认证", description: "验证密码连续输错达到阈值后的锁定提示与解锁策略。", type: "安全测试", priority: "P0", generated: false, caseCount: 0, relatedRisk: "登录安全策略不明确", remark: "等待产品确认冻结时长。" },
  { id: "tp-003", code: "TP-003", module: "需求导入解析", description: "验证上传包含表格、标题层级和编号列表的需求文档后可正确结构化解析。", type: "功能测试", priority: "P1", generated: true, caseCount: 2, relatedRisk: "复杂需求格式解析不稳定", remark: "样例文档应包含中文编号。" },
  { id: "tp-004", code: "TP-004", module: "需求导入解析", description: "验证不支持格式文件导入时展示友好错误并保留当前编辑内容。", type: "异常测试", priority: "P1", generated: false, caseCount: 0, relatedRisk: "复杂需求格式解析不稳定", remark: "关注错误提示是否可操作。" },
  { id: "tp-005", code: "TP-005", module: "AI 测试点抽取", description: "验证 AI 可从核心业务规则中抽取功能、边界、异常三类测试点。", type: "功能测试", priority: "P0", generated: true, caseCount: 4, relatedRisk: "AI 抽取结果未经确认直接流转", remark: "需记录抽取置信度。" },
  { id: "tp-006", code: "TP-006", module: "用例生成编排", description: "验证同一测试点重复点击生成用例时不会产生重复用例。", type: "接口测试", priority: "P1", generated: false, caseCount: 0, relatedRisk: "用例重复生成", remark: "建议模拟并发请求。" },
  { id: "tp-007", code: "TP-007", module: "风险与覆盖率评估", description: "验证覆盖率统计按 T-1 规则排除当前日期未完成同步数据。", type: "边界测试", priority: "P2", generated: true, caseCount: 1, relatedRisk: "统计口径偏差", remark: "统计口径需与报表一致。" },
  { id: "tp-008", code: "TP-008", module: "Jenkins 执行集成", description: "验证 Jenkins 回调超时后平台按 3 秒间隔轮询并最终同步结果。", type: "接口测试", priority: "P1", generated: false, caseCount: 0, relatedRisk: "流水线状态不同步", remark: "注意避免阻塞 UI。" },
  { id: "tp-009", code: "TP-009", module: "权限与审计", description: "验证无删除权限用户无法批量删除测试点且生成审计记录。", type: "安全测试", priority: "P1", generated: false, caseCount: 0, relatedRisk: "", remark: "需联动角色权限配置。" },
  { id: "tp-010", code: "TP-010", module: "用例生成编排", description: "验证批量生成用例后每个选中测试点均更新生成状态和用例数量。", type: "功能测试", priority: "P0", generated: true, caseCount: 2, relatedRisk: "用例重复生成", remark: "批量操作后需刷新选择状态。" },
];

export const moduleOptions = modules.map((item) => item.name);
export const testTypeOptions: TestPointType[] = ["功能测试", "接口测试", "边界测试", "异常测试", "性能测试", "安全测试"];
export const priorityOptions: Priority[] = ["P0", "P1", "P2"];
export const generatedOptions: GeneratedFilter[] = ["全部", "已生成", "未生成"];
