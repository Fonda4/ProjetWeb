import e, { Request, Response, Router } from "express";
import { UsersService } from "../services/users.service";
import { isNewUserDTO, isNumber, isString } from "../utils/guards";
import { LoggerService } from "../services/logger.service";
import { isUserLoginDTO, isUserDTO } from "../utils/guards";
import { AuthService } from "../services/auth.service";
import { EROLES, UserShortDTO } from "../models/user.model";
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
    LoggerService.info("[UsersController] GET /users called");
    const loggedInUser = req.user;

    if (!loggedInUser) {
      LoggerService.error(
        "[UsersController] Unauthorized: Unauthenticated user access attempt",
      );
      return res.status(401).send("Missing or invalid token");
    }

    const usersDTO = UsersService.getAll();

    // If the logged-in user is an admin, return the complete list
    if (loggedInUser.role === EROLES.ADMIN) {
      LoggerService.info(
        `[UsersController] Admin ${loggedInUser.username} retrieved the full users list`,
      );
      return res.status(200).json(usersDTO);
    }

    // Otherwise, return only the summary list for security reasons
    const shortUsers: UserShortDTO[] = [];

    for (const user of usersDTO) {
      // Explicitly typing the object as UserShortDTO to enforce the API contract
      const shortUser: UserShortDTO = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      shortUsers.push(shortUser);
    }

    LoggerService.info(
      `[UsersController] User ${loggedInUser.username} retrieved the short users list`,
    );
    res.status(200).json(shortUsers);
  },
);

/**
 * POST /users
 * Create a new user
 * Auth: Not required (This endpoint is used for registration, so it cannot require authentication)
 */
usersController.post("/", (req: Request, res: Response) => {
  LoggerService.info("[UsersController] POST /users called");
  const userData = req.body;

  // Guard: Strict verification from the body
  if (!isNewUserDTO(userData)) {
    LoggerService.error(
      "[UsersController] Bad Request: Missing or invalid fields in body"
    );
    return res.status(400).send("Invalid or missing fields");
  }

  // Business Rule: Email format validation
  if (!UsersService.isValidEmail(userData.email)) {
    LoggerService.error(
      `[UsersController] Bad Request: Invalid email format provided (${userData.email})`,
    );
    return res
      .status(400)
      .send(
        "Bad Request: The email must contain an '@', a '.' and be at least 5 characters long.",
      );
  }

  // Business Rule: Check for email uniqueness
  const existingUser = UsersService.getByEmail(userData.email);
  if (existingUser) {
    LoggerService.error(
      `[UsersController] Conflict: A user with email ${userData.email} already exists`,
    );
    return res
      .status(409)
      .send("Conflict: A user with this email already exists.");
  }

  // Happy Path: Call the service to create the user
  const newUser = UsersService.create(userData);
  LoggerService.info(
    `[UsersController] User ${newUser?.username} successfully created`,
  );
  res.status(201).json(newUser);
});

/**
 * GET /users/username/:username
 * Retrieves a user by their username (for authentication purposes, not for general use)
 */
usersController.get("/username/:username", (req: Request, res: Response) => {
  // 1. Log the incoming request
  LoggerService.info(
    `[UsersController] GET /users/username/${req.params.username} called`,
  );
  const username = req.params.username;

  // 2. Guard: Check from the URL parameter (is it a non-empty string?)
  if (!isString(username) || username.trim() === "") {
    LoggerService.error(
      "[UsersController] Bad Request: Invalid username parameter",
    );
    return res
      .status(401)
      .send("Missing or invalid token, or caller is not admin/referee");
  }

  // 3. Call the service to get the user by their username
  const user = UsersService.getByUsername(username);

  // 4. Handle failure: User not found
  if (!user) {
    LoggerService.error(
      `[UsersController] Not Found: User with username '${username}' does not exist`,
    );
    return res.status(404).send("User not found");
  }

  // 5. Happy Path: Success
  LoggerService.info(
    `[UsersController] User '${username}' successfully retrieved`,
  );
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
    // 1. Log the incoming request
    LoggerService.info(
      `[UsersController] GET /users/email/${req.params.email} called`,
    );

    // 2. Check permissions
    if (req.user!.role !== EROLES.ADMIN && req.user!.role !== EROLES.REFEREE) {
      LoggerService.error(
        `[UsersController] Forbidden: User ${req.user!.username} is not Admin or Referee`,
      );
      return res.status(403).send("Forbidden: Admins or Referees only");
    }

    const email = req.params.email;

    // 3. Guard: Check from the URL parameter
    if (!isString(email) || email.trim() === "") {
      LoggerService.error(
        "[UsersController] Bad Request: Invalid email parameter",
      );
      return res
        .status(401)
        .send("Missing or invalid token, or caller is not admin/referee");
    }

    // 4. Call the service
    const user = UsersService.getByEmail(email);

    // 5. Handle failure: User not found
    if (!user) {
      LoggerService.error(
        `[UsersController] Not Found: User with email '${email}' does not exist`,
      );
      return res.status(404).send("User not found");
    }

    // 6. Happy Path: Success
    LoggerService.info(
      `[UsersController] User with email '${email}' successfully retrieved`,
    );
    res.status(200).json(user);
  },
);

