import { vec3, vec4, mat4 } from 'gl-matrix';
import { Spinner } from 'spin.js';

import Line from './line';
import { loadShaders, getShaderCode } from './shader-loader';

import satSet from './sat';
import Sun from './sun';
import Earth from './earth';
import { initColorSchemes } from './color-scheme';
import orbitDisplay from './orbit-display';
import searchBox from './search-box';
import satGroups from './sat-groups';
import logger from './logger';

const validateProgram = false;
let app;

const R2D = 180 / Math.PI;

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
let spinner;

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

function normalizeAngle (angle) {
  angle %= Math.PI * 2;
  if (angle > Math.PI) angle -= Math.PI * 2;
  if (angle < -Math.PI) angle += Math.PI * 2;
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

  const sat = satSet.getSat(satId);

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

    app.earth.draw(pMatrix, camMatrix);
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

function updateSelectBox () {
  const { selectedSat } = app;
  if (!selectedSat || selectedSat === -1) {
    return;
  }
  const satData = satSet.getSat(selectedSat);
  document.querySelector('#sat-altitude').innerHTML = `${satData.altitude.toFixed(2)} km`;
  document.querySelector('#sat-velocity').innerHTML = `${satData.velocity.toFixed(2)} km/s`;
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
  if (satId === -1) {
    document.querySelector('#sat-hoverbox').innerHTML = '(none)';
    document.querySelector('#sat-hoverbox').style.display = 'none';
    document.querySelector('#canvas').style.cursor = 'default';
  } else {
    try {
      //    logger.debug(pos);
      const satHoverBox = document.querySelector('#sat-hoverbox');
      satHoverBox.innerHTML = satSet.getSat(satId).OBJECT_NAME;
      satHoverBox.style.display = 'block';
      satHoverBox.style.position = 'absolute';
      satHoverBox.style.left = `${satX + 20}px`;
      satHoverBox.style.top = `${satY - 10}px`;
      document.querySelector('#canvas').style = { cursor: 'pointer' };
    } catch (error) {
      // ignore
    }
  }
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

function updateHover () {
  if (searchBox.isHovering()) {
    const satId = searchBox.getHoverSat();
    const satPos = satSet.getScreenCoords(satId, pMatrix, camMatrix);
    if (!earthHitTest(satPos.x, satPos.y)) {
      hoverBoxOnSat(satId, satPos.x, satPos.y);
    } else {
      hoverBoxOnSat(-1, 0, 0);
    }
  } else {
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

function drawLoop () {
  const { selectedSat } = app;
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
  updateSelectBox();
  requestAnimationFrame(drawLoop);
}

async function updateGroupList () {
  const groupDisplay = document.querySelector('#menu-groups #groups-display');
  groupDisplay.innerHTML = '<li data-group="<clear>" class="clear-option">Clear</li>';

  const groups = app.groups.asArray().sort((entryA, entryB) => entryA.name.localeCompare(entryB.name));

  let html = '<li data-group="<clear>" class="clear-option">Clear</li>';
  for (let i = 0; i < groups.length; i++) {
    html += `<li data-group="${groups[i].id}">${groups[i].name}</li>\n`;
  }

  groupDisplay.innerHTML = html;
}

function selectSat (satId) {
  if (satId === -1) {
    document.querySelector('#sat-infobox').classList.remove('visible');
    orbitDisplay.clearSelectOrbit();
    satSet.selectSat(-1);
  } else {
    camZoomSnappedOnSat = true;
    camAngleSnappedOnSat = true;

    app.satSet.selectSat(satId);
    // camSnapToSat(satId);
    const sat = satSet.getSat(satId);

    if (!sat) {
      return;
    }

    orbitDisplay.setSelectOrbit(satId);
    document.querySelector('#sat-infobox').classList.add('visible');
    document.querySelector('#sat-info-title').innerHTML = sat.OBJECT_NAME;
    document.querySelector('#sat-intl-des').innerHTML = sat.intlDes;
    document.querySelector('#sat-type').innerHTML = sat.OBJECT_TYPE;
    document.querySelector('#sat-apogee').innerHTML = `${sat.apogee.toFixed(0)} km`;
    document.querySelector('#sat-perigee').innerHTML = `${sat.perigee.toFixed(0)} km`;
    document.querySelector('#sat-inclination').innerHTML = `${(sat.inclination * R2D).toFixed(2)}°`;
    document.querySelector('#sat-period').innerHTML = `${sat.period.toFixed(2)} min`;
  }
  app.selectedSat = satId;

  app.updateUrl();
}

function initSpinner () {
  const opts = {
    lines: 11, // The number of lines to draw
    length: 8, // The length of each line
    width: 5, // The line thickness
    radius: 8, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#fff', // #rgb or #rrggbb or array of colors
    speed: 1, // Rounds per second
    trail: 50, // Afterglow percentage
    shadow: true, // Whether to render a shadow
    hwaccel: true, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '50%', // Top position relative to parent
    left: '50%' // Left position relative to parent
  };

  const target = document.querySelector('#spinner');
  spinner = new Spinner(opts);
  spinner.spin(target);
}

function initListeners () {
  let resizing = false;

  window.addEventListener('resize', () => {
    if (!resizing) {
      window.setTimeout(async () => {
        resizing = false;
        app.gl = webGlInit();
      }, 500);
    }
    // perfectScrollBar.update();
    resizing = true;
  });

  const canvasElement = document.querySelector('#canvas');

  canvasElement.addEventListener('touchmove', (event) => {
    event.preventDefault();
    if (isDragging) {
      dragHasMoved = true;
      camAngleSnappedOnSat = false;
      camZoomSnappedOnSat = false;
    }
    mouseX = event.originalEvent.touches[0].clientX;
    mouseY = event.originalEvent.touches[0].clientY;
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

  canvasElement.addEventListener('contextmenu', () => false); // stop right-click menu

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
    const x = event.originalEvent.touches[0].clientX;
    const y = event.originalEvent.touches[0].clientY;
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
      const clickedSat = getSatIdFromCoord(event.clientX, event.clientY);
      if (clickedSat === -1) {
        searchBox.hideResults();
      }
      selectSat(clickedSat);
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

  const menuItems = document.querySelectorAll('.menu-item');
  for (let i = 0; i < menuItems.length; i++) {
    const menuItem = menuItems[i];

    menuItem.addEventListener('mouseover', (event) => {
      const target = event.currentTarget;
      const subMenu = target.querySelector('.submenu');
      if (subMenu) {
        subMenu.style.display = 'block';
      }
    });

    menuItem.addEventListener('mouseout', (event) => {
      logger.debug('.menu-item', 'mouseout', event);
      const target = event.currentTarget;
      const subMenu = target.querySelector('.submenu');
      if (subMenu) {
        subMenu.style.display = 'none';
      }
    });
  }

  document.querySelector('#zoom-in').addEventListener('click', () => {
    zoomTarget -= 0.04;
    if (zoomTarget < 0) zoomTarget = 0;
    initialRotation = false;
    camZoomSnappedOnSat = false;
  });

  document.querySelector('#zoom-out').addEventListener('click', () => {
    zoomTarget += 0.04;
    if (zoomTarget > 1) {
      zoomTarget = 1;
    }
    initialRotation = false;
    camZoomSnappedOnSat = false;
  });
}

class App {
  constructor () {
    this.gl = undefined;
    this.satSet = satSet;
    this.satData = [];
    this.groups = undefined;
    this.selectedSat = -1;
    this.gl = undefined;
    this.earth = undefined;
    this.sun = undefined;
    this.validateProgram = validateProgram;
  }

  browserUnsupported () {
    logger.error('Unsupported browser. Not WebGL support available');
    document.querySelector('#canvas-holder').style.display = 'none';
    document.querySelector('#no-webgl').style.display = 'block';
  }

  updateUrl () {
    let url = '/';
    const paramSlices = [];

    // const search = new URLSearchParams(document.location.search);
    const query = {};

    if (this.selectedSat && this.selectedSat !== -1) {
      query.intldes = satSet.getSat(this.selectedSat).intlDes;
    }

    const currentSearch = searchBox.getCurrentSearch();
    if (currentSearch !== null) {
      query.search = currentSearch;
    }

    const keys = Object.keys(query);
    const params = [];
    if (keys.length > 0) {
      for (let i = 0; i < keys.length; i++) {
        params.push(`${keys[i]}=${query[keys[i]]}`);
      }
      url += `?${params.join('&')}`;
    }

    window.history.replaceState(null, 'Stuff in Space', url);

    if (paramSlices.length > 0) {
      url += `?${paramSlices.join('&')}`;
    }

    window.history.replaceState(null, 'Stuff in Space', url);
  }

  setHover (satelliteId) {
    orbitDisplay.setHoverOrbit(satelliteId);
    app.satSet.setHover(satelliteId);
  }
}

async function main () {
  app = new App();
  app.selectedSat = -1;

  app.sun = Sun;
  app.earth = Earth; // new Earth();
  app.satSet = satSet;
  searchBox.init(app);
  initSpinner();

  await loadShaders();

  app.gl = webGlInit();
  app.earth.init(app);
  app.satSet = satSet;
  app.groups = satGroups;
  app.selectSat = selectSat;

  initColorSchemes(app);

  satSet.init(app, (satData) => {
    app.satData = satData;
    satGroups.init(app);
    orbitDisplay.init(app);
    searchBox.init(app);
    updateGroupList();

    debugLine = new Line(app.gl);
    debugLine2 = new Line(app.gl);
    debugLine3 = new Line(app.gl);
  });

  satSet.onCruncherReady(() => {
    if (spinner) {
      spinner.stop();
    }

    const searchParams = new URLSearchParams(document.location.search);
    if (searchParams.get('intldes')) {
      const value = searchParams.get('intldes');
      const urlSatId = satSet.getIdFromIntlDes(value.toUpperCase());
      if (urlSatId !== null) {
        selectSat(urlSatId);
      }
    } else if (searchParams.get('search')) {
      const value = searchParams.get('search');
      searchBox.doSearch(value);
      document.querySelector('#search').value = value;
    }

    initListeners();
    searchBox.init(app); // .satData);
  });

  drawLoop();
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await main();
    // hoverBoxOnSat(app.selectedSat);
  } catch (error) {
    logger.debug(error);
  }
});
