import { Input } from '@/components/ui/input';
import type { GenerateTarget, RequirementType } from '@/lib/requirementInput';
import { generateTargetOptions, requirementTypeOptions } from '@/lib/requirementInput';

interface RequirementConfigFormProps {
  projectName: string;
  requirementName: string;
  requirementType: RequirementType;
  generateTarget: GenerateTarget;
  onProjectNameChange: (value: string) => void;
  onRequirementNameChange: (value: string) => void;
  onRequirementTypeChange: (value: RequirementType) => void;
  onGenerateTargetChange: (value: GenerateTarget) => void;
}

const selectClassName = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-700 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export default function RequirementConfigForm({
  projectName,
  requirementName,
  requirementType,
  generateTarget,
  onProjectNameChange,
  onRequirementNameChange,
  onRequirementTypeChange,
  onGenerateTargetChange,
}: RequirementConfigFormProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 md:grid-cols-2 xl:grid-cols-4">
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-800">项目名称 <span className="text-red-500">*</span></span>
        <Input
          value={projectName}
          onChange={(event) => onProjectNameChange(event.target.value)}
          placeholder="请输入项目名称"
          className="border-slate-200 focus-visible:ring-blue-500"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-800">需求名称 <span className="text-red-500">*</span></span>
        <Input
          value={requirementName}
          onChange={(event) => onRequirementNameChange(event.target.value)}
          placeholder="请输入需求名称"
          className="border-slate-200 focus-visible:ring-blue-500"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-800">需求类型</span>
        <select
          value={requirementType}
          onChange={(event) => onRequirementTypeChange(event.target.value as RequirementType)}
          className={selectClassName}
        >
          {requirementTypeOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-800">生成目标 <span className="text-red-500">*</span></span>
        <select
          value={generateTarget}
          onChange={(event) => onGenerateTargetChange(event.target.value as GenerateTarget)}
          className={selectClassName}
        >
          {generateTargetOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
