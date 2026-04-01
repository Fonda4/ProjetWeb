
import { UserDBO, NewUserDTO, EROLES, EUserStatus, User } from '../models/users.model';
import { FilesService } from './files.service'; 
import { LoggerService } from './logger.service';
import { UsersMapper } from '../mappers/users.mapper';
import bcrypt from 'bcrypt'; 

export class UsersService {

  protected static dbPath = './data/users.json';

  private static readUsersDB() : User[] {
    let dbos: UserDBO[] = [];
    try {
      dbos = FilesService.readFile<UserDBO>(this.dbPath);
    } catch (error) {
      LoggerService.error(error);
      return [];
    }
    const items: User[] = [];
    for(const dbo of dbos) {
      items.push(UsersMapper.fromDBO(dbo));
    }
    return items;
  } 
 
  static getAll(): UserDBO[] {
    const users = this.readUsersDB();
    return users.filter(user => users.status === 'active');
  }

    static getByUsername(username: string): User | undefined {
    const usersDB: User[] = this.readUsersDB();
    for(const user of usersDB) {
      if(user.username === username) {
        return user;
      }
    }
    return undefined;
  }

 
  static async create(newUser: NewUserDTO): Promise<UserDBO> {
    const users = FilesService.readUsersDB();
    
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newUser.password!, saltRounds);

    const now = new Date(); 
    const UserDbo: UserDBO = {
        id: newId,
        first_name: newUser.firstName,
        last_name: newUser.lastName,
        email: newUser.email,
        username: newUser.username,
        password: hashedPassword,
        role: newUser.role,
        createdAt: now,
        updatedAt: now,
        status: EUserStatus.ACTIVE
    };

    users.push(UserDbo);
    FilesService.writeUsers(users); // On sauvegarde
    return UserDbo;
  }

 
  static softDelete(id: number): boolean {
    const users = FilesService.readUsersDB();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) return false;
    
    if (Users[UserIndex].role === 'admin') return false;

    users[userIndex].status = 'inactive';
    users[userIndex].updated_at = new Date();

    FilesService.writeUsers(users);
    return true;
  }
}
