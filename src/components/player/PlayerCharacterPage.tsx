import React from 'react';
import { useGame } from '@/context/GameContext';
import { CharacterCreation } from '@/components/player/CharacterCreation';
import { PlayerManagement } from '@/components/player/PlayerManagement';
import { PlayerCharacter } from '@/types/PlayerTypes';

export const PlayerCharacterPage: React.FC = () => {
  const { gameState } = useGame();

  const { createPlayerCharacter, feedPlayer, givePlayerWater, restPlayer, useRadAway, equipPlayerItem, unequipPlayerItem } = useGame();

  const handleCharacterCreated = (character: PlayerCharacter) => {
    createPlayerCharacter(character);
  };

  if (!gameState.playerCharacter) {
    return (
      <CharacterCreation
        onCharacterCreated={handleCharacterCreated}
        onCancel={() => window.history.back()}
      />
    );
  }

  return (
    <PlayerManagement
      player={gameState.playerCharacter}
      vaultInventory={gameState.inventory}
      onFeedPlayer={feedPlayer}
      onGiveWater={givePlayerWater}
      onRestPlayer={restPlayer}
      onUseRadAway={useRadAway}
      onEquipItem={equipPlayerItem}
      onUnequipItem={unequipPlayerItem}
      onUseConsumable={(itemId) => {
        // Use consumable on player character
        const item = gameState.inventory.find(inv => inv.id === itemId);
        if (item && item.type === 'consumable') {
          // This would trigger the USE_CONSUMABLE action for player
        }
      }}
    />
  );
};