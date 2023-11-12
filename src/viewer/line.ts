import orbitDisplay from './orbit-display';
import logger from '../utils/logger';

class Line {
  constructor (gl) {
    this.gl = gl;
    this.vertBuf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(6), this.gl.STREAM_DRAW);
  }

  set (pt1, pt2) {
    const buf = [];
    buf.push(pt1[0]);
    buf.push(pt1[1]);
    buf.push(pt1[2]);
    buf.push(pt2[0]);
    buf.push(pt2[1]);
    buf.push(pt2[2]);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(buf), this.gl.STREAM_DRAW);
  }

  draw () {
    const shader = orbitDisplay.getPathShader();
    try {
      if (!shader) {
        logger.warn('shader is null');
        return;
      }
      this.gl.useProgram(shader);
      this.gl.uniform4fv(shader.uColor, [1.0, 0.0, 1.0, 1.0]);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuf);
      this.gl.vertexAttribPointer(shader.aPos, 3, this.gl.FLOAT, false, 0, 0);
      this.gl.drawArrays(this.gl.LINES, 0, 2);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}

export default Line;
