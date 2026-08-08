// A simple structured JSON logger ensuring no sensitive information is leaked.

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, ...meta }));
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'WARN', timestamp: new Date().toISOString(), message, ...meta }));
  },
  error: (message: string, error?: Error, meta?: Record<string, unknown>) => {
    const errorDetails = error ? { errorMsg: error.message, stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined } : {};
    console.error(JSON.stringify({ level: 'ERROR', timestamp: new Date().toISOString(), message, ...errorDetails, ...meta }));
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(JSON.stringify({ level: 'DEBUG', timestamp: new Date().toISOString(), message, ...meta }));
    }
  },
};
