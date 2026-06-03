import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import CleanRulesPanel from '@/pages/cases/components/CleanRulesPanel';
import ParseProgressSteps from '@/pages/cases/components/ParseProgressSteps';
import RequirementConfigForm from '@/pages/cases/components/RequirementConfigForm';
import RequirementContentCompare from '@/pages/cases/components/RequirementContentCompare';
import RequirementTextEditor from '@/pages/cases/components/RequirementTextEditor';
import RequirementUploadPanel from '@/pages/cases/components/RequirementUploadPanel';
import UploadedFileList from '@/pages/cases/components/UploadedFileList';
import type { CleanRules, GenerateTarget, RequirementInputMode, RequirementInputState, RequirementType, UploadedFileItem } from '@/lib/requirementInput';
import {
  buildUploadedFileContent,
  cleanRequirementText,
  defaultCleanRules,
  initialRequirementInputState,
  loadDraftFromStorage,
  saveDraftToStorage,
} from '@/lib/requirementInput';

const parseStepDelayMs = 650;

function buildInitialState(): RequirementInputState {
  const draft = loadDraftFromStorage();

  if (!draft) {
    return initialRequirementInputState;
  }

  return {
    ...initialRequirementInputState,
    ...draft,
    uploadedFiles: initialRequirementInputState.uploadedFiles,
    rawContent: '',
    cleanedContent: '',
    parseStep: -1,
    parseStatus: 'idle',
  };
}

