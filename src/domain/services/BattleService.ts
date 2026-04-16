import { Player } from '../models/Player';
import { Pokemon } from '../models/Pokemon';

export class BattleService {
  static determineFirstTurn(players: Player[]): Player {
    if (players.length !== 2) throw new Error('Battle requires 2 players');
    
    const p1Pokemon = players[0].team[players[0].activePokemonIndex];
    const p2Pokemon = players[1].team[players[1].activePokemonIndex];

    if (p1Pokemon.stats.speed > p2Pokemon.stats.speed) {
      return players[0];
    } else if (p2Pokemon.stats.speed > p1Pokemon.stats.speed) {
      return players[1];
    } else {
      return Math.random() > 0.5 ? players[0] : players[1];
    }
  }

  static computeDamage(attacker: Pokemon, defender: Pokemon): number {
    const damage = attacker.stats.attack - defender.stats.defense;
    return Math.max(1, damage);
  }

  static applyDamage(defender: Pokemon, damage: number): void {
    defender.currentHp = Math.max(0, defender.currentHp - damage);
    if (defender.currentHp === 0) {
      defender.isDefeated = true;
    }
  }

  static getNextAvailablePokemonIndex(team: Pokemon[]): number {
    return team.findIndex(p => !p.isDefeated);
  }
}
