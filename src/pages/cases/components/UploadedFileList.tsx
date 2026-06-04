import { Eye, FileSpreadsheet, FileText, FileType2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UploadedFileItem, UploadedFileType } from '@/lib/requirementInput';

interface UploadedFileListProps {
  files: UploadedFileItem[];
  onPreview: (file: UploadedFileItem) => void;
  onDelete: (id: string) => void;
}

function getFileIcon(type: UploadedFileType): JSX.Element {
  if (type === 'pdf') return <FileType2 className="h-4 w-4 text-red-600" />;
  if (type === 'excel') return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
  return <FileText className="h-4 w-4 text-blue-600" />;
}

function getStatusBadge(status: UploadedFileItem['status']): JSX.Element {
  if (status === '上传成功') {
    return <Badge variant="success" className="border-0">上传成功</Badge>;
  }

  if (status === '上传失败') {
    return <Badge variant="destructive" className="border-0">上传失败</Badge>;
  }

  return <Badge variant="warning" className="border-0">等待解析</Badge>;
}

export default function UploadedFileList({ files, onPreview, onDelete }: UploadedFileListProps): JSX.Element {
  return (
    <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <CardHeader className="px-5 py-4">
        <CardTitle className="text-base font-bold text-slate-950">已上传文件（{files.length}）</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3">文件名</th>
                <th className="w-24 px-4 py-3">大小</th>
                <th className="w-28 px-4 py-3">状态</th>
                <th className="w-24 px-4 py-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      {getFileIcon(file.type)}
                      <span className="max-w-[260px] truncate" title={file.name}>{file.name}</span>
                    </div>
                    {file.errorMessage ? (
                      <p className="mt-1 max-w-[360px] text-xs leading-5 text-rose-600" title={file.errorMessage}>
                        {file.errorMessage}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{file.size}</td>
                  <td className="px-4 py-3">{getStatusBadge(file.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={() => onPreview(file)} aria-label={`预览 ${file.name}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="outline" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => onDelete(file.id)} aria-label={`删除 ${file.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {files.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                    暂无上传文件，请在左侧上传需求文档。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
