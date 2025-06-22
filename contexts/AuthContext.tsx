
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, UserStatus } from '../types';
import { StorageService } from '../services/storageService';
import { ADMIN_EMAIL } from '../constants';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  signup: (email: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => void;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
  getAllUsers: () => User[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy password hashing - In a real app, use bcrypt or similar on the backend
const pseudoHash = (password: string): string => `hashed_${password}`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initializeAdmin = useCallback(() => {
    const users = StorageService.getUsers();
    let adminUser = users.find(u => u.email === ADMIN_EMAIL);
    if (!adminUser) {
      adminUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: ADMIN_EMAIL,
        passwordHash: pseudoHash('admin123'), // Default admin password
        status: UserStatus.Approved,
        isAdmin: true,
      };
      users.push(adminUser);
      StorageService.saveUsers(users);
    } else if (!adminUser.isAdmin) {
      adminUser.isAdmin = true;
      adminUser.status = UserStatus.Approved; // Ensure admin is always approved
      StorageService.saveUsers(users);
    }
  }, []);
  
  useEffect(() => {
    initializeAdmin();
    const storedUserEmail = StorageService.getCurrentUserEmail();
    if (storedUserEmail) {
      const users = StorageService.getUsers();
      const user = users.find(u => u.email === storedUserEmail);
      if (user) {
        setCurrentUser(user);
        setIsAdmin(!!user.isAdmin);
      }
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const login = async (email: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
    const users = StorageService.getUsers();
    const user = users.find(u => u.email === email);

    if (user && user.passwordHash === pseudoHash(passwordAttempt)) {
      setCurrentUser(user);
      setIsAdmin(!!user.isAdmin);
      StorageService.setCurrentUserEmail(user.email);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const signup = async (email: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
    const users = StorageService.getUsers();
    if (users.find(u => u.email === email)) {
      setIsLoading(false);
      return false; // User already exists
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      passwordHash: pseudoHash(passwordAttempt),
      status: UserStatus.Pending,
      isAdmin: false, // New users are not admins
    };
    users.push(newUser);
    StorageService.saveUsers(users);
    
    // Automatically log in new user for better UX, they will be sent to pending page
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
  };

  const updateUserStatus = async (userId: string, status: UserStatus): Promise<void> => {
    const users = StorageService.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      users[userIndex].status = status;
      // If admin updates their own status to something other than approved, revert or handle carefully
      if (users[userIndex].isAdmin && status !== UserStatus.Approved) {
         console.warn("Admin status cannot be changed from Approved by this action.");
         users[userIndex].status = UserStatus.Approved; // Or prevent update
      }

      StorageService.saveUsers(users);
      // If the updated user is the current user, refresh their state
      if (currentUser && currentUser.id === userId) {
        setCurrentUser({ ...users[userIndex] });
      }
    }
  };
  
  const getAllUsers = (): User[] => {
    return StorageService.getUsers();
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, isLoading, login, signup, logout, updateUserStatus, getAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
};
    