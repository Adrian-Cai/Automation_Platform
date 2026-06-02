import { Database, Download, FileJson, FileSpreadsheet, History, RefreshCw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

const histories = [
  { name: '结算流程用例生成', version: 'v1.4', time: '2026-06-01 17:30', status: '已导出' },
  { name: '会员权益后台', version: 'v0.9', time: '2026-05-30 10:12', status: '待同步' },
  { name: '开放 API 鉴权', version: 'v2.1', time: '2026-05-28 15:44', status: '已同步' },
];
const versions = ['v1.4 AI 优化异常断言', 'v1.3 人工补充边界场景', 'v1.2 模板切换为接口自动化', 'v1.1 首次生成'];
const exports = [
  { label: '导出 Excel', icon: FileSpreadsheet, description: '适合测试管理平台导入。' },
  { label: '导出 Markdown', icon: Download, description: '适合评审与知识库沉淀。' },
  { label: '导出 JSON', icon: FileJson, description: '适合自动化流水线消费。' },
];

export default function HistoryExport() {
  return (
    <div className="max-w-full overflow-hidden p-6">
      <div className="space-y-6">
        <div>
          <Badge variant="secondary" className="mb-3">历史导出</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">历史记录与导出</h1>
          <p className="mt-2 text-sm text-slate-500">追踪生成版本、导出任务和测试平台同步状态。</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-blue-600" />生成历史</CardTitle>
              <CardDescription>支持按项目、时间和状态筛选。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]"><Input placeholder="搜索历史记录" /><Input placeholder="导出状态" /><Button variant="outline">查询</Button></div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="text-left text-slate-500"><tr><th className="py-3">名称</th><th>版本</th><th>时间</th><th>状态</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {histories.map((item) => (
                      <tr key={item.name}>
                        <td className="py-3 font-medium text-slate-900 dark:text-white">{item.name}</td>
                        <td>{item.version}</td>
                        <td className="text-slate-500">{item.time}</td>
                        <td><Badge variant="outline">{item.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>版本记录</CardTitle>
              <CardDescription>展示最近一次需求到用例的迭代链路。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {versions.map((version, index) => (
                <div key={version} className="flex gap-3 rounded-xl border p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">{index + 1}</div>
                  <div><div className="font-semibold text-slate-900 dark:text-white">{version}</div><div className="text-sm text-slate-500">保留 Prompt、需求快照与差异摘要。</div></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>导出中心</CardTitle>
              <CardDescription>选择导出格式并生成下载任务。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {exports.map((item) => {
                const Icon = item.icon;
                return (
                  <Button key={item.label} variant="outline" className="h-auto flex-col items-start gap-3 p-4 text-left">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">{item.label}</span>
                    <span className="whitespace-normal text-xs font-normal text-slate-500">{item.description}</span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-blue-600" />同步测试平台</CardTitle>
              <CardDescription>将用例推送到既有测试管理系统。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input defaultValue="Automation Test Platform / AI Case Space" aria-label="同步目标空间" />
              <div className="flex items-center justify-between text-sm"><span>同步进度</span><span className="font-semibold">54%</span></div>
              <Progress value={54} />
              <div className="flex flex-wrap gap-3"><Button className="gap-2"><RefreshCw className="h-4 w-4" />立即同步</Button><Button variant="outline">查看日志</Button></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
