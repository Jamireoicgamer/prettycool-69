
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { User, Lock, LogIn, UserPlus } from 'lucide-react';

export const LoginScreen = () => {
  const { login } = useGame();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const success = login(username);
    if (!success) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-amber-900 flex items-center justify-center p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9)), url('/lovable-uploads/8ee0e910-ff57-43a3-aa8e-968fc6da5e01.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-2xl">FS</span>
          </div>
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Fallout: Scrapline</h1>
          <p className="text-gray-400">Enter the wasteland and build your empire</p>
        </div>

        {/* Login Form */}
        <div className="bg-black/60 backdrop-blur-sm border border-amber-500/30 rounded-xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isRegistering ? 'Start your wasteland journey' : 'Continue your adventure'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-gray-500/30 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-400 focus:border-amber-500/50 focus:outline-none transition-colors"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-gray-500/30 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-400 focus:border-amber-500/50 focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 p-3 rounded-lg text-white font-bold transition-all flex items-center justify-center space-x-2"
            >
              {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
              <span>{isRegistering ? 'Create Account' : 'Login'}</span>
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
            >
              {isRegistering 
                ? 'Already have an account? Login' 
                : "Don't have an account? Register"}
            </button>
          </div>

          {/* Guest Mode */}
          <div className="mt-4 text-center">
            <button
              onClick={() => login('guest')}
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              Continue as Guest (progress will be auto-saved)
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Your progress will be automatically saved every second</p>
        </div>
      </div>
    </div>
  );
};
