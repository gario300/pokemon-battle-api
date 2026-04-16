import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinishByTimeoutUseCase } from '../../../src/application/useCases/FinishByTimeoutUseCase';
import { LobbyRepository } from '../../../src/infrastructure/database/repositories/LobbyRepository';

describe('FinishByTimeoutUseCase', () => {
  let lobbyRepo: LobbyRepository;
  let useCase: FinishByTimeoutUseCase;

  beforeEach(() => {
    lobbyRepo = {
      getGlobalLobby: vi.fn(),
      save: vi.fn(),
    } as any;
    useCase = new FinishByTimeoutUseCase(lobbyRepo);
  });

  const createMockLobby = (overrides: any = {}) => ({
    status: 'battling',
    currentTurnSessionId: 'player1',
    players: [
      { sessionId: 'player1', nickname: 'Ash', isConnected: true },
      { sessionId: 'player2', nickname: 'Gary', isConnected: true },
    ],
    ...overrides
  });

  it('should grant victory to opponent if both are connected', async () => {
    const lobby = createMockLobby();
    vi.spyOn(lobbyRepo, 'getGlobalLobby').mockResolvedValue(lobby);
    vi.spyOn(lobbyRepo, 'save').mockImplementation(async (l) => l);

    const result = await useCase.execute('player1');

    expect(result?.status).toBe('finished');
    expect(result?.winnerSessionId).toBe('player2');
  });

  it('should grant victory to current player if opponent is disconnected', async () => {
    const lobby = createMockLobby({
      players: [
        { sessionId: 'player1', nickname: 'Ash', isConnected: true },
        { sessionId: 'player2', nickname: 'Gary', isConnected: false },
      ]
    });
    vi.spyOn(lobbyRepo, 'getGlobalLobby').mockResolvedValue(lobby);
    vi.spyOn(lobbyRepo, 'save').mockImplementation(async (l) => l);

    const result = await useCase.execute('player1');

    expect(result?.status).toBe('finished');
    expect(result?.winnerSessionId).toBe('player1'); // Rule: Fair Play - present wins
  });

  it('should grant victory to opponent if current player is disconnected but opponent is connected', async () => {
    const lobby = createMockLobby({
      players: [
        { sessionId: 'player1', nickname: 'Ash', isConnected: false },
        { sessionId: 'player2', nickname: 'Gary', isConnected: true },
      ]
    });
    vi.spyOn(lobbyRepo, 'getGlobalLobby').mockResolvedValue(lobby);
    vi.spyOn(lobbyRepo, 'save').mockImplementation(async (l) => l);

    const result = await useCase.execute('player1');

    expect(result?.status).toBe('finished');
    expect(result?.winnerSessionId).toBe('player2');
  });
});
