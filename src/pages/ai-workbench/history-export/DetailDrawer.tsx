import { CalendarClock, FileText, FolderKanban, Hash } from 'lucide-react';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import StatusTag from './StatusTag';
import type { HistoryRecord } from './types';

interface DetailDrawerProps {
  record: HistoryRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenRecord: (recordId: string) => void;
}

export default function DetailDrawer({ record, open, onOpenChange, onOpenRecord }: DetailDrawerProps): JSX.Element {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[440px] p-0">
        <div className="h-full overflow-y-auto p-6">
          <SheetHeader>
            <SheetTitle className="text-xl">历史记录详情</SheetTitle>
            <SheetDescription>查看本次 AI 测试用例生成任务的概要信息。</SheetDescription>
          </SheetHeader>
          {record ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold text-blue-600">记录编号</p>
                <p className="mt-1 text-lg font-bold text-slate-950">{record.id}</p>
              </div>
              <div className="grid gap-3">
                <div className="flex gap-3 rounded-lg border border-slate-100 p-3">
                  <CalendarClock className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500">生成时间</p>
                    <p className="font-semibold text-slate-900">{record.time}</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border border-slate-100 p-3">
                  <FolderKanban className="mt-0.5 h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-xs text-slate-500">项目名称</p>
                    <p className="font-semibold text-slate-900">{record.projectName}</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border border-slate-100 p-3">
                  <FileText className="mt-0.5 h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-slate-500">需求名称</p>
                    <p className="font-semibold text-slate-900">{record.requirementName}</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border border-slate-100 p-3">
                  <Hash className="mt-0.5 h-5 w-5 text-violet-500" />
                  <div>
                    <p className="text-xs text-slate-500">生成内容 / 用例数</p>
                    <p className="font-semibold text-slate-900">{record.content} · {record.caseCount} 条</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <span className="text-sm text-slate-500">生成状态</span>
                <StatusTag status={record.status} />
              </div>
              <button
                type="button"
                className="h-10 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={() => onOpenRecord(record.id)}
              >
                进入记录详情
              </button>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
