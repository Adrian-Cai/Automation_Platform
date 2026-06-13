import { describe, expect, it } from 'vitest';
import { getDisplayRunStatus } from '@/pages/reports/Reports';
import type { TestRunRecord } from '@/hooks/useExecutions';

function makeRun(overrides: Partial<TestRunRecord> = {}): TestRunRecord {
  return {
    id: 1,
    project_id: 1,
    project_name: '项目 #1',
    trigger_type: 'jenkins',
    trigger_by: 1,
    trigger_by_name: 'tester',
    jenkins_job: null,
    jenkins_build_id: null,
    jenkins_url: null,
    abort_reason: null,
    status: 'success',
    start_time: null,
    end_time: null,
    duration_ms: null,
    total_cases: 1,
    passed_cases: 1,
    failed_cases: 0,
    skipped_cases: 0,
    created_at: null,
    ...overrides,
  };
}

describe('Reports - getDisplayRunStatus', () => {
  it('成功执行中只有跳过用例时应展示为跳过', () => {
    const status = getDisplayRunStatus(makeRun({ passed_cases: 0, skipped_cases: 1 }));

    expect(status).toBe('skipped');
  });

  it('成功执行中存在通过用例时保持成功状态', () => {
    const status = getDisplayRunStatus(makeRun({ passed_cases: 1, skipped_cases: 1, total_cases: 2 }));

    expect(status).toBe('success');
  });
});
