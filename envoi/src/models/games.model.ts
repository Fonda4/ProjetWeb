// src/models/games.model.ts
import { BasicModelDBO, BasicModelDTO } from "./basic.model";

// 1. Énumération des statuts possibles d'un match selon le Swagger
export enum EGameStatus {
  CREATED = 'created',
  SCHEDULED = 'scheduled',
  STARTED = 'started',
  FINISHED = 'finished',
  CANCELLED = 'cancelled'
}

// 2. Ce que le client envoie pour CRÉER un match
export interface NewGameDTO {
  name?: string;
  fieldId?: number;
  refereeId?: number;
  homeTeamId?: number;
  awayTeamId?: number;
  scheduledDate?: string; // Format Date ISO
}

// 3. Version courte pour la liste (GET /games)
export interface GameShortDTO {
  id: number;
  status: EGameStatus;
  name?: string;
  fieldId?: number | null;
  homeTeamId?: number;
  awayTeamId?: number;
  scheduledDate?: string | null;
}

// 4. Version complète pour les détails
export interface GameDTO extends BasicModelDTO {
  id: number;
  status: EGameStatus;
  name?: string;
  fieldId?: number | null;
  refereeId?: number | null;
  homeTeamId?: number;
  awayTeamId?: number;
  homeScore?: number | null;
  awayScore?: number | null;
  scheduledDate?: string | null;
}

// 5. Version Base de Données (snake_case)
export interface GameDBO extends BasicModelDBO {
  id: number;
  status: EGameStatus;
  name?: string;
  field_id?: number | null;
  referee_id?: number | null;
  home_team_id?: number;
  away_team_id?: number;
  home_score?: number | null;
  away_score?: number | null;
  scheduled_date?: string | null;
}