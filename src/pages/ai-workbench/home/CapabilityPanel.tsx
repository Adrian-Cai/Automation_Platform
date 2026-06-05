import type { CapabilityItem } from '@/pages/ai-workbench/home/types';

interface CapabilityPanelProps {
  capabilities: CapabilityItem[];
}

export default function CapabilityPanel({ capabilities }: CapabilityPanelProps): JSX.Element {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
      <h2 className="mb-4 text-base font-bold text-[#111827]">系统能力</h2>
      <div className="grid grid-cols-2 gap-3">
        {capabilities.map((capability) => {
          const Icon = capability.icon;
          return (
            <article key={capability.title} className="flex min-h-[86px] items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 transition hover:border-blue-100 hover:shadow-sm">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${capability.iconWrapClassName}`}>
                <Icon className={`h-5 w-5 ${capability.iconClassName}`} />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-[#111827]">{capability.title}</h3>
                <p className="mt-1 truncate text-xs text-[#6B7280]">{capability.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
