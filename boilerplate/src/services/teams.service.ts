import { TeamsMapper } from "../mappers/teams.mapper";
import { NewTeamDTO, TeamDTO, TeamShortDTO, TeamFullDTO, TeamDBO } from "../models/teams.model";
import { UserShortDTO } from "../models/user.model";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import { UsersService } from "./users.service";
import { UsersMapper } from "../mappers/users.mapper"; // On aura besoin de mapper des utilisateurs

export class TeamsService {
  protected static dbPath = './data/teams.json';

  // --- 1. LECTURE ET ECRITURE DB (Même principe que UsersService) ---
  private static readTeamsDB(): TeamDBO[] {
    try {
      return FilesService.readFile<TeamDBO>(this.dbPath);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
  }

  private static writeTeamsDB(dbos: TeamDBO[]): void {
    try {
      FilesService.writeFile<TeamDBO>(this.dbPath, dbos);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
  }

  protected static getNewID(dbos: TeamDBO[]): number {
    let maxId = 0;
    if (dbos.length === 0) return 1;
    for (const dbo of dbos) {
      if (dbo.id > maxId) {
        maxId = dbo.id;
      }
    }
    return maxId + 1;
  }

  // --- 2. OPÉRATIONS DE BASE ---

  // GET /teams (Renvoie une liste résumée)
  static getAll(): TeamShortDTO[] {
    const dbos = this.readTeamsDB();
    const shortTeams: TeamShortDTO[] = [];
    
    for (const dbo of dbos) {
      shortTeams.push(TeamsMapper.toShortDTO(dbo));
    }
    return shortTeams;
  }

  // GET /teams/:id (Renvoie une équipe complète standard)
  static getById(id: number): TeamDTO | undefined {
    const dbos = this.readTeamsDB();
    for (const dbo of dbos) {
      if (dbo.id === id) {
        return TeamsMapper.toDTO(dbo);
      }
    }
    return undefined;
  }

  // POST /teams
  static create(newTeam: NewTeamDTO, trainerId: number): TeamDTO {
    const dbos = this.readTeamsDB();
    const newId = this.getNewID(dbos);
    
    // On passe le trainerId récupéré depuis le contrôleur/token
    const newDbo = TeamsMapper.toDBO(newTeam, newId, trainerId);
    
    dbos.push(newDbo);
    this.writeTeamsDB(dbos);
    
    return TeamsMapper.toDTO(newDbo);
  }

  // PUT /teams/:id
  static update(id: number, teamData: TeamDTO): TeamDTO | undefined {
    const dbos = this.readTeamsDB();
    let index = -1;
    
    for (let i = 0; i < dbos.length; i++) {
      if (dbos[i].id === id) {
        index = i;
        break;
      }
    }
    
    if (index === -1) return undefined;

    // Mise à jour complète de l'objet
    dbos[index].name = teamData.name;
    dbos[index].description = teamData.description;
    dbos[index].sport_type = teamData.sportType;
    dbos[index].players = teamData.players;
    dbos[index].trainer_id = teamData.trainerId;
    dbos[index].updated_at = new Date();

    this.writeTeamsDB(dbos);
    return TeamsMapper.toDTO(dbos[index]);
  }

  // --- 3. OPÉRATIONS SPÉCIFIQUES ---

  // PATCH /teams/:id/join
  static joinTeam(teamId: number, userId: number): TeamDTO | null | undefined {
    const dbos = this.readTeamsDB();
    let index = -1;
    
    for (let i = 0; i < dbos.length; i++) {
      if (dbos[i].id === teamId) {
        index = i;
        break;
      }
    }
    
    if (index === -1) return undefined; // 404: L'équipe n'existe pas

    // Guard métier : l'utilisateur est-il déjà dans l'équipe ?
    for (const playerId of dbos[index].players) {
      if (playerId === userId) {
        return null; // 400: Le joueur est déjà dans l'équipe
      }
    }

    // Ajout du joueur
    dbos[index].players.push(userId);
    dbos[index].updated_at = new Date();
    
    this.writeTeamsDB(dbos);
    return TeamsMapper.toDTO(dbos[index]);
  }

  // PATCH /teams/:id/leave
  static leaveTeam(teamId: number, userId: number): TeamDTO | null | undefined {
    const dbos = this.readTeamsDB();
    let index = -1;
    
    for (let i = 0; i < dbos.length; i++) {
      if (dbos[i].id === teamId) {
        index = i;
        break;
      }
    }
    
    if (index === -1) return undefined; // 404: L'équipe n'existe pas

    // Algorithme pour enlever un élément d'un tableau sans utiliser .splice() ou .filter()
    let isPlayerInTeam = false;
    const newPlayersArray: number[] = [];
    
    for (const playerId of dbos[index].players) {
      if (playerId === userId) {
        isPlayerInTeam = true;
      } else {
        newPlayersArray.push(playerId); // On garde tous les autres joueurs
      }
    }

    if (!isPlayerInTeam) return null; // 404 métier : L'utilisateur n'est pas dans l'équipe

    // On remplace l'ancien tableau par le nouveau
    dbos[index].players = newPlayersArray;
    dbos[index].updated_at = new Date();
    
    this.writeTeamsDB(dbos);
    return TeamsMapper.toDTO(dbos[index]);
  }

  // GET /teams/own
  static getOwnTeams(userId: number): TeamFullDTO[] {
    const dbos = this.readTeamsDB();
    const ownTeams: TeamFullDTO[] = [];

    for (const dbo of dbos) {
      // 1. L'utilisateur fait-il partie de cette équipe (comme coach ou joueur) ?
      let isMember = false;
      
      if (dbo.trainer_id === userId) {
        isMember = true;
      } else {
        for (const playerId of dbo.players) {
          if (playerId === userId) {
            isMember = true;
            break;
          }
        }
      }

      // 2. S'il en fait partie, on construit le DTO complet
      if (isMember) {
        // Résolution de l'entraîneur (si existant)
        let trainerShortDTO: UserShortDTO | undefined = undefined;
        if (dbo.trainer_id !== undefined && dbo.trainer_id !== null) {
          const trainerDbo = UsersService.getById(dbo.trainer_id);
          if (trainerDbo) {
            trainerShortDTO = UsersMapper.toShortDTO(trainerDbo);
          }
        }

        // Résolution de tous les joueurs
        const playersShortDTO: UserShortDTO[] = [];
        for (const playerId of dbo.players) {
          const playerDbo = UsersService.getById(playerId);
          if (playerDbo) {
            playersShortDTO.push(UsersMapper.toShortDTO(playerDbo));
          }
        }

        // On assemble le TeamFullDTO à la main (le Mapper ne sait pas le faire seul)
        ownTeams.push({
          id: dbo.id,
          name: dbo.name,
          description: dbo.description,
          sportType: dbo.sport_type,
          players: playersShortDTO, // On donne la liste d'objets, pas d'IDs !
          trainer: trainerShortDTO, // On donne l'objet, pas l'ID !
          createdAt: dbo.created_at,
          updatedAt: dbo.updated_at
        });
      }
    }

    return ownTeams;
  }
}