import { describe, it, expect } from 'vitest';
import { BattleService } from '../../../src/domain/services/BattleService';
import { Pokemon } from '../../../src/domain/models/Pokemon';
import { Player } from '../../../src/domain/models/Player';

describe('BattleService', () => {
  
  const mockPokemon = (overrides: Partial<Pokemon>): Pokemon => ({
    id: 1,
    name: 'Bulbasaur',
    type: ['Grass'],
    stats: { hp: 45, attack: 49, defense: 49, speed: 45 },
    currentHp: 45,
    sprite: 'url',
    isDefeated: false,
    ...overrides
  });

  const mockPlayer = (id: string, activeSpeed: number): Player => ({
    sessionId: id,
    socketId: 'sock1',
    nickname: 'Ash',
    isConnected: true,
    team: [
      mockPokemon({ stats: { hp: 45, attack: 49, defense: 49, speed: activeSpeed } })
    ],
    activePokemonIndex: 0,
    isReady: true
  });

  describe('determineFirstTurn', () => {
    it('should assign first turn to the pokemon with higher speed', () => {
      const p1 = mockPlayer('session1', 100);
      const p2 = mockPlayer('session2', 50);
      
      const first = BattleService.determineFirstTurn([p1, p2]);
      expect(first.sessionId).toBe('session1');
    });

    it('should assign first turn to player 2 if faster', () => {
      const p1 = mockPlayer('session1', 30);
      const p2 = mockPlayer('session2', 80);
      
      const first = BattleService.determineFirstTurn([p1, p2]);
      expect(first.sessionId).toBe('session2');
    });
  });

  describe('computeDamage', () => {
    it('should calculate standard damage (Atk - Def)', () => {
      const attacker = mockPokemon({ stats: { hp: 45, attack: 100, defense: 49, speed: 45 } });
      const defender = mockPokemon({ stats: { hp: 45, attack: 49, defense: 50, speed: 45 } });
      
      const damage = BattleService.computeDamage(attacker, defender);
      expect(damage).toBe(50); // 100 - 50
    });

    it('should return minimum damage of 1 if defense is higher than attack', () => {
      const attacker = mockPokemon({ stats: { hp: 45, attack: 30, defense: 49, speed: 45 } });
      const defender = mockPokemon({ stats: { hp: 45, attack: 49, defense: 100, speed: 45 } });
      
      const damage = BattleService.computeDamage(attacker, defender);
      expect(damage).toBe(1); 
    });
  });

  describe('applyDamage', () => {
    it('should reduce currentHp but not below 0', () => {
      const defender = mockPokemon({ currentHp: 50 });
      BattleService.applyDamage(defender, 60);
      
      expect(defender.currentHp).toBe(0);
      expect(defender.isDefeated).toBe(true);
    });

    it('should reduce currentHp correctly without fainting', () => {
      const defender = mockPokemon({ currentHp: 50 });
      BattleService.applyDamage(defender, 20);
      
      expect(defender.currentHp).toBe(30);
      expect(defender.isDefeated).toBe(false);
    });
  });

  describe('getNextAvailablePokemonIndex', () => {
    it('should return the index of the first non-defeated pokemon', () => {
      const team = [
        mockPokemon({ isDefeated: true }),
        mockPokemon({ isDefeated: false }),
        mockPokemon({ isDefeated: false }),
      ];

      const idx = BattleService.getNextAvailablePokemonIndex(team);
      expect(idx).toBe(1);
    });

    it('should return -1 if all are defeated', () => {
      const team = [
        mockPokemon({ isDefeated: true }),
        mockPokemon({ isDefeated: true }),
        mockPokemon({ isDefeated: true }),
      ];

      const idx = BattleService.getNextAvailablePokemonIndex(team);
      expect(idx).toBe(-1);
    });
  });
});
