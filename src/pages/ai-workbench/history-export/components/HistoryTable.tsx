import { Eye, PlayCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { HistoryRecord } from '../types';
import Pagination from './Pagination';
import StatusTag from './StatusTag';

const PAGE_SIZE = 10;

export interface HistoryTableProps {
  records: HistoryRecord[];
  loading: boolean;
  onDeleteRecord: (record: HistoryRecord) => void;
  onRefresh: () => void;
  onResume: (record: HistoryRecord) => void;
  onViewDetail: (record: HistoryRecord) => void;
}

export default function HistoryTable({
  records,
  loading,
  onDeleteRecord,
  onRefresh,
  onResume,
  onViewDetail,
}: HistoryTableProps): JSX.Element {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedRecords = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return records.slice(start, start + PAGE_SIZE);
  }, [records, safePage]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <section className="w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">生成历史</h2>
          <p className="mt-1 text-sm text-slate-500">展示本地保存的 AI 工作区历史，支持查看详情、继续编辑和删除。</p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="min-w-[1080px] w-full text-left text-sm">
        <thead className="bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">更新时间</th>
            <th className="px-5 py-3">工作区名称</th>
            <th className="px-5 py-3">需求名称</th>
            <th className="px-5 py-3">生成内容</th>
            <th className="px-5 py-3">测试点数</th>
            <th className="px-5 py-3">用例数</th>
            <th className="px-5 py-3">完成率</th>
            <th className="px-5 py-3">状态</th>
            <th className="px-5 py-3">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB]">
          {pagedRecords.map((record) => (
            <tr className="hover:bg-blue-50/30" key={record.id}>
              <td className="whitespace-nowrap px-5 py-4 text-slate-600">{record.time}</td>
              <td className="px-5 py-4 font-semibold text-slate-900">{record.projectName}</td>
              <td className="px-5 py-4 text-slate-700">{record.requirementName}</td>
              <td className="max-w-xs px-5 py-4 text-slate-600">{record.generatedContent}</td>
              <td className="px-5 py-4 font-semibold text-slate-900">{record.testPointCount}</td>
              <td className="px-5 py-4 font-semibold text-slate-900">{record.caseCount}</td>
              <td className="px-5 py-4 font-semibold text-slate-900">{record.coverage}</td>
              <td className="px-5 py-4"><StatusTag status={record.status} /></td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                  <button className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#2563EB] hover:bg-blue-50" type="button" onClick={() => onViewDetail(record)}>
                    <Eye className="h-4 w-4" />详情
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50" type="button" onClick={() => onResume(record)}>
                    <PlayCircle className="h-4 w-4" />继续
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50" type="button" onClick={() => onDeleteRecord(record)}>
                    <Trash2 className="h-4 w-4" />删除
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!loading && records.length === 0 ? (
            <tr>
              <td className="px-5 py-12 text-center text-sm text-slate-500" colSpan={9}>
                暂无本地 AI 工作区历史。生成用例后，记录会自动保存在这里。
              </td>
            </tr>
          ) : null}
          {loading ? (
            <tr>
              <td className="px-5 py-12 text-center text-sm text-slate-500" colSpan={9}>
                正在加载本地历史记录...
              </td>
            </tr>
          ) : null}
        </tbody>
        </table>
      </div>
      <Pagination currentPage={safePage} pageSize={PAGE_SIZE} total={records.length} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
