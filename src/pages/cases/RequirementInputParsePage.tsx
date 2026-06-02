import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Play, Save, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const wordCount = cleanedText.length;

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
    <div className="min-h-screen bg-slate-50/80 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg shadow-blue-500/20 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge className="mb-3 bg-white/20 text-white hover:bg-white/20">AI 工作台</Badge>
            <h1 className="flex items-center gap-3 text-2xl font-bold md:text-3xl">
              <ClipboardList className="h-8 w-8" />
              需求输入与解析
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-blue-50">
              汇总附件与原始需求文本，完成规则清洗、内容对比和解析配置，为 AI 用例生成提供高质量输入。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-white text-blue-700 hover:bg-blue-50" type="button" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              保存草稿
            </Button>
            <Button className="bg-slate-950 text-white hover:bg-slate-800" type="button" onClick={handleStartParse}>
              <Play className="mr-2 h-4 w-4" />
              开始解析
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <div className="space-y-6">
            <RequirementUploadPanel onFilesSelected={handleFilesSelected} />
            <UploadedFileList files={files} onRemove={(id) => setFiles((currentFiles) => currentFiles.filter((file) => file.id !== id))} />
            <CleanRulesPanel rules={rules} onChange={setRules} />
          </div>

          <div className="space-y-6">
            <RequirementConfigForm config={config} onChange={setConfig} />
            <RequirementTextEditor value={rawText} onChange={setRawText} />
            <ParseProgressSteps progress={progress} />
            <Card className="border-blue-100 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/20">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-100">
                  <Sparkles className="h-4 w-4" />
                  清洗后共 {wordCount} 个字符，可继续调整规则或直接启动解析。
                </div>
                <Badge variant={wordCount > 0 ? "success" : "warning"}>{wordCount > 0 ? "输入就绪" : "等待输入"}</Badge>
              </CardContent>
            </Card>
            <RequirementContentCompare rawText={rawText} cleanedText={cleanedText} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequirementInputParsePage;