export default function RequirementInputParsePage(): JSX.Element {
  const [state, setState] = useState<RequirementInputState>(buildInitialState);
  const timersRef = useRef<number[]>([]);

  const canStartParse = useMemo(
    () => state.uploadedFiles.length > 0 || state.requirementText.trim().length > 0,
    [state.requirementText, state.uploadedFiles.length]
  );

  const clearTimers = useCallback((): void => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const updateState = useCallback((partialState: Partial<RequirementInputState>): void => {
    setState((current) => ({ ...current, ...partialState }));
  }, []);

  const handleFilesAdd = useCallback((files: UploadedFileItem[]): void => {
    if (files.length === 0) {
      toast.error('文件读取失败，请重新上传。');
      return;
    }

    setState((current) => ({ ...current, uploadedFiles: [...files, ...current.uploadedFiles] }));

    const failedCount = files.filter((file) => file.status === '上传失败').length;
    if (failedCount > 0) {
      toast.warning(`已添加 ${files.length} 个文件，其中 ${failedCount} 个文件读取失败`);
      return;
    }

    toast.success(`已添加 ${files.length} 个文件，等待解析`);
  }, []);

  const handleDeleteFile = useCallback((id: string): void => {
    setState((current) => ({ ...current, uploadedFiles: current.uploadedFiles.filter((file) => file.id !== id) }));
  }, []);

  const handlePreviewFile = useCallback((): void => {
    toast.info('文件预览功能暂未接入，后续支持在线预览。');
  }, []);

  const handleResetUpload = useCallback((): void => {
    clearTimers();
    setState((current) => ({
      ...current,
      uploadedFiles: [],
      rawContent: '',
      cleanedContent: '',
      parseStep: -1,
      parseStatus: 'idle',
    }));
    toast.success('已清空上传文件并重置解析进度');
  }, [clearTimers]);

  const handleSaveDraft = useCallback((): void => {
    try {
      saveDraftToStorage({
        projectName: state.projectName,
        requirementName: state.requirementName,
        requirementType: state.requirementType,
        generateTarget: state.generateTarget,
        inputMode: state.inputMode,
        requirementText: state.requirementText,
        cleanRules: state.cleanRules,
      });
      toast.success('草稿已保存');
    } catch {
      toast.error('草稿保存失败，请稍后重试');
    }
  }, [state.cleanRules, state.generateTarget, state.inputMode, state.projectName, state.requirementName, state.requirementText, state.requirementType]);

  const handleStartParse = useCallback((): void => {
    if (!canStartParse) {
      toast.error('请先上传需求文档或粘贴需求文本。');
      return;
    }

    const rawContent = state.requirementText.trim().length > 0 ? state.requirementText : buildUploadedFileContent(state.uploadedFiles);
    if (rawContent.trim().length === 0) {
      toast.error('未能读取到有效的上传文件内容，请重新上传或粘贴需求文本。');
      return;
    }

    clearTimers();
    setState((current) => ({
      ...current,
      rawContent,
      cleanedContent: '',
      parseStep: 0,
      parseStatus: 'parsing',
      uploadedFiles: current.uploadedFiles.map((file) => ({
        ...file,
        status: file.status === '上传失败' ? file.status : '上传成功',
      })),
    }));

    [1, 2, 3].forEach((step) => {
      const timer = window.setTimeout(() => {
        setState((current) => ({ ...current, parseStep: step }));
      }, parseStepDelayMs * step);
      timersRef.current.push(timer);
    });

    const finishTimer = window.setTimeout(() => {
      setState((current) => ({
        ...current,
        parseStep: 3,
        parseStatus: 'success',
        rawContent,
        cleanedContent: cleanRequirementText(rawContent, current.cleanRules),
      }));
      toast.success('需求内容解析与清洗完成');
    }, parseStepDelayMs * 4);
    timersRef.current.push(finishTimer);
  }, [canStartParse, clearTimers, state.requirementText, state.uploadedFiles]);

  return (
    <div className="min-h-full bg-slate-50 px-6 py-6 text-slate-900 lg:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 text-sm font-medium text-slate-500">页面 2 / 6 · 需求输入与解析</div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">需求输入与解析</h1>
            <p className="mt-2 text-sm text-slate-500">上传或粘贴需求文档，智能解析并清洗内容，生成结构化需求信息。</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" className="gap-2 border-slate-200 bg-white" onClick={handleResetUpload}>
              <RefreshCw className="h-4 w-4" />
              重新上传
            </Button>
            <Button type="button" variant="outline" className="gap-2 border-slate-200 bg-white" onClick={handleSaveDraft}>
              <Save className="h-4 w-4" />
              保存草稿
            </Button>
            <Button type="button" className="gap-2 bg-blue-600 shadow-sm shadow-blue-200 hover:bg-blue-700" onClick={handleStartParse} disabled={!canStartParse || state.parseStatus === 'parsing'}>
              <Play className="h-4 w-4" />
              开始解析
            </Button>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(560px,1.05fr)]">
          <div className="space-y-5">
            <RequirementUploadPanel
              inputMode={state.inputMode}
              onInputModeChange={(inputMode: RequirementInputMode) => updateState({ inputMode })}
              onFilesAdd={handleFilesAdd}
            />
            <RequirementTextEditor
              value={state.requirementText}
              onChange={(requirementText: string) => updateState({ requirementText })}
            />
          </div>

          <div className="space-y-5">
            <UploadedFileList files={state.uploadedFiles} onPreview={handlePreviewFile} onDelete={handleDeleteFile} />
            <RequirementConfigForm
              projectName={state.projectName}
              requirementName={state.requirementName}
              requirementType={state.requirementType}
              generateTarget={state.generateTarget}
              onProjectNameChange={(projectName: string) => updateState({ projectName })}
              onRequirementNameChange={(requirementName: string) => updateState({ requirementName })}
              onRequirementTypeChange={(requirementType: RequirementType) => updateState({ requirementType })}
              onGenerateTargetChange={(generateTarget: GenerateTarget) => updateState({ generateTarget })}
            />
            <CleanRulesPanel
              rules={state.cleanRules}
              onChange={(cleanRules: CleanRules) => updateState({ cleanRules })}
              onReset={() => updateState({ cleanRules: defaultCleanRules })}
            />
            <ParseProgressSteps parseStep={state.parseStep} parseStatus={state.parseStatus} />
          </div>
        </section>

        <RequirementContentCompare rawContent={state.rawContent} cleanedContent={state.cleanedContent} />
      </div>
    </div>
  );
}
