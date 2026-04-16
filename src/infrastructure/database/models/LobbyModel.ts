import mongoose, { Schema, Document } from 'mongoose';
import { Lobby, LobbyStatus } from '../../../domain/models/Lobby';
import { Player } from '../../../domain/models/Player';
import { Pokemon } from '../../../domain/models/Pokemon';

const PokemonSchema = new Schema<Pokemon>({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  type: [{ type: String, required: true }],
  stats: {
    hp: { type: Number, required: true },
    attack: { type: Number, required: true },
    defense: { type: Number, required: true },
    speed: { type: Number, required: true },
  },
  currentHp: { type: Number, required: true },
  sprite: { type: String, required: true },
  isDefeated: { type: Boolean, default: false }
}, { _id: false });

const PlayerSchema = new Schema<Player>({
  sessionId: { type: String, required: true },
  socketId: { type: String, required: true },
  nickname: { type: String, required: true },
  isConnected: { type: Boolean, default: true },
  team: [PokemonSchema],
  activePokemonIndex: { type: Number, default: 0 },
  isReady: { type: Boolean, default: false }
}, { _id: false });

const LobbySchema = new Schema<Lobby & Document>({
  status: { type: String, enum: ['waiting', 'ready', 'battling', 'finished'], default: 'waiting' },
  players: [PlayerSchema],
  currentTurnSessionId: { type: String, default: null },
  turnExpiresAt: { type: Date, default: null },
  winnerSessionId: { type: String, default: null },
  isProcessingTurn: { type: Boolean, default: false }
}, { timestamps: true });

export const LobbyModel = mongoose.model<Lobby & Document>('Lobby', LobbySchema);
