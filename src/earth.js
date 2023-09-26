import { mat4, vec3, mat3 } from 'gl-matrix';
import { jday, gstime } from 'satellite.js';
import { getShaderCode } from './shader-loader';

import logger from './logger';

const NUM_LAT_SEGS = 64;
const NUM_LON_SEGS = 64;
let pos = [3.0, 0.0, 1.0];
const radius = 6371.0;

let vertPosBuf;
let vertNormBuf;
let texCoordBuf;
let vertIndexBuf; // GPU mem buffers, data and stuff?
let vertCount;

let earthShader;

let texture;
let nightTexture;

let texLoaded = false;
let nightLoaded = false;
let loaded = false;

let app;

function onImageLoaded () {
  if (texLoaded && nightLoaded) {
    loaded = true;
    document.querySelector('#loader-text').innerHTML = 'Downloading satellites...';
  }
}

function init (appContext) {
  app = appContext;
  const gl = app.gl;

  const startTime = new Date().getTime();

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  const fragCode = getShaderCode('earth-fragment.glsl');
  gl.shaderSource(fragShader, fragCode);
  gl.compileShader(fragShader);

  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  const vertCode = getShaderCode('earth-vertex.glsl');
  gl.shaderSource(vertShader, vertCode);
  gl.compileShader(vertShader);

  earthShader = gl.createProgram();
  gl.attachShader(earthShader, vertShader);
  gl.attachShader(earthShader, fragShader);
  gl.linkProgram(earthShader);

  earthShader.aVertexPosition = gl.getAttribLocation(earthShader, 'aVertexPosition');
  earthShader.aTexCoord = gl.getAttribLocation(earthShader, 'aTexCoord');
  earthShader.aVertexNormal = gl.getAttribLocation(earthShader, 'aVertexNormal');
  earthShader.uPMatrix = gl.getUniformLocation(earthShader, 'uPMatrix');
  earthShader.uCamMatrix = gl.getUniformLocation(earthShader, 'uCamMatrix');
  earthShader.uMvMatrix = gl.getUniformLocation(earthShader, 'uMvMatrix');
  earthShader.uNormalMatrix = gl.getUniformLocation(earthShader, 'uNormalMatrix');
  earthShader.uLightDirection = gl.getUniformLocation(earthShader, 'uLightDirection');
  earthShader.uAmbientLightColor = gl.getUniformLocation(earthShader, 'uAmbientLightColor');
  earthShader.uDirectionalLightColor = gl.getUniformLocation(earthShader, 'uDirectionalLightColor');
  earthShader.uSampler = gl.getUniformLocation(earthShader, 'uSampler');
  earthShader.uNightSampler = gl.getUniformLocation(earthShader, 'uNightSampler');

  texture = gl.createTexture();
  const img = new Image();
  // img.addEventListenerload = function() {
  img.addEventListener('load', () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    logger.debug('earth.js loaded texture');
    texLoaded = true;
    onImageLoaded();
  });
  img.src = 'images/mercator-tex.jpg';

  nightTexture = gl.createTexture();
  const nightImg = new Image();
  nightImg.addEventListener('load', () => {
    gl.bindTexture(gl.TEXTURE_2D, nightTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, nightImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    logger.debug('earth.js loaded nightearth');
    nightLoaded = true;
    onImageLoaded();
  });
  nightImg.src = 'images/nightearth-4096.png';

  // generate a uvsphere bottom up, CCW order
  const vertPos = [];
  const vertNorm = [];
  const texCoord = [];

  for (let lat = 0; lat <= NUM_LAT_SEGS; lat++) {
    const latAngle = (Math.PI / NUM_LAT_SEGS) * lat - (Math.PI / 2);
    const diskRadius = Math.cos(Math.abs(latAngle));
    const z = Math.sin(latAngle);

    for (let lon = 0; lon <= NUM_LON_SEGS; lon++) { // add an extra vertex for texture funness
      const lonAngle = ((Math.PI * 2) / NUM_LON_SEGS) * lon;
      const x = Math.cos(lonAngle) * diskRadius;
      const y = Math.sin(lonAngle) * diskRadius;

      // mercator cylindrical projection (simple angle interpolation)
      const v = 1 - (lat / NUM_LAT_SEGS);
      const u = 0.5 + (lon / NUM_LON_SEGS); // may need to change to move map
      //    console.log('u: ' + u + ' v: ' + v);
      // normals: should just be a vector from center to point (aka the point itself!

      vertPos.push(x * radius);
      vertPos.push(y * radius);
      vertPos.push(z * radius);
      texCoord.push(u);
      texCoord.push(v);
      vertNorm.push(x);
      vertNorm.push(y);
      vertNorm.push(z);
    }
  }

  // ok let's calculate vertex draw orders.... indiv triangles
  const vertIndex = [];
  for (let lat = 0; lat < NUM_LAT_SEGS; lat++) { // this is for each QUAD, not each vertex, so <
    for (let lon = 0; lon < NUM_LON_SEGS; lon++) {
      const blVert = lat * (NUM_LON_SEGS + 1) + lon; // there's NUM_LON_SEGS + 1 verts in each horizontal band
      const brVert = blVert + 1;
      const tlVert = (lat + 1) * (NUM_LON_SEGS + 1) + lon;
      const trVert = tlVert + 1;

      vertIndex.push(blVert);
      vertIndex.push(brVert);
      vertIndex.push(tlVert);

      vertIndex.push(tlVert);
      vertIndex.push(trVert);
      vertIndex.push(brVert);
    }
  }
  vertCount = vertIndex.length;

  vertPosBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertPosBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

  vertNormBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertNormBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertNorm), gl.STATIC_DRAW);

  texCoordBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoord), gl.STATIC_DRAW);

  vertIndexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertIndexBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertIndex), gl.STATIC_DRAW);

  const end = new Date().getTime() - startTime;
  logger.debug(`earth init: ${end} ms`);
}

