// src/controllers/games.controller.ts
import { Request, Response, Router } from 'express';
import { GamesService } from '../services/games.service';
import { AuthService } from '../services/auth.service';
import { EROLES } from '../models/user.model';
import { EGameStatus } from '../models/games.model';
import { isNumber, isNewGameDTO, isGameDTO } from '../utils/guards'; // Assure-toi d'ajouter ces guards
import { AuthenticatedRequest } from '../models/auth.model';

export const gamesController = Router();

// GET /games
gamesController.get('/', (req: Request, res: Response) => {
    const games = GamesService.getAll();
    res.status(200).json(games);
});

// GET /games/:id
gamesController.get('/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send('Bad Request: Invalid ID');

    const game = GamesService.getById(id);
    if (!game) return res.status(404).send('Not Found');

    res.status(200).json(game);
});

// POST /games (Referee only)
gamesController.post('/', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    const loggedInUser = req.user;
    if (!loggedInUser) return res.status(401).send("Unauthenticated user");

    if (loggedInUser.role !== EROLES.REFEREE) {
      return res.status(403).send('Forbidden: Only referees can create games');
    }

    const gameData = req.body;
    if (!isNewGameDTO(gameData)) return res.status(400).send('Bad Request: Invalid data');

    const newGame = GamesService.create(gameData, loggedInUser.id);
    res.status(201).json(newGame);
});

// PUT /games/:id (Referee only)
gamesController.put('/:id', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    const loggedInUser = req.user;
    if (!loggedInUser) return res.status(401).send("Unauthenticated user");
    
    if (loggedInUser.role !== EROLES.REFEREE) {
      return res.status(403).send('Forbidden: Only referees can update games');
    }

    const id = Number(req.params.id);
    const gameData = req.body;

    if (!isNumber(id)) return res.status(400).send('Invalid ID');
    if (!isGameDTO(gameData)) return res.status(400).send('Invalid body data');
    if (id !== gameData.id) return res.status(400).send('Path ID and Body ID mismatch');

    const updatedGame = GamesService.update(id, gameData);

    if (updatedGame === undefined) return res.status(404).send('Not Found');
    if (updatedGame === null) return res.status(400).send('Cannot update finished/cancelled games or locked fields');

    res.status(200).json(updatedGame);
});

// DELETE /games/:id (Admin only)
gamesController.delete('/:id', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    const loggedInUser = req.user;
    if (!loggedInUser) return res.status(401).send("Unauthenticated user");

    if (loggedInUser.role !== EROLES.ADMIN) {
      return res.status(403).send('Forbidden: Only admins can delete games');
    }

    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send('Invalid ID');

    const success = GamesService.delete(id);
    if (!success) return res.status(404).send('Not Found');

    res.status(204).send();
});

// PATCH /games/:id/score/:home/:away (Referee only)
gamesController.patch('/:id/score/:home/:away', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    const loggedInUser = req.user;
    if (!loggedInUser) return res.status(401).send("Unauthenticated");

    if (loggedInUser.role !== EROLES.REFEREE) return res.status(403).send('Forbidden');

    const id = Number(req.params.id);
    const homeScore = Number(req.params.home);
    const awayScore = Number(req.params.away);

    if (!isNumber(id) || !isNumber(homeScore) || !isNumber(awayScore) || homeScore < 0 || awayScore < 0) {
        return res.status(400).send('Invalid parameters');
    }

    const updatedGame = GamesService.setScore(id, homeScore, awayScore);
    
    if (updatedGame === undefined) return res.status(404).send('Not Found');
    if (updatedGame === null) return res.status(400).send('Game must be in started status');

    res.status(200).json(updatedGame);
});

// PATCH /games/:id/status/:status (Referee, Trainer, Admin)
gamesController.patch('/:id/status/:status', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    const loggedInUser = req.user;
    if (!loggedInUser) return res.status(401).send("Unauthenticated");

    const allowedRoles = [EROLES.REFEREE, EROLES.TRAINER, EROLES.ADMIN];
    if (!allowedRoles.includes(loggedInUser.role)) {
      return res.status(403).send('Forbidden');
    }

    const id = Number(req.params.id);
    const statusParam = req.params.status as EGameStatus;

    if (!isNumber(id)) return res.status(400).send('Invalid ID');

    // Vérifier si la valeur de l'URL correspond à une valeur de l'Enumération
    if (!Object.values(EGameStatus).includes(statusParam)) {
        return res.status(400).send('Invalid status value');
    }

    const updatedGame = GamesService.setStatus(id, statusParam);

    if (updatedGame === undefined) return res.status(404).send('Not Found');
    if (updatedGame === null) return res.status(400).send('Invalid status transition or missing prerequisites');

    res.status(200).json(updatedGame);
});