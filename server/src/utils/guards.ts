import { FieldDTO, NewFieldDTO } from "../models/field.model";
import { EGameStatus, GameDTO, NewGameDTO } from "../models/game.model";
import { ESportType, NewTeamDTO, TeamDTO } from "../models/team.model";
import { ERole, EUserStatus, NewUserDTO, UserDTO, UserLoginDTO } from "../models/user.model";

export function isNumber(obj: any): obj is number {
  return typeof obj === 'number' && !isNaN(obj) && isFinite(obj);
}

export function isString(obj: any): obj is string {
  return typeof obj === 'string';
}

function isObject(obj: any): obj is object {
  return typeof obj === 'object';
}

function isNonEmptyString(obj: any): obj is string {
  return isString(obj) && obj.trim().length !== 0;
}

// == USER ==
export function isNewUserDTO(obj: any): obj is NewUserDTO {
  return obj && typeof obj === 'object' &&  
    obj.email && isNonEmptyString(obj.email) && 
    obj.password && isNonEmptyString(obj.password) && 
    obj.firstName && isNonEmptyString(obj.firstName) && 
    obj.lastName && isNonEmptyString(obj.lastName) && 
    obj.username && isNonEmptyString(obj.username)
}

export function isUserLoginDTO(obj: any): obj is UserLoginDTO {
  return obj && typeof obj === 'object' &&
    obj.username && isNonEmptyString(obj.username) &&
    obj.password && isNonEmptyString(obj.password)
}

export function isUserDTO(obj: any): obj is UserDTO {
  return obj && typeof obj === 'object' &&
    obj.email && isNonEmptyString(obj.email) &&
    obj.firstName && isNonEmptyString(obj.firstName) &&
    obj.lastName && isNonEmptyString(obj.lastName) && 
    obj.username && isNonEmptyString(obj.username) && 
    obj.id !== undefined && isNumber(obj.id) &&
    obj.status && isString(obj.status) && isUserStatus(obj.status) && 
    obj.role && isString(obj.role) && isUserRole(obj.role)
}

export function isUserRole(obj: any): obj is ERole {
  return Object.values(ERole).includes(obj);
}

export function isUserStatus(obj: any): obj is EUserStatus {
  return Object.values(EUserStatus).includes(obj);
}

// == TEAM ==
export function isESportType(obj: any): obj is ESportType {
  return Object.values(ESportType).includes(obj);
}

export function isNewTeamDTO(obj: any): obj is NewTeamDTO {
  return obj && typeof obj === 'object' &&
    obj.name && isNonEmptyString(obj.name) && 
    obj.sportType && isString(obj.sportType) && isESportType(obj.sportType) && 
    (!obj.description || isString(obj.description))
}

export function isTeamDTO(obj: any): obj is TeamDTO {
  return obj && typeof obj === 'object' && 
    obj.id !== undefined && isNumber(obj.id) && 
    obj.name && isNonEmptyString(obj.name) && 
    obj.sportType && isString(obj.sportType) && isESportType(obj.sportType) && 
    (!obj.description || isString(obj.description)) && 
    obj.players && isObject(obj.players) && 
    obj.trainerId && isNumber(obj.trainerId);
}

// == GAME ==
export function isNewGameDTO(obj: any): obj is NewGameDTO {
  return obj && 
    typeof obj === 'object' && 
    (!obj.name || isString(obj.name)) && 
    (!obj.fieldId || isNumber(obj.fieldId)) && 
    (!obj.refereeId || isNumber(obj.refereeId)) && 
    (!obj.homeTeamId || isNumber(obj.homeTeamId)) && 
    (!obj.awayTeamId || isNumber(obj.awayTeamId)) && 
    (!obj.scheduledDate || isString(obj.scheduledDate))
}

export function isGameDTO(obj: any): obj is GameDTO {
  return obj && typeof obj === 'object' && 
    obj.id !== undefined && isNumber(obj.id) && 
    obj.status && isString(obj.status) && isEGameStatus(obj.status) && 
    (!obj.name || isString(obj.name)) && 
    (!obj.fieldId || isNumber(obj.fieldId)) && 
    (!obj.refereeId || isNumber(obj.refereeId)) && 
    (!obj.homeTeamId || isNumber(obj.homeTeamId)) && 
    (!obj.awayTeamId || isNumber(obj.awayTeamId)) && 
    (!obj.scheduledDate || isString(obj.scheduledDate))
}

export function isEGameStatus(obj: any): obj is EGameStatus {
  return Object.values(EGameStatus).includes(obj);
}

// == Field ==
export function isNewFieldDTO(obj: any): obj is NewFieldDTO {
  return obj && typeof obj === 'object' && 
    obj.name && isNonEmptyString(obj.name) &&  
    obj.location && isNonEmptyString(obj.location);
}

export function isFieldDTO(obj: any): obj is FieldDTO {
  return obj && typeof obj === 'object' && 
    obj.id !== undefined && isNumber(obj.id) &&
    obj.name && isNonEmptyString(obj.name) &&  
    obj.location && isNonEmptyString(obj.location);
}