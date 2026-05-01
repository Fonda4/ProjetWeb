// src/controllers/games.controller.ts
import { Request, Response, Router } from "express";
import { GamesService } from "../services/games.service";
import { AuthService } from "../services/auth.service";
import { EROLES } from "../models/user.model";
import { EGameStatus } from "../models/games.model";
import { isNumber, isNewGameDTO, isGameDTO } from "../utils/guards"; // Assure-toi d'ajouter ces guards
import { AuthenticatedRequest } from "../models/auth.model";
import { LoggerService } from "../services/logger.service";

export const gamesController = Router();

// GET /games
gamesController.get("/", (req: Request, res: Response) => {
  LoggerService.info("[GamesController] GET /games called");
  const games = GamesService.getAll();
  res.status(200).json(games);
});

// GET /games/:id
gamesController.get("/:id", (req: Request, res: Response) => {
  LoggerService.info(`[GamesController] GET /games/${req.params.id} called`);
  const id = Number(req.params.id);
  if (!isNumber(id)) {
    LoggerService.error("[GamesController] Bad Request: Invalid ID");
    return res.status(400).send("Bad Request: Invalid ID");
  }

  const game = GamesService.getById(id);
  if (!game) {
    LoggerService.error(
      `[GamesController] Not Found: Game ${id} does not exist`,
    );
    return res.status(404).send("Not Found");
  }
  res.status(200).json(game);
});

// POST /games (Referee only)
gamesController.post(
  "/",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info("[GamesController] POST /games called");
    const loggedInUser = req.user;

    if (!loggedInUser) {
      LoggerService.error(
        "[GamesController] Unauthenticated user attempted to create a game",
      );
      return res.status(401).send("Unauthenticated user");
    }

    if (loggedInUser.role !== EROLES.REFEREE) {
      LoggerService.error(
        `[GamesController] Forbidden: User ${loggedInUser.username} is not a referee`,
      );
      return res.status(403).send("Forbidden: Only referees can create games");
    }

    const gameData = req.body;
    if (!isNewGameDTO(gameData)) {
      LoggerService.error(
        "[GamesController] Bad Request: Invalid data for new game",
      );
      return res.status(400).send("Bad Request: Invalid data");
    }

    const newGame = GamesService.create(gameData, loggedInUser.id);
    LoggerService.info(
      `[GamesController] Game created successfully by ${loggedInUser.username}`,
    );
    res.status(201).json(newGame);
  },
);

// PUT /games/:id (Referee only)
gamesController.put(
  "/:id",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info(`[GamesController] PUT /games/${req.params.id} called`);
    const loggedInUser = req.user;

    if (!loggedInUser) return res.status(401).send("Unauthenticated user");

    if (loggedInUser.role !== EROLES.REFEREE) {
      LoggerService.error(
        `[GamesController] Forbidden: User ${loggedInUser.username} is not a referee`,
      );
      return res.status(403).send("Forbidden: Only referees can update games");
    }

    const id = Number(req.params.id);
    const gameData = req.body;

    if (!isNumber(id)) {
      LoggerService.error("[GamesController] Invalid ID provided");
      return res.status(400).send("Invalid ID");
    }
    if (!isGameDTO(gameData)) {
      LoggerService.error("[GamesController] Invalid body data provided");
      return res.status(400).send("Invalid body data");
    }
    if (id !== gameData.id) {
      LoggerService.error("[GamesController] Path ID and Body ID mismatch");
      return res.status(400).send("Path ID and Body ID mismatch");
    }

    const updatedGame = GamesService.update(id, gameData);
    if (updatedGame === undefined) {
      LoggerService.error(`[GamesController] Game ${id} not found`);
      return res.status(404).send("Not Found");
    }
    if (updatedGame === null) {
      LoggerService.error(
        `[GamesController] Cannot update finished/cancelled games or locked fields for game ${id}`,
      );
      return res
        .status(400)
        .send("Cannot update finished/cancelled games or locked fields");
    }

    LoggerService.info(`[GamesController] Game ${id} updated successfully`);
    res.status(200).json(updatedGame);
  },
);

