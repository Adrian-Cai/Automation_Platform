import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

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
    <div className="w-full rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/60 dark:bg-[#131729]">
      <h3 className="mb-4 font-display text-sm font-semibold text-slate-900 dark:text-white">
        解析配置
      </h3>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">需求标题</span>
            <Input
              className="h-9 rounded-lg border-slate-200 bg-slate-50/50 text-sm transition-colors focus:bg-white dark:border-slate-700 dark:bg-slate-900/50 dark:focus:bg-slate-900"
              value={config.title}
              placeholder="输入需求名称"
              onChange={(event) => updateConfig("title", event.target.value)}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">产品线</span>
            <Input
              className="h-9 rounded-lg border-slate-200 bg-slate-50/50 text-sm transition-colors focus:bg-white dark:border-slate-700 dark:bg-slate-900/50 dark:focus:bg-slate-900"
              value={config.productLine}
              placeholder="例如：交易平台"
              onChange={(event) => updateConfig("productLine", event.target.value)}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">优先级</span>
            <Input
              className="h-9 rounded-lg border-slate-200 bg-slate-50/50 text-sm transition-colors focus:bg-white dark:border-slate-700 dark:bg-slate-900/50 dark:focus:bg-slate-900"
              value={config.priority}
              placeholder="P0 / P1 / P2"
              onChange={(event) => updateConfig("priority", event.target.value)}
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { key: "enableAiSummary" as const, label: "生成需求摘要" },
            { key: "enableRiskScan" as const, label: "扫描歧义与风险" },
            { key: "enableCaseSuggestion" as const, label: "生成测试点建议" },
          ].map((item) => (
            <label
              key={item.key}
              className="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/30 px-3 py-2.5 transition-all duration-200 hover:border-[#39E079]/30 hover:bg-[#39E079]/5 hover:shadow-sm dark:border-slate-800/60 dark:bg-slate-900/20 dark:hover:border-[#39E079]/20 dark:hover:bg-[#39E079]/5"
            >
              <Checkbox
                checked={config[item.key]}
                className="transition-transform duration-150 group-hover:scale-110"
                onCheckedChange={(checked) => updateConfig(item.key, checked === true)}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {item.label}
              </span>
              {config[item.key] && (
                <div className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#39E079] shadow-sm shadow-[#39E079]/50" />
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RequirementConfigForm;
