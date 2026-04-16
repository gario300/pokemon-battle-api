import { Lobby } from '../../../domain/models/Lobby';
import { LobbyModel } from '../models/LobbyModel';

export class LobbyRepository {
  /**
   * We assume there's only ONE global lobby for this challenge.
   * If it doesn't exist, we create it.
   */
  async getGlobalLobby(): Promise<Lobby> {
    let lobby = await LobbyModel.findOne();
    if (!lobby) {
      lobby = await LobbyModel.create({
        status: 'waiting',
        players: [],
        currentTurnSessionId: null,
        turnExpiresAt: null,
        winnerSessionId: null,
        isProcessingTurn: false
      });
    }
    return lobby.toObject();
  }

  async save(lobby: Lobby): Promise<Lobby> {
    let updatedLobby;
    if (lobby._id) {
      updatedLobby = await LobbyModel.findByIdAndUpdate(lobby._id, lobby, { new: true });
    } else {
      updatedLobby = await LobbyModel.create(lobby);
    }
    if (!updatedLobby) throw new Error('Could not save lobby');
    return updatedLobby.toObject();
  }

  async findBySessionId(sessionId: string): Promise<Lobby | null> {
    const lobby = await LobbyModel.findOne({ 'players.sessionId': sessionId });
    return lobby ? lobby.toObject() : null;
  }
}
