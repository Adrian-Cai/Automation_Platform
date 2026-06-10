import { describe, expect, it } from 'vitest';
import { cleanRequirementText, getFileType } from '@/pages/cases/requirementInputUtils';

describe('requirementInputUtils - cleanRequirementText', () => {
  it('保留用户显式关闭空格清洗时的行内空白', () => {
    const input = '  用户   可以\t创建　订单  ';

    const result = cleanRequirementText(input, {
      mergeBrokenLines: false,
      trimExtraSpaces: false,
    });

    expect(result).toBe(input);
  });

  it('清洗空行、多余空格和不可见字符', () => {
    const result = cleanRequirementText('  登录\u200B后   展示首页\n\n  支持　退出  ', {
      mergeBrokenLines: false,
    });

    expect(result).toBe('登录后 展示首页\n支持 退出');
  });

  it('合并异常换行但保留 Markdown 表格结构', () => {
    const markdownTable = '| 字段 | 说明 |\n| --- | --- |\n| name | 用户名称 |';
    const result = cleanRequirementText(`会员资料字段\n${markdownTable}\n字段需要支持编辑`);

    expect(result).toBe(`会员资料字段\n${markdownTable}\n字段需要支持编辑`);
  });
});

describe('requirementInputUtils - getFileType', () => {
  it('识别常用需求附件类型', () => {
    expect(getFileType('需求说明.markdown')).toBe('markdown');
    expect(getFileType('接口清单.CSV')).toBe('excel');
    expect(getFileType('补充说明.text')).toBe('text');
    expect(getFileType('压缩包.zip')).toBe('unknown');
  });
});
