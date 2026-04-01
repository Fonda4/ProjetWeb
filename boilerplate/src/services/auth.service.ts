// Fichier : src/services/auth.service.ts

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { generateFakeToken, validateFakeToken } from '../utils/token.utils';
import { UserLoginDTO, AuthenticatedUserDTO } from '../models/users.model';

export class AuthService {
  
  /**
   * Vérifie les identifiants et génère les données de session.
   */
  static async login(credentials: UserLoginDTO): Promise<AuthenticatedUserDTO | null> {
    // 1. On récupère les utilisateurs (getAll filtre déjà les inactifs, ce qui respecte
    // la règle du README stipulant que les utilisateurs inactifs ne peuvent pas se connecter).
    const users = UsersService.getAll();
    const user = users.find(u => u.username === credentials.username);

    if (!user || !user.password) {
      return null; // Utilisateur non trouvé
    }

    // 2. On compare le mot de passe en clair avec le hash de la base de données
    const isMatch = await bcrypt.compare(credentials.password, user.password);
    
    if (!isMatch) {
      return null; // Mot de passe incorrect
    }

    // 3. On retourne l'objet de succès (AuthenticatedUserDTO)
    return {
      username: user.username,
      token: generateFakeToken(user.username),
      role: user.role
    };
  }

  /**
   * Middleware d'authentification pour protéger les routes (le fameux "cadenas" 🔒)
   */
  static authorize(req: Request, res: Response, next: NextFunction): void {
    // On récupère le header 'Authorization'
    const token = req.get("authorization"); 

    if (!token) {
      res.status(401).json({ error: "Missing token" });
      return;
    }

    // On décode le token base64 pour retrouver le nom d'utilisateur
    const username = validateFakeToken(token); 

    if (!username) {
      res.status(401).json({ error: "Invalid token format" });
      return;
    }

    // On vérifie que l'utilisateur existe toujours et est actif
    const users = UsersService.getAll();
    const existingUser = users.find(u => u.username === username);

    if (!existingUser) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // On stocke l'utilisateur dans la requête pour gérer les permissions plus tard
    (req as any).user = existingUser; 
    
    // On permet à la requête de continuer vers le contrôleur
    next(); 
  }
}