import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock3, Download, FileText, Settings2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

import { listAllWorkspaceDocuments } from '@/lib/aiCaseStorage';
import { computeProgress } from '@/lib/aiCaseMindMap';
import type { AiCaseProgress, AiCaseWorkspaceDocument } from '@/types/aiCases';

import DetailDrawer from './history-export/DetailDrawer';
import ExportCenter from './history-export/ExportCenter';
import HistoryTable from './history-export/HistoryTable';
import Layout from './history-export/Layout';
import RecentExportList from './history-export/RecentExportList';
import StatCard from './history-export/StatCard';
import SyncPanel from './history-export/SyncPanel';
import VersionComparePanel from './history-export/VersionComparePanel';
import VersionDiffModal from './history-export/VersionDiffModal';
import { exportOptions, recentExports, tabs, versions } from './history-export/mockData';
import type { HistoryRecord, HistoryStatus, StatItem, TabKey } from './history-export/types';

function formatTimestamp(value: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function resolveHistoryStatus(progress: AiCaseProgress): HistoryStatus {
  if (progress.total === 0) return '生成失败';
  return progress.completionRate >= 100 ? '已完成' : '部分完成';
}

function toHistoryRecord(doc: AiCaseWorkspaceDocument): HistoryRecord {
  const progress = computeProgress(doc.mapData);
  return {
    id: doc.id,
    time: formatTimestamp(doc.updatedAt),
    projectName: doc.name,
    requirementName: doc.requirement,
    content: `测试用例（${progress.completionRate}% 完成）`,
    caseCount: progress.total,
    status: resolveHistoryStatus(progress),
  };
}

export default function AiWorkbenchHistoryExport(): JSX.Element {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>('generation');
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [docs, setDocs] = useState<AiCaseWorkspaceDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const storedDocs = await listAllWorkspaceDocuments();
      setDocs(storedDocs);
    } catch {
      toast.error('加载历史记录失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const records = useMemo(
    () => [...docs].sort((a, b) => b.updatedAt - a.updatedAt).map(toHistoryRecord),
    [docs]
  );

  const pageStats = useMemo<StatItem[]>(() => {
    const totalCases = docs.reduce((sum, doc) => sum + computeProgress(doc.mapData).total, 0);
    const syncedDocs = docs.filter((doc) => doc.syncMode === 'hybrid' && doc.remoteWorkspaceId).length;
    const latestUpdatedAt = docs.reduce<number | null>((latest, doc) => (latest === null || doc.updatedAt > latest ? doc.updatedAt : latest), null);

    return [
      {
        title: '历史需求数',
        value: docs.length.toLocaleString('zh-CN'),
        description: loading ? '正在加载本地历史' : '来自已保存工作区',
        icon: FileText,
        iconClassName: 'bg-blue-600 text-white',
      },
      {
        title: '累计用例数',
        value: totalCases.toLocaleString('zh-CN'),
        description: '按当前工作区数据统计',
        icon: Settings2,
        iconClassName: 'bg-teal-500 text-white',
      },
      {
        title: '已同步服务端',
        value: syncedDocs.toLocaleString('zh-CN'),
        description: '混合同步工作区',
        icon: Download,
        iconClassName: 'bg-orange-500 text-white',
      },
      {
        title: '最近更新时间',
        value: latestUpdatedAt === null ? '暂无记录' : formatTimestamp(latestUpdatedAt),
        description: '本地工作区更新时间',
        icon: Clock3,
        iconClassName: 'bg-violet-500 text-white',
      },
    ];
  }, [docs, loading]);

  const handleViewDetail = (record: HistoryRecord) => {
    setSelectedRecord(record);
    setIsDrawerOpen(true);
  };

  const handleOpenRecord = useCallback(
    (recordId: string) => setLocation(`/ai-workbench/case-generation?docId=${encodeURIComponent(recordId)}`),
    [setLocation]
  );

  const handleRestoreVersion = (version: string) => {
    if (window.confirm('是否确认恢复到该版本？')) {
      toast.success(`已提交恢复到 ${version} 的任务`);
    }
  };

  const handleSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    window.setTimeout(() => {
      setIsSyncing(false);
      toast.success('同步成功');
    }, 1000);
  };

  return (
    <Layout>
      <div className="mx-auto min-w-[1180px] max-w-[1680px] p-6">
        <div className="text-sm font-medium text-slate-500">页面 6 / 6 · 历史记录与导出</div>
        <div className="mt-3 flex items-center gap-3">
          <Clock3 className="h-8 w-8 text-slate-950" />
          <h1 className="text-[28px] font-bold leading-8 tracking-tight text-slate-950">历史记录与导出</h1>
        </div>

        <div className="mt-5 flex border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`relative h-11 px-4 text-sm font-semibold transition ${activeTab === tab.key ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {activeTab === tab.key ? <span className="absolute bottom-[-1px] left-0 h-0.5 w-full rounded-full bg-blue-600" /> : null}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-4">
          {pageStats.map((item) => <StatCard key={item.title} item={item} />)}
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_370px] gap-4">
          <div className="space-y-4">
            <HistoryTable records={records} loading={loading} onViewDetail={handleViewDetail} onOpenRecord={handleOpenRecord} />
            <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-4">
              <ExportCenter options={exportOptions} />
              <RecentExportList records={recentExports} />
            </div>
          </div>
          <aside className="space-y-4">
            <VersionComparePanel versions={versions} onRestoreVersion={handleRestoreVersion} onOpenDiff={() => setIsDiffOpen(true)} />
            <SyncPanel isSyncing={isSyncing} onSync={handleSync} />
          </aside>
        </div>
      </div>

      <DetailDrawer record={selectedRecord} open={isDrawerOpen} onOpenChange={setIsDrawerOpen} onOpenRecord={handleOpenRecord} />
      <VersionDiffModal open={isDiffOpen} onOpenChange={setIsDiffOpen} />
    </Layout>
  );
}
