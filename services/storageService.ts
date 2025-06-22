
import { User, WorkoutLog } from '../types';

const USERS_KEY = 'gymtrack_users';
const WORKOUTS_KEY = 'gymtrack_workouts';
const CURRENT_USER_EMAIL_KEY = 'gymtrack_currentUserEmail';

export class StorageService {
  // User Management
  static getUsers(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  static getCurrentUserEmail(): string | null {
    return localStorage.getItem(CURRENT_USER_EMAIL_KEY);
  }

  static setCurrentUserEmail(email: string): void {
    localStorage.setItem(CURRENT_USER_EMAIL_KEY, email);
  }

  static removeCurrentUserEmail(): void {
    localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
  }

  // Workout Management
  static getWorkouts(userId: string): WorkoutLog[] {
    const workoutsJson = localStorage.getItem(WORKOUTS_KEY);
    if (!workoutsJson) return [];
    const allWorkouts: WorkoutLog[] = JSON.parse(workoutsJson);
    return allWorkouts.filter(workout => workout.userId === userId);
  }
  
  static getAllWorkouts(): WorkoutLog[] {
    const workoutsJson = localStorage.getItem(WORKOUTS_KEY);
    return workoutsJson ? JSON.parse(workoutsJson) : [];
  }

  static saveWorkout(workout: WorkoutLog): void {
    const allWorkouts = this.getAllWorkouts();
    allWorkouts.push(workout);
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(allWorkouts));
  }

  static updateWorkout(updatedWorkout: WorkoutLog): void {
    let allWorkouts = this.getAllWorkouts();
    allWorkouts = allWorkouts.map(w => w.id === updatedWorkout.id ? updatedWorkout : w);
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(allWorkouts));
  }

  static deleteWorkout(workoutId: string): void {
    console.log('[StorageService] deleteWorkout called for ID:', workoutId);
    let allWorkouts = this.getAllWorkouts();
    console.log('[StorageService] Workouts before deletion:', JSON.stringify(allWorkouts.map(w => w.id)));
    
    const initialCount = allWorkouts.length;
    allWorkouts = allWorkouts.filter(w => {
      // console.log(`[StorageService] Comparing w.id: ${w.id} (type: ${typeof w.id}) with workoutId: ${workoutId} (type: ${typeof workoutId}). Match: ${w.id === workoutId}`);
      return w.id !== workoutId;
    });
    const finalCount = allWorkouts.length;

    console.log(`[StorageService] Workouts after filtering (initial: ${initialCount}, final: ${finalCount}):`, JSON.stringify(allWorkouts.map(w => w.id)));
    
    if (initialCount === finalCount) {
        console.warn(`[StorageService] Workout with ID ${workoutId} not found for deletion or filter failed.`);
    }

    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(allWorkouts));
    console.log('[StorageService] Workouts saved to localStorage. New raw value:', localStorage.getItem(WORKOUTS_KEY));
  }
}
