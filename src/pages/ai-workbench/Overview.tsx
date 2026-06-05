import { BarChart3, Bot, CheckCircle2, FileText, Layers, Rocket, ShieldCheck, Sparkles, Target } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StatCard {
  label: string;
  value: string;
  trend: string;
  icon: typeof FileText;
}

interface RecentProject {
  name: string;
  status: string;
  owner: string;
  coverage: number;
}

const stats: StatCard[] = [
  { label: '需求文档', value: '128', trend: '本周新增 12 份', icon: FileText },
  { label: '生成用例', value: '3,482', trend: '平均节省 64% 时间', icon: CheckCircle2 },
  { label: '覆盖率', value: '91%', trend: '较上周 +8%', icon: Target },
  { label: '质量评分', value: '88', trend: 'AI 建议 24 条', icon: BarChart3 },
];

const recentProjects: RecentProject[] = [
  { name: '电商结算流程重构', status: '用例生成中', owner: '质量平台组', coverage: 86 },
  { name: '会员权益配置后台', status: '待确认测试点', owner: '业务中台', coverage: 72 },
  { name: '开放 API 鉴权升级', status: '已导出', owner: '接口测试组', coverage: 95 },
];

const abilities = [
  { title: '需求语义解析', description: '识别业务对象、约束条件与隐含流程。', icon: Bot },
  { title: '测试点自动拆解', description: '按模块、风险、优先级生成可追踪测试点。', icon: Layers },
  { title: '质量覆盖评估', description: '持续检查缺口、重复项与断言完整性。', icon: ShieldCheck },
  { title: '多格式导出', description: '同步测试平台并导出 Excel、Markdown 与 JSON。', icon: Sparkles },
];

const coverageItems = [
  { label: '主流程覆盖', value: 94 },
  { label: '异常场景覆盖', value: 82 },
  { label: '边界条件覆盖', value: 76 },
  { label: '权限与安全覆盖', value: 89 },
];

export default function Overview() {
  return (
    <div className="max-w-full overflow-hidden p-6">
      <div className="space-y-6">
        <section className="flex min-h-[120px] flex-col items-start justify-between gap-6 rounded-xl border border-slate-200 bg-white px-8 py-6 shadow-[0_4px_16px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-950/60 md:flex-row md:items-center">
          <div>
            <div className="mb-1.5 text-[13px] font-semibold leading-5 text-blue-600">AI Workbench</div>
            <h1 className="m-0 text-[26px] font-bold leading-[34px] text-slate-950 dark:text-white">AI 测试用例生成工作台</h1>
            <p className="mt-2 text-sm leading-[22px] text-slate-500 dark:text-slate-400">从需求输入、测试点确认到用例生成与导出的一站式效率看板。</p>
          </div>
          <div className="w-full md:w-auto">
            <Button className="h-10 w-full gap-2 rounded-lg bg-green-600 px-5 font-medium text-white hover:bg-green-700 md:w-auto"><Rocket className="h-4 w-4" />快速新建需求</Button>
          </div>
        </section>

        <section className="!mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="border-slate-200/80 bg-white/90 shadow-sm dark:bg-slate-950/60">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardDescription>{item.label}</CardDescription>
                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40"><Icon className="h-5 w-5" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-950 dark:text-white">{item.value}</div>
                  <p className="mt-2 text-xs text-slate-500">{item.trend}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>快速开始</CardTitle>
              <CardDescription>按推荐流程完成一次需求到用例的闭环。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {['上传需求文档', '确认测试点', '生成并导出用例'].map((step, index) => (
                <div key={step} className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{index + 1}</div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{step}</h3>
                  <p className="mt-2 text-sm text-slate-500">系统会自动保留版本和分析上下文。</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>需求覆盖概览</CardTitle>
              <CardDescription>最近 30 天聚合覆盖情况。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {coverageItems.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm"><span>{item.label}</span><span className="font-semibold">{item.value}%</span></div>
                  <Progress value={item.value} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>最近项目</CardTitle>
              <CardDescription>优先处理覆盖率偏低或待确认项目。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="text-left text-slate-500"><tr><th className="py-3">项目</th><th>状态</th><th>负责人</th><th>覆盖率</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentProjects.map((project) => (
                      <tr key={project.name}>
                        <td className="py-3 font-medium text-slate-900 dark:text-white">{project.name}</td>
                        <td><Badge variant="outline">{project.status}</Badge></td>
                        <td className="text-slate-500">{project.owner}</td>
                        <td className="w-40"><Progress value={project.coverage} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>系统能力</CardTitle>
              <CardDescription>围绕测试设计知识库与模型编排的核心能力。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {abilities.map((ability) => {
                const Icon = ability.icon;
                return (
                  <div key={ability.title} className="rounded-xl border bg-slate-50/60 p-4 dark:bg-slate-900/60">
                    <Icon className="mb-3 h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">{ability.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{ability.description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
