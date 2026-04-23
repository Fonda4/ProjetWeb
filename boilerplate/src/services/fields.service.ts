// src/services/fields.service.ts
import { FieldsMapper } from "../mappers/fields.mapper";
import { FieldDBO , FieldDTO, NewFieldDTO } from "../models/fields.model";

import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";

export class FieldsService {
  protected static dbPath = './data/fields.json';

  // --- DATABASE READ/WRITE ---
  private static readFieldsDB(): FieldDBO[] {
    try {
      return FilesService.readFile<FieldDBO>(this.dbPath);
    } catch (error) {
      // Log the internal error using LoggerService
      LoggerService.error(`[FieldsService] Failed to read database: ${error}`);
      throw new Error('Internal Error');
    }
  }

  private static writeFieldsDB(dbos: FieldDBO[]): void {
    try {
      FilesService.writeFile<FieldDBO>(this.dbPath, dbos);
    } catch (error) {
      // Log the internal error using LoggerService
      LoggerService.error(`[FieldsService] Failed to write to database: ${error}`);
      throw new Error('Internal Error');
    }
  }

  protected static getNewID(dbos: FieldDBO[]): number {
    let maxId = 0;
    if (dbos.length === 0) return 1;
    for (const dbo of dbos) {
      if (dbo.id > maxId) maxId = dbo.id;
    }
    return maxId + 1;
  }

  // --- BUSINESS LOGIC ---

  static getAll(): FieldDTO[] {
    LoggerService.info('[FieldsService] Fetching all fields');
    const dbos = this.readFieldsDB();
    return dbos.map(dbo => FieldsMapper.toDTO(dbo));
  }

  static getById(id: number): FieldDTO | undefined {
    LoggerService.info(`[FieldsService] Fetching field with ID: ${id}`);
    const dbos = this.readFieldsDB();
    const dbo = dbos.find(f => f.id === id);
    
    if (!dbo) {
      LoggerService.info(`[FieldsService] Field with ID ${id} not found`);
    }
    
    return dbo ? FieldsMapper.toDTO(dbo) : undefined;
  }

  static create(newField: NewFieldDTO): FieldDTO {
    LoggerService.info(`[FieldsService] Creating new field: ${newField.name}`);
    const dbos = this.readFieldsDB();
    const newId = this.getNewID(dbos);
    
    const newDbo = FieldsMapper.toDBO(newField, newId);
    dbos.push(newDbo);
    this.writeFieldsDB(dbos);
    
    LoggerService.info(`[FieldsService] Field created successfully with ID: ${newId}`);
    return FieldsMapper.toDTO(newDbo);
  }

  static update(id: number, fieldData: FieldDTO): FieldDTO | undefined {
    LoggerService.info(`[FieldsService] Attempting to update field with ID: ${id}`);
    const dbos = this.readFieldsDB();
    const index = dbos.findIndex(f => f.id === id);
    
    if (index === -1) {
      LoggerService.error(`[FieldsService] Update failed: Field ID ${id} not found`);
      return undefined; // 404 Not Found
    }

    // Update the values
    dbos[index].name = fieldData.name;
    dbos[index].location = fieldData.location;
    dbos[index].updated_at = new Date();

    this.writeFieldsDB(dbos);
    LoggerService.info(`[FieldsService] Field ID ${id} successfully updated`);
    
    return FieldsMapper.toDTO(dbos[index]);
  }
}