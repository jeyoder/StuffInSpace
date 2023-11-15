import { createViewer } from './viewer/index';
import hud from './hud';

async function main () {
  const viewer = await createViewer();
  console.log('xxx')
  await viewer.init();
  console.log('yyy')
  viewer.animate();
  console.log('zzz')

  hud.init(viewer);
}

main().catch(error => console.error(error));