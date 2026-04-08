// src/models/auth.model.ts
import { EROLES,UserDTO } from "./user.model";
import { Request } from 'express';

//client receives when login is successful
export interface UserLoginDTO {
  username: string;
  password: string;
}

// what the server returns when the login is successful (token + user info)
export interface AuthenticatedUserDTO {
  username: string;
  token: string;
  role: EROLES;
}

export interface AuthenticatedRequest extends Request {
  user?: UserDTO; 
}