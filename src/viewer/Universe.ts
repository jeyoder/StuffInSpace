import * as THREE from 'three';
import SceneComponent from './interfaces/SceneComponent';

class Universe implements SceneComponent {
  init (scene: THREE.Scene) {
    const texture = new THREE.TextureLoader().load('textures/example_render.jpg');

    scene.background = texture;
  }

  update(_scene?: THREE.Scene | undefined): void | Promise<void> {
    // do nothing
  }
}

export default Universe;