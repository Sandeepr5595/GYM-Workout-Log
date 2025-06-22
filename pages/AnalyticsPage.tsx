import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { StorageService } from '../services/storageService';
import { WorkoutLog, WorkoutType, ChartDataItem } from '../types';
import { Page } from '../App';
import Button from '../components/ui/Button';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BRAND_COLORS, WORKOUT_TYPES_ARRAY } from '../constants';

interface AnalyticsPageProps {
  navigate: (page: Page) => void;
}

const COLORS = [BRAND_COLORS.primary, BRAND_COLORS.secondary, '#FFBB28', '#FF8042', '#00C49F', '#8884d8', '#82ca9d'];

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  
  const [workoutTypeData, setWorkoutTypeData] = useState<ChartDataItem[]>([]);
  const [weeklyVolumeData, setWeeklyVolumeData] = useState<ChartDataItem[]>([]);
  const [monthlyFrequencyData, setMonthlyFrequencyData] = useState<ChartDataItem[]>([]);

  const processData = useCallback(() => {
    if (!currentUser) return;
    const userWorkouts = StorageService.getWorkouts(currentUser.id);
    setWorkouts(userWorkouts);

    // 1. Pie Chart: Distribution of exercise types
    const typeCounts: { [key in WorkoutType]?: number } = {};
    userWorkouts.forEach(w => {
      typeCounts[w.type] = (typeCounts[w.type] || 0) + 1;
    });
    setWorkoutTypeData(
      WORKOUT_TYPES_ARRAY.map(type => ({ name: type, value: typeCounts[type] || 0 })).filter(item => item.value > 0)
    );

    // 2. Bar Chart: Weekly volume (sets x reps)
    // Aggregate by week for the last N weeks
    const weeklyVolume: { [week: string]: number } = {};
    const now = new Date();
    const weeksToDisplay = 8; // Display last 8 weeks
    userWorkouts.forEach(w => {
      const date = new Date(w.date);
      // Check if workout is within the last N weeks
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= weeksToDisplay * 7) {
        const year = date.getFullYear();
        const weekNumber = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7);
        const weekKey = `W${weekNumber} ${year}`;
        weeklyVolume[weekKey] = (weeklyVolume[weekKey] || 0) + (w.sets * w.reps);
      }
    });
     setWeeklyVolumeData(
        Object.entries(weeklyVolume)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => { // Basic sort for week keys like "W30 2024"
            const [aWeek, aYear] = a.name.substring(1).split(" ");
            const [bWeek, bYear] = b.name.substring(1).split(" ");
            if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
            return parseInt(aWeek) - parseInt(bWeek);
        })
        .slice(-weeksToDisplay) // Take the most recent N weeks
    );


    // 3. Line Chart: Monthly frequency (number of workouts)
    const monthlyFrequency: { [month: string]: number } = {};
    userWorkouts.forEach(w => {
      const date = new Date(w.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      monthlyFrequency[monthKey] = (monthlyFrequency[monthKey] || 0) + 1;
    });
    setMonthlyFrequencyData(
      Object.entries(monthlyFrequency)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.name.localeCompare(b.name)) // Sort by YYYY-MM
    );

  }, [currentUser]);

  useEffect(() => {
    processData();
  }, [processData]); 

  if (!currentUser) return <p>Loading data...</p>;
  if (workouts.length === 0 && currentUser) { 
    return (
        <div className="text-center py-10">
            <h1 className="text-3xl font-bold orbitron text-brand-primary mb-4">Workout Analytics</h1>
            <p className="text-brand-text-muted mb-6">No workouts logged yet. Start logging to see your progress!</p>
            <Button onClick={() => navigate(Page.WorkoutLog)} variant="primary">Log First Workout</Button>
        </div>
    );
  }

  const chartTooltipStyle = { 
    backgroundColor: BRAND_COLORS.surface, 
    border: `1px solid ${BRAND_COLORS.primary}`, 
    borderRadius: '0.5rem',
    color: BRAND_COLORS.text
  };
  const chartAxisTickStyle = { fill: BRAND_COLORS.textMuted, fontSize: '0.75rem' };


  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold orbitron text-brand-primary">Your Progress Analytics</h1>
        <Button onClick={() => navigate(Page.WorkoutDashboard)} variant="ghost">Back to Dashboard</Button>
      </div>

      {/* Workout Type Distribution - Pie Chart */}
      <section className="bg-brand-surface p-6 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-semibold text-brand-text mb-6">Workout Type Distribution</h2>
        {workoutTypeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={workoutTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill={BRAND_COLORS.primary}
                dataKey="value"
              >
                {workoutTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{color: BRAND_COLORS.text}}/>
            </PieChart>
          </ResponsiveContainer>
        ) : <p className="text-brand-text-muted">Not enough data for workout type distribution.</p>}
      </section>

      {/* Weekly Volume - Bar Chart */}
      <section className="bg-brand-surface p-6 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-semibold text-brand-text mb-6">Weekly Workout Volume (Sets x Reps)</h2>
        {weeklyVolumeData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={weeklyVolumeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={BRAND_COLORS.border} />
            <XAxis dataKey="name" tick={chartAxisTickStyle} />
            <YAxis tick={chartAxisTickStyle} />
            <Tooltip contentStyle={chartTooltipStyle} cursor={{fill: 'rgba(229, 62, 62, 0.2)'}}/>
            <Legend wrapperStyle={{color: BRAND_COLORS.text}}/>
            <Bar dataKey="value" name="Total Volume" fill={BRAND_COLORS.secondary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        ) : <p className="text-brand-text-muted">Not enough data for weekly volume.</p>}
      </section>

      {/* Monthly Frequency - Line Chart */}
      <section className="bg-brand-surface p-6 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-semibold text-brand-text mb-6">Monthly Workout Frequency</h2>
        {monthlyFrequencyData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyFrequencyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={BRAND_COLORS.border} />
            <XAxis dataKey="name" tick={chartAxisTickStyle} />
            <YAxis tick={chartAxisTickStyle} allowDecimals={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Legend wrapperStyle={{color: BRAND_COLORS.text}}/>
            <Line type="monotone" dataKey="value" name="Workouts" stroke={BRAND_COLORS.primary} strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
        ) : <p className="text-brand-text-muted">Not enough data for monthly frequency.</p>}
      </section>
    </div>
  );
};

export default AnalyticsPage;