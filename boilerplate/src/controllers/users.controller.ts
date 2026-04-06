import e, { Request, Response, Router } from 'express';
import { UsersService } from '../services/users.service';
import { isNewUserDTO, isNumber, isString } from '../utils/guards';
import { LoggerService } from '../services/logger.service';
import { isUserLoginDTO } from '../utils/guards';
import { AuthService } from '../services/auth.service';
import { EROLES } from '../models/user.model';
import { AuthenticatedRequest } from '../models/auth.model';
import { UsersMapper } from '../mappers/users.mapper';

export const usersController = Router();

/**
 * GET /users
 * Retrieves the list of all users
 * Auth: REQUIRED (Any role, but the response differs if admin or not)
 *  */
usersController.get('/', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    const loggedInUser = req.user; 

    if (!loggedInUser) {
      return res.status(401).send("Unauthenticated user");
    }
    const usersDTO = UsersService.getAll();
    
    // if the logged-in user is an admin, we return the complete list with all details
    if (loggedInUser.role === EROLES.ADMIN) {
      return res.status(200).json(usersDTO);
    }
    
    // otherwise, we return only the summary list (without email and username) for security reasons
    const shortUsers = [];
    for (const user of usersDTO) {
      // We only keep the id, firstName and lastName for non-admin users
      shortUsers.push({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName
      });
    }
    
    res.status(200).json(shortUsers);

});

/**
 * GET /users/username/:username
 * Retrieves a user by their username (for authentication purposes, not for general use)
 * Auth: Not required (This endpoint is used by the AuthService during login, so it cannot require authentication itself)
 */
usersController.get('/username/:username', (req: Request, res: Response) => {
    const username = req.params.username;

    // 1. Guard : Vérification from the URL parameter (is it a non-empty string ?)
    if (!isString(username) || username.trim() === '') {
      return res.status(400).send('Bad Request: Invalid username');
    }

    // 2. call the service to get the user by their username
    const user = UsersService.getByUsername(username);

    // 3. manage the failure (user not found)
    if (!user) {
      return res.status(404).send('Not Found: User does not exist');
    }

    // 4. Happy Path
    res.status(200).json(user);

});

/**
 * POST /users
 * Create a new user
 * Auth: Not required (This endpoint is used for registration, so it cannot require authentication)
 */
usersController.post('/', (req: Request, res: Response) => {
    const userData = req.body;

    // 1. Guard : Vérification strict from the body (are all required fields present and valid ?)
    if (!isNewUserDTO(userData)) {
      return res.status(400).send('Bad Request: Missing or invalid fields in body');
    }

    // 2. call the service to create the user (the service will handle the hashing of the password and the assignment of a default role)
    const newUser = UsersService.create(userData);

    // 3. Happy Path : Code 201 (Created) for a successful creation, and we return the created user (without the password of course)
    res.status(201).json(newUser);

});

/**
 * DELETE /users/:id
 * delete a user (soft delete by changing their status to INACTIVE)
 */
usersController.delete('/:id', (req: Request, res: Response) => {
 
    // url parameter is always a string, so we need to convert it to a number before using our guard isNumber as seen in class
    const id = Number(req.params.id);

    // 1. Guard : is the ID valid ?
    if (!isNumber(id)) {
      return res.status(400).send('Bad Request: ID must be a number');
    }

    // 2. call the service to delete the user (soft delete by changing their status to INACTIVE)
    const isDeleted = UsersService.softDelete(id);

    // 3. manage the failure (user not found or already inactive)
    if (!isDeleted) {
      return res.status(404).send('Not Found: User not found or cannot be deleted');
    }

    // 4. Happy Path : Code 204 (No Content) because we don't return any content in the response body when a resource is successfully deleted
    res.status(204).send();

});


usersController.get('/:id', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
 
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).send("Unauthenticated user");
    }
    const id = Number(req.params.id);

    if (!isNumber(id)) return res.status(400).send('Bad Request: Invalid ID');
    
    const targetUserDBO = UsersService.getById(id);

    if (!targetUserDBO) return res.status(404).send('Not Found: User does not exist');
    // if the logged-in user is an admin, we return all the details of the target user
    if (loggedInUser.role === EROLES.ADMIN) {
      return res.status(200).json(UsersMapper.toDTO(targetUserDBO));
    } else if (loggedInUser.id === id) {
      // if the logged-in user is requesting their own data, we return all the details of the target user
      return res.status(200).json(UsersMapper.toFullDTO(targetUserDBO));
    } else {
      return res.status(403).send('Forbidden: You are not allowed to access the data of other users');
    }
  });
  



