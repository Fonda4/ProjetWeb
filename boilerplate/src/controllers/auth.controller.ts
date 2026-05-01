import { Router } from "express";
import { isUserLoginDTO } from "../utils/guards";
import { AuthService } from "../services/auth.service";
import { LoggerService } from "../services/logger.service";

export const authController = Router();

/**
 * POST /auth/login
 * Allows you to authenticate and obtain a token
 */
authController.post("/login", (req, res) => {
  LoggerService.info("[AuthController] POST /login called");
  const loginData = req.body;

  // 1. Guard : Is the data received complete?
  if (!isUserLoginDTO(loginData)) {
    LoggerService.error(
      "[AuthController] Bad Request: Missing username or password",
    );
    return res.status(400).send("Bad Request: Missing username or password");
  }

  // 2. Call the service to authenticate the user
  const authResult = AuthService.login(loginData);

  // 3. Handle the failure (wrong password or username not found)
  if (!authResult) {
    LoggerService.error(
      `[AuthController] Unauthorized: Invalid credentials for user ${loginData.username}`,
    );
    return res.status(401).send("Unauthorized: Invalid credentials");
  }

  // 4. Happy Path : Success ! Return the object with the token
  LoggerService.info(
    `[AuthController] User ${loginData.username} successfully authenticated`,
  );
  res.status(200).json(authResult);
});
