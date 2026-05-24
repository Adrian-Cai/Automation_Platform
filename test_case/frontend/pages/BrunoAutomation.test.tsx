import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BrunoAutomation from '@/pages/cases/BrunoAutomation';
import * as brunoHooks from '@/hooks/useBrunoAutomation';

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: { children: React.ReactNode }) => <section {...props}>{children}</section>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('BrunoAutomation Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function renderPage() {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <BrunoAutomation />
      </QueryClientProvider>,
    );
  }

  it('shows the native Bruno automation workspace with repository data', () => {
    vi.spyOn(brunoHooks, 'useBrunoRepositories').mockReturnValue({
      data: {
        success: true,
        data: [
          {
            id: 7,
            name: 'Order API Collection',
            projectId: 1,
            gitUrl: 'https://git.example.com/order-api.git',
            defaultBranch: 'main',
            collectionRoot: 'collections',
            lastSyncCommit: 'abc1234',
            lastSyncStatus: 'success',
            lastSyncError: null,
            createdAt: '2026-05-23T00:00:00.000Z',
            updatedAt: '2026-05-23T00:00:00.000Z',
          },
        ],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);
    vi.spyOn(brunoHooks, 'useCreateBrunoRepository').mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
    vi.spyOn(brunoHooks, 'useSyncBrunoRepository').mockReturnValue({ mutateAsync: vi.fn(), isPending: false, variables: undefined } as any);

    renderPage();

    expect(screen.getByRole('heading', { name: 'Bruno 接口自动化' })).toBeInTheDocument();
    expect(screen.getByText('Order API Collection')).toBeInTheDocument();
    expect(screen.getByText('https://git.example.com/order-api.git')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '同步集合' })).toBeInTheDocument();
  });
});
