import { LobbyRepository } from '../../infrastructure/database/repositories/LobbyRepository';

export class FinishByTimeoutUseCase {
  constructor(private lobbyRepo: LobbyRepository) {}

  async execute(sessionId: string) {
    const lobby = await this.lobbyRepo.getGlobalLobby();

    if (lobby.status !== 'battling' || lobby.currentTurnSessionId !== sessionId) {
      return null;
    }

    const attackerIndex = lobby.players.findIndex(p => p.sessionId === sessionId);
    const opponentIndex = attackerIndex === 0 ? 1 : 0;
    
    const attacker = lobby.players[attackerIndex];
    const opponent = lobby.players[opponentIndex];

    lobby.status = 'finished';

    if (attacker.isConnected && !opponent.isConnected) {
      lobby.winnerSessionId = attacker.sessionId;
    } else if (!attacker.isConnected && opponent.isConnected) {
      lobby.winnerSessionId = opponent.sessionId;
    } else {
      lobby.winnerSessionId = opponent.sessionId;
    }

    lobby.currentTurnSessionId = null;
    lobby.turnExpiresAt = null;
    lobby.isProcessingTurn = false;

    return await this.lobbyRepo.save(lobby);
  }
}
