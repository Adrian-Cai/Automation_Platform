import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface RequirementConfig {
  title: string;
  productLine: string;
  priority: string;
  enableAiSummary: boolean;
  enableRiskScan: boolean;
  enableCaseSuggestion: boolean;
}

interface RequirementConfigFormProps {
  config: RequirementConfig;
  onChange: (config: RequirementConfig) => void;
}

function RequirementConfigForm({ config, onChange }: RequirementConfigFormProps) {
  const updateConfig = <Key extends keyof RequirementConfig>(key: Key, value: RequirementConfig[Key]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">解析配置</CardTitle>
        <CardDescription>设置需求元信息和 AI 解析目标，便于后续生成测试点与用例。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            需求标题
            <Input value={config.title} placeholder="输入需求名称" onChange={(event) => updateConfig("title", event.target.value)} />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            产品线
            <Input value={config.productLine} placeholder="例如：交易平台" onChange={(event) => updateConfig("productLine", event.target.value)} />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            优先级
            <Input value={config.priority} placeholder="P0 / P1 / P2" onChange={(event) => updateConfig("priority", event.target.value)} />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
            <Checkbox checked={config.enableAiSummary} onCheckedChange={(checked) => updateConfig("enableAiSummary", checked === true)} />
            生成需求摘要
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
            <Checkbox checked={config.enableRiskScan} onCheckedChange={(checked) => updateConfig("enableRiskScan", checked === true)} />
            扫描歧义与风险
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
            <Checkbox checked={config.enableCaseSuggestion} onCheckedChange={(checked) => updateConfig("enableCaseSuggestion", checked === true)} />
            生成测试点建议
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

export default RequirementConfigForm;
