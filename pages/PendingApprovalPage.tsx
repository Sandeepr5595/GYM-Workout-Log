
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

const PendingApprovalPage: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
      <svg className="w-20 h-20 text-brand-secondary mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <h1 className="text-3xl font-bold text-brand-text mb-4">Account Pending Approval</h1>
      <p className="text-lg text-brand-text-muted mb-2">
        Thank you for signing up, {currentUser?.email}!
      </p>
      <p className="text-brand-text-muted mb-8 max-w-md">
        Your account is currently awaiting approval from an administrator. 
        You will be notified once your account is activated. Please check back later.
      </p>
      <Button onClick={logout} variant="secondary">
        Logout
      </Button>
    </div>
  );
};

export default PendingApprovalPage;
    