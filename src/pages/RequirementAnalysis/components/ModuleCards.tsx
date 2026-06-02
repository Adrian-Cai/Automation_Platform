import { Badge } from '@/components/ui/badge';
import type { RequirementModule } from '@/pages/RequirementAnalysis/types';
import styles from '@/pages/RequirementAnalysis/index.module.css';

interface ModuleCardsProps {
  modules: RequirementModule[];
  selectedModuleId: string;
  onSelectModule: (moduleId: string) => void;
}

const statusLabels: Record<RequirementModule['status'], string> = {
  analyzed: '已分析',
  pending: '待确认',
  confirmed: '已确认',
};

export default function ModuleCards({ modules, selectedModuleId, onSelectModule }: ModuleCardsProps): JSX.Element {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Module Map</p>
          <h2 className={styles.sectionTitle}>功能模块识别</h2>
        </div>
        <span className={styles.sectionHint}>点击模块筛选疑问、风险和测试点</span>
      </div>
      <div className={styles.moduleGrid}>
        {modules.map((moduleItem) => {
          const isActive = selectedModuleId === moduleItem.id;
          return (
            <button
              type="button"
              className={`${styles.moduleCard} ${isActive ? styles.moduleCardActive : ''}`}
              onClick={() => onSelectModule(moduleItem.id)}
              key={moduleItem.id}
            >
              <div className={styles.moduleCardTop}>
                <h3>{moduleItem.name}</h3>
                <Badge variant={moduleItem.status === 'confirmed' ? 'success' : 'secondary'}>{statusLabels[moduleItem.status]}</Badge>
              </div>
              <p>{moduleItem.description}</p>
              <div className={styles.progressTrack}>
                <span className={styles.progressBar} style={{ width: `${moduleItem.coverage}%` }} />
              </div>
              <div className={styles.moduleMeta}>
                <span>覆盖率 {moduleItem.coverage}%</span>
                <span>{moduleItem.testPointCount} 测试点</span>
                <span>{moduleItem.riskCount} 风险</span>
              </div>
              <div className={styles.tagRow}>
                {moduleItem.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
