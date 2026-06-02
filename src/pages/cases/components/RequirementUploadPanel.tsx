import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RequirementUploadPanelProps {
  onFilesSelected: (files: File[]) => void;
}

function RequirementUploadPanel({ onFilesSelected }: RequirementUploadPanelProps) {
  return (
    <Card className="border-dashed border-blue-200 bg-blue-50/40 dark:border-blue-900/60 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UploadCloud className="h-5 w-5 text-blue-600" />
          上传需求附件
        </CardTitle>
        <CardDescription>
          支持 TXT、Markdown、PDF、Word、Excel 等需求材料，可与下方文本输入合并解析。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-blue-300 bg-white/70 px-6 py-8 text-center transition hover:border-blue-500 hover:bg-white dark:border-blue-800 dark:bg-slate-900/60 dark:hover:border-blue-500">
          <UploadCloud className="mb-3 h-10 w-10 text-blue-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">点击选择或拖拽需求文件</span>
          <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">单次可选择多个文件，文本类文件会自动读取内容</span>
          <input
            className="sr-only"
            multiple
            type="file"
            accept=".txt,.md,.markdown,.pdf,.doc,.docx,.xls,.xlsx,.csv"
            onChange={(event) => {
              onFilesSelected(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
          />
          <Button className="mt-4" type="button" variant="outline">
            选择文件
          </Button>
        </label>
      </CardContent>
    </Card>
  );
}

export default RequirementUploadPanel;
