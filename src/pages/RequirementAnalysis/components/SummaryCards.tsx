import { AlertTriangle, CheckCircle2, HelpCircle, Target } from 'lucide-react';
import type { RequirementModule, RequirementQuestion, RequirementRisk, TestPoint } from '@/pages/RequirementAnalysis/types';
import styles from '@/pages/RequirementAnalysis/index.module.css';

interface SummaryCardsProps {
  modules: RequirementModule[];
  questions: RequirementQuestion[];
  risks: RequirementRisk[];
  testPoints: TestPoint[];
}

export default function SummaryCards({ modules, questions, risks, testPoints }: SummaryCardsProps): JSX.Element {
  const confirmedCount = testPoints.filter((point) => point.status === 'confirmed').length;
  const highRiskCount = risks.filter((risk) => risk.level === 'high').length;
  const openQuestionCount = questions.filter((question) => question.status === 'open').length;
  const averageCoverage = modules.length > 0
    ? Math.round(modules.reduce((sum, moduleItem) => sum + moduleItem.coverage, 0) / modules.length)
    : 0;

  const cards = [
    {
      label: '需求模块',
      value: String(modules.length),
      description: `平均覆盖率 ${averageCoverage}%`,
      icon: <Target className="h-5 w-5" />,
    },
    {
      label: '待确认疑问',
      value: String(openQuestionCount),
      description: '建议优先澄清高优先级项',
      icon: <HelpCircle className="h-5 w-5" />,
    },
    {
      label: '高风险点',
      value: String(highRiskCount),
      description: `共识别 ${risks.length} 个风险`,
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      label: '已确认测试点',
      value: `${confirmedCount}/${testPoints.length}`,
      description: '确认后可进入用例生成',
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
  ];

  return (
    <section className={styles.summaryGrid} aria-label="需求分析概览">
      {cards.map((card) => (
        <article className={styles.summaryCard} key={card.label}>
          <div className={styles.summaryIcon}>{card.icon}</div>
          <div>
            <p className={styles.summaryLabel}>{card.label}</p>
            <strong className={styles.summaryValue}>{card.value}</strong>
            <p className={styles.summaryDescription}>{card.description}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
