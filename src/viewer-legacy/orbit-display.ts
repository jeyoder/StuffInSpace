import { mat4 } from 'gl-matrix';

import { getShaderCode } from './shader-loader';
import logger from '../utils/logger';

// eslint-disable-next-line import/no-unresolved
import worker from './workers/orbit-calculation-worker?worker';

const NUM_SEGS = 255;

const inProgress: any[] = [];
const glBuffers: any[] = [];

let pathShader: any;

let selectOrbitBuf: any;
let hoverOrbitBuf: any;

const selectColor = [0.0, 1.0, 0.0, 1.0];
const hoverColor = [0.5, 0.5, 1.0, 1.0];
const groupColor = [0.3, 0.5, 1.0, 0.4];

let currentHoverId = -1;
let currentSelectId = -1;

let orbitMvMat: any;
let orbitWorker: any;
let app: any;

let initialized = false;

function allocateBuffer () {
  const gl = app.gl;
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS + 1) * 3), gl.STATIC_DRAW);
  return buf;
}

function updateOrbitBuffer (satId: number) {
  if (!inProgress[satId]) {
    logger.debug('Sending data to orbit worker, to update orbit buffer');
    orbitWorker.postMessage({
      isInit: false,
      satId
    });
    inProgress[satId] = true;
  }
}

function onmessage (message: any) {
  const gl = app.gl;
  const { satId } = message.data;
  const pointsOut = new Float32Array(message.data.pointsOut);
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[satId]);
  gl.bufferData(gl.ARRAY_BUFFER, pointsOut, gl.DYNAMIC_DRAW);
  inProgress[satId] = false;
}

function setSelectedSatellite (satelliteId: number) {
  currentSelectId = satelliteId;
  updateOrbitBuffer(satelliteId);
}

function clearSelectOrbit () {
  const gl = app.gl;
  currentSelectId = -1;
  gl.bindBuffer(gl.ARRAY_BUFFER, selectOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS + 1) * 3), gl.DYNAMIC_DRAW);
}

function setHoverOrbit (satId: number) {
  if (satId === currentHoverId) {
    return;
  }

  currentHoverId = satId;
  updateOrbitBuffer(satId);
}

function clearHoverOrbit () {
  if (currentHoverId === -1) {
    return;
  }
  const gl = app.gl;
  currentHoverId = -1;

  gl.bindBuffer(gl.ARRAY_BUFFER, hoverOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS + 1) * 3), gl.DYNAMIC_DRAW);
}

function draw (pMatrix: any, camMatrix: any) { // lol what do I do here
  if (!initialized) {
    return;
  }

  const gl = app.gl as WebGL2RenderingContext;

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(pathShader);

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  // gl.depthMask(false);

  gl.uniformMatrix4fv(pathShader.uMvMatrix, false, orbitMvMat);
  gl.uniformMatrix4fv(pathShader.uCamMatrix, false, camMatrix);
  gl.uniformMatrix4fv(pathShader.uPMatrix, false, pMatrix);

  if (currentSelectId !== -1 && glBuffers[currentSelectId]) {
    gl.uniform4fv(pathShader.uColor, selectColor);
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[currentSelectId]);
    gl.vertexAttribPointer(pathShader.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, NUM_SEGS + 1);
  }

  if (currentSelectId !== -1 && !glBuffers[currentSelectId]) {
    throw new Error(`No id ${currentSelectId} ... ${glBuffers.length}`);
  }

  if (currentHoverId !== -1 && currentHoverId !== currentSelectId) { // avoid z-fighting
    gl.uniform4fv(pathShader.uColor, hoverColor);
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[currentHoverId]);
    gl.vertexAttribPointer(pathShader.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, NUM_SEGS + 1);
  }
  if (app.groups.selectedGroup) {
    gl.uniform4fv(pathShader.uColor, groupColor);
    const satellites = app.groups.selectedGroup.sats;
    satellites.forEach((satellite: any) => {
      const id = satellite.satId;
      if (glBuffers[id]) {
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[id]);
        gl.vertexAttribPointer(pathShader.aPos, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINE_STRIP, 0, NUM_SEGS + 1);
      } else {
        logger.warn(`glBuffers[${id}] is undefined`);
      }
    });
  }

  // gl.depthMask(true);
  gl.disable(gl.BLEND);
}

function getPathShader () {
  return pathShader;
}

function onSelectedSatChange (event: any) {
  if (!event.satId || event.satId === -1) {
    clearSelectOrbit();
    setSelectedSatellite(-1);
  } else {
    setSelectedSatellite(event.satId);
  }
}

function init (appContext: any) {
  app = appContext;
  const startTime = performance.now();
  const gl = app.gl;

  app.addEventListener('selectedsatchange', onSelectedSatChange);

  logger.info('Kicking off orbit-calculation-worker');
  orbitWorker = new worker();
  orbitWorker.onmessage = onmessage;

  orbitMvMat = mat4.create();

  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, getShaderCode('path-vertex.glsl'));
  gl.compileShader(vs);

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, getShaderCode('path-fragment.glsl'));
  gl.compileShader(fs);

  pathShader = gl.createProgram();
  gl.attachShader(pathShader, vs);
  gl.attachShader(pathShader, fs);
  gl.linkProgram(pathShader);

  pathShader.aPos = gl.getAttribLocation(pathShader, 'aPos');
  pathShader.uMvMatrix = gl.getUniformLocation(pathShader, 'uMvMatrix');
  pathShader.uCamMatrix = gl.getUniformLocation(pathShader, 'uCamMatrix');
  pathShader.uPMatrix = gl.getUniformLocation(pathShader, 'uPMatrix');
  pathShader.uColor = gl.getUniformLocation(pathShader, 'uColor');

  selectOrbitBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, selectOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS + 1) * 3), gl.STATIC_DRAW);

  hoverOrbitBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, hoverOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS + 1) * 3), gl.STATIC_DRAW);

  for (let i = 0; i < app.satSet.numSats; i++) {
    glBuffers.push(allocateBuffer());
  }

  logger.debug('Sending data to orbit worker, so it knows about the satellites');
  orbitWorker.postMessage({
    isInit: true,
    satData: app.satSet.satDataString,
    numSegs: NUM_SEGS
  });

  initialized = true;

  const time = performance.now() - startTime;

  logger.debug(`orbitDisplay init: ${time} ms`);
}

export default {
  init,
  draw,
  clearHoverOrbit,
  getPathShader,
  allocateBuffer,
  setHoverOrbit,
  clearSelectOrbit,
  setSelectedSatellite,
  onmessage,
  updateOrbitBuffer
};
