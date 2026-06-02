import { useState } from 'react';
import { Clock3 } from 'lucide-react';
import { toast } from 'sonner';

import DetailDrawer from './history-export/DetailDrawer';
import ExportCenter from './history-export/ExportCenter';
import HistoryTable from './history-export/HistoryTable';
import Layout from './history-export/Layout';
import RecentExportList from './history-export/RecentExportList';
import StatCard from './history-export/StatCard';
import SyncPanel from './history-export/SyncPanel';
import VersionComparePanel from './history-export/VersionComparePanel';
import VersionDiffModal from './history-export/VersionDiffModal';
import { exportOptions, historyRecords, recentExports, stats, tabs, versions } from './history-export/mockData';
import type { HistoryRecord, TabKey } from './history-export/types';

export default function AiWorkbenchHistoryExport(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>('generation');
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleViewDetail = (record: HistoryRecord) => {
    setSelectedRecord(record);
    setIsDrawerOpen(true);
  };

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
          {stats.map((item) => <StatCard key={item.title} item={item} />)}
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_370px] gap-4">
          <div className="space-y-4">
            <HistoryTable records={historyRecords} onViewDetail={handleViewDetail} />
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

      <DetailDrawer record={selectedRecord} open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
      <VersionDiffModal open={isDiffOpen} onOpenChange={setIsDiffOpen} />
    </Layout>
  );
}
