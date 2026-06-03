import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect, Router as WouterRouter, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NavCollapseProvider } from "./contexts/NavCollapseContext";
import { AiGenerationProvider, useAiGeneration } from "./contexts/AiGenerationContext";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ComingSoon from "./pages/ComingSoon";
import Tasks from "./pages/tasks/Tasks";
import APICases from "./pages/cases/APICases";
import UICases from "./pages/cases/UICases";
import PerformanceCases from "./pages/cases/PerformanceCases";
import AiWorkbenchOverview from "./pages/ai-workbench/AiWorkbenchOverview";
import AiWorkbenchRequirementInput from "./pages/ai-workbench/AiWorkbenchRequirementInput";
import AiWorkbenchRequirementAnalysis from "./pages/ai-workbench/AiWorkbenchRequirementAnalysis";
import AiWorkbenchCaseGeneration from "./pages/ai-workbench/AiWorkbenchCaseGeneration";
import AiWorkbenchQualityCoverage from "./pages/ai-workbench/AiWorkbenchQualityCoverage";
import AiWorkbenchHistoryExport from "./pages/ai-workbench/AiWorkbenchHistoryExport";
import AiWorkbenchSettings from "./pages/ai-workbench/AiWorkbenchSettings";
import Reports from "./pages/reports/Reports";
import ReportDetail from "./pages/reports/ReportDetail";
import SystemSettings from "./pages/settings/SystemSettings";
import { User } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useEffect, useState, type ReactNode } from "react";

const AI_WORKBENCH_CASE_GENERATION_ROUTE = "/ai-workbench/case-generation";

function isAiWorkbenchCaseGenerationRoute(location: string): boolean {
  return (
    location === AI_WORKBENCH_CASE_GENERATION_ROUTE ||
    location.startsWith(`${AI_WORKBENCH_CASE_GENERATION_ROUTE}?`)
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function TasksPage() {
  return <Tasks />;
}

function ReportsPage() {
  return <Reports />;
}

function ReportDetailPage() {
  return <ReportDetail />;
}

function SettingsPage() {
  return <SystemSettings />;
}

function ProfilePage() {
  return (
    <ComingSoon
      title="个人资料"
      description="个人信息编辑、密码修改和偏好设置功能正在开发中"
      icon={<User className="h-10 w-10 text-blue-500" />}
    />
  );
}

function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

/**
 * AI case generation keep-alive layer:
 * - /ai-workbench/case-generation is rendered outside the Switch so route changes do not unmount AICases.
 * - While generation is running, navigating away hides this tree instead of aborting its stream controller.
 * - Hidden generation keeps the last AI workbench URL in a nested router so AICases does not
 *   re-read unrelated page query strings and switch docRef to the default workspace mid-stream.
 * - Direct visits still mount immediately and render as the active page.
 */
function KeepAliveAiWorkbenchCaseGeneration() {
  const [location, setLocation] = useLocation();
  const { isGenerating } = useAiGeneration();
  const isCurrentRoute = isAiWorkbenchCaseGenerationRoute(location);
  const [hasVisited, setHasVisited] = useState(() => isCurrentRoute);
  const [keptAliveLocation, setKeptAliveLocation] = useState(() =>
    isCurrentRoute ? location : AI_WORKBENCH_CASE_GENERATION_ROUTE
  );

  useEffect(() => {
    if (isCurrentRoute) {
      setHasVisited(true);
      setKeptAliveLocation(location);
    }
  }, [isCurrentRoute, location]);

  const useKeptAliveLocation = useCallback(() => [keptAliveLocation, setLocation] as const, [
    keptAliveLocation,
    setLocation,
  ]);

  if (!hasVisited && !isGenerating) {
    return null;
  }

  return (
    <div className={isCurrentRoute ? "fixed inset-0 z-10" : "hidden"}>
      <WouterRouter hook={useKeptAliveLocation}>
        <ProtectedLayout>
          <AiWorkbenchCaseGeneration />
        </ProtectedLayout>
      </WouterRouter>
    </div>
  );
}

function Router() {
  return (
    <>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />

        <Route path="/">
          <Landing />
        </Route>

        <Route path="/dashboard">
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        </Route>

        <Route path="/cases">
          <Redirect to="/cases/api" />
        </Route>
        <Route path="/cases/api">
          <ProtectedRoute>
            <Layout>
              <APICases />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/cases/ui">
          <ProtectedRoute>
            <Layout>
              <UICases />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/cases/performance">
          <ProtectedRoute>
            <Layout>
              <PerformanceCases />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/ai-workbench/index">
          <Redirect to="/ai-workbench/overview" />
        </Route>
        <Route path="/ai-workbench/home">
          <Redirect to="/ai-workbench/overview" />
        </Route>
        <Route path="/ai-workbench/records">
          <Redirect to="/ai-workbench/history-export" />
        </Route>
        <Route path="/ai-workbench/overview">
          <ProtectedLayout>
            <AiWorkbenchOverview />
          </ProtectedLayout>
        </Route>
        <Route path="/ai-workbench/requirement-input">
          <ProtectedLayout>
            <AiWorkbenchRequirementInput />
          </ProtectedLayout>
        </Route>
        <Route path="/ai-workbench/requirement-analysis">
          <ProtectedLayout>
            <AiWorkbenchRequirementAnalysis />
          </ProtectedLayout>
        </Route>
        {/* Rendered by KeepAliveAiWorkbenchCaseGeneration outside Switch to avoid aborting active streams. */}
        <Route path="/ai-workbench/case-generation">
          {null}
        </Route>
        <Route path="/ai-workbench/quality-coverage">
          <ProtectedLayout>
            <AiWorkbenchQualityCoverage />
          </ProtectedLayout>
        </Route>
        <Route path="/ai-workbench/history-export">
          <ProtectedLayout>
            <AiWorkbenchHistoryExport />
          </ProtectedLayout>
        </Route>
        <Route path="/ai-workbench/settings">
          <ProtectedLayout>
            <AiWorkbenchSettings />
          </ProtectedLayout>
        </Route>
        <Route path="/cases/ai-create">
          <Redirect to="/ai-workbench/overview" />
        </Route>
        <Route path="/cases/ai-history">
          <Redirect to="/ai-workbench/history-export" />
        </Route>
        <Route path="/cases/ai">
          <Redirect to="/ai-workbench/overview" />
        </Route>

        <Route path="/tasks">
          <ProtectedRoute>
            <Layout>
              <TasksPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/reports">
          <ProtectedRoute>
            <Layout>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/reports/:id">
          <ProtectedRoute>
            <Layout>
              <ReportDetailPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        </Route>

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>

      <KeepAliveAiWorkbenchCaseGeneration />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <NavCollapseProvider>
            <AuthProvider>
              <AiGenerationProvider>
                <TooltipProvider>
                  <Toaster />
                  <Router />
                </TooltipProvider>
              </AiGenerationProvider>
            </AuthProvider>
          </NavCollapseProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
