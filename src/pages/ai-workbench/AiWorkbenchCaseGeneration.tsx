import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  Eye,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSearch } from 'wouter/use-location';
import AICases from '@/pages/cases/AICases';
import { useAiGeneration } from '@/contexts/AiGenerationContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  CASE_MODULES,
  CASE_PRIORITIES,
  CASE_TYPES,
  createMockTestCases,
  type CaseModule,
  type CasePriority,
  type CaseType,
  type GeneratedTestCase,
} from './caseGenerationMock';

const TEST_POINT_COUNT = 43;
const DEFAULT_CASE_COUNT_PER_POINT = 2;
const GENERATED_CASE_TOTAL = TEST_POINT_COUNT * DEFAULT_CASE_COUNT_PER_POINT;
const CASE_TEMPLATES = ['标准功能用例模板（推荐）', '接口测试用例模板', '并发测试用例模板', '简版测试点模板'];
const GRANULARITIES = ['简单版', '标准版', '详细版'] as const;
const WORKSPACE_QUERY_PARAMS = ['docId', 'autoGenerate', 'initName', 'initReq'] as const;
type Granularity = (typeof GRANULARITIES)[number];
type AutomationFilter = '全部' | '是' | '否';
type SelectAllState = boolean | 'indeterminate';

type CaseFormState = Pick<
  GeneratedTestCase,
  | 'title'
  | 'module'
  | 'priority'
  | 'caseType'
  | 'automated'
  | 'precondition'
  | 'steps'
  | 'testData'
  | 'expectedResult'
  | 'remark'
>;

interface SelectFieldProps<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  placeholder?: string;
}

function SelectField<T extends string>({ value, options, onChange, placeholder = '请选择' }: SelectFieldProps<T>) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function FilterSelect<T extends string>({ value, options, onChange }: SelectFieldProps<T>) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function FieldLabel({ children, required = false }: { children: string; required?: boolean }) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
      {children}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
  );
}

