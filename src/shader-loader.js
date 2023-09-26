import axios from 'axios';
import logger from './logger';

const shaders = [
  'earth-fragment.glsl',
  'earth-vertex.glsl',
  'dot-fragment.glsl',
  'dot-vertex.glsl',
  'pick-fragment.glsl',
  'pick-vertex.glsl',
  'path-fragment.glsl',
  'path-vertex.glsl'
];

const shaderData = {};

async function loadShader (name) {
  logger.debug(`Loading shader ${name}`);
  const response = await axios.get(`/shaders/${name}`);
  shaderData[name] = response.data;
}

async function loadShaders () {
  for (let i = 0; i < shaders.length; i++) {
    try {
      await loadShader(shaders[i]);
    } catch (error) {
      logger.error(`Failed to load shader ${shaders[i]}`, error);
    }
  }
}

function getShaderCode (name) {
  return shaderData[name];
}

export default {
  loadShaders,
  getShaderCode
};

export { loadShaders, getShaderCode };
