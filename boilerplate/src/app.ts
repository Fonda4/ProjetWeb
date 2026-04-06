import express, { type Express } from 'express';

// 1. On importe nos contrôleurs
import { authController } from './controllers/auth.controller';
import { usersController } from './controllers/users.controller';
import { teamsController } from './controllers/teams.controller';
// Tu pourras décommenter ces lignes quand tu auras créé les fichiers correspondants
// import { fieldsController } from './controllers/fields.controller';
// import { gamesController } from './controllers/games.controller';

export const app : Express = express();

// Permet à Express de lire le format JSON envoyé dans req.body
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

// --- ENREGISTREMENT DES ROUTES ---
app.use('/auth', authController);
app.use('/users', usersController);
app.use('/teams', teamsController);
// app.use('/fields', fieldsController);
// app.use('/games', gamesController);

// Route d'accueil simple pour vérifier que le serveur tourne
app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API Games Manager !');
});