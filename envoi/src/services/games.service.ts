// src/services/games.service.ts
import { GamesMapper } from "../mappers/games.mapper";
import { GameDBO, GameDTO, GameShortDTO, NewGameDTO, EGameStatus } from "../models/games.model";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";

export class GamesService {
  protected static dbPath = './data/games.json';

  // --- LECTURE ET ÉCRITURE DB ---
  private static readGamesDB(): GameDBO[] {
    try {
      return FilesService.readFile<GameDBO>(this.dbPath);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
  }

  private static writeGamesDB(dbos: GameDBO[]): void {
    try {
      FilesService.writeFile<GameDBO>(this.dbPath, dbos);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
  }

  protected static getNewID(dbos: GameDBO[]): number {
    let maxId = 0;
    if (dbos.length === 0) return 1;
    for (const dbo of dbos) {
      if (dbo.id > maxId) maxId = dbo.id;
    }
    return maxId + 1;
  }

  // --- LOGIQUE MÉTIER ---

  // GET /games : Uniquement les matchs futurs ou aujourd'hui
  static getAll(): GameShortDTO[] {
    const dbos = this.readGamesDB();
    const shortGames: GameShortDTO[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // On remet à minuit pour comparer juste la date

    for (const dbo of dbos) {
      if (dbo.scheduled_date) {
        const scheduledDate = new Date(dbo.scheduled_date);
        // Si la date est aujourd'hui ou dans le futur
        if (scheduledDate >= today) {
          shortGames.push(GamesMapper.toShortDTO(dbo));
        }
      }
    }
    return shortGames;
  }

  static getById(id: number): GameDTO | undefined {
    const dbos = this.readGamesDB();
    const dbo = dbos.find(g => g.id === id);
    return dbo ? GamesMapper.toDTO(dbo) : undefined;
  }

static create(newGame: NewGameDTO, refereeId: number): GameDTO | null {
    const dbos = this.readGamesDB();

    // Business Rule: Check if the field is already booked
    if (newGame.fieldId && newGame.scheduledDate) {
      if (this.isFieldBooked(dbos, newGame.fieldId, newGame.scheduledDate)) {
        return null; // 400 Bad Request
      }
    }

    const newId = this.getNewID(dbos);
    const newDbo = GamesMapper.toDBO(newGame, newId, refereeId);
    
    dbos.push(newDbo);
    this.writeGamesDB(dbos);
    
    return GamesMapper.toDTO(newDbo);
  }

static update(id: number, gameData: GameDTO): GameDTO | undefined | null {
    const dbos = this.readGamesDB();
    const index = dbos.findIndex(g => g.id === id);

    if (index === -1) return undefined; // 404

    const currentGame = dbos[index];

    // Business rules (Swagger) : Blocked if finished or cancelled
    if (currentGame.status === EGameStatus.FINISHED || currentGame.status === EGameStatus.CANCELLED) {
      return null; // 400 Bad Request
    }

    // Business rules : If STARTED, some fields are locked
    if (currentGame.status === EGameStatus.STARTED) {
      if (gameData.fieldId !== currentGame.field_id || 
          gameData.refereeId !== currentGame.referee_id ||
          gameData.homeTeamId !== currentGame.home_team_id ||
          gameData.awayTeamId !== currentGame.away_team_id) {
          return null; // 400 Bad Request
      }
    }

    // Update fields
    dbos[index].name = gameData.name;
    dbos[index].field_id = gameData.fieldId || null;
    dbos[index].referee_id = gameData.refereeId || null;
    dbos[index].home_team_id = gameData.homeTeamId;
    dbos[index].away_team_id = gameData.awayTeamId;
    dbos[index].scheduled_date = gameData.scheduledDate || null;
    dbos[index].updated_at = new Date();

    // NEW: Auto-assign status based on field and date presence
    // We only evaluate this if the game is in CREATED or SCHEDULED status
    if (currentGame.status === EGameStatus.CREATED || currentGame.status === EGameStatus.SCHEDULED) {
      if (gameData.fieldId && gameData.scheduledDate) {
        dbos[index].status = EGameStatus.SCHEDULED; // All prerequisites are met
      } else {
        dbos[index].status = EGameStatus.CREATED; // Missing prerequisites
      }
    }

    this.writeGamesDB(dbos);
    return GamesMapper.toDTO(dbos[index]);
  }

  static delete(id: number): boolean {
    const dbos = this.readGamesDB();
    const initialLength = dbos.length;
    const filteredDbos = dbos.filter(g => g.id !== id);
    
    if (filteredDbos.length === initialLength) return false; // 404
    
    this.writeGamesDB(filteredDbos);
    return true; // 204
  }


  // PATCH /games/:id/score/:home/:away
  static setScore(id: number, homeScore: number, awayScore: number): GameDTO | undefined | null {
    const dbos = this.readGamesDB();
    const index = dbos.findIndex(g => g.id === id);
    if (index === -1) return undefined; // 404 Not Found

    // Business Rule: We can only update the score if the game status is STARTED
    if (dbos[index].status !== EGameStatus.STARTED) {
      return null; // 400 Bad Request
    }

    // Apply the new scores
    dbos[index].home_score = homeScore;
    dbos[index].away_score = awayScore;
    dbos[index].updated_at = new Date();
    
    this.writeGamesDB(dbos);

    return GamesMapper.toDTO(dbos[index]);
  }

  // PATCH /games/:id/status/:status
  static setStatus(id: number, newStatus: EGameStatus): GameDTO | undefined | null {
    const dbos = this.readGamesDB(); // Reads the JSON file
    const index = dbos.findIndex(g => g.id === id);
    if (index === -1) return undefined; // Returns undefined to trigger a 404 Not Found in the controller

    const currentStatus = dbos[index].status;
    let isValidTransition = false;

    // Strict verification of status transitions according to our business rules
    if (currentStatus === EGameStatus.CREATED && newStatus === EGameStatus.CANCELLED) isValidTransition = true;
    if (currentStatus === EGameStatus.SCHEDULED && newStatus === EGameStatus.CANCELLED) isValidTransition = true;
    if (currentStatus === EGameStatus.STARTED && newStatus === EGameStatus.FINISHED) isValidTransition = true; // Step 4 (Finish)
    
    if (currentStatus === EGameStatus.SCHEDULED && newStatus === EGameStatus.STARTED) { // Step 2 (Start)
      // Business Rule: To start a game, all required fields must be fully populated
      if (dbos[index].field_id && dbos[index].referee_id && dbos[index].home_team_id && dbos[index].away_team_id) {
        isValidTransition = true;
      }
    }

    if (!isValidTransition) return null; // Returns null to trigger a 400 Bad Request in the controller

    // Apply the status change and update the timestamp
    dbos[index].status = newStatus;
    dbos[index].updated_at = new Date();
    this.writeGamesDB(dbos); // Saves to the JSON file

    return GamesMapper.toDTO(dbos[index]);
  }


  /**
   * Checks if a field is already booked at a specific date and time
   */
  private static isFieldBooked(dbos: GameDBO[], fieldId: number, scheduledDate: string, excludeGameId?: number): boolean {
    for (const game of dbos) {
      // Check if the field and date match exactly
      if (game.field_id === fieldId && game.scheduled_date === scheduledDate) {
        // If we are updating a game, we must not compare it against itself
        if (excludeGameId && game.id === excludeGameId) {
          continue;
        }
        // A cancelled game does not occupy the field
        if (game.status !== EGameStatus.CANCELLED) {
          return true; // Field is booked
        }
      }
    }
    return false; // Field is available
  }
}