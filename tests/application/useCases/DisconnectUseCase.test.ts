import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisconnectUseCase } from '../../../src/application/useCases/DisconnectUseCase';
import { LobbyRepository } from '../../../src/infrastructure/database/repositories/LobbyRepository';

describe('DisconnectUseCase', () => {
  let lobbyRepo: LobbyRepository;
  let useCase: DisconnectUseCase;

  beforeEach(() => {
    lobbyRepo = {
      getGlobalLobby: vi.fn(),
      save: vi.fn(),
    } as any;
    useCase = new DisconnectUseCase(lobbyRepo);
  });

  it('should remove player from array and set status to waiting if lobby is NOT in battle', async () => {
    const lobby = {
      status: 'ready',
      players: [
        { socketId: 'sock1', nickname: 'Ash', isReady: true },
        { socketId: 'sock2', nickname: 'Gary', isReady: true },
      ]
    };
    vi.spyOn(lobbyRepo, 'getGlobalLobby').mockResolvedValue(lobby as any);
    vi.spyOn(lobbyRepo, 'save').mockImplementation(async (l) => l);

    const result = await useCase.execute('sock1');

    expect(result?.players.length).toBe(1);
    expect(result?.players[0].socketId).toBe('sock2');
    expect(result?.players[0].isReady).toBe(false); // Should reset ready status
    expect(result?.status).toBe('waiting');
  });

  it('should only mark as isConnected false if lobby IS in battle', async () => {
    const lobby = {
      status: 'battling',
      players: [
        { socketId: 'sock1', nickname: 'Ash', isConnected: true },
        { socketId: 'sock2', nickname: 'Gary', isConnected: true },
      ]
    };
    vi.spyOn(lobbyRepo, 'getGlobalLobby').mockResolvedValue(lobby as any);
    vi.spyOn(lobbyRepo, 'save').mockImplementation(async (l) => l);

    const result = await useCase.execute('sock1');

    expect(result?.players.length).toBe(2);
    expect(result?.players[0].isConnected).toBe(false);
    expect(result?.status).toBe('battling');
  });
});
