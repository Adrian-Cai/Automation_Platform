import { FileText, Save, Settings as SettingsIcon, Sliders, Wand2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

const modelOptions = ['GPT-4.1 测试设计增强', 'Claude 需求分析', '本地私有模型'];
const caseTemplates = ['功能用例字段集', '接口用例字段集', '自动化脚本字段集'];
const exportFormats = ['Excel 默认列宽', 'Markdown 评审格式', 'JSON Schema v2'];
const preferences = [
  { label: '默认生成语言', value: '简体中文' },
  { label: '默认优先级策略', value: '风险优先' },
  { label: '质量阈值', value: '85 分' },
];

export default function Settings() {
  return (
    <div className="max-w-full overflow-hidden p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3">设置</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">AI 工作台设置</h1>
            <p className="mt-2 text-sm text-slate-500">维护模型、Prompt、用例模板、导出规则和基础偏好。</p>
          </div>
          <Button className="gap-2"><Save className="h-4 w-4" />保存设置</Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><SettingsIcon className="h-5 w-5 text-blue-600" />模型配置</CardTitle>
              <CardDescription>配置默认模型、温度和上下文窗口策略。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {modelOptions.map((model) => <Button key={model} variant="outline" className="justify-start">{model}</Button>)}
              </div>
              <Input defaultValue="temperature: 0.2" aria-label="模型温度" />
              <div className="space-y-2"><div className="flex items-center justify-between text-sm"><span>上下文预算</span><span className="font-semibold">72%</span></div><Progress value={72} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-blue-600" />Prompt 模板配置</CardTitle>
              <CardDescription>按需求类型维护系统提示词和输出约束。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input defaultValue="需求分析 Prompt / v3" aria-label="Prompt 模板名称" />
              <Textarea className="min-h-36" defaultValue="你是资深测试架构师。请从需求中抽取功能模块、业务规则、异常风险和可执行测试点，并输出结构化 JSON。" />
              <Button variant="outline">预览 Prompt</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" />用例模板配置</CardTitle>
              <CardDescription>配置字段、默认值和必填校验。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {caseTemplates.map((template) => (
                <div key={template} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-3"><span className="font-semibold">{template}</span><Badge variant="outline">启用</Badge></div>
                  <p className="mt-2 text-sm text-slate-500">包含标题、前置条件、步骤、预期结果、优先级和标签。</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>导出配置</CardTitle>
              <CardDescription>维护默认导出格式、命名规则和同步字段映射。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {exportFormats.map((format) => <Button key={format} variant="outline" className="w-full justify-start">{format}</Button>)}
              <Textarea defaultValue="文件名规则：{project}-{requirement}-{version}-{date}" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sliders className="h-5 w-5 text-blue-600" />基础偏好设置</CardTitle>
            <CardDescription>这些设置会作为新工作台的默认值。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-slate-500"><tr><th className="py-3">偏好项</th><th>当前值</th><th>说明</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {preferences.map((preference) => (
                    <tr key={preference.label}>
                      <td className="py-3 font-medium text-slate-900 dark:text-white">{preference.label}</td>
                      <td>{preference.value}</td>
                      <td className="text-slate-500">可在单个项目中覆盖。</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
