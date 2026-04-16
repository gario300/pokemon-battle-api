import { Pokemon } from './Pokemon';

export interface Player {
  sessionId: string;
  socketId: string;
  nickname: string;
  isConnected: boolean;
  team: Pokemon[];
  activePokemonIndex: number;
  isReady: boolean;
}
