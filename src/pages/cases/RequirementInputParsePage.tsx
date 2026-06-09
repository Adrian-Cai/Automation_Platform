import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Blocks, ClipboardList, FileQuestion, Play, Save, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CleanRulesPanel from "@/pages/cases/components/CleanRulesPanel";
import ParseProgressSteps from "@/pages/cases/components/ParseProgressSteps";
import RequirementConfigForm, { RequirementConfig } from "@/pages/cases/components/RequirementConfigForm";
import RequirementContentCompare from "@/pages/cases/components/RequirementContentCompare";
import RequirementTextEditor from "@/pages/cases/components/RequirementTextEditor";
import RequirementUploadPanel from "@/pages/cases/components/RequirementUploadPanel";
import UploadedFileList, { UploadedRequirementFile } from "@/pages/cases/components/UploadedFileList";
import {
  cleanRequirementText,
  defaultCleanRequirementOptions,
  getFileType,
  loadDraftFromStorage,
  saveDraftToStorage,
  CleanRequirementOptions,
} from "@/pages/cases/requirementInputUtils";

const textFileTypes = new Set(["markdown", "text", "excel"]);

interface ParseAnalysisPanelProps {
  characterCount: number;
}

function ParseAnalysisPanel({ characterCount }: ParseAnalysisPanelProps) {
  const summaryItems = [
    { label: "文档字符数", value: characterCount },
    { label: "识别模块", value: 0 },
    { label: "需求疑问", value: 0 },
    { label: "风险点", value: 0 },
  ];

  return (
    <div className="space-y-4">
      <section className="w-full rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/60 dark:bg-[#131729]">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#39E079]/10 text-[#2ba85a] dark:bg-[#39E079]/15 dark:text-[#39E079]">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
            解析结果摘要
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {summaryItems.map((item) => (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800/60 dark:bg-slate-900/30" key={item.label}>
              <p className="text-xs text-slate-400 dark:text-slate-500">{item.label}</p>
              <p className="mt-1 font-display text-xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/60 dark:bg-[#131729]">
        <div className="mb-3 flex items-center gap-2.5">
          <Blocks className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">识别到的功能模块</h3>
        </div>
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-500">
          暂无模块，开始解析后展示
        </div>
      </section>

      <section className="w-full rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/60 dark:bg-[#131729]">
        <div className="mb-3 flex items-center gap-2.5">
          <FileQuestion className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">需求疑问</h3>
        </div>
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-500">
          暂无疑问，开始解析后展示
        </div>
      </section>

      <section className="w-full rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/60 dark:bg-[#131729]">
        <div className="mb-3 flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 text-orange-500 dark:text-orange-400" />
          <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">风险提示</h3>
        </div>
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-500">
          暂无风险点，开始解析后展示
        </div>
      </section>

      <section className="w-full rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/60 dark:bg-[#131729]">
        <h3 className="mb-4 font-display text-sm font-semibold text-slate-900 dark:text-white">下一步操作</h3>
        <div className="grid gap-3">
          <Button className="h-9 w-full rounded-lg bg-[#39E079] text-sm font-semibold text-[#0a2010] hover:bg-[#32c96b]" type="button">
            生成测试点
          </Button>
          <Button className="h-9 w-full rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-none hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" type="button" variant="outline">
            查看解析报告
          </Button>
        </div>
      </section>
    </div>
  );
}


function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error(`无法读取文件：${file.name}`));
    reader.readAsText(file);
  });
}

