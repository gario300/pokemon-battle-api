import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 8080,
  HOST: process.env.HOST || '0.0.0.0',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/pokemon_stadium',
  POKEMON_API_URL: process.env.POKEMON_API_URL || 'https://pokemon-api-92034153384.us-central1.run.app'
};
