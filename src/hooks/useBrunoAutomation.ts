import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from '@/api';
import type { BrunoRepositoryInput, BrunoRepositoryRecord } from '@shared/types/bruno';

export interface BrunoCollectionRecord {
  id: number;
  repositoryId: number;
  projectId: number;
  name: string;
  relativePath: string;
  requestCount: number;
  lastSyncedAt: string | null;
}

export interface BrunoSyncResult {
  repositoryId: number;
  commit: string | null;
  collections: number;
  requests: number;
}

export function useBrunoRepositories(projectId?: number) {
  return useQuery({
    queryKey: ['bruno-repositories', projectId ?? null],
    queryFn: () => {
      const query = new URLSearchParams();
      if (projectId !== undefined) {
        query.set('projectId', String(projectId));
      }

      return request<BrunoRepositoryRecord[]>(`/bruno/repositories?${query.toString()}`);
    },
  });
}

export function useBrunoCollections(repositoryId?: number) {
  return useQuery({
    queryKey: ['bruno-collections', repositoryId ?? null],
    enabled: repositoryId !== undefined,
    queryFn: () => request<BrunoCollectionRecord[]>(`/bruno/collections?repositoryId=${repositoryId}`),
  });
}

export function useCreateBrunoRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BrunoRepositoryInput) => request<{ id: number }>('/bruno/repositories', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bruno-repositories'] });
    },
  });
}

export function useSyncBrunoRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (repositoryId: number) => request<BrunoSyncResult>(`/bruno/repositories/${repositoryId}/sync`, {
      method: 'POST',
    }),
    onSuccess: (_data, repositoryId) => {
      queryClient.invalidateQueries({ queryKey: ['bruno-repositories'] });
      queryClient.invalidateQueries({ queryKey: ['bruno-collections', repositoryId] });
    },
  });
}
