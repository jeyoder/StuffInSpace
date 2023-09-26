/* eslint-disable no-console */
function log (level, output, ...args) {
  output(level, ...args);
}

function getLogger () {
  return {
    error: log.bind(this, 'ERROR', console.error),
    warn: log.bind(this, 'WARN', console.warn),
    info: log.bind(this, 'INFO', console.info),
    debug: log.bind(this, 'DEBUG', console.debug)
  };
}

export default getLogger();
