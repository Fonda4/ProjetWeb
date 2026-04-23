import e, { Request, Response, Router } from "express";
import { UsersService } from "../services/users.service";
import { isNewUserDTO, isNumber, isString } from "../utils/guards";
import { LoggerService } from "../services/logger.service";
import { isUserLoginDTO, isUserDTO } from "../utils/guards";
import { AuthService } from "../services/auth.service";
import { EROLES } from "../models/user.model";
import { AuthenticatedRequest } from "../models/auth.model";
import { UsersMapper } from "../mappers/users.mapper";

export const usersController = Router();

/**
 * GET /users
 * Retrieves the list of all users
 * Auth: REQUIRED (Any role, but the response differs if admin or not)
 *  */
usersController.get(
  "/",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
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
        lastName: user.lastName,
      });
    }

    res.status(200).json(shortUsers);
  },
);

/**
 * POST /users
 * Create a new user
 * Auth: Not required (This endpoint is used for registration, so it cannot require authentication)
 */
usersController.post("/", (req: Request, res: Response) => {
  const userData = req.body;

  // Strict verification from the body (are all required fields present and valid ?)
  if (!isNewUserDTO(userData)) {
    return res
      .status(400)
      .send("Bad Request: Missing or invalid fields in body");
  }

  if (!UsersService.isValidEmail(userData.email)) {
    // If the service returns 'false', we block the request and notify the client
    return res
      .status(400)
      .send(
        "Bad Request: The email must contain an '@', a '.' and be at least 5 characters long.",
      );
  }

  const existingUser = UsersService.getByEmail(userData.email);

  // If the service returns a user, it means the email is already taken
  if (existingUser) {
    // Block the request and return a 409 (Conflict) error
    return res
      .status(409)
      .send("Conflict: A user with this email already exists.");
  }

  // Call the service to create the user (the service will handle the hashing of the password and the assignment of a default role)
  const newUser = UsersService.create(userData);

  // Code 201 (Created) for a successful creation, and we return the created user (without the password of course)
  res.status(201).json(newUser);
});

/**
 * GET /users/username/:username
 * Retrieves a user by their username (for authentication purposes, not for general use)
 */
usersController.get("/username/:username", (req: Request, res: Response) => {
  const username = req.params.username;

  // 1. Guard : Vérification from the URL parameter (is it a non-empty string ?)
  if (!isString(username) || username.trim() === "") {
    return res.status(401).send("Bad Request: Invalid username");
  }

  // 2. call the service to get the user by their username
  const user = UsersService.getByUsername(username);

  // 3. manage the failure (user not found)
  if (!user) {
    return res.status(404).send("Not Found: User does not exist");
  }

  // 4. Happy Path
  res.status(200).json(user);
});

/**
 * GET /users/email/:email
 * Retrieves a user by their email (for authentication purposes, not for general use)
 */
usersController.get(
  "/email/:email",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== EROLES.ADMIN && req.user!.role !== EROLES.REFEREE) {
      return res.status(403).send("Forbidden: Admins or Referees only");
    }
    const email = req.params.email;

    // 1. Guard : Vérification from the URL parameter (is it a non-empty string )
    if (!isString(email) || email.trim() === "") {
      return res.status(401).send("Bad Request: Invalid email");
    }

    // 2. call the service to get the user by their username
    const user = UsersService.getByEmail(email);

    // 3. manage the failure (user not found)
    if (!user) {
      return res.status(404).send("Not Found: User does not exist");
    }

    // 4. Happy Path
    res.status(200).json(user);
  },
);

/**
 * GET  /users/:id
 * get full users infos
 */
usersController.get(
  "/:id",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).send("Unauthenticated user");
    }
    const id = Number(req.params.id);

    if (!isNumber(id)) return res.status(400).send("Bad Request: Invalid ID");

    const targetUserDBO = UsersService.getById(id);

    if (!targetUserDBO)
      return res.status(404).send("Not Found: User does not exist");
    // if the logged-in user is an admin, we return all the details of the target user
    if (loggedInUser.role === EROLES.ADMIN) {
      return res.status(200).json(UsersMapper.toDTO(targetUserDBO));
    } else if (loggedInUser.id === id) {
      // if the logged-in user is requesting their own data, we return all the details of the target user
      return res.status(200).json(UsersMapper.toShortDTO(targetUserDBO));
    } else {
      return res
        .status(403)
        .send(
          "Forbidden: You are not allowed to access the data of other users",
        );
    }
  },
);

/**
 * DELETE /users/:id
 * delete a user (soft delete by changing their status to INACTIVE)
 */
