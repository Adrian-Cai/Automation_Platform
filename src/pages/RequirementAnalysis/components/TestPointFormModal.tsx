import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Priority, TestPoint, TestPointFormValues, TestPointType } from "../types";

interface TestPointFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  currentTestPoint: TestPoint | null;
  moduleOptions: string[];
  testTypeOptions: TestPointType[];
  priorityOptions: Priority[];
  nextCode: string;
  onOpenChange: (open: boolean) => void;
  onSave: (values: TestPointFormValues) => void;
}

const emptyValues: TestPointFormValues = {
  module: "",
  description: "",
  type: "",
  priority: "",
  relatedRisk: "",
  generated: false,
  remark: "",
};

function TestPointFormModal({ open, mode, currentTestPoint, moduleOptions, testTypeOptions, priorityOptions, nextCode, onOpenChange, onSave }: TestPointFormModalProps) {
  const [values, setValues] = useState<TestPointFormValues>(emptyValues);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && currentTestPoint) {
      setValues({
        module: currentTestPoint.module,
        description: currentTestPoint.description,
        type: currentTestPoint.type,
        priority: currentTestPoint.priority,
        relatedRisk: currentTestPoint.relatedRisk ?? "",
        generated: currentTestPoint.generated,
        remark: currentTestPoint.remark ?? "",
      });
      return;
    }
    setValues(emptyValues);
  }, [currentTestPoint, mode, open]);

  const updateValue = <K extends keyof TestPointFormValues>(key: K, value: TestPointFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!values.module) {
      toast.error("请选择所属模块");
      return;
    }
    if (!values.description.trim()) {
      toast.error("请填写测试点描述");
      return;
    }
    if (values.description.length > 200) {
      toast.error("测试点描述最多 200 字");
      return;
    }
    if (!values.type) {
      toast.error("请选择测试类型");
      return;
    }
    if (!values.priority) {
      toast.error("请选择优先级");
      return;
    }
    if (values.remark.length > 500) {
      toast.error("备注最多 500 字");
      return;
    }
    onSave({ ...values, description: values.description.trim(), remark: values.remark.trim(), relatedRisk: values.relatedRisk.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "新增测试点" : "编辑测试点"}</DialogTitle>
          <DialogDescription>{mode === "create" ? `系统将生成新编号 ${nextCode}` : "修改后将同步更新核心测试点列表。"}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              所属模块<span className="text-red-500"> *</span>
              <select className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={values.module} onChange={(event) => updateValue("module", event.target.value)}>
                <option value="">请选择</option>
                {moduleOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              测试类型<span className="text-red-500"> *</span>
              <select className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={values.type} onChange={(event) => updateValue("type", event.target.value as TestPointType)}>
                <option value="">请选择</option>
                {testTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <label className="text-sm font-medium text-slate-700">
            测试点描述<span className="text-red-500"> *</span>
            <Textarea className="mt-2 min-h-[96px]" maxLength={200} value={values.description} onChange={(event) => updateValue("description", event.target.value)} placeholder="请输入不超过 200 字的测试点描述" />
            <span className="mt-1 block text-right text-xs text-slate-400">{values.description.length}/200</span>
          </label>
          <div className="grid gap-2 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              优先级<span className="text-red-500"> *</span>
              <select className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={values.priority} onChange={(event) => updateValue("priority", event.target.value as Priority)}>
                <option value="">请选择</option>
                {priorityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              关联风险
              <Input className="mt-2" value={values.relatedRisk} onChange={(event) => updateValue("relatedRisk", event.target.value)} placeholder="可填写关联风险标题" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Checkbox checked={values.generated} onCheckedChange={(checked) => updateValue("generated", checked === true)} />
            是否生成用例
          </label>
          <label className="text-sm font-medium text-slate-700">
            备注
            <Textarea className="mt-2 min-h-[88px]" maxLength={500} value={values.remark} onChange={(event) => updateValue("remark", event.target.value)} placeholder="请输入备注，最多 500 字" />
            <span className="mt-1 block text-right text-xs text-slate-400">{values.remark.length}/500</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TestPointFormModal;
