import axios from 'axios';
import { createViewer } from './viewer/index';
import defaultConfig from './config';
import logger, { setLogLevel } from './utils/logger';
import appinfo from './appinfo.json';

import hud from './hud';

async function loadConfig () {
  const baseUrl = './';
  const response = await axios.get(`${baseUrl}config.json`);
  let config = defaultConfig;
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