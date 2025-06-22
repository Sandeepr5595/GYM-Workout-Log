
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, UserStatus } from '../types';
import Button from '../components/ui/Button';

const UserApprovalCard: React.FC<{ user: User; onUpdateStatus: (userId: string, status: UserStatus) => void }> = ({ user, onUpdateStatus }) => {
  return (
    <div className="bg-brand-surface p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
      <div>
        <p className="text-lg font-semibold text-brand-text">{user.email}</p>
        <p className="text-sm text-brand-text-muted">Status: <span className={`font-medium ${user.status === UserStatus.Pending ? 'text-yellow-400' : user.status === UserStatus.Approved ? 'text-green-400' : 'text-red-400'}`}>{user.status}</span></p>
      </div>
      {user.status === UserStatus.Pending && (
        <div className="flex space-x-2">
          <Button size="sm" variant="primary" onClick={() => onUpdateStatus(user.id, UserStatus.Approved)}>Approve</Button>
          <Button size="sm" variant="danger" onClick={() => onUpdateStatus(user.id, UserStatus.Rejected)}>Reject</Button>
        </div>
      )}
       {user.status === UserStatus.Rejected && !user.isAdmin && (
         <Button size="sm" variant="secondary" onClick={() => onUpdateStatus(user.id, UserStatus.Pending)}>Re-evaluate (Set to Pending)</Button>
       )}
    </div>
  );
};


const AdminDashboardPage: React.FC = () => {
  const { allUsersList, updateUserStatus, currentUser } = useAuth();
  const [filter, setFilter] = useState<UserStatus | 'all'>(UserStatus.Pending);

  const usersToDisplay = useMemo(() => {
    if (!allUsersList || !currentUser) return [];
    // Ensure admin cannot accidentally modify their own status through this interface by filtering them out
    return allUsersList.filter(u => u.id !== currentUser.id);
  }, [allUsersList, currentUser]);

  const filteredUsers = useMemo(() => {
    return usersToDisplay.filter(user => {
      if (filter === 'all') return true;
      return user.status === filter;
    });
  }, [usersToDisplay, filter]);

  const handleUpdateStatus = async (userId: string, status: UserStatus) => {
    await updateUserStatus(userId, status);
    // The list will automatically update due to allUsersList changing in context
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold orbitron text-brand-primary">Admin Dashboard</h1>
      
      <div className="bg-brand-surface p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-brand-text mb-4">User Management</h2>
        <div className="mb-4 flex space-x-2">
            <Button variant={filter === UserStatus.Pending ? 'primary' : 'ghost'} onClick={() => setFilter(UserStatus.Pending)}>Pending</Button>
            <Button variant={filter === UserStatus.Approved ? 'primary' : 'ghost'} onClick={() => setFilter(UserStatus.Approved)}>Approved</Button>
            <Button variant={filter === UserStatus.Rejected ? 'primary' : 'ghost'} onClick={() => setFilter(UserStatus.Rejected)}>Rejected</Button>
            <Button variant={filter === 'all' ? 'primary' : 'ghost'} onClick={() => setFilter('all')}>All Users</Button>
        </div>
        {filteredUsers.length === 0 ? (
          <p className="text-brand-text-muted">No users found for this filter.</p>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map(user => (
              <UserApprovalCard key={user.id} user={user} onUpdateStatus={handleUpdateStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
