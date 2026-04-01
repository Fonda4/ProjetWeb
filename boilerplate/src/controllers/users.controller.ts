
import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';
import { UsersMapper } from '../mappers/users.mapper';

export class UsersController {

 
  static getAll(req: Request, res: Response): void {
    const usersDbo = UsersService.getAll();

    const currentUser = (req as any).user; 

    if (currentUser.role === 'admin') {
      const usersDto = usersDbo.map(dbo => UsersMapper.toDTO(dbo));
      res.status(200).json(usersDto);
    } else {
      const usersShortDto = usersDbo.map(dbo => UsersMapper.toShortDTO(dbo));
      res.status(200).json(usersShortDto);
    }
  }

  
  static getById(req: Request, res: Response): void {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "ID is not a valid number" });
      return;
    }

    const userDbo = UsersService.getByUsername;
    if (!userDbo) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const currentUser = (req as any).user;

    if (currentUser.role === 'admin') {
      res.status(200).json(UsersMapper.toDTO(userDbo));
    } else if (currentUser.id === id) {
      res.status(200).json(UsersMapper.toShortDTO(userDbo));
    } else {
      res.status(403).json({ error: "Forbidden: Cannot view another user's profile" });
    }
  }

 
  static async create(req: Request, res: Response): Promise<void> {
    const body = req.body;

    if (!body.firstName || !body.lastName || !body.email || !body.username || !body.password) {
      res.status(400).json({ error: "Invalid or missing fields" });
      return;
    }

    try {
      const newUserDbo = await UsersService.create(body);
      
      res.status(201).json(UsersMapper.toDTO(newUserDbo));
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }


  static delete(req: Request, res: Response): void {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const currentUser = (req as any).user;

    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      res.status(403).json({ error: "Forbidden: Cannot delete another user" });
      return;
    }

    const success = UsersService.softDelete(id);

    if (!success) {
      const user = UsersService.getByUsername;
      if (!user) {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(400).json({ error: "Cannot delete an admin account" });
      }
      return;
    }

    res.status(200).json({ message: "User deleted" });
  }
}
