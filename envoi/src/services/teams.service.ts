import { TeamsMapper } from "../mappers/teams.mapper";
import {
  NewTeamDTO,
  TeamDTO,
  TeamShortDTO,
  TeamFullDTO,
  TeamDBO,
} from "../models/teams.model";
import { UserShortDTO } from "../models/user.model";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import { UsersService } from "./users.service";
import { UsersMapper } from "../mappers/users.mapper"; //On aura besoin de mapper des utilisateurs

export class TeamsService {
  private static dbPath = "./data/teams.json";

  //---1. READ AND WRITE DB (same principle as UsersService)---

  private static readTeamsDB(): TeamDBO[] {
    try {
      return FilesService.readFile<TeamDBO>(this.dbPath);
    } catch (error) {
      LoggerService.error(error);
      throw new Error("Internal Error");
    }
  }

  private static writeTeamsDB(dbos: TeamDBO[]): void {
    try {
      FilesService.writeFile<TeamDBO>(this.dbPath, dbos);
    } catch (error) {
      LoggerService.error(error);
      throw new Error("Internal Error");
    }
  }

  private static getNewID(dbos: TeamDBO[]): number {
    let maxId = 0;
    if (dbos.length === 0) return 1;
    for (const dbo of dbos) {
      if (dbo.id > maxId) {
        maxId = dbo.id;
      }
    }
    return maxId + 1;
  }

  //---2. basic operations---

  /**
   *getAll
   *Retrieves all teams from the database
   */
  static getAll(): TeamShortDTO[] {
    const dbos = this.readTeamsDB();
    const shortTeams: TeamShortDTO[] = [];

    for (const dbo of dbos) {
      shortTeams.push(TeamsMapper.toShortDTO(dbo));
    }
    return shortTeams;
  }

  /**
   *getById
   *Retrieves a team by their ID
   */
  static getById(id: number): TeamDTO | undefined {
    const dbos = this.readTeamsDB();
    for (const dbo of dbos) {
      if (dbo.id === id) {
        return TeamsMapper.toDTO(dbo);
      }
    }
    return undefined;
  }

  /**
   *create
   *Creates a new team in the database
   */
  static create(newTeam: NewTeamDTO, trainerId: number): TeamDTO {
    const dbos = this.readTeamsDB();
    const newId = this.getNewID(dbos);

    //We pass the trainerId retrieved from the controller/token
    const newDbo = TeamsMapper.toDBO(newTeam, newId, trainerId);

    dbos.push(newDbo);
    this.writeTeamsDB(dbos);

    return TeamsMapper.toDTO(newDbo);
  }

  /**
   *update
   *Updates a specific team's information
   */
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

    //Mise à jour complète de l'objet
    dbos[index].name = teamData.name;
    dbos[index].description = teamData.description ?? "";
    dbos[index].sport_type = teamData.sportType;
    dbos[index].players = teamData.players;
    dbos[index].trainer_id = teamData.trainerId ?? dbos[index].trainer_id;
    dbos[index].updated_at = new Date();

    this.writeTeamsDB(dbos);
    return TeamsMapper.toDTO(dbos[index]);
  }

  //---3. specific operations--

  /**
   *joinTeam
   *Adds a user to a team's roster
   */
  static joinTeam(teamId: number, userId: number): TeamDTO | null | undefined {
    const dbos = this.readTeamsDB();
    let index = -1;

    for (let i = 0; i < dbos.length; i++) {
      if (dbos[i].id === teamId) {
        index = i;
        break;
      }
    }

    if (index === -1) return undefined; //404: The team does not exist

    //Job guard: is the user already in the team?
    for (const playerId of dbos[index].players) {
      if (playerId === userId) {
        return null; //400: The player is already on the team
      }
    }

    //Adding the player
    dbos[index].players.push(userId);
    dbos[index].updated_at = new Date();

    this.writeTeamsDB(dbos);
    return TeamsMapper.toDTO(dbos[index]);
  }

  /**
   *leaveTeam
   *Removes a user from a team's roster
   */
  static leaveTeam(teamId: number, userId: number): TeamDTO | null | undefined {
    const dbos = this.readTeamsDB();
    let index = -1;

    for (let i = 0; i < dbos.length; i++) {
      if (dbos[i].id === teamId) {
        index = i;
        break;
      }
    }

    if (index === -1) return undefined; //404: The team does not exist

    //Algorithm to remove an element from an array without using .splice() or .filter()
    let isPlayerInTeam = false;
    const newPlayersArray: number[] = [];

    for (const playerId of dbos[index].players) {
      if (playerId === userId) {
        isPlayerInTeam = true;
      } else {
        newPlayersArray.push(playerId); //We keep all the other players
      }
    }
    if (!isPlayerInTeam) return null; //404 métier : L'utilisateur n'est pas dans l'équipe

    //On remplace l'ancien tableau par le nouveau
    dbos[index].players = newPlayersArray;
    dbos[index].updated_at = new Date();

    this.writeTeamsDB(dbos);
    return TeamsMapper.toDTO(dbos[index]);
  }

  /**
   *getOwnTeams
   *Retrieves all teams that a user is a member of
   */
  static getOwnTeams(userId: number): TeamFullDTO[] {
    const dbos = this.readTeamsDB();
    const ownTeams: TeamFullDTO[] = [];

    for (const dbo of dbos) {
      //1. Is the user part of this team (as coach or player)?
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
      //2. If it is part of it, we construct the complete DTO
      if (isMember) {
        //Coach resolution (if existing)
        let trainerShortDTO: UserShortDTO | undefined = undefined;
        if (dbo.trainer_id !== undefined && dbo.trainer_id !== null) {
          const trainerDbo = UsersService.getById(dbo.trainer_id);
          if (trainerDbo) {
            trainerShortDTO = UsersMapper.toShortDTO(trainerDbo);
          }
        }
        //Resolution of all players
        const playersShortDTO: UserShortDTO[] = [];
        for (const playerId of dbo.players) {
          const playerDbo = UsersService.getById(playerId);
          if (playerDbo) {
            playersShortDTO.push(UsersMapper.toShortDTO(playerDbo));
          }
        }

        //We assemble the TeamFullDTO by hand (the Mapper cannot do it alone)
        ownTeams.push({
          id: dbo.id,
          name: dbo.name,
          description: dbo.description,
          sportType: dbo.sport_type,
          players: playersShortDTO, //We give the list of objects, not IDs!
          trainer: trainerShortDTO, //We give the object, not the ID!
          createdAt: dbo.created_at,
          updatedAt: dbo.updated_at,
        });
      }
    }

    return ownTeams;
  }
}
