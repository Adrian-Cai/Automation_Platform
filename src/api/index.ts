import { clearToken } from '@/services/authApi';

const API_BASE = '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
  /** 分页元数据（列表类接口使用） */
  pagination?: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * 从本地存储中读取认证 Token
 */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

export async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      // 认证失败：清除本地 token，并通知 AuthContext 更新登录状态
      if (response.status === 401) {
        clearToken();
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error: unknown) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ==================== Dashboard API ====================
// DashboardStats / TodayExecution / RecentRun 统一定义在 src/types/dashboard.ts，此处 re-export 避免重复维护
export type { DashboardStats, TodayExecution, RecentRun } from '@/types/dashboard';

export interface DailySummary {
  date: string;
  totalExecutions: number;
  passedCases: number;
  failedCases: number;
  skippedCases: number;
  successRate: number;
}

export interface ComparisonData {
  runsComparison: number | null;
  successRateComparison: number | null;
  failureComparison: number | null;
}

import type { DashboardStats, TodayExecution, RecentRun } from '@/types/dashboard';

export const dashboardApi = {
  getStats: () => request<DashboardStats>('/dashboard/stats'),

  getTodayExecution: () => request<TodayExecution>('/dashboard/today-execution'),

  getTrend: (days: number = 30) =>
    request<DailySummary[]>(`/dashboard/trend?days=${days}`),

  getComparison: (days: number = 30) =>
    request<ComparisonData>(`/dashboard/comparison?days=${days}`),

  getRecentRuns: (limit: number = 10) =>
    request<RecentRun[]>(`/dashboard/recent-runs?limit=${limit}&_ts=${Date.now()}`, {
      cache: 'no-store',
    }),

  refreshSummary: (date?: string) =>
    request('/dashboard/refresh-summary', {
      method: 'POST',
      body: JSON.stringify({ date }),
    }),

  getAll: (timeRange: string = '30d') =>
    request<{
      stats: DashboardStats;
      todayExecution: TodayExecution;
      trendData: DailySummary[];
    }>(`/dashboard/all?timeRange=${timeRange}&_ts=${Date.now()}`, {
      cache: 'no-store',
    }),
};

// ==================== Execution API ====================

export interface ExecutionResult {
  executionId: number;
  totalCases: number;
  completedCases: number;
  passedCases: number;
  failedCases: number;
  skippedCases: number;
  status: string;
}

export interface ExecutionCaseResult {
  id: number;
  caseId: number;
  caseName: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  duration: number;
  errorMessage?: string | null;
  stackTrace?: string | null;
  screenshotPath?: string | null;
  logPath?: string | null;
  assertionsTotal?: number;
  assertionsPassed?: number;
  responseData?: string | null;
}

export interface ExecutionRunDetail {
  id: number;
  status: string;
  triggerType: string;
  triggerByName?: string | null;
  totalCases?: number;
  passedCases?: number;
  failedCases?: number;
  skippedCases?: number;
  durationMs?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  jenkinsJob?: string | null;
  jenkinsBuildId?: string | null;
  jenkinsUrl?: string | null;
}

export interface ExecutionDetail {
  execu