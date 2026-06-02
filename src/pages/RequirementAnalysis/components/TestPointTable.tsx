import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RequirementModule, TestPoint } from '@/pages/RequirementAnalysis/types';
import styles from '@/pages/RequirementAnalysis/index.module.css';

interface TestPointTableProps {
  testPoints: TestPoint[];
  modules: RequirementModule[];
  selectedIds: string[];
  onToggleSelect: (testPointId: string) => void;
  onSelectAll: (testPointIds: string[]) => void;
  onConfirm: (testPointIds: string[]) => void;
  onEdit: (testPoint: TestPoint) => void;
  onOpenDetail: (testPoint: TestPoint) => void;
}

const typeLabel: Record<TestPoint['type'], string> = {
  functional: '功能',
  boundary: '边界',
  exception: '异常',
  compatibility: '兼容',
  security: '安全',
};

const statusLabel: Record<TestPoint['status'], string> = {
  draft: '草稿',
  generated: '已生成',
  confirmed: '已确认',
};

export default function TestPointTable({
  testPoints,
  modules,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onConfirm,
  onEdit,
  onOpenDetail,
}: TestPointTableProps): JSX.Element {
  const moduleNameMap = new Map(modules.map((moduleItem) => [moduleItem.id, moduleItem.name]));
  const allVisibleSelected = testPoints.length > 0 && testPoints.every((point) => selectedIds.includes(point.id));

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Test Points</p>
          <h2 className={styles.sectionTitle}>测试点拆解</h2>
        </div>
        <Button size="sm" disabled={selectedIds.length === 0} onClick={() => onConfirm(selectedIds)}>
          确认选中测试点
        </Button>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="选择当前筛选结果"
                  checked={allVisibleSelected}
                  onChange={() => onSelectAll(allVisibleSelected ? [] : testPoints.map((point) => point.id))}
                />
              </th>
              <th>测试点</th>
              <th>模块</th>
              <th>优先级</th>
              <th>类型</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {testPoints.map((point) => (
              <tr key={point.id}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`选择 ${point.title}`}
                    checked={selectedIds.includes(point.id)}
                    onChange={() => onToggleSelect(point.id)}
                  />
                </td>
                <td>
                  <button type="button" className={styles.linkButton} onClick={() => onOpenDetail(point)}>{point.title}</button>
                  <p>{point.expectedResult}</p>
                </td>
                <td>{moduleNameMap.get(point.moduleId) ?? '未归类'}</td>
                <td><Badge variant={point.priority === 'P0' ? 'destructive' : 'outline'}>{point.priority}</Badge></td>
                <td>{typeLabel[point.type]}</td>
                <td>{statusLabel[point.status]}</td>
                <td>
                  <div className={styles.actionGroup}>
                    <Button size="sm" variant="outline" onClick={() => onEdit(point)}>编辑</Button>
                    <Button size="sm" variant="ghost" onClick={() => onConfirm([point.id])} disabled={point.status === 'confirmed'}>确认</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
