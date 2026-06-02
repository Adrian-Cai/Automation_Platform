import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useExecuteCase,
  useExecuteBatch,
  useManualSync,
  useBatchExecution,
  useTestExecution,
} from '@/hooks/useExecuteCase';
import * as api from '@/api';
import { wsClient } from '@/services/websocket';

// Mock dependencies
vi.mock('@/api', () => ({
  request: vi.fn(),
}));

vi.mock('@/services/websocket', () => ({
  wsClient: {
    isConnected: vi.fn().mockReturnValue(false),
    subscribeToExecution: vi.fn().mockResolvedValue(vi.fn()),
  },
}));

// Mock polling config to disable real polling in tests
vi.mock('@/config/polling', () => ({
  POLLING_CONFIG: {
    INTERVALS: { FAST: 100, NORMAL: 100, MEDIUM: 100, SLOW: 100, WEBSOCKET_BACKUP: 100 },
    WINDOWS: { PENDING_FAST_POLL: 1000, EARLY_EXECUTION: 2000, MID_EXECUTION: 3000, MAX_EXECUTION_TIME: 5000 },
    STUCK_DETECTION: { EARLY_THRESHOLD: 1000, CRITICAL_THRESHOLD: 2000, ALERT_COOLDOWN: 100 },
    WEBSOCKET: {},
    RETRY: {},
  },
  calculatePollingInterval: vi.fn().mockReturnValue(false),
  checkStuckStatus: vi.fn().mockReturnValue({
    isStuck: false,
    isEarlyStuck: false,
    isCriticallyStuck: false,
    elapsedTime: 0,
    severity: 'none',
  }),
  getStuckMessage: vi.fn().mockReturnValue(''),
  formatElapsedTime: vi.fn().mockReturnValue('0s'),
}));

// Suppress console output during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        refetchInterval: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useExecuteCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  it('should execute a single case successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        runId: 123,
        buildUrl: 'http://jenkins.example.com/job/test/123',
        status: 'pending',
      },
    };

    vi.mocked(api.request).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useExecuteCase(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ caseId: 1, projectId: 10 });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.request).toHaveBeenCalledWith('/jenkins/run-case', {
      method: 'POST',
      body: JSON.stringify({ caseId: 1, projectId: 10 }),
    });

    expect(result.current.data).toEqual(mockResponse.data);
  });

  it('should handle execution failure', async () => {
    const mockError = new Error('Jenkins connection failed');
    vi.mocked(api.request).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useExecuteCase(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ caseId: 1, projectId: 10 });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('should set isPending state during execution', async () => {
    let resolveFn: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveFn = resolve;
    });
    vi.mocked(api.request).mockReturnValue(pendingPromise as any);

    const { result } = renderHook(() => useExecuteCase(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ caseId: 1, projectId: 10 });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await act(async () => {
      resolveFn!({ success: true, data: { runId: 123, buildUrl: '', status: 'pending' } });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});

describe('useExecuteBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  it('should execute batch cases successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        runId: 456,
        buildUrl: 'http://jenkins.example.com/job/test/456',
        status: 'pending',
      },
    };

    vi.mocked(api.request).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useExecuteBatch(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ caseIds: [1, 2, 3], projectId: 10 });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.request).toHaveBeenCalledWith('/jenkins/run-batch', {
      method: 'POST',
      body: JSON.stringify({ caseIds: [1, 2, 3], projectId: 10 }),
    });

    expect(result.current.data).toEqual(mockResponse.data);
  });

  it('should handle empty case IDs array', async () => {
    const mockResponse = {
      success: true,
      data: {
        runId: 789,
        buildUrl: 'http://jenkins.example.com/job/test/789',
        status: 'pending',
      },
    };

    vi.mocked(api.request).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useExecuteBatch(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ caseIds: [], projectId: 10 });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.runId).toBe(789);
  });
});

