import logger from '@/utils/logger';
import axios from 'axios';

class ShaderStore {
  baseUrl = 'shaders/';
  shaders = [
    'earth-fragment',
    'earth-vertex',
    'dot-fragment',
    'dot-vertex',
    'dot2-fragment',
    'dot2-vertex',
    'pick-fragment',
    'pick-vertex',
    'path-fragment',
    'path-vertex'
  ];
  shaderData: Record<string, string> = {};

  constructor (appBaseUrl = '') {
    this.baseUrl = `${appBaseUrl}${this.baseUrl}`;
  }

  private async loadShader (shaderFile: string): Promise<string> {
    const path = `${this.baseUrl}${shaderFile}.glsl`;
    logger.debug(`loading shader from ${path}`);

    const response = await axios.get(path);
    if (response.data) {
      return response.data as string;
    }
    throw new Error('no data received');
  }

  async load () {
    try {
      for (let i = 0; i < this.shaders.length; i++) {
        const shaderCode = await this.loadShader(this.shaders[i]);
        this.shaderData[this.shaders[i]] = shaderCode;
      }
    } catch (error) {
      logger.error('Errors while loading shaders', error);
    }
  }

  addShader (name: string, fragmentCode: string, vertexCode: string) {
    this.shaderData[`${name}-fragment`] = fragmentCode;
    this.shaderData[`${name}-vertex`] = vertexCode;
  }

  getFragmentShader (name: string) {
    return this.shaderData[`${name}-fragment`];
  }

  getVertexShader (name: string) {
    return this.shaderData[`${name}-vertex`];
  }

  getShader (name: string) {
    return {
      vertex: this.getVertexShader(name),
      fragment: this.getFragmentShader(name)
    };
  }
}

export default ShaderStore;