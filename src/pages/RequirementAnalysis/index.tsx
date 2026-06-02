import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ModuleCards from "./components/ModuleCards";
import QuestionTable from "./components/QuestionTable";
import RiskCards from "./components/RiskCards";
import SummaryCards from "./components/SummaryCards";
import TestPointDetailDrawer from "./components/TestPointDetailDrawer";
import TestPointFormModal from "./components/TestPointFormModal";
import TestPointTable from "./components/TestPointTable";
import { generatedOptions, moduleOptions, modules, priorityOptions, requirementQuestions, risks, testPoints, testTypeOptions } from "./mock";
import type { QuestionStatus, RiskPoint, TestPoint, TestPointFilters, TestPointFormValues } from "./types";

const defaultFilters: TestPointFilters = {
  module: "",
  type: "",
  priority: "",
  generated: "全部",
  keyword: "",
};

function createGeneratedTestPoints(startNumber: number): TestPoint[] {
  return [
    {
      id: `tp-${startNumber}`,
      code: `TP-${String(startNumber).padStart(3, "0")}`,
      module: "AI 测试点抽取",
      description: "验证重新生成测试点后系统可识别低置信度结果并提示人工复核。",
      type: "功能测试",
      priority: "P1",
      generated: false,
      caseCount: 0,
      relatedRisk: "AI 抽取结果未经确认直接流转",
      remark: "由模拟 AI 分析追加，需业务人员二次确认。",
    },
    {
      id: `tp-${startNumber + 1}`,
      code: `TP-${String(startNumber + 1).padStart(3, "0")}`,
      module: "用例生成编排",
      description: "验证批量生成过程中出现单条失败时成功项仍保留且失败项可重试。",
      type: "异常测试",
      priority: "P0",
      generated: false,
      caseCount: 0,
      relatedRisk: "用例重复生成",
      remark: "关注失败重试和批量结果提示。",
    },
  ];
}

