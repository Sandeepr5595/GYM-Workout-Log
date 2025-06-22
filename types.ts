
export enum UserStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export interface User {
  id: string;
  email: string;
  passwordHash: string; // In a real app, never store plain passwords
  status: UserStatus;
  isAdmin?: boolean;
}

export enum WorkoutType {
  Strength = 'Strength',
  Cardio = 'Cardio',
  Flexibility = 'Flexibility',
  Calisthenics = 'Calisthenics',
  CrossFit = 'CrossFit',
  Other = 'Other',
}

export interface WorkoutLog {
  id: string;
  userId: string;
  date: string; // ISO string
  workoutName: string;
  sets: number;
  reps: number; // Reps per set (average or total, clarify based on use)
  type: WorkoutType;
  notes?: string;
}

export interface ChartDataItem {
  name: string;
  value: number;
}
    