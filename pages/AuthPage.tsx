
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { APP_NAME } from '../constants';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords don't match.");
      setIsLoading(false);
      return;
    }

    try {
      let success;
      if (isLogin) {
        success = await login(email, password);
        if (!success) setError('Invalid email or password.');
      } else {
        success = await signup(email, password);
        if (!success) setError('Email already exists or signup failed.');
        // No need to navigate here, App.tsx useEffect will handle it based on new currentUser state
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-brand-surface p-8 sm:p-10 rounded-xl shadow-2xl">
        <div>
          <h1 className="orbitron text-center text-4xl font-extrabold text-brand-primary">
            {APP_NAME}
          </h1>
          <h2 className="mt-4 text-center text-2xl font-bold text-brand-text">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-center text-sm text-red-400 bg-red-900 bg-opacity-50 p-2 rounded-md">{error}</p>}
          <Input
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {!isLogin && (
            <Input
              id="confirm-password"
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          )}
          <div>
            <Button type="submit" className="w-full" isLoading={isLoading} variant="primary">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-brand-text-muted">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => { setIsLogin(!isLogin); setError('');}}
            className="font-medium text-brand-secondary hover:text-teal-400 ml-1"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
    