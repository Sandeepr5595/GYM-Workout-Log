# Gym Workout Data Analysis

Based on the Excel file analysis, here are the key findings:

## Workout Categories and Exercises

### Back Exercises:
- Pull-Ups/Chin-Ups (Rating: 5/5)
- Barbell Rows (Rating: 4.5/5)
- Seated Cable Rows (Rating: 4/5)
- Deadlift (Rating: 4/5)

### Biceps Exercises:
- Chin-Ups (Rating: 5/5)
- Barbell Curl (Rating: 4.5/5)
- Incline Dumbbell Curl (Rating: 4/5)
- Hammer Curl (Rating: 4/5)

### Chest Exercises:
- Barbell Bench Press (Rating: 5/5)

## Data Structure for React App:

Each exercise contains:
- Muscle Group
- Exercise Name
- Primary Muscle Target
- Secondary Muscle Target
- Rating (out of 5)
- Scientific Explanation
- Injury Risk Level
- Doctor Recommendations
- Illustration filename

## Available Illustrations:

The illustrations follow naming patterns:
- `{exercise_name}_motion_sequence.png` - Shows movement sequence
- `{exercise_name}_static_dual.png` - Shows front/back anatomical view
- `{exercise_name}_posture_guide.png` - Shows proper form
- `{muscle_group}_muscles.png` - Shows muscle group anatomy

## Implementation Notes:

1. Use the exercise names from the CSV as keys for image lookup
2. Implement dropdown/combobox with all available exercises
3. Dynamic image loading based on selected exercise
4. Store workout logs with: date, exercise, sets, reps
5. Analytics should track: exercise frequency, volume (sets × reps), muscle group distribution

