import { describe, expect, it } from 'vitest';
import { buildUploadedFileContent, cleanRequirementText, defaultCleanRules, formatFileSize, getFileType } from '@/lib/requirementInput';

describe('cleanRequirementText', () => {
  it('removes empty lines and extra spaces while preserving heading levels', () => {
    const input = `1. 项目概述\n\n  本需求文档   描述会员中心。\n\n2.1 会员注册\n  - 用户可通过手机号、邮箱进行注册。`;

    expect(cleanRequirementText(input, defaultCleanRules)).toBe(
      `1. 项目概述\n本需求文档 描述会员中心。\n2.1 会员注册\n- 用户可通过手机号、邮箱进行注册。`
    );
  });

  it('removes invisible garbled characters without removing line breaks', () => {
    const input = '用户\u0000注册\n系统\u0007校验';

    expect(cleanRequirementText(input, defaultCleanRules)).toBe('用户注册，系统校验');
  });

  it('merges abnormal line breaks for split sentences', () => {
    const input = `用户点击领取后，\n系统需要判断库存。`;

    expect(cleanRequirementText(input, defaultCleanRules)).toBe('用户点击领取后，系统需要判断库存。');
  });

  it('preserves markdown table lines', () => {
    const input = `| 字段 | 说明 |\n| --- | --- |\n| mobile | 手机号 |`;

    expect(cleanRequirementText(input, defaultCleanRules)).toBe(input);
  });
});

describe('requirement input file utilities', () => {
  it('detects supported file types from extension', () => {
    expect(getFileType('需求.docx')).toBe('word');
    expect(getFileType('说明.pdf')).toBe('pdf');
    expect(getFileType('规则.md')).toBe('markdown');
    expect(getFileType('数据.xlsx')).toBe('excel');
    expect(getFileType('备注.txt')).toBe('txt');
    expect(getFileType('unknown.zip')).toBe('unknown');
  });

  it('formats file size for upload list', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
  });

  it('combines uploaded file contents instead of using simulated requirements', () => {
    expect(
      buildUploadedFileContent([
        {
          id: 'file-1',
          name: 'checkout.md',
          size: '1.0 KB',
          status: '等待解析',
          type: 'markdown',
          content: '用户可以提交订单。',
        },
        {
          id: 'file-2',
          name: 'empty.md',
          size: '0 B',
          status: '上传失败',
          type: 'markdown',
          content: '',
        },
      ])
    ).toBe('# checkout.md\n用户可以提交订单。');
  });
});
