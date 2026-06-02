import { MoreVertical } from 'lucide-react';

import Pagination from './Pagination';
import StatusTag from './StatusTag';
import type { HistoryRecord } from './types';

interface HistoryTableProps {
  records: HistoryRecord[];
  onViewDetail: (record: HistoryRecord) => void;
}

export default function HistoryTable({ records, onViewDetail }: HistoryTableProps): JSX.Element {
  return (
    <section className="rounded-xl border border-slate-100 bg-white shadow-sm shadow-slate-200/80">
      <div className="flex h-[58px] items-center justify-between px-5">
        <h2 className="text-base font-bold text-slate-950">历史生成记录</h2>
      </div>
      <div className="overflow-x-auto px-5">
        <table className="w-full min-w-[960px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-semibold text-slate-500">
              <th className="h-10 rounded-l-lg px-3">时间</th>
              <th className="h-10 px-3">项目名称</th>
              <th className="h-10 px-3">需求名称</th>
              <th className="h-10 px-3">生成内容</th>
              <th className="h-10 px-3">用例数</th>
              <th className="h-10 px-3">状态</th>
              <th className="h-10 rounded-r-lg px-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-slate-100 text-slate-700 hover:bg-blue-50/30">
                <td className="h-12 border-b border-slate-100 px-3 font-medium text-slate-700">{record.time}</td>
                <td className="h-12 border-b border-slate-100 px-3 font-semibold text-slate-800">{record.projectName}</td>
                <td className="h-12 border-b border-slate-100 px-3">{record.requirementName}</td>
                <td className="h-12 border-b border-slate-100 px-3">{record.content}</td>
                <td className="h-12 border-b border-slate-100 px-3 font-semibold text-slate-800">{record.caseCount}</td>
                <td className="h-12 border-b border-slate-100 px-3"><StatusTag status={record.status} /></td>
                <td className="h-12 border-b border-slate-100 px-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      className="h-8 rounded-md border border-slate-200 px-4 text-xs font-semibold text-blue-600 shadow-sm hover:border-blue-300 hover:bg-blue-50"
                      onClick={() => onViewDetail(record)}
                    >
                      查看详情
                    </button>
                    <button type="button" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700" aria-label="更多操作">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination />
    </section>
  );
}
