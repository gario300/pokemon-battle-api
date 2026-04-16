import { LobbyRepository } from '../../infrastructure/database/repositories/LobbyRepository';

export class DisconnectUseCase {
  constructor(private lobbyRepo: LobbyRepository) {}

  async execute(socketId: string) {
    let lobby = await this.lobbyRepo.getGlobalLobby();

    const playerIndex = lobby.players.findIndex(p => p.socketId === socketId);
    if (playerIndex === -1) return null;

    if (lobby.status === 'battling') {
      lobby.players[playerIndex].isConnected = false;
    } else {
      lobby.players.splice(playerIndex, 1);
      
      if (lobby.players.length > 0) {
        lobby.players[0].isReady = false;
      }
      
      lobby.status = 'waiting';
    }

    return await this.lobbyRepo.save(lobby);
  }
}
