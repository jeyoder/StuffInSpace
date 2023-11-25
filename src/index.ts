import { createViewer } from './viewer/index';
import config from './config';

import hud from './hud';

async function main () {
  const viewer = createViewer(config);
  await viewer.init();
  viewer.animate();

  hud.init(viewer);
}

document.addEventListener('DOMContentLoaded', () => {
  main().catch(error => console.error(error));
});