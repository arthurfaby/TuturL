import { logger } from "../logger/logger";
import * as fs from "fs";
import { Token } from "./token";
import { TokenType } from "./types/token_type";
import { ErrorManager } from "../error/error_manager";
import { KNOWN_FUNCTIONS } from "./consts/known_functions";

export class Lexer {
  private _filePath: string;
  private _fileContent: string;
  private _tokens: Token[] = [] as Token[];
  private _currentLine: number = 1;
  private _currentColumn: number = 0;
  private _cursor: number = 0;
  private _errorManager: ErrorManager;

  constructor(fileContent: string, errorManager: ErrorManager) {
    this._errorManager = errorManager;
    this._fileContent = fileContent;
    logger.success("Lexer initialized");
    try {
      this._tokenize();
    } catch (error) {
      logger.error("Lexer failed to initialize");
    }
  }

  private _tokenize() {
    logger.info("Tokenizing file content");
    let token = this._getNextToken();
    while (token && token.type !== TokenType.EOF) {
      this._addToken(token);
      token = this._getNextToken();
    }
    this._addToken(token);
    if (this._errorManager.isError) {
      logger.error("Tokenization failed");
      throw new Error("Tokenization failed");
    }
    logger.success("Tokenization complete");
    this._updateTokens();
    this._showTokens();
    this._checkTokensErrors();
  }

  private _showTokens() {
    this._tokens.forEach((token) => {
      logger.info(
        `Token: ${token.value} | Type: ${token.type} | Line: ${token.line} | Column: ${token.column}`
      );
    });
  }

  private _checkTokensErrors() {
    this._tokens.forEach((token, index) => {
      const nextToken = this._tokens[index + 1];
      if (token.type === TokenType.Function) {
        if (
          !KNOWN_FUNCTIONS.includes(token.value) ||
          nextToken?.type !== TokenType.Identifier
        ) {
          this._errorManager.tokenError(nextToken, TokenType.Identifier);
        }
      }

      if (
        token.type === TokenType.Identifier &&
        nextToken?.type === TokenType.Identifier
      ) {
        this._errorManager.tokenError(nextToken, TokenType.Operator);
      }
    });
  }

  private _updateTokens() {
    logger.success("Updating tokens");
    this._tokens.forEach((token, index) => {
      if (
        token.type === TokenType.Identifier &&
        KNOWN_FUNCTIONS.includes(token.value)
      ) {
        token.type = TokenType.Function;
      }
    });
    logger.success("Tokens updated");
  }

  private _getNextToken(): Token | null {
    while (this._cursor < this._fileContent.length) {
      const currentCharacter = this._getCurrentCharacter();
      if (this._isIdentifierToken(currentCharacter)) {
        const identifier = this._parseIdentifierToken();
        return new Token(
          TokenType.Identifier,
          identifier,
          this._currentLine,
          this._currentColumn - 1
        );
      }
      if (this._isNumberToken(currentCharacter)) {
        const number = this._parseNumberToken();
        return new Token(
          TokenType.Number,
          number,
          this._currentLine,
          this._currentColumn - 1
        );
      }
      if (this._isEOLToken(currentCharacter)) {
        const eol = this._parseEOLToken();
        const col_num = this._currentColumn;
        this._currentColumn = 0;
        return new Token(TokenType.EOL, eol, this._currentLine++, col_num);
      }
      if (this._isStringToken(currentCharacter)) {
        const string = this._parseStringToken();
        return new Token(
          TokenType.String,
          string,
          this._currentLine,
          this._currentColumn - 1
        );
      }
      if (this._isOperatorToken(currentCharacter)) {
        const operator = this._parseOperatorToken();
        return new Token(
          TokenType.Operator,
          operator,
          this._currentLine,
          this._currentColumn - 1
        );
      }
      if (this._getCurrentCharacter().trim()) {
        logger.error(
          `Invalid character: ${this._getCurrentCharacter()} at line: ${
            this._currentLine
          } and column: ${this._currentColumn}`
        );
      }
      this._advanceCursor();
    }
    if (this._cursor === this._fileContent.length) {
      return new Token(
        TokenType.EOF,
        "EOF",
        this._currentLine,
        this._currentColumn - 1
      );
    }
    return null;
  }

  private _chop_char() {
    const char = this._getCurrentCharacter();
    this._advanceCursor();
    return char;
  }

  private _advanceCursor() {
    this._cursor++;
    this._currentColumn++;
  }

  private _addToken(token: Token) {
    this._tokens.push(token);
  }

  private _getCurrentCharacter() {
    return this._fileContent[this._cursor];
  }

  private _isIdentifierToken(char: string) {
    return char.match(/[a-zA-Z]/);
  }

  private _parseIdentifierToken() {
    let identifier = "";
    while (
      this._cursor < this._fileContent.length &&
      this._getCurrentCharacter().match(/[a-zA-Z]/)
    ) {
      identifier += this._chop_char();
    }
    return identifier;
  }

  private _isNumberToken(char: string) {
    return char.match(/[0-9]/);
  }

  private _parseNumberToken() {
    let number = "";
    while (
      this._cursor < this._fileContent.length &&
      this._getCurrentCharacter().match(/[0-9]/)
    ) {
      number += this._chop_char();
    }
    return number;
  }

  private _isEOLToken(char: string) {
    return char === "\n";
  }

  private _parseEOLToken() {
    this._chop_char();
    return "EOL";
  }

  private _isStringToken(char: string) {
    return char === '"' || char === "'";
  }

  private _parseStringToken() {
    const quote = this._chop_char();
    let string = quote;
    while (this._cursor < this._fileContent.length) {
      const currentCharacter = this._getCurrentCharacter();
      if (currentCharacter === quote) {
        string += this._chop_char();
        return string;
      }
      string += this._chop_char();
    }
    return string;
  }

  private _isOperatorToken(char: string) {
    return char.match(/[\+\-\*\/\=]/);
  }

  private _parseOperatorToken() {
    let operator = "";
    while (
      this._cursor < this._fileContent.length &&
      this._getCurrentCharacter().match(/[\+\-\*\/\=]/)
    ) {
      operator += this._chop_char();
    }
    return operator;
  }
}
