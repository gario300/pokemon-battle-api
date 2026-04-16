import { LobbyRepository } from '../../infrastructure/database/repositories/LobbyRepository';

export class DisconnectUseCase {
  constructor(private lobbyRepo: LobbyRepository) {}

  async execute(socketId: string) {
    let lobby = await this.lobbyRepo.getGlobalLobby();

    const playerIndex = lobby.players.findIndex(p => p.socketId === socketId);
    if (playerIndex === -1) return null;

    lobby.players[playerIndex].isConnected = false;

    return await this.lobbyRepo.save(lobby);
  }
}
