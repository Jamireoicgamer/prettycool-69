
import React, { useState } from 'react';
import { User, Volume2, Smartphone, Shield, HelpCircle } from 'lucide-react';
import { useGame } from '@/context/GameContext';

export const Settings = () => {
  const { gameState, updateUISettings } = useGame();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showNewCharacterConfirm, setShowNewCharacterConfirm] = useState(false);

  const handleResetGame = () => {
    // Clear all saved data
    localStorage.removeItem('fallout-scrapline-save');
    
    // Reload the page to start fresh
    window.location.reload();
    setShowResetConfirm(false);
  };

  const handleNewCharacter = () => {
    // Clear all saved data to force character creation
    localStorage.removeItem('fallout-scrapline-save');
    
    // Reload the page to start fresh
    window.location.reload();
    setShowNewCharacterConfirm(false);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20">
        <h2 className="text-xl font-bold text-amber-400">Settings</h2>
        <p className="text-gray-400 text-sm">Configure your wasteland experience</p>
      </div>

      {/* Account Settings */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-500/20">
        <div className="flex items-center space-x-2 mb-4">
          <User className="text-blue-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Account</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Username</h4>
              <p className="text-gray-400 text-sm">{gameState.username}</p>
            </div>
            <button className="bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded-lg text-white text-sm transition-all">
              Edit
            </button>
          </div>
          
          {gameState.playerCharacter && (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Player Character</h4>
                <p className="text-gray-400 text-sm">{gameState.playerCharacter.name} (Level {gameState.playerCharacter.level})</p>
              </div>
              <button 
                onClick={() => setShowNewCharacterConfirm(true)}
                className="bg-orange-600 hover:bg-orange-500 px-3 py-1 rounded-lg text-white text-sm transition-all"
              >
                New Character
              </button>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Email</h4>
              <p className="text-gray-400 text-sm">user@example.com</p>
            </div>
            <button className="bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded-lg text-white text-sm transition-all">
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Audio Settings */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-500/20">
        <div className="flex items-center space-x-2 mb-4">
          <Volume2 className="text-green-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Audio</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Sound Effects</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-6 rounded-full transition-all ${
                soundEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                soundEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div>
            <label className="text-white mb-2 block">Master Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="75"
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>

      {/* Game Settings */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-500/20">
        <div className="flex items-center space-x-2 mb-4">
          <Smartphone className="text-purple-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Game</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Push Notifications</span>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-6 rounded-full transition-all ${
                notificationsEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">Auto-Save</span>
            <button
              onClick={() => setAutoSave(!autoSave)}
              className={`w-12 h-6 rounded-full transition-all ${
                autoSave ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                autoSave ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          {/* New gameplay toggles */}
          <div className="flex items-center justify-between">
            <span className="text-white">Auto-use chems in combat</span>
            <button
              onClick={() => updateUISettings({ autoUseChems: !gameState.uiSettings.autoUseChems })}
              className={`w-12 h-6 rounded-full transition-all ${
                gameState.uiSettings.autoUseChems ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                gameState.uiSettings.autoUseChems ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">Auto-pick squad perks on level-up</span>
            <button
              onClick={() => updateUISettings({ autoPickPerks: !gameState.uiSettings.autoPickPerks })}
              className={`w-12 h-6 rounded-full transition-all ${
                gameState.uiSettings.autoPickPerks ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                gameState.uiSettings.autoPickPerks ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div>
            <label className="text-white mb-2 block">Graphics Quality</label>
            <select className="w-full bg-black/40 border border-gray-500/30 rounded-lg p-2 text-white">
              <option>Low (Battery Saver)</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-500/20">
        <div className="flex items-center space-x-2 mb-4">
          <HelpCircle className="text-orange-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Support</h3>
        </div>
        
        <div className="space-y-2">
          <button className="w-full text-left p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            Tutorial & Help
          </button>
          <button className="w-full text-left p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            Report Bug
          </button>
          <button className="w-full text-left p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            Contact Support
          </button>
          <button className="w-full text-left p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            Terms of Service
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="text-red-400" size={20} />
          <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
        </div>
        
        <div className="space-y-2">
          <button 
            onClick={() => setShowResetConfirm(true)}
            className="w-full bg-red-600 hover:bg-red-500 p-2 rounded-lg text-white transition-all"
          >
            Reset Game Progress
          </button>
          <button className="w-full bg-red-800 hover:bg-red-700 p-2 rounded-lg text-white transition-all">
            Delete Account
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-red-500/30 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-red-400 font-bold text-lg mb-4">⚠️ Reset Game Progress</h3>
            <p className="text-white mb-4">
              This will permanently delete ALL your progress including:
            </p>
            <ul className="text-gray-300 text-sm mb-6 space-y-1">
              <li>• All squad members and workers</li>
              <li>• All inventory items and equipment</li>
              <li>• Base modules and upgrades</li>
              <li>• Currency and resources</li>
              <li>• Mission progress and achievements</li>
            </ul>
            <p className="text-red-400 font-bold mb-6">This action cannot be undone!</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 p-2 rounded-lg text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleResetGame}
                className="flex-1 bg-red-600 hover:bg-red-500 p-2 rounded-lg text-white transition-all"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Character Confirmation Modal */}
      {showNewCharacterConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-orange-500/30 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-orange-400 font-bold text-lg mb-4">⚠️ Create New Character</h3>
            <p className="text-white mb-4">
              This will permanently delete your current character and ALL progress:
            </p>
            <ul className="text-gray-300 text-sm mb-6 space-y-1">
              <li>• Current character: {gameState.playerCharacter?.name}</li>
              <li>• All squad members and workers</li>
              <li>• All inventory items and equipment</li>
              <li>• Base modules and upgrades</li>
              <li>• Currency and resources</li>
              <li>• Mission progress and achievements</li>
            </ul>
            <p className="text-orange-400 font-bold mb-6">This action cannot be undone!</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNewCharacterConfirm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 p-2 rounded-lg text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleNewCharacter}
                className="flex-1 bg-orange-600 hover:bg-orange-500 p-2 rounded-lg text-white transition-all"
              >
                Create New Character
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
