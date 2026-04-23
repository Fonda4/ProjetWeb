// src/mappers/fields.mapper.ts
import { FieldDBO,NewFieldDTO,FieldDTO } from "../models/fields.model";

export class FieldsMapper {
  
  // Converts Database Object (DBO) to Data Transfer Object (DTO)
  static toDTO(dbo: FieldDBO): FieldDTO {
    return {
      id: dbo.id,
      name: dbo.name,
      location: dbo.location,
      createdAt: dbo.created_at,
      updatedAt: dbo.updated_at
    };
  }

  // Converts a creation payload (NewDTO) to a Database Object (DBO)
  static toDBO(dto: NewFieldDTO, newId: number): FieldDBO {
    const now = new Date();
    
    return {
      id: newId,
      name: dto.name,
      location: dto.location,
      created_at: now,
      updated_at: now
    };
  }
}