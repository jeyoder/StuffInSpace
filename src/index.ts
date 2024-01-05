import axios from 'axios';
import { createViewer } from './viewer/index';
import defaultConfig from './config';
import { setLogLevel } from './utils/logger';

import hud from './hud';

async function loadConfig () {
  const baseUrl = './';
  const response = await axios.get(`${baseUrl}/config.json`);
  let config = defaultConfig;
  if (response.data) {
    config = { ...defaultConfig, ...response.data };
  }
  return config;
}

async function main () {
  const config = await loadConfig();
  setLogLevel(config.logLevel);

  const viewer = createViewer(config);
  await viewer.init();
  viewer.animate();

  hud.init(viewer);
}

document.addEventListener('DOMContentLoaded', () => {
  main().catch(error => console.error(error));
});