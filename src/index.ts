import axios from 'axios';
import { createViewer } from './viewer/index';
import defaultConfig from './config';
import logger, { setLogLevel } from './utils/logger';
import appinfo from './appinfo.json';

import hud from './hud';

async function loadConfig () {
  let config = defaultConfig;
  const response = await axios.get(`${config.baseUrl}config.json`);
  if (response.data) {
    config = { ...defaultConfig, ...response.data, appInfo: appinfo };
  }
  logger.info(`.... ${config.baseUrl}`);
  return config;
}

async function main () {
  const config = await loadConfig();
  setLogLevel(config.logLevel);

  const viewer = createViewer(config);
  await viewer.init();
  viewer.animate();

  hud.init(viewer, config);
}

document.addEventListener('DOMContentLoaded', () => {
  main().catch(error => console.error(error));
});