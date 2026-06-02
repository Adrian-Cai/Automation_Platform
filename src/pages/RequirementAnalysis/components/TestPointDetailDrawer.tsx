import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { RequirementModule, RequirementRisk, TestPoint } from '@/pages/RequirementAnalysis/types';
import styles from '@/pages/RequirementAnalysis/index.module.css';

interface TestPointDetailDrawerProps {
  open: boolean;
  testPoint?: TestPoint;
  modules: RequirementModule[];
  risks: RequirementRisk[];
  onOpenChange: (open: boolean) => void;
  onConfirm: (testPointId: string) => void;
}

export default function TestPointDetailDrawer({
  open,
  testPoint,
  modules,
  risks,
  onOpenChange,
  onConfirm,
}: TestPointDetailDrawerProps): JSX.Element {
  const moduleName = modules.find((moduleItem) => moduleItem.id === testPoint?.moduleId)?.name ?? '未归类模块';
  const relatedRisks = risks.filter((risk) => testPoint?.relatedRiskIds.includes(risk.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-xl" side="right">
        <SheetHeader>
          <SheetTitle>{testPoint?.title ?? '测试点详情'}</SheetTitle>
          <SheetDescription>{moduleName} · {testPoint?.source ?? '暂无来源'}</SheetDescription>
        </SheetHeader>
        {testPoint && (
          <div className={styles.drawerBody}>
            <div className={styles.drawerMeta}>
              <Badge variant={testPoint.priority === 'P0' ? 'destructive' : 'outline'}>{testPoint.priority}</Badge>
              <Badge variant={testPoint.status === 'confirmed' ? 'success' : 'secondary'}>{testPoint.status === 'confirmed' ? '已确认' : '待确认'}</Badge>
            </div>
            <section>
              <h3>前置条件</h3>
              <p>{testPoint.precondition}</p>
            </section>
            <section>
              <h3>操作步骤</h3>
              <ol>
                {testPoint.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </section>
            <section>
              <h3>预期结果</h3>
              <p>{testPoint.expectedResult}</p>
            </section>
            <section>
              <h3>关联风险</h3>
              {relatedRisks.length > 0 ? relatedRisks.map((risk) => (
                <div className={styles.drawerRisk} key={risk.id}>
                  <strong>{risk.title}</strong>
                  <p>{risk.mitigation}</p>
                </div>
              )) : <p>暂无关联风险。</p>}
            </section>
          </div>
        )}
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>关闭</Button>
          {testPoint && (
            <Button disabled={testPoint.status === 'confirmed'} onClick={() => onConfirm(testPoint.id)}>
              确认测试点
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
