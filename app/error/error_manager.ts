import { Token } from "../lexer/token";
import { TokenType } from "../lexer/types/token_type";
import { logger } from "../logger/logger";

export class ErrorManager {
  public isError: boolean = false;
  private _fileContent: string;

  constructor(fileContent: string) {
    this._fileContent = fileContent;
    this.isError = false;
  }

  public tokenError(token: Token, expectedToken?: TokenType) {
    this.isError = true;
    logger.logLine(
      this._fileContent.split("\n")[token.line - 1].trim(),
      token.line
    );
    let errorPointer = "";
    for (let i = 0; i < token.column; i++) {
      errorPointer += " ";
    }
    errorPointer += "~";
    logger.error(errorPointer, false);
    logger.jumpLine();
    logger.error(
      `Invalid token: ${token.value} at line: ${token.line} and column: ${token.column}`
    );
    if (expectedToken) {
      logger.error(`Expected token: ${expectedToken}`);
    }
  }
}
