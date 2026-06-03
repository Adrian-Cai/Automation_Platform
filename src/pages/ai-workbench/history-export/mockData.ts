import { Clock3, Download, FileJson, FileSpreadsheet, FileText, History, Settings2, Braces, FileType2 } from 'lucide-react';

import type { ExportOption, HistoryRecord, RecentExportRecord, StatItem, VersionRecord } from './types';

export const tabs = [
  { key: 'generation', label: '生成历史' },
  { key: 'versions', label: '版本记录' },
  { key: 'exports', label: '导出中心' },
] as const;

export const stats: StatItem[] = [
  {
    title: '历史需求数',
    value: '248',
    trend: '↑ 18% 较上周',
    icon: FileText,
    iconClassName: 'bg-blue-600 text-white',
  },
  {
    title: '历史版本数',
    value: '532',
    trend: '↑ 22% 较上周',
    icon: Settings2,
    iconClassName: 'bg-teal-500 text-white',
  },
  {
    title: '导出总次数',
    value: '1,256',
    trend: '↑ 15% 较上周',
    icon: Download,
    iconClassName: 'bg-orange-500 text-white',
  },
  {
    title: '最近导出时间',
    value: '2024-05-20 14:30',
    description: '2 小时前',
    icon: Clock3,
    iconClassName: 'bg-violet-500 text-white',
  },
];

export const historyRecords: HistoryRecord[] = [
  { id: 'H-20240520-1430', time: '2024-05-20 14:30', projectName: '电商平台 3.0 版本', requirementName: '用户下单流程需求文档 v2.1', content: '测试用例（完整）', caseCount: 128, status: '已完成' },
  { id: 'H-20240520-1015', time: '2024-05-20 10:15', projectName: '金融风控系统', requirementName: '风控规则引擎需求说明书', content: '测试用例（核心场景）', caseCount: 86, status: '已完成' },
  { id: 'H-20240519-1645', time: '2024-05-19 16:45', projectName: '用户中心系统', requirementName: '用户信息管理需求文档', content: '测试用例（完整）', caseCount: 96, status: '已完成' },
  { id: 'H-20240519-1120', time: '2024-05-19 11:20', projectName: '内容运营平台', requirementName: '内容发布与审核需求说明', content: '测试用例（边界场景）', caseCount: 72, status: '部分完成' },
  { id: 'H-20240518-0930', time: '2024-05-18 09:30', projectName: '供应链管理系统', requirementName: '采购管理模块需求文档', content: '测试用例（完整）', caseCount: 110, status: '已完成' },
  { id: 'H-20240517-1540', time: '2024-05-17 15:40', projectName: 'BI 数据分析平台', requirementName: '报表生成需求说明书', content: '测试用例（核心场景）', caseCount: 64, status: '已完成' },
  { id: 'H-20240516-1420', time: '2024-05-16 14:20', projectName: '移动端 App 5.2', requirementName: '登录与注册需求文档', content: '测试用例（完整）', caseCount: 48, status: '已完成' },
  { id: 'H-20240515-1005', time: '2024-05-15 10:05', projectName: '支付网关系统', requirementName: '支付流程需求说明', content: '测试用例（边界场景）', caseCount: 92, status: '生成失败' },
];

export const versions: VersionRecord[] = [
  { version: 'V1.2', isCurrent: true, time: '2024-05-20 14:30', addedCases: 28, deletedCases: 6, changedModules: 3 },
  { version: 'V1.1', time: '2024-05-20 10:15', addedCases: 16, deletedCases: 3, changedModules: 2 },
  { version: 'V1.0', time: '2024-05-19 16:45', addedCases: 0, deletedCases: 0, changedModules: 0 },
];

export const exportOptions: ExportOption[] = [
  { format: 'Excel', description: '导出为 Excel 文件，便于筛选与数据分析', buttonLabel: '导出 Excel', icon: FileSpreadsheet, iconClassName: 'text-emerald-600', iconBgClassName: 'bg-emerald-50' },
  { format: 'Markdown', description: '导出为 Markdown 格式，便于文档编写与版本管理', buttonLabel: '导出 Markdown', icon: FileType2, iconClassName: 'text-slate-600', iconBgClassName: 'bg-slate-100' },
  { format: 'JSON', description: '导出为 JSON 格式，便于集成与二次开发', buttonLabel: '导出 JSON', icon: Braces, iconClassName: 'text-violet-600', iconBgClassName: 'bg-violet-50' },
  { format: 'PDF', description: '导出为 PDF 文件，便于审阅与分享', buttonLabel: '导出 PDF', icon: FileJson, iconClassName: 'text-red-600', iconBgClassName: 'bg-red-50' },
];

export const recentExports: RecentExportRecord[] = [
  { id: 'E-001', fileName: '用户下单流程需求文档 v2.1', format: 'Excel', caseCount: 128, time: '2024-05-20 14:30', creator: '张伟' },
  { id: 'E-002', fileName: '风控规则引擎需求说明书', format: 'Markdown', caseCount: 86, time: '2024-05-20 10:15', creator: '张伟' },
  { id: 'E-003', fileName: '用户信息管理需求文档', format: 'PDF', caseCount: 96, time: '2024-05-19 16:45', creator: '张伟' },
  { id: 'E-004', fileName: '内容发布与审核需求说明', format: 'JSON', caseCount: 72, time: '2024-05-19 11:20', creator: '张伟' },
];

export const pageIcon = History;
