import { Eye } from 'lucide-react';

import type { HistoryRecord } from '../types';
import Pagination from './Pagination';
import StatusTag from './StatusTag';

export interface HistoryTableProps {
  records: HistoryRecord[];
  onViewDetail: (record: HistoryRecord) => void;
}

export default function HistoryTable({ records, onViewDetail }: HistoryTableProps): JSX.Element {
  return (
    <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">生成历史</h2>
          <p className="mt-1 text-sm text-slate-500">展示最近 8 条历史生成记录，支持查看生成详情。</p>
        </div>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">时间</th>
            <th className="px-5 py-3">项目名称</th>
            <th className="px-5 py-3">需求名称</th>
            <th className="px-5 py-3">生成内容</th>
            <th className="px-5 py-3">用例数</th>
            <th className="px-5 py-3">状态</th>
            <th className="px-5 py-3">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB]">
          {records.map((record) => (
            <tr className="hover:bg-blue-50/30" key={record.id}>
              <td className="whitespace-nowrap px-5 py-4 text-slate-600">{record.time}</td>
              <td className="px-5 py-4 font-semibold text-slate-900">{record.projectName}</td>
              <td className="px-5 py-4 text-slate-700">{record.requirementName}</td>
              <td className="max-w-xs px-5 py-4 text-slate-600">{record.generatedContent}</td>
              <td className="px-5 py-4 font-semibold text-slate-900">{record.caseCount}</td>
              <td className="px-5 py-4"><StatusTag status={record.status} /></td>
              <td className="px-5 py-4">
                <button className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#2563EB] hover:bg-blue-50" type="button" onClick={() => onViewDetail(record)}>
                  <Eye className="h-4 w-4" />查看详情
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination />
    </section>
  );
}
