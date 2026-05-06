import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  AnalyzePage,
  AnalysisDetailPage,
  InterviewPrepPage,
  HistoryPage,
  SettingsPage,
} from '@/pages';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/',
            element: <DashboardPage />,
          },
          {
            path: '/analyze',
            element: <AnalyzePage />,
          },
          {
            path: '/analyze/:analysisId',
            element: <AnalysisDetailPage />,
          },
          {
            path: '/analyze/:analysisId/preparation',
            element: <InterviewPrepPage />,
          },
          {
            path: '/history',
            element: <HistoryPage />,
          },
          {
            path: '/settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

