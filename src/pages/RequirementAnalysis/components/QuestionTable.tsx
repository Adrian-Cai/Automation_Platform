import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RequirementQuestion } from '@/pages/RequirementAnalysis/types';
import styles from '@/pages/RequirementAnalysis/index.module.css';

interface QuestionTableProps {
  questions: RequirementQuestion[];
  onResolveQuestion: (questionId: string) => void;
}

const priorityLabel: Record<RequirementQuestion['priority'], string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export default function QuestionTable({ questions, onResolveQuestion }: QuestionTableProps): JSX.Element {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Clarification</p>
          <h2 className={styles.sectionTitle}>需求疑问</h2>
        </div>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>疑问</th>
              <th>优先级</th>
              <th>负责人</th>
              <th>建议</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id}>
                <td>
                  <strong>{question.title}</strong>
                  <p>{question.detail}</p>
                </td>
                <td><Badge variant={question.priority === 'high' ? 'destructive' : 'outline'}>{priorityLabel[question.priority]}</Badge></td>
                <td>{question.assignee}</td>
                <td>{question.suggestion}</td>
                <td>{question.status === 'answered' ? '已答复' : question.status === 'ignored' ? '已忽略' : '待澄清'}</td>
                <td>
                  <Button size="sm" variant="outline" disabled={question.status !== 'open'} onClick={() => onResolveQuestion(question.id)}>
                    标记答复
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
