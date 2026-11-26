import { Layout } from './components/Layout';
import { AppStateProvider } from './hooks/useAppState';
import { CloudSyncProvider } from './hooks/useCloudSync';
import { useHashRoute, type Route } from './hooks/useHashRoute';
import { CheckpointPage } from './features/checkpoints/CheckpointPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ExamPage } from './features/exams/ExamPage';
import { ExamsPage } from './features/exams/ExamsPage';
import { LessonPage } from './features/lessons/LessonPage';
import { PlannerPage } from './features/planner/PlannerPage';
import { ProgressPage } from './features/progress/ProgressPage';
import { ResourcesPage } from './features/resources/ResourcesPage';
import { PhaseDetailPage } from './features/roadmap/PhaseDetailPage';
import { RoadmapPage } from './features/roadmap/RoadmapPage';
import { SettingsPage } from './features/settings/SettingsPage';

function Page({ route }: { route: Route }) {
  switch (route.name) {
    case 'dashboard':
      return <DashboardPage />;
    case 'roadmap':
      return route.phaseId ? <PhaseDetailPage phaseId={route.phaseId} /> : <RoadmapPage />;
    case 'lesson':
      return <LessonPage lessonId={route.lessonId} />;
    case 'checkpoint':
      return <CheckpointPage key={route.phaseId} phaseId={route.phaseId} />;
    case 'exams':
      return <ExamsPage />;
    case 'exam':
      return <ExamPage key={route.phaseId} phaseId={route.phaseId} />;
    case 'resources':
      return <ResourcesPage />;
    case 'planner':
      return <PlannerPage />;
    case 'progress':
      return <ProgressPage />;
    case 'settings':
      return <SettingsPage />;
  }
}

export default function App() {
  const route = useHashRoute();
  return (
    <AppStateProvider>
      <CloudSyncProvider>
        <Layout route={route}>
          <Page route={route} />
        </Layout>
      </CloudSyncProvider>
    </AppStateProvider>
  );
}
