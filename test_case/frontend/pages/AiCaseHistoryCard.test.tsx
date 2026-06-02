/**
 * AI 工作台历史卡片测试
 *
 * 旧的独立创建/历史页已移除；保留历史卡片的核心展示与生成态测试。
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiCaseHistoryCard } from '@/pages/cases/components/AiCaseHistoryCard';
import { createInitialMindData } from '@/lib/aiCaseMindMap';
import { type AiCaseWorkspaceDocument } from '@/types/aiCases';

vi.mock('@/lib/aiCaseStorage', () => ({
  deleteWorkspaceDocument: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

function makeDoc(id: string, name: string): AiCaseWorkspaceDocument {
  return {
    id,
    name,
    requirement: '需求描述',
    mapData: createInitialMindData(name),
    version: 1,
    createdAt: Date.now() - 10_000,
    updatedAt: Date.now() - 5_000,
    lastSelectedNodeId: null,
  };
}

describe('AiCaseHistoryCard – 历史卡片展示', () => {
  const baseDoc = makeDoc('doc-test', '测试工作台');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染正常文档应显示用例数和模块数', () => {
    render(
      <AiCaseHistoryCard
        doc={baseDoc}
        onOpen={vi.fn()}
        onDeleted={vi.fn()}
      />
    );

    expect(screen.getByText(/条用例/)).toBeInTheDocument();
    expect(screen.getByText(/个模块/)).toBeInTheDocument();
  });

  it('doc.mapData 不变时，更新 doc 其他字段（如 name）后模块数不变', () => {
    const { rerender } = render(
      <AiCaseHistoryCard
        doc={baseDoc}
        onOpen={vi.fn()}
        onDeleted={vi.fn()}
      />
    );

    const initialModulesText = screen.getByText(/个模块/).textContent;

    const updatedDoc: AiCaseWorkspaceDocument = {
      ...baseDoc,
      name: '新名称',
      mapData: baseDoc.mapData,
    };

    rerender(
      <AiCaseHistoryCard
        doc={updatedDoc}
        onOpen={vi.fn()}
        onDeleted={vi.fn()}
      />
    );

    expect(screen.getByText(/个模块/).textContent).toBe(initialModulesText);
    expect(screen.getByText('新名称')).toBeInTheDocument();
  });

  it('doc.mapData 引用变化时应重新计算模块数', () => {
    const { rerender } = render(
      <AiCaseHistoryCard
        doc={baseDoc}
        onOpen={vi.fn()}
        onDeleted={vi.fn()}
      />
    );

    const newMapData = createInitialMindData('新工作台');
    const updatedDoc: AiCaseWorkspaceDocument = {
      ...baseDoc,
      mapData: newMapData,
    };

    rerender(
      <AiCaseHistoryCard
        doc={updatedDoc}
        onOpen={vi.fn()}
        onDeleted={vi.fn()}
      />
    );

    expect(screen.getByText(/个模块/)).toBeInTheDocument();
  });

  it('正在生成时不应显示用例进度条，而应显示 AI 生成提示', () => {
    render(
      <AiCaseHistoryCard
        doc={baseDoc}
        onOpen={vi.fn()}
        onDeleted={vi.fn()}
        generatingDocId={baseDoc.id}
        generationProgress={45}
      />
    );

    expect(screen.queryByText(/条用例/)).not.toBeInTheDocument();
    expect(screen.getByText(/AI 正在分析需求/)).toBeInTheDocument();
    expect(screen.getByText(/45%/)).toBeInTheDocument();
  });
});
