import { UsersMapper } from "../mappers/users.mapper";
import { NewUserDTO, UserDTO, UserDBO, EROLES, EUserStatus } from "../models/user.model";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import bcrypt from "bcrypt";

export class UsersService {
  protected static dbPath = './data/users.json';

  // 1. LECTURE : On garde les DBO en interne pour conserver toutes les données (y compris les mots de passe)
  private static readUsersDB(): UserDBO[] {
    try {
      return FilesService.readFile<UserDBO>(this.dbPath);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error'); // Règle du cours : on lève une erreur interne
    }
  }

  // 2. ECRITURE
  private static writeUsersDB(dbos: UserDBO[]): void {
    try {
      FilesService.writeFile<UserDBO>(this.dbPath, dbos);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
  }

  // 3. ALGORITHME D'ID : Emprunté à ton fichier, très clair !
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

  // 4. GET ALL : Utilisation d'une boucle for classique
  static getAll(): UserDTO[] {
    const dbos = this.readUsersDB();
    const activeUsers: UserDTO[] = [];
    
    for (const dbo of dbos) {
      if (dbo.status === EUserStatus.ACTIVE) {
        // C'est ici qu'on transforme le DBO en DTO pour le contrôleur
        activeUsers.push(UsersMapper.toDTO(dbo));
      }
    }
    return activeUsers;
  }

  // 5. GET BY USERNAME : Recherche par boucle
  static getByUsername(username: string): UserDTO | undefined {
    const dbos = this.readUsersDB();
    
    for(const dbo of dbos) {
      if(dbo.username === username && dbo.status === EUserStatus.ACTIVE) {
        return UsersMapper.toDTO(dbo);
      }
    }
    return undefined;
  }

  // 6. CREATE : Synchrone grâce à ton exemple
  static create(newUser: NewUserDTO): UserDTO {
    const dbos = this.readUsersDB();
    
    const newId = this.getNewID(dbos);
    // On utilise hashSync comme dans ton exemple
    const passwordHash = bcrypt.hashSync(newUser.password, 10);
    
    newUser.password = passwordHash;
    // On utilise notre Mapper pour générer le DBO proprement
    const newDbo = UsersMapper.toDBO(newUser, newId, EROLES.PLAYER, EUserStatus.ACTIVE);
    
    dbos.push(newDbo);
    this.writeUsersDB(dbos);
    
    return UsersMapper.toDTO(newDbo);
  }

  // 7. SOFT DELETE : Algorithme de recherche d'index de ton exemple
  static softDelete(id: number): boolean {
    const dbos = this.readUsersDB();
    let index = -1;
    
    // Algorithme de recherche de position
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
      return false; // On ne supprime pas un admin
    }

    dbos[index].status = EUserStatus.INACTIVE;
    dbos[index].updated_at = new Date();

    this.writeUsersDB(dbos);
    return true;
  }

  // 8. VALIDATION : Ajouté depuis ton fichier, très utile pour la suite !
  static validateUser(password: string, passwordHash: string): boolean {
    return bcrypt.compareSync(password, passwordHash);
  }
}