function RequirementAnalysis() {
  const [moduleList] = useState(modules);
  const [questionList, setQuestionList] = useState(requirementQuestions);
  const [riskList] = useState<RiskPoint[]>(risks);
  const [testPointList, setTestPointList] = useState<TestPoint[]>(testPoints);
  const [filters, setFilters] = useState<TestPointFilters>(defaultFilters);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [currentTestPoint, setCurrentTestPoint] = useState<TestPoint | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [summarySeed, setSummarySeed] = useState(0);

  const filteredTestPoints = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return testPointList.filter((item) => {
      const matchedModule = !filters.module || item.module === filters.module;
      const matchedType = !filters.type || item.type === filters.type;
      const matchedPriority = !filters.priority || item.priority === filters.priority;
      const matchedGenerated = filters.generated === "全部" || (filters.generated === "已生成" ? item.generated : !item.generated);
      const matchedKeyword = !keyword || [item.code, item.module, item.description, item.type, item.priority, item.relatedRisk ?? "", item.remark ?? ""].some((value) => value.toLowerCase().includes(keyword));
      return matchedModule && matchedType && matchedPriority && matchedGenerated && matchedKeyword;
    });
  }, [filters, testPointList]);

  const nextNumber = useMemo(() => {
    const numbers = testPointList.map((item) => Number(item.code.replace("TP-", ""))).filter((num) => Number.isFinite(num));
    return Math.max(0, ...numbers) + 1;
  }, [testPointList]);
  const nextCode = `TP-${String(nextNumber).padStart(3, "0")}`;

  const handleReanalyze = () => {
    setReanalyzing(true);
    window.setTimeout(() => {
      setSummarySeed((prev) => prev + 1);
      setReanalyzing(false);
      toast.success("需求分析已刷新，统计结果已更新");
    }, 1000);
  };

  const handleGenerateTestPoints = () => {
    setGenerating(true);
    window.setTimeout(() => {
      setTestPointList((prev) => [...createGeneratedTestPoints(nextNumber), ...prev]);
      setSummarySeed((prev) => prev + 1);
      setGenerating(false);
      toast.success("已生成 2 条测试点，请确认后进入用例生成流程");
    }, 1000);
  };

  const handleConfirmTestPoints = () => {
    toast.success("测试点已确认，可进入用例生成流程");
  };

  const handleUpdateQuestionStatus = (id: string, status: QuestionStatus) => {
    setQuestionList((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    toast.success(`需求疑问已标记为${status}`);
  };

  const openCreateModal = () => {
    setCurrentTestPoint(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const openEditModal = (testPoint: TestPoint) => {
    setCurrentTestPoint(testPoint);
    setFormMode("edit");
    setIsDrawerOpen(false);
    setIsFormOpen(true);
  };

  const handleSaveTestPoint = (values: TestPointFormValues) => {
    if (formMode === "create") {
      const newPoint: TestPoint = {
        id: `tp-${nextNumber}`,
        code: nextCode,
        module: values.module,
        description: values.description,
        type: values.type || "功能测试",
        priority: values.priority || "P2",
        generated: values.generated,
        caseCount: values.generated ? 1 : 0,
        relatedRisk: values.relatedRisk,
        remark: values.remark,
      };
      setTestPointList((prev) => [newPoint, ...prev]);
      toast.success("测试点已新增");
    } else if (currentTestPoint) {
      setTestPointList((prev) => prev.map((item) => (item.id === currentTestPoint.id ? {
        ...item,
        module: values.module,
        description: values.description,
        type: values.type || item.type,
        priority: values.priority || item.priority,
        generated: values.generated,
        caseCount: values.generated ? Math.max(item.caseCount, 1) : 0,
        relatedRisk: values.relatedRisk,
        remark: values.remark,
      } : item)));
      toast.success("测试点已更新");
    }
    setIsFormOpen(false);
  };

  const handleView = (testPoint: TestPoint) => {
    setCurrentTestPoint(testPoint);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("确认删除该测试点吗？")) return;
    setTestPointList((prev) => prev.filter((item) => item.id !== id));
    setSelectedRowKeys((prev) => prev.filter((item) => item !== id));
    toast.success("测试点已删除");
  };

  const handleGenerateCase = (id: string) => {
    setTestPointList((prev) => prev.map((item) => (item.id === id ? { ...item, generated: true, caseCount: item.caseCount + 1 } : item)));
    toast.success("用例已生成");
  };

  const handleBatchGenerate = () => {
    if (selectedRowKeys.length === 0) {
      toast.info("请先选择测试点");
      return;
    }
    setTestPointList((prev) => prev.map((item) => (selectedRowKeys.includes(item.id) ? { ...item, generated: true, caseCount: item.generated ? item.caseCount : Math.max(item.caseCount + 1, 1) } : item)));
    toast.success(`已为 ${selectedRowKeys.length} 个测试点批量生成用例`);
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      toast.info("请先选择测试点");
      return;
    }
    if (!window.confirm(`确认删除选中的 ${selectedRowKeys.length} 个测试点吗？`)) return;
    setTestPointList((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)));
    setSelectedRowKeys([]);
    toast.success("已批量删除测试点");
  };

  const handleSelectModule = (moduleName: string) => {
    setFilters((prev) => ({ ...prev, module: moduleName }));
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] space-y-6 p-6">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">需求分析与测试点</h1>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">通过 AI 分析识别功能模块、需求疑问与风险点，抽取关键测试点，确保测试全面覆盖核心业务逻辑。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={reanalyzing} onClick={handleReanalyze}><RefreshCw className={`mr-2 h-4 w-4 ${reanalyzing ? "animate-spin" : ""}`} />重新分析</Button>
              <Button disabled={generating} onClick={handleGenerateTestPoints} className="bg-blue-600 hover:bg-blue-700"><Wand2 className={`mr-2 h-4 w-4 ${generating ? "animate-pulse" : ""}`} />生成测试点</Button>
              <Button variant="outline" onClick={handleConfirmTestPoints}><CheckCircle2 className="mr-2 h-4 w-4 text-teal-600" />确认测试点</Button>
            </div>
          </div>
        </section>

        <SummaryCards seed={summarySeed} moduleCount={moduleList.length} testPointCount={testPointList.length} questionCount={questionList.length} riskCount={riskList.length} />
        <ModuleCards modules={moduleList} selectedModule={filters.module} onSelectModule={handleSelectModule} />
        <TestPointTable
          testPoints={filteredTestPoints}
          filters={filters}
          selectedRowKeys={selectedRowKeys}
          moduleOptions={moduleOptions}
          testTypeOptions={testTypeOptions}
          priorityOptions={priorityOptions}
          generatedOptions={generatedOptions}
          onFiltersChange={setFilters}
          onResetFilters={() => setFilters(defaultFilters)}
          onSelectedRowKeysChange={setSelectedRowKeys}
          onCreate={openCreateModal}
          onView={handleView}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onGenerateCase={handleGenerateCase}
          onBatchGenerate={handleBatchGenerate}
          onBatchDelete={handleBatchDelete}
        />
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <QuestionTable questions={questionList} onUpdateStatus={handleUpdateQuestionStatus} />
          <RiskCards risks={riskList} />
        </div>
      </div>

      <TestPointFormModal
        open={isFormOpen}
        mode={formMode}
        currentTestPoint={currentTestPoint}
        moduleOptions={moduleOptions}
        testTypeOptions={testTypeOptions}
        priorityOptions={priorityOptions}
        nextCode={nextCode}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveTestPoint}
      />
      <TestPointDetailDrawer open={isDrawerOpen} testPoint={currentTestPoint} onOpenChange={setIsDrawerOpen} onEdit={openEditModal} />
    </main>
  );
}

export default RequirementAnalysis;
