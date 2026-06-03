import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { FileSpreadsheet, FileText, FileType2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { RequirementInputMode, UploadedFileItem } from '@/lib/requirementInput';
import { formatFileSize, getFileType } from '@/lib/requirementInput';

interface RequirementUploadPanelProps {
  inputMode: RequirementInputMode;
  onInputModeChange: (mode: RequirementInputMode) => void;
  onFilesAdd: (files: UploadedFileItem[]) => void;
}

const acceptedFileExtensions = '.doc,.docx,.pdf,.md,.txt,.xls,.xlsx';

const formatTags = [
  { label: 'Word', suffix: '.docx', icon: FileText, className: 'bg-blue-50 text-blue-700 border-blue-100' },
  { label: 'PDF', suffix: '.pdf', icon: FileType2, className: 'bg-red-50 text-red-700 border-red-100' },
  { label: 'Markdown', suffix: '.md', icon: FileText, className: 'bg-slate-50 text-slate-700 border-slate-200' },
  { label: 'Excel', suffix: '.xlsx', icon: FileSpreadsheet, className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
] as const;

export default function RequirementUploadPanel({
  inputMode,
  onInputModeChange,
  onFilesAdd,
}: RequirementUploadPanelProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const createFileItems = async (files: FileList): Promise<UploadedFileItem[]> => {
    const fileItems = Array.from(files).map(async (file): Promise<UploadedFileItem> => {
      const fileBase = {
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: getFileType(file.name),
      };

      if (file.size > 50 * 1024 * 1024) {
        return {
          ...fileBase,
          status: '上传失败',
          content: '',
          errorMessage: '文件超过 50MB，未读取内容。',
        };
      }

      try {
        const content = await file.text();
        return {
          ...fileBase,
          status: content.trim().length > 0 ? '等待解析' : '上传失败',
          content,
          errorMessage: content.trim().length > 0 ? undefined : '文件内容为空，无法解析。',
        };
      } catch {
        return {
          ...fileBase,
          status: '上传失败',
          content: '',
          errorMessage: '读取文件内容失败，请重新上传。',
        };
      }
    });

    return Promise.all(fileItems);
  };

  const handleFiles = (files: FileList | null): void => {
    if (!files || files.length === 0) {
      return;
    }

    void (async (): Promise<void> => {
      try {
        const fileItems = await createFileItems(files);
        onFilesAdd(fileItems);
      } catch {
        onFilesAdd([]);
      }
    })();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    handleFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm shadow-slate-200/50">
      <div className="flex border-b border-slate-100 bg-white px-5 pt-3">
        <button
          type="button"
          onClick={() => onInputModeChange('upload')}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            inputMode === 'upload'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          上传文档
        </button>
        <button
          type="button"
          onClick={() => onInputModeChange('text')}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            inputMode === 'text'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          粘贴文本
        </button>
      </div>

      <CardContent className="p-5">
        {inputMode === 'text' ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-cyan-200 bg-cyan-50/50 px-6 text-center">
            <FileText className="mb-3 h-9 w-9 text-cyan-600" />
            <p className="text-base font-semibold text-slate-900">已切换为粘贴文本模式</p>
            <p className="mt-2 max-w-md text-sm text-slate-500">请在下方“需求文本”区域粘贴或编辑需求内容，系统会基于文本执行模拟解析与清洗。</p>
          </div>
        ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              inputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50 shadow-inner'
              : 'border-slate-300 bg-gradient-to-b from-slate-50/70 to-white hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept={acceptedFileExtensions}
            multiple
            onChange={handleInputChange}
          />
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <UploadCloud className="h-8 w-8" />
          </div>
          <p className="text-base font-semibold text-slate-900">
            将文档拖拽到此处，或
            <Button type="button" variant="link" className="h-auto px-1 py-0 text-blue-600">
              点击上传
            </Button>
          </p>
          <p className="mt-2 text-sm text-slate-500">支持 Word、PDF、Markdown、Excel 格式，单个文件不超过 50MB</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {formatTags.map((tag) => {
              const Icon = tag.icon;
              return (
                <span key={tag.label} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${tag.className}`}>
                  <Icon className="h-4 w-4" />
                  <span className="text-left text-xs font-semibold leading-tight">
                    {tag.label}
                    <br />
                    <span className="font-normal opacity-75">{tag.suffix}</span>
                  </span>
                </span>
              );
            })}
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  );
}
