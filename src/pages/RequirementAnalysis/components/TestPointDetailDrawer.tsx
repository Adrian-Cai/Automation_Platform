import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Priority, TestPoint } from "../types";

interface TestPointDetailDrawerProps {
  open: boolean;
  testPoint: TestPoint | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (testPoint: TestPoint) => void;
}

const priorityClass: Record<Priority, string> = {
  P0: "bg-red-50 text-red-700 border-red-100",
  P1: "bg-orange-50 text-orange-700 border-orange-100",
  P2: "bg-blue-50 text-blue-700 border-blue-100",
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value || "-"}</p>
    </div>
  );
}

function TestPointDetailDrawer({ open, testPoint, onOpenChange, onEdit }: TestPointDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-xl overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>测试点详情</SheetTitle>
          <SheetDescription>查看测试点编号、覆盖范围、生成状态和备注信息。</SheetDescription>
        </SheetHeader>
        {testPoint ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm text-blue-700">{testPoint.code}</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{testPoint.description}</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <DetailItem label="所属模块" value={testPoint.module} />
              <DetailItem label="测试类型" value={testPoint.type} />
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">优先级</p>
                <Badge variant="outline" className={`mt-2 ${priorityClass[testPoint.priority]}`}>{testPoint.priority}</Badge>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">是否生成用例</p>
                <Badge variant="outline" className={`mt-2 ${testPoint.generated ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                  {testPoint.generated ? "已生成" : "未生成"}
                </Badge>
              </div>
              <DetailItem label="已生成用例数" value={`${testPoint.caseCount} 条`} />
              <DetailItem label="关联风险" value={testPoint.relatedRisk ?? ""} />
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">备注</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{testPoint.remark || "暂无备注"}</p>
            </div>
          </div>
        ) : null}
        <SheetFooter className="mt-8">
          {testPoint ? <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => onEdit(testPoint)}>编辑测试点</Button> : null}
          <Button variant="outline" onClick={() => onOpenChange(false)}>关闭</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default TestPointDetailDrawer;
