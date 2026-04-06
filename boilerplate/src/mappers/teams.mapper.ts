import { TeamDBO, TeamDTO, TeamShortDTO, NewTeamDTO } from '../models/teams.model';

export class TeamsMapper {
  
  /**
   * DBO -> DTO : De la base de données vers le format standard pour le client
   */
  static toDTO(dbo: TeamDBO): TeamDTO {
    return {
      id: dbo.id,
      name: dbo.name,
      description: dbo.description,
      sportType: dbo.sport_type,       // Conversion snake_case -> camelCase
      players: dbo.players,
      trainerId: dbo.trainer_id !== null ? dbo.trainer_id : undefined,
      createdAt: dbo.created_at,
      updatedAt: dbo.updated_at
    };
  }

  /**
   * DBO -> ShortDTO : De la base de données vers le format résumé
   */
  static toShortDTO(dbo: TeamDBO): TeamShortDTO {
    return {
      id: dbo.id,
      name: dbo.name,
      sportType: dbo.sport_type
    };
  }

  /**
   * NewDTO -> DBO : Du client vers la base de données (lors d'une création)
   * Le serveur décide de l'ID, de la date, de l'entraîneur et initialise les joueurs.
   */
  static toDBO(dto: NewTeamDTO, newId: number, trainerId: number): TeamDBO {
    const now = new Date();
    
    return {
      id: newId,
      name: dto.name,
      description: dto.description || "", // Si pas de description, on met une chaîne vide
      sport_type: dto.sportType,
      players: [],                        // Règle du Swagger : liste de joueurs vide au départ
      trainer_id: trainerId,
      created_at: now,
      updated_at: now
    };
  }

  // Note : Il n'y a pas de "toFullDTO" ici, car pour créer un TeamFullDTO, 
  // le Service devra aller chercher les informations dans le fichier des utilisateurs. 
  // Le Mapper ne gère pas la logique d'aller lire d'autres fichiers !
}