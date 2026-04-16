import { LobbyRepository } from '../../infrastructure/database/repositories/LobbyRepository';
import { Player } from '../../domain/models/Player';
import { Lobby } from '../../domain/models/Lobby';

export class JoinLobbyUseCase {
  constructor(private lobbyRepo: LobbyRepository) {}

  async execute(sessionId: string, socketId: string, nickname: string): Promise<Lobby> {
    // lobbyRepo.getGlobalLobby() now handles auto-resetting finished matches.
    let lobby = await this.lobbyRepo.getGlobalLobby();

    const existingPlayerIndex = lobby.players.findIndex(p => p.sessionId === sessionId);

    if (existingPlayerIndex !== -1) {
      lobby.players[existingPlayerIndex].socketId = socketId;
      lobby.players[existingPlayerIndex].isConnected = true;
      lobby.players[existingPlayerIndex].nickname = nickname;
    } else {
      if (lobby.players.length >= 2) {
        throw new Error('Lobby is currently full.');
      }

      const newPlayer: Player = {
        sessionId,
        socketId,
        nickname,
        isConnected: true,
        team: [],
        activePokemonIndex: 0,
        isReady: false
      };
      
      lobby.players.push(newPlayer);
    }

    return await this.lobbyRepo.save(lobby);
  }
}
