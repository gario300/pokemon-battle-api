import { config } from '../../config/env';
import { AppError } from '../../infrastructure/web/middlewares/errorHandler';

export interface ApiPokemonBase {
  id: number;
  name: string;
}

export interface ApiPokemonDetail extends ApiPokemonBase {
  type: string[];
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  sprite: string;
}

export class PokemonClient {
  private static baseUrl = config.POKEMON_API_URL;

  static async getPokemonList(): Promise<ApiPokemonBase[]> {
    try {
      const response = await fetch(`${this.baseUrl}/list`);
      if (!response.ok) {
        throw new AppError(`Failed to fetch Pokemon list: ${response.statusText}`, 502);
      }
      const json = await response.json() as { data: ApiPokemonBase[] };
      return json.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error connecting to Pokemon API', 502);
    }
  }

  static async getPokemonDetail(id: number): Promise<ApiPokemonDetail> {
    try {
      const response = await fetch(`${this.baseUrl}/list/${id}`);
      if (!response.ok) {
        throw new AppError(`Failed to fetch Pokemon detail for ID ${id}`, 502);
      }
      const json = await response.json() as { data: ApiPokemonDetail | ApiPokemonDetail[] };
      const data = json.data;
      
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error connecting to Pokemon API', 502);
    }
  }
}