describe('useManualSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  it('should sync execution status successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        success: true,
        data: {
          updated: true,
          message: 'Status synced successfully',
          currentStatus: 'success',
          jenkinsStatus: 'success',
          executionId: 123,
        },
      },
    };

    vi.mocked(api.request).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useManualSync(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(123);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.request).toHaveBeenCalledWith('/executions/123/sync', {
      method: 'POST',
    });

    expect(result.current.data?.success).toBe(true);
  });

  it('should handle sync failure', async () => {
    const mockResponse = {
      success: true,
      data: {
        success: false,
        message: 'Jenkins build not found',
      },
    };

    vi.mocked(api.request).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useManualSync(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(123);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.success).toBe(false);
  });

  it('should invalidate queries on successful sync', async () => {
    const mockResponse = {
      success: true,
      data: {
        success: true,
        data: {
          updated: true,
          message: 'Status synced',
          currentStatus: 'success',
          jenkinsStatus: 'success',
          executionId: 123,
        },
      },
    };

    vi.mocked(api.request).mockResolvedValueOnce(mockResponse);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useManualSync(), { wrapper });

    await act(async () => {
      result.current.mutate(123);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['batch-execution', 123],
    });
  });
});

describe('useBatchExecution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  it('should fetch batch execution data when runId is provided', async () => {
    const mockBatchData = {
      success: true,
      data: {
        id: 123,
        status: 'running' as const,
        total_cases: 10,
        passed_cases: 5,
        failed_cases: 0,
        skipped_cases: 0,
        start_time: new Date().toISOString(),
      },
    };

    vi.mocked(api.request).mockResolvedValue(mockBatchData);

    const { result } = renderHook(() => useBatchExecution(123), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 3000 });

    expect(api.request).toHaveBeenCalledWith('/jenkins/batch/123');
    expect(result.current.data).toEqual(mockBatchData.data);
  });

  it('should not fetch when runId is null', () => {
    const { result } = renderHook(() => useBatchExecution(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(api.request).not.toHaveBeenCalled();
  });

  it('should stop polling when execution is completed', async () => {
    const mockCompletedData = {
      success: true,
      data: {
        id: 123,
        status: 'success' as const,
        total_cases: 10,
        passed_cases: 10,
        failed_cases: 0,
        skipped_cases: 0,
        start_time: new Date(Date.now() - 60000).toISOString(),
        end_time: new Date().toISOString(),
        duration_ms: 60000,
      },
    };

    vi.mocked(api.request).mockResolvedValue(mockCompletedData);

    const { result } = renderHook(() => useBatchExecution(123), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 3000 });

    expect(result.current.data?.status).toBe('success');

    const callCountAfterSuccess = vi.mocked(api.request).mock.calls.length;

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(vi.mocked(api.request).mock.calls.length).toBe(callCountAfterSuccess);
  });

  it('should detect stuck execution', async () => {
    const { checkStuckStatus } = await import('@/config/polling');
    vi.mocked(checkStuckStatus).mockReturnValue({
      isStuck: true,
      isEarlyStuck: false,
      isCriticallyStuck: true,
      elapsedTime: 360000,
      severity: 'critical',
    });

    const mockStuckData = {
      success: true,
      data: {
        id: 123,
        status: 'running' as const,
        total_cases: 10,
        passed_cases: 2,
        failed_cases: 0,
        skipped_cases: 0,
        start_time: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      },
    };

    vi.mocked(api.request).mockResolvedValue(mockStuckData);

    const { result } = renderHook(() => useBatchExecution(123), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 3000 });

    expect(result.current.isStuck).toBe(true);
  });

  it('should subscribe to WebSocket when connected', async () => {
    const mockUnsubscribe = vi.fn();
    vi.mocked(wsClient.isConnected).mockReturnValue(true);
    vi.mocked(wsClient.subscribeToExecution).mockResolvedValue(mockUnsubscribe as any);

    const mockBatchData = {
      success: true,
      data: {
        id: 123,
        status: 'running' as const,
        total_cases: 10,
        passed_cases: 5,
        failed_cases: 0,
        skipped_cases: 0,
      },
    };

    vi.mocked(api.request).mockResolvedValue(mockBatchData);

    const { unmount } = renderHook(() => useBatchExecution(123), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(wsClient.subscribeToExecution).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          onUpdate: expect.any(Function),
          onQuickFail: expect.any(Function),
        })
      );
    }, { timeout: 3000 });

    unmount();

    await waitFor(() => {
      expect(mockUnsubscribe).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should use slow polling when WebSocket is connected', async () => {
    vi.mocked(wsClient.isConnected).mockReturnValue(true);
    vi.mocked(wsClient.subscribeToExecution).mockResolvedValue(vi.fn() as any);

    const mockBatchData = {
      success: true,
      data: {
        id: 123,
        status: 'running' as const,
        total_cases: 10,
        passed_cases: 5,
        failed_cases: 0,
        skipped_cases: 0,
        start_time: new Date().toISOString(),
      },
    };

    vi.mocked(api.request).mockResolvedValue(mockBatchData);

    const { result } = renderHook(() => useBatchExecution(123), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 3000 });

    expect(result.current.wsConnected).toBe(true);
  });
});