function draw (pMatrix, camMatrix) {
  if (!loaded) {
    return;
  }

  const gl = app.gl;
  const now = new Date();

  let j = jday(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  );
  j += now.getUTCMilliseconds() * 1.15741e-8; // days per millisecond

  const era = gstime(j);

  const lightDirection = app.sun.currentDirection();
  vec3.normalize(lightDirection, lightDirection);

  const mvMatrix = mat4.create();
  mat4.identity(mvMatrix);
  mat4.rotateZ(mvMatrix, mvMatrix, era);
  mat4.translate(mvMatrix, mvMatrix, pos);
  const nMatrix = mat3.create();
  mat3.normalFromMat4(nMatrix, mvMatrix);

  gl.useProgram(earthShader);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.uniformMatrix3fv(earthShader.uNormalMatrix, false, nMatrix);
  gl.uniformMatrix4fv(earthShader.uMvMatrix, false, mvMatrix);
  gl.uniformMatrix4fv(earthShader.uPMatrix, false, pMatrix);
  gl.uniformMatrix4fv(earthShader.uCamMatrix, false, camMatrix);
  gl.uniform3fv(earthShader.uLightDirection, lightDirection);
  gl.uniform3fv(earthShader.uAmbientLightColor, [0.03, 0.03, 0.03]); // RGB ambient light
  gl.uniform3fv(earthShader.uDirectionalLightColor, [1, 1, 0.9]); // RGB directional light

  gl.uniform1i(earthShader.uSampler, 0); // point sampler to TEXTURE0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture); // bind texture to TEXTURE0

  gl.uniform1i(earthShader.uNightSampler, 1); // point sampler to TEXTURE1
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, nightTexture); // bind tex to TEXTURE1

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuf);
  gl.enableVertexAttribArray(earthShader.aTexCoord);
  gl.vertexAttribPointer(earthShader.aTexCoord, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertPosBuf);
  gl.enableVertexAttribArray(earthShader.aVertexPosition);
  gl.vertexAttribPointer(earthShader.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.vertexAttribPointer(gl.pickShaderProgram.aPos, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertNormBuf);
  gl.enableVertexAttribArray(earthShader.aVertexNormal);
  gl.vertexAttribPointer(earthShader.aVertexNormal, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertIndexBuf);
  gl.drawElements(gl.TRIANGLES, vertCount, gl.UNSIGNED_SHORT, 0);

  gl.useProgram(gl.pickShaderProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
  // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.uniformMatrix4fv(gl.pickShaderProgram.uMvMatrix, false, mvMatrix); // set up picking
  gl.disableVertexAttribArray(gl.pickShaderProgram.aColor);
  gl.enableVertexAttribArray(gl.pickShaderProgram.aPos);
  gl.drawElements(gl.TRIANGLES, vertCount, gl.UNSIGNED_SHORT, 0);
}

pos = [0, 0, 0];

export default {
  init, draw
};
