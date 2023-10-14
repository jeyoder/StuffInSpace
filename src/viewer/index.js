import { vec3, vec4, mat4 } from 'gl-matrix';
import { Events } from '../constants';
import logger from '../utils/logger';
import { loadShaders, getShaderCode } from './shader-loader';
import Line from './line';
import earth from './earth';
import sun from './sun';
import satSet from './sat';
import orbitDisplay from './orbit-display';
import satGroups from './sat-groups';
import { initColorSchemes } from './color-scheme';
import EventManager from '../utils/event-manager';

const supporteEvents = [];
const eventManager = new EventManager();

let app;
let camYaw = 0;
let camPitch = 0.5;

let camYawTarget = 0;
let camPitchTarget = 0;
let camSnapMode = false;
let camZoomSnappedOnSat = false;
let camAngleSnappedOnSat = false;

// const camDistTarget = 10000;
let zoomLevel = 0.5; // 0.3222219019927697; // 0.5;
let zoomTarget = 0.5;
const ZOOM_EXP = 1;
const DIST_MIN = 6400;
const DIST_MAX = 200000;

let camPitchSpeed = 0;
let camYawSpeed = 0;

let pickFb;
let pickTex;
let pickColorBuf;

let pMatrix = mat4.create();
let camMatrix = mat4.create();

let lastHoverSatId = -1;
let mouseX = 0;
let mouseY = 0;
let mouseSat = -1;

let dragPoint = [0, 0, 0];
let screenDragPoint = [0, 0];
let dragStartPitch = 0;
let dragStartYaw = 0;
let isDragging = false;
let dragHasMoved = false;

let initialRotation = true;
const initialRotSpeed = 0.000075;

// let debugContext;
// let debugImageData;

let debugLine;
let debugLine2;
let debugLine3;

let selectedSat;

let oldT = new Date();

function getCanvas () {
  const elementId = 'canvas';
  const canvas = document.querySelector(`#${elementId}`);
  return canvas;
}

function webGlInit () {
  const canvas = getCanvas(); // document.querySelector('#canvas')[0];

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const glOptions = {
    // antialias: false,
    alpha: false,
    premultipliedAlpha: false
  };

  const gl = canvas.getContext('webgl2', glOptions)
    || canvas.getContext('webgl', glOptions)
    || canvas.getContext('experimental-webgl', glOptions);

  if (!gl) {
    app.browserUnsupported();
  }

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(0x8642);

  const pFragShader = gl.createShader(gl.FRAGMENT_SHADER);
  const pFragCode = getShaderCode('pick-fragment.glsl');
  gl.shaderSource(pFragShader, pFragCode);
  gl.compileShader(pFragShader);

  const pVertShader = gl.createShader(gl.VERTEX_SHADER);
  const pVertCode = getShaderCode('pick-vertex.glsl');
  gl.shaderSource(pVertShader, pVertCode);
  gl.compileShader(pVertShader);

  const pickShaderProgram = gl.createProgram();
  gl.attachShader(pickShaderProgram, pVertShader);
  gl.attachShader(pickShaderProgram, pFragShader);
  gl.linkProgram(pickShaderProgram);

  pickShaderProgram.aPos = gl.getAttribLocation(pickShaderProgram, 'aPos');
  pickShaderProgram.aColor = gl.getAttribLocation(pickShaderProgram, 'aColor');
  pickShaderProgram.aPickable = gl.getAttribLocation(pickShaderProgram, 'aPickable');
  pickShaderProgram.uCamMatrix = gl.getUniformLocation(pickShaderProgram, 'uCamMatrix');
  pickShaderProgram.uMvMatrix = gl.getUniformLocation(pickShaderProgram, 'uMvMatrix');
  pickShaderProgram.uPMatrix = gl.getUniformLocation(pickShaderProgram, 'uPMatrix');

  gl.pickShaderProgram = pickShaderProgram;

  pickFb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, pickFb);

  pickTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, pickTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // makes clearing work
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  const rb = gl.createRenderbuffer(); // create RB to store the depth buffer
  gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickTex, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);

  gl.pickFb = pickFb;

  pickColorBuf = new Uint8Array(4);

  pMatrix = mat4.create();
  mat4.perspective(pMatrix, 1.01, gl.drawingBufferWidth / gl.drawingBufferHeight, 20.0, 600000.0);
  const eciToOpenGlMat = [
    1, 0, 0, 0,
    0, 0, -1, 0,
    0, 1, 0, 0,
    0, 0, 0, 1
  ];
  mat4.mul(pMatrix, pMatrix, eciToOpenGlMat); // pMat = pMat * ecioglMat

  return gl;
}

