import fs from "fs";
import { LoggerService } from "./logger.service";

export class FilesService {

  private static doesFolderExist(folderPath: string) : boolean {
    return fs.existsSync(folderPath);
  }

  private static createFolder(folderPath: string) : void {
    fs.mkdirSync(folderPath);
  }

  private static doesFileExist(filePath: string) : boolean {
    return fs.existsSync(filePath);
  }

  private static createFile(filePath: string) : void {
    fs.writeFileSync(filePath, '');
  }

  private static createDBIfNotExist(dbPath: string) : void {
    const folderPath = dbPath.substring(0, dbPath.lastIndexOf('/'));
    if (!this.doesFolderExist(folderPath)) {
      this.createFolder(folderPath);
    }
    if (!this.doesFileExist(dbPath)) {
      this.createFile(dbPath);
      this.writeFile(dbPath, []);
    }
  }

  /**
   * Read data from a file
   * @param filePath the path to reach the file
   * @returns an array of data of type T
   * @throws Error if the file does not exist
   * Usage: const data : User[] = readFile<User>(filePath);
   */
  public static readFile<T>(filePath: string) : T[] {
    this.createDBIfNotExist(filePath);
    const dataString : string = fs.readFileSync(filePath, 'utf-8');
    const data : T[] = JSON.parse(dataString);
    return data;
  }

  /**
   * Write data of type T to a file
   * @param filePath the path to reach the file
   * @param data the data to write in the file
   * @throws Error if the file cannot be written
   * Usage: writeFile<User>(filePath, data);
   */
  public static writeFile<T>(filePath: string, data: T[]) : void {
    this.createDBIfNotExist(filePath);
    const dataString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, dataString, 'utf-8');
  }

  /**
   * Append data of type T to a file
   * Warning: no check is done to avoid duplicates nor to check if the models match or even valid
   * @param filePath the path to reach the file
   * @param data the data to append in the file
   * @returns the index of the last element appended
   * @throws Error if the file cannot be appended
   * Usage: appendFile<User>(filePath, data);
   */
  public static appendFile<T>(filePath: string, data: T[]) : number {
    try {
      const values = FilesService.readFile<T>(filePath);
      values.push(...data);
      FilesService.writeFile<T>(filePath, values);
      return values.length - 1;
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
  }
    
}