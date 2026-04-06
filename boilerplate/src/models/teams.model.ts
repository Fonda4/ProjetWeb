import { BasicModelDBO, BasicModelDTO } from "./basic.model";
import { UserShortDTO } from "./user.model";

// 1. L'énumération des sports autorisés par le Swagger
export enum ESportType {
  FOOTBALL = 'football',
  BASKETBALL = 'basketball',
  TENNIS = 'tennis',
  VOLLEYBALL = 'volleyball',
  HANDBALL = 'handball'
}

// 2. Ce que le client nous envoie pour créer une équipe (POST /teams)
export interface NewTeamDTO {
  name: string;
  description?: string; // Le point d'interrogation signifie que c'est optionnel
  sportType: ESportType;
}

// 3. L'affichage résumé (utilisé par GET /teams)
export interface TeamShortDTO {
  id: number;
  name: string;
  sportType: ESportType;
}

// 4. L'affichage standard (utilisé par GET /teams/:id, etc.)
// Il hérite de BasicModelDTO pour avoir automatiquement createdAt et updatedAt
export interface TeamDTO extends BasicModelDTO {
  id: number;
  name: string;
  description?: string;
  sportType: ESportType;
  players: number[];     // Tableau contenant les IDs des joueurs
  trainerId?: number;    // ID de l'entraîneur (optionnel au début)
}

// 5. L'affichage complet (utilisé par GET /teams/own)
export interface TeamFullDTO extends BasicModelDTO {
  id: number;
  name: string;
  description?: string;
  sportType: ESportType;
  players: UserShortDTO[]; // Ici, ce sont les vrais objets utilisateurs résumés !
  trainer?: UserShortDTO;
}

// 6. Comment la donnée est sauvegardée dans data/teams.json (le DBO)
export interface TeamDBO extends BasicModelDBO {
  id: number;
  name: string;
  description?: string;
  sport_type: ESportType;  // Attention : snake_case ici !
  players: number[];
  trainer_id?: number | null; 
}