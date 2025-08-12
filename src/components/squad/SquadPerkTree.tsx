import React from 'react';
import { useGame } from '@/context/GameContext';
import { SQUAD_PERKS } from '@/data/SquadPerks';
import { X, Check, Lock } from 'lucide-react';

interface SquadPerkTreeProps {
  memberId: string;
  onClose: () => void;
}

export const SquadPerkTree: React.FC<SquadPerkTreeProps> = ({ memberId, onClose }) => {
  const { gameState, updateUISettings } = useGame();
  const { squad } = gameState;
  const member = squad.find(m => m.id === memberId);
  const { chooseSquadPerk } = (useGame() as any);

  if (!member) return null;

  const owned = new Set(member.perks || []);
  const points = member.perkPoints || 0;

  const canSelect = (perk: any) => {
    if (owned.has(perk.id) || points <= 0) return false;
    const levelReq = perk.requires?.level ?? 1;
    if ((member.level || 1) < levelReq) return false;
    const prior = perk.requires?.perks || [];
    return prior.every((p: string) => owned.has(p));
  };

  const onPick = (perkId: string) => {
    if (points <= 0) return;
    (useGame() as any).chooseSquadPerk?.(member.id, perkId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/90 border border-blue-500/30 rounded-xl p-6 max-w-3xl w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-blue-400 font-semibold">Perk Tree • {member.name} (Points: {points})</h3>
          <button onClick={onClose} className="text-white hover:text-red-400" aria-label="Close perk tree">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto">
          {SQUAD_PERKS.map(perk => {
            const ownedPerk = owned.has(perk.id);
            const selectable = canSelect(perk);
            return (
              <div key={perk.id} className={`p-3 rounded-lg border ${ownedPerk ? 'border-green-500/40 bg-green-500/10' : selectable ? 'border-blue-500/40 bg-blue-500/10' : 'border-gray-500/30 bg-gray-800/30'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{perk.name}</p>
                    <p className="text-xs text-gray-400">{perk.description}</p>
                    {perk.requires && (
                      <p className="text-xs text-gray-500 mt-1">Req: Lv {perk.requires.level || 1}{perk.requires.perks ? ` • ${perk.requires.perks.join(', ')}` : ''}</p>
                    )}
                  </div>
                  {ownedPerk ? (
                    <Check className="text-green-400" size={18} />
                  ) : selectable ? (
                    <button onClick={() => onPick(perk.id)} className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-white">Select</button>
                  ) : (
                    <Lock className="text-gray-400" size={18} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
