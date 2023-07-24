const winston = require("winston");
const { format } = require("winston");
const { combine, printf, timestamp, colorize } = format;
const dotenv = require("dotenv");
dotenv.config();

const colors = {
  debug: "blue",
  http: "green",
  info: "cyan",
  warning: "yellow",
  error: "red",
  fatal: "magenta",
};

const logLevels = {
  debug: 5,
  http: 4,
  info: 3,
  warning: 2,
  error: 1,
  fatal: 0,
};




const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});



const developmentLogger = winston.createLogger({
  levels: logLevels,
  format: combine(timestamp(), logFormat),
  transports: [
    new winston.transports.Console({
      level: "debug",
      format: colorize({ all: true })
    }),
  ],
});

const productionLogger = winston.createLogger({
  
  levels: logLevels, 
  format: combine(timestamp(), logFormat),
  transports: [
    new winston.transports.Console({
      level: "info",
      format: colorize({ all: true })
    }),
    new winston.transports.File({
      filename: "errors.log",
      level: "error",
    }),
  ],
});

winston.addColors(colors);

const logger =
  process.env.NODE_ENV === "production" ? productionLogger : developmentLogger;

module.exports = logger;
