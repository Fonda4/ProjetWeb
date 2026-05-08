import fs from "fs";
import { LoggerService } from "./logger.service";
export class FilesService {
    static doesFolderExist(folderPath) {
        return fs.existsSync(folderPath);
    }
    static createFolder(folderPath) {
        fs.mkdirSync(folderPath);
    }
    static doesFileExist(filePath) {
        return fs.existsSync(filePath);
    }
    static createFile(filePath) {
        fs.writeFileSync(filePath, "");
    }
    static createDBIfNotExist(dbPath) {
        const folderPath = dbPath.substring(0, dbPath.lastIndexOf("/"));
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
    static readFile(filePath) {
        this.createDBIfNotExist(filePath);
        const dataString = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(dataString);
        return data;
    }
    /**
     * Write data of type T to a file
     * @param filePath the path to reach the file
     * @param data the data to write in the file
     * @throws Error if the file cannot be written
     * Usage: writeFile<User>(filePath, data);
     */
    static writeFile(filePath, data) {
        this.createDBIfNotExist(filePath);
        const dataString = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, dataString, "utf-8");
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
    static appendFile(filePath, data) {
        try {
            const values = FilesService.readFile(filePath);
            values.push(...data);
            FilesService.writeFile(filePath, values);
            return values.length - 1;
        }
        catch (error) {
            LoggerService.error(error);
            throw new Error("Internal Error");
        }
    }
}
