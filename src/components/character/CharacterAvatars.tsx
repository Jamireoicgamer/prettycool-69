import React from 'react';

// Character avatars using emoji and placeholder patterns
export const CHARACTER_AVATARS = [
  { id: 'avatar-01', src: '🧑‍✈️', name: 'Wasteland Warrior', type: 'emoji' },
  { id: 'avatar-02', src: '🪖', name: 'Combat Specialist', type: 'emoji' },
  { id: 'avatar-03', src: '👩‍🔬', name: 'Tech Guardian', type: 'emoji' },
  { id: 'avatar-04', src: '👨‍🔧', name: 'Vault Dweller', type: 'emoji' },
  { id: 'avatar-05', src: '🏜️', name: 'Desert Veteran', type: 'emoji' },
  { id: 'avatar-06', src: '👩‍🎤', name: 'Raider Queen', type: 'emoji' },
  { id: 'avatar-07', src: '👨‍💻', name: 'Science Officer', type: 'emoji' },
  { id: 'avatar-08', src: '👩‍⚕️', name: 'Field Medic', type: 'emoji' },
  { id: 'avatar-09', src: '🏹', name: 'Tribal Warrior', type: 'emoji' },
  { id: 'avatar-10', src: '🔧', name: 'Scrap Hunter', type: 'emoji' },
  { id: 'avatar-11', src: '⚔️', name: 'Brotherhood Knight', type: 'emoji' },
  { id: 'avatar-12', src: '☢️', name: 'Ghoul Survivor', type: 'emoji' },
  { id: 'avatar-13', src: '💼', name: 'Wasteland Trader', type: 'emoji' },
  { id: 'avatar-14', src: '🥷', name: 'Shadow Operative', type: 'emoji' },
  { id: 'avatar-15', src: '🛡️', name: 'Vault-Tec Survivor', type: 'emoji' }
];

interface CharacterAvatarSelectorProps {
  selectedAvatar: string;
  onAvatarSelect: (avatarId: string) => void;
}

export const CharacterAvatarSelector: React.FC<CharacterAvatarSelectorProps> = ({
  selectedAvatar,
  onAvatarSelect
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Choose Your Avatar</h3>
      <div className="grid grid-cols-5 gap-3 max-h-80 overflow-y-auto">
        {CHARACTER_AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => onAvatarSelect(avatar.id)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
              selectedAvatar === avatar.id
                ? 'border-primary ring-2 ring-primary/50'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 text-4xl">
              {avatar.src}
            </div>
            {selectedAvatar === avatar.id && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
              <p className="text-xs text-white text-center font-medium">{avatar.name}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export const getAvatarById = (avatarId: string) => {
  return CHARACTER_AVATARS.find(avatar => avatar.id === avatarId);
};