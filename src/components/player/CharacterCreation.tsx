import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayerCharacter, PlayerBackground } from '@/types/PlayerTypes';
import { PLAYER_BACKGROUNDS } from '@/data/PlayerBackgrounds';
import { Minus, Plus } from 'lucide-react';
import { CharacterAvatarSelector } from '@/components/character/CharacterAvatars';

interface CharacterCreationProps {
  onCharacterCreated: (character: PlayerCharacter) => void;
  onCancel: () => void;
}

export const CharacterCreation: React.FC<CharacterCreationProps> = ({
  onCharacterCreated,
  onCancel
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar-01');
  const [selectedBackground, setSelectedBackground] = useState<PlayerBackground | null>(null);
  const [specialPoints, setSpecialPoints] = useState({
    strength: 5,
    perception: 5,
    endurance: 5,
    charisma: 5,
    intelligence: 5,
    agility: 5,
    luck: 5
  });
  const [availablePoints, setAvailablePoints] = useState(28); // Total 63 points to distribute

  const handleStatChange = (stat: string, delta: number) => {
    const newValue = specialPoints[stat as keyof typeof specialPoints] + delta;
    if (newValue < 1 || newValue > 10) return;
    if (delta > 0 && availablePoints <= 0) return;
    if (delta < 0 && specialPoints[stat as keyof typeof specialPoints] <= 1) return;

    setSpecialPoints(prev => ({
      ...prev,
      [stat]: newValue
    }));
    setAvailablePoints(prev => prev - delta);
  };

  const createCharacter = () => {
    if (!name || !selectedBackground) return;

    // Apply background bonuses to base stats
    const finalStats = { ...specialPoints };
    if (selectedBackground.startingStats.special) {
      Object.entries(selectedBackground.startingStats.special).forEach(([stat, bonus]) => {
        finalStats[stat as keyof typeof finalStats] += bonus;
      });
    }

    const character: PlayerCharacter = {
      id: `player-${Date.now()}`,
      name,
      avatar: selectedAvatar,
      level: 1,
      experience: 0,
      experienceToNext: 1000,
      special: finalStats,
      health: 100 + (finalStats.endurance * 5),
      maxHealth: 100 + (finalStats.endurance * 5),
      actionPoints: 65 + (finalStats.agility * 3),
      maxActionPoints: 65 + (finalStats.agility * 3),
      carryWeight: 200 + (finalStats.strength * 10),
      maxCarryWeight: 200 + (finalStats.strength * 10),
      needs: {
        hunger: 100,
        thirst: 100,
        sleep: 100,
        radiation: 0
      },
      equipment: {
        weapon: null,
        armor: null,
        helmet: null,
        accessory: null,
        outfit: null
      },
      inventory: Array.from({ length: 20 }, (_, index) => ({
        id: `player-slot-${index}`,
        item: null,
        quantity: 0
      })),
      background: selectedBackground.id,
      traits: [],
      perks: selectedBackground.startingPerks.map(perkId => ({
        id: perkId,
        name: perkId,
        description: '',
        icon: '⭐',
        level: 1,
        maxLevel: 1,
        requirements: {},
        effects: {}
      })),
      statusEffects: [],
      isCreated: true,
      createdAt: Date.now(),
      lastActiveTime: Date.now()
    };

    onCharacterCreated(character);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Character Creation</h2>
        <p className="text-muted-foreground">Step 1: Basic Information</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="character-name">Character Name</Label>
          <Input
            id="character-name"
            placeholder="Enter your character's name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={() => setStep(2)} 
          disabled={!name.trim()}
          className="flex-1"
        >
          Next: Avatar
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Character Avatar</h2>
        <p className="text-muted-foreground">Step 2: Choose your character's appearance</p>
      </div>

      <CharacterAvatarSelector
        selectedAvatar={selectedAvatar}
        onAvatarSelect={setSelectedAvatar}
      />

      <div className="flex gap-3">
        <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={() => setStep(3)} className="flex-1">
          Next: Background
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Character Background</h2>
        <p className="text-muted-foreground">Step 3: Choose your character's origin</p>
      </div>

      <ScrollArea className="h-80">
        <div className="grid gap-3">
          {PLAYER_BACKGROUNDS.map((background) => (
            <Card
              key={background.id}
              className={`cursor-pointer transition-all ${
                selectedBackground?.id === background.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => setSelectedBackground(background)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{background.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{background.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {background.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(background.startingStats.special).map(([stat, value]) => (
                        <Badge key={stat} variant="outline" className="text-xs">
                          {stat.charAt(0).toUpperCase()}: +{value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-3">
        <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
          Back
        </Button>
        <Button 
          onClick={() => setStep(4)} 
          disabled={!selectedBackground}
          className="flex-1"
        >
          Next: S.P.E.C.I.A.L.
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">S.P.E.C.I.A.L. Stats</h2>
        <p className="text-muted-foreground">Step 4: Allocate your stat points</p>
        <p className="text-sm text-primary">Points Remaining: {availablePoints}</p>
      </div>

      <div className="space-y-4">
        {Object.entries(specialPoints).map(([stat, value]) => {
          const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
          const descriptions = {
            strength: 'Raw physical power. Affects melee damage and carry weight.',
            perception: 'Environmental awareness. Affects accuracy and detection.',
            endurance: 'Fitness and health. Affects HP and radiation resistance.',
            charisma: 'Charm and leadership. Affects prices and dialogue.',
            intelligence: 'Reasoning and logic. Affects skill points and hacking.',
            agility: 'Coordination and speed. Affects action points and stealth.',
            luck: 'Fate and fortune. Affects critical chance and random events.'
          };

          return (
            <Card key={stat}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{statName}</h3>
                      <Badge variant="secondary">{value}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {descriptions[stat as keyof typeof descriptions]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatChange(stat, -1)}
                      disabled={value <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div className="w-8 text-center font-mono">{value}</div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatChange(stat, 1)}
                      disabled={value >= 10 || availablePoints <= 0}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={createCharacter} className="flex-1">
          Create Character
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </CardContent>
      </Card>
    </div>
  );
};