
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { APP_NAME } from '../../constants';
import { Page } from '../../App'; // Import Page enum

interface NavbarProps {
  navigate: (page: Page) => void;
}

const Navbar: React.FC<NavbarProps> = ({ navigate }) => {
  const { currentUser, isAdmin, logout } = useAuth();

  if (!currentUser) return null;

  return (
    <nav className="bg-brand-surface shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span 
              className="orbitron font-bold text-xl text-brand-primary cursor-pointer"
              onClick={() => navigate(isAdmin ? Page.AdminDashboard : Page.WorkoutDashboard)}
            >
              {APP_NAME}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate(Page.AdminDashboard)}>Admin</Button>
            )}
             <Button variant="ghost" size="sm" onClick={() => navigate(Page.WorkoutDashboard)}>Dashboard</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(Page.WorkoutLog)}>Log Workout</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(Page.Analytics)}>Analytics</Button>
            <span className="text-brand-text-muted text-sm hidden sm:block">|</span>
            <span className="text-brand-text-muted text-sm hidden sm:block">{currentUser.email}</span>
            <Button variant="secondary" size="sm" onClick={logout}>Logout</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
    