import { Request, Response, Router } from "express";
import { TeamsService } from "../services/teams.service";
import { AuthService } from "../services/auth.service"; 
import { EROLES } from "../models/user.model";
import { isNumber, isNewTeamDTO, isTeamDTO } from "../utils/guards";
import { AuthenticatedRequest } from "../models/auth.model";
import { LoggerService } from "../services/logger.service";

export const teamsController = Router();

/**
 * GET /teams
 * List of all teams (Summary version)
 * Auth: Not required
 */
teamsController.get("/", (req: Request, res: Response) => {
  LoggerService.info("[TeamsController] GET /teams called");
  const teams = TeamsService.getAll();
  res.status(200).json(teams);
});

/**
 * GET /teams/own
 * List of teams to which the connected user belongs (Complete version)
 * Auth: REQUIRED (Any role)
 */
teamsController.get(
  "/own",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info("[TeamsController] GET /teams/own called");
    // 1. Log the incoming request
    LoggerService.info("[TeamsController] GET /teams/own called");

    const loggedInUser = req.user;

    // 2. Guard: Check if the user is properly authenticated
    if (!loggedInUser) {
      LoggerService.error(
        "[TeamsController] Unauthorized: Missing user information",
      );
      return res.status(401).send("Unauthenticated user");
    }

    // 3. Call the service using the logged-in user's ID
    const ownTeams = TeamsService.getOwnTeams(loggedInUser.id);

    // 4. Happy Path: Send the response
    LoggerService.info(
      `[TeamsController] Teams retrieved successfully for user ${loggedInUser.username}`,
    );
    res.status(200).json(ownTeams);
  },
);

/**
 * GET /teams/:id
 * Retrieve a specific team (Standard version)
 * Auth: Not required
 */
teamsController.get("/:id", (req: Request, res: Response) => {
  // 1. Log the incoming request
  LoggerService.info(`[TeamsController] GET /teams/${req.params.id} called`);

  const id = Number(req.params.id);

  // 2. Guard: Check if the ID is a valid number
  if (!isNumber(id)) {
    LoggerService.error(
      `[TeamsController] Bad Request: Invalid ID provided: ${req.params.id}`,
    );
    return res.status(400).send("Bad Request: Invalid ID");
  }

  // 3. Call the service to get the team
  const team = TeamsService.getById(id);

  // 4. Handle failure: Team not found
  if (!team) {
    LoggerService.error(
      `[TeamsController] Not Found: Team ${id} does not exist`,
    );
    return res.status(404).send("Not Found: Team does not exist");
  }

  // 5. Happy Path: Send the response
  LoggerService.info(`[TeamsController] Team ${id} retrieved successfully`);
  res.status(200).json(team);
});

/**
 * POST /teams
 * Create a new team
 * Auth: REQUIRED (Role 'trainer' only)
 */
teamsController.post(
  "/",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info("[TeamsController] POST /teams called");
    const loggedInUser = req.user;

    if (!loggedInUser) return res.status(401).send("Unauthenticated user");

    const teamData = req.body;

    // 1. Check role (Only a trainer can create a team)
    if (loggedInUser.role !== EROLES.TRAINER) {
      LoggerService.error(
        `[TeamsController] Forbidden: User ${loggedInUser.username} is not a trainer`,
      );
      return res.status(403).send("Forbidden: Only trainers can create teams");
    }

    // 2. Validate incoming data
    if (!isNewTeamDTO(teamData)) {
      LoggerService.error("[TeamsController] Bad Request: Invalid team data");
      return res.status(400).send("Bad Request: Invalid team data");
    }

    // 3. Call service
    const newTeam = TeamsService.create(teamData, loggedInUser.id);
    LoggerService.info(
      `[TeamsController] Team created successfully by ${loggedInUser.username}`,
    );
    res.status(201).json(newTeam);
  },
);

/**
 * PUT /teams/:id
 * Update a team
 * Auth: REQUIRED (Role 'trainer' only)
 */
