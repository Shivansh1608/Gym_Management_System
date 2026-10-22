import React, { useState, lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LandingPage } from './components/LandingPage';

// Code-split dashboards with React.lazy
const MemberDashboard = lazy(() => import('./components/member/MemberDashboard'));
const TrainerDashboard = lazy(() => import('./components/trainer/TrainerDashboard'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Initializing Workspace...
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  if (user) {
    return (
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        {user.role === 'member' && <MemberDashboard onLogout={logout} />}
        {user.role === 'admin' && <AdminDashboard onLogout={logout} />}
        {user.role === 'trainer' && <TrainerDashboard onLogout={logout} />}
      </Suspense>
    );
  }

  return (
    <LandingPage
      onRoleSelect={() => setShowLogin(true)}
      showLogin={showLogin}
      onCloseLogin={() => setShowLogin(false)}
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <AppContent />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
