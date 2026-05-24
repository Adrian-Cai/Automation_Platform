import { FormEvent, useState } from 'react';
import { Boxes, GitBranch, RefreshCw, ServerCog } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useBrunoRepositories,
  useCreateBrunoRepository,
  useSyncBrunoRepository,
} from '@/hooks/useBrunoAutomation';

const STATUS_LABELS = {
  never: '未同步',
  success: '同步成功',
  failed: '同步失败',
} as const;

function statusVariant(status: keyof typeof STATUS_LABELS) {
  if (status === 'success') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (status === 'failed') {
    return 'bg-red-50 text-red-700 border-red-200';
  }

  return 'bg-slate-50 text-slate-600 border-slate-200';
}

export default function BrunoAutomation() {
  const repositoriesQuery = useBrunoRepositories();
  const createRepository = useCreateBrunoRepository();
  const syncRepository = useSyncBrunoRepository();
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('1');
  const [gitUrl, setGitUrl] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [collectionRoot, setCollectionRoot] = useState('.');

  const repositories = repositoriesQuery.data?.data ?? [];

  async function handleCreateRepository(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createRepository.mutateAsync({
        name: name.trim(),
        projectId: Number(projectId),
        gitUrl: gitUrl.trim(),
        defaultBranch: defaultBranch.trim() || 'main',
        collectionRoot: collectionRoot.trim() || '.',
      });
      setName('');
      setGitUrl('');
      toast.success('Bruno 仓库已注册');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '注册 Bruno 仓库失败');
    }
  }

  async function handleSyncRepository(repositoryId: number) {
    try {
      await syncRepository.mutateAsync(repositoryId);
      toast.success('Bruno 集合同步已触发');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '同步 Bruno 集合失败');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50/80 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                <ServerCog className="h-4 w-4" />
                Native Bruno Runner
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Bruno 接口自动化</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  注册 Git 原生 Bruno 集合仓库，同步集合索引，并从平台侧触发接口自动化执行。当前为最小可见切片，先打通仓库注册和同步入口。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-2xl font-semibold text-slate-950">{repositories.length}</div>
                <div className="text-xs text-slate-500">已注册仓库</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-2xl font-semibold text-slate-950">
                  {repositories.filter((repo) => repo.lastSyncStatus === 'success').length}
                </div>
                <div className="text-xs text-slate-500">同步成功</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 col-span-2 sm:col-span-1">
                <div className="text-2xl font-semibold text-slate-950">Phase 1</div>
                <div className="text-xs text-slate-500">后端集成</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GitBranch className="h-5 w-5 text-blue-600" />
                注册 Bruno 仓库
              </CardTitle>
              <CardDescription>
                填写平台可访问的 Git 仓库地址，集合根目录指向 `.bru` 文件所在目录。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateRepository}>
                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                  仓库名称
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="订单 API 集合" required />
                </label>
                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                  项目 ID
                  <Input value={projectId} onChange={(event) => setProjectId(event.target.value)} inputMode="numeric" required />
                </label>
                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                  Git 地址
                  <Input value={gitUrl} onChange={(event) => setGitUrl(event.target.value)} placeholder="https://git.example.com/api-tests.git" required />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                    默认分支
                    <Input value={defaultBranch} onChange={(event) => setDefaultBranch(event.target.value)} required />
                  </label>
                  <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                    集合根目录
                    <Input value={collectionRoot} onChange={(event) => setCollectionRoot(event.target.value)} required />
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={createRepository.isPending}>
                  {createRepository.isPending ? '注册中...' : '注册仓库'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Boxes className="h-5 w-5 text-blue-600" />
                Bruno 仓库列表
              </CardTitle>
              <CardDescription>
                同步成功后，后端会解析集合和请求索引，并写入 Bruno 相关表。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {repositoriesQuery.isLoading ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">正在加载 Bruno 仓库...</div>
              ) : repositoriesQuery.error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">加载 Bruno 仓库失败</div>
              ) : repositories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <Boxes className="mx-auto h-10 w-10 text-slate-400" />
                  <h2 className="mt-3 text-base font-semibold text-slate-900">还没有 Bruno 仓库</h2>
                  <p className="mt-1 text-sm text-slate-500">先注册一个包含 `.bru` 集合的 Git 仓库，页面会显示同步状态。</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
                  {repositories.map((repo) => (
                    <article key={repo.id} className="flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-slate-950">{repo.name}</h2>
                          <Badge className={statusVariant(repo.lastSyncStatus)}>{STATUS_LABELS[repo.lastSyncStatus]}</Badge>
                        </div>
                        <p className="break-all text-sm text-slate-600">{repo.gitUrl}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>项目 ID：{repo.projectId}</span>
                          <span>分支：{repo.defaultBranch}</span>
                          <span>目录：{repo.collectionRoot}</span>
                          <span>提交：{repo.lastSyncCommit ?? '暂无'}</span>
                        </div>
                        {repo.lastSyncError ? <p className="text-xs text-red-600">{repo.lastSyncError}</p> : null}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSyncRepository(repo.id)}
                        disabled={syncRepository.isPending && syncRepository.variables === repo.id}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {syncRepository.isPending && syncRepository.variables === repo.id ? '同步中...' : '同步集合'}
                      </Button>
                    </article>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