function getCamDist () {
  return zoomLevel ** ZOOM_EXP * (DIST_MAX - DIST_MIN) + DIST_MIN;
}

function getCamPos () {
  const r = getCamDist();
  const z = r * Math.sin(camPitch);
  const rYaw = r * Math.cos(camPitch);
  const x = rYaw * Math.sin(camYaw);
  const y = rYaw * Math.cos(camYaw) * -1;
  return [x, y, z];
}

function unProject (mx, my) {
  const gl = app.gl;

  const glScreenX = (mx / (gl.drawingBufferWidth * 2)) - 1.0;
  const glScreenY = 1.0 - (my / (gl.drawingBufferHeight * 2));
  const screenVec = [glScreenX, glScreenY, -0.01, 1.0]; // gl screen coords

  const comboPMat = mat4.create();
  mat4.mul(comboPMat, pMatrix, camMatrix);
  const invMat = mat4.create();
  mat4.invert(invMat, comboPMat);
  const worldVec = vec4.create();
  vec4.transformMat4(worldVec, screenVec, invMat);

  return [worldVec[0] / worldVec[3], worldVec[1] / worldVec[3], worldVec[2] / worldVec[3]];
}

function getEarthScreenPoint (x, y) {
  const rayOrigin = getCamPos();
  const ptThru = unProject(x, y);

  const rayDir = vec3.create();
  vec3.subtract(rayDir, ptThru, rayOrigin); // rayDir = ptThru - rayOrigin
  vec3.normalize(rayDir, rayDir);

  const toCenterVec = vec3.create();
  vec3.scale(toCenterVec, rayOrigin, -1); // toCenter is just -camera pos because center is at [0,0,0]
  const dParallel = vec3.dot(rayDir, toCenterVec);

  const longDir = vec3.create();
  vec3.scale(longDir, rayDir, dParallel); // longDir = rayDir * distParallel
  vec3.add(ptThru, rayOrigin, longDir); // ptThru is now on the plane going through the center of sphere
  const dPerp = vec3.len(ptThru);

  const dSubSurf = Math.sqrt(6371 * 6371 - dPerp * dPerp);
  const dSurf = dParallel - dSubSurf;

  const ptSurf = vec3.create();
  vec3.scale(ptSurf, rayDir, dSurf);
  vec3.add(ptSurf, ptSurf, rayOrigin);

  return ptSurf;
}

function earthHitTest (x, y) {
  const gl = app.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
  gl.readPixels(x, gl.drawingBufferHeight - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pickColorBuf);

  return (pickColorBuf[0] === 0
    && pickColorBuf[1] === 0
    && pickColorBuf[2] === 0);
}

function hoverBoxOnSat (satId, satX, satY) {
  // No need to fie event if we are still not hovering on anything
  if (lastHoverSatId === satId) {
    return;
  }

  eventManager.fireEvent(Events.satHover, {
    source: { function: 'hoverBoxOnSat' },
    satId,
    satX,
    satY,
    satellite: satId !== -1 ? satSet.getSat(satId) : undefined
  });

  lastHoverSatId = satId;
}

function getSatIdFromCoord (x, y) {
  const gl = app.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
  gl.readPixels(x, gl.drawingBufferHeight - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pickColorBuf);

  const pickR = pickColorBuf[0];
  const pickG = pickColorBuf[1];
  const pickB = pickColorBuf[2];

  // eslint-disable-next-line no-bitwise
  return ((pickB << 16) | (pickG << 8) | (pickR)) - 1;
}

function setHover (satelliteId) {
  app.orbitDisplay.setHoverOrbit(satelliteId);
  app.satSet.setHover(satelliteId);
}

