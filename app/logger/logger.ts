import { LOGGER_COLORS } from "./colors";

class Logger {
  success(message) {
    if (process.env.DEBUG !== "true") return;
    console.log(
      LOGGER_COLORS.fgGreen + "[ SUCCESS ]",
      message + LOGGER_COLORS.reset
    );
  }

  info(message: string) {
    if (process.env.DEBUG !== "true") return;
    console.log(
      LOGGER_COLORS.fgYellow + "[  INFO   ]",
      message + LOGGER_COLORS.reset
    );
  }

  logLine(message: string, lineNumber?: number) {
    let prefix = "";
    if (lineNumber) {
      prefix = `Line ${lineNumber}:`;
    }
    const numberOfSpaces = 6 - lineNumber.toString().length - 2;
    for (let i = 0; i < numberOfSpaces; i++) {
      prefix += " ";
    }
    prefix += "| ";
    console.log(prefix + message);
  }

  jumpLine() {
    console.log();
  }

  error(message: string, withPrefix = true) {
    if (withPrefix) {
      message = "[  ERROR  ] " + message;
    } else {
      message = "            " + message;
    }
    console.log(LOGGER_COLORS.fgRed + message + LOGGER_COLORS.reset);
  }

  warn(message) {
    if (process.env.DEBUG !== "true") return;
    console.log(
      LOGGER_COLORS.fgYellow + "[ WARNING ]",
      message + LOGGER_COLORS.reset
    );
  }
}

export const logger = new Logger();
