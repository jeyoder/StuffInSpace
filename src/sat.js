/* eslint-disable no-bitwise */
import { mat4, vec4 } from 'gl-matrix';
import axios from 'axios';

import logger from './logger';
import { getShaderCode } from './shader-loader';
import { defaultColorScheme } from './color-scheme';
import constants from './constants';

// eslint-disable-next-line import/no-unresolved
import SatCruncherWorker from './sat-cruncher-worker?worker';

const tleUrl = `${constants.baseUrl}/data/TLE.json`;
const hoverColor = [0.1, 1.0, 0.0, 1.0];
const selectedColor = [0.0, 1.0, 1.0, 1.0];

class SatSet {
  constructor () {
    // const scope = this;
    this.app = undefined;
    this.satCruncher = undefined;

    try {
      logger.info('Kicking off sat-cruncher-worker');
      this.satCruncher = SatCruncherWorker();
    } catch (_error) {
      logger.error('unsupported browser');
      // TODO this.app isn't defined at this point
      this.app?.browserUnsupported();
    }

    this.cruncherReadyCallback = undefined;
    this.satData = undefined;
    this.satPos = [];
    this.satVel = [];
    this.satAlt = [];
    this.hoveringSat = -1;

    this.numSats = 0;
    this.shadersReady = false;
    this.cruncherReady = false;
    this.lastDrawTime = 0;
    this.gotExtraData = false;

    // eslint-disable-next-line func-names, space-before-function-paren
    this.satCruncher.onmessage = this.onMessage.bind(this);
  }

  async onMessage (message) {
    const scope = this;
    try {
      if (!this.gotExtraData) { // store extra data that comes from crunching
        const start = performance.now();

        if (message.data.extraData) {
          scope.satExtraData = JSON.parse(message.data.extraData);

          for (let i = 0; i < this.numSats; i++) {
            scope.satData[i].inclination = scope.satExtraData[i].inclination;
            scope.satData[i].eccentricity = scope.satExtraData[i].eccentricity;
            scope.satData[i].raan = scope.satExtraData[i].raan;
            scope.satData[i].argPe = scope.satExtraData[i].argPe;
            scope.satData[i].meanMotion = scope.satExtraData[i].meanMotion;

            scope.satData[i].semiMajorAxis = scope.satExtraData[i].semiMajorAxis;
            scope.satData[i].semiMinorAxis = scope.satExtraData[i].semiMinorAxis;
            scope.satData[i].apogee = scope.satExtraData[i].apogee;
            scope.satData[i].perigee = scope.satExtraData[i].perigee;
            scope.satData[i].period = scope.satExtraData[i].period;
          }

          logger.debug(`sat.js copied extra data in ${performance.now() - start} ms`);
          scope.gotExtraData = true;
          return;
        }
      }

      scope.satPos = new Float32Array(message.data.satPos);
      scope.satVel = new Float32Array(message.data.satVel);
      scope.satAlt = new Float32Array(message.data.satAlt);

      if (!this.cruncherReady) {
        document.querySelector('#load-cover').classList.add('hidden');
        scope.setColorScheme(scope.currentColorScheme); // force color recalc
        scope.cruncherReady = true;
        if (scope.cruncherReadyCallback) {
          scope.cruncherReadyCallback(scope.satData);
        }
      }
    } catch (error) {
      logger.debug('Error in worker response', error);
      logger.debug('worker message', message);
    }
  }

