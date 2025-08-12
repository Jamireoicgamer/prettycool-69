
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Monitor, FileText, Clock, MapPin } from 'lucide-react';

export const Terminal = () => {
  const { gameState } = useGame();
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const terminalEntries = gameState.terminalLore || [];
  const selectedLore = terminalEntries.find(entry => entry.id === selectedEntry);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
        <h2 className="text-xl font-bold text-green-400 mb-2 flex items-center">
          <Monitor className="mr-2" size={24} />
          RobCo Terminal
        </h2>
        <p className="text-gray-400 text-sm font-mono">FALLOUT: SCRAPLINE - SANDY SHORES ARCHIVE</p>
        <p className="text-green-400 text-xs font-mono mt-1">
          {terminalEntries.length} ENTRIES UNLOCKED | ACCESS LEVEL: COMMANDER
        </p>
      </div>

      {/* Terminal Interface */}
      <div className="bg-black/60 backdrop-blur-sm rounded-xl border border-green-500/30 min-h-96">
        {!selectedLore ? (
          // Entry List
          <div className="p-4">
            <div className="text-green-400 font-mono text-sm mb-4">
              {'>'} SELECT DATA FILE TO ACCESS
            </div>
            
            {terminalEntries.length === 0 ? (
              <div className="text-gray-400 font-mono text-sm">
                NO DATA FILES AVAILABLE<br/>
                COMPLETE OPERATIONS TO UNLOCK ARCHIVE ENTRIES
              </div>
            ) : (
              <div className="space-y-2">
                {terminalEntries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry.id)}
                    className="w-full text-left bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg p-3 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-green-400 font-mono text-sm flex items-center">
                        <FileText className="mr-2" size={14} />
                        {entry.title.toUpperCase()}
                      </span>
                      <span className="text-gray-400 font-mono text-xs">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    <div className="text-gray-400 font-mono text-xs">
                      UNLOCKED BY: {entry.unlockedBy.toUpperCase()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Selected Entry View
          <div className="p-4">
            <div className="text-green-400 font-mono text-sm mb-4 flex items-center justify-between">
              <span>{'>'} ACCESSING DATA FILE...</span>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-red-400 hover:text-red-300 font-mono text-xs"
              >
                [EXIT]
              </button>
            </div>
            
            <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/5">
              <div className="mb-4">
                <h3 className="text-green-400 font-mono text-lg mb-2">
                  {selectedLore.title.toUpperCase()}
                </h3>
                <div className="flex items-center space-x-4 text-gray-400 font-mono text-xs mb-3">
                  <span className="flex items-center">
                    <Clock className="mr-1" size={12} />
                    {formatTimestamp(selectedLore.timestamp)}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="mr-1" size={12} />
                    SANDY SHORES REGION
                  </span>
                </div>
              </div>
              
              <div className="text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {selectedLore.content}
              </div>
              
              <div className="mt-4 pt-3 border-t border-green-500/30">
                <p className="text-green-400 font-mono text-xs">
                  DATA CLASSIFICATION: RESTRICTED<br/>
                  SOURCE: FIELD OPERATION REPORT<br/>
                  AUTHENTICATION: VERIFIED
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sandy Shores Factions Info */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20">
        <h3 className="text-amber-400 font-semibold mb-3">Sandy Shores Factions</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <h4 className="text-red-400 font-semibold text-sm">🔥 Ember Creed</h4>
            <p className="text-gray-400 text-xs">Radical survivors who embrace mutation and chaos</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <h4 className="text-blue-400 font-semibold text-sm">⚙️ Steel Remnants</h4>
            <p className="text-gray-400 text-xs">Technology-focused faction seeking pre-war artifacts</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <h4 className="text-green-400 font-semibold text-sm">🌵 Free Frontier</h4>
            <p className="text-gray-400 text-xs">Independent traders and settlers maintaining neutrality</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <h4 className="text-purple-400 font-semibold text-sm">🧬 Caravan Guild</h4>
            <p className="text-gray-400 text-xs">Merchant faction controlling most trade routes</p>
          </div>
        </div>
      </div>
    </div>
  );
};
