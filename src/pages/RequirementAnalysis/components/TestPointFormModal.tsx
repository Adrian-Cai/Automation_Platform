import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { RequirementModule, TestPoint, TestPointFormValues, TestPointModalMode, TestPointPriority, TestPointType } from '@/pages/RequirementAnalysis/types';
import styles from '@/pages/RequirementAnalysis/index.module.css';

interface TestPointFormModalProps {
  open: boolean;
  mode: TestPointModalMode;
  modules: RequirementModule[];
  initialValue?: TestPoint;
  defaultModuleId: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TestPointFormValues) => void;
}

const priorityOptions: TestPointPriority[] = ['P0', 'P1', 'P2'];
const typeOptions: TestPointType[] = ['functional', 'boundary', 'exception', 'compatibility', 'security'];

const typeLabel: Record<TestPointType, string> = {
  functional: '功能',
  boundary: '边界',
  exception: '异常',
  compatibility: '兼容',
  security: '安全',
};

function buildInitialValues(initialValue: TestPoint | undefined, defaultModuleId: string): TestPointFormValues {
  return {
    moduleId: initialValue?.moduleId ?? defaultModuleId,
    title: initialValue?.title ?? '',
    precondition: initialValue?.precondition ?? '',
    stepsText: initialValue?.steps.join('\n') ?? '',
    expectedResult: initialValue?.expectedResult ?? '',
    priority: initialValue?.priority ?? 'P1',
    type: initialValue?.type ?? 'functional',
    source: initialValue?.source ?? '人工补充',
  };
}

export default function TestPointFormModal({
  open,
  mode,
  modules,
  initialValue,
  defaultModuleId,
  onOpenChange,
  onSubmit,
}: TestPointFormModalProps): JSX.Element {
  const [formValues, setFormValues] = useState<TestPointFormValues>(() => buildInitialValues(initialValue, defaultModuleId));

  useEffect(() => {
    if (open) {
      setFormValues(buildInitialValues(initialValue, defaultModuleId));
    }
  }, [defaultModuleId, initialValue, open]);

  const title = mode === 'edit' ? '编辑测试点' : mode === 'generate' ? '生成测试点' : '新增测试点';

  const updateField = <Key extends keyof TestPointFormValues>(key: Key, value: TestPointFormValues[Key]) => {
    setFormValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>基于需求分析结果维护测试点，保存后将同步到当前列表。</DialogDescription>
        </DialogHeader>
        <div className={styles.formGrid}>
          <label>
            所属模块
            <select value={formValues.moduleId} onChange={(event) => updateField('moduleId', event.target.value)}>
              {modules.map((moduleItem) => <option value={moduleItem.id} key={moduleItem.id}>{moduleItem.name}</option>)}
            </select>
          </label>
          <label>
            优先级
            <select value={formValues.priority} onChange={(event) => updateField('priority', event.target.value as TestPointPriority)}>
              {priorityOptions.map((priority) => <option value={priority} key={priority}>{priority}</option>)}
            </select>
          </label>
          <label>
            测试类型
            <select value={formValues.type} onChange={(event) => updateField('type', event.target.value as TestPointType)}>
              {typeOptions.map((type) => <option value={type} key={type}>{typeLabel[type]}</option>)}
            </select>
          </label>
          <label className={styles.formWide}>
            测试点标题
            <Input value={formValues.title} onChange={(event) => updateField('title', event.target.value)} placeholder="请输入测试点标题" />
          </label>
          <label className={styles.formWide}>
            前置条件
            <Textarea value={formValues.precondition} onChange={(event) => updateField('precondition', event.target.value)} placeholder="请输入前置条件" />
          </label>
          <label className={styles.formWide}>
            操作步骤（每行一条）
            <Textarea value={formValues.stepsText} onChange={(event) => updateField('stepsText', event.target.value)} placeholder="步骤 1\n步骤 2" />
          </label>
          <label className={styles.formWide}>
            预期结果
            <Textarea value={formValues.expectedResult} onChange={(event) => updateField('expectedResult', event.target.value)} placeholder="请输入预期结果" />
          </label>
          <label className={styles.formWide}>
            来源
            <Input value={formValues.source} onChange={(event) => updateField('source', event.target.value)} placeholder="需求章节或用户故事" />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button disabled={!formValues.title.trim()} onClick={() => onSubmit(formValues)}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
