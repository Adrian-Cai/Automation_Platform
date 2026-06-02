import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  ClipboardList,
  Download,
  Eye,
  FileQuestion,
  FileText,
  Home,
  Info,
  Loader2,
  Menu,
  MoreVertical,
  Search,
  Settings,
  ShieldAlert,
  Target,
  Upload,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { computeProgress } from '@/lib/aiCaseMindMap';
import { listAllWorkspaceDocuments } from '@/lib/aiCaseStorage';
import type { AiCaseNode, AiCaseProgress, AiCaseWorkspaceDocument } from '@/types/aiCases';
import { NewRequirementSheet } from './components/NewRequirementSheet';

interface DashboardMetric {
  label: string;
  value: string;
  delta: string;
  icon: typeof FileText;
  gradient: string;
}

interface AbilityCard {
  title: string;
  description: string;
  icon: typeof FileText;
  tone: string;
  onClick: () => void;
}

interface QuickStep {
  title: string;
  description: string;
  icon: typeof FileText;
  onClick: () => void;
}

interface ProjectRow {
  id: string;
  projectName: string;
  requirementName: string;
  statusLabel: string;
  statusClassName: string;
  updatedAt: string;
}

interface CoverageDataPoint {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

const NAV_ITEMS = [
  { label: '工作台总览', icon: Home, active: true },
  { label: '需求输入与解析', icon: ClipboardList },
  { label: '需求分析与测试点', icon: Target },
  { label: '用例生成与编辑', icon: FileText },
  { label: '质量检查与覆盖率', icon: BarChart3 },
  { label: '历史记录与导出', icon: BookOpen },
  { label: '设置', icon: Settings },
] as const;

function walkNodes(node: AiCaseNode, visit: (current: AiCaseNode) => void): void {
  visit(node);
  for (const child of node.children ?? []) {
    walkNodes(child as AiCaseNode, visit);
  }
}

function sumProgress(docs: AiCaseWorkspaceDocument[]): AiCaseProgress {
  const initial: AiCaseProgress = {
    total: 0,
    todo: 0,
    doing: 0,
    blocked: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    done: 0,
    completionRate: 0,
  };

  const total = docs.reduce((acc, doc) => {
    const progress = computeProgress(doc.mapData);
    return {
      total: acc.total + progress.total,
      todo: acc.todo + progress.todo,
      doing: acc.doing + progress.doing,
      blocked: acc.blocked + progress.blocked,
      passed: acc.passed + progress.passed,
      failed: acc.failed + progress.failed,
      skipped: acc.skipped + progress.skipped,
      done: acc.done + progress.done,
      completionRate: 0,
    };
  }, initial);

  return {
    ...total,
    completionRate: total.total > 0 ? Math.round((total.done / total.total) * 100) : 0,
  };
}

function countModules(doc: AiCaseWorkspaceDocument): number {
  let count = 0;
  walkNodes(doc.mapData.nodeData, (node) => {
    if (node.metadata?.kind === 'module') {
      count += 1;
    }
  });
  return count;
}

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function statusView(progress: AiCaseProgress): { label: string; className: string } {
  if (progress.total === 0) {
    return { label: '待解析', className: 'bg-slate-100 text-slate-600' };
  }
  if (progress.completionRate >= 100) {
    return { label: '已完成', className: 'bg-emerald-100 text-emerald-700' };
  }
  if (progress.done > 0) {
    return { label: '用例生成中', className: 'bg-blue-100 text-blue-700' };
  }
  return { label: '测试点生成中', className: 'bg-orange-100 text-orange-700' };
}

function buildProjectRows(docs: AiCaseWorkspaceDocument[]): ProjectRow[] {
  return docs.slice(0, 5).map((doc) => {
    const progress = computeProgress(doc.mapData);
    const status = statusView(progress);

    return {
      id: doc.id,
      projectName: doc.name || '未命名工作台',
      requirementName: doc.requirement.trim().split('\n')[0]?.slice(0, 28) || `${countModules(doc)} 个模块测试需求`,
      statusLabel: status.label,
      statusClassName: status.className,
      updatedAt: formatDateTime(doc.updatedAt),
    };
  });
}

function DashboardSidebar(): JSX.Element {
  return (
    <aside className="hidden w-[246px] shrink-0 border-r border-[#e7ecf5] bg-white/95 px-2 py-5 shadow-[8px_0_28px_rgba(15,23,42,0.03)] lg:flex lg:flex-col">
      <div className="mb-7 flex items-center gap-3 px-3">
        <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#2d7cff_0%,#31d5d0_100%)] shadow-lg shadow-blue-500/20">
          <div className="absolute left-2 top-2 h-6 w-3 rotate-[26deg] rounded-full bg-white/95" />
          <div className="absolute right-2 top-2 h-6 w-3 -rotate-[26deg] rounded-full bg-white/70" />
        </div>
        <div className="text-[20px] font-bold tracking-tight text-slate-950">AI 测试用例生成工作台</div>
      </div>

      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              className={`flex h-12 w-full items-center gap-3 rounded-lg px-4 text-left text-[15px] font-semibold transition-colors ${
                'active' in item && item.active
                  ? 'bg-[#edf4ff] text-[#1f6fff]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button type="button" className="mt-auto flex items-center gap-3 border-t border-[#eef2f7] px-4 pt-5 text-sm font-medium text-slate-500">
        <Menu className="h-4 w-4" />
        收起菜单
      </button>
    </aside>
  );
}

function DashboardTopbar({ userName }: { userName: string }): JSX.Element {
  return (
    <header className="flex h-[70px] shrink-0 items-center gap-5 border-b border-[#e8edf5] bg-white px-6">
      <button type="button" className="flex h-10 min-w-[205px] items-center justify-between rounded-lg border border-[#dce4f0] bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm">
        <span className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-[#1f6fff]" />示例项目</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      <div className="mx-auto flex h-10 w-full max-w-[520px] items-center gap-3 rounded-lg border border-[#dce4f0] bg-white px-4 text-slate-400 shadow-sm">
        <Search className="h-4 w-4" />
        <span className="flex-1 text-sm">搜索需求、项目、用例、测试点...</span>
        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-xs text-slate-500">⌘ K</kbd>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="h-5 w-5 text-slate-900" />
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">3</span>
        </div>
        <HelpCircle className="h-5 w-5 text-slate-900" />
        <div className="h-5 w-px bg-slate-200" />
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e2e8f0,#94a3b8)] text-sm font-bold text-white">
            {userName.slice(0, 1)}
          </div>
          <div className="hidden leading-tight xl:block">
            <div className="text-sm font-semibold text-slate-900">{userName}</div>
            <div className="text-xs text-slate-500">测试工程师</div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </header>
  );
}

function MetricCard({ metric }: { metric: DashboardMetric }): JSX.Element {
  const Icon = metric.icon;
  return (
    <div className="rounded-2xl border border-[#e5ebf5] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg ${metric.gradient}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-600">{metric.label}</div>
          <div className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{metric.value}</div>
          <div className="mt-2 text-xs text-slate-500"><span className="font-semibold text-emerald-500">↑ {metric.delta}</span>　较上周</div>
        </div>
      </div>
    </div>
  );
}

function HeroPanel({ metrics }: { metrics: DashboardMetric[] }): JSX.Element {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#dfe8fb] bg-[linear-gradient(105deg,#f8fbff_0%,#eef6ff_58%,#f6faff_100%)] px-10 py-8 shadow-[0_12px_34px_rgba(15,23,42,0.06)]">
      <div className="pointer-events-none absolute right-8 top-2 hidden h-44 w-72 opacity-90 md:block">
        <div className="absolute right-20 top-9 h-24 w-24 rounded-2xl bg-[linear-gradient(135deg,#4da3ff,#1d7cff)] p-1 shadow-[0_18px_40px_rgba(37,99,235,0.28)] rotate-3">
          <div className="flex h-full w-full items-center justify-center rounded-xl border border-white/50 bg-white/15 text-3xl font-bold text-white">AI</div>
        </div>
        <div className="absolute right-2 top-3 h-16 w-16 rounded-xl bg-white/50 shadow-xl" />
        <div className="absolute bottom-2 right-24 h-10 w-32 rounded-full bg-blue-200/60 blur-xl" />
      </div>
      <div className="relative max-w-[640px]">
        <h1 className="text-[36px] font-bold tracking-tight text-slate-950">AI 测试用例生成工作台</h1>
        <p className="mt-4 text-[15px] leading-7 text-slate-600">
          通过 AI 技术，帮助您高效上传需求、智能解析、生成测试点与测试用例，全面提升测试效率与质量。
        </p>
      </div>
      <div className="relative mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </div>
    </section>
  );
}

function QuickStart({ steps }: { steps: QuickStep[] }): JSX.Element {
  return (
    <section className="border-t border-[#e6ecf5] bg-white px-6 py-5">
      <h2 className="mb-5 text-lg font-bold text-slate-950">快速开始</h2>
      <div className="grid gap-4 xl:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="flex items-center gap-4">
              <button
                type="button"
                onClick={step.onClick}
                className="relative h-[136px] w-full rounded-xl border border-[#dce5f3] bg-white px-4 py-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
              >
                <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#2c73e8] text-xs font-bold text-white">{index + 1}</span>
                <div className="mx-auto mt-6 flex h-8 w-8 items-center justify-center text-[#1f6fff]"><Icon className="h-8 w-8" /></div>
                <div className="mt-3 text-sm font-bold text-slate-950">{step.title}</div>
                <div className="mt-2 text-xs leading-5 text-slate-500">{step.description}</div>
              </button>
              {index < steps.length - 1 ? <ChevronRight className="hidden h-5 w-5 shrink-0 text-slate-500 xl:block" /> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AbilityGrid({ abilities }: { abilities: AbilityCard[] }): JSX.Element {
  return (
    <section className="rounded-2xl border border-[#e4eaf3] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <h2 className="mb-5 text-lg font-bold text-slate-950">系统能力</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {abilities.map((ability) => {
          const Icon = ability.icon;
          return (
            <button
              key={ability.title}
              type="button"
              onClick={ability.onClick}
              className="flex min-h-[100px] items-center gap-4 rounded-xl border border-[#e2e8f2] bg-white px-4 text-left transition-all hover:border-blue-300 hover:shadow-md"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${ability.tone}`}><Icon className="h-6 w-6" /></span>
              <span>
                <span className="block text-base font-bold text-slate-950">{ability.title}</span>
                <span className="mt-1 block text-xs text-slate-500">{ability.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RecentProjects({ rows, onOpen, onViewAll }: { rows: ProjectRow[]; onOpen: (id: string) => void; onViewAll: () => void }): JSX.Element {
  return (
    <section className="rounded-2xl border border-[#e4eaf3] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-950">最近项目</h2>
        <button type="button" onClick={onViewAll} className="flex items-center gap-1 text-sm font-semibold text-[#1f6fff]">查看全部 <ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="overflow-hidden rounded-xl border border-[#e5ebf2]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#fbfcfe] text-xs font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3">项目名称</th>
              <th className="px-4 py-3">需求名称</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">更新时间</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf1f6]">
            {rows.length > 0 ? rows.map((row) => (
              <tr key={row.id} className="text-slate-700">
                <td className="px-4 py-3 font-semibold text-slate-900">{row.projectName}</td>
                <td className="px-4 py-3">{row.requirementName}</td>
                <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${row.statusClassName}`}>{row.statusLabel}</span></td>
                <td className="px-4 py-3 tabular-nums">{row.updatedAt}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => onOpen(row.id)} className="mr-3 text-[#1f6fff]"><Eye className="inline h-4 w-4" /></button>
                  <button type="button" className="text-slate-600"><MoreVertical className="inline h-4 w-4" /></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">暂无最近项目，上传需求后将在这里展示。</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CoveragePanel({ data, coverageRate, total }: { data: CoverageDataPoint[]; coverageRate: number; total: number }): JSX.Element {
  return (
    <section className="rounded-2xl border border-[#e4eaf3] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2"><h2 className="text-lg font-bold text-slate-950">需求覆盖概览</h2><Info className="h-4 w-4 text-slate-400" /></div>
        <span className="text-sm font-medium text-slate-600">本项目覆盖率</span>
      </div>
      <div className="grid items-center gap-4 md:grid-cols-[1fr_1fr]">
        <div className="relative h-[210px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={64} outerRadius={86} startAngle={90} endAngle={-270} paddingAngle={2}>
                {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-slate-950">{coverageRate}%</div>
            <div className="mt-1 text-sm text-slate-500">总体覆盖率</div>
          </div>
        </div>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-3 text-sm">
              <span style={{ backgroundColor: item.color }} className="h-3 w-3 rounded-full" />
              <span className="flex-1 text-slate-600">{item.name}</span>
              <span className="font-semibold text-slate-700">{item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#edf1f6] pt-4 text-sm text-slate-500">
        <span>需求总数：{total}</span>
        <span>更新时间：{formatDateTime(Date.now())}</span>
      </div>
      <button type="button" className="mt-4 flex w-full items-center justify-center gap-2 border-t border-[#edf1f6] pt-4 text-sm font-semibold text-[#1f6fff]">
        查看覆盖率详情 <ChevronRight className="h-4 w-4" />
      </button>
    </section>
  );
}

export default function AICaseCreate(): JSX.Element {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [docs, setDocs] = useState<AiCaseWorkspaceDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDocs(await listAllWorkspaceDocuments());
    } catch {
      toast.error('加载 AI 工作台数据失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sortedDocs = useMemo(() => [...docs].sort((left, right) => right.updatedAt - left.updatedAt), [docs]);
  const aggregateProgress = useMemo(() => sumProgress(docs), [docs]);
  const rows = useMemo(() => buildProjectRows(sortedDocs), [sortedDocs]);
  const userName = user?.display_name || user?.username || '张伟';

  const handleOpen = useCallback((id: string) => setLocation(`/ai-workbench/case-generation?docId=${encodeURIComponent(id)}`), [setLocation]);
  const handleViewAll = useCallback(() => setLocation('/ai-workbench/history-export'), [setLocation]);
  const handleReserved = useCallback((message: string) => toast.info(message), []);

  const metrics = useMemo<DashboardMetric[]>(() => [
    { label: '本周需求数', value: docs.length.toLocaleString('zh-CN'), delta: '20%', icon: FileText, gradient: 'bg-[linear-gradient(135deg,#2475ff,#3d7cff)]' },
    { label: '测试点数', value: aggregateProgress.total.toLocaleString('zh-CN'), delta: '18%', icon: Target, gradient: 'bg-[linear-gradient(135deg,#12c7be,#19b7b8)]' },
    { label: '生成用例数', value: aggregateProgress.done.toLocaleString('zh-CN'), delta: '25%', icon: ClipboardList, gradient: 'bg-[linear-gradient(135deg,#7b55f2,#8a5cf6)]' },
    { label: '导出次数', value: Math.max(0, docs.filter((doc) => doc.remoteWorkspaceId).length).toLocaleString('zh-CN'), delta: '13%', icon: Download, gradient: 'bg-[linear-gradient(135deg,#ff8a35,#ff6d2d)]' },
  ], [aggregateProgress.done, aggregateProgress.total, docs]);

  const quickSteps = useMemo<QuickStep[]>(() => [
    { title: '上传需求', description: '支持 Word、PDF、TXT 等格式', icon: Upload, onClick: () => setSheetOpen(true) },
    { title: '智能解析', description: 'AI 解析需求内容，提取关键信息', icon: FileQuestion, onClick: () => setSheetOpen(true) },
    { title: '生成测试点', description: '识别测试点，覆盖功能与非功能需求', icon: Target, onClick: () => setSheetOpen(true) },
    { title: '生成测试用例', description: 'AI 生成详细测试用例，支持编辑优化', icon: ClipboardList, onClick: () => setSheetOpen(true) },
    { title: '导出 Excel', description: '一键导出测试用例，便于执行与管理', icon: Download, onClick: () => handleReserved('导出入口将在工作台详情中按用例维度开放') },
  ], [handleReserved]);

  const abilities = useMemo<AbilityCard[]>(() => [
    { title: '文档上传', description: '多格式文档上传', icon: Briefcase, tone: 'bg-blue-50 text-blue-600', onClick: () => setSheetOpen(true) },
    { title: '文本清洗', description: '智能清洗与标准化', icon: Bot, tone: 'bg-blue-50 text-blue-600', onClick: () => handleReserved('文本清洗能力正在接入') },
    { title: '需求疑问识别', description: '识别歧义与疑问点', icon: FileQuestion, tone: 'bg-violet-50 text-violet-600', onClick: () => handleReserved('需求疑问识别能力正在接入') },
    { title: '风险点识别', description: '识别潜在风险点', icon: ShieldAlert, tone: 'bg-orange-50 text-orange-600', onClick: () => handleReserved('风险点识别能力正在接入') },
    { title: '覆盖率分析', description: '多维度覆盖率分析', icon: BarChart3, tone: 'bg-blue-50 text-blue-600', onClick: handleViewAll },
    { title: 'Excel 导出', description: '一键导出用例', icon: Download, tone: 'bg-emerald-50 text-emerald-600', onClick: () => handleReserved('Excel 导出能力将在用例生成后开放') },
  ], [handleReserved, handleViewAll]);

  const coverageData = useMemo<CoverageDataPoint[]>(() => {
    const covered = aggregateProgress.done;
    const partial = aggregateProgress.doing + aggregateProgress.blocked;
    const uncovered = Math.max(aggregateProgress.total - covered - partial, 0);
    return [
      { name: '已覆盖', value: covered, color: '#2d73ee' },
      { name: '部分覆盖', value: partial, color: '#21bdbd' },
      { name: '未覆盖', value: uncovered, color: '#ff6b4a' },
    ];
  }, [aggregateProgress]);

  return (
    <div className="flex min-h-full bg-[#f5f8fc] text-slate-900">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar userName={userName} />
        <main className="min-w-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex h-[520px] items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-white text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 正在加载 AI 工作台...
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_408px]">
              <div className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                <HeroPanel metrics={metrics} />
                <QuickStart steps={quickSteps} />
                <div className="p-5">
                  <RecentProjects rows={rows} onOpen={handleOpen} onViewAll={handleViewAll} />
                </div>
              </div>
              <div className="space-y-5">
                <AbilityGrid abilities={abilities} />
                <CoveragePanel data={coverageData} coverageRate={aggregateProgress.completionRate} total={aggregateProgress.total} />
                {aggregateProgress.failed > 0 ? (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                    <AlertTriangle className="mr-2 inline h-4 w-4" />存在 {aggregateProgress.failed} 个失败用例，请优先检查风险点。
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                    <CheckCircle2 className="mr-2 inline h-4 w-4" />当前暂无失败用例，继续补充需求可提升覆盖率。
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      <NewRequirementSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
