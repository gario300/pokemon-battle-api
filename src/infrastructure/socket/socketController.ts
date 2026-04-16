import { Server, Socket } from 'socket.io';
import { LobbyRepository } from '../database/repositories/LobbyRepository';
import { JoinLobbyUseCase } from '../../application/useCases/JoinLobbyUseCase';
import { AssignPokemonUseCase } from '../../application/useCases/AssignPokemonUseCase';
import { SetReadyUseCase } from '../../application/useCases/SetReadyUseCase';
import { AttackUseCase } from '../../application/useCases/AttackUseCase';
import { DisconnectUseCase } from '../../application/useCases/DisconnectUseCase';
import { FinishByTimeoutUseCase } from '../../application/useCases/FinishByTimeoutUseCase';

export const setupSocketControllers = (io: Server) => {
  const lobbyRepo = new LobbyRepository();

  const joinLobby = new JoinLobbyUseCase(lobbyRepo);
  const assignPokemon = new AssignPokemonUseCase(lobbyRepo);
  const setReady = new SetReadyUseCase(lobbyRepo);
  const attack = new AttackUseCase(lobbyRepo);
  const disconnect = new DisconnectUseCase(lobbyRepo);
  const finishByTimeout = new FinishByTimeoutUseCase(lobbyRepo);

  const syncLobbyState = (lobby: any) => {
    io.emit('lobby_status', lobby);
  };

  const finalizeAndResetServer = async (finishedLobby: any) => {
    syncLobbyState(finishedLobby);
    
    try {
      const freshLobby = await lobbyRepo.hardReset();
      syncLobbyState(freshLobby);
    } catch (err) {
    }
  };

  io.on('connection', (socket: Socket) => {
    socket.on('join_lobby', async (data: { sessionId: string, nickname: string }) => {
      try {
        const lobby = await joinLobby.execute(data.sessionId, socket.id, data.nickname);
        syncLobbyState(lobby);
        
        const player = lobby.players.find(p => p.sessionId === data.sessionId);
        if (player && player.team.length > 0 && lobby.status === 'battling') {
          socket.broadcast.emit('opponent_reconnected', { sessionId: data.sessionId });
        }
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('assign_pokemon', async (data: { sessionId: string }) => {
      try {
        await assignPokemon.execute(data.sessionId);
        const lobby = await lobbyRepo.getGlobalLobby();
        syncLobbyState(lobby);
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('reassign_pokemon', async (data: { sessionId: string }) => {
      try {
        await assignPokemon.execute(data.sessionId, true);
        const lobby = await lobbyRepo.getGlobalLobby();
        syncLobbyState(lobby);
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('ready', async (data: { sessionId: string }) => {
      try {
        const lobby = await setReady.execute(data.sessionId);
        syncLobbyState(lobby);
        if (lobby.status === 'battling') {
          io.emit('battle_start', lobby);
        }
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('attack', async (data: { sessionId: string }) => {
      try {
        const result = await attack.execute(data.sessionId);
        if (result.battleOver) {
          await finalizeAndResetServer(result.lobby);
        } else {
          io.emit('turn_result', {
            damage: result.damageDealt,
            defenderHpRemaining: result.defenderHpRemaining,
            defenderFainted: result.defenderFainted,
            newDefenderIndex: result.newDefenderIndex,
            attackerSessionId: data.sessionId,
            lobby: result.lobby
          });
        }
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('turn_timeout', async (data: { sessionId: string }) => {
      try {
        const lobby = await lobbyRepo.getGlobalLobby();
        if (lobby.status === 'battling') {
          const updatedLobby = await finishByTimeout.execute(data.sessionId);
          if (updatedLobby) {
            await finalizeAndResetServer(updatedLobby);
          }
        }
      } catch (err: any) {
      }
    });

    socket.on('disconnect', async () => {
      try {
        const lobby = await disconnect.execute(socket.id);
        if (lobby) {
          if (lobby.players.every(p => !p.isConnected) && (lobby.status === 'battling' || lobby.status === 'ready')) {
            const freshLobby = await lobbyRepo.hardReset();
            syncLobbyState(freshLobby);
          } else {
            syncLobbyState(lobby);
          }
          socket.broadcast.emit('opponent_disconnected', { socketId: socket.id });
        }
      } catch (err) {
      }
    });
  });
};
