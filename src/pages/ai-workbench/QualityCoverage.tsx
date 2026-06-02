import { Download, Lightbulb, PieChart, ShieldCheck, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const qualityChecks = [
  { label: '步骤完整性', value: 92, result: '通过' },
  { label: '断言明确性', value: 84, result: '需优化' },
  { label: '数据可执行性', value: 78, result: '需补充' },
  { label: '重复用例检测', value: 96, result: '通过' },
];
const suggestions = ['为支付超时场景补充订单状态断言。', '将库存不足和库存锁定失败拆分为两个独立用例。', '补充优惠券叠加规则的边界数据。'];
const coverage = [
  { name: '功能路径', value: 93 },
  { name: '异常路径', value: 81 },
  { name: '边界条件', value: 76 },
  { name: '兼容回归', value: 68 },
];
const priorities = [
  { label: 'P0', count: 28, className: 'bg-rose-500' },
  { label: 'P1', count: 46, className: 'bg-blue-500' },
  { label: 'P2', count: 31, className: 'bg-slate-400' },
];

export default function QualityCoverage() {
  return (
    <div className="max-w-full overflow-hidden p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3">质量覆盖</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">质量检查与覆盖率</h1>
            <p className="mt-2 text-sm text-slate-500">检查用例质量、覆盖缺口和优先级分布。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2"><ShieldCheck className="h-4 w-4" />一键检查质量</Button>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />导出检查报告</Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>用例质量检查结果</CardTitle>
              <CardDescription>基于规则库和大模型交叉评估。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qualityChecks.map((check) => (
                <div key={check.label} className="space-y-2 rounded-xl border p-4">
                  <div className="flex items-center justify-between text-sm"><span className="font-semibold">{check.label}</span><Badge variant={check.result === '通过' ? 'success' : 'warning'}>{check.result}</Badge></div>
                  <Progress value={check.value} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" />AI 优化建议</CardTitle>
              <CardDescription>建议可一键应用到用例草稿。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion} className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
                  <Sparkles className="mb-2 h-4 w-4" />{suggestion}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5 text-blue-600" />覆盖率分析</CardTitle>
              <CardDescription>定位生成结果中的覆盖薄弱点。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {coverage.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm"><span>{item.name}</span><span className="font-semibold">{item.value}%</span></div>
                  <Progress value={item.value} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>优先级分布</CardTitle>
              <CardDescription>确保高风险需求有足够测试密度。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {priorities.map((priority) => (
                <div key={priority.label} className="flex items-center gap-4 rounded-xl border p-4">
                  <div className={`h-3 w-3 rounded-full ${priority.className}`} />
                  <div className="flex-1"><div className="font-semibold">{priority.label}</div><div className="text-sm text-slate-500">{priority.count} 条用例</div></div>
                  <Badge variant="outline">{Math.round((priority.count / 105) * 100)}%</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
