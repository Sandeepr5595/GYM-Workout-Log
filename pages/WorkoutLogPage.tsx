
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { StorageService } from '../services/storageService';
import { WorkoutLog, WorkoutType } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { WORKOUT_TYPES_ARRAY, WORKOUT_NAMES, SETS_OPTIONS, REPS_OPTIONS } from '../constants';
import { Page } from '../App';

interface WorkoutLogPageProps {
  navigate: (page: Page) => void;
}

const WorkoutLogPage: React.FC<WorkoutLogPageProps> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [workoutType, setWorkoutType] = useState<WorkoutType>(WorkoutType.Strength);
  const [workoutName, setWorkoutName] = useState('');
  const [availableWorkoutNames, setAvailableWorkoutNames] = useState<string[]>([]);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [userWorkouts, setUserWorkouts] = useState<WorkoutLog[]>([]);

  const fetchWorkouts = useCallback(() => {
    if (currentUser) {
      const workouts = StorageService.getWorkouts(currentUser.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setUserWorkouts(workouts);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);
  
  useEffect(() => {
    const names = WORKOUT_NAMES[workoutType] || [];
    setAvailableWorkoutNames(names);
    if (names.length > 0) {
      setWorkoutName(names[0]);
    } else {
      setWorkoutName('');
    }
  }, [workoutType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setMessage({ type: 'error', text: 'You must be logged in to log a workout.' });
      return;
    }
    if (!workoutName) {
        setMessage({ type: 'error', text: 'Please select or enter a workout name.' });
        return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const newWorkout: WorkoutLog = {
      id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      date,
      type: workoutType,
      workoutName,
      sets: Number(sets),
      reps: Number(reps),
      notes,
    };

    try {
      StorageService.saveWorkout(newWorkout);
      setMessage({ type: 'success', text: 'Workout logged successfully!' });
      // Reset form (optional)
      // setDate(new Date().toISOString().split('T')[0]);
      // setWorkoutType(WorkoutType.Strength);
      // setNotes('');
      fetchWorkouts(); // Refresh list
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to log workout. Please try again.' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorkout = (workoutId: string) => {
    if(window.confirm('Are you sure you want to delete this workout?')) {
      StorageService.deleteWorkout(workoutId);
      fetchWorkouts(); // Refresh list
      setMessage({ type: 'success', text: 'Workout deleted.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold orbitron text-brand-primary">Log Your Workout</h1>
        <Button onClick={() => navigate(Page.WorkoutDashboard)} variant="ghost">Back to Dashboard</Button>
      </div>

      {message && (
        <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-brand-surface p-6 sm:p-8 rounded-xl shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Select
            label="Workout Type"
            options={WORKOUT_TYPES_ARRAY.map(wt => ({ value: wt, label: wt }))}
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
            required
          />
        </div>
        
        <Select
          label="Workout Name"
          options={availableWorkoutNames.map(name => ({ value: name, label: name }))}
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          required
          placeholder="Select a workout"
        />
        {/* Or allow custom workout name if type is 'Other' or if list is empty */}
        { (workoutType === WorkoutType.Other || availableWorkoutNames.length === 0) &&
           <Input 
                label="Custom Workout Name"
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="E.g., Morning Jog"
                required={availableWorkoutNames.length === 0}
            />
        }


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Sets"
            options={SETS_OPTIONS.map(s => ({ value: s, label: s.toString() }))}
            value={sets}
            onChange={(e) => setSets(Number(e.target.value))}
            required
          />
          <Select
            label="Reps (per set)"
            options={REPS_OPTIONS.map(r => ({ value: r, label: r.toString() }))}
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
            required
          />
        </div>
        <div>
            <label htmlFor="notes" className="block text-sm font-medium text-brand-text-muted mb-1">Notes (Optional)</label>
            <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="block w-full bg-brand-surface border border-brand-border rounded-md shadow-sm placeholder-brand-text-muted focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-brand-text p-2"
                placeholder="Any details, e.g., weight used, how you felt..."
            />
        </div>
        <Button type="submit" className="w-full sm:w-auto" isLoading={isSubmitting} variant="primary" size="lg">
          Log Workout
        </Button>
      </form>

      <div className="mt-12 bg-brand-surface p-6 sm:p-8 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-semibold text-brand-text mb-6">Your Workout History</h2>
        {userWorkouts.length === 0 ? (
          <p className="text-brand-text-muted">No workouts logged yet. Get started above!</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {userWorkouts.map(workout => (
              <div key={workout.id} className="bg-gray-700 p-4 rounded-lg shadow-md flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold text-brand-text">{workout.workoutName} <span className="text-xs font-normal text-brand-secondary">({workout.type})</span></p>
                  <p className="text-sm text-brand-text-muted">{new Date(workout.date).toLocaleDateString()}</p>
                  <p className="text-sm text-brand-text-muted">{workout.sets} sets x {workout.reps} reps</p>
                  {workout.notes && <p className="text-xs text-gray-400 mt-1 italic">Notes: {workout.notes}</p>}
                </div>
                <Button variant="danger" size="sm" onClick={() => handleDeleteWorkout(workout.id)}>Delete</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutLogPage;
    