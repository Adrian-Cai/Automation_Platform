import { describe, it, expect } from 'vitest';
import {
  formatTime,
  getTaskSemanticStatus,
  getTaskSuccessRate,
  parseCaseCount,
} from '@/pages/tasks/components/taskPageConfig';
import type { Task, TaskExecution } from '@/hooks/useTasks';

function makeExecution(overrides: Partial<TaskExecution> = {}): TaskExecution {
  return {
    id: 1,
    status: 'success',
    passed_cases: 0,
    failed_cases: 0,
    total_cases: 0,
    ...overrides,
  };
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    name: '回归任务',
    trigger_type: 'manual',
    status: 'active',
    updated_at: '2026-01-01T00:00:00Z',
    recentExecutions: [],
    ...overrides,
  };
}

describe('taskPageConfig - getTaskSemanticStatus', () => {
  it('active 任务从未执行过时应返回“空闲”', () => {
    const result = getTaskSemanticStatus(makeTask());

    expect(result).toEqual({ key: 'draft', label: '空闲' });
  });

  it('active 任务最近一次执行成功时应返回“成功”', () => {
    const result = getTaskSemanticStatus(
      makeTask({ recentExecutions: [makeExecution({ status: 'success' })] })
    );

    expect(result).toEqual({ key: 'success', label: '成功' });
  });

  it('active 任务最近一次执行失败时应返回“失败”', () => {
    const result = getTaskSemanticStatus(
      makeTask({ recentExecutions: [makeExecution({ status: 'failed' })] })
    );

    expect(result).toEqual({ key: 'failed', label: '失败' });
  });

  it('paused 任务应返回“暂停”（无论 recentExecutions）', () => {
    const taskEmpty = makeTask({ status: 'paused', recentExecutions: [] });
    const taskWithRun = makeTask({
      status: 'paused',
      recentExecutions: [makeExecution({ status: 'success' })],
    });

    expect(getTaskSemanticStatus(taskEmpty).label).toBe('暂停');
    expect(getTaskSemanticStatus(taskWithRun).label).toBe('暂停');
  });

  it('running 执行应显示“运行中”', () => {
    const result = getTaskSemanticStatus(
      makeTask({ recentExecutions: [makeExecution({ status: 'running' })] })
    );

    expect(result).toEqual({ key: 'running', label: '运行中' });
  });

  it('pending 执行应显示“排队中”，避免与运行中混淆', () => {
    const result = getTaskSemanticStatus(
      makeTask({ recentExecutions: [makeExecution({ status: 'pending' })] })
    );

    expect(result).toEqual({ key: 'pending', label: '排队中' });
  });

  it('cancelled 执行应显示“已取消”，避免被兜底为成功', () => {
    const result = getTaskSemanticStatus(
      makeTask({ recentExecutions: [makeExecution({ status: 'cancelled' })] })
    );

    expect(result).toEqual({ key: 'cancelled', label: '已取消' });
  });
});

describe('taskPageConfig - getTaskSuccessRate', () => {
  it('无执行记录时返回 null', () => {
    expect(getTaskSuccessRate(makeTask())).toBeNull();
  });

  it('total_cases 为 0 时返回 null', () => {
    expect(
      getTaskSuccessRate(makeTask({ recentExecutions: [makeExecution({ passed_cases: 0, total_cases: 0 })] }))
    ).toBeNull();
  });

  it('按最近一次执行记录计算成功率', () => {
    expect(
      getTaskSuccessRate(makeTask({ recentExecutions: [makeExecution({ passed_cases: 7, total_cases: 10 })] }))
    ).toBe(70);
  });

  it('passed_cases 缺失时按 0 处理，避免表格显示 NaN%', () => {
    const execution = {
      id: 1,
      status: 'success',
      failed_cases: 3,
      total_cases: 3,
    } as TaskExecution;

    expect(getTaskSuccessRate(makeTask({ recentExecutions: [execution] }))).toBe(0);
  });
});

describe('taskPageConfig - parseCaseCount', () => {
  it('case_ids 为空或非法 JSON 时返回 0', () => {
    expect(parseCaseCount(makeTask({ case_ids: undefined }))).toBe(0);
    expect(parseCaseCount(makeTask({ case_ids: '{bad json' }))).toBe(0);
  });

  it('case_ids 为数组 JSON 时返回关联用例数量', () => {
    expect(parseCaseCount(makeTask({ case_ids: '[1,2,3]' }))).toBe(3);
  });
});

describe('taskPageConfig - formatTime', () => {
  it('空值或非法日期应返回“-”', () => {
    expect(formatTime('')).toBe('-');
    expect(formatTime(undefined)).toBe('-');
    expect(formatTime('not-a-date')).toBe('-');
  });

  it('有效日期字符串不应返回“-”或 Invalid Date', () => {
    const result = formatTime('2026-01-15T10:30:00Z');

    expect(result).not.toBe('-');
    expect(result).not.toContain('Invalid Date');
  });
});
