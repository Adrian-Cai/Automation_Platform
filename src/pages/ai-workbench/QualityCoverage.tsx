import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  Layers3,
  Lightbulb,
  PieChart as PieChartIcon,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface KpiCardItem {
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
  icon: LucideIcon;
  tone: string;
}

interface QualityIssue {
  type: string;
  description: string;
  relatedCase: string;
  suggestion: string;
  action: '处理' | '采纳';
  severity: '高' | '中' | '低';
}

interface AiSuggestion {
  title: string;
  description: string;
  action: string;
}

interface CoverageDatum {
  name: string;
  value: number;
  color: string;
}

interface ModuleCoverage {
  module: string;
  testPoints: number;
  caseCount: number;
  coverage: number;
  status: '已覆盖' | '部分覆盖' | '未覆盖';
}

const kpiCards: KpiCardItem[] = [
  {
    title: '用例总数',
    value: '128',
    trend: '较上次 +12 条',
    trendDirection: 'up',
    icon: FileText,
    tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300',
  },
  {
    title: '重复用例',
    value: '6',
    trend: '较上次 -3 条',
    trendDirection: 'down',
    icon: Layers3,
    tone: 'bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-300',
  },
  {
    title: '缺失场景',
    value: '9',
    trend: '较上次 -2 个',
    trendDirection: 'down',
    icon: AlertTriangle,
    tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300',
  },
  {
    title: '覆盖率',
    value: '86%',
    trend: '较上次 +4.8%',
    trendDirection: 'up',
    icon: CheckCircle2,
    tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300',
  },
];

const qualityIssues: QualityIssue[] = [
  {
    type: '重复用例',
    description: '“支付成功后订单状态更新”与回归集中已有用例步骤高度相似。',
    relatedCase: 'TC-PAY-018 / TC-PAY-041',
    suggestion: '合并公共前置步骤，仅保留差异化断言。',
    action: '处理',
    severity: '中',
  },
  {
    type: '预期不明确',
    description: '退款失败场景仅描述“提示错误”，缺少错误码和状态校验。',
    relatedCase: 'TC-REFUND-006',
    suggestion: '补充错误码、资金流水状态和用户提示文案。',
    action: '采纳',
    severity: '高',
  },
  {
    type: '场景缺失',
    description: '优惠券叠加规则未覆盖跨店铺满减与会员折扣同时生效。',
    relatedCase: '需求 REQ-COUPON-12',
    suggestion: '新增边界金额、互斥券和过期券组合用例。',
    action: '处理',
    severity: '高',
  },
  {
    type: '数据不可执行',
    description: '库存锁定失败用例未提供可复现的库存初始值。',
    relatedCase: 'TC-STOCK-022',
    suggestion: '补充库存准备脚本和回滚校验。',
    action: '采纳',
    severity: '低',
  },
];

const aiSuggestions: AiSuggestion[] = [
  {
    title: '补齐支付超时后的订单状态分支',
    description: '建议新增“支付网关超时但回调成功”“超时后用户取消订单”两条补充用例。',
    action: '生成补充用例',
  },
  {
    title: '合并重复的优惠券校验步骤',
    description: '检测到 3 条优惠券用例的前置条件一致，可抽取为共享步骤减少维护成本。',
    action: '去重优化',
  },
  {
    title: '强化退款异常预期结果',
    description: '建议在预期结果中增加资金流水、消息通知和审计日志三类断言。',
    action: '优化预期结果',
  },
];

const coverageData: CoverageDatum[] = [
  { name: '已覆盖', value: 68, color: '#10b981' },
  { name: '部分覆盖', value: 21, color: '#f59e0b' },
  { name: '未覆盖', value: 11, color: '#ef4444' },
];

const moduleCoverage: ModuleCoverage[] = [
  { module: '订单创建', testPoints: 24, caseCount: 31, coverage: 96, status: '已覆盖' },
  { module: '支付结算', testPoints: 28, caseCount: 34, coverage: 88, status: '已覆盖' },
  { module: '优惠券规则', testPoints: 18, caseCount: 17, coverage: 72, status: '部分覆盖' },
  { module: '库存回滚', testPoints: 14, caseCount: 9, coverage: 64, status: '部分覆盖' },
  { module: '消息通知', testPoints: 10, caseCount: 4, coverage: 38, status: '未覆盖' },
];

const getSeverityVariant = (severity: QualityIssue['severity']) => {
  if (severity === '高') {
    return 'destructive';
  }

  if (severity === '中') {
    return 'warning';
  }

  return 'outline';
};

