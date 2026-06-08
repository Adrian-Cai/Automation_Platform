import {
  Bot,
  Download,
  FileQuestion,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Flame,
  ListChecks,
  ScanSearch,
  Target,
  UploadCloud,
} from 'lucide-react';

import type { CapabilityItem, QuickStartStep, RecentProject, StatItem } from '@/pages/ai-workbench/home/types';

export const stats: StatItem[] = [
  { title: '本周需求数', value: '24', trend: '↑ 20% 较上周', icon: FileText, iconClassName: 'bg-blue-600 text-white' },
  { title: '测试点数', value: '532', trend: '↑ 18% 较上周', icon: Target, iconClassName: 'bg-teal-500 text-white' },
  { title: '生成用例数', value: '1,256', trend: '↑ 25% 较上周', icon: ListChecks, iconClassName: 'bg-violet-500 text-white' },
  { title: '导出次数', value: '68', trend: '↑ 13% 较上周', icon: Download, iconClassName: 'bg-orange-500 text-white' },
];

export const quickStartSteps: QuickStartStep[] = [
  {
    title: '上传需求',
    description: '支持 Word、PDF、TXT 等格式',
    icon: UploadCloud,
    path: '/ai-workbench/requirement-parse',
    ariaLabel: '跳转到需求解析',
  },
  {
    title: '智能解析',
    description: 'AI 解析需求内容，提取关键信息',
    icon: FileSearch,
    path: '/ai-workbench/test-points',
    ariaLabel: '跳转到测试点',
  },
  {
    title: '生成测试点',
    description: '识别测试点，覆盖功能与非功能需求',
    icon: Target,
    path: '/ai-workbench/use-case-generate',
    ariaLabel: '跳转到用例生成',
  },
  {
    title: '生成测试用例',
    description: 'AI 生成详细测试用例，支持编辑优化',
    icon: ListChecks,
    path: '/ai-workbench/use-case-generate',
    ariaLabel: '跳转到用例生成',
  },
  {
    title: '导出 Excel',
    description: '一键导出测试用例，便于执行与管理',
    icon: FileSpreadsheet,
    path: '/ai-workbench/export-records',
    ariaLabel: '跳转到导出记录',
  },
];

export const recentProjects: RecentProject[] = [
  { projectName: '电商平台 3.0 版本', requirementName: '用户下单流程需求文档 v2.1', status: '用例生成中', updatedAt: '2024-05-20 14:30' },
  { projectName: '金融风控系统', requirementName: '风控规则引擎需求说明书', status: '已完成', updatedAt: '2024-05-20 10:15' },
  { projectName: '用户中心系统', requirementName: '用户信息管理需求文档', status: '解析完成', updatedAt: '2024-05-19 16:45' },
  { projectName: '内容管理平台', requirementName: '内容发布与审核需求说明', status: '测试点生成中', updatedAt: '2024-05-19 11:20' },
  { projectName: '供应链管理系统', requirementName: '采购管理模块需求文档', status: '已完成', updatedAt: '2024-05-18 09:30' },
];

export const capabilities: CapabilityItem[] = [
  { title: '文档上传', description: '多格式文档上传', icon: FileText, iconClassName: 'text-blue-600', iconWrapClassName: 'bg-blue-50' },
  { title: '文本清洗', description: '智能清洗与标准化', icon: ScanSearch, iconClassName: 'text-blue-600', iconWrapClassName: 'bg-blue-50' },
  { title: '需求疑问识别', description: '识别歧义与疑问点', icon: FileQuestion, iconClassName: 'text-violet-600', iconWrapClassName: 'bg-violet-50' },
  { title: '风险点识别', description: '识别潜在风险点', icon: Flame, iconClassName: 'text-orange-600', iconWrapClassName: 'bg-orange-50' },
  { title: '覆盖率分析', description: '多维度覆盖率分析', icon: Bot, iconClassName: 'text-blue-600', iconWrapClassName: 'bg-blue-50' },
  { title: 'Excel 导出', description: '一键导出用例', icon: FileSpreadsheet, iconClassName: 'text-emerald-600', iconWrapClassName: 'bg-emerald-50' },
];