function priorityClass(priority: CasePriority): string {
  if (priority === 'P0') return 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300';
  if (priority === 'P1') return 'border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300';
  if (priority === 'P2') return 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300';
  return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

function typeClass(caseType: CaseType): string {
  if (caseType === '并发测试') return 'border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300';
  if (caseType === '异常测试') return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
  if (caseType === '边界值') return 'border-cyan-200 bg-cyan-50 text-cyan-600 dark:border-cyan-900/60 dark:bg-cyan-950/40 dark:text-cyan-300';
  return 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300';
}

function formatNow(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function createCaseNo(cases: GeneratedTestCase[]): string {
  const next =
    cases.reduce((max, item) => {
      const suffix = Number(item.caseNo.split('-').at(-1));
      return Number.isFinite(suffix) ? Math.max(max, suffix) : max;
    }, 0) + 1;
  return `TC-20240520-${String(next).padStart(4, '0')}`;
}

function toFormState(testCase: GeneratedTestCase): CaseFormState {
  return {
    title: testCase.title,
    module: testCase.module,
    priority: testCase.priority,
    caseType: testCase.caseType,
    automated: testCase.automated,
    precondition: testCase.precondition,
    steps: testCase.steps,
    testData: testCase.testData,
    expectedResult: testCase.expectedResult,
    remark: testCase.remark ?? '',
  };
}

function hasWorkspaceParams(search: string): boolean {
  const query = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(query);
  return WORKSPACE_QUERY_PARAMS.some((paramName) => params.has(paramName));
}

function exportCases(cases: GeneratedTestCase[]) {
  const payload = cases.map((item) => ({
    用例编号: item.caseNo,
    所属模块: item.module,
    用例标题: item.title,
    前置条件: item.precondition,
    测试步骤: item.steps,
    测试数据: item.testData,
    预期结果: item.expectedResult,
    优先级: item.priority,
    用例类型: item.caseType,
    是否自动化: item.automated ? '是' : '否',
    备注: item.remark ?? '',
  }));
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'test-cases-export.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function StandaloneAiWorkbenchCaseGeneration(): JSX.Element {
  const { notifyStart, notifyDone } = useAiGeneration();
  const [selectedTypes, setSelectedTypes] = useState<CaseType[]>(['功能测试']);
  const [granularity, setGranularity] = useState<Granularity>('标准版');
  const [template, setTemplate] = useState(CASE_TEMPLATES[0]);
  const [caseCountPerPoint, setCaseCountPerPoint] = useState(DEFAULT_CASE_COUNT_PER_POINT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [cases, setCases] = useState<GeneratedTestCase[]>([]);
  const [keyword, setKeyword] = useState('');
  const [moduleFilter, setModuleFilter] = useState<'全部' | CaseModule>('全部');
  const [typeFilter, setTypeFilter] = useState<'全部' | CaseType>('全部');
  const [priorityFilter, setPriorityFilter] = useState<'全部' | CasePriority>('全部');
  const [automationFilter, setAutomationFilter] = useState<AutomationFilter>('全部');
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<GeneratedTestCase | null>(null);
  const [formState, setFormState] = useState<CaseFormState | null>(null);

  const estimatedCount = TEST_POINT_COUNT * caseCountPerPoint;
  const generatedCount = hasGenerated ? GENERATED_CASE_TOTAL : 0;

  const filteredCases = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return cases.filter((item) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        item.caseNo.toLowerCase().includes(normalizedKeyword) ||
        item.title.toLowerCase().includes(normalizedKeyword) ||
        item.module.toLowerCase().includes(normalizedKeyword);
      const matchesModule = moduleFilter === '全部' || item.module === moduleFilter;
      const matchesType = typeFilter === '全部' || item.caseType === typeFilter;
      const matchesPriority = priorityFilter === '全部' || item.priority === priorityFilter;
      const matchesAutomation =
        automationFilter === '全部' || (automationFilter === '是' ? item.automated : !item.automated);
      return matchesKeyword && matchesModule && matchesType && matchesPriority && matchesAutomation;
    });
  }, [automationFilter, cases, keyword, moduleFilter, priorityFilter, typeFilter]);

  const selectedCases = useMemo(
    () => cases.filter((item) => selectedCaseIds.includes(item.id)),
    [cases, selectedCaseIds]
  );

  const allFilteredSelected = filteredCases.length > 0 && filteredCases.every((item) => selectedCaseIds.includes(item.id));
  const someFilteredSelected = filteredCases.some((item) => selectedCaseIds.includes(item.id));
  const selectAllState: SelectAllState = allFilteredSelected ? true : someFilteredSelected ? 'indeterminate' : false;

  const runGeneration = () => {
    setIsGenerating(true);
    setHasGenerated(false);
    setSelectedCaseIds([]);
    notifyStart();
    window.setTimeout(() => {
      setCases(createMockTestCases(GENERATED_CASE_TOTAL));
      setHasGenerated(true);
      setIsGenerating(false);
      notifyDone();
      toast.success('测试用例生成成功');
    }, 1000);
  };

  const handleRegenerate = () => {
    if (window.confirm('重新生成会覆盖当前未保存的用例修改，是否继续？')) {
      runGeneration();
    }
  };

  const toggleCaseType = (caseType: CaseType) => {
    setSelectedTypes((current) => {
      if (current.includes(caseType)) {
        return current.length === 1 ? current : current.filter((item) => item !== caseType);
      }
      return [...current, caseType];
    });
  };

  const resetFilters = () => {
    setKeyword('');
    setModuleFilter('全部');
    setTypeFilter('全部');
    setPriorityFilter('全部');
    setAutomationFilter('全部');
  };

  const openDrawer = (testCase: GeneratedTestCase) => {
    setEditingCase(testCase);
    setFormState(toFormState(testCase));
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingCase(null);
    setFormState(null);
  };

  const updateForm = <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => {
    setFormState((current) => (current ? { ...current, [key]: value } : current));
  };

  const validateForm = (state: CaseFormState | null): state is CaseFormState => {
    if (!state) return false;
    return Boolean(
      state.title.trim() &&
        state.module &&
        state.priority &&
        state.caseType &&
        state.precondition.trim() &&
        state.steps.trim() &&
        state.expectedResult.trim()
    );
  };

  const handleSave = () => {
    if (!editingCase || !validateForm(formState)) {
      toast.error('请完善必填信息');
      return;
    }
    const updateTime = formatNow();
    setCases((current) =>
      current.map((item) => (item.id === editingCase.id ? { ...item, ...formState, updateTime } : item))
    );
    closeDrawer();
    toast.success('保存成功');
  };

  const deleteCaseById = (id: string, closeAfterDelete = false) => {
    if (!window.confirm('确认删除该测试用例？')) return;
    setCases((current) => current.filter((item) => item.id !== id));
    setSelectedCaseIds((current) => current.filter((item) => item !== id));
    if (closeAfterDelete) closeDrawer();
    toast.success('删除成功');
  };

  const copyCase = (testCase: GeneratedTestCase, closeAfterCopy = false) => {
    const updateTime = formatNow();
    setCases((current) => {
      const copied: GeneratedTestCase = {
        ...testCase,
        id: `case-copy-${Date.now()}`,
        caseNo: createCaseNo(current),
        title: `${testCase.title} - 副本`,
        updateTime,
      };
      return [copied, ...current];
    });
    if (closeAfterCopy) closeDrawer();
    toast.success('复制成功');
  };

  const handleBatchDelete = () => {
    if (selectedCaseIds.length === 0) {
      toast.warning('请先选择需要批量操作的测试用例');
      return;
    }
    if (!window.confirm('确认删除选中的测试用例？')) return;
    setCases((current) => current.filter((item) => !selectedCaseIds.includes(item.id)));
    setSelectedCaseIds([]);
    toast.success('批量删除成功');
  };

  const handleBatchExport = () => {
    const data = selectedCases.length > 0 ? selectedCases : filteredCases;
    if (data.length === 0) {
      toast.warning('暂无可导出的测试用例');
      return;
    }
    exportCases(data);
    toast.success('批量导出成功');
  };

  const toggleSelectAll = (checked: boolean) => {
    const filteredIds = filteredCases.map((item) => item.id);
    setSelectedCaseIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...filteredIds]));
      }
      return current.filter((id) => !filteredIds.includes(id));
    });
  };

  const toggleSelectCase = (id: string, checked: boolean) => {
    setSelectedCaseIds((current) => (checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id)));
  };

  return (
    <div className="min-h-full bg-slate-50/80 px-6 py-6 dark:bg-slate-950">
      <div className="mx-auto max-w-[1480px] space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 text-sm text-slate-500 dark:text-slate-400">页面 4 / 6 · 用例生成与编辑</div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">用例生成与编辑</h1>
              <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="mr-1 h-2 w-2 rounded-full bg-emerald-500" /> 已生成 {generatedCount} 条用例
              </Badge>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-5 xl:grid-cols-[1fr_240px]">
            <div className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[140px_1fr] lg:items-center">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">用例类型</div>
                <div className="flex flex-wrap gap-3">
                  {CASE_TYPES.map((caseType) => {
                    const active = selectedTypes.includes(caseType);
                    return (
                      <button
                        key={caseType}
                        type="button"
                        onClick={() => toggleCaseType(caseType)}
                        className={cn(
                          'inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition',
                          active
                            ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-950/40 dark:text-blue-300'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                        )}
                      >
                        {active ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        {caseType}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[140px_1fr] lg:items-center">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">用例颗粒度</div>
                <div className="flex flex-wrap gap-3">
                  {GRANULARITIES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setGranularity(item)}
                      className={cn(
                        'inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition',
                        granularity === item
                          ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-950/40 dark:text-blue-300'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                      )}
                    >
                      {granularity === item ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[140px_360px_1fr] lg:items-center">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">用例模板</div>
                <select
                  value={template}
                  onChange={(event) => setTemplate(event.target.value)}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {CASE_TEMPLATES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <button type="button" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
                  <Plus className="h-4 w-4" /> 管理模板
                </button>
              </div>

              <div className="grid gap-3 lg:grid-cols-[140px_1fr] lg:items-center">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">每个测试点生成数量</div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex h-10 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <button
                      type="button"
                      className="w-10 border-r border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      disabled={caseCountPerPoint <= 1}
                      onClick={() => setCaseCountPerPoint((current) => Math.max(1, current - 1))}
                    >
                      −
                    </button>
                    <div className="flex w-12 items-center justify-center text-sm font-semibold text-slate-800 dark:text-slate-100">{caseCountPerPoint}</div>
                    <button
                      type="button"
                      className="w-10 border-l border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      disabled={caseCountPerPoint >= 5}
                      onClick={() => setCaseCountPerPoint((current) => Math.min(5, current + 1))}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    当前共 {TEST_POINT_COUNT} 个测试点，预计生成 {estimatedCount} 条用例
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 border-t border-slate-100 pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0 dark:border-slate-800">
              <Button className="h-12 bg-blue-600 text-white hover:bg-blue-700" onClick={runGeneration} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                生成测试用例
              </Button>
              <Button variant="outline" className="h-12" onClick={handleRegenerate} disabled={isGenerating || cases.length === 0}>
                <RefreshCw className="mr-2 h-4 w-4" /> 重新生成
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[280px] flex-1 lg:max-w-[430px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="搜索用例编号、标题或关键词"
                  className="pl-9"
                />
              </div>
              <FilterSelect value={moduleFilter} options={['全部', ...CASE_MODULES]} onChange={setModuleFilter} />
              <FilterSelect value={typeFilter} options={['全部', ...CASE_TYPES]} onChange={setTypeFilter} />
              <FilterSelect value={priorityFilter} options={['全部', ...CASE_PRIORITIES]} onChange={setPriorityFilter} />
              <FilterSelect value={automationFilter} options={['全部', '是', '否']} onChange={setAutomationFilter} />
              <Button variant="outline" onClick={resetFilters}>重置</Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">测试用例列表</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                共 {cases.length} 条用例，当前展示 {filteredCases.length} 条，已选择 {selectedCaseIds.length} 条
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBatchDelete} disabled={selectedCaseIds.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" /> 批量操作
              </Button>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50" onClick={handleBatchExport} disabled={cases.length === 0}>
                <Download className="mr-2 h-4 w-4" /> 批量导出
              </Button>
            </div>
          </div>

          <div className="px-4 pb-4">
            {isGenerating ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-blue-200 bg-blue-50/60 text-blue-600 dark:border-blue-900/60 dark:bg-blue-950/20">
                <Loader2 className="mb-3 h-8 w-8 animate-spin" />
                <p className="font-medium">AI 正在生成测试用例，请稍候...</p>
              </div>
            ) : cases.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <FileText className="mb-3 h-10 w-10 text-slate-300" />
                <p className="font-medium">暂无测试用例，请先点击「生成测试用例」</p>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <Search className="mb-3 h-10 w-10 text-slate-300" />
                <p className="font-medium">未找到匹配的测试用例，请调整筛选条件</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="overflow-x-auto">
                  <table className="min-w-[1120px] w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-950/70 dark:text-slate-400">
                      <tr>
                        <th className="w-12 px-4 py-3">
                          <Checkbox checked={selectAllState} onCheckedChange={(checked) => toggleSelectAll(checked === true)} />
                        </th>
                        <th className="px-4 py-3">用例编号</th>
                        <th className="px-4 py-3">所属模块</th>
                        <th className="min-w-[280px] px-4 py-3">用例标题</th>
                        <th className="px-4 py-3">优先级</th>
                        <th className="px-4 py-3">用例类型</th>
                        <th className="px-4 py-3">是否自动化</th>
                        <th className="px-4 py-3">更新时间</th>
                        <th className="px-4 py-3 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredCases.map((item) => (
                        <tr key={item.id} className="bg-white transition hover:bg-blue-50/50 dark:bg-slate-900 dark:hover:bg-slate-800/70">
                          <td className="px-4 py-3">
                            <Checkbox checked={selectedCaseIds.includes(item.id)} onCheckedChange={(checked) => toggleSelectCase(item.id, checked === true)} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <button type="button" onClick={() => openDrawer(item)} className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                              {item.caseNo}
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">{item.module}</td>
                          <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{item.title}</td>
                          <td className="px-4 py-3">
                            <span className={cn('inline-flex rounded-md border px-2 py-1 text-xs font-semibold', priorityClass(item.priority))}>{item.priority}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('inline-flex rounded-md border px-2 py-1 text-xs font-medium', typeClass(item.caseType))}>{item.caseType}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'inline-flex rounded-md border px-2 py-1 text-xs font-semibold',
                                item.automated
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : 'border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300'
                              )}
                            >
                              {item.automated ? '是' : '否'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">{item.updateTime}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openDrawer(item)}><Eye className="mr-1 h-4 w-4" />查看</Button>
                              <Button variant="ghost" size="sm" onClick={() => openDrawer(item)}><Edit3 className="mr-1 h-4 w-4" />编辑</Button>
                              <Button variant="ghost" size="sm" onClick={() => copyCase(item)}><Copy className="mr-1 h-4 w-4" />复制</Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteCaseById(item.id)}><Trash2 className="mr-1 h-4 w-4" />删除</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <Sheet open={drawerOpen} onOpenChange={(open) => (open ? setDrawerOpen(true) : closeDrawer())}>
        <SheetContent side="right" className="flex w-full max-w-[520px] flex-col p-0 sm:max-w-[520px]">
          <SheetHeader className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <SheetTitle>用例详情编辑</SheetTitle>
          </SheetHeader>
          {formState && editingCase ? (
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div>
                <FieldLabel required>用例标题</FieldLabel>
                <Input value={formState.title} onChange={(event) => updateForm('title', event.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>所属模块</FieldLabel>
                  <SelectField value={formState.module} options={CASE_MODULES} onChange={(value) => updateForm('module', value)} />
                </div>
                <div>
                  <FieldLabel required>优先级</FieldLabel>
                  <SelectField value={formState.priority} options={CASE_PRIORITIES} onChange={(value) => updateForm('priority', value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>用例类型</FieldLabel>
                  <SelectField value={formState.caseType} options={CASE_TYPES} onChange={(value) => updateForm('caseType', value)} />
                </div>
                <div>
                  <FieldLabel>是否自动化</FieldLabel>
                  <button
                    type="button"
                    onClick={() => updateForm('automated', !formState.automated)}
                    className={cn(
                      'relative h-10 w-full rounded-md border px-3 text-left text-sm font-medium transition',
                      formState.automated
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    )}
                  >
                    <span className="flex items-center justify-between">
                      {formState.automated ? '是' : '否'}
                      <span className={cn('h-5 w-9 rounded-full p-0.5 transition', formState.automated ? 'bg-emerald-500' : 'bg-slate-300')}>
                        <span className={cn('block h-4 w-4 rounded-full bg-white transition', formState.automated ? 'translate-x-4' : 'translate-x-0')} />
                      </span>
                    </span>
                  </button>
                </div>
              </div>
              <div>
                <FieldLabel required>前置条件</FieldLabel>
                <Textarea value={formState.precondition} onChange={(event) => updateForm('precondition', event.target.value)} className="min-h-[96px]" />
              </div>
              <div>
                <FieldLabel required>测试步骤</FieldLabel>
                <Textarea value={formState.steps} onChange={(event) => updateForm('steps', event.target.value)} className="min-h-[128px]" />
              </div>
              <div>
                <FieldLabel>测试数据</FieldLabel>
                <Textarea value={formState.testData} onChange={(event) => updateForm('testData', event.target.value)} />
              </div>
              <div>
                <FieldLabel required>预期结果</FieldLabel>
                <Textarea value={formState.expectedResult} onChange={(event) => updateForm('expectedResult', event.target.value)} className="min-h-[128px]" />
              </div>
              <div>
                <FieldLabel>备注</FieldLabel>
                <Textarea value={formState.remark ?? ''} onChange={(event) => updateForm('remark', event.target.value)} placeholder="请输入备注（选填）" />
              </div>
            </div>
          ) : null}
          <SheetFooter className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => editingCase && deleteCaseById(editingCase.id, true)}>
              <Trash2 className="mr-2 h-4 w-4" /> 删除用例
            </Button>
            <Button variant="outline" onClick={() => editingCase && copyCase(editingCase)}>
              <Copy className="mr-2 h-4 w-4" /> 复制用例
            </Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleSave}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> 保存修改
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function AiWorkbenchCaseGeneration(): JSX.Element {
  const search = useSearch();

  // wouter's useLocation only exposes the pathname, so workspace routing must read location.search.
  if (hasWorkspaceParams(search)) {
    return <AICases />;
  }

  return <StandaloneAiWorkbenchCaseGeneration />;
}
