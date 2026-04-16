import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler } from './infrastructure/web/middlewares/errorHandler';
import { connectDB } from './infrastructure/database/connection';
import { setupSocketControllers } from './infrastructure/socket/socketController';

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Pokémon Stadium Backend is running' });
});

app.use(errorHandler);

setupSocketControllers(io);

const startServer = async () => {
  await connectDB();
  
  server.listen(Number(config.PORT), config.HOST, () => {
  });
};

startServer();