teamsController.put(
  "/:id",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info(`[TeamsController] PUT /teams/${req.params.id} called`);
    const loggedInUser = req.user;

    // Check authentication
    if (!loggedInUser) {
      LoggerService.error(
        "[TeamsController] Unauthenticated user attempted to update a team",
      );
      return res.status(401).send("Unauthenticated user");
    }

    // Check role (Only a trainer can update a team)
    if (loggedInUser.role !== EROLES.TRAINER) {
      LoggerService.error(
        `[TeamsController] Forbidden: User ${loggedInUser.username} is not a trainer`,
      );
      return res.status(403).send("Forbidden: Only trainers can update teams");
    }

    const id = Number(req.params.id);
    const teamData = req.body;

    // Guard: Verify that the ID is a number
    if (!isNumber(id)) {
      LoggerService.error(
        `[TeamsController] Bad Request: Invalid ID provided: ${req.params.id}`,
      );
      return res.status(400).send("Bad Request: Invalid ID");
    }

    // Guard: Verify that the body corresponds to a TeamDTO
    if (!isTeamDTO(teamData)) {
      LoggerService.error("[TeamsController] Bad Request: Invalid body data");
      return res.status(400).send("Bad Request: Invalid body data");
    }

    // Business Rule: The URL ID must match the Body ID
    if (id !== teamData.id) {
      LoggerService.error(
        "[TeamsController] Bad Request: Path ID and Body ID mismatch",
      );
      return res.status(400).send("Bad Request: Path ID and Body ID mismatch");
    }

    // Call the service to update the team
    const updatedTeam = TeamsService.update(id, teamData);

    // Handle failure (Team not found)
    if (!updatedTeam) {
      LoggerService.error(
        `[TeamsController] Not Found: Team ${id} does not exist`,
      );
      return res.status(404).send("Not Found: Team does not exist");
    }

    // Happy Path: Success
    LoggerService.info(
      `[TeamsController] Team ${id} successfully updated by ${loggedInUser.username}`,
    );
    res.status(200).json(updatedTeam);
  },
);

/**
 * PATCH /teams/:id/join
 * Join a team
 * Auth: REQUIRED (Any role)
 */
teamsController.patch(
  "/:id/join",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info(
      `[TeamsController] PATCH /teams/${req.params.id}/join called`,
    );
    const loggedInUser = req.user;

    // Check authentication
    if (!loggedInUser) {
      LoggerService.error(
        "[TeamsController] Unauthenticated user attempted to join a team",
      );
      return res.status(401).send("Unauthenticated user");
    }

    const id = Number(req.params.id);

    // Guard: Verify that the ID is a number
    if (!isNumber(id)) {
      LoggerService.error(
        `[TeamsController] Bad Request: Invalid ID provided: ${req.params.id}`,
      );
      return res.status(400).send("Bad Request: Invalid ID");
    }

    // Call the service using the logged-in user's ID
    const updatedTeam = TeamsService.joinTeam(id, loggedInUser.id);

    // Handle failure: Team not found
    if (updatedTeam === undefined) {
      LoggerService.error(
        `[TeamsController] Not Found: Team ${id} does not exist`,
      );
      return res.status(404).send("Not Found: Team does not exist");
    }

    // Handle failure: User already in the team
    if (updatedTeam === null) {
      LoggerService.error(
        `[TeamsController] Bad Request: User ${loggedInUser.username} is already in team ${id}`,
      );
      return res.status(400).send("Bad Request: User already in the team");
    }

    // Happy Path: Success
    LoggerService.info(
      `[TeamsController] User ${loggedInUser.username} successfully joined team ${id}`,
    );
    res.status(200).json(updatedTeam);
  },
);

/**
 * PATCH /teams/:id/leave
 * Leave a team
 * Auth: REQUIRED (Any role)
 */
teamsController.patch(
  "/:id/leave",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info(
      `[TeamsController] PATCH /teams/${req.params.id}/leave called`,
    );
    const loggedInUser = req.user;

    // Check authentication
    if (!loggedInUser) {
      LoggerService.error(
        "[TeamsController] Unauthenticated user attempted to leave a team",
      );
      return res.status(401).send("Unauthenticated user");
    }

    const id = Number(req.params.id);

    // Guard: Verify that the ID is a number
    if (!isNumber(id)) {
      LoggerService.error(
        `[TeamsController] Bad Request: Invalid ID provided: ${req.params.id}`,
      );
      return res.status(400).send("Bad Request: Invalid ID");
    }

    // Call the service
    const updatedTeam = TeamsService.leaveTeam(id, loggedInUser.id);

    // Handle failure: Team not found OR user not in the team
    if (updatedTeam === undefined || updatedTeam === null) {
      LoggerService.error(
        `[TeamsController] Not Found: Team ${id} does not exist or user ${loggedInUser.username} is not a member`,
      );
      return res
        .status(404)
        .send("Not Found: Team does not exist or user not in team");
    }

    // Happy Path: Success
    LoggerService.info(
      `[TeamsController] User ${loggedInUser.username} successfully left team ${id}`,
    );
    res.status(200).json(updatedTeam);
  },
);