/**
 * GET /users/:id
 * Get user infos (Full for Admin/Self, Short for others)
 * Auth: REQUIRED
 */
usersController.get(
  "/:id",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    // 1. Log the incoming request
    LoggerService.info(`[UsersController] GET /users/${req.params.id} called`);

    const loggedInUser = req.user;

    // 2. Guard: Check authentication
    if (!loggedInUser) {
      LoggerService.error(
        "[UsersController] Unauthorized: Unauthenticated user",
      );
      return res.status(401).send("Missing or invalid token");
    }

    const id = Number(req.params.id);

    // 3. Guard: Check if the ID is a valid number
    if (!isNumber(id)) {
      LoggerService.error(
        `[UsersController] Bad Request: Invalid ID provided (${req.params.id})`,
      );
      return res.status(400).send("ID is not a valid number");
    }

    // 4. Call service to get the target user
    const targetUserDBO = UsersService.getById(id);

    // 5. Handle failure: User not found
    if (!targetUserDBO) {
      LoggerService.error(
        `[UsersController] Not Found: User ${id} does not exist`,
      );
      return res.status(404).send("User not found");
    }

// 6. Business Logic & Happy Path
    
    if (loggedInUser.role === EROLES.ADMIN) {
      LoggerService.info(
        `[UsersController] Admin ${loggedInUser.username} retrieved full data for user ${id}`,
      );
      return res.status(200).json(UsersMapper.toDTO(targetUserDBO));
      
    } else if (loggedInUser.id === id) {
      LoggerService.info(
        `[UsersController] User ${loggedInUser.username} retrieved their own short profile`,
      );
      return res.status(200).json(UsersMapper.toShortDTO(targetUserDBO));
      
    } else {
      LoggerService.error(
        `[UsersController] Forbidden: ${loggedInUser.username} tried to access user ${id}'s profile`,
      );
      return res.status(403).send("Non-admin caller tried to view another user's profile");
    }
  },
);

/**
 * DELETE /users/:id
 * Soft delete a user by changing their status to INACTIVE
 * Auth: REQUIRED
 */
usersController.delete(
  "/:id",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info(
      `[UsersController] DELETE /users/${req.params.id} called`,
    );
    const id = Number(req.params.id);

    // Guard: is the ID valid?
    if (!isNumber(id)) {
      LoggerService.error("[UsersController] Bad Request: ID must be a number");
      return res.status(400).send("Bad Request: ID must be a number");
    }

    const loggedInUser = req.user;
    if (!loggedInUser) {
      LoggerService.error(
        "[UsersController] Unauthorized: Missing or invalid token",
      );
      return res.status(401).send("Missing or invalid token");
    }

    const targetUser = UsersService.getById(id);
    if (!targetUser) {
      LoggerService.error(
        `[UsersController] Unauthorized: Target user ${id} is invalid or does not exist`,
      );
      return res.status(401).send("Invalid User");
    }

    if (targetUser.role == EROLES.ADMIN) {
      LoggerService.error(
        `[UsersController] Forbidden: Attempt to delete an admin account (ID: ${id})`,
      );
      return res
        .status(403)
        .send("Invalid ID or attempt to delete an admin account");
    }

    if (loggedInUser.role !== EROLES.ADMIN && loggedInUser.id !== id) {
      LoggerService.error(
        `[UsersController] Forbidden: User ${loggedInUser.username} cannot delete another user`,
      );
      return res.status(403).send("Forbidden: Cannot delete another user");
    }

    // Call the service to soft delete
    const isDeleted = UsersService.softDelete(id);

    if (!isDeleted) {
      LoggerService.error(
        `[UsersController] Not Found: User ${id} not found or cannot be deleted`,
      );
      return res
        .status(404)
        .send("Not Found: User not found or cannot be deleted");
    }

    // Happy Path
    LoggerService.info(
      `[UsersController] Success: User ${id} has been soft deleted by ${loggedInUser.username}`,
    );
    res.status(200).send();
  },
);

/**
 * PUT /users/:id
 * Update a profile
 * Auth: REQUIRED
 */
