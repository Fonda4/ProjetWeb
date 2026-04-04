import { Request, Response, Router } from 'express';
import { UsersService } from '../services/users.service';
import { isNewUserDTO, isNumber, isString } from '../utils/guards';
import { LoggerService } from '../services/logger.service';

export const usersController = Router();

/**
 * GET /users
 * Récupère tous les utilisateurs actifs
 */
usersController.get('/', (req: Request, res: Response) => {
  try {
    // Appel au service (qui nous retourne directement des DTOs)
    const users = UsersService.getAll();
    
    // Happy Path : on renvoie les données avec un code 200 (OK)
    res.status(200).json(users);
  } catch (error) {
    // Si le service lève une erreur (ex: fichier introuvable)
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /users/username/:username
 * Récupère un utilisateur par son nom d'utilisateur
 */
usersController.get('/username/:username', (req: Request, res: Response) => {
  try {
    const username = req.params.username;

    // 1. Guard : Vérification du paramètre
    if (!isString(username) || username.trim() === '') {
      return res.status(400).send('Bad Request: Invalid username');
    }

    // 2. Appel au service
    const user = UsersService.getByUsername(username);

    // 3. Gestion de l'absence de donnée
    if (!user) {
      return res.status(404).send('Not Found: User does not exist');
    }

    // 4. Happy Path
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

/**
 * POST /users
 * Crée un nouvel utilisateur
 */
usersController.post('/', (req: Request, res: Response) => {
  try {
    const userData = req.body;

    // 1. Guard : Vérification stricte du body avec ta fonction isNewUserDTO
    if (!isNewUserDTO(userData)) {
      return res.status(400).send('Bad Request: Missing or invalid fields in body');
    }

    // 2. Appel au service pour la création
    const newUser = UsersService.create(userData);

    // 3. Happy Path : Code 201 (Created) pour une création réussie
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

/**
 * DELETE /users/:id
 * Désactive un utilisateur (Soft Delete)
 */
usersController.delete('/:id', (req: Request, res: Response) => {
  try {
    // Les paramètres d'URL sont toujours des strings, il faut les convertir en nombre
    // pour utiliser notre guard isNumber comme vu au cours
    const id = Number(req.params.id);

    // 1. Guard : L'ID est-il bien un nombre valide ?
    if (!isNumber(id)) {
      return res.status(400).send('Bad Request: ID must be a number');
    }

    // 2. Appel au service
    const isDeleted = UsersService.softDelete(id);

    // 3. Gestion de l'échec (Introuvable, déjà inactif, ou Admin)
    if (!isDeleted) {
      return res.status(404).send('Not Found: User not found or cannot be deleted');
    }

    // 4. Happy Path : Code 204 (No Content) car la suppression a réussi mais on ne renvoie rien
    res.status(204).send();
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});