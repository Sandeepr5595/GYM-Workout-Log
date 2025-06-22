
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { StorageService } from '../services/storageService';
import { WorkoutLog, WorkoutType } from '../types';
import Button from '../components/ui/Button';
import { Page } from '../App';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BRAND_COLORS, WORKOUT_TYPES_ARRAY } from '../constants';

interface WorkoutDashboardPageProps {
  navigate: (page: Page) => void;
}

const COLORS = [BRAND_COLORS.primary, BRAND_COLORS.secondary, '#FFBB28', '#FF8042', '#00C49F', '#8884d8'];

const WorkoutDashboardPage: React.FC<WorkoutDashboardPageProps> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [workoutStats, setWorkoutStats] = useState<{ type: WorkoutType; count: number }[]>([]);

  const fetchDashboardData = useCallback(() => {
    if (currentUser) {
      const workouts = StorageService.getWorkouts(currentUser.id);
      // Sort by date descending and take last 5
      const sortedRecent = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
      setRecentWorkouts(sortedRecent);

      const stats: { [key in WorkoutType]?: number } = {};
      workouts.forEach(w => {
        stats[w.type] = (stats[w.type] || 0) + 1;
      });
      const chartData = WORKOUT_TYPES_ARRAY.map(type => ({
        type: type,
        count: stats[type] || 0,
      })).filter(item => item.count > 0);
      setWorkoutStats(chartData);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  if (!currentUser) return null;

  const totalWorkouts = StorageService.getWorkouts(currentUser.id).length;


  return (
    <div className="space-y-8">
      <header className="bg-brand-surface p-6 rounded-lg shadow-xl text-center sm:text-left">
        <h1 className="text-4xl font-bold orbitron text-brand-primary">Welcome Back, {currentUser.email.split('@')[0]}!</h1>
        <p className="text-xl text-brand-text-muted mt-2">Ready to crush your goals today?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-surface p-6 rounded-lg shadow-lg col-span-1 md:col-span-1 flex flex-col items-center justify-center">
          <p className="text-6xl font-bold text-brand-secondary orbitron">{totalWorkouts}</p>
          <p className="text-lg text-brand-text-muted mt-2">Total Workouts Logged</p>
        </div>
        <div className="bg-brand-surface p-6 rounded-lg shadow-lg col-span-1 md:col-span-2">
           <h2 className="text-2xl font-semibold text-brand-text mb-4">Workout Type Distribution</h2>
           {workoutStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workoutStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="type"
                >
                  {workoutStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: BRAND_COLORS.surface, border: `1px solid ${BRAND_COLORS.primary}`, borderRadius: '0.5rem' }}
                    itemStyle={{ color: BRAND_COLORS.text }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
           ) : (
            <p className="text-brand-text-muted text-center py-10">Log some workouts to see your distribution!</p>
           )}
        </div>
      </div>

      <div className="bg-brand-surface p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-brand-text mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="primary" size="lg" onClick={() => navigate(Page.WorkoutLog)}>
            Log New Workout
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate(Page.Analytics)}>
            View Progress Analytics
          </Button>
        </div>
      </div>

      <div className="bg-brand-surface p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-brand-text mb-4">Recent Activity</h2>
        {recentWorkouts.length > 0 ? (
          <ul className="space-y-3">
            {recentWorkouts.map(workout => (
              <li key={workout.id} className="p-3 bg-gray-700 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold text-brand-text">{workout.workoutName} <span className="text-xs text-brand-secondary">({workout.type})</span></p>
                  <p className="text-sm text-brand-text-muted">{new Date(workout.date).toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-brand-text-muted">{workout.sets} sets, {workout.reps} reps</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-brand-text-muted">No recent workouts. Time to hit the gym!</p>
        )}
      </div>
       <div className="mt-8 p-6 bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 rounded-lg shadow-lg text-center">
          <p className="orbitron text-2xl font-bold text-white">"The only bad workout is the one that didn't happen."</p>
       </div>
    </div>
  );
};

export default WorkoutDashboardPage;
    