import express, { type Express } from 'express';
import { authController } from './controllers/auth.controller';
import { usersController } from './controllers/users.controller';
import { teamsController } from './controllers/teams.controller';
import { gamesController } from './controllers/games.controller';
import { fieldsController } from './controllers/fields.controller';

export const app : Express = express();

// enabling JSON body parsing for incoming requests
app.use(express.json());

// --- CORS for swagger and development ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin ?? '*');
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// --- registering routes ---
app.use('/auth', authController);
app.use('/users', usersController);
app.use('/teams', teamsController);
app.use('/games', gamesController);
 app.use('/fields', fieldsController);


// Test route to check if the server is running
app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API Games Manager !');
});