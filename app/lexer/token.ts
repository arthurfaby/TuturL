import { TokenType } from "./types/token_type";

export class Token {
  private _value: string;
  private _line: number;
  private _column: number;
  private _type: TokenType;

  constructor(type: TokenType, value: string, line: number, column: number) {
    this._type = type;
    this._value = value;
    this._line = line;
    this._column = column;
  }

  get value() {
    return this._value;
  }

  get line() {
    return this._line;
  }

  get column() {
    return this._column;
  }

  get type() {
    return this._type;
  }

  set type(type: TokenType) {
    this._type = type;
  }
}
