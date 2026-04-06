import { Request, Response, Router } from 'express';
import { TeamsService } from '../services/teams.service';
import { AuthService } from '../services/auth.service'; // Ton middleware d'authentification
import { EROLES } from '../models/user.model';
import { isNumber, isNewTeamDTO, isTeamDTO } from '../utils/guards';
import { AuthenticatedRequest } from '../models/auth.model';
import { LoggerService } from '../services/logger.service';

export const teamsController = Router();

/**
 * GET /teams
 * List of all teams (Summary version)
 * Auth: Not required
 */
teamsController.get('/', (req: Request, res: Response) => {
  try {
    const teams = TeamsService.getAll();
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /teams/own
 * List of teams to which the connected user belongs (Complete version)
 * Auth: REQUIRED (Any role)
 */
teamsController.get('/own', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
  try {
    const loggedInUser = req.user; 
    
  if (!loggedInUser) {
      return res.status(401).send("Unauthenticated user");
  }

// We pass the ID of the user logged into our service
    const ownTeams = TeamsService.getOwnTeams(loggedInUser.id);
    
    res.status(200).json(ownTeams);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /teams/:id
 * Retrieve a specific team (Standard version)
 * Auth: Not required
 */
teamsController.get('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!isNumber(id)) return res.status(400).send('Bad Request: Invalid ID');

    const team = TeamsService.getById(id);

    if (!team) return res.status(404).send('Not Found: Team does not exist');

    res.status(200).json(team);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

/**
 * POST /teams
 * Create a new team
 * Auth: REQUIRED (Role 'trainer' only)
 */
teamsController.post('/', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).send("Unauthenticated user");
    }

    const teamData = req.body;

    // 1. Check role (Only a trainer can create a team)
    if (loggedInUser.role !== EROLES.TRAINER) {
      return res.status(403).send('Forbidden: Only trainers can create teams');
    }

    // 2. Validate incoming data
    if (!isNewTeamDTO(teamData)) {
      return res.status(400).send('Bad Request: Invalid team data');
    }

    // 3. Call service (We pass the trainer ID automatically)
    const newTeam = TeamsService.create(teamData, loggedInUser.id);

    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

/**
 * PUT /teams/:id
 * Update a team
 * Auth: REQUIRED (Role 'trainer' only)
 */
teamsController.put('/:id', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).send("Unauthenticated user");
    } 
    
    const id = Number(req.params.id);
    const teamData = req.body;

    if (loggedInUser.role !== EROLES.TRAINER) {
      return res.status(403).send('Forbidden: Only trainers can update teams');
    }

    if (!isNumber(id)) return res.status(400).send('Bad Request: Invalid ID');
    if (!isTeamDTO(teamData)) return res.status(400).send('Bad Request: Invalid body data');
    
// The URL ID must match the Body ID according to the Swagger
    if (id !== teamData.id) {
      return res.status(400).send('Bad Request: Path ID and Body ID mismatch');
    }

    const updatedTeam = TeamsService.update(id, teamData);

    if (!updatedTeam) {
      return res.status(404).send('Not Found: Team does not exist');
    }

    res.status(200).json(updatedTeam);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

/**
 * PATCH /teams/:id/join
 * Join a team
 * Auth: REQUIRED (Any role)
 */
teamsController.patch('/:id/join', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).send("Unauthenticated user");
    }

    const id = Number(req.params.id);

    if (!isNumber(id)) return res.status(400).send('Bad Request: Invalid ID');

// We pass the ID of the user logged into our service and the ID of the team to join
    const updatedTeam = TeamsService.joinTeam(id, loggedInUser.id);

    if (updatedTeam === undefined) return res.status(404).send('Not Found: Team does not exist');
    if (updatedTeam === null) return res.status(400).send('Bad Request: User already in the team');

    res.status(200).json(updatedTeam);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

/**
 * PATCH /teams/:id/leave
 * Leave a team
 * Auth: REQUIRED (Any role)
 */
teamsController.patch('/:id/leave', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).send("Unauthenticated user");
    }

    const id = Number(req.params.id);

    if (!isNumber(id)) return res.status(400).send('Bad Request: Invalid ID');

    const updatedTeam = TeamsService.leaveTeam(id, loggedInUser.id);

    // The swagger indicates a 404 code if the team does not exist OR if the player is not in it
    if (updatedTeam === undefined || updatedTeam === null) {
      return res.status(404).send('Not Found: Team does not exist or user not in team');
    }

    res.status(200).json(updatedTeam);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});