import { EGameStatus } from "../models/games.model";
import { ESportType } from "../models/teams.model";
import { EROLES, EUserStatus, } from "../models/user.model";
export function isNumber(obj) {
    return typeof obj === 'number' && !isNaN(obj) && isFinite(obj);
}
export function isString(obj) {
    return typeof obj === 'string';
}
function isObject(obj) {
    return typeof obj === 'object';
}
function isNonEmptyString(obj) {
    return isString(obj) && obj.trim().length !== 0;
}
// == USER ==
export function isNewUserDTO(obj) {
    return obj && typeof obj === 'object' &&
        obj.email && isNonEmptyString(obj.email) &&
        obj.password && isNonEmptyString(obj.password) &&
        obj.firstName && isNonEmptyString(obj.firstName) &&
        obj.lastName && isNonEmptyString(obj.lastName) &&
        obj.username && isNonEmptyString(obj.username);
}
export function isUserLoginDTO(obj) {
    return obj && typeof obj === 'object' &&
        obj.username && isNonEmptyString(obj.username) &&
        obj.password && isNonEmptyString(obj.password);
}
export function isUserDTO(obj) {
    return obj && typeof obj === 'object' &&
        obj.email && isNonEmptyString(obj.email) &&
        obj.firstName && isNonEmptyString(obj.firstName) &&
        obj.lastName && isNonEmptyString(obj.lastName) &&
        obj.username && isNonEmptyString(obj.username) &&
        obj.id !== undefined && isNumber(obj.id) &&
        (obj.status === undefined || (obj.status && isString(obj.status) && isUserStatus(obj.status))) &&
        (obj.role === undefined || (obj.role && isString(obj.role) && isUserRole(obj.role)));
}
export function isUserRole(obj) {
    return Object.values(EROLES).includes(obj);
}
export function isUserStatus(obj) {
    return Object.values(EUserStatus).includes(obj);
}
// == TEAM ==
export function isESportType(obj) {
    return Object.values(ESportType).includes(obj);
}
export function isNewTeamDTO(obj) {
    return obj && typeof obj === 'object' &&
        obj.name && isNonEmptyString(obj.name) &&
        obj.sportType && isString(obj.sportType) && isESportType(obj.sportType) &&
        (!obj.description || isString(obj.description));
}
export function isTeamDTO(obj) {
    return obj && typeof obj === 'object' &&
        obj.id !== undefined && isNumber(obj.id) &&
        obj.name && isNonEmptyString(obj.name) &&
        obj.sportType && isString(obj.sportType) && isESportType(obj.sportType) &&
        (!obj.description || isString(obj.description)) &&
        obj.players && isObject(obj.players) &&
        obj.trainerId && isNumber(obj.trainerId);
}
// == GAME ==
export function isNewGameDTO(obj) {
    return obj &&
        typeof obj === 'object' &&
        (!obj.name || isString(obj.name)) &&
        (!obj.fieldId || isNumber(obj.fieldId)) &&
        (!obj.refereeId || isNumber(obj.refereeId)) &&
        (!obj.homeTeamId || isNumber(obj.homeTeamId)) &&
        (!obj.awayTeamId || isNumber(obj.awayTeamId)) &&
        (!obj.scheduledDate || isString(obj.scheduledDate));
}
export function isGameDTO(obj) {
    return obj && typeof obj === 'object' &&
        obj.id !== undefined && isNumber(obj.id) &&
        obj.status && isString(obj.status) && isEGameStatus(obj.status) &&
        (!obj.name || isString(obj.name)) &&
        (!obj.fieldId || isNumber(obj.fieldId)) &&
        (!obj.refereeId || isNumber(obj.refereeId)) &&
        (!obj.homeTeamId || isNumber(obj.homeTeamId)) &&
        (!obj.awayTeamId || isNumber(obj.awayTeamId)) &&
        (!obj.scheduledDate || isString(obj.scheduledDate));
}
export function isEGameStatus(obj) {
    return Object.values(EGameStatus).includes(obj);
}
// == Field ==
export function isNewFieldDTO(obj) {
    return obj && typeof obj === 'object' &&
        obj.name && isNonEmptyString(obj.name) &&
        obj.location && isNonEmptyString(obj.location);
}
export function isFieldDTO(obj) {
    return obj && typeof obj === 'object' &&
        obj.id !== undefined && isNumber(obj.id) &&
        obj.name && isNonEmptyString(obj.name) &&
        obj.location && isNonEmptyString(obj.location);
}
