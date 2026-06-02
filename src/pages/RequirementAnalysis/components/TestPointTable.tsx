import { Plus, Search, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { GeneratedFilter, Priority, TestPoint, TestPointFilters, TestPointType } from "../types";

interface TestPointTableProps {
  testPoints: TestPoint[];
  filters: TestPointFilters;
  selectedRowKeys: string[];
  moduleOptions: string[];
  testTypeOptions: TestPointType[];
  priorityOptions: Priority[];
  generatedOptions: GeneratedFilter[];
  onFiltersChange: (filters: TestPointFilters) => void;
  onResetFilters: () => void;
  onSelectedRowKeysChange: (keys: string[]) => void;
  onCreate: () => void;
  onView: (testPoint: TestPoint) => void;
  onEdit: (testPoint: TestPoint) => void;
  onDelete: (id: string) => void;
  onGenerateCase: (id: string) => void;
  onBatchGenerate: () => void;
  onBatchDelete: () => void;
}

const priorityClass: Record<Priority, string> = {
  P0: "bg-red-50 text-red-700 border-red-100",
  P1: "bg-orange-50 text-orange-700 border-orange-100",
  P2: "bg-blue-50 text-blue-700 border-blue-100",
};

function TestPointTable({
  testPoints,
  filters,
  selectedRowKeys,
  moduleOptions,
  testTypeOptions,
  priorityOptions,
  generatedOptions,
  onFiltersChange,
  onResetFilters,
  onSelectedRowKeysChange,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onGenerateCase,
  onBatchGenerate,
  onBatchDelete,
}: TestPointTableProps) {
  const allSelected = testPoints.length > 0 && testPoints.every((item) => selectedRowKeys.includes(item.id));
  const partiallySelected = testPoints.some((item) => selectedRowKeys.includes(item.id)) && !allSelected;

  const updateFilter = <K extends keyof TestPointFilters>(key: K, value: TestPointFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      onSelectedRowKeysChange(selectedRowKeys.filter((id) => !testPoints.some((item) => item.id === id)));
      return;
    }
    onSelectedRowKeysChange(Array.from(new Set([...selectedRowKeys, ...testPoints.map((item) => item.id)])));
  };

  const toggleRow = (id: string, checked: boolean) => {
    if (checked) {
      onSelectedRowKeysChange([...selectedRowKeys, id]);
      return;
    }
    onSelectedRowKeysChange(selectedRowKeys.filter((item) => item !== id));
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">核心测试点列表</h2>
          <p className="text-sm text-slate-500">支持筛选、新增编辑、生成用例和批量处理。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />新增测试点</Button>
          <Button variant="outline" disabled={selectedRowKeys.length === 0} onClick={onBatchGenerate}><Wand2 className="mr-2 h-4 w-4" />批量生成用例</Button>
          <Button variant="outline" disabled={selectedRowKeys.length === 0} onClick={onBatchDelete}><Trash2 className="mr-2 h-4 w-4" />批量删除</Button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-6">
        <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={filters.module} onChange={(event) => updateFilter("module", event.target.value)}>
          <option value="">所属模块</option>
          {moduleOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={filters.type} onChange={(event) => updateFilter("type", event.target.value)}>
          <option value="">测试类型</option>
          {testTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value)}>
          <option value="">优先级</option>
          {priorityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={filters.generated} onChange={(event) => updateFilter("generated", event.target.value as GeneratedFilter)}>
          {generatedOptions.map((item) => <option key={item} value={item}>{item === "全部" ? "是否生成用例" : item}</option>)}
        </select>
        <Input className="bg-white" value={filters.keyword} onChange={(event) => updateFilter("keyword", event.target.value)} placeholder="关键词搜索" />
        <div className="flex gap-2">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700"><Search className="mr-2 h-4 w-4" />查询</Button>
          <Button className="flex-1" variant="outline" onClick={onResetFilters}>重置</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="w-12 px-4 py-3">
                  <Checkbox checked={allSelected || (partiallySelected ? "indeterminate" : false)} onCheckedChange={(checked) => toggleAll(checked === true)} />
                </th>
                <th className="px-4 py-3 font-medium">测试点编号</th>
                <th className="px-4 py-3 font-medium">所属模块</th>
                <th className="px-4 py-3 font-medium">测试点描述</th>
                <th className="px-4 py-3 font-medium">测试类型</th>
                <th className="px-4 py-3 font-medium">优先级</th>
                <th className="px-4 py-3 font-medium">是否生成用例</th>
                <th className="px-4 py-3 font-medium">关联风险</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {testPoints.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3"><Checkbox checked={selectedRowKeys.includes(item.id)} onCheckedChange={(checked) => toggleRow(item.id, checked === true)} /></td>
                  <td className="px-4 py-3 font-medium text-blue-700">{item.code}</td>
                  <td className="px-4 py-3 text-slate-600">{item.module}</td>
                  <td className="max-w-sm px-4 py-3 text-slate-700">{item.description}</td>
                  <td className="px-4 py-3 text-slate-600">{item.type}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={priorityClass[item.priority]}>{item.priority}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={item.generated ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"}>
                      {item.generated ? `已生成 ${item.caseCount} 条` : "未生成"}
                    </Badge>
                  </td>
                  <td className="max-w-[180px] px-4 py-3 text-slate-600">{item.relatedRisk || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onView(item)}>查看</Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>编辑</Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>删除</Button>
                      <Button variant="outline" size="sm" onClick={() => onGenerateCase(item.id)}>生成用例</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {testPoints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-500">暂无符合条件的测试点</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default TestPointTable;
