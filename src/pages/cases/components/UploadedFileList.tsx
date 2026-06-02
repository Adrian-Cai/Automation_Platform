import { FileText, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">已上传文件</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {files.length === 0 ? (
          <div className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            暂无附件，上传后会显示文件类型、大小和读取状态。
          </div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-blue-500" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{file.type}</Badge>
                {file.extractedText ? <Badge variant="success">已读取</Badge> : <Badge variant="outline">待解析</Badge>}
                <Button aria-label={`移除 ${file.name}`} size="icon" type="button" variant="ghost" onClick={() => onRemove(file.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default UploadedFileList;
