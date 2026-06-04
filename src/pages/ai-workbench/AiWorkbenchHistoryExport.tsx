import { BarChart3, ClipboardCheck, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

import { deleteWorkspaceDocument, listAllWorkspaceDocuments } from '@/lib/aiCaseStorage';
import { computeProgress } from '@/lib/aiCaseMindMap';
import type { AiCaseWorkspaceDocument } from '@/types/aiCases';

import DetailDrawer from './history-export/components/DetailDrawer';
import ExportCenter from './history-export/components/ExportCenter';
import HistoryTable from './history-export/components/HistoryTable';
import RecentExportList from './history-export/components/RecentExportList';
import StatCard from './history-export/components/StatCard';
import SyncPanel from './history-export/components/SyncPanel';
import VersionComparePanel from './history-export/components/VersionComparePanel';
import VersionDiffModal from './history-export/components/VersionDiffModal';
import { exportFormats, recentExports, versionRecords } from './history-export/mock';
import type { ExportFormatOption, HistoryRecord, HistoryStatus, StatItem, VersionRecord, WorkspaceTab } from './history-export/types';

const tabs: Array<{ id: WorkspaceTab; label: string }> = [
  { id: 'history', label: '生成历史' },
  { id: 'versions', label: '版本记录' },
  { id: 'exports', label: '导出中心' },
];

function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
}

function extractRequirementName(doc: AiCaseWorkspaceDocument): string {
  const firstLine = doc.requirement
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (!firstLine) {
    return '未命名需求';
  }

  return firstLine.length > 32 ? `${firstLine.slice(0, 32)}...` : firstLine;
}

function resolveHistoryStatus(doc: AiCaseWorkspaceDocument): HistoryStatus {
  const progress = computeProgress(doc.mapData);

  if (progress.failed > 0 || progress.blocked > 0) {
    return 'failed';
  }

  if (progress.doing > 0) {
    return 'processing';
  }

  return 'success';
}

function mapDocumentToHistoryRecord(doc: AiCaseWorkspaceDocument): HistoryRecord {
  const progress = computeProgress(doc.mapData);
  const syncLabel = doc.remoteWorkspaceId ? `远端工作台 #${doc.remoteWorkspaceId}` : '仅本地保存';

  return {
    id: doc.id,
    time: formatDateTime(doc.updatedAt),
    projectName: doc.name || 'AI Testcase Workspace',
    requirementName: extractRequirementName(doc),
    generatedContent: `${progress.total} 条测试点 / 已完成 ${progress.done} / 待处理 ${progress.todo}`,
    caseCount: progress.total,
    status: resolveHistoryStatus(doc),
    owner: syncLabel,
    duration: `版本 V${doc.version}`,
    coverage: `${progress.completionRate}%`,
    requirement: doc.requirement,
    createdAt: formatDateTime(doc.createdAt),
    updatedAt: formatDateTime(doc.updatedAt),
    syncMode: doc.remoteWorkspaceId ? '已同步' : '仅本地',
  };
}

function buildStatItems(docs: AiCaseWorkspaceDocument[]): StatItem[] {
  const progressList = docs.map((doc) => computeProgress(doc.mapData));
  const totalCases = progressList.reduce((sum, progress) => sum + progress.total, 0);
  const doneCases = progressList.reduce((sum, progress) => sum + progress.done, 0);
  const syncedDocs = docs.filter((doc) => doc.remoteWorkspaceId).length;
  const averageCoverage = totalCases === 0 ? 0 : Math.round((doneCases / totalCases) * 100);

  return [
    { id: 'generated', label: '累计生成记录', value: `${docs.length}`, trend: '来自本地工作区历史', icon: ClipboardCheck },
    { id: 'cases', label: '累计用例数', value: `${totalCases}`, trend: '按工作区测试点汇总', icon: BarChart3 },
    { id: 'exports', label: '已同步工作区', value: `${syncedDocs}`, trend: `${docs.length - syncedDocs} 个仅本地保存`, icon: FileSpreadsheet },
    { id: 'coverage', label: '平均完成率', value: `${averageCoverage}%`, trend: '基于已完成测试点计算', icon: ShieldCheck },
  ];
}

