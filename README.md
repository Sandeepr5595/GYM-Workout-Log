# Gym Workout Logger

A comprehensive, responsive web application for tracking gym workouts with dynamic exercise illustrations and analytics.

## 🏋️‍♂️ Features

- **Workout Logging**: Log exercises with sets, reps, and weights
- **Dynamic Images**: Exercise illustrations update based on selection
- **Analytics Dashboard**: Visual charts for workout progress
- **Workout History**: View all logged workouts by date
- **Responsive Design**: Works on desktop and mobile devices
- **Data Persistence**: Workouts saved to browser localStorage

## 🛠 Tech Stack

- **Frontend**: React 18 with Hooks
- **Styling**: TailwindCSS + Custom CSS
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Build Tool**: Vite
- **UI Components**: Custom shadcn/ui components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone or extract the project
cd gym-workout-logger

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📁 Project Structure

```
gym-workout-logger/
├── src/
│   ├── components/          # React components
│   │   ├── WorkoutForm.jsx     # Workout logging form
│   │   ├── ExerciseDisplay.jsx # Dynamic exercise images
│   │   ├── WorkoutHistory.jsx  # Workout history view
│   │   └── WorkoutAnalytics.jsx # Charts and analytics
│   ├── data/
│   │   └── workoutData.js      # Exercise database
│   ├── assets/              # Exercise illustrations
│   ├── App.jsx              # Main application
│   ├── App.css              # Global styles
│   └── main.jsx             # Entry point
├── dist/                    # Production build
├── public/                  # Static assets
└── package.json
```

## 💪 Exercise Database

The app includes a comprehensive exercise database with:
- 15+ exercises across 6 muscle groups
- Exercise ratings and injury risk levels
- Primary and secondary muscle targeting
- Multiple illustration types per exercise

## 📊 Analytics Features

- **Muscle Group Distribution**: Pie chart showing workout balance
- **Weekly Frequency**: Line chart tracking workout consistency  
- **Daily Volume**: Bar chart showing total weight lifted
- **Progress Stats**: Total workouts, volume, sets, and averages

## 🎨 Design Features

- **Dark Theme**: Gym-inspired dark UI with red accents
- **Responsive Layout**: Mobile-first design approach
- **Touch Friendly**: Optimized for mobile interaction
- **Visual Hierarchy**: Clear typography and spacing
- **Smooth Animations**: Subtle transitions and hover effects

## 🔧 Customization

### Adding New Exercises
Edit `src/data/workoutData.js`:
```javascript
{
  id: 'new_exercise',
  name: 'New Exercise',
  muscleGroup: 'Chest',
  primaryMuscle: 'Pectoralis Major',
  secondaryMuscle: 'Anterior Deltoids',
  rating: 4.5,
  injuryRisk: 'Low',
  images: {
    motionSequence: 'new_exercise_motion.png',
    staticDual: 'new_exercise_static.png',
    postureGuide: 'new_exercise_form.png'
  }
}
```

### Styling Changes
- Main styles: `src/App.css`
- TailwindCSS config: `tailwind.config.js`
- Component-specific styles: Inline with Tailwind classes

## 📱 Mobile Support

- Responsive breakpoints for all screen sizes
- Touch-optimized form controls
- Mobile-friendly navigation
- Optimized image loading

## 🔒 Data Storage

- Uses browser localStorage for data persistence
- No external database required
- Data stays on user's device
- Export functionality can be added

## 🚀 Deployment

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions for:
- Netlify (recommended)
- Vercel
- GitHub Pages
- Firebase Hosting
- Surge.sh

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Exercise illustrations from comprehensive workout database
- TailwindCSS for styling framework
- Recharts for data visualization
- Lucide for beautiful icons

---

**Built with ❤️ for fitness enthusiasts**

