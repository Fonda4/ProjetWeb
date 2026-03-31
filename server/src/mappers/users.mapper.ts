// Fichier : src/mappers/users.mapper.ts

import { UserDBO, UserDTO, UserShortDTO, EROLES, EUserStatus } from '../models/users.model';

export class UsersMapper {
  
  /**
   * Transforme un objet de la base de données (DBO) en objet pour le client (DTO)
   * On traduit le snake_case en camelCase et ON RETIRE LE MOT DE PASSE.
   */
  static toDTO(dbo: UserDBO): UserDTO {
    return {
      id: dbo.id,
      firstName: dbo.first_name,     // Mapping snake_case -> camelCase
      lastName: dbo.last_name,       // Mapping snake_case -> camelCase
      email: dbo.email,
      username: dbo.username,
      // Remarque : On ne mappe délibérément pas `dbo.password` ici par sécurité.
      role: dbo.role,
      status: dbo.status,
      createdAt: dbo.createdAt,
      updatedAt: dbo.updatedAt
    };
  }

  /**
   * Transforme un objet de la base de données en format court
   * Utilisé pour la liste des utilisateurs pour un non-admin.
   */
  static toShortDTO(dbo: UserDBO): UserShortDTO {
    return {
      id: dbo.id,
      firstName: dbo.first_name,
      lastName: dbo.last_name
    };
  }

  /**
   * Optionnel mais très utile : mapper un DTO (création) vers un DBO (base de données)
   */
  static toDBO(dto: any, id: number, role: EROLES, status: EUserStatus): UserDBO {
    const now = new Date(); // Le serveur décide seul des dates
    
    return {
      id: id,
      first_name: dto.firstName,     // Mapping camelCase -> snake_case
      last_name: dto.lastName,       // Mapping camelCase -> snake_case
      email: dto.email,
      username: dto.username,
      password: dto.password,        // Doit être hashé en amont par le service !
      role: role,
      status: status,
      createdAt: now,
      updatedAt: now
    };
  }
}