function updateHover () {
  const { hoverSatId } = app;
  if (hoverSatId) {
    // const satId = searchBox.getHoverSat();
    const satPos = satSet.getScreenCoords(hoverSatId, pMatrix, camMatrix);
    if (!earthHitTest(satPos.x, satPos.y)) {
      hoverBoxOnSat(hoverSatId, satPos.x, satPos.y);
    } else {
      hoverBoxOnSat(-1, 0, 0);
    }
  } else {
    // TODO too slow need to speed this up
    mouseSat = getSatIdFromCoord(mouseX, mouseY);
    if (mouseSat !== -1) {
      orbitDisplay.setHoverOrbit(mouseSat);
    } else {
      orbitDisplay.clearHoverOrbit();
    }
    satSet.setHover(mouseSat);
    hoverBoxOnSat(mouseSat, mouseX, mouseY);
  }
}

function normalizeAngle (angle) {
  angle %= Math.PI * 2;
  if (angle > Math.PI) {
    angle -= Math.PI * 2;
  }
  if (angle < -Math.PI) {
    angle += Math.PI * 2;
  }
  return angle;
}

function camSnap (pitch, yaw) {
  camPitchTarget = pitch;
  camYawTarget = normalizeAngle(yaw);
  camSnapMode = true;
}

function camSnapToSat (satId) {
  /* this function runs every frame that a satellite is seleected. However, the user might have broken out of the
  zoom snap or angle snap. If so, don't change those targets. */

  const sat = app.satSet.getSat(satId);

  if (camAngleSnappedOnSat) {
    const pos = sat.position;

    const r = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
    const yaw = Math.atan2(pos.y, pos.x) + Math.PI / 2;
    const pitch = Math.atan2(pos.z, r);
    camSnap(pitch, yaw);
  }

  if (camZoomSnappedOnSat) {
    const camDistTarget = sat.altitude + 6371 + 2000;
    zoomTarget = ((camDistTarget - DIST_MIN) / (DIST_MAX - DIST_MIN)) ** (1 / ZOOM_EXP);
  }
}

function drawScene () {
  const gl = app.gl;

  try {
    gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // eslint-disable-next-line no-bitwise
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    camMatrix = mat4.create();
    mat4.identity(camMatrix);
    mat4.translate(camMatrix, camMatrix, [0, getCamDist(), 0]);
    mat4.rotateX(camMatrix, camMatrix, camPitch);
    mat4.rotateZ(camMatrix, camMatrix, -camYaw);

    gl.useProgram(gl.pickShaderProgram);
    gl.uniformMatrix4fv(gl.pickShaderProgram.uPMatrix, false, pMatrix);
    gl.uniformMatrix4fv(gl.pickShaderProgram.camMatrix, false, camMatrix);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // eslint-disable-next-line no-bitwise
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (debugLine) {
      debugLine.draw();
    }
    if (debugLine2) {
      debugLine2.draw();
    }
    if (debugLine3) {
      debugLine3.draw();
    }

    earth.draw(pMatrix, camMatrix);
    satSet.draw(pMatrix, camMatrix);
    orbitDisplay.draw(pMatrix, camMatrix);

    /* DEBUG - show the pickbuffer on a canvas */
    // debugImageData.data = pickColorMap;
    /* debugImageData.data.set(pickColorMap);
    debugContext.putImageData(debugImageData, 0, 0); */
  } catch (error) {
    logger.debug('Error drawing scene', error);
  }
}

