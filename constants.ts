import { WorkoutType } from './types';

export const APP_NAME = "GymTrack Pro";
export const ADMIN_EMAIL = "admin@gymtrack.com"; // Default admin

export const WORKOUT_NAMES: { [key in WorkoutType]: string[] } = {
  [WorkoutType.Strength]: [
    "Bench Press",
    "Squat",
    "Deadlift",
    "Overhead Press",
    "Bent Over Row",
    "Pull-ups",
    "Dips",
    "Bicep Curls",
    "Tricep Extensions",
    "Leg Press",
    "Leg Curls",
    "Calf Raises",
  ],
  [WorkoutType.Cardio]: [
    "Running (Treadmill)",
    "Cycling (Stationary)",
    "Elliptical Trainer",
    "Rowing Machine",
    "Stair Climber",
    "Jumping Jacks",
    "Burpees",
  ],
  [WorkoutType.Flexibility]: [
    "Full Body Stretch",
    "Yoga Flow",
    "Dynamic Warm-up",
    "Static Cool-down",
  ],
  [WorkoutType.Calisthenics]: [
    "Push-ups",
    "Air Squats",
    "Lunges",
    "Plank",
    "Handstand Practice",
    "Muscle-ups (assisted)",
  ],
  [WorkoutType.CrossFit]: [
    "WOD (Workout of the Day)",
    "AMRAP",
    "EMOM",
  ],
  [WorkoutType.Other]: ["Custom Workout"],
};

export const SETS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const REPS_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 50];

export const WORKOUT_TYPES_ARRAY = Object.values(WorkoutType);

export const BRAND_COLORS = {
  primary: '#e53e3e', // Red
  secondary: '#38b2ac', // Teal
  dark: '#1a202c',
  surface: '#2d3748',
  text: '#f7fafc',
  textMuted: '#a0aec0', // Added: Tailwind's coolGray.400, good for muted text on dark bg
  border: '#4a5568',    // Added: Tailwind's coolGray.600, good for borders on dark bg
};