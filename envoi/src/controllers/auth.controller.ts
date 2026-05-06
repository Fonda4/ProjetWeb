import { Router } from "express";
import { isUserLoginDTO } from "../utils/guards";
import { AuthService } from "../services/auth.service";
import { LoggerService } from "../services/logger.service";
import { Request, Response } from "express";
export const authController = Router();

/**
 * POST /auth/login
 * Allows you to authenticate and obtain a token
 */
authController.post('/login', (req : Request, res : Response) => {
  LoggerService.info("[AuthController] POST /login called");
  const loginData = req.body;

  // 1. Guard : Is the data received complete?
  if (!isUserLoginDTO(loginData)) {
    LoggerService.error(
      "[AuthController] Bad Request: Missing username or password",
    );
    return res.status(400).send("Missing or empty username / password");
  }

  // 2. Call the service to authenticate the user
  const authResult = AuthService.login(loginData);

  // 3. Handle the failure (wrong password or username not found)
  if (!authResult) {
    LoggerService.error(
      `[AuthController] Unauthorized: Invalid credentials for user ${loginData.username}`,
    );
    return res.status(401).send("Invalid credentials");
  }

// Step 4: Happy Path - Success! 
  LoggerService.info(
    `[AuthController] User ${loginData.username} successfully authenticated`
  );

  // We format the response to explicitly exclude the role, matching your requirements
  const responsePayload = {
    username: authResult.username,
    token: authResult.token
  };

  // Return the newly formatted object
  res.status(200).json(responsePayload);
});
