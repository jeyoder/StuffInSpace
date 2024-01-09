/* eslint-disable no-console */

const defaultLogLevel = 'debug';
const logLevels = ['error', 'warn', 'info', 'debug'];

let allOutputs: Record<string, any> = {};
let globalLogger = new Proxy({
  logLevel: defaultLogLevel,
  enabledOutputs: {} as Record<string, any>,
  error: allOutputs.error,
  warn: allOutputs.warn,
  info: allOutputs.info,
  debug: allOutputs.debug,
  setLogLevel
}, {});

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
    globalLogger.enabledOutputs[logLevels[i]] = i <= levelIdx;
  }
}

function getLogger () {
  return globalLogger;
}

function init () {
  const scope = globalLogger;

  const enabledOutputs = scope.enabledOutputs;

  for (const logLevel of logLevels) {
    enabledOutputs[logLevel] = true;
  }

  allOutputs = {
    error: log.bind(scope, { enabledOutputs }, 'error', console.error),
    warn: log.bind(scope, { enabledOutputs }, 'warn', console.warn),
    info: log.bind(scope, { enabledOutputs }, 'info', console.info),
    debug: log.bind(scope, { enabledOutputs }, 'debug', console.debug)
  };

  globalLogger = new Proxy({ ...globalLogger, ...allOutputs }, {});
}

init();

export default getLogger();
export { setLogLevel };
