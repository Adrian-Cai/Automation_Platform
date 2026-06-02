import { useState } from 'react';
import { toast } from 'sonner';

import DetailDrawer from './history-export/components/DetailDrawer';
import ExportCenter from './history-export/components/ExportCenter';
import HistoryTable from './history-export/components/HistoryTable';
import Layout from './history-export/components/Layout';
import RecentExportList from './history-export/components/RecentExportList';
import StatCard from './history-export/components/StatCard';
import SyncPanel from './history-export/components/SyncPanel';
import VersionComparePanel from './history-export/components/VersionComparePanel';
import VersionDiffModal from './history-export/components/VersionDiffModal';
import { exportFormats, historyRecords, recentExports, statItems, versionRecords } from './history-export/mock';
import type { ExportFormatOption, HistoryRecord, VersionRecord, WorkspaceTab } from './history-export/types';

const tabs: Array<{ id: WorkspaceTab; label: string }> = [
  { id: 'history', label: '生成历史' },
  { id: 'versions', label: '版本记录' },
  { id: 'exports', label: '导出中心' },
];

export default function AiWorkbenchHistoryExport(): JSX.Element {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('history');
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [diffOpen, setDiffOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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
    <Layout>
      <div className="mx-auto max-w-[1480px] space-y-6">
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
          {statItems.map((item) => <StatCard item={item} key={item.id} />)}
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

        {activeTab === 'history' ? <HistoryTable records={historyRecords} onViewDetail={setSelectedRecord} /> : null}
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
    </Layout>
  );
}