usersController.put(
  "/:id",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info(`[UsersController] PUT /users/${req.params.id} called`);
    const loggedInUser = req.user;
    const id = Number(req.params.id);
    const bodyData = req.body;

    if (!loggedInUser) {
      LoggerService.error(
        "[UsersController] Unauthorized: Missing or invalid token",
      );
      return res.status(401).send("Missing or invalid token");
    }

    if (!isNumber(id)) {
      LoggerService.error(
        `[UsersController] Bad Request: Invalid ID (${req.params.id})`,
      );
      return res.status(400).send("Invalid payload (including body/path ID mismatch)");
    }

    if (!isUserDTO(bodyData)) {
      LoggerService.error("[UsersController] Bad Request: Invalid body data");
      return res.status(400).send("Invalid payload (including body)");
    }

    if (id !== bodyData.id) {
      LoggerService.error(
        "[UsersController] Bad Request: Path ID and Body ID mismatch",
      );
      return res.status(400).send("Invalid payload (path ID mismatch)");
    }

    if (!UsersService.isValidEmail(bodyData.email)) {
      LoggerService.error(
        `[UsersController] Bad Request: Invalid email format (${bodyData.email})`,
      );
      return res.status(400).send("Invalid payload (including body)");
    }

    // Business Rule: Check for email uniqueness (excluding self)
    const existingUser = UsersService.getByEmail(bodyData.email);
    if (existingUser && existingUser.id !== id) {
      LoggerService.error(
        `[UsersController] Conflict: Email ${bodyData.email} already exists`,
      );
      return res
        .status(409)
        .send("Conflict: A user with this email already exists.");
    }

    // Auth: Only admin or the user themselves can update
    if (loggedInUser.role !== EROLES.ADMIN && loggedInUser.id !== id) {
      LoggerService.error(
        `[UsersController] Forbidden: User ${loggedInUser.username} tried to update user ${id}`,
      );
      return res.status(403).send("Authenticated user is not an admin and tries to update another user");
    }

    // Happy Path: call services
    const updatedUser = UsersService.update(id, bodyData);
    if (!updatedUser) {
      LoggerService.error(
        `[UsersController] Not Found: User ${id} not found or inactive`,
      );
      return res.status(404).send("User not found");
    }

    LoggerService.info(
      `[UsersController] User ${id} successfully updated by ${loggedInUser.username}`,
    );
    return res.status(200).json(updatedUser);
  },
);

usersController.patch(
  "/:id/role/:role",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    // 1. Log the incoming request
    LoggerService.info(
      `[UsersController] PATCH /users/${req.params.id}/role/${req.params.role} called`,
    );

    const loggedInUser = req.user;
    const id = Number(req.params.id);
    const newRole = req.params.role as EROLES;

    // 2. Guard: Check if the ID is a valid number
    if (!isNumber(id)) {
      LoggerService.error(
        `[UsersController] Bad Request: Invalid ID (${req.params.id})`,
      );
      return res.status(400).send("Bad Request: Invalid ID");
    }

    // 3. Check authentication
    if (!loggedInUser) {
      LoggerService.error(
        "[UsersController] Unauthorized: Missing or invalid token",
      );
      return res.status(401).send("Missing or Invalid token");
    }

    // 4. Check permissions (Admin only) - Note: Fixed the logical operator to !==
    if (loggedInUser.role !== EROLES.ADMIN) {
      LoggerService.error(
        `[UsersController] Forbidden: User ${loggedInUser.username} is not an Admin`,
      );
      return res.status(403).send("Unauthorized User");
    }

    // 5. Call the service to update the role
    const updatedUser = UsersService.changeRole(id, newRole);

    // 6. Handle failure: User is not a player (cannot be promoted)
    if (updatedUser === null) {
      LoggerService.error(
        `[UsersController] Bad Request: User ${id} is not a player and cannot change role`,
      );
      return res.status(400).send("User is not a player ");
    }
    // 7. Handle failure: User not found
    else if (updatedUser === undefined) {
      LoggerService.error(
        `[UsersController] Not Found: User ${id} does not exist`,
      );
      return res.status(404).send("User not found");
    }

    // 8. Happy Path: Success
    LoggerService.info(
      `[UsersController] Role of user ${id} successfully changed to ${newRole} by ${loggedInUser.username}`,
    );
    return res.status(200).json(updatedUser);
  },
);

usersController.patch(
  "/:id/reactivate",
  AuthService.authorize,
  (req: AuthenticatedRequest, res: Response) => {
    // 1. Log the incoming request
    LoggerService.info(
      `[UsersController] PATCH /users/${req.params.id}/reactivate called`,
    );

    const loggedInUser = req.user;
    const id = Number(req.params.id);

    // 2. Guard: Check if the ID is a valid number
    if (!isNumber(id)) {
      LoggerService.error(
        `[UsersController] Bad Request: Invalid ID (${req.params.id})`,
      );
      return res.status(400).send("Bad Request: Invalid ID");
    }

    // 3. Check authentication
    if (!loggedInUser) {
      LoggerService.error(
        "[UsersController] Unauthorized: Missing or invalid token",
      );
      return res.status(401).send("Missing or Invalid token");
    }

    // 4. Check permissions (Admin only)
    if (loggedInUser.role !== EROLES.ADMIN) {
      LoggerService.error(
        `[UsersController] Forbidden: User ${loggedInUser.username} is not an Admin`,
      );
      return res.status(403).send("Forbidden: Admin only");
    }

    // 5. Call the service to reactivate the user
    const isReactivated = UsersService.reactivate(id);

    // 6. Handle failure: User already active or not found
    if (!isReactivated) {
      LoggerService.error(
        `[UsersController] Not Found/Conflict: User ${id} already active or not found`,
      );
      return res
        .status(404)
        .send(
          "User not found",
        );
    }

    // 7. Happy Path: Success
    LoggerService.info(
      `[UsersController] User ${id} successfully reactivated by ${loggedInUser.username}`,
    );
    return res.status(200).json();
  },
);
