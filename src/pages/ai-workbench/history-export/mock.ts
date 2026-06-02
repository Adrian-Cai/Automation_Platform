import { BarChart3, ClipboardCheck, FileJson, FileSpreadsheet, FileText, GitCompareArrows, ShieldCheck, TrendingUp } from 'lucide-react';

import type { ExportFormatOption, HistoryRecord, RecentExport, StatItem, VersionRecord } from './types';

export const statItems: StatItem[] = [
  { id: 'generated', label: '累计生成记录', value: '248', trend: '较上周 +12.5%', icon: ClipboardCheck },
  { id: 'cases', label: '累计用例数', value: '8,642', trend: '本月新增 1,280 条', icon: BarChart3 },
  { id: 'exports', label: '导出任务', value: '136', trend: '成功率 99.2%', icon: FileSpreadsheet },
  { id: 'coverage', label: '平均覆盖率', value: '94.8%', trend: '稳定提升 3.1%', icon: ShieldCheck },
];

export const historyRecords: HistoryRecord[] = [
  { id: 'HIS-20260601-001', time: '2026-06-01 17:30', projectName: '示例项目', requirementName: '订单结算流程优化', generatedContent: '接口用例 / 异常场景 / 回归套件', caseCount: 128, status: 'success', owner: '张伟', duration: '2 分 18 秒', coverage: '96%' },
  { id: 'HIS-20260531-014', time: '2026-05-31 15:12', projectName: '示例项目', requirementName: '会员权益配置后台', generatedContent: '功能用例 / 权限校验 / 边界值', caseCount: 86, status: 'processing', owner: '李娜', duration: '生成中', coverage: '91%' },
  { id: 'HIS-20260530-009', time: '2026-05-30 10:45', projectName: '支付中台', requirementName: '支付渠道路由策略', generatedContent: '接口用例 / 幂等验证 / 监控校验', caseCount: 142, status: 'success', owner: '王强', duration: '3 分 02 秒', coverage: '98%' },
  { id: 'HIS-20260529-021', time: '2026-05-29 19:04', projectName: '营销平台', requirementName: '优惠券批量发放', generatedContent: '批处理用例 / 风控规则 / 数据核对', caseCount: 74, status: 'failed', owner: '陈晨', duration: '58 秒', coverage: '73%' },
  { id: 'HIS-20260528-018', time: '2026-05-28 14:26', projectName: '开放平台', requirementName: '开放 API 鉴权升级', generatedContent: '安全用例 / 签名校验 / 兼容性', caseCount: 118, status: 'success', owner: '周敏', duration: '2 分 46 秒', coverage: '95%' },
  { id: 'HIS-20260527-016', time: '2026-05-27 11:18', projectName: '示例项目', requirementName: '客服工单智能分派', generatedContent: '流程用例 / SLA 校验 / 异常兜底', caseCount: 92, status: 'success', owner: '张伟', duration: '2 分 05 秒', coverage: '93%' },
  { id: 'HIS-20260526-011', time: '2026-05-26 16:50', projectName: '数据资产', requirementName: '指标血缘追踪', generatedContent: '数据校验 / 权限矩阵 / 审计日志', caseCount: 64, status: 'processing', owner: '赵磊', duration: '生成中', coverage: '89%' },
  { id: 'HIS-20260525-007', time: '2026-05-25 09:36', projectName: '移动端 App', requirementName: '登录态续期策略', generatedContent: '端到端用例 / 弱网场景 / 安全校验', caseCount: 105, status: 'success', owner: '孙悦', duration: '2 分 31 秒', coverage: '97%' },
];

export const versionRecords: VersionRecord[] = [
  { id: 'VER-12', version: 'V1.2', title: '补充异常断言与自动化脚本映射', time: '2026-06-01 17:30', author: '张伟', summary: '当前版本：新增支付失败、库存回滚、重试补偿等高优先级用例。', isCurrent: true },
  { id: 'VER-11', version: 'V1.1', title: '完善核心链路与权限边界', time: '2026-05-30 18:20', author: '李娜', summary: '根据评审意见补充管理员、普通用户、访客三类权限矩阵。', isCurrent: false },
  { id: 'VER-10', version: 'V1.0', title: '首次生成需求测试用例集', time: '2026-05-28 10:00', author: 'AI Copilot', summary: '基于需求原文生成冒烟、功能、接口、异常与回归用例。', isCurrent: false },
];

export const exportFormats: ExportFormatOption[] = [
  { format: 'Excel', title: '导出 Excel', description: '适合导入测试管理平台，包含步骤、预期与优先级。', icon: FileSpreadsheet },
  { format: 'Markdown', title: '导出 Markdown', description: '适合评审纪要、知识库和研发协作文档沉淀。', icon: FileText },
  { format: 'JSON', title: '导出 JSON', description: '适合自动化流水线、接口平台和二次开发消费。', icon: FileJson },
  { format: 'PDF', title: '导出 PDF', description: '适合归档、外部审阅和测试交付报告输出。', icon: TrendingUp },
];

export const recentExports: RecentExport[] = [
  { id: 'EXP-001', fileName: '订单结算流程优化_用例集.xlsx', format: 'Excel', time: '2026-06-01 17:42', size: '2.4 MB', status: '完成' },
  { id: 'EXP-002', fileName: '会员权益配置后台_评审版.md', format: 'Markdown', time: '2026-05-31 15:40', size: '486 KB', status: '完成' },
  { id: 'EXP-003', fileName: '支付渠道路由策略_cases.json', format: 'JSON', time: '2026-05-30 11:04', size: '918 KB', status: '完成' },
  { id: 'EXP-004', fileName: '开放API鉴权升级_交付报告.pdf', format: 'PDF', time: '2026-05-28 16:02', size: '5.8 MB', status: '处理中' },
];

export const diffSummary = [
  { label: '新增用例', value: '28 条', tone: 'text-emerald-600 bg-emerald-50' },
  { label: '删除用例', value: '6 条', tone: 'text-rose-600 bg-rose-50' },
  { label: '变更模块', value: '3 个', tone: 'text-blue-600 bg-blue-50' },
];

export const timelineIcon = GitCompareArrows;
