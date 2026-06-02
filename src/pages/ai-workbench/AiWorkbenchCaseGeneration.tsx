import { useMemo, useState } from 'react';
import {
  Copy,
  Download,
  FileText,
  Minus,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  caseGenerationMock,
  type CasePriority,
  type CaseType,
  type GeneratedTestCase,
} from '@/pages/ai-workbench/caseGenerationMock';

interface CaseFilters {
  module: string;
  caseType: string;
  priority: string;
  automated: string;
}

const caseTypes: CaseType[] = ['功能正向', '异常流程', '边界值', '权限安全', '兼容回归', '性能并发'];
const priorities: CasePriority[] = ['P0', 'P1', 'P2'];
const granularities = ['粗粒度', '标准粒度', '细粒度'];
const templates = ['标准测试用例模板', '接口自动化模板', 'BDD Gherkin 模板', '回归清单模板'];

const emptyFilters: CaseFilters = {
  module: '全部模块',
  caseType: '全部类型',
  priority: '全部优先级',
  automated: '全部',
};

function getCurrentTime(): string {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function createNextCaseNo(cases: GeneratedTestCase[]): string {
  const nextNumber = cases.length + 1;
  return `AI-TC-20260602-${nextNumber.toString().padStart(3, '0')}`;
}

function priorityClassName(priority: CasePriority): string {
  if (priority === 'P0') {
    return 'border-transparent bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300';
  }

  if (priority === 'P1') {
    return 'border-transparent bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300';
  }

  return 'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
}

function automatedClassName(automated: boolean): string {
  return automated
    ? 'border-transparent bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
    : 'border-transparent bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
}

export default function AiWorkbenchCaseGeneration(): JSX.Element {
  const [cases, setCases] = useState<GeneratedTestCase[]>(caseGenerationMock);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filters, setFilters] = useState<CaseFilters>(emptyFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentEditingCase, setCurrentEditingCase] = useState<GeneratedTestCase | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<CaseType[]>(['功能正向', '异常流程', '边界值']);
  const [granularity, setGranularity] = useState('标准粒度');
  const [template, setTemplate] = useState(templates[0]);
  const [countPerPoint, setCountPerPoint] = useState(3);

  const modules = useMemo(() => Array.from(new Set(cases.map((item) => item.module))), [cases]);

  const filteredCases = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return cases.filter((item) => {
      const matchesKeyword =
        keyword.length === 0 ||
        [item.caseNo, item.module, item.title, item.precondition, item.steps, item.expectedResult]
          .join(' ')
          .toLowerCase()
          .includes(keyword);
      const matchesModule = filters.module === '全部模块' || item.module === filters.module;
      const matchesType = filters.caseType === '全部类型' || item.caseType === filters.caseType;
      const matchesPriority = filters.priority === '全部优先级' || item.priority === filters.priority;
      const matchesAutomated =
        filters.automated === '全部' ||
        (filters.automated === '是' && item.automated) ||
        (filters.automated === '否' && !item.automated);

      return matchesKeyword && matchesModule && matchesType && matchesPriority && matchesAutomated;
    });
  }, [cases, filters, searchKeyword]);

  const isAllVisibleSelected = filteredCases.length > 0 && filteredCases.every((item) => selectedIds.includes(item.id));
  const exportTargets = selectedIds.length > 0 ? cases.filter((item) => selectedIds.includes(item.id)) : filteredCases;

  const updateFilter = (key: keyof CaseFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const toggleType = (caseType: CaseType) => {
    setSelectedTypes((current) =>
      current.includes(caseType) ? current.filter((item) => item !== caseType) : [...current, caseType]
    );
  };

  const handleGenerate = (regenerate = false) => {
    setIsGenerating(true);
    window.setTimeout(() => {
      setIsGenerating(false);
      toast.success(regenerate ? '重新生成完成' : '生成测试用例完成');
    }, 800);
  };

  const openDrawer = (testCase: GeneratedTestCase) => {
    setCurrentEditingCase({ ...testCase });
    setIsDrawerOpen(true);
  };

  const saveEditingCase = () => {
    if (!currentEditingCase) {
      return;
    }

    const requiredFields = [
      currentEditingCase.title,
      currentEditingCase.module,
      currentEditingCase.priority,
      currentEditingCase.caseType,
      currentEditingCase.precondition,
      currentEditingCase.steps,
      currentEditingCase.expectedResult,
    ];

    if (requiredFields.some((field) => field.trim().length === 0)) {
      toast.error('请完善必填信息');
      return;
    }

    const updatedCase: GeneratedTestCase = {
      ...currentEditingCase,
      updateTime: getCurrentTime(),
    };

    setCases((current) => current.map((item) => (item.id === updatedCase.id ? updatedCase : item)));
    setCurrentEditingCase(updatedCase);
    setIsDrawerOpen(false);
    toast.success('保存成功');
  };

  const deleteCase = (testCase: GeneratedTestCase) => {
    if (!window.confirm(`确认删除用例「${testCase.title}」吗？`)) {
      return;
    }

    setCases((current) => current.filter((item) => item.id !== testCase.id));
    setSelectedIds((current) => current.filter((id) => id !== testCase.id));
    toast.success('删除成功');
  };

  const copyCase = (testCase: GeneratedTestCase) => {
    const copiedCase: GeneratedTestCase = {
      ...testCase,
      id: `case-${Date.now()}`,
      caseNo: createNextCaseNo(cases),
      title: `${testCase.title}- 副本`,
      updateTime: getCurrentTime(),
    };

    setCases((current) => [copiedCase, ...current]);
    toast.success('复制成功');
  };

  const deleteSelectedCases = () => {
    if (selectedIds.length === 0) {
      toast.error('请先选择用例');
      return;
    }

    if (!window.confirm(`确认删除已选中的 ${selectedIds.length} 条用例吗？`)) {
      return;
    }

    setCases((current) => current.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
    toast.success('批量删除成功');
  };

  const exportCases = () => {
    if (exportTargets.length === 0) {
      toast.error('暂无可导出的用例');
      return;
    }

    const blob = new Blob([JSON.stringify(exportTargets, null, 2)], { type: 'application/json;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'test-cases-export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
    toast.success(`已导出 ${exportTargets.length} 条用例`);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((current) => Array.from(new Set([...current, ...filteredCases.map((item) => item.id)])));
      return;
    }

    setSelectedIds((current) => current.filter((id) => !filteredCases.some((item) => item.id === id)));
  };

  const updateEditingCase = <K extends keyof GeneratedTestCase>(key: K, value: GeneratedTestCase[K]) => {
    setCurrentEditingCase((current) => (current ? { ...current, [key]: value } : current));
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge className="mb-3 border-transparent bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              已生成 86 条用例
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">用例生成与编辑</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              根据已确认的测试点自动生成测试用例，并支持人工编辑、复制、删除和导出
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
            <Sparkles className="h-5 w-5" />
            <span>AI 已完成测试点拆解，可继续细化生成策略</span>
          </div>
        </div>

        <Card className="border-blue-100 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <SlidersHorizontal className="h-5 w-5 text-blue-600" />
              生成配置
            </CardTitle>
            <CardDescription>选择类型、颗粒度、模板和每个测试点生成数量后生成测试用例。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 xl:grid-cols-[1.4fr_1fr_1fr_auto]">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">用例类型</p>
              <div className="flex flex-wrap gap-2">
                {caseTypes.map((caseType) => (
                  <Button
                    key={caseType}
                    type="button"
                    variant={selectedTypes.includes(caseType) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleType(caseType)}
                  >
                    {caseType}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">用例颗粒度</p>
              <div className="space-y-2">
                {granularities.map((item) => (
                  <label key={item} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input
                      type="radio"
                      name="granularity"
                      value={item}
                      checked={granularity === item}
                      onChange={(event) => setGranularity(event.target.value)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                用例模板
                <select
                  value={template}
                  onChange={(event) => setTemplate(event.target.value)}
                  className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                >
                  {templates.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">每个测试点生成数量</p>
                <div className="flex w-fit items-center rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setCountPerPoint((current) => Math.max(1, current - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center text-sm font-semibold">{countPerPoint}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setCountPerPoint((current) => Math.min(10, current + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end gap-2">
              <Button type="button" className="gap-2" disabled={isGenerating} onClick={() => handleGenerate(false)}>
                <Sparkles className="h-4 w-4" />
                {isGenerating ? '生成中...' : '生成测试用例'}
              </Button>
              <Button type="button" variant="outline" className="gap-2" disabled={isGenerating} onClick={() => handleGenerate(true)}>
                <RefreshCw className="h-4 w-4" />
                重新生成
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm dark:border-slate-800">
          <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-blue-600" />
                测试用例列表
              </CardTitle>
              <CardDescription>当前展示 {filteredCases.length} 条，已选择 {selectedIds.length} 条。</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="gap-2" onClick={deleteSelectedCases}>
                <Trash2 className="h-4 w-4" />
                多选删除
              </Button>
              <Button type="button" variant="outline" className="gap-2" onClick={exportCases}>
                <Download className="h-4 w-4" />
                批量导出
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="搜索编号、标题、模块、步骤或预期结果"
                  className="pl-9"
                />
              </div>
              <select
                value={filters.module}
                onChange={(event) => updateFilter('module', event.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option>全部模块</option>
                {modules.map((moduleName) => (
                  <option key={moduleName}>{moduleName}</option>
                ))}
              </select>
              <select
                value={filters.caseType}
                onChange={(event) => updateFilter('caseType', event.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option>全部类型</option>
                {caseTypes.map((caseType) => (
                  <option key={caseType}>{caseType}</option>
                ))}
              </select>
              <select
                value={filters.priority}
                onChange={(event) => updateFilter('priority', event.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option>全部优先级</option>
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
              <select
                value={filters.automated}
                onChange={(event) => updateFilter('automated', event.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option>全部</option>
                <option>是</option>
                <option>否</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full min-w-[1180px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <Checkbox checked={isAllVisibleSelected} onCheckedChange={(checked) => toggleSelectAll(checked === true)} />
                    </th>
                    <th className="px-4 py-3">用例编号</th>
                    <th className="px-4 py-3">所属模块</th>
                    <th className="px-4 py-3">标题</th>
                    <th className="px-4 py-3">优先级</th>
                    <th className="px-4 py-3">类型</th>
                    <th className="px-4 py-3">自动化</th>
                    <th className="px-4 py-3">更新时间</th>
                    <th className="px-4 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950/40">
                  {filteredCases.map((testCase) => {
                    const isSelected = selectedIds.includes(testCase.id);

                    return (
                      <tr key={testCase.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-900">
                        <td className="px-4 py-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              setSelectedIds((current) =>
                                checked === true
                                  ? [...current, testCase.id]
                                  : current.filter((id) => id !== testCase.id)
                              );
                            }}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            className="font-mono font-semibold text-blue-600 hover:underline dark:text-blue-400"
                            onClick={() => openDrawer(testCase)}
                          >
                            {testCase.caseNo}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{testCase.module}</td>
                        <td className="max-w-[320px] px-4 py-4 font-medium text-slate-900 dark:text-white">
                          {testCase.title}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className={cn('font-semibold', priorityClassName(testCase.priority))}>
                            {testCase.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{testCase.caseType}</td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className={cn('font-semibold', automatedClassName(testCase.automated))}>
                            {testCase.automated ? '是' : '否'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-slate-500">{testCase.updateTime}</td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-1">
                            <Button type="button" variant="ghost" size="sm" onClick={() => openDrawer(testCase)}>
                              查看
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => openDrawer(testCase)}>
                              编辑
                            </Button>
                            <Button type="button" variant="ghost" size="sm" className="gap-1" onClick={() => copyCase(testCase)}>
                              <Copy className="h-3.5 w-3.5" />
                              复制
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => deleteCase(testCase)}
                            >
                              删除
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredCases.length === 0 && (
                <div className="bg-white py-12 text-center text-sm text-slate-500 dark:bg-slate-950/40">
                  暂无匹配用例，请调整搜索关键字或筛选条件。
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="flex h-full w-full flex-col overflow-y-auto p-6 sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>用例详情编辑</SheetTitle>
            <SheetDescription>编辑标题、步骤、测试数据和预期结果，保存后将刷新更新时间。</SheetDescription>
          </SheetHeader>

          {currentEditingCase && (
            <div className="mt-6 flex-1 space-y-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                标题 <span className="text-red-500">*</span>
                <Input
                  value={currentEditingCase.title}
                  onChange={(event) => updateEditingCase('title', event.target.value)}
                  className="mt-2"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  模块 <span className="text-red-500">*</span>
                  <Input
                    value={currentEditingCase.module}
                    onChange={(event) => updateEditingCase('module', event.target.value)}
                    className="mt-2"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  优先级 <span className="text-red-500">*</span>
                  <select
                    value={currentEditingCase.priority}
                    onChange={(event) => updateEditingCase('priority', event.target.value as CasePriority)}
                    className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                  >
                    {priorities.map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  类型 <span className="text-red-500">*</span>
                  <select
                    value={currentEditingCase.caseType}
                    onChange={(event) => updateEditingCase('caseType', event.target.value as CaseType)}
                    className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                  >
                    {caseTypes.map((caseType) => (
                      <option key={caseType}>{caseType}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  是否自动化
                  <select
                    value={currentEditingCase.automated ? '是' : '否'}
                    onChange={(event) => updateEditingCase('automated', event.target.value === '是')}
                    className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option>是</option>
                    <option>否</option>
                  </select>
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                前置条件 <span className="text-red-500">*</span>
                <Textarea
                  value={currentEditingCase.precondition}
                  onChange={(event) => updateEditingCase('precondition', event.target.value)}
                  className="mt-2"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                步骤 <span className="text-red-500">*</span>
                <Textarea
                  value={currentEditingCase.steps}
                  onChange={(event) => updateEditingCase('steps', event.target.value)}
                  className="mt-2 min-h-[140px]"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                数据
                <Textarea
                  value={currentEditingCase.testData}
                  onChange={(event) => updateEditingCase('testData', event.target.value)}
                  className="mt-2"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                预期结果 <span className="text-red-500">*</span>
                <Textarea
                  value={currentEditingCase.expectedResult}
                  onChange={(event) => updateEditingCase('expectedResult', event.target.value)}
                  className="mt-2"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                备注
                <Textarea
                  value={currentEditingCase.remark}
                  onChange={(event) => updateEditingCase('remark', event.target.value)}
                  className="mt-2"
                />
              </label>
            </div>
          )}

          <SheetFooter className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsDrawerOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={saveEditingCase}>
              保存
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