describe('useTestExecution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  it('should execute a case and track runId', async () => {
    const mockExecuteResponse = {
      success: true,
      data: {
        runId: 123,
        buildUrl: 'http://jenkins.example.com/job/test/123',
        status: 'pending',
      },
    };

    const mockBatchData = {
      success: true,
      data: {
        id: 123,
        status: 'running' as const,
        total_cases: 1,
        passed_cases: 0,
        failed_cases: 0,
        skipped_cases: 0,
      },
    };

    vi.mocked(api.request)
      .mockResolvedValueOnce(mockExecuteResponse)
      .mockResolvedValue(mockBatchData);

    const { result } = renderHook(() => useTestExecution(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.executeCase(1, 10);
    });

    await waitFor(() => {
      expect(result.current.runId).toBe(123);
    });

    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.batchInfo).toBeDefined();
    });
  });

  it('should execute batch and track runId', async () => {
    const mockExecuteResponse = {
      success: true,
      data: {
        runId: 456,
        buildUrl: 'http://jenkins.example.com/job/test/456',
        status: 'pending',
      },
    };

    const mockBatchData = {
      success: true,
      data: {
        id: 456,
        status: 'running' as const,
        total_cases: 3,
        passed_cases: 0,
        failed_cases: 0,
        skipped_cases: 0,
      },
    };

    vi.mocked(api.request)
      .mockResolvedValueOnce(mockExecuteResponse)
      .mockResolvedValue(mockBatchData);

    const { result } = renderHook(() => useTestExecution(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.executeBatch([1, 2, 3], 10);
    });

    await waitFor(() => {
      expect(result.current.runId).toBe(456);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle execution error', async () => {
    const mockError = new Error('Execution failed');
    vi.mocked(api.request).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useTestExecution(), {
      wrapper: createWrapper(),
    });

    let thrownError: Error | null = null;
    await act(async () => {
      try {
        await result.current.executeCase(1, 10);
      } catch (err) {
        thrownError = err as Error;
      }
    });

    expect(thrownError).toEqual(mockError);

    await waitFor(() => {
      expect(result.current.error).toBe('Execution failed');
      expect(result.current.runId).toBeNull();
    }, { timeout: 2000 });
  });

  it('should perform manual sync', async () => {
    const mockExecuteResponse = {
      success: true,
      data: {
        runId: 123,
        buildUrl: 'http://jenkins.example.com/job/test/123',
        status: 'pending',
      },
    };

    const mockBatchData = {
      success: true,
      data: {
        id: 123,
        status: 'running' as const,
        total_cases: 1,
        passed_cases: 0,
        failed_cases: 0,
        skipped_cases: 0,
      },
    };

    const mockSyncResponse = {
      success: true,
      data: {
        success: true,
        data: {
          updated: true,
          message: 'Status synced',
          currentStatus: 'running',
          jenkinsStatus: 'running',
          executionId: 123,
        },
      },
    };

    vi.mocked(api.request)
      .mockResolvedValueOnce(mockExecuteResponse)
      .mockResolvedValueOnce(mockBatchData)
      .mockResolvedValueOnce(mockSyncResponse);

    const { result } = renderHook(() => useTestExecution(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.executeCase(1, 10);
    });

    await waitFor(() => {
      expect(result.current.runId).toBe(123);
    });

    await act(async () => {
      await result.current.manualSync();
    });

    await waitFor(() => {
      expect(result.current.lastManualSync).not.toBeNull();
      expect(result.current.syncIssues.length).toBeGreaterThan(0);
    });
  });

  it('should reset state', async () => {
    const mockExecuteResponse = {
      success: true,
      data: {
        runId: 123,
        buildUrl: 'http://jenkins.example.com/job/test/123',
        status: 'pending',
      },
    };

    vi.mocked(api.request).mockResolvedValueOnce(mockExecuteResponse);

    const { result } = renderHook(() => useTestExecution(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.executeCase(1, 10);
    });

    await waitFor(() => {
      expect(result.current.runId).toBe(123);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.runId).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.syncIssues).toEqual([]);
    expect(result.current.lastManualSync).toBeNull();
  });
});
