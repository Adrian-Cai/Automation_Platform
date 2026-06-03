import { Edit3, FileText, Layers3, PlayCircle, SlidersHorizontal } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

const caseTypes = ['功能正向', '异常流程', '边界值', '权限安全', '兼容回归'];
const granularities = [
  { label: '粗粒度', description: '适合冒烟与业务验收' },
  { label: '标准粒度', description: '推荐覆盖主要步骤和断言' },
  { label: '细粒度', description: '适合自动化脚本落地' },
];
const templates = ['标准测试用例模板', '接口自动化模板', 'BDD Gherkin 模板', '回归清单模板'];
const cases = [
  { id: 'TC-001', title: '库存充足时成功提交订单', priority: 'P0', status: '已生成', score: 94 },
  { id: 'TC-002', title: '优惠券过期时阻止提交并提示', priority: 'P1', status: '待优化', score: 82 },
  { id: 'TC-003', title: '支付方式不可用时展示替换入口', priority: 'P1', status: '已生成', score: 88 },
];

export default function CaseGeneration() {
  return (
    <div className="max-w-full overflow-hidden p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3">用例生成</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">用例生成与编辑</h1>
            <p className="mt-2 text-sm text-slate-500">根据已确认测试点生成可编辑、可导出的测试用例。</p>
          </div>
          <Button className="gap-2"><PlayCircle className="h-4 w-4" />生成用例</Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-blue-600" />用例类型配置</CardTitle>
                <CardDescription>选择本轮生成覆盖的用例类型。</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {caseTypes.map((type) => <Badge key={type} variant="outline">{type}</Badge>)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Layers3 className="h-5 w-5 text-blue-600" />颗粒度配置</CardTitle>
                <CardDescription>控制步骤拆分、断言密度和数据准备详细度。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {granularities.map((item) => (
                  <label key={item.label} className="flex items-start gap-3 rounded-xl border p-3">
                    <Input type="radio" name="granularity" className="mt-1 h-4 w-4" />
                    <span><span className="block font-semibold">{item.label}</span><span className="text-sm text-slate-500">{item.description}</span></span>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>模板选择</CardTitle>
                <CardDescription>模板字段会同步影响导出结构。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {templates.map((template) => <Button key={template} variant="outline" className="w-full justify-start">{template}</Button>)}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" />用例列表</CardTitle>
              <CardDescription>点击编辑可在右侧抽屉中调整步骤和预期结果。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="text-left text-slate-500"><tr><th className="py-3">编号</th><th>标题</th><th>优先级</th><th>质量</th><th>状态</th><th>操作</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cases.map((testCase) => (
                      <tr key={testCase.id}>
                        <td className="py-3 font-mono text-slate-500">{testCase.id}</td>
                        <td className="font-medium text-slate-900 dark:text-white">{testCase.title}</td>
                        <td><Badge variant={testCase.priority === 'P0' ? 'destructive' : 'outline'}>{testCase.priority}</Badge></td>
                        <td className="w-36"><Progress value={testCase.score} /></td>
                        <td><Badge variant="success">{testCase.status}</Badge></td>
                        <td><Button size="sm" variant="ghost" className="gap-2"><Edit3 className="h-4 w-4" />编辑</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="ml-auto max-w-3xl border-blue-100 shadow-lg shadow-blue-900/5">
          <CardHeader>
            <CardTitle>用例详情编辑抽屉</CardTitle>
            <CardDescription>模拟右侧抽屉区域，承载用例字段、步骤和断言编辑。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input defaultValue="TC-001" aria-label="用例编号" />
              <Input defaultValue="P0 / 功能正向" aria-label="优先级和类型" />
            </div>
            <Input defaultValue="库存充足时成功提交订单" aria-label="用例标题" />
            <Textarea className="min-h-32" defaultValue="1. 登录用户进入购物车\n2. 勾选库存充足商品并使用有效优惠券\n3. 选择支付方式并提交订单\n预期：订单创建成功，库存锁定，页面展示支付入口。" />
            <div className="flex justify-end gap-3"><Button variant="outline">取消</Button><Button>保存修改</Button></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
