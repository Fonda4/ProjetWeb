import { BasicModelDBO, BasicModelDTO } from "./basic.model";

// 1. List of possible match statuses according to the Swagger
export enum EGameStatus {
  CREATED = "created",
  SCHEDULED = "scheduled",
  STARTED = "started",
  FINISHED = "finished",
  CANCELLED = "cancelled",
}

// 2. What the customer sends to CREATE a match
export interface NewGameDTO {
  name?: string;
  fieldId?: number;
  refereeId?: number;
  homeTeamId?: number;
  awayTeamId?: number;
  scheduledDate?: string; // Date of ISO
}

// 3. Short version for the list (GET/games)
export interface GameShortDTO {
  id: number;
  status: EGameStatus;
  name?: string;
  fieldId?: number | null;
  homeTeamId?: number;
  awayTeamId?: number;
  scheduledDate?: string | null;
}

// 4. Full version for details
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

// 5. The database version (snake_case)
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
