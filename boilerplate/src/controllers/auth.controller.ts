import { Request, Response, Router } from 'express';
import { isUserLoginDTO } from '../utils/guards';
import { AuthService } from '../services/auth.service';

export const authController = Router();

/**
 * POST /auth/login
 * Permet de s'authentifier et d'obtenir un jeton
 */
authController.post('/login', (req: Request, res: Response) => {
  try {
    const loginData = req.body;

    // 1. Guard : Les données reçues sont-elles complètes ?
    if (!isUserLoginDTO(loginData)) {
      return res.status(400).send("Bad Request: Missing username or password");
    }

    // 2. Appel au service d'authentification
    const authResult = AuthService.login(loginData);

    // 3. Gestion de l'échec (mauvais mot de passe ou pseudo introuvable)
    if (!authResult) {
      return res.status(401).send("Unauthorized: Invalid credentials");
    }

    // 4. Happy Path : Succès ! On renvoie l'objet avec le token
    res.status(200).json(authResult);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});