
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, UserStatus } from '../types';
import { StorageService } from '../services/storageService';
import { ADMIN_EMAIL } from '../constants';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  allUsersList: User[];
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  signup: (email: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => void;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const pseudoHash = (password: string): string => `hashed_${password}`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allUsersList, setAllUsersList] = useState<User[]>([]);

  // Initial load and admin setup
  useEffect(() => {
    console.log('[AuthContext] Initializing AuthProvider...');
    setIsLoading(true);
    let initialUsers = StorageService.getUsers();
    console.log('[AuthContext] Initial users from storage:', initialUsers);
    let adminUser = initialUsers.find(u => u.email === ADMIN_EMAIL);
    let usersModifiedInInit = false;

    if (!adminUser) {
      console.log('[AuthContext] Admin user not found, creating one.');
      adminUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: ADMIN_EMAIL,
        passwordHash: pseudoHash('admin123'),
        status: UserStatus.Approved,
        isAdmin: true,
      };
      initialUsers.push(adminUser);
      usersModifiedInInit = true;
    } else {
      console.log('[AuthContext] Admin user found:', adminUser);
      let adminNeedsUpdate = false;
      if (adminUser.isAdmin !== true) { 
        console.log('[AuthContext] Updating admin user isAdmin flag to true.');
        adminUser.isAdmin = true;
        adminNeedsUpdate = true;
      }
      if (adminUser.status !== UserStatus.Approved) {
        console.log('[AuthContext] Updating admin user status to Approved.');
        adminUser.status = UserStatus.Approved;
        adminNeedsUpdate = true;
      }
      
      if (adminNeedsUpdate) {
        const adminIndex = initialUsers.findIndex(u => u.id === adminUser!.id);
        if (adminIndex > -1) initialUsers[adminIndex] = { ...adminUser };
        usersModifiedInInit = true;
        console.log('[AuthContext] Admin user was updated.');
      }
    }

    if (usersModifiedInInit) {
      console.log('[AuthContext] Saving modified initial users to storage.');
      StorageService.saveUsers(initialUsers);
    }
    setAllUsersList([...initialUsers]);
    console.log('[AuthContext] allUsersList state set with initial users.');

    const storedUserEmail = StorageService.getCurrentUserEmail();
    console.log('[AuthContext] Stored current user email:', storedUserEmail);
    if (storedUserEmail) {
      const user = initialUsers.find(u => u.email === storedUserEmail);
      if (user) {
        console.log('[AuthContext] Setting current user from stored email:', user);
        setCurrentUser(user);
        setIsAdmin(!!user.isAdmin);
      } else {
        console.warn('[AuthContext] Stored user email not found in initial users. Removing stored email.');
        StorageService.removeCurrentUserEmail();
      }
    }
    setIsLoading(false);
    console.log('[AuthContext] AuthProvider initialization complete.');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(() => {
    console.log('[AuthContext] logout called.');
    setCurrentUser(null);
    setIsAdmin(false);
    StorageService.removeCurrentUserEmail();
  }, []);

  // Storage event listener for cross-tab synchronization
  useEffect(() => {
    console.log('[AuthContext] Setting up storage event listener.');
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'gymtrack_users') {
        console.log('[AuthContext] Storage event detected for key: gymtrack_users.');
        // console.log('[AuthContext] Event oldValue:', event.oldValue);
        // console.log('[AuthContext] Event newValue:', event.newValue);

        let updatedUsersFromStorage: User[] = [];
        if (event.newValue) {
          try {
            updatedUsersFromStorage = JSON.parse(event.newValue);
            // console.log('[AuthContext] Parsed new users from storage event:', updatedUsersFromStorage);
          } catch (e) {
            console.error("[AuthContext] Error parsing users from storage event:", e);
            return; 
          }
        } else {
            console.log('[AuthContext] gymtrack_users was cleared or removed from storage in another tab.');
        }

        console.log('[AuthContext] Updating allUsersList state from storage event.');
        setAllUsersList(updatedUsersFromStorage);

        if (currentUser) {
          const currentLoggedInUserStillInList = updatedUsersFromStorage.find(u => u.id === currentUser.id);
          if (currentLoggedInUserStillInList) {
            if (currentLoggedInUserStillInList.status !== currentUser.status ||
                currentLoggedInUserStillInList.isAdmin !== currentUser.isAdmin) { // Simplified isAdmin check
              console.log('[AuthContext] Current user data (id:', currentUser.id, ') changed in storage. Updating currentUser state.');
              setCurrentUser({ ...currentLoggedInUserStillInList });
              setIsAdmin(!!currentLoggedInUserStillInList.isAdmin);
            } else {
              // console.log('[AuthContext] Current user (id:', currentUser.id, ') found in storage, no change to status/isAdmin.');
            }
          } else {
            console.warn('[AuthContext] Current user (id:', currentUser.id, ') not found in updated list from storage. Logging out.');
            logout();
          }
        } else {
            // console.log('[AuthContext] No current user in this tab. Checking if a stored session email matches new list from storage.');
            const storedUserEmail = StorageService.getCurrentUserEmail();
            if (storedUserEmail) {
                const potentialUser = updatedUsersFromStorage.find(u => u.email === storedUserEmail);
                if (potentialUser) {
                    console.log('[AuthContext] Restoring session for user (email:', storedUserEmail,') based on storage update.');
                    setCurrentUser(potentialUser);
                    setIsAdmin(!!potentialUser.isAdmin);
                }
            }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      console.log('[AuthContext] Removed storage event listener.');
    };
  }, [currentUser, logout]); // Removed allUsersList from dependencies

  const login = useCallback(async (email: string, passwordAttempt: string): Promise<boolean> => {
    console.log('[AuthContext] login attempt for email:', email);
    setIsLoading(true);
    const users = StorageService.getUsers(); 
    const user = users.find(u => u.email === email);

    if (user && user.passwordHash === pseudoHash(passwordAttempt)) {
      console.log('[AuthContext] Login successful for user:', user);
      setCurrentUser(user);
      setIsAdmin(!!user.isAdmin);
      StorageService.setCurrentUserEmail(user.email);
      setAllUsersList([...users]); 
      setIsLoading(false);
      return true;
    }
    console.warn('[AuthContext] Login failed for email:', email);
    setIsLoading(false);
    return false;
  }, []);

  const signup = useCallback(async (email: string, passwordAttempt: string): Promise<boolean> => {
    console.log('[AuthContext] signup attempt for email:', email);
    setIsLoading(true);
    const currentListOfUsers = [...allUsersList]; 
    if (currentListOfUsers.find(u => u.email === email)) {
      console.warn('[AuthContext] Signup failed: Email already exists -', email);
      setIsLoading(false);
      return false; 
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      passwordHash: pseudoHash(passwordAttempt),
      status: UserStatus.Pending,
      isAdmin: false,
    };
    console.log('[AuthContext] New user created:', newUser);
    const updatedUsers = [...currentListOfUsers, newUser];
    StorageService.saveUsers(updatedUsers);
    console.log('[AuthContext] Saved updated user list (with new user) to storage.');
    setAllUsersList(updatedUsers); 
    
    setCurrentUser(newUser);
    setIsAdmin(false);
    StorageService.setCurrentUserEmail(newUser.email);

    setIsLoading(false);
    console.log('[AuthContext] Signup successful for email:', email);
    return true;
  }, [allUsersList]);

  const updateUserStatus = useCallback(async (userId: string, status: UserStatus): Promise<void> => {
    console.log(`[AuthContext] updateUserStatus called for userId: ${userId}, new status: ${status}`);
    setAllUsersList(prevAllUsersList => {
      console.log('[AuthContext] updateUserStatus - prevAllUsersList:', prevAllUsersList.map(u => ({id: u.id, email: u.email, status: u.status})));
      const userIndex = prevAllUsersList.findIndex(u => u.id === userId);

      if (userIndex > -1) {
        const userToUpdate = { ...prevAllUsersList[userIndex] }; 
        console.log('[AuthContext] updateUserStatus - User found to update:', userToUpdate);
        userToUpdate.status = status;

        if (userToUpdate.isAdmin && userToUpdate.status !== UserStatus.Approved) {
           console.warn(`[AuthContext] Admin user (${userToUpdate.email}) status cannot be changed from Approved. Reverting to Approved.`);
           userToUpdate.status = UserStatus.Approved; 
        }
        
        const updatedList = [...prevAllUsersList];
        updatedList[userIndex] = userToUpdate;
        console.log('[AuthContext] updateUserStatus - Updated list (before saving):', updatedList.map(u => ({id: u.id, email: u.email, status: u.status})));
        StorageService.saveUsers(updatedList);
        console.log('[AuthContext] updateUserStatus - Saved updated list to storage.');

        if (currentUser && currentUser.id === userId) {
          console.log('[AuthContext] updateUserStatus - Current user (id:', currentUser.id,') was updated. Refreshing currentUser state.');
          setCurrentUser({ ...userToUpdate });
          setIsAdmin(!!userToUpdate.isAdmin);
        }
        return updatedList;
      }
      console.warn('[AuthContext] updateUserStatus - User ID not found in list:', userId);
      return prevAllUsersList;
    });
  }, [currentUser]);
  
  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, isLoading, allUsersList, login, signup, logout, updateUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
