import { describe, expect, it } from 'vitest';

import {
  deriveCallbackTerminalStatus,
  normalizeCallbackTerminalStatus,
} from '../../server/services/ExecutionService/callbackStatus';
import { shouldPromoteFailedPlaceholdersForZeroSummarySuccess } from '../../server/repositories/ExecutionRepositoryBatch';

describe('callback status derivation', () => {
  it('treats mixed passed and failed case results as failed overall', () => {
    const status = deriveCallbackTerminalStatus({
      reportedStatus: normalizeCallbackTerminalStatus('failed'),
      passedCases: 2,
      failedCases: 1,
      skippedCases: 0,
    });

    expect(status).toBe('failed');
  });

  it('prefers real case counts over a failed pipeline status when all executed cases passed', () => {
    const status = deriveCallbackTerminalStatus({
      reportedStatus: normalizeCallbackTerminalStatus('failed'),
      passedCases: 2,
      failedCases: 0,
      skippedCases: 1,
    });

    expect(status).toBe('success');
  });

  it('keeps aborted callbacks as aborted when there are no executed case results', () => {
    const status = deriveCallbackTerminalStatus({
      reportedStatus: normalizeCallbackTerminalStatus('aborted'),
      passedCases: 0,
      failedCases: 0,
      skippedCases: 0,
    });

    expect(status).toBe('aborted');
  });
});

describe('zero-summary success callback reconciliation', () => {
  it('promotes failed placeholders when Jenkins reports success without result details', () => {
    expect(shouldPromoteFailedPlaceholdersForZeroSummarySuccess({
      status: 'success',
      dbTotal: 2,
      dbFailed: 2,
      dbFinished: 2,
    })).toBe(true);
  });

  it('does not promote mixed persisted results that may contain real failures', () => {
    expect(shouldPromoteFailedPlaceholdersForZeroSummarySuccess({
      status: 'success',
      dbTotal: 2,
      dbFailed: 1,
      dbFinished: 2,
    })).toBe(false);
  });

  it('does not promote placeholders for non-success Jenkins results', () => {
    expect(shouldPromoteFailedPlaceholdersForZeroSummarySuccess({
      status: 'failed',
      dbTotal: 2,
      dbFailed: 2,
      dbFinished: 2,
    })).toBe(false);
  });
});
