import { useMemo, useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ModuleCards from '@/pages/RequirementAnalysis/components/ModuleCards';
import QuestionTable from '@/pages/RequirementAnalysis/components/QuestionTable';
import RiskCards from '@/pages/RequirementAnalysis/components/RiskCards';
import SummaryCards from '@/pages/RequirementAnalysis/components/SummaryCards';
import TestPointDetailDrawer from '@/pages/RequirementAnalysis/components/TestPointDetailDrawer';
import TestPointFormModal from '@/pages/RequirementAnalysis/components/TestPointFormModal';
import TestPointTable from '@/pages/RequirementAnalysis/components/TestPointTable';
import { modules as mockModules, requirementQuestions, risks as mockRisks, testPoints as mockTestPoints } from '@/pages/RequirementAnalysis/mock';
import type {
  RequirementAnalysisFilters,
  RequirementModule,
  RequirementQuestion,
  RequirementRisk,
  TestPoint,
  TestPointFormValues,
  RiskLevel,
  TestPointModalMode,
  TestPointPriority,
  TestPointStatus,
} from '@/pages/RequirementAnalysis/types';
import styles from '@/pages/RequirementAnalysis/index.module.css';

const defaultFilters: RequirementAnalysisFilters = {
  moduleId: 'all',
  keyword: '',
  priority: 'all',
  status: 'all',
  riskLevel: 'all',
};

function buildTestPoint(values: TestPointFormValues, id: string, status: TestPointStatus): TestPoint {
  return {
    id,
    moduleId: values.moduleId,
    title: values.title.trim(),
    precondition: values.precondition.trim(),
    steps: values.stepsText.split('\n').map((step) => step.trim()).filter((step) => step.length > 0),
    expectedResult: values.expectedResult.trim(),
    priority: values.priority,
    type: values.type,
    status,
    relatedRiskIds: [],
    source: values.source.trim() || '人工补充',
  };
}

export default function RequirementAnalysis(): JSX.Element {
  const [modules, setModules] = useState<RequirementModule[]>(mockModules);
  const [questions, setQuestions] = useState<RequirementQuestion[]>(requirementQuestions);
  const [risks] = useState<RequirementRisk[]>(mockRisks);
  const [testPoints, setTestPoints] = useState<TestPoint[]>(mockTestPoints);
  const [filters, setFilters] = useState<RequirementAnalysisFilters>(defaultFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<TestPointModalMode>('create');
  const [editingTestPoint, setEditingTestPoint] = useState<TestPoint | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTestPoint, setDetailTestPoint] = useState<TestPoint | undefined>();

  const selectedModuleId = filters.moduleId === 'all' ? modules[0]?.id ?? 'all' : filters.moduleId;

  const visibleQuestions = useMemo(() => {
    return questions.filter((question) => filters.moduleId === 'all' || question.moduleId === filters.moduleId);
  }, [filters.moduleId, questions]);

  const visibleRisks = useMemo(() => {
    return risks.filter((risk) => {
      const moduleMatched = filters.moduleId === 'all' || risk.moduleId === filters.moduleId;
      const levelMatched = filters.riskLevel === 'all' || risk.level === filters.riskLevel;
      return moduleMatched && levelMatched;
    });
  }, [filters.moduleId, filters.riskLevel, risks]);

  const visibleTestPoints = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return testPoints.filter((point) => {
      const moduleMatched = filters.moduleId === 'all' || point.moduleId === filters.moduleId;
      const keywordMatched = keyword.length === 0 || `${point.title} ${point.expectedResult} ${point.source}`.toLowerCase().includes(keyword);
      const priorityMatched = filters.priority === 'all' || point.priority === filters.priority;
      const statusMatched = filters.status === 'all' || point.status === filters.status;
      return moduleMatched && keywordMatched && priorityMatched && statusMatched;
    });
  }, [filters, testPoints]);

  const handleSelectModule = (moduleId: string) => {
    setFilters((current) => ({ ...current, moduleId }));
    setSelectedIds([]);
  };

  const handleReanalyze = () => {
    setModules((current) => current.map((moduleItem) => ({
      ...moduleItem,
      status: moduleItem.status === 'confirmed' ? 'confirmed' : 'analyzed',
      coverage: Math.min(98, moduleItem.coverage + 3),
    })));
    setQuestions((current) => current.map((question) => question.priority === 'low' ? { ...question, status: 'answered' } : question));
  };

  const handleGenerateTestPoint = () => {
    setModalMode('generate');
    setEditingTestPoint(undefined);
    setModalOpen(true);
  };

  const handleConfirmTestPoints = (ids: string[]) => {
    setTestPoints((current) => current.map((point) => ids.includes(point.id) ? { ...point, status: 'confirmed' } : point));
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    if (detailTestPoint && ids.includes(detailTestPoint.id)) {
      setDetailTestPoint({ ...detailTestPoint, status: 'confirmed' });
    }
  };

  const handleSubmitTestPoint = (values: TestPointFormValues) => {
    if (editingTestPoint) {
      const updated = buildTestPoint(values, editingTestPoint.id, editingTestPoint.status);
      setTestPoints((current) => current.map((point) => point.id === editingTestPoint.id ? { ...updated, relatedRiskIds: point.relatedRiskIds } : point));
    } else {
      const created = buildTestPoint(values, `tp-${Date.now()}`, modalMode === 'generate' ? 'generated' : 'draft');
      setTestPoints((current) => [created, ...current]);
    }
    setModalOpen(false);
    setEditingTestPoint(undefined);
  };

  const handleEdit = (testPoint: TestPoint) => {
    setModalMode('edit');
    setEditingTestPoint(testPoint);
    setModalOpen(true);
  };

  const handleOpenDetail = (testPoint: TestPoint) => {
    setDetailTestPoint(testPoint);
    setDetailOpen(true);
  };

  const updatePriority = (priority: TestPointPriority | 'all') => setFilters((current) => ({ ...current, priority }));
  const updateStatus = (status: TestPointStatus | 'all') => setFilters((current) => ({ ...current, status }));
  const updateRiskLevel = (riskLevel: RiskLevel | 'all') => setFilters((current) => ({ ...current, riskLevel }));

  return (
    <main className={styles.pageShell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>AI Requirement Analysis</p>
          <h1>需求分析与测试点</h1>
          <p>聚合功能模块、需求疑问、风险雷达和测试点拆解结果，帮助团队快速完成评审闭环。</p>
        </div>
        <div className={styles.heroActions}>
          <Button variant="outline" onClick={handleReanalyze}>
            <RefreshCw className="mr-2 h-4 w-4" />
            重新分析
          </Button>
          <Button onClick={handleGenerateTestPoint}>
            <Sparkles className="mr-2 h-4 w-4" />
            生成测试点
          </Button>
        </div>
      </header>

      <SummaryCards modules={modules} questions={questions} risks={risks} testPoints={testPoints} />
      <ModuleCards modules={modules} selectedModuleId={selectedModuleId} onSelectModule={handleSelectModule} />

      <section className={styles.filterBar}>
        <Input value={filters.keyword} onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))} placeholder="搜索测试点标题、预期或来源" />
        <select value={filters.moduleId} onChange={(event) => setFilters((current) => ({ ...current, moduleId: event.target.value }))}>
          <option value="all">全部模块</option>
          {modules.map((moduleItem) => <option value={moduleItem.id} key={moduleItem.id}>{moduleItem.name}</option>)}
        </select>
        <select value={filters.priority} onChange={(event) => updatePriority(event.target.value as TestPointPriority | 'all')}>
          <option value="all">全部优先级</option>
          <option value="P0">P0</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
        </select>
        <select value={filters.status} onChange={(event) => updateStatus(event.target.value as TestPointStatus | 'all')}>
          <option value="all">全部状态</option>
          <option value="draft">草稿</option>
          <option value="generated">已生成</option>
          <option value="confirmed">已确认</option>
        </select>
        <select value={filters.riskLevel} onChange={(event) => updateRiskLevel(event.target.value as RiskLevel | 'all')}>
          <option value="all">全部风险</option>
          <option value="high">高风险</option>
          <option value="medium">中风险</option>
          <option value="low">低风险</option>
        </select>
      </section>

      <div className={styles.contentGrid}>
        <QuestionTable questions={visibleQuestions} onResolveQuestion={(questionId) => setQuestions((current) => current.map((question) => question.id === questionId ? { ...question, status: 'answered' } : question))} />
        <RiskCards risks={visibleRisks} />
      </div>

      <TestPointTable
        testPoints={visibleTestPoints}
        modules={modules}
        selectedIds={selectedIds}
        onToggleSelect={(testPointId) => setSelectedIds((current) => current.includes(testPointId) ? current.filter((id) => id !== testPointId) : [...current, testPointId])}
        onSelectAll={(testPointIds) => setSelectedIds(testPointIds)}
        onConfirm={handleConfirmTestPoints}
        onEdit={handleEdit}
        onOpenDetail={handleOpenDetail}
      />

      <TestPointFormModal
        open={modalOpen}
        mode={modalMode}
        modules={modules}
        initialValue={editingTestPoint}
        defaultModuleId={selectedModuleId}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmitTestPoint}
      />
      <TestPointDetailDrawer
        open={detailOpen}
        testPoint={detailTestPoint}
        modules={modules}
        risks={risks}
        onOpenChange={setDetailOpen}
        onConfirm={(testPointId) => handleConfirmTestPoints([testPointId])}
      />
    </main>
  );
}
