// Fichier : src/services/users.service.ts

import { UserDBO, NewUserDTO, EROLES, EUserStatus } from '../models/users.model';
import { FilesService } from './files.service'; 
import { LoggerService } from './logger.service';
import bcrypt from 'bcrypt'; 

export class UsersService {
  
 
  static getAll(): UserDBO[] {
    const users = FilesService.readUsers();
    return users.filter(user => user.status === 'active');
  }

  static getById(id: number): UserDBO | undefined {
    const users = FilesService.readUsers();
    return users.find(user => user.id === id);
  }

 
  static async create(newUser: NewUserDTO): Promise<UserDBO> {
    const users = FilesService.readUsers();
    
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
    const users = FilesService.readUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) return false;
    
    if (Users[UserIndex].role === 'admin') return false;

    users[userIndex].status = 'inactive';
    users[userIndex].updated_at = new Date();

    FilesService.writeUsers(users);
    return true;
  }
}
