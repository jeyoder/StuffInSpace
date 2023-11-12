/* eslint-disable no-console */
import { all } from 'axios';
import constants from '../config';

const logLevels = ['error', 'warn', 'info', 'debug'];
const enabledOutputs: Record<string, any>  = {};
let allOutputs: Record<string, any> = {};

function log (scope: any, level: string, output: (level: string, ...args: any) => void, ...args: any) {
  if (scope.enabledOutputs[level]) {
    output(level.toUpperCase(), ...args);
  }
}

function setLogLevel (level: string) {
  const levelIdx = logLevels.indexOf(level.toLowerCase());

  if (levelIdx < 0) {
    throw new Error('Unknown log level');
  }

  for (let i = 0; i < logLevels.length; i++) {
    enabledOutputs[logLevels[i]] = i <= levelIdx;
  }
}

function getLogger () {
  return {
    error: allOutputs.error,
    warn: allOutputs.warn,
    info: allOutputs.info,
    debug: allOutputs.debug,
    setLogLevel
  };
}

function init (this: any) {
  allOutputs = {
    error: log.bind(this, { enabledOutputs }, 'error', console.error),
    warn: log.bind(this, { enabledOutputs }, 'warn', console.warn),
    info: log.bind(this, { enabledOutputs }, 'info', console.info),
    debug: log.bind(this, { enabledOutputs }, 'debug', console.debug)
  };

  for (let i = 0; i < logLevels.length; i++) {
    enabledOutputs[logLevels[i]] = true;
  }
}

init();
setLogLevel(constants.logLevel);

export default getLogger();