  init (app, callback) {
    logger.debug('SatSet init');
    this.app = app;
    const { gl } = app;

    this.dotShader = gl.createProgram();

    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, getShaderCode('dot-vertex.glsl'));
    gl.compileShader(vertShader);

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, getShaderCode('dot-fragment.glsl'));
    gl.compileShader(fragShader);

    gl.attachShader(this.dotShader, vertShader);
    gl.attachShader(this.dotShader, fragShader);
    gl.linkProgram(this.dotShader);

    if (this.app.validateProgram) {
      logger.debug('Validating this.dotShader');
      gl.validateProgram(this.dotShader);
    }

    this.dotShader.aPos = gl.getAttribLocation(this.dotShader, 'aPos');
    this.dotShader.aColor = gl.getAttribLocation(this.dotShader, 'aColor');
    this.dotShader.uMvMatrix = gl.getUniformLocation(this.dotShader, 'uMvMatrix');
    this.dotShader.uCamMatrix = gl.getUniformLocation(this.dotShader, 'uCamMatrix');
    this.dotShader.uPMatrix = gl.getUniformLocation(this.dotShader, 'uPMatrix');

    const promise = axios.get(tleUrl, {
      params: {
        t: Date.now()
      }
    }).then((response) => {
      try {
        const startTime = new Date().getTime();

        document.querySelector('#loader-text').innerHTML = 'Crunching numbers...';

        logger.debug('oooo satData');
        this.satData = response.data;

        // if (true) {
        // this.satData = this.satData.filter((entry) => entry.OBJECT_TYPE !== 'TBA');
        // }

        this.satDataString = JSON.stringify(this.satData);

        const postStart = performance.now();
        logger.info('Kicking off this.satCruncher');
        this.satCruncher.postMessage(this.satDataString); // kick off this.satCruncher
        const postEnd = performance.now();

        // do some processing on our satData response
        for (let i = 0; i < this.satData.length; i++) {
          if (this.satData[i].INTLDES) {
            let year = this.satData[i].INTLDES.substring(0, 2); // clean up intl des for display
            const prefix = (year > 50) ? '19' : '20';
            year = prefix + year;
            const rest = this.satData[i].INTLDES.substring(2);
            this.satData[i].intlDes = `${year}-${rest}`;
          } else {
            this.satData[i].intlDes = 'unknown';
          }
          this.satData[i].id = i;
        }

        // populate GPU mem buffers, now that we know how many sats there are
        this.satPosBuf = gl.createBuffer();
        this.satPos = new Float32Array(this.satData.length * 3);

        const pickColorData = [];
        this.pickColorBuf = gl.createBuffer();
        for (let i = 0; i < this.satData.length; i++) {
          const byteR = (i + 1) & 0xff;
          const byteG = ((i + 1) & 0xff00) >> 8;
          const byteB = ((i + 1) & 0xff0000) >> 16;
          pickColorData.push(byteR / 255.0);
          pickColorData.push(byteG / 255.0);
          pickColorData.push(byteB / 255.0);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pickColorBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pickColorData), gl.STATIC_DRAW);

        this.numSats = this.satData.length;

        this.setColorScheme(defaultColorScheme);

        const end = new Date().getTime();
        logger.debug(`sat.js init: ${end - startTime} ms (incl post: ${postEnd - postStart} ms)`);

        this.shadersReady = true;

        if (callback) {
          callback(this.satData);
        }
      } catch (error) {
        logger.debug('Unable to load TLE data', error);
      }
      return this.satData;
    });

    if (!callback) {
      return promise;
    }

    promise.catch((error) => logger.error(error));
    return undefined;
  }

  setColorScheme (scheme) {
    this.currentColorScheme = scheme;
    const buffers = scheme.calculateColorBuffers();
    if (buffers) {
      this.satColorBuf = buffers.colorBuf;
      this.pickableBuf = buffers.pickableBuf;
    }
  }

  draw (pMatrix, camMatrix) {
    const { gl } = this.app;

    try {
      if (!this.shadersReady || !this.cruncherReady) {
        return;
      }

      const now = Date.now();
      const dt = Math.min((now - this.lastDrawTime) / 1000.0, 1.0);
      for (let i = 0; i < (this.satData.length * 3); i++) {
        this.satPos[i] += this.satVel[i] * dt;
      }

      gl.useProgram(this.dotShader);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      gl.uniformMatrix4fv(this.dotShader.uMvMatrix, false, mat4.create());
      gl.uniformMatrix4fv(this.dotShader.uCamMatrix, false, camMatrix);
      gl.uniformMatrix4fv(this.dotShader.uPMatrix, false, pMatrix);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.satPosBuf);
      gl.bufferData(gl.ARRAY_BUFFER, this.satPos, gl.STREAM_DRAW);
      gl.vertexAttribPointer(this.dotShader.aPos, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.satColorBuf);
      gl.enableVertexAttribArray(this.dotShader.aColor);
      gl.vertexAttribPointer(this.dotShader.aColor, 4, gl.FLOAT, false, 0, 0);

      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      gl.depthMask(false);

      gl.drawArrays(gl.POINTS, 0, this.satData.length);

      gl.depthMask(true);
      gl.disable(gl.BLEND);

      // now pickbuffer stuff......

      gl.useProgram(gl.pickShaderProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
      //   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.uniformMatrix4fv(gl.pickShaderProgram.uMvMatrix, false, mat4.create());
      gl.uniformMatrix4fv(gl.pickShaderProgram.uCamMatrix, false, camMatrix);
      gl.uniformMatrix4fv(gl.pickShaderProgram.uPMatrix, false, pMatrix);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.satPosBuf);
      gl.enableVertexAttribArray(gl.pickShaderProgram.aPos);
      gl.vertexAttribPointer(gl.pickShaderProgram.aPos, 3, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(gl.pickShaderProgram.aColor);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.pickColorBuf);
      gl.vertexAttribPointer(gl.pickShaderProgram.aColor, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.pickableBuf);
      gl.enableVertexAttribArray(gl.pickShaderProgram.aPickable);
      gl.vertexAttribPointer(gl.pickShaderProgram.aPickable, 1, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.POINTS, 0, this.satData.length); // draw pick

      this.lastDrawTime = now;
    } catch (error) {
      logger.error(error);
    }
  }

  getSat (i) {
    if (!this.satData) {
      return null;
    }
    const ret = this.satData[i];
    if (!ret) {
      return null;
    }

    if (this.gotExtraData) {
      ret.altitude = this.satAlt[i];
      ret.velocity = Math.sqrt(
        this.satVel[i * 3] * this.satVel[i * 3]
        + this.satVel[i * 3 + 1] * this.satVel[i * 3 + 1]
        + this.satVel[i * 3 + 2] * this.satVel[i * 3 + 2]
      );
      ret.position = {
        x: this.satPos[i * 3],
        y: this.satPos[i * 3 + 1],
        z: this.satPos[i * 3 + 2]
      };
    }
    return ret;
  }

  getIdFromIntlDes (intlDes) {
    for (let i = 0; i < this.satData.length; i++) {
      if (this.satData[i].INTLDES === intlDes || this.satData[i].intlDes === intlDes) {
        return i;
      }
    }
    return null;
  }

  getScreenCoords (i, pMatrix, camMatrix) {
    const pos = this.getSat(i).position;
    const posVec4 = vec4.fromValues(pos.x, pos.y, pos.z, 1);

    vec4.transformMat4(posVec4, posVec4, camMatrix);
    vec4.transformMat4(posVec4, posVec4, pMatrix);

    const glScreenPos = {
      x: (posVec4[0] / posVec4[3]),
      y: (posVec4[1] / posVec4[3]),
      z: (posVec4[2] / posVec4[3])
    };

    return {
      x: (glScreenPos.x + 1) * 0.5 * window.innerWidth,
      y: (-glScreenPos.y + 1) * 0.5 * window.innerHeight
    };
  }

  searchNameRegex (regex) {
    const res = [];
    for (let i = 0; i < this.satData.length; i++) {
      if (regex.test(this.satData[i].OBJECT_NAME)) {
        res.push(i);
      }
    }
    return res;
  }

  search (query) {
    const keys = Object.keys(query);
    let data = Object.assign([], this.satData);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      data = data.filter((entry) => entry[key] === query[key]);
    }
    return data;
  }

  searchName (name) {
    const res = [];
    for (let i = 0; i < this.satData.length; i++) {
      if (this.satData[i].OBJECT_NAME === name) {
        res.push(i);
      }
    }
    return res;
  }

  setHover (satId) {
    if (satId === this.hoveringSat) {
      return;
    }

    const { gl } = this.app;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.satColorBuf);
    if (this.hoveringSat !== this.app.selectedSat) {
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        this.hoveringSat * 4 * 4,
        new Float32Array(this.currentColorScheme.colorizer(this.hoveringSat).color)
      );
    }

    if (satId !== -1) {
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        satId * 4 * 4,
        new Float32Array(hoverColor)
      );
    }

    this.hoveringSat = satId;
  }

  selectSat (satelliteIdx) {
    if (satelliteIdx === this.app.selectedSat) {
      return;
    }

    const { gl } = this.app;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.satColorBuf);
    if (this.app.selectedSat !== -1) {
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        this.app.selectedSat * 4 * 4,
        new Float32Array(this.currentColorScheme.colorizer(this.app.selectedSat).color)
      );
    }
    if (satelliteIdx !== -1) {
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        satelliteIdx * 4 * 4,
        new Float32Array(selectedColor)
      );
    }
    this.app.selectedSat = satelliteIdx;
  }

  onCruncherReady (callback) {
    this.cruncherReadyCallback = callback;
    if (this.cruncherReady) {
      callback();
    }
  }
}

export default new SatSet();
