
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, UserStatus } from '../types';
import { StorageService } from '../services/storageService';
import { ADMIN_EMAIL } from '../constants';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  allUsersList: User[]; // Expose the reactive list of all users
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  signup: (email: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => void;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy password hashing - In a real app, use bcrypt or similar on the backend
const pseudoHash = (password: string): string => `hashed_${password}`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allUsersList, setAllUsersList] = useState<User[]>([]);

  useEffect(() => {
    setIsLoading(true);

    let initialUsers = StorageService.getUsers();
    let adminUser = initialUsers.find(u => u.email === ADMIN_EMAIL);
    let usersModifiedInInit = false;

    if (!adminUser) {
      adminUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: ADMIN_EMAIL,
        passwordHash: pseudoHash('admin123'), // Default admin password
        status: UserStatus.Approved,
        isAdmin: true,
      };
      initialUsers.push(adminUser);
      usersModifiedInInit = true;
    } else {
      let adminNeedsUpdate = false;
      if (!adminUser.isAdmin) {
        adminUser.isAdmin = true;
        adminNeedsUpdate = true;
      }
      if (adminUser.status !== UserStatus.Approved) {
        adminUser.status = UserStatus.Approved;
        adminNeedsUpdate = true;
      }
      
      if (adminNeedsUpdate) {
        const adminIndex = initialUsers.findIndex(u => u.id === adminUser!.id);
        if (adminIndex > -1) initialUsers[adminIndex] = { ...adminUser }; // Ensure new object for state update
        usersModifiedInInit = true;
      }
    }

    if (usersModifiedInInit) {
      StorageService.saveUsers(initialUsers);
    }
    setAllUsersList([...initialUsers]); // Set the state with potentially modified list (new array)

    const storedUserEmail = StorageService.getCurrentUserEmail();
    if (storedUserEmail) {
      const user = initialUsers.find(u => u.email === storedUserEmail);
      if (user) {
        setCurrentUser(user);
        setIsAdmin(!!user.isAdmin);
      } else {
        StorageService.removeCurrentUserEmail(); // Clean up if stored email doesn't match any user
      }
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const login = async (email: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
    // Use allUsersList as the source of truth if already loaded, otherwise fetch. For login, fetching is safer.
    const users = StorageService.getUsers(); 
    const user = users.find(u => u.email === email);

    if (user && user.passwordHash === pseudoHash(passwordAttempt)) {
      setCurrentUser(user);
      setIsAdmin(!!user.isAdmin);
      StorageService.setCurrentUserEmail(user.email);
      setAllUsersList([...users]); // Refresh allUsersList in case it was stale
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const signup = async (email: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
    const currentUsers = [...allUsersList]; // Work with a copy of the current state
    if (currentUsers.find(u => u.email === email)) {
      setIsLoading(false);
      return false; // User already exists
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      passwordHash: pseudoHash(passwordAttempt),
      status: UserStatus.Pending,
      isAdmin: false,
    };
    const updatedUsers = [...currentUsers, newUser];
    StorageService.saveUsers(updatedUsers);
    setAllUsersList(updatedUsers); // Update context state
    
    setCurrentUser(newUser);
    setIsAdmin(false);
    StorageService.setCurrentUserEmail(newUser.email);

    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    StorageService.removeCurrentUserEmail();
    // Optionally, you might want to clear or refetch allUsersList if it contains sensitive info
    // or if a fresh list is needed on next login. For now, it persists.
  };

  const updateUserStatus = async (userId: string, status: UserStatus): Promise<void> => {
    const currentUsers = [...allUsersList]; // Work with a copy of the current state
    const userIndex = currentUsers.findIndex(u => u.id === userId);

    if (userIndex > -1) {
      const userToUpdate = { ...currentUsers[userIndex] }; // Clone user to modify
      userToUpdate.status = status;

      // If admin updates their own status to something other than approved, or if an admin's status is being changed
      // by another admin, ensure the status remains 'Approved'.
      // This primarily protects the main admin account.
      if (userToUpdate.isAdmin && userToUpdate.status !== UserStatus.Approved) {
         console.warn(`Admin user (${userToUpdate.email}) status cannot be changed from Approved. Reverting to Approved.`);
         userToUpdate.status = UserStatus.Approved; 
      }
      
      currentUsers[userIndex] = userToUpdate; // Update the user in the copied array
      StorageService.saveUsers(currentUsers);
      setAllUsersList(currentUsers); // Update context state

      // If the updated user is the current user, refresh their state.
      // userToUpdate now has the definitive, possibly corrected, status.
      if (currentUser && currentUser.id === userId) {
        setCurrentUser({ ...userToUpdate });
      }
    }
  };
  
  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, isLoading, allUsersList, login, signup, logout, updateUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
