import { FileText, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFileSize, RequirementFileType } from "@/pages/cases/requirementInputUtils";

export interface UploadedRequirementFile {
  id: string;
  name: string;
  size: number;
  type: RequirementFileType;
  extractedText?: string;
}

interface UploadedFileListProps {
  files: UploadedRequirementFile[];
  onRemove: (id: string) => void;
}

function UploadedFileList({ files, onRemove }: UploadedFileListProps) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/60 dark:bg-[#131729]">
      <h3 className="mb-3 font-display text-sm font-semibold text-slate-900 dark:text-white">
        已上传文件
        {files.length > 0 && (
          <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-100 px-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {files.length}
          </span>
        )}
      </h3>
      <div className="space-y-2">
        {files.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-500">
            暂无附件，上传后显示文件信息
          </div>
        ) : (
          files.map((file, index) => (
            <div
              key={file.id}
              className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm dark:border-slate-800/60 dark:bg-slate-900/30 dark:hover:border-slate-700 dark:hover:bg-slate-900/50"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
                  <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {file.type}
                </Badge>
                {file.extractedText ? (
                  <Badge className="bg-[#39E079]/10 text-[#2ba85a] dark:bg-[#39E079]/15 dark:text-[#39E079]">
                    已读取
                  </Badge>
                ) : (
                  <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                    待解析
                  </Badge>
                )}
                <Button
                  aria-label={`移除 ${file.name}`}
                  className="h-7 w-7 rounded-lg opacity-0 transition-all duration-200 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-950/30"
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => onRemove(file.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UploadedFileList;
