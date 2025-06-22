
import React from 'react';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import WorkoutDashboardPage from './pages/WorkoutDashboardPage';
import Navbar from './components/core/Navbar';
import WorkoutLogPage from './pages/WorkoutLogPage';
import AnalyticsPage from './pages/AnalyticsPage';

export enum Page {
  Auth = 'AUTH',
  PendingApproval = 'PENDING_APPROVAL',
  AdminDashboard = 'ADMIN_DASHBOARD',
  WorkoutDashboard = 'WORKOUT_DASHBOARD',
  WorkoutLog = 'WORKOUT_LOG',
  Analytics = 'ANALYTICS',
}

const App: React.FC = () => {
  const { currentUser, isAdmin, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = React.useState<Page>(Page.Auth);

  React.useEffect(() => {
    if (isLoading) return;

    if (!currentUser) {
      setCurrentPage(Page.Auth);
    } else if (isAdmin) {
      // Allow admin to navigate freely, default to admin dashboard
      if (currentPage === Page.Auth || currentPage === Page.PendingApproval) {
         setCurrentPage(Page.AdminDashboard);
      }
    } else if (currentUser.status === 'pending') {
      setCurrentPage(Page.PendingApproval);
    } else if (currentUser.status === 'approved') {
       if (currentPage === Page.Auth || currentPage === Page.PendingApproval || currentPage === Page.AdminDashboard) {
         setCurrentPage(Page.WorkoutDashboard);
       }
    } else { // rejected or other states
        setCurrentPage(Page.Auth); // Or a specific "access denied" page
    }
  }, [currentUser, isAdmin, isLoading, currentPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <p className="text-brand-primary text-xl">Loading GymTrack Pro...</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.Auth:
        return <AuthPage />;
      case Page.PendingApproval:
        return <PendingApprovalPage />;
      case Page.AdminDashboard:
        return <AdminDashboardPage />;
      case Page.WorkoutDashboard:
        return <WorkoutDashboardPage navigate={setCurrentPage} />;
      case Page.WorkoutLog:
        return <WorkoutLogPage navigate={setCurrentPage} />;
      case Page.Analytics:
        return <AnalyticsPage navigate={setCurrentPage}/>;
      default:
        return <AuthPage />;
    }
  };

  const showNavbar = currentUser && (currentUser.status === 'approved' || isAdmin);

  return (
    <div className="min-h-screen bg-brand-dark text-brand-text">
      {showNavbar && <Navbar navigate={setCurrentPage} />}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </main>
      <footer className="text-center p-4 text-brand-text-muted text-sm border-t border-brand-border mt-8">
        © {new Date().getFullYear()} GymTrack Pro. Lift Heavy, Live Healthy.
      </footer>
    </div>
  );
};

export default App;
    