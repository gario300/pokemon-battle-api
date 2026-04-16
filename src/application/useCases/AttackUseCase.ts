import { LobbyRepository } from '../../infrastructure/database/repositories/LobbyRepository';
import { BattleService } from '../../domain/services/BattleService';
import { LobbyModel } from '../../infrastructure/database/models/LobbyModel';
import { Lobby } from '../../domain/models/Lobby';

export interface AttackResult {
  damageDealt: number;
  defenderHpRemaining: number;
  defenderFainted: boolean;
  newDefenderIndex?: number;
  battleOver: boolean;
  winnerSessionId?: string | null;
  lobby: Lobby;
}

export class AttackUseCase {
  constructor(private lobbyRepo: LobbyRepository) {}

  async execute(sessionId: string): Promise<AttackResult> {
    const lockedLobbyDoc = await LobbyModel.findOneAndUpdate(
      { 
        status: 'battling', 
        currentTurnSessionId: sessionId, 
        isProcessingTurn: false 
      },
      { isProcessingTurn: true },
      { new: true }
    );

    if (!lockedLobbyDoc) {
      const currentLobby = await this.lobbyRepo.getGlobalLobby();
      if (currentLobby.status !== 'battling') throw new Error('Battle is not active');
      if (currentLobby.currentTurnSessionId !== sessionId) throw new Error('Not your turn');
      if (currentLobby.isProcessingTurn) throw new Error('Another action is processing');
      throw new Error('Could not lock lobby for attack');
    }

    let lobby = lockedLobbyDoc.toObject();

    try {
      const attackerIndex = lobby.players.findIndex(p => p.sessionId === sessionId);
      const defenderIndex = attackerIndex === 0 ? 1 : 0;

      const attacker = lobby.players[attackerIndex];
      const defender = lobby.players[defenderIndex];

      const attackerPokemon = attacker.team[attacker.activePokemonIndex];
      const defenderPokemon = defender.team[defender.activePokemonIndex];

      const damage = BattleService.computeDamage(attackerPokemon, defenderPokemon);
      BattleService.applyDamage(defenderPokemon, damage);

      const result: AttackResult = {
        damageDealt: damage,
        defenderHpRemaining: defenderPokemon.currentHp,
        defenderFainted: defenderPokemon.isDefeated,
        battleOver: false,
        lobby: lobby
      };

      if (defenderPokemon.isDefeated) {
        const nextIndex = BattleService.getNextAvailablePokemonIndex(defender.team);
        if (nextIndex === -1) {
          lobby.status = 'finished';
          lobby.winnerSessionId = attacker.sessionId;
          lobby.currentTurnSessionId = null;
          lobby.turnExpiresAt = null;
          
          result.battleOver = true;
          result.winnerSessionId = attacker.sessionId;
        } else {
          defender.activePokemonIndex = nextIndex;
          result.newDefenderIndex = nextIndex;
        }
      }

      if (lobby.status === 'battling') {
        lobby.currentTurnSessionId = defender.sessionId;
        lobby.turnExpiresAt = new Date(Date.now() + 60000); // 1 MINUTE
      }

      lobby.isProcessingTurn = false;
      const savedLobby = await this.lobbyRepo.save(lobby);
      result.lobby = savedLobby;

      return result;

    } catch (error) {
      await LobbyModel.findByIdAndUpdate(lobby._id, { isProcessingTurn: false });
      throw error;
    }
  }
}
