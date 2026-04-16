export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface Pokemon {
  id: number;
  name: string;
  type: string[];
  stats: PokemonStats;
  currentHp: number;
  sprite: string;
  isDefeated: boolean;
}
