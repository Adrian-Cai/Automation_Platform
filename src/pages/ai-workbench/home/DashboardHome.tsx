import CapabilityPanel from '@/pages/ai-workbench/home/CapabilityPanel';
import CoverageOverviewCard from '@/pages/ai-workbench/home/CoverageOverviewCard';
import HeroCard from '@/pages/ai-workbench/home/HeroCard';
import QuickStartSteps from '@/pages/ai-workbench/home/QuickStartSteps';
import RecentProjectsTable from '@/pages/ai-workbench/home/RecentProjectsTable';
import StatCard from '@/pages/ai-workbench/home/StatCard';
import { capabilities, quickStartSteps, recentProjects, stats } from '@/pages/ai-workbench/home/mock';

export default function DashboardHome(): JSX.Element {
  return (
    <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_390px] gap-6 bg-[#F8FAFC] p-6">
      <div className="min-w-0 space-y-5">
        <HeroCard />
        <section className="grid grid-cols-4 gap-4">
          {stats.map((item) => (
            <StatCard key={item.title} item={item} />
          ))}
        </section>
        <QuickStartSteps steps={quickStartSteps} />
        <RecentProjectsTable projects={recentProjects} />
      </div>

      <aside className="space-y-6">
        <CapabilityPanel capabilities={capabilities} />
        <CoverageOverviewCard />
      </aside>
    </div>
  );
}
