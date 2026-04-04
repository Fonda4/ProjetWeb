import { UserDBO, UserDTO, UserShortDTO, EROLES, EUserStatus, NewUserDTO } from '../models/user.model';

export class UsersMapper {
  
  /**
   * Transforme les données de la DB (DBO) vers le format Client (DTO)
   */
  static toDTO(dbo: UserDBO): UserDTO {
    return {
      id: dbo.id,
      firstName: dbo.first_name,     // Conversion snake_case -> camelCase
      lastName: dbo.last_name,       
      email: dbo.email,
      username: dbo.username,
      role: dbo.role,
      status: dbo.status,
      createdAt: dbo.created_at,
      updatedAt: dbo.updated_at
    };
  }

  /**
   * Transforme les données de la DB (DBO) vers le format Client réduit (ShortDTO)
   */
  static toShortDTO(dbo: UserDBO): UserShortDTO {
    return {
      id: dbo.id,
      firstName: dbo.first_name,
      lastName: dbo.last_name
    };
  }

  /**
   * Transforme les données entrantes du client (NewUserDTO) en format DB (DBO)
   * Le serveur décide seul des dates de création et d'id.
   */
  static toDBO(dto: NewUserDTO, newId: number, role: EROLES, status: EUserStatus): UserDBO {
    const now = new Date(); // La date de création et de modification sont identiques à la création
    
    return {
      id: newId,
      first_name: dto.firstName,     // Conversion camelCase -> snake_case
      last_name: dto.lastName,       
      email: dto.email,
      username: dto.username,
      password: dto.password,        // Le mot de passe est stocké (idéalement hashé plus tard)
      role: role,
      status: status,
      created_at: now,
      updated_at: now
    };
  }
}