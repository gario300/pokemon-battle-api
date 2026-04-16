import { LobbyRepository } from '../../infrastructure/database/repositories/LobbyRepository';
import { PokemonClient } from '../../infrastructure/external/PokemonClient';
import { Pokemon } from '../../domain/models/Pokemon';

export class AssignPokemonUseCase {
  constructor(private lobbyRepo: LobbyRepository) {}

  async execute(sessionId: string): Promise<Pokemon[]> {
    let lobby = await this.lobbyRepo.getGlobalLobby();
    
    const playerIndex = lobby.players.findIndex(p => p.sessionId === sessionId);
    if (playerIndex === -1) throw new Error('Player not found in lobby');
    
    if (lobby.players[playerIndex].team.length > 0) {
      return lobby.players[playerIndex].team;
    }

    const opponentIndex = playerIndex === 0 ? 1 : 0;
    const opponentTeam = lobby.players[opponentIndex]?.team || [];
    const opponentIds = opponentTeam.map(p => p.id);

    const allPokemons = await PokemonClient.getPokemonList();
    
    const availablePokemons = allPokemons.filter(p => !opponentIds.includes(p.id));

    if (availablePokemons.length < 3) {
      throw new Error('Not enough unique Pokemons available to assign');
    }

    const pickedIds = new Set<number>();
    while (pickedIds.size < 3) {
      const randomIndex = Math.floor(Math.random() * availablePokemons.length);
      pickedIds.add(availablePokemons[randomIndex].id);
    }

    const team: Pokemon[] = [];
    for (const id of pickedIds) {
      const details = await PokemonClient.getPokemonDetail(id);
      team.push({
        id: details.id,
        name: details.name,
        type: details.type,
        stats: {
          hp: details.hp,
          attack: details.attack,
          defense: details.defense,
          speed: details.speed
        },
        currentHp: details.hp,
        sprite: details.sprite,
        isDefeated: false
      });
    }

    lobby.players[playerIndex].team = team;
    lobby.players[playerIndex].activePokemonIndex = 0;
    
    await this.lobbyRepo.save(lobby);

    return team;
  }
}
