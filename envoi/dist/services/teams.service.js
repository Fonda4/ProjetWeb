import { TeamsMapper } from "../mappers/teams.mapper";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import { UsersService } from "./users.service";
import { UsersMapper } from "../mappers/users.mapper"; //On aura besoin de mapper des utilisateurs
export class TeamsService {
    //---1. READ AND WRITE DB (same principle as UsersService)---
    static readTeamsDB() {
        try {
            return FilesService.readFile(this.dbPath);
        }
        catch (error) {
            LoggerService.error(error);
            throw new Error("Internal Error");
        }
    }
    static writeTeamsDB(dbos) {
        try {
            FilesService.writeFile(this.dbPath, dbos);
        }
        catch (error) {
            LoggerService.error(error);
            throw new Error("Internal Error");
        }
    }
    static getNewID(dbos) {
        let maxId = 0;
        if (dbos.length === 0)
            return 1;
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
    static getAll() {
        const dbos = this.readTeamsDB();
        const shortTeams = [];
        for (const dbo of dbos) {
            shortTeams.push(TeamsMapper.toShortDTO(dbo));
        }
        return shortTeams;
    }
    /**
     *getById
     *Retrieves a team by their ID
     */
    static getById(id) {
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
    static create(newTeam, trainerId) {
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
    static update(id, teamData) {
        var _a, _b;
        const dbos = this.readTeamsDB();
        let index = -1;
        for (let i = 0; i < dbos.length; i++) {
            if (dbos[i].id === id) {
                index = i;
                break;
            }
        }
        if (index === -1)
            return undefined;
        //Mise à jour complète de l'objet
        dbos[index].name = teamData.name;
        dbos[index].description = (_a = teamData.description) !== null && _a !== void 0 ? _a : "";
        dbos[index].sport_type = teamData.sportType;
        dbos[index].players = teamData.players;
        dbos[index].trainer_id = (_b = teamData.trainerId) !== null && _b !== void 0 ? _b : dbos[index].trainer_id;
        dbos[index].updated_at = new Date();
        this.writeTeamsDB(dbos);
        return TeamsMapper.toDTO(dbos[index]);
    }
    //---3. specific operations--
    /**
     *joinTeam
     *Adds a user to a team's roster
     */
    static joinTeam(teamId, userId) {
        const dbos = this.readTeamsDB();
        let index = -1;
        for (let i = 0; i < dbos.length; i++) {
            if (dbos[i].id === teamId) {
                index = i;
                break;
            }
        }
        if (index === -1)
            return undefined; //404: The team does not exist
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
    static leaveTeam(teamId, userId) {
        const dbos = this.readTeamsDB();
        let index = -1;
        for (let i = 0; i < dbos.length; i++) {
            if (dbos[i].id === teamId) {
                index = i;
                break;
            }
        }
        if (index === -1)
            return undefined; //404: The team does not exist
        //Algorithm to remove an element from an array without using .splice() or .filter()
        let isPlayerInTeam = false;
        const newPlayersArray = [];
        for (const playerId of dbos[index].players) {
            if (playerId === userId) {
                isPlayerInTeam = true;
            }
            else {
                newPlayersArray.push(playerId); //We keep all the other players
            }
        }
        if (!isPlayerInTeam)
            return null; //404 métier : L'utilisateur n'est pas dans l'équipe
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
    static getOwnTeams(userId) {
        const dbos = this.readTeamsDB();
        const ownTeams = [];
        for (const dbo of dbos) {
            //1. Is the user part of this team (as coach or player)?
            let isMember = false;
            if (dbo.trainer_id === userId) {
                isMember = true;
            }
            else {
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
                let trainerShortDTO = undefined;
                if (dbo.trainer_id !== undefined && dbo.trainer_id !== null) {
                    const trainerDbo = UsersService.getById(dbo.trainer_id);
                    if (trainerDbo) {
                        trainerShortDTO = UsersMapper.toShortDTO(trainerDbo);
                    }
                }
                //Resolution of all players
                const playersShortDTO = [];
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
TeamsService.dbPath = "./data/teams.json";
