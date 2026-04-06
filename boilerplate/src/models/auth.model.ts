// src/models/auth.model.ts
import { EROLES } from "./user.model";

// Ce que le client envoie pour se connecter
export interface UserLoginDTO {
  username: string;
  password: string;
}

// Ce que le serveur répond si la connexion réussit (défini par le Swagger)
export interface AuthenticatedUserDTO {
  username: string;
  token: string;
  role: EROLES;
}