// DELETE /games/:id (Admin only)
gamesController.delete(
  "/:id",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info(
      `[GamesController] DELETE /games/${req.params.id} called`,
    );

    const loggedInUser = req.user;

    // Check authentication
    if (!loggedInUser) {
      LoggerService.error(
        "[GamesController] Unauthenticated user attempted to delete a game",
      );
      return res.status(401).send("Unauthenticated user");
    }

    // Check role (Admin only)
    if (loggedInUser.role !== EROLES.ADMIN) {
      LoggerService.error(
        `[GamesController] Forbidden: User ${loggedInUser.username} is not an admin`,
      );
      return res.status(403).send("Forbidden: Only admins can delete games");
    }

    const id = Number(req.params.id);

    // Guard: Validate ID parameter
    if (!isNumber(id)) {
      LoggerService.error(
        `[GamesController] Invalid ID provided: ${req.params.id}`,
      );
      return res.status(400).send("Invalid ID");
    }

    // Call the service to delete
    const success = GamesService.delete(id);

    // Handle failure (Not Found)
    if (!success) {
      LoggerService.error(
        `[GamesController] Delete failed: Game ${id} not found`,
      );
      return res.status(404).send("Not Found");
    }

    // Happy Path: Success (204 No Content)
    LoggerService.info(
      `[GamesController] Game ${id} successfully deleted by admin ${loggedInUser.username}`,
    );
    res.status(204).send();
  },
);

// PATCH /games/:id/score/:home/:away (Referee only)
gamesController.patch(
  "/:id/score/:home/:away",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info(
      `[GamesController] PATCH score for game ${req.params.id} called`,
    );
    const loggedInUser = req.user;

    if (!loggedInUser) return res.status(401).send("Unauthenticated");
    if (loggedInUser.role !== EROLES.REFEREE) {
      LoggerService.error(
        `[GamesController] Forbidden: User ${loggedInUser.username} tried to change score`,
      );
      return res.status(403).send("Forbidden");
    }

    const id = Number(req.params.id);
    const homeScore = Number(req.params.home);
    const awayScore = Number(req.params.away);

    if (
      !isNumber(id) ||
      !isNumber(homeScore) ||
      !isNumber(awayScore) ||
      homeScore < 0 ||
      awayScore < 0
    ) {
      LoggerService.error(
        "[GamesController] Invalid parameters for score update",
      );
      return res.status(400).send("Invalid parameters");
    }

    const updatedGame = GamesService.setScore(id, homeScore, awayScore);
    if (updatedGame === undefined) {
      LoggerService.error(`[GamesController] Game ${id} not found`);
      return res.status(404).send("Not Found");
    }
    if (updatedGame === null) {
      LoggerService.error(
        `[GamesController] Game ${id} must be in started status to update score`,
      );
      return res.status(400).send("Game must be in started status");
    }

    LoggerService.info(`[GamesController] Score updated for game ${id}`);
    res.status(200).json(updatedGame);
  },
);

// PATCH /games/:id/status/:status (Referee, Trainer, Admin)
gamesController.patch(
  "/:id/status/:status",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info(
      `[GamesController] PATCH status for game ${req.params.id} called`,
    );

    const loggedInUser = req.user;

    // Check authentication
    if (!loggedInUser) {
      LoggerService.error(
        "[GamesController] Unauthenticated user attempted to change game status",
      );
      return res.status(401).send("Unauthenticated");
    }

    // Define allowed roles and check permission
    const allowedRoles = [EROLES.REFEREE, EROLES.TRAINER, EROLES.ADMIN];
    if (!allowedRoles.includes(loggedInUser.role)) {
      LoggerService.error(
        `[GamesController] Forbidden: User ${loggedInUser.username} lacks required role to change status`,
      );
      return res.status(403).send("Forbidden");
    }

    const id = Number(req.params.id);
    const statusParam = req.params.status as EGameStatus;

    // Guard: Validate ID parameter
    if (!isNumber(id)) {
      LoggerService.error(
        `[GamesController] Invalid ID provided: ${req.params.id}`,
      );
      return res.status(400).send("Invalid ID");
    }

    // Guard: Validate that the status in the URL matches the Enum values
    if (!Object.values(EGameStatus).includes(statusParam)) {
      LoggerService.error(
        `[GamesController] Invalid status value provided: ${statusParam}`,
      );
      return res.status(400).send("Invalid status value");
    }

    // Call the service to apply the status transition
    const updatedGame = GamesService.setStatus(id, statusParam);

    // Handle failure: Game not found
    if (updatedGame === undefined) {
      LoggerService.error(
        `[GamesController] Status update failed: Game ${id} not found`,
      );
      return res.status(404).send("Not Found");
    }

    // Handle failure: Invalid transition rule or missing prerequisites
    if (updatedGame === null) {
      LoggerService.error(
        `[GamesController] Invalid status transition or missing prerequisites for game ${id}`,
      );
      return res
        .status(400)
        .send("Invalid status transition or missing prerequisites");
    }

    // Happy Path: Success (200 OK)
    LoggerService.info(
      `[GamesController] Status of game ${id} updated to ${statusParam} by ${loggedInUser.username}`,
    );
    res.status(200).json(updatedGame);
  },
);
