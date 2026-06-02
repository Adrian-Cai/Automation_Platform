import { describe, expect, it } from "vitest";
import { cleanRequirementText } from "@/pages/cases/requirementInputUtils";

describe("cleanRequirementText", () => {
  it("删除空行", () => {
    const result = cleanRequirementText("需求 A\n\n\n需求 B", { mergeBrokenLines: false });

    expect(result).toBe("需求 A\n需求 B");
  });

  it("删除多余空格", () => {
    const result = cleanRequirementText("  用户   可以\t创建　订单  ", { mergeBrokenLines: false });

    expect(result).toBe("用户 可以 创建 订单");
  });

  it("删除不可见字符", () => {
    const result = cleanRequirementText("登录\u200B后\uFEFF展示首页", { mergeBrokenLines: false });

    expect(result).toBe("登录后展示首页");
  });

  it("合并异常换行", () => {
    const result = cleanRequirementText("用户提交订单后\n系统需要校验库存\n并返回支付链接");

    expect(result).toBe("用户提交订单后 系统需要校验库存 并返回支付链接");
  });

  it("保留 Markdown 表格", () => {
    const markdownTable = "| 字段 | 说明 |\n| --- | --- |\n| name | 用户名称 |";
    const result = cleanRequirementText(`会员资料字段\n${markdownTable}\n字段需要支持编辑`);

    expect(result).toBe(`会员资料字段\n${markdownTable}\n字段需要支持编辑`);
  });
});
