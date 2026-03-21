const winston = require('winston');
const { combine, timestamp, printf, colorize, align } = winston.format;
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
});
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    align(),
    logFormat
  ),
  transports: [
    new winston.transports.Console()
  ]
});
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}
logger.stream = {
  write: function (message) {
    logger.info(message.trim());
  },
};
module.exports = logger;
