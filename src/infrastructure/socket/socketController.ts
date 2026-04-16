import { Server, Socket } from 'socket.io';
import { LobbyRepository } from '../database/repositories/LobbyRepository';
import { JoinLobbyUseCase } from '../../application/useCases/JoinLobbyUseCase';
import { AssignPokemonUseCase } from '../../application/useCases/AssignPokemonUseCase';
import { SetReadyUseCase } from '../../application/useCases/SetReadyUseCase';
import { AttackUseCase } from '../../application/useCases/AttackUseCase';
import { DisconnectUseCase } from '../../application/useCases/DisconnectUseCase';
import { TimeoutUseCase } from '../../application/useCases/TimeoutUseCase';

const timers: Record<string, NodeJS.Timeout> = {};

export const setupSocketControllers = (io: Server) => {
  const lobbyRepo = new LobbyRepository();

  const joinLobby = new JoinLobbyUseCase(lobbyRepo);
  const assignPokemon = new AssignPokemonUseCase(lobbyRepo);
  const setReady = new SetReadyUseCase(lobbyRepo);
  const attack = new AttackUseCase(lobbyRepo);
  const disconnect = new DisconnectUseCase(lobbyRepo);
  const timeout = new TimeoutUseCase(lobbyRepo);

  const startTurnTimer = (sessionId: string, lobbyId: string) => {
    if (timers[lobbyId]) clearTimeout(timers[lobbyId]);
    
    timers[lobbyId] = setTimeout(async () => {
      try {
        const updatedLobby = await timeout.execute(sessionId);
        if (updatedLobby) {
          io.emit('lobby_status', updatedLobby);
          io.emit('battle_end', { winnerSessionId: updatedLobby.winnerSessionId, reason: 'timeout' });
        }
      } catch (err) {
        console.error('Error on turn timeout', err);
      }
    }, 120000);
  };

  io.on('connection', (socket: Socket) => {
    socket.on('join_lobby', async (data: { sessionId: string, nickname: string }) => {
      try {
        const lobby = await joinLobby.execute(data.sessionId, socket.id, data.nickname);
        io.emit('lobby_status', lobby);
        
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
        const team = await assignPokemon.execute(data.sessionId);
        const lobby = await lobbyRepo.getGlobalLobby();
        io.emit('lobby_status', lobby);
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('ready', async (data: { sessionId: string }) => {
      try {
        const lobby = await setReady.execute(data.sessionId);
        io.emit('lobby_status', lobby);

        if (lobby.status === 'battling') {
          io.emit('battle_start', lobby);
          startTurnTimer(lobby.currentTurnSessionId!, lobby._id!.toString());
        }
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('attack', async (data: { sessionId: string }) => {
      try {
        const lobbyBefore = await lobbyRepo.getGlobalLobby();
        
        const result = await attack.execute(data.sessionId);

        if (timers[lobbyBefore._id!.toString()]) {
          clearTimeout(timers[lobbyBefore._id!.toString()]);
        }

        io.emit('turn_result', {
          damage: result.damageDealt,
          defenderHpRemaining: result.defenderHpRemaining,
          defenderFainted: result.defenderFainted,
          newDefenderIndex: result.newDefenderIndex,
          attackerSessionId: data.sessionId,
          lobby: result.lobby
        });

        if (result.battleOver) {
          io.emit('battle_end', { winnerSessionId: result.winnerSessionId, reason: 'fainted' });
        } else {
          startTurnTimer(result.lobby.currentTurnSessionId!, result.lobby._id!.toString());
        }

      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', async () => {
      try {
        const lobby = await disconnect.execute(socket.id);
        if (lobby) {
          io.emit('lobby_status', lobby);
          socket.broadcast.emit('opponent_disconnected', { socketId: socket.id });
        }
      } catch (err) {
        console.error('Error on disconnect:', err);
      }
    });
  });
};
