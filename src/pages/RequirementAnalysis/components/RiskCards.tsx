import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RequirementRisk } from '@/pages/RequirementAnalysis/types';
import styles from '@/pages/RequirementAnalysis/index.module.css';

interface RiskCardsProps {
  risks: RequirementRisk[];
}

const levelLabel: Record<RequirementRisk['level'], string> = {
  high: '高风险',
  medium: '中风险',
  low: '低风险',
};

const categoryLabel: Record<RequirementRisk['category'], string> = {
  business: '业务',
  technical: '技术',
  data: '数据',
  integration: '集成',
  security: '安全',
};

export default function RiskCards({ risks }: RiskCardsProps): JSX.Element {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Risk Radar</p>
          <h2 className={styles.sectionTitle}>风险点</h2>
        </div>
      </div>
      <div className={styles.riskGrid}>
        {risks.map((risk) => (
          <article className={styles.riskCard} key={risk.id}>
            <div className={styles.riskIcon}>{risk.level === 'high' ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}</div>
            <div>
              <div className={styles.riskHeader}>
                <h3>{risk.title}</h3>
                <Badge variant={risk.level === 'high' ? 'destructive' : 'warning'}>{levelLabel[risk.level]}</Badge>
              </div>
              <p>{risk.description}</p>
              <div className={styles.riskFooter}>
                <span>{categoryLabel[risk.category]}</span>
                <span>{risk.mitigation}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
