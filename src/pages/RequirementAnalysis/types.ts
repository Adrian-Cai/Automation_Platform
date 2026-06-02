export type ModuleType = "核心流程" | "业务支撑" | "数据服务" | "系统集成";

export interface RequirementModule {
  id: string;
  name: string;
  description: string;
  type: ModuleType;
}

export type QuestionStatus = "待确认" | "已确认" | "已忽略";
export type RiskLevel = "P0" | "P1" | "P2";
export type TestPointType = "功能测试" | "接口测试" | "边界测试" | "异常测试" | "性能测试" | "安全测试";
export type Priority = "P0" | "P1" | "P2";
export type GeneratedFilter = "全部" | "已生成" | "未生成";

export interface RequirementQuestion {
  id: string;
  description: string;
  module: string;
  riskLevel: RiskLevel;
  status: QuestionStatus;
}

export interface RiskPoint {
  id: string;
  level: RiskLevel;
  title: string;
  description: string;
  module: string;
  suggestion: string;
}

export interface TestPoint {
  id: string;
  code: string;
  module: string;
  description: string;
  type: TestPointType;
  priority: Priority;
  generated: boolean;
  caseCount: number;
  relatedRisk?: string;
  remark?: string;
}

export interface TestPointFilters {
  module: string;
  type: string;
  priority: string;
  generated: GeneratedFilter;
  keyword: string;
}

export interface TestPointFormValues {
  module: string;
  description: string;
  type: TestPointType | "";
  priority: Priority | "";
  relatedRisk: string;
  generated: boolean;
  remark: string;
}
