import { LobbyRepository } from '../../infrastructure/database/repositories/LobbyRepository';

export class TimeoutUseCase {
  constructor(private lobbyRepo: LobbyRepository) {}

  async execute(sessionId: string) {
    let lobby = await this.lobbyRepo.getGlobalLobby();

    if (lobby.status !== 'battling' || lobby.currentTurnSessionId !== sessionId) {
      return null;
    }

    lobby.status = 'finished';
    
    const opponentIndex = lobby.players.findIndex(p => p.sessionId !== sessionId);
    const winner = lobby.players[opponentIndex];
    
    lobby.winnerSessionId = winner ? winner.sessionId : null;
    lobby.currentTurnSessionId = null;
    lobby.turnExpiresAt = null;

    return await this.lobbyRepo.save(lobby);
  }
}