function RequirementInputParsePage() {
  const draft = useMemo(() => loadDraftFromStorage(), []);
  const [rawText, setRawText] = useState(draft?.rawText ?? "");
  const [rules, setRules] = useState<CleanRequirementOptions>(defaultCleanRequirementOptions);
  const [files, setFiles] = useState<UploadedRequirementFile[]>([]);
  const [progress, setProgress] = useState(35);
  const [config, setConfig] = useState<RequirementConfig>({
    title: draft?.title ?? "",
    productLine: draft?.productLine ?? "",
    priority: draft?.priority ?? "P1",
    enableAiSummary: draft?.enableAiSummary ?? true,
    enableRiskScan: draft?.enableRiskScan ?? true,
    enableCaseSuggestion: draft?.enableCaseSuggestion ?? true,
  });

  const cleanedText = useMemo(() => cleanRequirementText(rawText, rules), [rawText, rules]);
  const characterCount = cleanedText.length;

  useEffect(() => {
    const nextProgress = Math.min(100, 35 + (files.length > 0 ? 15 : 0) + (rawText.trim() ? 25 : 0) + (cleanedText.trim() ? 25 : 0));
    setProgress(nextProgress);
  }, [cleanedText, files.length, rawText]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    selectedFiles.forEach((file) => {
      const fileType = getFileType(file.name);
      const baseFile: UploadedRequirementFile = {
        id: `${file.name}-${file.lastModified}-${file.size}`,
        name: file.name,
        size: file.size,
        type: fileType,
      };

      setFiles((currentFiles) => [...currentFiles, baseFile]);

      if (textFileTypes.has(fileType)) {
        readFileAsText(file)
          .then((content) => {
            setFiles((currentFiles) => currentFiles.map((item) => (item.id === baseFile.id ? { ...item, extractedText: content } : item)));
            setRawText((currentText) => [currentText, content].filter((item) => item.trim().length > 0).join("\n\n"));
          })
          .catch((error: unknown) => {
            console.warn("读取需求附件失败", error);
          });
      }
    });
  };

  const handleSaveDraft = () => {
    saveDraftToStorage({
      ...config,
      rawText,
      cleanedText,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleStartParse = () => {
    setProgress(100);
    handleSaveDraft();
  };

  return (
    <div className="min-h-full w-full min-w-0 bg-[#f6f7f9] font-body dark:bg-[#0c0f1a]">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-slate-800/60 dark:bg-[#131729]/80">
        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#39E079]/10 text-[#2ba85a] dark:bg-[#39E079]/15 dark:text-[#39E079]">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  需求输入与解析
                </h1>
                <Badge className="bg-[#39E079]/10 text-[#2ba85a] hover:bg-[#39E079]/15 dark:bg-[#39E079]/15 dark:text-[#39E079]">
                  AI 工作台
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                汇总需求文本与附件，完成清洗配置后启动解析
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="h-9 gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-none transition-all hover:bg-slate-50 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
              type="button"
              onClick={handleSaveDraft}
            >
              <Save className="h-4 w-4" />
              保存草稿
            </Button>
            <Button
              className="h-9 gap-2 rounded-lg bg-[#39E079] px-5 text-sm font-semibold text-[#0a2010] shadow-md shadow-[#39E079]/20 transition-all hover:bg-[#32c96b] hover:shadow-lg hover:shadow-[#39E079]/25 active:scale-[0.97]"
              type="button"
              onClick={handleStartParse}
            >
              <Play className="h-4 w-4" />
              开始解析
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="w-full min-w-0 p-6">
        <div className="grid w-full min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          {/* Left column */}
          <aside className="w-full space-y-4">
            <RequirementUploadPanel onFilesSelected={handleFilesSelected} />
            <UploadedFileList
              files={files}
              onRemove={(id) => setFiles((currentFiles) => currentFiles.filter((file) => file.id !== id))}
            />
            <CleanRulesPanel rules={rules} onChange={setRules} />
          </aside>

          {/* Main parse column */}
          <section className="min-w-0 space-y-4">
            <RequirementConfigForm config={config} onChange={setConfig} />
            <RequirementTextEditor value={rawText} onChange={setRawText} />
            <ParseProgressSteps progress={progress} />
            <RequirementContentCompare rawText={rawText} cleanedText={cleanedText} wordCount={characterCount} />
          </section>

          {/* Analysis column */}
          <aside className="w-full space-y-4 xl:col-span-2 2xl:col-span-1">
            <ParseAnalysisPanel characterCount={characterCount} />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default RequirementInputParsePage;
