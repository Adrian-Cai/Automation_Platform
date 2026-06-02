import { AlertTriangle, CheckCircle2, HelpCircle, Plus, Search, Target } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

const modules = [
  { name: '订单提交', count: 18, confidence: 96 },
  { name: '库存校验', count: 9, confidence: 88 },
  { name: '优惠券核销', count: 12, confidence: 91 },
];
const questions = ['优惠券与满减活动是否可叠加？', '库存锁定失败后是否支持自动重试？', '支付超时后订单状态如何回滚？'];
const risks = ['跨系统状态不一致', '高并发库存超卖', '异常提示缺少可操作信息'];
const testPoints = [
  { title: '有效地址和库存充足时成功提交订单', priority: 'P0', type: '主流程' },
  { title: '优惠券过期时展示失效提示', priority: 'P1', type: '异常' },
  { title: '库存不足时保留购物车勾选状态', priority: 'P0', type: '边界' },
  { title: '未登录用户提交订单时跳转登录页', priority: 'P1', type: '权限' },
];

export default function RequirementAnalysis() {
  return (
    <div className="max-w-full overflow-hidden p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3">需求分析</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">需求分析与测试点</h1>
            <p className="mt-2 text-sm text-slate-500">识别模块、疑问与风险，并确认可执行测试点。</p>
          </div>
          <Button className="gap-2"><CheckCircle2 className="h-4 w-4" />确认测试点</Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-blue-600" />功能模块识别</CardTitle>
              <CardDescription>按业务域聚类需求片段。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {modules.map((module) => (
                <div key={module.name} className="space-y-2 rounded-xl border p-3">
                  <div className="flex items-center justify-between"><span className="font-semibold">{module.name}</span><Badge variant="outline">{module.count} 点</Badge></div>
                  <Progress value={module.confidence} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-amber-500" />需求疑问识别</CardTitle>
              <CardDescription>需业务方补充确认的问题。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {questions.map((question) => <div key={question} className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">{question}</div>)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-rose-500" />风险点识别</CardTitle>
              <CardDescription>优先转化为高优先级测试点。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {risks.map((risk) => <div key={risk} className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/20 dark:text-rose-200">{risk}</div>)}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>测试点筛选</CardTitle>
            <CardDescription>按模块、优先级或关键字快速定位。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
            <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input className="pl-9" placeholder="搜索测试点" /></div>
            <Input placeholder="模块" />
            <Input placeholder="优先级" />
            <Button variant="outline">筛选</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>测试点列表</CardTitle>
            <CardDescription>确认后将作为用例生成的输入基线。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-left text-slate-500"><tr><th className="py-3">测试点</th><th>优先级</th><th>类型</th><th>状态</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {testPoints.map((point) => (
                    <tr key={point.title}>
                      <td className="py-3 font-medium text-slate-900 dark:text-white">{point.title}</td>
                      <td><Badge variant={point.priority === 'P0' ? 'destructive' : 'outline'}>{point.priority}</Badge></td>
                      <td className="text-slate-500">{point.type}</td>
                      <td><Badge variant="success">待确认</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-blue-600" />新增测试点</CardTitle>
            <CardDescription>补充人工识别的业务规则或特殊场景。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="测试点标题" />
            <Textarea placeholder="输入前置条件、触发动作和预期结果" />
            <Button variant="outline">添加到列表</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