export default function AiWorkbenchHistoryExport(): JSX.Element {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('history');
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [diffOpen, setDiffOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [docs, setDocs] = useState<AiCaseWorkspaceDocument[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = useCallback(async (): Promise<void> => {
    setLoadingHistory(true);
    try {
      setDocs(await listAllWorkspaceDocuments());
    } catch (error) {
      console.error('[AiWorkbenchHistoryExport] failed to load workspace history', error);
      toast.error('加载历史记录失败，请刷新重试');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const historyRecords = useMemo(() => docs.map(mapDocumentToHistoryRecord), [docs]);
  const workspaceStatItems = useMemo(() => buildStatItems(docs), [docs]);

  const handleOpenRecord = useCallback(
    (record: HistoryRecord): void => {
      setLocation(`/ai-workbench/case-generation?docId=${encodeURIComponent(record.id)}`);
    },
    [setLocation]
  );

  const handleDeleteRecord = useCallback(async (record: HistoryRecord): Promise<void> => {
    const confirmed = window.confirm(`是否确认删除「${record.projectName}」？此操作不可恢复。`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteWorkspaceDocument(record.id);
      setDocs((prev) => prev.filter((doc) => doc.id !== record.id));
      setSelectedRecord((current) => (current?.id === record.id ? null : current));
      toast.success(`已删除「${record.projectName}」`);
    } catch (error) {
      console.error('[AiWorkbenchHistoryExport] failed to delete workspace history', error);
      toast.error('删除失败，请重试');
    }
  }, []);

  const handleExport = (format: ExportFormatOption): void => {
    toast.success(`已开始导出 ${format.format} 文件`);
  };

  const handleRestore = (version: VersionRecord): void => {
    const confirmed = window.confirm('是否确认恢复到该版本？');
    if (confirmed) {
      toast.success(`已恢复到 ${version.version}`);
    }
  };

  const handleSync = (): void => {
    setIsSyncing(true);
    window.setTimeout(() => {
      setIsSyncing(false);
      toast.success('同步成功');
    }, 1000);
  };

  return (
    <>
      <div className="mx-auto max-w-[1480px] space-y-6 px-6 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-[#2563EB]">页面 6 / 6 · 历史记录与导出</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">历史记录与导出</h1>
            <p className="mt-2 text-sm text-slate-500">统一管理 AI 生成历史、版本差异、导出任务与用例同步状态。</p>
          </div>
          <button className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:text-[#2563EB]" type="button">
            导出审计日志
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {workspaceStatItems.map((item) => <StatCard item={item} key={item.id} />)}
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-1 shadow-sm">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${activeTab === tab.id ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'history' ? (
          <HistoryTable
            loading={loadingHistory}
            records={historyRecords}
            onDeleteRecord={(record) => { void handleDeleteRecord(record); }}
            onRefresh={() => { void loadHistory(); }}
            onResume={handleOpenRecord}
            onViewDetail={setSelectedRecord}
          />
        ) : null}
        {activeTab === 'versions' ? <VersionComparePanel versions={versionRecords} onCompare={() => setDiffOpen(true)} onRestore={handleRestore} /> : null}
        {activeTab === 'exports' ? (
          <div className="space-y-6">
            <ExportCenter formats={exportFormats} onExport={handleExport} />
            <div className="grid grid-cols-[1fr_0.85fr] gap-6">
              <RecentExportList exports={recentExports} />
              <SyncPanel isSyncing={isSyncing} onSync={handleSync} />
            </div>
          </div>
        ) : null}
      </div>
      <DetailDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      <VersionDiffModal open={diffOpen} onClose={() => setDiffOpen(false)} />
    </>
  );
}
