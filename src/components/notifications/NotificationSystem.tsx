
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { X, Clock, User, Shield, Zap, AlertTriangle } from 'lucide-react';

export const NotificationSystem = () => {
  const { gameState, dismissNotification, handleDialogueChoice, handleEventChoice } = useGame();
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Show new notifications
    gameState.pendingNotifications.forEach(notification => {
      if (!visibleNotifications.includes(notification.id)) {
        setVisibleNotifications(prev => [...prev, notification.id]);
        
        // Auto-dismiss low priority notifications after 8 seconds
        if (notification.priority === 'low') {
          setTimeout(() => {
            dismissNotification(notification.id);
            setVisibleNotifications(prev => prev.filter(id => id !== notification.id));
          }, 8000);
        }
      }
    });
  }, [gameState.pendingNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'challenge': return <Shield className="text-red-400" size={20} />;
      case 'story': return <User className="text-blue-400" size={20} />;
      case 'trade': return <span className="text-yellow-400 text-lg">💰</span>;
      case 'combat': return <span className="text-red-400 text-lg">⚔️</span>;
      case 'event': return <Zap className="text-purple-400" size={20} />;
      case 'warning': return <AlertTriangle className="text-orange-400" size={20} />;
      default: return <span className="text-gray-400 text-lg">ℹ️</span>;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10 shadow-red-500/20';
      case 'medium': return 'border-orange-500 bg-orange-500/10 shadow-orange-500/20';
      default: return 'border-gray-500/30 bg-black/40 shadow-black/20';
    }
  };

  const handleChoice = (notificationId: string, choiceIndex: number) => {
    const notification = gameState.pendingNotifications.find(n => n.id === notificationId);
    if (notification?.dialogueOptions) {
      handleDialogueChoice(notificationId, choiceIndex);
    }
    setVisibleNotifications(prev => prev.filter(id => id !== notificationId));
  };

  const handleDismiss = (notificationId: string) => {
    dismissNotification(notificationId);
    setVisibleNotifications(prev => prev.filter(id => id !== notificationId));
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-3 w-full max-w-md px-4">
      {gameState.pendingNotifications
        .filter(notification => visibleNotifications.includes(notification.id))
        .map((notification, index) => (
          <div
            key={notification.id}
            className={`border-2 rounded-xl backdrop-blur-sm shadow-lg animate-fade-in ${getPriorityStyle(notification.priority)}`}
            style={{
              animationDelay: `${index * 100}ms`,
              transform: `translateY(${index * 10}px)`
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-500/20">
              <div className="flex items-center space-x-3">
                {getNotificationIcon(notification.type)}
                <div>
                  <h3 className="text-white font-semibold text-sm">{notification.title}</h3>
                  {notification.character && (
                    <p className="text-xs text-gray-400">
                      {notification.character.name} • {notification.character.faction}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => handleDismiss(notification.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-300 text-sm mb-4">{notification.message}</p>

              {/* Character Image */}
              {notification.character?.image && (
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-lg">{notification.character.name.charAt(0)}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    <p className="font-medium text-white">{notification.character.name}</p>
                    <p>{notification.character.faction}</p>
                  </div>
                </div>
              )}

              {/* Dialogue Options */}
              {notification.dialogueOptions && (
                <div className="space-y-2">
                  {notification.dialogueOptions.map((option, optionIndex) => {
                    const canSelect = !option.requirement || 
                      checkRequirement(option.requirement);
                    
                    return (
                      <button
                        key={optionIndex}
                        onClick={() => handleChoice(notification.id, optionIndex)}
                        disabled={!canSelect}
                        className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                          canSelect
                            ? 'border-gray-500/30 bg-black/20 hover:border-amber-500/50 hover:bg-amber-500/5 text-white'
                            : 'border-red-500/30 bg-red-500/5 text-red-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.text}</span>
                          {option.requirement && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              canSelect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {`Charisma ${option.requirement.charisma || 0}`}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Time remaining for timed events */}
              {notification.type === 'event' && (
                <div className="mt-3 flex items-center space-x-2 text-xs text-gray-400">
                  <Clock size={14} />
                  <span>Respond within 5 minutes or mission speed will be reduced</span>
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );

  // Helper function to check requirements
  function checkRequirement(requirement: { charisma?: number }): boolean {
    if (requirement.charisma) {
      const avgCharisma = gameState.squad.reduce((sum, member) => sum + member.stats.charisma, 0) / gameState.squad.length;
      return avgCharisma >= requirement.charisma;
    }
    return true;
  }
};
