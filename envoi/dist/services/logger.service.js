import fs from "fs";
export class LoggerService {
    /**
     * Write a log message to a file
     * @param filePath the path to reach the file
     * @param logMessage the message to write in the file
     */
    static writeLogs(filePath, logMessage) {
        logMessage = `${new Date().toISOString()} - ${logMessage}\n`;
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, logMessage);
        }
        else {
            fs.appendFileSync(filePath, logMessage);
        }
    }
    /**
     * Private generic log function
     * @param message the message to log
     * @param level the level of the log
     */
    static log(message, level) {
        console.log(`${new Date().toISOString()} [${level}] ${message}`);
    }
    /**
     * Log a message on the info level
     * @param message the message to log
     */
    static info(message) {
        this.log(message, "INFO");
    }
    /**
     * Log a message on the debug level
     * @param message the message to log
     */
    static debug(message) {
        this.log(message, "DEBUG");
    }
    /**
     * Log a message on the error level
     * @param message the message to log
     */
    static error(error) {
        if (error instanceof Error) {
            this.log(error.message, "ERROR");
            LoggerService.writeLogs("logs/error.log", error.message);
        }
        else if (typeof error === "string") {
            this.log(error, "ERROR");
            LoggerService.writeLogs("logs/error.log", error);
        }
    }
}