usersController.delete(
  "/:id",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    // url parameter is always a string, so we need to convert it to a number before using our guard isNumber as seen in class
    const id = Number(req.params.id);

    // 1. Guard : is the ID valid ?
    if (!isNumber(id)) {
      return res.status(400).send("Bad Request: ID must be a number");
    }

    const loggedInUser = req.user;
    const targetUser = UsersService.getById(id);

    if (!loggedInUser) return res.status(401).send("missing or invalid token");
    if (!targetUser) return res.status(401).send("invalid User");

    if (targetUser.role == EROLES.ADMIN) {
      return res
        .status(403)
        .send("Invalid ID or attempt to delete an admin account");
    }

    if (loggedInUser.role !== EROLES.ADMIN && loggedInUser.id !== id) {
      return res.status(403).send("Forbidden: Cannot delete another user");
    }

    // 2. call the service to delete the user (soft delete by changing their status to INACTIVE)
    const isDeleted = UsersService.softDelete(id);

    // 3. manage the failure (user not found or already inactive)
    if (!isDeleted) {
      return res
        .status(404)
        .send("Not Found: User not found or cannot be deleted");
    }

    // 4. Happy Path : Code 204 (No Content) because we don't return any content in the response body when a resource is successfully deleted
    res.status(200).send();
    LoggerService.info("Succes : User has been soft deleted");
  },
);

/**
 * PUT /users/:id
 * Update a profil from a user
 */
usersController.put(
  "/:id",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    const loggedInUser = req.user;
    const id = Number(req.params.id);
    const bodyData = req.body;

    if (!loggedInUser) return res.status(401).send("Missing or invalid token");
    if (!isNumber(id)) return res.status(400).send("Bad Request: Invalid ID");

    //  Guard : Is a user
    if (!isUserDTO(bodyData)) {
      return res.status(400).send("Bad Request: Invalid body data");
    }

    if (id !== bodyData.id) {
      return res.status(400).send("Bad Request: Path ID and Body ID mismatch");
    }
    if (!UsersService.isValidEmail(bodyData.email)) {
      return res.status(400).send("Bad Request: Invalid email format");
    }

    const existingUser = UsersService.getByEmail(bodyData.email);

    // If the service returns a user, it means the email is already taken
    if (existingUser) {
      // Block the request and return a 409 (Conflict) error
      return res
        .status(409)
        .send("Conflict: A user with this email already exists.");
    }

    // auth: Only admin or refeere can see
    if (loggedInUser.role !== EROLES.ADMIN && loggedInUser.id !== id) {
      return res.status(403).send("Forbidden: Cannot update another user");
    }

    // call services
    const updatedUser = UsersService.update(id, bodyData);

    if (!updatedUser) {
      return res.status(404).send("Not Found: User not found or inactive");
    }

    return res.status(200).json(updatedUser);
  },
);

usersController.patch(
  "/:id/role/:role",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    const loggedInUser = req.user;
    const id = Number(req.params.id);
    const newRole = req.params.role as EROLES;

    if (!isNumber(id)) return res.status(400).send("Bad Request: Invalid ID");
    if (!loggedInUser) return res.status(401).send("Missing or Invalid token");
    if (loggedInUser.role == EROLES.ADMIN)
      return res.status(403).send("Unauthorized User");

    const updatedUser = UsersService.changeRole(id, newRole);
    if (updatedUser == null) {
      return res.status(400).send("User can't be a player");
    } else if (updatedUser == undefined) {
      return res.status(404).send("User not found");
    } else {
      return res.status(200).json(updatedUser);
    }
  },
);

usersController.patch(
  "/:id/role/:role",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    const loggedInUser = req.user;
    const id = Number(req.params.id);
    const newRole = req.params.role as EROLES;

    if (!isNumber(id)) return res.status(400).send("Bad Request: Invalid ID");
    if (!loggedInUser) return res.status(401).send("Missing or Invalid token");
    if (loggedInUser.role == EROLES.ADMIN)
      return res.status(403).send("Unauthorized User");

    const updatedUser = UsersService.changeRole(id, newRole);
    if (updatedUser == null) {
      return res.status(400).send("User can't be a player");
    } else if (updatedUser == undefined) {
      return res.status(404).send("User not found");
    } else {
      return res.status(200).json(updatedUser);
    }
  },
);

usersController.patch(
  "/:id/reactivate",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    const loggedInUser = req.user;
    const id = Number(req.params.id);

    if (!isNumber(id)) return res.status(400).send("Bad Request: Invalid ID");
    if (!loggedInUser) return res.status(401).send("Missing or Invalid token");
    if (loggedInUser.role !== EROLES.ADMIN)
      return res.status(403).send("Forbidden: Admin only");

    const isReactivated = UsersService.reactivate(id);
    if (!isReactivated) {
      return res
        .status(404)
        .send(
          "User can't be reactivated : already activated or user not found",
        );
    }

    return res.status(200).json();
  },
);
