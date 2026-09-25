import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './layouts/AppShell';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProblemsPage } from './pages/ProblemsPage';
import { NewProblemPage } from './pages/NewProblemPage';
import { ProblemDetailsPage } from './pages/ProblemDetailsPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { NewWorkflowPage } from './pages/NewWorkflowPage';
import { WorkflowDetailsPage } from './pages/WorkflowDetailsPage';
import { WorkflowBuilderPage } from './pages/WorkflowBuilderPage';
import { ExecutionsPage } from './pages/ExecutionsPage';
import { ExecutionDetailsPage } from './pages/ExecutionDetailsPage';
import { TasksPage } from './pages/TasksPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ReportDetailsPage } from './pages/ReportDetailsPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary-400 text-xs font-semibold">
        Initializing FlowPilot Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected App Workspace Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/new" element={<NewProblemPage />} />
            <Route path="/problems/:id" element={<ProblemDetailsPage />} />

            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/workflows/new" element={<NewWorkflowPage />} />
            <Route path="/workflows/:id" element={<WorkflowDetailsPage />} />
            <Route path="/workflows/:id/builder" element={<WorkflowBuilderPage />} />

            <Route path="/executions" element={<ExecutionsPage />} />
            <Route path="/executions/:id" element={<ExecutionDetailsPage />} />

            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/:id" element={<TasksPage />} />

            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/notifications" element={<ApprovalsPage />} />

            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:id" element={<ReportDetailsPage />} />

            <Route path="/organization" element={<OrganizationPage />} />
            <Route path="/organization/members" element={<OrganizationPage />} />

            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
