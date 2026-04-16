import { LobbyRepository } from '../../infrastructure/database/repositories/LobbyRepository';
import { BattleService } from '../../domain/services/BattleService';
import { Lobby } from '../../domain/models/Lobby';

export class SetReadyUseCase {
  constructor(private lobbyRepo: LobbyRepository) {}

  async execute(sessionId: string): Promise<Lobby> {
    let lobby = await this.lobbyRepo.getGlobalLobby();
    
    const playerIndex = lobby.players.findIndex(p => p.sessionId === sessionId);
    if (playerIndex === -1) throw new Error('Player not found in lobby');

    if (lobby.players[playerIndex].team.length === 0) {
      throw new Error('Cannot set ready without a Pokemon team');
    }

    lobby.players[playerIndex].isReady = true;

    if (lobby.players.length === 2 && lobby.players.every(p => p.isReady)) {
      lobby.status = 'battling';
      
      const firstPlayer = BattleService.determineFirstTurn(lobby.players);
      lobby.currentTurnSessionId = firstPlayer.sessionId;

      lobby.turnExpiresAt = new Date(Date.now() + 60000);
    }

    return await this.lobbyRepo.save(lobby);
  }
}
