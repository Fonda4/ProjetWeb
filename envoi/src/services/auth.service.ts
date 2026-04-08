import { NextFunction, Request, Response } from "express";
import { AuthenticatedUserDTO, UserLoginDTO } from "../models/auth.model";
import { UsersService } from "./users.service";

export class AuthService {
  
  /**
   * Encode une chaîne en Base64 (comme demandé par le Swagger)
   */
  private static encodeBase64(data: string): string {
    return Buffer.from(data).toString('base64');
  }

  /**
   * Décode une chaîne Base64 vers du texte clair
   */
  private static decodeBase64(data: string): string {
    return Buffer.from(data, 'base64').toString('utf8');
  }

  /**
   * Logique de connexion (Appelée par le contrôleur POST /auth/login)
   */
  static login(loginData: UserLoginDTO): AuthenticatedUserDTO | null {
    // 1. On demande au UsersService de vérifier les identifiants
    const validUser = UsersService.checkCredentials(loginData);

    if (!validUser) {
      return null; // Échec de l'authentification
    }

    // 2. Création du token en encodant le pseudo en base64
    const token = this.encodeBase64(validUser.username);

    // 3. On retourne l'objet attendu par le contrat Swagger
    return {
      username: validUser.username,
      token: token,
      role: validUser.role
    };
  }

  /**
   * MIDDLEWARE : Protège les routes
   * Vérifie que le client possède un token valide avant de le laisser passer.
   */
  static authorize(req: Request, res: Response, next: NextFunction) {
    // 1. On récupère le header "Authorization"
    const token = req.get("Authorization");

    if (!token) {
      return res.status(401).send("Unauthorized: Missing token");
    }

    try {
      // 2. On décode le token pour retrouver le nom d'utilisateur
      const username = AuthService.decodeBase64(token);

      // 3. On vérifie si ce nom d'utilisateur correspond à un utilisateur actif
      const existingUser = UsersService.getByUsername(username);

      if (!existingUser) {
        return res.status(401).send("Unauthorized: Invalid token or inactive user");
      }

      // 4. On attache l'utilisateur à la requête pour que le contrôleur suivant puisse l'utiliser
      (req as any).user = existingUser;
      
      // 5. On autorise la requête à continuer vers le contrôleur
      return next(); 

    } catch (error) {
      // Si la base64 est mal formée
      return res.status(401).send("Unauthorized: Malformed token");
    }
  }
}