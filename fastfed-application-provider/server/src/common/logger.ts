import pino from 'pino';

const l = pino({
  name: process.env.LOG_APP_ID || 'FastFedGovernedApp',
  level: process.env.LOG_LEVEL || 'debug',
});

export default l;
