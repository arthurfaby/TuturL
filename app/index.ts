import { ErrorManager } from "./error/error_manager";
import { Lexer } from "./lexer/lexer";
import { logger } from "./logger/logger";
import * as fs from "fs";

const filePath = "./app/code.tuturl";
const absolutePath = require("path").resolve(filePath);

function _readFile(filePath: string = absolutePath) {
  logger.info(`Reading file: ${filePath}`);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  logger.success("File read successfully");
  fileContent.split("\n").forEach((line, index) => {
    logger.info(`Line ${index + 1}: ${line}`);
  });
  return fileContent;
}
const fileContent = _readFile();

const errorManager = new ErrorManager(fileContent);
const lexer = new Lexer(fileContent, errorManager);
