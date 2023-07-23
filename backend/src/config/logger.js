const winston = require("winston");
const { format } = require("winston");
const { combine, printf, timestamp, colorize } = format;
const dotenv = require("dotenv");
dotenv.config();

// Definir los colores de los niveles de log
const colors = {
  debug: "blue",
  http: "green",
  info: "cyan",
  warning: "yellow",
  error: "red",
  fatal: "magenta",
};

// Definir los niveles de log personalizados
const logLevels = {
  debug: 5,
  http: 4,
  info: 3,
  warning: 2,
  error: 1,
  fatal: 0,
};




// Definir el formato de los mensajes de log
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});



// Crear el logger de desarrollo
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

// Crear el logger de producción
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

// Asignar los colores a los niveles de log
winston.addColors(colors);

// Seleccionar el logger según el entorno
const logger =
  process.env.NODE_ENV === "production" ? productionLogger : developmentLogger;

// Exportar el logger para su uso en otros módulos
module.exports = logger;
