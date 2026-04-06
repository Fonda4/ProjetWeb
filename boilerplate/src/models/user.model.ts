import { BasicModelDBO, BasicModelDTO } from "./basic.model";

// different roles of users in our system
export enum EROLES {
  ADMIN = 'admin',
  PLAYER = 'player',
  REFEREE = 'referee',
  TRAINER = 'trainer'
}

// status of a user (active or inactive)
export enum EUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

// 1. Creation DTO: What the client sends on a POST /users
// Note: There is no ID or creation dates here, as the server handles them!
export interface NewUserDTO {
  firstName: string;
  lastName: string;    
  email: string;
  username: string;
  password: string;
  role?: EROLES; // optional, because if not provided, we will assign the default role 'player' in the service
}

// 2. classic DTO : What we return when we send user data to the client (for example in GET /users or GET /users/:id)
export interface UserDTO extends BasicModelDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: EROLES;
  status: EUserStatus;
}

// 3. short DTO : A simplified version of the UserDTO that we will return to non-admin users (without email and username for security reasons)
export interface UserShortDTO {
  id: number;
  firstName: string;
  lastName: string;
}

// 4. DBO : How the user is stored in the database (snake_case for the database)
// snake_case for the database
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
