import { BasicModelDBO, BasicModelDTO } from "./basic.model";

// Les différents rôles possibles pour un utilisateur
export enum EROLES {
  ADMIN = 'admin',
  PLAYER = 'player',
  REFEREE = 'referee',
  TRAINER = 'trainer'
}

// Le statut de l'utilisateur (utile pour le "soft delete" ou la désactivation)
export enum EUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

// 1. DTO de création : Ce que le client envoie lors d'un POST /users
// Note : Il n'y a pas d'ID ni de dates de création ici, car c'est le serveur qui s'en charge !
export interface NewUserDTO {
  firstName: string;
  lastName: string;    
  email: string;
  username: string;
  password: string;
  role?: EROLES; // Optionnel si on force le rôle par défaut (ex: player)
}

// 2. DTO classique : Ce que le serveur renvoie au client (sans le mot de passe pour la sécurité)
export interface UserDTO extends BasicModelDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: EROLES;
  status: EUserStatus;
}

// 3. DTO résumé : Ce qu'on renvoie aux utilisateurs non-admin (pour ne pas exposer l'email)
export interface UserShortDTO {
  id: number;
  firstName: string;
  lastName: string;
}

// 4. DBO : Comment la donnée est réellement stockée dans notre "base de données" (fichiers JSON)
// Utilisation du snake_case (first_name au lieu de firstName)
export interface UserDBO extends BasicModelDBO {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  role: EROLES;
  status: EUserStatus;
}