function drawLoop () {
  const newT = new Date();
  const dt = Math.min(newT - oldT, 1000);
  oldT = newT;

  const dragTarget = getEarthScreenPoint(mouseX, mouseY);
  if (isDragging) {
    if (Number.isNaN(dragTarget[0]) || Number.isNaN(dragTarget[1]) || Number.isNaN(dragTarget[2])
      || Number.isNaN(dragPoint[0]) || Number.isNaN(dragPoint[1]) || Number.isNaN(dragPoint[2])) { // random screen drag
      const xDif = screenDragPoint[0] - mouseX;
      const yDif = screenDragPoint[1] - mouseY;
      const yawTarget = dragStartYaw + xDif * 0.005;
      const pitchTarget = dragStartPitch + yDif * -0.005;
      camPitchSpeed = normalizeAngle(camPitch - pitchTarget) * -0.005;
      camYawSpeed = normalizeAngle(camYaw - yawTarget) * -0.005;
    } else { // earth surface point drag
      const dragPointR = Math.sqrt(dragPoint[0] * dragPoint[0] + dragPoint[1] * dragPoint[1]);
      const dragTargetR = Math.sqrt(dragTarget[0] * dragTarget[0] + dragTarget[1] * dragTarget[1]);

      const dragPointLon = Math.atan2(dragPoint[1], dragPoint[0]);
      const dragTargetLon = Math.atan2(dragTarget[1], dragTarget[0]);

      const dragPointLat = Math.atan2(dragPoint[2], dragPointR);
      const dragTargetLat = Math.atan2(dragTarget[2], dragTargetR);

      const pitchDif = dragPointLat - dragTargetLat;
      const yawDif = normalizeAngle(dragPointLon - dragTargetLon);
      camPitchSpeed = pitchDif * 0.015;
      camYawSpeed = yawDif * 0.015;
    }
    camSnapMode = false;
  } else {
    camPitchSpeed -= (camPitchSpeed * dt * 0.005); // decay speeds when globe is "thrown"
    camYawSpeed -= (camYawSpeed * dt * 0.005);
  }

  camPitch += camPitchSpeed * dt;
  camYaw += camYawSpeed * dt;

  if (initialRotation) {
    camYaw += initialRotSpeed * dt;
  }

  if (camSnapMode) {
    camPitch += (camPitchTarget - camPitch) * 0.003 * dt;

    const yawErr = normalizeAngle(camYawTarget - camYaw);
    camYaw += yawErr * 0.003 * dt;

    zoomLevel += (zoomTarget - zoomLevel) * dt * 0.0025;
  } else {
    zoomLevel += (zoomTarget - zoomLevel) * dt * 0.0075;
  }

  if (camPitch > Math.PI / 2) {
    camPitch = Math.PI / 2;
  }

  if (camPitch < -Math.PI / 2) {
    camPitch = -Math.PI / 2;
  }

  // camYaw = (camYaw % (Math.PI*2));
  camYaw = normalizeAngle(camYaw);

  // logger.debug(camYaw * R2D);
  if (selectedSat && selectedSat !== -1) {
    const sat = satSet.getSat(selectedSat);
    debugLine.set(sat, [0, 0, 0]);
    camSnapToSat(selectedSat);
  }

  drawScene();
  updateHover();

  // TODO probably should not be based on draw loop?
  const satData = app.satSet.getSat(selectedSat);
  if (satData) {
    eventManager.fireEvent(Events.satMovementChange, {
      satId: selectedSat,
      satellite: satData,
      altitude: satData.altitude,
      velocity: satData.velocity
    });
  }

  requestAnimationFrame(drawLoop);
}

function zoomIn () {
  zoomTarget -= 0.04;
  if (zoomTarget < 0) {
    zoomTarget = 0;
  }
  initialRotation = false;
  camZoomSnappedOnSat = false;
}

function zoomOut () {
  zoomTarget += 0.04;
  if (zoomTarget > 1) {
    zoomTarget = 1;
  }
  initialRotation = false;
  camZoomSnappedOnSat = false;
}

function setSelectedSatellite (satelliteId) {
  if (satelliteId !== -1) {
    camZoomSnappedOnSat = true;
    camAngleSnappedOnSat = true;
  }

  satSet.setSelectedSatellite(satelliteId);
  orbitDisplay.setSelectedSatellite(satelliteId);

  selectedSat = satelliteId;
  eventManager.fireEvent(
    Events.selectedSatChange,
    {
      satelliteId,
      satId: satelliteId,
      satellite: satSet.getSat(satelliteId)
    }
  );
}

function getSelectedSatellite () {
  return selectedSat;
}