const getCoverageVariant = (status: ModuleCoverage['status']) => {
  if (status === '已覆盖') {
    return 'success';
  }

  if (status === '部分覆盖') {
    return 'warning';
  }

  return 'destructive';
};

export default function QualityCoverage() {
  return (
    <div className="max-w-full overflow-hidden p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3">质量覆盖</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">质量检查与覆盖率</h1>
            <p className="mt-2 text-sm text-slate-500">检查用例质量、覆盖缺口和 AI 优化建议，快速定位测试薄弱环节。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2"><ShieldCheck className="h-4 w-4" />一键检查质量</Button>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />导出检查报告</Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((item) => {
            const Icon = item.icon;
            const TrendIcon = item.trendDirection === 'up' ? TrendingUp : TrendingDown;
            const trendClassName = item.trendDirection === 'up' ? 'text-emerald-600' : 'text-rose-600';

            return (
              <Card key={item.title}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <p className="text-sm text-slate-500">{item.title}</p>
                      <div className="text-3xl font-bold text-slate-950 dark:text-white">{item.value}</div>
                      <div className={`flex items-center gap-1 text-xs font-medium ${trendClassName}`}>
                        <TrendIcon className="h-3.5 w-3.5" />
                        {item.trend}
                      </div>
                    </div>
                    <div className={`rounded-2xl p-3 ${item.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <Card>
            <CardHeader>
              <CardTitle>用例质量检查结果</CardTitle>
              <CardDescription>基于规则库和大模型交叉评估，优先处理高风险问题。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border">
                <div className="min-w-[980px]">
                  <div className="grid grid-cols-[0.9fr_1.7fr_1.1fr_1.5fr_0.8fr] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 dark:bg-slate-900/60">
                  <span>问题类型</span>
                  <span>问题描述</span>
                  <span>关联用例</span>
                  <span>建议修改</span>
                  <span className="text-right">操作</span>
                </div>
                  {qualityIssues.map((issue) => (
                    <div key={`${issue.type}-${issue.relatedCase}`} className="grid grid-cols-[0.9fr_1.7fr_1.1fr_1.5fr_0.8fr] gap-4 border-t px-4 py-4 text-sm">
                    <div className="space-y-2">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{issue.type}</div>
                      <Badge variant={getSeverityVariant(issue.severity)}>{issue.severity}风险</Badge>
                    </div>
                    <div className="leading-6 text-slate-600 dark:text-slate-300">{issue.description}</div>
                    <div className="font-medium text-slate-700 dark:text-slate-200">{issue.relatedCase}</div>
                    <div className="leading-6 text-slate-600 dark:text-slate-300">{issue.suggestion}</div>
                      <div className="flex justify-end">
                        <Button size="sm" variant={issue.action === '采纳' ? 'default' : 'outline'}>{issue.action}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" />AI 优化建议</CardTitle>
              <CardDescription>建议可一键应用到用例草稿。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiSuggestions.map((suggestion) => (
                <div key={suggestion.title} className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
                  <div className="mb-3 flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">{suggestion.title}</div>
                      <p className="mt-1 leading-6">{suggestion.description}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary">{suggestion.action}</Button>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">查看全部建议</Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-blue-600" />覆盖率分析</CardTitle>
            <CardDescription>展示已覆盖、部分覆盖、未覆盖占比，并定位模块级覆盖薄弱点。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-xl border p-4">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(value?: string | number | readonly (string | number)[], name?: string | number) => [`${value ?? 0}%`, String(name ?? '')]} />
                      <Pie data={coverageData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={4}>
                        {coverageData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {coverageData.map((item) => (
                    <div key={item.name} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </div>
                      <div className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{item.value}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border">
                <div className="min-w-[780px]">
                  <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr_0.9fr] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 dark:bg-slate-900/60">
                  <span>模块</span>
                  <span>测试点数</span>
                  <span>用例数</span>
                  <span>覆盖率</span>
                  <span className="text-right">覆盖状态</span>
                </div>
                  {moduleCoverage.map((item) => (
                    <div key={item.module} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr_0.9fr] items-center gap-4 border-t px-4 py-4 text-sm">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{item.module}</div>
                    <div className="text-slate-600 dark:text-slate-300">{item.testPoints}</div>
                    <div className="text-slate-600 dark:text-slate-300">{item.caseCount}</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>覆盖进度</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{item.coverage}%</span>
                      </div>
                      <Progress value={item.coverage} />
                    </div>
                      <div className="flex justify-end">
                        <Badge variant={getCoverageVariant(item.status)}>{item.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
