import { BasicModelDBO, BasicModelDTO } from "./basic.model";
import { UserShortDTO } from "./user.model";

// Enum for the different types of sports that a team can be associated with
export enum ESportType {
  FOOTBALL = "football",
  BASKETBALL = "basketball",
  TENNIS = "tennis",
  VOLLEYBALL = "volleyball",
  HANDBALL = "handball",
}

// client sends when creating a new team (POST /teams)
export interface NewTeamDTO {
  name: string;
  description?: string;
  sportType: ESportType;
}

//short version of the team, used in lists (for example in GET /teams)
export interface TeamShortDTO {
  id: number;
  name: string;
  sportType: ESportType;
}

// Classic version of the team, used in GET /teams/:id
export interface TeamDTO extends BasicModelDTO {
  id: number;
  name: string;
  description?: string;
  sportType: ESportType;
  players: number[]; //Table of player IDs (we will resolve them to UserShortDTO in the service)
  trainerId?: number; // ID de l'entraîneur (optionnel au début)
}

// Full version of the team, used in GET /teams/own
export interface TeamFullDTO extends BasicModelDTO {
  id: number;
  name: string;
  description?: string;
  sportType: ESportType;
  players: UserShortDTO[]; //Here are the real summarized user objects!
  trainer?: UserShortDTO;
}

// 6. How the team is stored in the database (snake_case for the database)
// snake_case for the database
export interface TeamDBO extends BasicModelDBO {
  id: number;
  name: string;
  description?: string;
  sport_type: ESportType;
  players: number[];
  trainer_id?: number | null;
}
