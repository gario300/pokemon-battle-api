import { Lobby } from '../../../domain/models/Lobby';
import { LobbyModel } from '../models/LobbyModel';

export class LobbyRepository {
  async getGlobalLobby(): Promise<Lobby> {
    const lobbies = await LobbyModel.find();
    
    // Hard reset if more than one lobby or if it's in a 'finished' state
    if (lobbies.length > 1 || (lobbies[0] && lobbies[0].status === 'finished')) {
      console.log("Inconsistent lobby state detected. Wiping database.");
      await LobbyModel.deleteMany({});
      return this.createFreshLobby();
    }

    if (lobbies.length === 0) {
      return this.createFreshLobby();
    }
    
    return lobbies[0].toObject();
  }

  private async createFreshLobby(): Promise<Lobby> {
    const newLobby = await LobbyModel.create({
      status: 'waiting',
      players: [],
      currentTurnSessionId: null,
      turnExpiresAt: null,
      winnerSessionId: null,
      isProcessingTurn: false
    });
    return newLobby.toObject();
  }

  async save(lobby: Lobby): Promise<Lobby> {
    // Upsert to ensure we only have one document
    const updatedLobby = await LobbyModel.findOneAndUpdate({}, lobby, { new: true, upsert: true });
    if (!updatedLobby) throw new Error('Could not save lobby');
    return updatedLobby.toObject();
  }

  async hardReset(): Promise<Lobby> {
    await LobbyModel.deleteMany({});
    return await this.getGlobalLobby();
  }

  async findBySessionId(sessionId: string): Promise<Lobby | null> {
    const lobby = await LobbyModel.findOne({ 'players.sessionId': sessionId });
    return lobby ? lobby.toObject() : null;
  }
}
