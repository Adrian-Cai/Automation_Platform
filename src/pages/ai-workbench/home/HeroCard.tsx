import { Bot, CheckCircle2, Sparkles } from 'lucide-react';

export default function HeroCard(): JSX.Element {
  return (
    <section className="relative flex min-h-[170px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-gradient-to-r from-white via-[#F8FBFF] to-[#EAF3FF] px-8 py-7 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
      <div className="relative z-10 max-w-[620px]">
        <h1 className="text-[28px] font-bold leading-9 tracking-[-0.02em] text-[#111827]">AI 测试用例生成工作台</h1>
        <p className="mt-4 text-[15px] leading-7 text-[#6B7280]">
          通过 AI 技术，帮助高效上传需求、智能解析、生成测试点与测试用例，全面提升测试效率与质量。
        </p>
      </div>

      <div className="absolute right-8 top-1/2 hidden h-[138px] w-[300px] -translate-y-1/2 items-center justify-center xl:flex">
        <div className="absolute inset-0 rounded-[28px] bg-blue-100/60 blur-2xl" />
        <div className="relative h-[118px] w-[230px] rounded-3xl border border-white/70 bg-gradient-to-br from-[#DBEAFE]/80 to-white/75 p-5 shadow-[0_18px_40px_rgba(37,99,235,0.16)] backdrop-blur">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-2xl bg-white/70 shadow-sm" />
          <div className="absolute bottom-3 right-10 h-7 w-20 rounded-full bg-blue-200/60" />
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#2563EB] text-3xl font-extrabold text-white shadow-lg shadow-blue-300/50">
            AI
          </div>
          <div className="absolute left-[112px] top-8 space-y-2">
            <div className="flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#2563EB] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> 智能解析
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#14B8A6] shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" /> 覆盖检查
            </div>
          </div>
        </div>
        <Bot className="absolute right-8 top-4 h-6 w-6 text-blue-300" />
      </div>
    </section>
  );
}
