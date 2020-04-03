import pino from 'pino';

const l = pino({
  name: process.env.FASTFED_SDK_LOG_ID || 'FastFedNodeSdk',
  level: process.env.FASTFED_SDK_LOG_LEVEL || 'debug',
});

export default l;
