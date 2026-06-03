import { FileUp, Filter, Play, Scissors, UploadCloud } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

const requirementTypes = ['业务流程', '接口规范', '页面交互', '权限规则'];
const generationTargets = ['功能用例', '接口用例', '异常用例', '回归清单'];
const cleanRules = ['去除重复段落', '补齐编号层级', '抽取验收标准', '识别约束条件'];
const rawContent = '用户在提交订单时，需要校验库存、优惠券、支付方式与收货地址。若任一信息无效，应给出明确提示并保留已填写内容。';
const cleanedContent = '提交订单流程：校验库存、优惠券、支付方式、收货地址；异常时展示明确提示，并保持用户输入上下文。';

export default function RequirementInput() {
  return (
    <div className="max-w-full overflow-hidden p-6">
      <div className="space-y-6">
        <div>
          <Badge variant="secondary" className="mb-3">需求输入</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">需求输入与解析</h1>
          <p className="mt-2 text-sm text-slate-500">上传、粘贴并清洗需求内容，生成结构化分析上下文。</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UploadCloud className="h-5 w-5 text-blue-600" />上传文档</CardTitle>
                <CardDescription>支持需求说明、PRD、接口文档与验收清单。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-8 text-center dark:border-blue-900 dark:bg-blue-950/20">
                  <FileUp className="mx-auto mb-3 h-9 w-9 text-blue-600" />
                  <p className="font-semibold text-slate-900 dark:text-white">拖拽文件到此处或点击上传</p>
                  <p className="mt-1 text-sm text-slate-500">DOCX / PDF / Markdown / TXT，单文件不超过 50MB</p>
                  <Button className="mt-4" variant="outline">选择文件</Button>
                </div>
                <Input placeholder="可选：输入需求编号或项目名称" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>需求类型</CardTitle>
                <CardDescription>用于匹配更合适的 Prompt 和用例模板。</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {requirementTypes.map((type) => <Badge key={type} variant="outline">{type}</Badge>)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>生成目标</CardTitle>
                <CardDescription>可多选，影响后续测试点拆解维度。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {generationTargets.map((target) => (
                  <label key={target} className="flex items-center gap-3 rounded-xl border p-3 text-sm font-medium">
                    <Input type="checkbox" className="h-4 w-4" />{target}
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>粘贴文本</CardTitle>
                <CardDescription>直接输入需求原文，AI 将保留关键业务语义。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea className="min-h-40" defaultValue={rawContent} />
                <div className="flex flex-wrap gap-3">
                  <Button className="gap-2"><Play className="h-4 w-4" />开始解析</Button>
                  <Button variant="outline" className="gap-2"><Scissors className="h-4 w-4" />仅清洗文本</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5 text-blue-600" />清洗规则</CardTitle>
                <CardDescription>默认规则可在设置中维护。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {cleanRules.map((rule) => (
                  <div key={rule} className="rounded-xl border bg-slate-50/70 p-3 text-sm text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">{rule}</div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>解析进度</CardTitle>
                <CardDescription>当前处于需求实体抽取阶段。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm"><span>结构化解析</span><span className="font-semibold">68%</span></div>
                <Progress value={68} />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>原始内容和清洗后内容对比</CardTitle>
            <CardDescription>左侧保留原文，右侧展示去重、纠偏与结构化结果。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              <Textarea className="min-h-44" defaultValue={rawContent} />
              <Textarea className="min-h-44" defaultValue={cleanedContent} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
