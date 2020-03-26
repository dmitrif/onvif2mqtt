const logger = require('pino')({
  base: null,
});

export const setLoggingLevel = (level) => {
  logger.level = level;
};

export default logger;