function initEventListeners () {
  let resizing = false;

  window.addEventListener('resize', () => {
    if (!resizing) {
      window.setTimeout(async () => {
        resizing = false;
        app.gl = webGlInit();
      }, 500);
    }
    resizing = true;
  });

  window.addEventListener('gesturestart', (event) => {
    event.preventDefault();
    let scale = event.scale;
    if (scale > 1) {
      scale -= 1;
    }
    const delta = Math.abs(0.01 * scale);
    if (event.scale < 1.0) {
      zoomIn(delta);
    } else {
      zoomOut(delta);
    }
  });

  // Safari specific
  window.addEventListener('gestureend', (event) => {
    event.preventDefault();
    dragHasMoved = false;
    isDragging = false;
    initialRotation = false;
  });

  // Safari specific
  window.addEventListener('gesturechange', (event) => {
    event.preventDefault();
    let scale = event.scale;
    if (scale > 1) {
      scale -= 1;
    }
    const delta = Math.abs(0.01 * scale);
    if (event.scale < 1.0) {
      zoomIn(delta);
    } else {
      zoomOut(delta);
    }
  });

  const canvasElement = document.querySelector('#canvas');

  canvasElement.addEventListener('touchmove', (event) => {
    event.preventDefault();
    if (isDragging) {
      dragHasMoved = true;
      camAngleSnappedOnSat = false;
      camZoomSnappedOnSat = false;
    }
    mouseX = event.touches[0].clientX;
    mouseY = event.touches[0].clientY;
  }, { passive: false });

  canvasElement.addEventListener('mousemove', (event) => {
    if (isDragging) {
      dragHasMoved = true;
      camAngleSnappedOnSat = false;
      camZoomSnappedOnSat = false;
    }
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  canvasElement.addEventListener('wheel', (event) => {
    let delta = event.deltaY;
    if (event.deltaMode === 1) {
      delta *= 33.3333333;
    }
    zoomTarget += delta * 0.0002;
    if (zoomTarget > 1) {
      zoomTarget = 1;
    }
    if (zoomTarget < 0) {
      zoomTarget = 0;
    }
    initialRotation = false;
    camZoomSnappedOnSat = false;
  }, { passive: true });

  canvasElement.addEventListener('mousedown', (event) => {
    dragPoint = getEarthScreenPoint(event.clientX, event.clientY);
    screenDragPoint = [event.clientX, event.clientY];
    dragStartPitch = camPitch;
    dragStartYaw = camYaw;
    isDragging = true;
    camSnapMode = false;
    initialRotation = false;
  });

  canvasElement.addEventListener('touchstart', (event) => {
    const x = event.touches[0].clientX;
    const y = event.touches[0].clientY;
    dragPoint = getEarthScreenPoint(x, y);
    screenDragPoint = [x, y];
    dragStartPitch = camPitch;
    dragStartYaw = camYaw;
    isDragging = true;
    camSnapMode = false;
    initialRotation = false;
  }, { passive: false });

  canvasElement.addEventListener('mouseup', (event) => {
    if (!dragHasMoved) {
      const clickedSatelliteId = getSatIdFromCoord(event.clientX, event.clientY);
      selectedSat = clickedSatelliteId;
      setSelectedSatellite(selectedSat);
    }

    dragHasMoved = false;
    isDragging = false;
    initialRotation = false;
  });

  canvasElement.addEventListener('touchend', () => {
    dragHasMoved = false;
    isDragging = false;
    initialRotation = false;
  }, { passive: true });
}

function getSupportedEvents () {
  return supporteEvents;
}

function getSatGroups () {
  return satGroups;
}

function getSatSet () {
  return satSet;
}

function getSatellite (satelliteId) {
  return satSet.getSat(satelliteId);
}

function setSatelliteGroup (satelliteGroup) {
  satGroups.selectGroup(satelliteGroup);
}

async function onSatSetLoaded ({ satData }) {
  app.satData = satData;
  satGroups.init(app, app.config.satelliteGroups);
  await orbitDisplay.init(app);

  // Fire this beyoned the viewer
  eventManager.fireEvent(Events.satDataLoaded, { satData });

  drawLoop();
}

function addEventListener (eventName, listener) {
  eventManager.addEventListener(eventName, listener);
}

async function init (appContext) {
  app = appContext;

  for (let i = 0; i < supporteEvents.length; i++) {
    this.listeners[supporteEvents[i]] = new Set();
  }

  await loadShaders();

  app.groups = satGroups;
  app.orbitDisplay = orbitDisplay;

  const gl = webGlInit();
  app.gl = gl;

  initEventListeners();

  initColorSchemes(app);

  app.satSet = satSet;
  app.sun = sun;
  app.earth = earth;

  satSet.addEventListener(Events.satDataLoaded, onSatSetLoaded);

  app.earth.init(app);

  debugLine = new Line(gl);
  debugLine2 = new Line(gl);
  debugLine3 = new Line(gl);

  satSet.init(app);
}

export default {
  webGlInit,
  zoomIn,
  zoomOut,
  initEventListeners,
  addEventListener,
  init,
  getSupportedEvents,
  drawLoop,
  setHover,
  getSatGroups,
  getSatSet,
  setSelectedSatellite,
  getSelectedSatellite,
  getSatellite,
  setSatelliteGroup
};
