
import { UserDBO, UserDTO, UserShortDTO, EROLES, EUserStatus,User } from '../models/users.model';

export class UsersMapper {
  
 
  static toDTO(dbo: UserDBO): UserDTO {
    return {
      id: dbo.id,
      firstName: dbo.first_name,     
      lastName: dbo.last_name,       
      email: dbo.email,
      username: dbo.username,
      role: dbo.role,
      status: dbo.status,
      createdAt: dbo.created_at,
      updatedAt: dbo.updated_at
    };
  }

 
  static toShortDTO(dbo: UserDBO): UserShortDTO {
    return {
      id: dbo.id,
      firstName: dbo.first_name,
      lastName: dbo.last_name
    };
  }

  
  static toDBO(dto: any, id: number, role: EROLES, status: EUserStatus): UserDBO {
    const now = new Date(); 
    
    return {
      id: id,
      first_name: dto.firstName,     
      last_name: dto.lastName,       
      email: dto.email,
      username: dto.username,
      password: dto.password,        
      role: role,
      status: status,
      created_at: now,
      updated_at: now
    };
  }

  static fromDBO(dbo: UserDBO): UserDTO {
    return {
      id: dbo.id,
      firstName: dbo.first_name,     
      lastName: dbo.last_name,
      email: dbo.email,
      username: dbo.username,
      role: dbo.role,
      status: dbo.status,
      createdAt: dbo.created_at,
      updatedAt: dbo.updated_at
    };

  static fromDBOtoShortDTO(dbo: UserDBO): UserShortDTO {
    return {
      id: dbo.id,
      firstName: dbo.first_name,
      lastName: dbo.last_name
    };
}

}

