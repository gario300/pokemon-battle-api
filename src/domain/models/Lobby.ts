import { Player } from './Player';

export type LobbyStatus = 'waiting' | 'ready' | 'battling' | 'finished';

export interface Lobby {
  _id?: string;
  status: LobbyStatus;
  players: Player[];
  currentTurnSessionId: string | null;
  turnExpiresAt: Date | null;
  winnerSessionId: string | null;
  isProcessingTurn: boolean;
}
