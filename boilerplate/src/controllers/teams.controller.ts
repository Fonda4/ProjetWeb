import { Request, Response, Router } from 'express';
import { TeamsService } from '../services/teams.service';
import { AuthService } from '../services/auth.service'; // Ton middleware d'authentification
import { EROLES } from '../models/user.model';
import { isNumber, isNewTeamDTO, isTeamDTO } from '../utils/guards';

export const teamsController = Router();

/**
 * GET /teams
 * Liste de toutes les équipes (Version résumée)
 * Auth: NON REQUISE
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
 * Liste des équipes auxquelles l'utilisateur connecté appartient (Version complète)
 * Auth: REQUISE (N'importe quel rôle)
 * * ⚠️ ATTENTION PÉDAGOGIQUE : Cette route DOIT être placée AVANT `GET /teams/:id`.
 * Sinon, Express va croire que "own" est un paramètre `:id` !
 */
teamsController.get('/own', AuthService.authorize, (req: Request, res: Response) => {
  try {
    const loggedInUser = (req as any).user; // Récupéré grâce au middleware
    
    // On passe l'ID de l'utilisateur connecté à notre service
    const ownTeams = TeamsService.getOwnTeams(loggedInUser.id);
    
    res.status(200).json(ownTeams);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /teams/:id
 * Récupère une équipe spécifique (Version standard)
 * Auth: NON REQUISE
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
 * Créer une nouvelle équipe
 * Auth: REQUISE (Rôle 'trainer' uniquement)
 */
teamsController.post('/', AuthService.authorize, (req: Request, res: Response) => {
  try {
    const loggedInUser = (req as any).user;
    const teamData = req.body;

    // 1. Vérification du rôle (Seul un trainer peut créer une équipe)
    if (loggedInUser.role !== EROLES.TRAINER) {
      return res.status(403).send('Forbidden: Only trainers can create teams');
    }

    // 2. Validation des données entrantes
    if (!isNewTeamDTO(teamData)) {
      return res.status(400).send('Bad Request: Invalid team data');
    }

    // 3. Appel au service (On passe l'ID du trainer automatiquement)
    const newTeam = TeamsService.create(teamData, loggedInUser.id);

    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

/**
 * PUT /teams/:id
 * Mettre à jour une équipe
 * Auth: REQUISE (Rôle 'trainer' uniquement)
 */
teamsController.put('/:id', AuthService.authorize, (req: Request, res: Response) => {
  try {
    const loggedInUser = (req as any).user;
    const id = Number(req.params.id);
    const teamData = req.body;

    if (loggedInUser.role !== EROLES.TRAINER) {
      return res.status(403).send('Forbidden: Only trainers can update teams');
    }

    if (!isNumber(id)) return res.status(400).send('Bad Request: Invalid ID');
    if (!isTeamDTO(teamData)) return res.status(400).send('Bad Request: Invalid body data');
    
    // L'ID de l'URL doit correspondre à l'ID du Body selon le Swagger
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
 * Rejoindre une équipe
 * Auth: REQUISE (N'importe quel rôle)
 */
teamsController.patch('/:id/join', AuthService.authorize, (req: Request, res: Response) => {
  try {
    const loggedInUser = (req as any).user;
    const id = Number(req.params.id);

    if (!isNumber(id)) return res.status(400).send('Bad Request: Invalid ID');

    // On n'a pas besoin du body, on utilise l'ID de l'utilisateur connecté
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
 * Quitter une équipe
 * Auth: REQUISE (N'importe quel rôle)
 */
teamsController.patch('/:id/leave', AuthService.authorize, (req: Request, res: Response) => {
  try {
    const loggedInUser = (req as any).user;
    const id = Number(req.params.id);

    if (!isNumber(id)) return res.status(400).send('Bad Request: Invalid ID');

    const updatedTeam = TeamsService.leaveTeam(id, loggedInUser.id);

    // Le swagger indique un code 404 si l'équipe n'existe pas OU si le joueur n'y est pas
    if (updatedTeam === undefined || updatedTeam === null) {
      return res.status(404).send('Not Found: Team does not exist or user not in team');
    }

    res.status(200).json(updatedTeam);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});