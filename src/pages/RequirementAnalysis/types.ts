export type ModuleStatus = 'analyzed' | 'pending' | 'confirmed';
export type ModuleComplexity = 'low' | 'medium' | 'high';
export type QuestionPriority = 'low' | 'medium' | 'high';
export type QuestionStatus = 'open' | 'answered' | 'ignored';
export type RiskLevel = 'low' | 'medium' | 'high';
export type RiskCategory = 'business' | 'technical' | 'data' | 'integration' | 'security';
export type TestPointPriority = 'P0' | 'P1' | 'P2';
export type TestPointStatus = 'draft' | 'generated' | 'confirmed';
export type TestPointType = 'functional' | 'boundary' | 'exception' | 'compatibility' | 'security';
export type TestPointModalMode = 'create' | 'edit' | 'generate';

export interface RequirementModule {
  id: string;
  name: string;
  owner: string;
  description: string;
  coverage: number;
  testPointCount: number;
  questionCount: number;
  riskCount: number;
  status: ModuleStatus;
  complexity: ModuleComplexity;
  tags: string[];
}

export interface RequirementQuestion {
  id: string;
  moduleId: string;
  title: string;
  detail: string;
  priority: QuestionPriority;
  status: QuestionStatus;
  assignee: string;
  suggestion: string;
}

export interface RequirementRisk {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  level: RiskLevel;
  category: RiskCategory;
  mitigation: string;
}

export interface TestPoint {
  id: string;
  moduleId: string;
  title: string;
  precondition: string;
  steps: string[];
  expectedResult: string;
  priority: TestPointPriority;
  type: TestPointType;
  status: TestPointStatus;
  relatedRiskIds: string[];
  source: string;
}

export interface RequirementAnalysisFilters {
  moduleId: string;
  keyword: string;
  priority: TestPointPriority | 'all';
  status: TestPointStatus | 'all';
  riskLevel: RiskLevel | 'all';
}

export interface TestPointFormValues {
  moduleId: string;
  title: string;
  precondition: string;
  stepsText: string;
  expectedResult: string;
  priority: TestPointPriority;
  type: TestPointType;
  source: string;
}

export interface SummaryMetric {
  label: string;
  value: string;
  description: string;
  trend: string;
}
