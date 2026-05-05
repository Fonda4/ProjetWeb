import { UsersMapper } from "../mappers/users.mapper";
import { NewUserDTO, UserDTO, UserDBO, EROLES, EUserStatus } from "../models/user.model";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import { UserLoginDTO } from "../models/auth.model";

import bcrypt from "bcrypt";

export class UsersService {
  protected static dbPath = './data/users.json';

  // READING: We keep the DBOs internally to retain all data (including passwords)
  private static readUsersDB(): UserDBO[] {
    try {
      return FilesService.readFile<UserDBO>(this.dbPath);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error'); 
    }
  }

  // Writing
  private static writeUsersDB(dbos: UserDBO[]): void {
    try {
      FilesService.writeFile<UserDBO>(this.dbPath, dbos);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
  }

  // Scan by id
  protected static getNewID(dbos: UserDBO[]): number {
    let maxId = 0;
    if (dbos.length === 0) {
      return 1;
    }
    for (const dbo of dbos) {
      if (dbo.id > maxId) {
        maxId = dbo.id;
      }
    }
    return maxId + 1;
  }

  //  GET ALL 
  static getAll(): UserDTO[] {
    const dbos = this.readUsersDB();
    const activeUsers: UserDTO[] = [];
    
    for (const dbo of dbos) {
      if (dbo.status === EUserStatus.ACTIVE) {
        
        activeUsers.push(UsersMapper.toDTO(dbo));
      }
    }
    return activeUsers;
  }

  //  GET BY USERNAME 
static getByUsername(username: string): UserDTO | undefined {
    const usersDB: UserDBO[] = this.readUsersDB();
    
    for (const user of usersDB) {
        // We strictly check the username AND if the user status is active
        if (user.username === username && user.status === EUserStatus.ACTIVE) {
            return UsersMapper.toDTO(user);
        }
    }
    // If no active user is found, we return undefined
    return undefined;
}

  // CREATE 
  static create(newUser: NewUserDTO): UserDTO {
    const dbos = this.readUsersDB();
    
    const newId = this.getNewID(dbos);
  
    const passwordHash = bcrypt.hashSync(newUser.password, 10);
    
    newUser.password = passwordHash;
    // We use our Mapper to generate the DBO correctly
    const newDbo = UsersMapper.toDBO(newUser, newId, EROLES.PLAYER, EUserStatus.ACTIVE);
    
    dbos.push(newDbo);
    this.writeUsersDB(dbos);
    
    return UsersMapper.toDTO(newDbo);
  }

  //  SOFT DELETE 
  static softDelete(id: number): boolean {
    const dbos = this.readUsersDB();
    let index = -1;
    
   
    for(let i = 0; i < dbos.length; i++) {
      if(dbos[i].id === id) {
        index = i;
        break;
      }
    }
    
    if (index === -1 || dbos[index].status === EUserStatus.INACTIVE) {
      return false;
    }
    if (dbos[index].role === EROLES.ADMIN) {
      return false; 
    }

    dbos[index].status = EUserStatus.INACTIVE;
    dbos[index].updated_at = new Date();

    this.writeUsersDB(dbos);
    return true;
  }

  //  VALIDATION 
  static validateUser(password: string, passwordHash: string): boolean {
    return bcrypt.compareSync(password, passwordHash);
  }
  // Readding
  static getById(id: number): UserDBO | undefined {
    const dbos = this.readUsersDB();
    for (const dbo of dbos) {
      if (dbo.id === id) {
        return dbo;
      }
    }
    return undefined; 
  }

  // Reading
  static getByEmail(email: string): UserDTO | undefined {
    const dbos = this.readUsersDB();
    for (const dbo of dbos) {
      if (dbo.email === email && dbo.status === EUserStatus.ACTIVE) {
        return UsersMapper.toDTO(dbo);
      }
    }
    return undefined;
  }

/**
   * Update
   */
  static update(id: number, updatedData: UserDTO): UserDTO | undefined {
    const dbos = this.readUsersDB();
    let index = -1;
    
 
    for (let i = 0; i < dbos.length; i++) {
      if (dbos[i].id === id && dbos[i].status === EUserStatus.ACTIVE) {
        index = i;
        break;
      }
    }
    
    if (index === -1) return undefined;

    // Swagger business rule: ONLY these 4 fields are updated
    dbos[index].first_name = updatedData.firstName;
    dbos[index].last_name = updatedData.lastName;
    dbos[index].email = updatedData.email;
    dbos[index].username = updatedData.username;
    
   
    dbos[index].updated_at = new Date();

    // Save
    this.writeUsersDB(dbos);
    
    return UsersMapper.toDTO(dbos[index]);
  }

  // Update : Role
  static changeRole(id: number, newRole: EROLES): UserDTO | null | undefined {
    const dbos = this.readUsersDB();
    let index = -1;
    
    for (let i = 0; i < dbos.length; i++) {
      if (dbos[i].id === id) {
        index = i;
        break;
      }
    }
    
    if (index === -1) return undefined; // 404 Not Found
    
    // Swagger business rule: Only one “player” can be promoted
    if (dbos[index].role !== EROLES.PLAYER) {
      return null; // 400 Bad Request
    }

    dbos[index].role = newRole;
    dbos[index].updated_at = new Date();

    this.writeUsersDB(dbos);
    return UsersMapper.toDTO(dbos[index]);
  }

  // Update
  static reactivate(id: number): boolean {
    const dbos = this.readUsersDB();
    let index = -1;
    
    for (let i = 0; i < dbos.length; i++) {
      if (dbos[i].id === id) {
        index = i;
        break;
      }
    }
    
    if (index === -1 || dbos[index].status === EUserStatus.ACTIVE) return false;

    dbos[index].status = EUserStatus.ACTIVE;
    dbos[index].updated_at = new Date();

    this.writeUsersDB(dbos);
    return true;
  }



  /**
   * Verifies a user's credentials.
   * Returns the UserDTO if the password is correct; otherwise, returns undefined.
   */
  static checkCredentials(loginData: UserLoginDTO): UserDTO | undefined {
    const dbos = this.readUsersDB();
    
    for (const dbo of dbos) {
      if (dbo.username === loginData.username && dbo.status === EUserStatus.ACTIVE) {
        const isPasswordValid = this.validateUser(loginData.password, dbo.password);
        
        if (isPasswordValid) {
          return UsersMapper.toDTO(dbo);
        } else {
          return undefined; 
        }
      }
    }
    return undefined; 
  }


  static isValidEmail(email: string): boolean {
    // 1. Ensure the email exists (additional security)
    if (!email) {
      return false;
    }

    // 2. Verify the presence of the at sign
    const hasAtSign = email.includes('@');

    // 3. Verify the presence of the dot
    const hasDot = email.includes('.');

    // 4. Verify minimum length
    const isLongEnough = email.length >= 5;

    // 5. The email is valid only if ALL these conditions are true 
    return hasAtSign && hasDot && isLongEnough;
  }

}