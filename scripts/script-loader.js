// **** gl-matrix-min.js ***
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.2.1
 */
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
(function(e){"use strict";var t={};typeof exports=="undefined"?typeof define=="function"&&typeof define.amd=="object"&&define.amd?(t.exports={},define(function(){return t.exports})):t.exports=typeof window!="undefined"?window:e:t.exports=exports,function(e){if(!t)var t=1e-6;if(!n)var n=typeof Float32Array!="undefined"?Float32Array:Array;if(!r)var r=Math.random;var i={};i.setMatrixArrayType=function(e){n=e},typeof e!="undefined"&&(e.glMatrix=i);var s=Math.PI/180;i.toRadian=function(e){return e*s};var o={};o.create=function(){var e=new n(2);return e[0]=0,e[1]=0,e},o.clone=function(e){var t=new n(2);return t[0]=e[0],t[1]=e[1],t},o.fromValues=function(e,t){var r=new n(2);return r[0]=e,r[1]=t,r},o.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e},o.set=function(e,t,n){return e[0]=t,e[1]=n,e},o.add=function(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e},o.subtract=function(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e},o.sub=o.subtract,o.multiply=function(e,t,n){return e[0]=t[0]*n[0],e[1]=t[1]*n[1],e},o.mul=o.multiply,o.divide=function(e,t,n){return e[0]=t[0]/n[0],e[1]=t[1]/n[1],e},o.div=o.divide,o.min=function(e,t,n){return e[0]=Math.min(t[0],n[0]),e[1]=Math.min(t[1],n[1]),e},o.max=function(e,t,n){return e[0]=Math.max(t[0],n[0]),e[1]=Math.max(t[1],n[1]),e},o.scale=function(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e},o.scaleAndAdd=function(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e},o.distance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1];return Math.sqrt(n*n+r*r)},o.dist=o.distance,o.squaredDistance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1];return n*n+r*r},o.sqrDist=o.squaredDistance,o.length=function(e){var t=e[0],n=e[1];return Math.sqrt(t*t+n*n)},o.len=o.length,o.squaredLength=function(e){var t=e[0],n=e[1];return t*t+n*n},o.sqrLen=o.squaredLength,o.negate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e},o.normalize=function(e,t){var n=t[0],r=t[1],i=n*n+r*r;return i>0&&(i=1/Math.sqrt(i),e[0]=t[0]*i,e[1]=t[1]*i),e},o.dot=function(e,t){return e[0]*t[0]+e[1]*t[1]},o.cross=function(e,t,n){var r=t[0]*n[1]-t[1]*n[0];return e[0]=e[1]=0,e[2]=r,e},o.lerp=function(e,t,n,r){var i=t[0],s=t[1];return e[0]=i+r*(n[0]-i),e[1]=s+r*(n[1]-s),e},o.random=function(e,t){t=t||1;var n=r()*2*Math.PI;return e[0]=Math.cos(n)*t,e[1]=Math.sin(n)*t,e},o.transformMat2=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[2]*i,e[1]=n[1]*r+n[3]*i,e},o.transformMat2d=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[2]*i+n[4],e[1]=n[1]*r+n[3]*i+n[5],e},o.transformMat3=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[3]*i+n[6],e[1]=n[1]*r+n[4]*i+n[7],e},o.transformMat4=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[4]*i+n[12],e[1]=n[1]*r+n[5]*i+n[13],e},o.forEach=function(){var e=o.create();return function(t,n,r,i,s,o){var u,a;n||(n=2),r||(r=0),i?a=Math.min(i*n+r,t.length):a=t.length;for(u=r;u<a;u+=n)e[0]=t[u],e[1]=t[u+1],s(e,e,o),t[u]=e[0],t[u+1]=e[1];return t}}(),o.str=function(e){return"vec2("+e[0]+", "+e[1]+")"},typeof e!="undefined"&&(e.vec2=o);var u={};u.create=function(){var e=new n(3);return e[0]=0,e[1]=0,e[2]=0,e},u.clone=function(e){var t=new n(3);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t},u.fromValues=function(e,t,r){var i=new n(3);return i[0]=e,i[1]=t,i[2]=r,i},u.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e},u.set=function(e,t,n,r){return e[0]=t,e[1]=n,e[2]=r,e},u.add=function(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e[2]=t[2]+n[2],e},u.subtract=function(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e},u.sub=u.subtract,u.multiply=function(e,t,n){return e[0]=t[0]*n[0],e[1]=t[1]*n[1],e[2]=t[2]*n[2],e},u.mul=u.multiply,u.divide=function(e,t,n){return e[0]=t[0]/n[0],e[1]=t[1]/n[1],e[2]=t[2]/n[2],e},u.div=u.divide,u.min=function(e,t,n){return e[0]=Math.min(t[0],n[0]),e[1]=Math.min(t[1],n[1]),e[2]=Math.min(t[2],n[2]),e},u.max=function(e,t,n){return e[0]=Math.max(t[0],n[0]),e[1]=Math.max(t[1],n[1]),e[2]=Math.max(t[2],n[2]),e},u.scale=function(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e},u.scaleAndAdd=function(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e[2]=t[2]+n[2]*r,e},u.distance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2];return Math.sqrt(n*n+r*r+i*i)},u.dist=u.distance,u.squaredDistance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2];return n*n+r*r+i*i},u.sqrDist=u.squaredDistance,u.length=function(e){var t=e[0],n=e[1],r=e[2];return Math.sqrt(t*t+n*n+r*r)},u.len=u.length,u.squaredLength=function(e){var t=e[0],n=e[1],r=e[2];return t*t+n*n+r*r},u.sqrLen=u.squaredLength,u.negate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e},u.normalize=function(e,t){var n=t[0],r=t[1],i=t[2],s=n*n+r*r+i*i;return s>0&&(s=1/Math.sqrt(s),e[0]=t[0]*s,e[1]=t[1]*s,e[2]=t[2]*s),e},u.dot=function(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]},u.cross=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=n[0],u=n[1],a=n[2];return e[0]=i*a-s*u,e[1]=s*o-r*a,e[2]=r*u-i*o,e},u.lerp=function(e,t,n,r){var i=t[0],s=t[1],o=t[2];return e[0]=i+r*(n[0]-i),e[1]=s+r*(n[1]-s),e[2]=o+r*(n[2]-o),e},u.random=function(e,t){t=t||1;var n=r()*2*Math.PI,i=r()*2-1,s=Math.sqrt(1-i*i)*t;return e[0]=Math.cos(n)*s,e[1]=Math.sin(n)*s,e[2]=i*t,e},u.transformMat4=function(e,t,n){var r=t[0],i=t[1],s=t[2];return e[0]=n[0]*r+n[4]*i+n[8]*s+n[12],e[1]=n[1]*r+n[5]*i+n[9]*s+n[13],e[2]=n[2]*r+n[6]*i+n[10]*s+n[14],e},u.transformMat3=function(e,t,n){var r=t[0],i=t[1],s=t[2];return e[0]=r*n[0]+i*n[3]+s*n[6],e[1]=r*n[1]+i*n[4]+s*n[7],e[2]=r*n[2]+i*n[5]+s*n[8],e},u.transformQuat=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=n[0],u=n[1],a=n[2],f=n[3],l=f*r+u*s-a*i,c=f*i+a*r-o*s,h=f*s+o*i-u*r,p=-o*r-u*i-a*s;return e[0]=l*f+p*-o+c*-a-h*-u,e[1]=c*f+p*-u+h*-o-l*-a,e[2]=h*f+p*-a+l*-u-c*-o,e},u.rotateX=function(e,t,n,r){var i=[],s=[];return i[0]=t[0]-n[0],i[1]=t[1]-n[1],i[2]=t[2]-n[2],s[0]=i[0],s[1]=i[1]*Math.cos(r)-i[2]*Math.sin(r),s[2]=i[1]*Math.sin(r)+i[2]*Math.cos(r),e[0]=s[0]+n[0],e[1]=s[1]+n[1],e[2]=s[2]+n[2],e},u.rotateY=function(e,t,n,r){var i=[],s=[];return i[0]=t[0]-n[0],i[1]=t[1]-n[1],i[2]=t[2]-n[2],s[0]=i[2]*Math.sin(r)+i[0]*Math.cos(r),s[1]=i[1],s[2]=i[2]*Math.cos(r)-i[0]*Math.sin(r),e[0]=s[0]+n[0],e[1]=s[1]+n[1],e[2]=s[2]+n[2],e},u.rotateZ=function(e,t,n,r){var i=[],s=[];return i[0]=t[0]-n[0],i[1]=t[1]-n[1],i[2]=t[2]-n[2],s[0]=i[0]*Math.cos(r)-i[1]*Math.sin(r),s[1]=i[0]*Math.sin(r)+i[1]*Math.cos(r),s[2]=i[2],e[0]=s[0]+n[0],e[1]=s[1]+n[1],e[2]=s[2]+n[2],e},u.forEach=function(){var e=u.create();return function(t,n,r,i,s,o){var u,a;n||(n=3),r||(r=0),i?a=Math.min(i*n+r,t.length):a=t.length;for(u=r;u<a;u+=n)e[0]=t[u],e[1]=t[u+1],e[2]=t[u+2],s(e,e,o),t[u]=e[0],t[u+1]=e[1],t[u+2]=e[2];return t}}(),u.str=function(e){return"vec3("+e[0]+", "+e[1]+", "+e[2]+")"},typeof e!="undefined"&&(e.vec3=u);var a={};a.create=function(){var e=new n(4);return e[0]=0,e[1]=0,e[2]=0,e[3]=0,e},a.clone=function(e){var t=new n(4);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t},a.fromValues=function(e,t,r,i){var s=new n(4);return s[0]=e,s[1]=t,s[2]=r,s[3]=i,s},a.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e},a.set=function(e,t,n,r,i){return e[0]=t,e[1]=n,e[2]=r,e[3]=i,e},a.add=function(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e[2]=t[2]+n[2],e[3]=t[3]+n[3],e},a.subtract=function(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e[3]=t[3]-n[3],e},a.sub=a.subtract,a.multiply=function(e,t,n){return e[0]=t[0]*n[0],e[1]=t[1]*n[1],e[2]=t[2]*n[2],e[3]=t[3]*n[3],e},a.mul=a.multiply,a.divide=function(e,t,n){return e[0]=t[0]/n[0],e[1]=t[1]/n[1],e[2]=t[2]/n[2],e[3]=t[3]/n[3],e},a.div=a.divide,a.min=function(e,t,n){return e[0]=Math.min(t[0],n[0]),e[1]=Math.min(t[1],n[1]),e[2]=Math.min(t[2],n[2]),e[3]=Math.min(t[3],n[3]),e},a.max=function(e,t,n){return e[0]=Math.max(t[0],n[0]),e[1]=Math.max(t[1],n[1]),e[2]=Math.max(t[2],n[2]),e[3]=Math.max(t[3],n[3]),e},a.scale=function(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e[3]=t[3]*n,e},a.scaleAndAdd=function(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e[2]=t[2]+n[2]*r,e[3]=t[3]+n[3]*r,e},a.distance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2],s=t[3]-e[3];return Math.sqrt(n*n+r*r+i*i+s*s)},a.dist=a.distance,a.squaredDistance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2],s=t[3]-e[3];return n*n+r*r+i*i+s*s},a.sqrDist=a.squaredDistance,a.length=function(e){var t=e[0],n=e[1],r=e[2],i=e[3];return Math.sqrt(t*t+n*n+r*r+i*i)},a.len=a.length,a.squaredLength=function(e){var t=e[0],n=e[1],r=e[2],i=e[3];return t*t+n*n+r*r+i*i},a.sqrLen=a.squaredLength,a.negate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e[3]=-t[3],e},a.normalize=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n*n+r*r+i*i+s*s;return o>0&&(o=1/Math.sqrt(o),e[0]=t[0]*o,e[1]=t[1]*o,e[2]=t[2]*o,e[3]=t[3]*o),e},a.dot=function(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]+e[3]*t[3]},a.lerp=function(e,t,n,r){var i=t[0],s=t[1],o=t[2],u=t[3];return e[0]=i+r*(n[0]-i),e[1]=s+r*(n[1]-s),e[2]=o+r*(n[2]-o),e[3]=u+r*(n[3]-u),e},a.random=function(e,t){return t=t||1,e[0]=r(),e[1]=r(),e[2]=r(),e[3]=r(),a.normalize(e,e),a.scale(e,e,t),e},a.transformMat4=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3];return e[0]=n[0]*r+n[4]*i+n[8]*s+n[12]*o,e[1]=n[1]*r+n[5]*i+n[9]*s+n[13]*o,e[2]=n[2]*r+n[6]*i+n[10]*s+n[14]*o,e[3]=n[3]*r+n[7]*i+n[11]*s+n[15]*o,e},a.transformQuat=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=n[0],u=n[1],a=n[2],f=n[3],l=f*r+u*s-a*i,c=f*i+a*r-o*s,h=f*s+o*i-u*r,p=-o*r-u*i-a*s;return e[0]=l*f+p*-o+c*-a-h*-u,e[1]=c*f+p*-u+h*-o-l*-a,e[2]=h*f+p*-a+l*-u-c*-o,e},a.forEach=function(){var e=a.create();return function(t,n,r,i,s,o){var u,a;n||(n=4),r||(r=0),i?a=Math.min(i*n+r,t.length):a=t.length;for(u=r;u<a;u+=n)e[0]=t[u],e[1]=t[u+1],e[2]=t[u+2],e[3]=t[u+3],s(e,e,o),t[u]=e[0],t[u+1]=e[1],t[u+2]=e[2],t[u+3]=e[3];return t}}(),a.str=function(e){return"vec4("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+")"},typeof e!="undefined"&&(e.vec4=a);var f={};f.create=function(){var e=new n(4);return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e},f.clone=function(e){var t=new n(4);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t},f.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e},f.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e},f.transpose=function(e,t){if(e===t){var n=t[1];e[1]=t[2],e[2]=n}else e[0]=t[0],e[1]=t[2],e[2]=t[1],e[3]=t[3];return e},f.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n*s-i*r;return o?(o=1/o,e[0]=s*o,e[1]=-r*o,e[2]=-i*o,e[3]=n*o,e):null},f.adjoint=function(e,t){var n=t[0];return e[0]=t[3],e[1]=-t[1],e[2]=-t[2],e[3]=n,e},f.determinant=function(e){return e[0]*e[3]-e[2]*e[1]},f.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=n[0],a=n[1],f=n[2],l=n[3];return e[0]=r*u+s*a,e[1]=i*u+o*a,e[2]=r*f+s*l,e[3]=i*f+o*l,e},f.mul=f.multiply,f.rotate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a+s*u,e[1]=i*a+o*u,e[2]=r*-u+s*a,e[3]=i*-u+o*a,e},f.scale=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=n[0],a=n[1];return e[0]=r*u,e[1]=i*u,e[2]=s*a,e[3]=o*a,e},f.str=function(e){return"mat2("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+")"},f.frob=function(e){return Math.sqrt(Math.pow(e[0],2)+Math.pow(e[1],2)+Math.pow(e[2],2)+Math.pow(e[3],2))},f.LDU=function(e,t,n,r){return e[2]=r[2]/r[0],n[0]=r[0],n[1]=r[1],n[3]=r[3]-e[2]*n[1],[e,t,n]},typeof e!="undefined"&&(e.mat2=f);var l={};l.create=function(){var e=new n(6);return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e[4]=0,e[5]=0,e},l.clone=function(e){var t=new n(6);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t},l.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e},l.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e[4]=0,e[5]=0,e},l.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=n*s-r*i;return a?(a=1/a,e[0]=s*a,e[1]=-r*a,e[2]=-i*a,e[3]=n*a,e[4]=(i*u-s*o)*a,e[5]=(r*o-n*u)*a,e):null},l.determinant=function(e){return e[0]*e[3]-e[1]*e[2]},l.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=n[0],l=n[1],c=n[2],h=n[3],p=n[4],d=n[5];return e[0]=r*f+s*l,e[1]=i*f+o*l,e[2]=r*c+s*h,e[3]=i*c+o*h,e[4]=r*p+s*d+u,e[5]=i*p+o*d+a,e},l.mul=l.multiply,l.rotate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=Math.sin(n),l=Math.cos(n);return e[0]=r*l+s*f,e[1]=i*l+o*f,e[2]=r*-f+s*l,e[3]=i*-f+o*l,e[4]=u,e[5]=a,e},l.scale=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=n[0],l=n[1];return e[0]=r*f,e[1]=i*f,e[2]=s*l,e[3]=o*l,e[4]=u,e[5]=a,e},l.translate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=n[0],l=n[1];return e[0]=r,e[1]=i,e[2]=s,e[3]=o,e[4]=r*f+s*l+u,e[5]=i*f+o*l+a,e},l.str=function(e){return"mat2d("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+", "+e[4]+", "+e[5]+")"},l.frob=function(e){return Math.sqrt(Math.pow(e[0],2)+Math.pow(e[1],2)+Math.pow(e[2],2)+Math.pow(e[3],2)+Math.pow(e[4],2)+Math.pow(e[5],2)+1)},typeof e!="undefined"&&(e.mat2d=l);var c={};c.create=function(){var e=new n(9);return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=1,e[5]=0,e[6]=0,e[7]=0,e[8]=1,e},c.fromMat4=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[4],e[4]=t[5],e[5]=t[6],e[6]=t[8],e[7]=t[9],e[8]=t[10],e},c.clone=function(e){var t=new n(9);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t},c.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e},c.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=1,e[5]=0,e[6]=0,e[7]=0,e[8]=1,e},c.transpose=function(e,t){if(e===t){var n=t[1],r=t[2],i=t[5];e[1]=t[3],e[2]=t[6],e[3]=n,e[5]=t[7],e[6]=r,e[7]=i}else e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8];return e},c.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=l*o-u*f,h=-l*s+u*a,p=f*s-o*a,d=n*c+r*h+i*p;return d?(d=1/d,e[0]=c*d,e[1]=(-l*r+i*f)*d,e[2]=(u*r-i*o)*d,e[3]=h*d,e[4]=(l*n-i*a)*d,e[5]=(-u*n+i*s)*d,e[6]=p*d,e[7]=(-f*n+r*a)*d,e[8]=(o*n-r*s)*d,e):null},c.adjoint=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8];return e[0]=o*l-u*f,e[1]=i*f-r*l,e[2]=r*u-i*o,e[3]=u*a-s*l,e[4]=n*l-i*a,e[5]=i*s-n*u,e[6]=s*f-o*a,e[7]=r*a-n*f,e[8]=n*o-r*s,e},c.determinant=function(e){var t=e[0],n=e[1],r=e[2],i=e[3],s=e[4],o=e[5],u=e[6],a=e[7],f=e[8];return t*(f*s-o*a)+n*(-f*i+o*u)+r*(a*i-s*u)},c.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=n[0],p=n[1],d=n[2],v=n[3],m=n[4],g=n[5],y=n[6],b=n[7],w=n[8];return e[0]=h*r+p*o+d*f,e[1]=h*i+p*u+d*l,e[2]=h*s+p*a+d*c,e[3]=v*r+m*o+g*f,e[4]=v*i+m*u+g*l,e[5]=v*s+m*a+g*c,e[6]=y*r+b*o+w*f,e[7]=y*i+b*u+w*l,e[8]=y*s+b*a+w*c,e},c.mul=c.multiply,c.translate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=n[0],p=n[1];return e[0]=r,e[1]=i,e[2]=s,e[3]=o,e[4]=u,e[5]=a,e[6]=h*r+p*o+f,e[7]=h*i+p*u+l,e[8]=h*s+p*a+c,e},c.rotate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=Math.sin(n),p=Math.cos(n);return e[0]=p*r+h*o,e[1]=p*i+h*u,e[2]=p*s+h*a,e[3]=p*o-h*r,e[4]=p*u-h*i,e[5]=p*a-h*s,e[6]=f,e[7]=l,e[8]=c,e},c.scale=function(e,t,n){var r=n[0],i=n[1];return e[0]=r*t[0],e[1]=r*t[1],e[2]=r*t[2],e[3]=i*t[3],e[4]=i*t[4],e[5]=i*t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e},c.fromMat2d=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=0,e[3]=t[2],e[4]=t[3],e[5]=0,e[6]=t[4],e[7]=t[5],e[8]=1,e},c.fromQuat=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n+n,u=r+r,a=i+i,f=n*o,l=r*o,c=r*u,h=i*o,p=i*u,d=i*a,v=s*o,m=s*u,g=s*a;return e[0]=1-c-d,e[3]=l-g,e[6]=h+m,e[1]=l+g,e[4]=1-f-d,e[7]=p-v,e[2]=h-m,e[5]=p+v,e[8]=1-f-c,e},c.normalFromMat4=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=t[9],h=t[10],p=t[11],d=t[12],v=t[13],m=t[14],g=t[15],y=n*u-r*o,b=n*a-i*o,w=n*f-s*o,E=r*a-i*u,S=r*f-s*u,x=i*f-s*a,T=l*v-c*d,N=l*m-h*d,C=l*g-p*d,k=c*m-h*v,L=c*g-p*v,A=h*g-p*m,O=y*A-b*L+w*k+E*C-S*N+x*T;return O?(O=1/O,e[0]=(u*A-a*L+f*k)*O,e[1]=(a*C-o*A-f*N)*O,e[2]=(o*L-u*C+f*T)*O,e[3]=(i*L-r*A-s*k)*O,e[4]=(n*A-i*C+s*N)*O,e[5]=(r*C-n*L-s*T)*O,e[6]=(v*x-m*S+g*E)*O,e[7]=(m*w-d*x-g*b)*O,e[8]=(d*S-v*w+g*y)*O,e):null},c.str=function(e){return"mat3("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+", "+e[4]+", "+e[5]+", "+e[6]+", "+e[7]+", "+e[8]+")"},c.frob=function(e){return Math.sqrt(Math.pow(e[0],2)+Math.pow(e[1],2)+Math.pow(e[2],2)+Math.pow(e[3],2)+Math.pow(e[4],2)+Math.pow(e[5],2)+Math.pow(e[6],2)+Math.pow(e[7],2)+Math.pow(e[8],2))},typeof e!="undefined"&&(e.mat3=c);var h={};h.create=function(){var e=new n(16);return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e},h.clone=function(e){var t=new n(16);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t[9]=e[9],t[10]=e[10],t[11]=e[11],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15],t},h.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e},h.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e},h.transpose=function(e,t){if(e===t){var n=t[1],r=t[2],i=t[3],s=t[6],o=t[7],u=t[11];e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=n,e[6]=t[9],e[7]=t[13],e[8]=r,e[9]=s,e[11]=t[14],e[12]=i,e[13]=o,e[14]=u}else e[0]=t[0],e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=t[1],e[5]=t[5],e[6]=t[9],e[7]=t[13],e[8]=t[2],e[9]=t[6],e[10]=t[10],e[11]=t[14],e[12]=t[3],e[13]=t[7],e[14]=t[11],e[15]=t[15];return e},h.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=t[9],h=t[10],p=t[11],d=t[12],v=t[13],m=t[14],g=t[15],y=n*u-r*o,b=n*a-i*o,w=n*f-s*o,E=r*a-i*u,S=r*f-s*u,x=i*f-s*a,T=l*v-c*d,N=l*m-h*d,C=l*g-p*d,k=c*m-h*v,L=c*g-p*v,A=h*g-p*m,O=y*A-b*L+w*k+E*C-S*N+x*T;return O?(O=1/O,e[0]=(u*A-a*L+f*k)*O,e[1]=(i*L-r*A-s*k)*O,e[2]=(v*x-m*S+g*E)*O,e[3]=(h*S-c*x-p*E)*O,e[4]=(a*C-o*A-f*N)*O,e[5]=(n*A-i*C+s*N)*O,e[6]=(m*w-d*x-g*b)*O,e[7]=(l*x-h*w+p*b)*O,e[8]=(o*L-u*C+f*T)*O,e[9]=(r*C-n*L-s*T)*O,e[10]=(d*S-v*w+g*y)*O,e[11]=(c*w-l*S-p*y)*O,e[12]=(u*N-o*k-a*T)*O,e[13]=(n*k-r*N+i*T)*O,e[14]=(v*b-d*E-m*y)*O,e[15]=(l*E-c*b+h*y)*O,e):null},h.adjoint=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=t[9],h=t[10],p=t[11],d=t[12],v=t[13],m=t[14],g=t[15];return e[0]=u*(h*g-p*m)-c*(a*g-f*m)+v*(a*p-f*h),e[1]=-(r*(h*g-p*m)-c*(i*g-s*m)+v*(i*p-s*h)),e[2]=r*(a*g-f*m)-u*(i*g-s*m)+v*(i*f-s*a),e[3]=-(r*(a*p-f*h)-u*(i*p-s*h)+c*(i*f-s*a)),e[4]=-(o*(h*g-p*m)-l*(a*g-f*m)+d*(a*p-f*h)),e[5]=n*(h*g-p*m)-l*(i*g-s*m)+d*(i*p-s*h),e[6]=-(n*(a*g-f*m)-o*(i*g-s*m)+d*(i*f-s*a)),e[7]=n*(a*p-f*h)-o*(i*p-s*h)+l*(i*f-s*a),e[8]=o*(c*g-p*v)-l*(u*g-f*v)+d*(u*p-f*c),e[9]=-(n*(c*g-p*v)-l*(r*g-s*v)+d*(r*p-s*c)),e[10]=n*(u*g-f*v)-o*(r*g-s*v)+d*(r*f-s*u),e[11]=-(n*(u*p-f*c)-o*(r*p-s*c)+l*(r*f-s*u)),e[12]=-(o*(c*m-h*v)-l*(u*m-a*v)+d*(u*h-a*c)),e[13]=n*(c*m-h*v)-l*(r*m-i*v)+d*(r*h-i*c),e[14]=-(n*(u*m-a*v)-o*(r*m-i*v)+d*(r*a-i*u)),e[15]=n*(u*h-a*c)-o*(r*h-i*c)+l*(r*a-i*u),e},h.determinant=function(e){var t=e[0],n=e[1],r=e[2],i=e[3],s=e[4],o=e[5],u=e[6],a=e[7],f=e[8],l=e[9],c=e[10],h=e[11],p=e[12],d=e[13],v=e[14],m=e[15],g=t*o-n*s,y=t*u-r*s,b=t*a-i*s,w=n*u-r*o,E=n*a-i*o,S=r*a-i*u,x=f*d-l*p,T=f*v-c*p,N=f*m-h*p,C=l*v-c*d,k=l*m-h*d,L=c*m-h*v;return g*L-y*k+b*C+w*N-E*T+S*x},h.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=t[9],p=t[10],d=t[11],v=t[12],m=t[13],g=t[14],y=t[15],b=n[0],w=n[1],E=n[2],S=n[3];return e[0]=b*r+w*u+E*c+S*v,e[1]=b*i+w*a+E*h+S*m,e[2]=b*s+w*f+E*p+S*g,e[3]=b*o+w*l+E*d+S*y,b=n[4],w=n[5],E=n[6],S=n[7],e[4]=b*r+w*u+E*c+S*v,e[5]=b*i+w*a+E*h+S*m,e[6]=b*s+w*f+E*p+S*g,e[7]=b*o+w*l+E*d+S*y,b=n[8],w=n[9],E=n[10],S=n[11],e[8]=b*r+w*u+E*c+S*v,e[9]=b*i+w*a+E*h+S*m,e[10]=b*s+w*f+E*p+S*g,e[11]=b*o+w*l+E*d+S*y,b=n[12],w=n[13],E=n[14],S=n[15],e[12]=b*r+w*u+E*c+S*v,e[13]=b*i+w*a+E*h+S*m,e[14]=b*s+w*f+E*p+S*g,e[15]=b*o+w*l+E*d+S*y,e},h.mul=h.multiply,h.translate=function(e,t,n){var r=n[0],i=n[1],s=n[2],o,u,a,f,l,c,h,p,d,v,m,g;return t===e?(e[12]=t[0]*r+t[4]*i+t[8]*s+t[12],e[13]=t[1]*r+t[5]*i+t[9]*s+t[13],e[14]=t[2]*r+t[6]*i+t[10]*s+t[14],e[15]=t[3]*r+t[7]*i+t[11]*s+t[15]):(o=t[0],u=t[1],a=t[2],f=t[3],l=t[4],c=t[5],h=t[6],p=t[7],d=t[8],v=t[9],m=t[10],g=t[11],e[0]=o,e[1]=u,e[2]=a,e[3]=f,e[4]=l,e[5]=c,e[6]=h,e[7]=p,e[8]=d,e[9]=v,e[10]=m,e[11]=g,e[12]=o*r+l*i+d*s+t[12],e[13]=u*r+c*i+v*s+t[13],e[14]=a*r+h*i+m*s+t[14],e[15]=f*r+p*i+g*s+t[15]),e},h.scale=function(e,t,n){var r=n[0],i=n[1],s=n[2];return e[0]=t[0]*r,e[1]=t[1]*r,e[2]=t[2]*r,e[3]=t[3]*r,e[4]=t[4]*i,e[5]=t[5]*i,e[6]=t[6]*i,e[7]=t[7]*i,e[8]=t[8]*s,e[9]=t[9]*s,e[10]=t[10]*s,e[11]=t[11]*s,e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e},h.rotate=function(e,n,r,i){var s=i[0],o=i[1],u=i[2],a=Math.sqrt(s*s+o*o+u*u),f,l,c,h,p,d,v,m,g,y,b,w,E,S,x,T,N,C,k,L,A,O,M,_;return Math.abs(a)<t?null:(a=1/a,s*=a,o*=a,u*=a,f=Math.sin(r),l=Math.cos(r),c=1-l,h=n[0],p=n[1],d=n[2],v=n[3],m=n[4],g=n[5],y=n[6],b=n[7],w=n[8],E=n[9],S=n[10],x=n[11],T=s*s*c+l,N=o*s*c+u*f,C=u*s*c-o*f,k=s*o*c-u*f,L=o*o*c+l,A=u*o*c+s*f,O=s*u*c+o*f,M=o*u*c-s*f,_=u*u*c+l,e[0]=h*T+m*N+w*C,e[1]=p*T+g*N+E*C,e[2]=d*T+y*N+S*C,e[3]=v*T+b*N+x*C,e[4]=h*k+m*L+w*A,e[5]=p*k+g*L+E*A,e[6]=d*k+y*L+S*A,e[7]=v*k+b*L+x*A,e[8]=h*O+m*M+w*_,e[9]=p*O+g*M+E*_,e[10]=d*O+y*M+S*_,e[11]=v*O+b*M+x*_,n!==e&&(e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15]),e)},h.rotateX=function(e,t,n){var r=Math.sin(n),i=Math.cos(n),s=t[4],o=t[5],u=t[6],a=t[7],f=t[8],l=t[9],c=t[10],h=t[11];return t!==e&&(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[4]=s*i+f*r,e[5]=o*i+l*r,e[6]=u*i+c*r,e[7]=a*i+h*r,e[8]=f*i-s*r,e[9]=l*i-o*r,e[10]=c*i-u*r,e[11]=h*i-a*r,e},h.rotateY=function(e,t,n){var r=Math.sin(n),i=Math.cos(n),s=t[0],o=t[1],u=t[2],a=t[3],f=t[8],l=t[9],c=t[10],h=t[11];return t!==e&&(e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[0]=s*i-f*r,e[1]=o*i-l*r,e[2]=u*i-c*r,e[3]=a*i-h*r,e[8]=s*r+f*i,e[9]=o*r+l*i,e[10]=u*r+c*i,e[11]=a*r+h*i,e},h.rotateZ=function(e,t,n){var r=Math.sin(n),i=Math.cos(n),s=t[0],o=t[1],u=t[2],a=t[3],f=t[4],l=t[5],c=t[6],h=t[7];return t!==e&&(e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[0]=s*i+f*r,e[1]=o*i+l*r,e[2]=u*i+c*r,e[3]=a*i+h*r,e[4]=f*i-s*r,e[5]=l*i-o*r,e[6]=c*i-u*r,e[7]=h*i-a*r,e},h.fromRotationTranslation=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=r+r,a=i+i,f=s+s,l=r*u,c=r*a,h=r*f,p=i*a,d=i*f,v=s*f,m=o*u,g=o*a,y=o*f;return e[0]=1-(p+v),e[1]=c+y,e[2]=h-g,e[3]=0,e[4]=c-y,e[5]=1-(l+v),e[6]=d+m,e[7]=0,e[8]=h+g,e[9]=d-m,e[10]=1-(l+p),e[11]=0,e[12]=n[0],e[13]=n[1],e[14]=n[2],e[15]=1,e},h.fromQuat=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n+n,u=r+r,a=i+i,f=n*o,l=r*o,c=r*u,h=i*o,p=i*u,d=i*a,v=s*o,m=s*u,g=s*a;return e[0]=1-c-d,e[1]=l+g,e[2]=h-m,e[3]=0,e[4]=l-g,e[5]=1-f-d,e[6]=p+v,e[7]=0,e[8]=h+m,e[9]=p-v,e[10]=1-f-c,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e},h.frustum=function(e,t,n,r,i,s,o){var u=1/(n-t),a=1/(i-r),f=1/(s-o);return e[0]=s*2*u,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=s*2*a,e[6]=0,e[7]=0,e[8]=(n+t)*u,e[9]=(i+r)*a,e[10]=(o+s)*f,e[11]=-1,e[12]=0,e[13]=0,e[14]=o*s*2*f,e[15]=0,e},h.perspective=function(e,t,n,r,i){var s=1/Math.tan(t/2),o=1/(r-i);return e[0]=s/n,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=s,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=(i+r)*o,e[11]=-1,e[12]=0,e[13]=0,e[14]=2*i*r*o,e[15]=0,e},h.ortho=function(e,t,n,r,i,s,o){var u=1/(t-n),a=1/(r-i),f=1/(s-o);return e[0]=-2*u,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=-2*a,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=2*f,e[11]=0,e[12]=(t+n)*u,e[13]=(i+r)*a,e[14]=(o+s)*f,e[15]=1,e},h.lookAt=function(e,n,r,i){var s,o,u,a,f,l,c,p,d,v,m=n[0],g=n[1],y=n[2],b=i[0],w=i[1],E=i[2],S=r[0],x=r[1],T=r[2];return Math.abs(m-S)<t&&Math.abs(g-x)<t&&Math.abs(y-T)<t?h.identity(e):(c=m-S,p=g-x,d=y-T,v=1/Math.sqrt(c*c+p*p+d*d),c*=v,p*=v,d*=v,s=w*d-E*p,o=E*c-b*d,u=b*p-w*c,v=Math.sqrt(s*s+o*o+u*u),v?(v=1/v,s*=v,o*=v,u*=v):(s=0,o=0,u=0),a=p*u-d*o,f=d*s-c*u,l=c*o-p*s,v=Math.sqrt(a*a+f*f+l*l),v?(v=1/v,a*=v,f*=v,l*=v):(a=0,f=0,l=0),e[0]=s,e[1]=a,e[2]=c,e[3]=0,e[4]=o,e[5]=f,e[6]=p,e[7]=0,e[8]=u,e[9]=l,e[10]=d,e[11]=0,e[12]=-(s*m+o*g+u*y),e[13]=-(a*m+f*g+l*y),e[14]=-(c*m+p*g+d*y),e[15]=1,e)},h.str=function(e){return"mat4("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+", "+e[4]+", "+e[5]+", "+e[6]+", "+e[7]+", "+e[8]+", "+e[9]+", "+e[10]+", "+e[11]+", "+e[12]+", "+e[13]+", "+e[14]+", "+e[15]+")"},h.frob=function(e){return Math.sqrt(Math.pow(e[0],2)+Math.pow(e[1],2)+Math.pow(e[2],2)+Math.pow(e[3],2)+Math.pow(e[4],2)+Math.pow(e[5],2)+Math.pow(e[6],2)+Math.pow(e[6],2)+Math.pow(e[7],2)+Math.pow(e[8],2)+Math.pow(e[9],2)+Math.pow(e[10],2)+Math.pow(e[11],2)+Math.pow(e[12],2)+Math.pow(e[13],2)+Math.pow(e[14],2)+Math.pow(e[15],2))},typeof e!="undefined"&&(e.mat4=h);var p={};p.create=function(){var e=new n(4);return e[0]=0,e[1]=0,e[2]=0,e[3]=1,e},p.rotationTo=function(){var e=u.create(),t=u.fromValues(1,0,0),n=u.fromValues(0,1,0);return function(r,i,s){var o=u.dot(i,s);return o<-0.999999?(u.cross(e,t,i),u.length(e)<1e-6&&u.cross(e,n,i),u.normalize(e,e),p.setAxisAngle(r,e,Math.PI),r):o>.999999?(r[0]=0,r[1]=0,r[2]=0,r[3]=1,r):(u.cross(e,i,s),r[0]=e[0],r[1]=e[1],r[2]=e[2],r[3]=1+o,p.normalize(r,r))}}(),p.setAxes=function(){var e=c.create();return function(t,n,r,i){return e[0]=r[0],e[3]=r[1],e[6]=r[2],e[1]=i[0],e[4]=i[1],e[7]=i[2],e[2]=-n[0],e[5]=-n[1],e[8]=-n[2],p.normalize(t,p.fromMat3(t,e))}}(),p.clone=a.clone,p.fromValues=a.fromValues,p.copy=a.copy,p.set=a.set,p.identity=function(e){return e[0]=0,e[1]=0,e[2]=0,e[3]=1,e},p.setAxisAngle=function(e,t,n){n*=.5;var r=Math.sin(n);return e[0]=r*t[0],e[1]=r*t[1],e[2]=r*t[2],e[3]=Math.cos(n),e},p.add=a.add,p.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=n[0],a=n[1],f=n[2],l=n[3];return e[0]=r*l+o*u+i*f-s*a,e[1]=i*l+o*a+s*u-r*f,e[2]=s*l+o*f+r*a-i*u,e[3]=o*l-r*u-i*a-s*f,e},p.mul=p.multiply,p.scale=a.scale,p.rotateX=function(e,t,n){n*=.5;var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a+o*u,e[1]=i*a+s*u,e[2]=s*a-i*u,e[3]=o*a-r*u,e},p.rotateY=function(e,t,n){n*=.5;var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a-s*u,e[1]=i*a+o*u,e[2]=s*a+r*u,e[3]=o*a-i*u,e},p.rotateZ=function(e,t,n){n*=.5;var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a+i*u,e[1]=i*a-r*u,e[2]=s*a+o*u,e[3]=o*a-s*u,e},p.calculateW=function(e,t){var n=t[0],r=t[1],i=t[2];return e[0]=n,e[1]=r,e[2]=i,e[3]=-Math.sqrt(Math.abs(1-n*n-r*r-i*i)),e},p.dot=a.dot,p.lerp=a.lerp,p.slerp=function(e,t,n,r){var i=t[0],s=t[1],o=t[2],u=t[3],a=n[0],f=n[1],l=n[2],c=n[3],h,p,d,v,m;return p=i*a+s*f+o*l+u*c,p<0&&(p=-p,a=-a,f=-f,l=-l,c=-c),1-p>1e-6?(h=Math.acos(p),d=Math.sin(h),v=Math.sin((1-r)*h)/d,m=Math.sin(r*h)/d):(v=1-r,m=r),e[0]=v*i+m*a,e[1]=v*s+m*f,e[2]=v*o+m*l,e[3]=v*u+m*c,e},p.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n*n+r*r+i*i+s*s,u=o?1/o:0;return e[0]=-n*u,e[1]=-r*u,e[2]=-i*u,e[3]=s*u,e},p.conjugate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e[3]=t[3],e},p.length=a.length,p.len=p.length,p.squaredLength=a.squaredLength,p.sqrLen=p.squaredLength,p.normalize=a.normalize,p.fromMat3=function(e,t){var n=t[0]+t[4]+t[8],r;if(n>0)r=Math.sqrt(n+1),e[3]=.5*r,r=.5/r,e[0]=(t[7]-t[5])*r,e[1]=(t[2]-t[6])*r,e[2]=(t[3]-t[1])*r;else{var i=0;t[4]>t[0]&&(i=1),t[8]>t[i*3+i]&&(i=2);var s=(i+1)%3,o=(i+2)%3;r=Math.sqrt(t[i*3+i]-t[s*3+s]-t[o*3+o]+1),e[i]=.5*r,r=.5/r,e[3]=(t[o*3+s]-t[s*3+o])*r,e[s]=(t[s*3+i]+t[i*3+s])*r,e[o]=(t[o*3+i]+t[i*3+o])*r}return e},p.str=function(e){return"quat("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+")"},typeof e!="undefined"&&(e.quat=p)}(t.exports)})(this);

// **** end gl-matrix-min.js ***

// **** spin.min.js ***
//fgnass.github.com/spin.js#v2.1.0
!function(a,b){"object"==typeof exports?module.exports=b():"function"==typeof define&&define.amd?define(b):a.Spinner=b()}(this,function(){"use strict";function a(a,b){var c,d=document.createElement(a||"div");for(c in b)d[c]=b[c];return d}function b(a){for(var b=1,c=arguments.length;c>b;b++)a.appendChild(arguments[b]);return a}function c(a,b,c,d){var e=["opacity",b,~~(100*a),c,d].join("-"),f=.01+c/d*100,g=Math.max(1-(1-a)/b*(100-f),a),h=j.substring(0,j.indexOf("Animation")).toLowerCase(),i=h&&"-"+h+"-"||"";return m[e]||(k.insertRule("@"+i+"keyframes "+e+"{0%{opacity:"+g+"}"+f+"%{opacity:"+a+"}"+(f+.01)+"%{opacity:1}"+(f+b)%100+"%{opacity:"+a+"}100%{opacity:"+g+"}}",k.cssRules.length),m[e]=1),e}function d(a,b){var c,d,e=a.style;for(b=b.charAt(0).toUpperCase()+b.slice(1),d=0;d<l.length;d++)if(c=l[d]+b,void 0!==e[c])return c;return void 0!==e[b]?b:void 0}function e(a,b){for(var c in b)a.style[d(a,c)||c]=b[c];return a}function f(a){for(var b=1;b<arguments.length;b++){var c=arguments[b];for(var d in c)void 0===a[d]&&(a[d]=c[d])}return a}function g(a,b){return"string"==typeof a?a:a[b%a.length]}function h(a){this.opts=f(a||{},h.defaults,n)}function i(){function c(b,c){return a("<"+b+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',c)}k.addRule(".spin-vml","behavior:url(#default#VML)"),h.prototype.lines=function(a,d){function f(){return e(c("group",{coordsize:k+" "+k,coordorigin:-j+" "+-j}),{width:k,height:k})}function h(a,h,i){b(m,b(e(f(),{rotation:360/d.lines*a+"deg",left:~~h}),b(e(c("roundrect",{arcsize:d.corners}),{width:j,height:d.scale*d.width,left:d.scale*d.radius,top:-d.scale*d.width>>1,filter:i}),c("fill",{color:g(d.color,a),opacity:d.opacity}),c("stroke",{opacity:0}))))}var i,j=d.scale*(d.length+d.width),k=2*d.scale*j,l=-(d.width+d.length)*d.scale*2+"px",m=e(f(),{position:"absolute",top:l,left:l});if(d.shadow)for(i=1;i<=d.lines;i++)h(i,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(i=1;i<=d.lines;i++)h(i);return b(a,m)},h.prototype.opacity=function(a,b,c,d){var e=a.firstChild;d=d.shadow&&d.lines||0,e&&b+d<e.childNodes.length&&(e=e.childNodes[b+d],e=e&&e.firstChild,e=e&&e.firstChild,e&&(e.opacity=c))}}var j,k,l=["webkit","Moz","ms","O"],m={},n={lines:12,length:7,width:5,radius:10,scale:1,rotate:0,corners:1,color:"#000",direction:1,speed:1,trail:100,opacity:.25,fps:20,zIndex:2e9,className:"spinner",top:"50%",left:"50%",position:"absolute"};if(h.defaults={},f(h.prototype,{spin:function(b){this.stop();var c=this,d=c.opts,f=c.el=e(a(0,{className:d.className}),{position:d.position,width:0,zIndex:d.zIndex});if(e(f,{left:d.left,top:d.top}),b&&b.insertBefore(f,b.firstChild||null),f.setAttribute("role","progressbar"),c.lines(f,c.opts),!j){var g,h=0,i=(d.lines-1)*(1-d.direction)/2,k=d.fps,l=k/d.speed,m=(1-d.opacity)/(l*d.trail/100),n=l/d.lines;!function o(){h++;for(var a=0;a<d.lines;a++)g=Math.max(1-(h+(d.lines-a)*n)%l*m,d.opacity),c.opacity(f,a*d.direction+i,g,d);c.timeout=c.el&&setTimeout(o,~~(1e3/k))}()}return c},stop:function(){var a=this.el;return a&&(clearTimeout(this.timeout),a.parentNode&&a.parentNode.removeChild(a),this.el=void 0),this},lines:function(d,f){function h(b,c){return e(a(),{position:"absolute",width:f.scale*(f.length+f.width)+"px",height:f.scale*f.width+"px",background:b,boxShadow:c,transformOrigin:"left",transform:"rotate("+~~(360/f.lines*k+f.rotate)+"deg) translate("+f.scale*f.radius+"px,0)",borderRadius:(f.corners*f.scale*f.width>>1)+"px"})}for(var i,k=0,l=(f.lines-1)*(1-f.direction)/2;k<f.lines;k++)i=e(a(),{position:"absolute",top:1+~(f.scale*f.width/2)+"px",transform:f.hwaccel?"translate3d(0,0,0)":"",opacity:f.opacity,animation:j&&c(f.opacity,f.trail,l+k*f.direction,f.lines)+" "+1/f.speed+"s linear infinite"}),f.shadow&&b(i,e(h("#000","0 0 4px #000"),{top:"2px"})),b(d,b(i,h(g(f.color,k),"0 0 1px rgba(0,0,0,.1)")));return d},opacity:function(a,b,c){b<a.childNodes.length&&(a.childNodes[b].style.opacity=c)}}),"undefined"!=typeof document){k=function(){var c=a("style",{type:"text/css"});return b(document.getElementsByTagName("head")[0],c),c.sheet||c.styleSheet}();var o=e(a("group"),{behavior:"url(#default#VML)"});!d(o,"transform")&&o.adj?i():j=d(o,"animation")}return h});
// **** end spin.min.js ***

// **** perfect-scrollbar.jquery.min.js ***
/* perfect-scrollbar v0.6.8 */
!function t(e,n,r){function o(l,s){if(!n[l]){if(!e[l]){var a="function"==typeof require&&require;if(!s&&a)return a(l,!0);if(i)return i(l,!0);var c=new Error("Cannot find module '"+l+"'");throw c.code="MODULE_NOT_FOUND",c}var u=n[l]={exports:{}};e[l][0].call(u.exports,function(t){var n=e[l][1][t];return o(n?n:t)},u,u.exports,t,e,n,r)}return n[l].exports}for(var i="function"==typeof require&&require,l=0;l<r.length;l++)o(r[l]);return o}({1:[function(t,e,n){"use strict";function r(t){t.fn.perfectScrollbar=function(e){return this.each(function(){if("object"==typeof e||"undefined"==typeof e){var n=e;i.get(this)||o.initialize(this,n)}else{var r=e;"update"===r?o.update(this):"destroy"===r&&o.destroy(this)}return t(this)})}}var o=t("../main"),i=t("../plugin/instances");if("function"==typeof define&&define.amd)define(["jquery"],r);else{var l=window.jQuery?window.jQuery:window.$;"undefined"!=typeof l&&r(l)}e.exports=r},{"../main":7,"../plugin/instances":18}],2:[function(t,e,n){"use strict";function r(t,e){var n=t.className.split(" ");n.indexOf(e)<0&&n.push(e),t.className=n.join(" ")}function o(t,e){var n=t.className.split(" "),r=n.indexOf(e);r>=0&&n.splice(r,1),t.className=n.join(" ")}n.add=function(t,e){t.classList?t.classList.add(e):r(t,e)},n.remove=function(t,e){t.classList?t.classList.remove(e):o(t,e)},n.list=function(t){return t.classList?Array.prototype.slice.apply(t.classList):t.className.split(" ")}},{}],3:[function(t,e,n){"use strict";function r(t,e){return window.getComputedStyle(t)[e]}function o(t,e,n){return"number"==typeof n&&(n=n.toString()+"px"),t.style[e]=n,t}function i(t,e){for(var n in e){var r=e[n];"number"==typeof r&&(r=r.toString()+"px"),t.style[n]=r}return t}var l={};l.e=function(t,e){var n=document.createElement(t);return n.className=e,n},l.appendTo=function(t,e){return e.appendChild(t),t},l.css=function(t,e,n){return"object"==typeof e?i(t,e):"undefined"==typeof n?r(t,e):o(t,e,n)},l.matches=function(t,e){return"undefined"!=typeof t.matches?t.matches(e):"undefined"!=typeof t.matchesSelector?t.matchesSelector(e):"undefined"!=typeof t.webkitMatchesSelector?t.webkitMatchesSelector(e):"undefined"!=typeof t.mozMatchesSelector?t.mozMatchesSelector(e):"undefined"!=typeof t.msMatchesSelector?t.msMatchesSelector(e):void 0},l.remove=function(t){"undefined"!=typeof t.remove?t.remove():t.parentNode&&t.parentNode.removeChild(t)},l.queryChildren=function(t,e){return Array.prototype.filter.call(t.childNodes,function(t){return l.matches(t,e)})},e.exports=l},{}],4:[function(t,e,n){"use strict";var r=function(t){this.element=t,this.events={}};r.prototype.bind=function(t,e){"undefined"==typeof this.events[t]&&(this.events[t]=[]),this.events[t].push(e),this.element.addEventListener(t,e,!1)},r.prototype.unbind=function(t,e){var n="undefined"!=typeof e;this.events[t]=this.events[t].filter(function(r){return n&&r!==e?!0:(this.element.removeEventListener(t,r,!1),!1)},this)},r.prototype.unbindAll=function(){for(var t in this.events)this.unbind(t)};var o=function(){this.eventElements=[]};o.prototype.eventElement=function(t){var e=this.eventElements.filter(function(e){return e.element===t})[0];return"undefined"==typeof e&&(e=new r(t),this.eventElements.push(e)),e},o.prototype.bind=function(t,e,n){this.eventElement(t).bind(e,n)},o.prototype.unbind=function(t,e,n){this.eventElement(t).unbind(e,n)},o.prototype.unbindAll=function(){for(var t=0;t<this.eventElements.length;t++)this.eventElements[t].unbindAll()},o.prototype.once=function(t,e,n){var r=this.eventElement(t),o=function(t){r.unbind(e,o),n(t)};r.bind(e,o)},e.exports=o},{}],5:[function(t,e,n){"use strict";e.exports=function(){function t(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return function(){return t()+t()+"-"+t()+"-"+t()+"-"+t()+"-"+t()+t()+t()}}()},{}],6:[function(t,e,n){"use strict";var r=t("./class"),o=t("./dom");n.toInt=function(t){return parseInt(t,10)||0},n.clone=function(t){if(null===t)return null;if("object"==typeof t){var e={};for(var n in t)e[n]=this.clone(t[n]);return e}return t},n.extend=function(t,e){var n=this.clone(t);for(var r in e)n[r]=this.clone(e[r]);return n},n.isEditable=function(t){return o.matches(t,"input,[contenteditable]")||o.matches(t,"select,[contenteditable]")||o.matches(t,"textarea,[contenteditable]")||o.matches(t,"button,[contenteditable]")},n.removePsClasses=function(t){for(var e=r.list(t),n=0;n<e.length;n++){var o=e[n];0===o.indexOf("ps-")&&r.remove(t,o)}},n.outerWidth=function(t){return this.toInt(o.css(t,"width"))+this.toInt(o.css(t,"paddingLeft"))+this.toInt(o.css(t,"paddingRight"))+this.toInt(o.css(t,"borderLeftWidth"))+this.toInt(o.css(t,"borderRightWidth"))},n.startScrolling=function(t,e){r.add(t,"ps-in-scrolling"),"undefined"!=typeof e?r.add(t,"ps-"+e):(r.add(t,"ps-x"),r.add(t,"ps-y"))},n.stopScrolling=function(t,e){r.remove(t,"ps-in-scrolling"),"undefined"!=typeof e?r.remove(t,"ps-"+e):(r.remove(t,"ps-x"),r.remove(t,"ps-y"))},n.env={isWebKit:"WebkitAppearance"in document.documentElement.style,supportsTouch:"ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch,supportsIePointer:null!==window.navigator.msMaxTouchPoints}},{"./class":2,"./dom":3}],7:[function(t,e,n){"use strict";var r=t("./plugin/destroy"),o=t("./plugin/initialize"),i=t("./plugin/update");e.exports={initialize:o,update:i,destroy:r}},{"./plugin/destroy":9,"./plugin/initialize":17,"./plugin/update":21}],8:[function(t,e,n){"use strict";e.exports={maxScrollbarLength:null,minScrollbarLength:null,scrollXMarginOffset:0,scrollYMarginOffset:0,stopPropagationOnClick:!0,suppressScrollX:!1,suppressScrollY:!1,swipePropagation:!0,useBothWheelAxes:!1,useKeyboard:!0,useSelectionScroll:!1,wheelPropagation:!1,wheelSpeed:1}},{}],9:[function(t,e,n){"use strict";var r=t("../lib/dom"),o=t("../lib/helper"),i=t("./instances");e.exports=function(t){var e=i.get(t);e&&(e.event.unbindAll(),r.remove(e.scrollbarX),r.remove(e.scrollbarY),r.remove(e.scrollbarXRail),r.remove(e.scrollbarYRail),o.removePsClasses(t),i.remove(t))}},{"../lib/dom":3,"../lib/helper":6,"./instances":18}],10:[function(t,e,n){"use strict";function r(t,e){function n(t){return t.getBoundingClientRect()}var r=window.Event.prototype.stopPropagation.bind;e.settings.stopPropagationOnClick&&e.event.bind(e.scrollbarY,"click",r),e.event.bind(e.scrollbarYRail,"click",function(r){var i=o.toInt(e.scrollbarYHeight/2),a=e.railYRatio*(r.pageY-window.pageYOffset-n(e.scrollbarYRail).top-i),c=e.railYRatio*(e.railYHeight-e.scrollbarYHeight),u=a/c;0>u?u=0:u>1&&(u=1),s(t,"top",(e.contentHeight-e.containerHeight)*u),l(t),r.stopPropagation()}),e.settings.stopPropagationOnClick&&e.event.bind(e.scrollbarX,"click",r),e.event.bind(e.scrollbarXRail,"click",function(r){var i=o.toInt(e.scrollbarXWidth/2),a=e.railXRatio*(r.pageX-window.pageXOffset-n(e.scrollbarXRail).left-i),c=e.railXRatio*(e.railXWidth-e.scrollbarXWidth),u=a/c;0>u?u=0:u>1&&(u=1),s(t,"left",(e.contentWidth-e.containerWidth)*u-e.negativeScrollAdjustment),l(t),r.stopPropagation()})}var o=t("../../lib/helper"),i=t("../instances"),l=t("../update-geometry"),s=t("../update-scroll");e.exports=function(t){var e=i.get(t);r(t,e)}},{"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],11:[function(t,e,n){"use strict";function r(t,e){function n(n){var o=r+n*e.railXRatio,i=Math.max(0,e.scrollbarXRail.getBoundingClientRect().left)+e.railXRatio*(e.railXWidth-e.scrollbarXWidth);0>o?e.scrollbarXLeft=0:o>i?e.scrollbarXLeft=i:e.scrollbarXLeft=o;var s=l.toInt(e.scrollbarXLeft*(e.contentWidth-e.containerWidth)/(e.containerWidth-e.railXRatio*e.scrollbarXWidth))-e.negativeScrollAdjustment;c(t,"left",s)}var r=null,o=null,s=function(e){n(e.pageX-o),a(t),e.stopPropagation(),e.preventDefault()},u=function(){l.stopScrolling(t,"x"),e.event.unbind(e.ownerDocument,"mousemove",s)};e.event.bind(e.scrollbarX,"mousedown",function(n){o=n.pageX,r=l.toInt(i.css(e.scrollbarX,"left"))*e.railXRatio,l.startScrolling(t,"x"),e.event.bind(e.ownerDocument,"mousemove",s),e.event.once(e.ownerDocument,"mouseup",u),n.stopPropagation(),n.preventDefault()})}function o(t,e){function n(n){var o=r+n*e.railYRatio,i=Math.max(0,e.scrollbarYRail.getBoundingClientRect().top)+e.railYRatio*(e.railYHeight-e.scrollbarYHeight);0>o?e.scrollbarYTop=0:o>i?e.scrollbarYTop=i:e.scrollbarYTop=o;var s=l.toInt(e.scrollbarYTop*(e.contentHeight-e.containerHeight)/(e.containerHeight-e.railYRatio*e.scrollbarYHeight));c(t,"top",s)}var r=null,o=null,s=function(e){n(e.pageY-o),a(t),e.stopPropagation(),e.preventDefault()},u=function(){l.stopScrolling(t,"y"),e.event.unbind(e.ownerDocument,"mousemove",s)};e.event.bind(e.scrollbarY,"mousedown",function(n){o=n.pageY,r=l.toInt(i.css(e.scrollbarY,"top"))*e.railYRatio,l.startScrolling(t,"y"),e.event.bind(e.ownerDocument,"mousemove",s),e.event.once(e.ownerDocument,"mouseup",u),n.stopPropagation(),n.preventDefault()})}var i=t("../../lib/dom"),l=t("../../lib/helper"),s=t("../instances"),a=t("../update-geometry"),c=t("../update-scroll");e.exports=function(t){var e=s.get(t);r(t,e),o(t,e)}},{"../../lib/dom":3,"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],12:[function(t,e,n){"use strict";function r(t,e){function n(n,r){var o=t.scrollTop;if(0===n){if(!e.scrollbarYActive)return!1;if(0===o&&r>0||o>=e.contentHeight-e.containerHeight&&0>r)return!e.settings.wheelPropagation}var i=t.scrollLeft;if(0===r){if(!e.scrollbarXActive)return!1;if(0===i&&0>n||i>=e.contentWidth-e.containerWidth&&n>0)return!e.settings.wheelPropagation}return!0}var r=!1;e.event.bind(t,"mouseenter",function(){r=!0}),e.event.bind(t,"mouseleave",function(){r=!1});var i=!1;e.event.bind(e.ownerDocument,"keydown",function(a){if((!a.isDefaultPrevented||!a.isDefaultPrevented())&&r){var c=document.activeElement?document.activeElement:e.ownerDocument.activeElement;if(c){for(;c.shadowRoot;)c=c.shadowRoot.activeElement;if(o.isEditable(c))return}var u=0,d=0;switch(a.which){case 37:u=-30;break;case 38:d=30;break;case 39:u=30;break;case 40:d=-30;break;case 33:d=90;break;case 32:d=a.shiftKey?90:-90;break;case 34:d=-90;break;case 35:d=a.ctrlKey?-e.contentHeight:-e.containerHeight;break;case 36:d=a.ctrlKey?t.scrollTop:e.containerHeight;break;default:return}s(t,"top",t.scrollTop-d),s(t,"left",t.scrollLeft+u),l(t),i=n(u,d),i&&a.preventDefault()}})}var o=t("../../lib/helper"),i=t("../instances"),l=t("../update-geometry"),s=t("../update-scroll");e.exports=function(t){var e=i.get(t);r(t,e)}},{"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],13:[function(t,e,n){"use strict";function r(t,e){function n(n,r){var o=t.scrollTop;if(0===n){if(!e.scrollbarYActive)return!1;if(0===o&&r>0||o>=e.contentHeight-e.containerHeight&&0>r)return!e.settings.wheelPropagation}var i=t.scrollLeft;if(0===r){if(!e.scrollbarXActive)return!1;if(0===i&&0>n||i>=e.contentWidth-e.containerWidth&&n>0)return!e.settings.wheelPropagation}return!0}function r(t){var e=t.deltaX,n=-1*t.deltaY;return("undefined"==typeof e||"undefined"==typeof n)&&(e=-1*t.wheelDeltaX/6,n=t.wheelDeltaY/6),t.deltaMode&&1===t.deltaMode&&(e*=10,n*=10),e!==e&&n!==n&&(e=0,n=t.wheelDelta),[e,n]}function o(e,n){var r=t.querySelector("textarea:hover");if(r){var o=r.scrollHeight-r.clientHeight;if(o>0&&!(0===r.scrollTop&&n>0||r.scrollTop===o&&0>n))return!0;var i=r.scrollLeft-r.clientWidth;if(i>0&&!(0===r.scrollLeft&&0>e||r.scrollLeft===i&&e>0))return!0}return!1}function s(s){var c=r(s),u=c[0],d=c[1];o(u,d)||(a=!1,e.settings.useBothWheelAxes?e.scrollbarYActive&&!e.scrollbarXActive?(d?l(t,"top",t.scrollTop-d*e.settings.wheelSpeed):l(t,"top",t.scrollTop+u*e.settings.wheelSpeed),a=!0):e.scrollbarXActive&&!e.scrollbarYActive&&(u?l(t,"left",t.scrollLeft+u*e.settings.wheelSpeed):l(t,"left",t.scrollLeft-d*e.settings.wheelSpeed),a=!0):(l(t,"top",t.scrollTop-d*e.settings.wheelSpeed),l(t,"left",t.scrollLeft+u*e.settings.wheelSpeed)),i(t),a=a||n(u,d),a&&(s.stopPropagation(),s.preventDefault()))}var a=!1;"undefined"!=typeof window.onwheel?e.event.bind(t,"wheel",s):"undefined"!=typeof window.onmousewheel&&e.event.bind(t,"mousewheel",s)}var o=t("../instances"),i=t("../update-geometry"),l=t("../update-scroll");e.exports=function(t){var e=o.get(t);r(t,e)}},{"../instances":18,"../update-geometry":19,"../update-scroll":20}],14:[function(t,e,n){"use strict";function r(t,e){e.event.bind(t,"scroll",function(){i(t)})}var o=t("../instances"),i=t("../update-geometry");e.exports=function(t){var e=o.get(t);r(t,e)}},{"../instances":18,"../update-geometry":19}],15:[function(t,e,n){"use strict";function r(t,e){function n(){var t=window.getSelection?window.getSelection():document.getSelection?document.getSelection():"";return 0===t.toString().length?null:t.getRangeAt(0).commonAncestorContainer}function r(){c||(c=setInterval(function(){return i.get(t)?(s(t,"top",t.scrollTop+u.top),s(t,"left",t.scrollLeft+u.left),void l(t)):void clearInterval(c)},50))}function a(){c&&(clearInterval(c),c=null),o.stopScrolling(t)}var c=null,u={top:0,left:0},d=!1;e.event.bind(e.ownerDocument,"selectionchange",function(){t.contains(n())?d=!0:(d=!1,a())}),e.event.bind(window,"mouseup",function(){d&&(d=!1,a())}),e.event.bind(window,"mousemove",function(e){if(d){var n={x:e.pageX,y:e.pageY},i={left:t.offsetLeft,right:t.offsetLeft+t.offsetWidth,top:t.offsetTop,bottom:t.offsetTop+t.offsetHeight};n.x<i.left+3?(u.left=-5,o.startScrolling(t,"x")):n.x>i.right-3?(u.left=5,o.startScrolling(t,"x")):u.left=0,n.y<i.top+3?(i.top+3-n.y<5?u.top=-5:u.top=-20,o.startScrolling(t,"y")):n.y>i.bottom-3?(n.y-i.bottom+3<5?u.top=5:u.top=20,o.startScrolling(t,"y")):u.top=0,0===u.top&&0===u.left?a():r()}})}var o=t("../../lib/helper"),i=t("../instances"),l=t("../update-geometry"),s=t("../update-scroll");e.exports=function(t){var e=i.get(t);r(t,e)}},{"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],16:[function(t,e,n){"use strict";function r(t,e,n,r){function s(n,r){var o=t.scrollTop,i=t.scrollLeft,l=Math.abs(n),s=Math.abs(r);if(s>l){if(0>r&&o===e.contentHeight-e.containerHeight||r>0&&0===o)return!e.settings.swipePropagation}else if(l>s&&(0>n&&i===e.contentWidth-e.containerWidth||n>0&&0===i))return!e.settings.swipePropagation;return!0}function a(e,n){l(t,"top",t.scrollTop-n),l(t,"left",t.scrollLeft-e),i(t)}function c(){Y=!0}function u(){Y=!1}function d(t){return t.targetTouches?t.targetTouches[0]:t}function p(t){return t.targetTouches&&1===t.targetTouches.length?!0:t.pointerType&&"mouse"!==t.pointerType&&t.pointerType!==t.MSPOINTER_TYPE_MOUSE?!0:!1}function f(t){if(p(t)){w=!0;var e=d(t);b.pageX=e.pageX,b.pageY=e.pageY,g=(new Date).getTime(),null!==y&&clearInterval(y),t.stopPropagation()}}function h(t){if(!Y&&w&&p(t)){var e=d(t),n={pageX:e.pageX,pageY:e.pageY},r=n.pageX-b.pageX,o=n.pageY-b.pageY;a(r,o),b=n;var i=(new Date).getTime(),l=i-g;l>0&&(m.x=r/l,m.y=o/l,g=i),s(r,o)&&(t.stopPropagation(),t.preventDefault())}}function v(){!Y&&w&&(w=!1,clearInterval(y),y=setInterval(function(){return o.get(t)?Math.abs(m.x)<.01&&Math.abs(m.y)<.01?void clearInterval(y):(a(30*m.x,30*m.y),m.x*=.8,void(m.y*=.8)):void clearInterval(y)},10))}var b={},g=0,m={},y=null,Y=!1,w=!1;n&&(e.event.bind(window,"touchstart",c),e.event.bind(window,"touchend",u),e.event.bind(t,"touchstart",f),e.event.bind(t,"touchmove",h),e.event.bind(t,"touchend",v)),r&&(window.PointerEvent?(e.event.bind(window,"pointerdown",c),e.event.bind(window,"pointerup",u),e.event.bind(t,"pointerdown",f),e.event.bind(t,"pointermove",h),e.event.bind(t,"pointerup",v)):window.MSPointerEvent&&(e.event.bind(window,"MSPointerDown",c),e.event.bind(window,"MSPointerUp",u),e.event.bind(t,"MSPointerDown",f),e.event.bind(t,"MSPointerMove",h),e.event.bind(t,"MSPointerUp",v)))}var o=t("../instances"),i=t("../update-geometry"),l=t("../update-scroll");e.exports=function(t,e,n){var i=o.get(t);r(t,i,e,n)}},{"../instances":18,"../update-geometry":19,"../update-scroll":20}],17:[function(t,e,n){"use strict";var r=t("../lib/class"),o=t("../lib/helper"),i=t("./instances"),l=t("./update-geometry"),s=t("./handler/click-rail"),a=t("./handler/drag-scrollbar"),c=t("./handler/keyboard"),u=t("./handler/mouse-wheel"),d=t("./handler/native-scroll"),p=t("./handler/selection"),f=t("./handler/touch");e.exports=function(t,e){e="object"==typeof e?e:{},r.add(t,"ps-container");var n=i.add(t);n.settings=o.extend(n.settings,e),s(t),a(t),u(t),d(t),n.settings.useSelectionScroll&&p(t),(o.env.supportsTouch||o.env.supportsIePointer)&&f(t,o.env.supportsTouch,o.env.supportsIePointer),n.settings.useKeyboard&&c(t),l(t)}},{"../lib/class":2,"../lib/helper":6,"./handler/click-rail":10,"./handler/drag-scrollbar":11,"./handler/keyboard":12,"./handler/mouse-wheel":13,"./handler/native-scroll":14,"./handler/selection":15,"./handler/touch":16,"./instances":18,"./update-geometry":19}],18:[function(t,e,n){"use strict";function r(t){var e=this;e.settings=d.clone(a),e.containerWidth=null,e.containerHeight=null,e.contentWidth=null,e.contentHeight=null,e.isRtl="rtl"===s.css(t,"direction"),e.isNegativeScroll=function(){var e=t.scrollLeft,n=null;return t.scrollLeft=-1,n=t.scrollLeft<0,t.scrollLeft=e,n}(),e.negativeScrollAdjustment=e.isNegativeScroll?t.scrollWidth-t.clientWidth:0,e.event=new c,e.ownerDocument=t.ownerDocument||document,e.scrollbarXRail=s.appendTo(s.e("div","ps-scrollbar-x-rail"),t),e.scrollbarX=s.appendTo(s.e("div","ps-scrollbar-x"),e.scrollbarXRail),e.scrollbarX.setAttribute("tabindex",0),e.scrollbarXActive=null,e.scrollbarXWidth=null,e.scrollbarXLeft=null,e.scrollbarXBottom=d.toInt(s.css(e.scrollbarXRail,"bottom")),e.isScrollbarXUsingBottom=e.scrollbarXBottom===e.scrollbarXBottom,e.scrollbarXTop=e.isScrollbarXUsingBottom?null:d.toInt(s.css(e.scrollbarXRail,"top")),e.railBorderXWidth=d.toInt(s.css(e.scrollbarXRail,"borderLeftWidth"))+d.toInt(s.css(e.scrollbarXRail,"borderRightWidth")),s.css(e.scrollbarXRail,"display","block"),e.railXMarginWidth=d.toInt(s.css(e.scrollbarXRail,"marginLeft"))+d.toInt(s.css(e.scrollbarXRail,"marginRight")),s.css(e.scrollbarXRail,"display",""),e.railXWidth=null,e.railXRatio=null,e.scrollbarYRail=s.appendTo(s.e("div","ps-scrollbar-y-rail"),t),e.scrollbarY=s.appendTo(s.e("div","ps-scrollbar-y"),e.scrollbarYRail),e.scrollbarY.setAttribute("tabindex",0),e.scrollbarYActive=null,e.scrollbarYHeight=null,e.scrollbarYTop=null,e.scrollbarYRight=d.toInt(s.css(e.scrollbarYRail,"right")),e.isScrollbarYUsingRight=e.scrollbarYRight===e.scrollbarYRight,e.scrollbarYLeft=e.isScrollbarYUsingRight?null:d.toInt(s.css(e.scrollbarYRail,"left")),e.scrollbarYOuterWidth=e.isRtl?d.outerWidth(e.scrollbarY):null,e.railBorderYWidth=d.toInt(s.css(e.scrollbarYRail,"borderTopWidth"))+d.toInt(s.css(e.scrollbarYRail,"borderBottomWidth")),s.css(e.scrollbarYRail,"display","block"),e.railYMarginHeight=d.toInt(s.css(e.scrollbarYRail,"marginTop"))+d.toInt(s.css(e.scrollbarYRail,"marginBottom")),s.css(e.scrollbarYRail,"display",""),e.railYHeight=null,e.railYRatio=null}function o(t){return"undefined"==typeof t.dataset?t.getAttribute("data-ps-id"):t.dataset.psId}function i(t,e){"undefined"==typeof t.dataset?t.setAttribute("data-ps-id",e):t.dataset.psId=e}function l(t){"undefined"==typeof t.dataset?t.removeAttribute("data-ps-id"):delete t.dataset.psId}var s=t("../lib/dom"),a=t("./default-setting"),c=t("../lib/event-manager"),u=t("../lib/guid"),d=t("../lib/helper"),p={};n.add=function(t){var e=u();return i(t,e),p[e]=new r(t),p[e]},n.remove=function(t){delete p[o(t)],l(t)},n.get=function(t){return p[o(t)]}},{"../lib/dom":3,"../lib/event-manager":4,"../lib/guid":5,"../lib/helper":6,"./default-setting":8}],19:[function(t,e,n){"use strict";function r(t,e){return t.settings.minScrollbarLength&&(e=Math.max(e,t.settings.minScrollbarLength)),t.settings.maxScrollbarLength&&(e=Math.min(e,t.settings.maxScrollbarLength)),e}function o(t,e){var n={width:e.railXWidth};e.isRtl?n.left=e.negativeScrollAdjustment+t.scrollLeft+e.containerWidth-e.contentWidth:n.left=t.scrollLeft,e.isScrollbarXUsingBottom?n.bottom=e.scrollbarXBottom-t.scrollTop:n.top=e.scrollbarXTop+t.scrollTop,l.css(e.scrollbarXRail,n);var r={top:t.scrollTop,height:e.railYHeight};e.isScrollbarYUsingRight?e.isRtl?r.right=e.contentWidth-(e.negativeScrollAdjustment+t.scrollLeft)-e.scrollbarYRight-e.scrollbarYOuterWidth:r.right=e.scrollbarYRight-t.scrollLeft:e.isRtl?r.left=e.negativeScrollAdjustment+t.scrollLeft+2*e.containerWidth-e.contentWidth-e.scrollbarYLeft-e.scrollbarYOuterWidth:r.left=e.scrollbarYLeft+t.scrollLeft,l.css(e.scrollbarYRail,r),l.css(e.scrollbarX,{left:e.scrollbarXLeft,width:e.scrollbarXWidth-e.railBorderXWidth}),l.css(e.scrollbarY,{top:e.scrollbarYTop,height:e.scrollbarYHeight-e.railBorderYWidth})}var i=t("../lib/class"),l=t("../lib/dom"),s=t("../lib/helper"),a=t("./instances"),c=t("./update-scroll");e.exports=function(t){var e=a.get(t);e.containerWidth=t.clientWidth,e.containerHeight=t.clientHeight,e.contentWidth=t.scrollWidth,e.contentHeight=t.scrollHeight;var n;t.contains(e.scrollbarXRail)||(n=l.queryChildren(t,".ps-scrollbar-x-rail"),n.length>0&&n.forEach(function(t){l.remove(t)}),l.appendTo(e.scrollbarXRail,t)),t.contains(e.scrollbarYRail)||(n=l.queryChildren(t,".ps-scrollbar-y-rail"),n.length>0&&n.forEach(function(t){l.remove(t)}),l.appendTo(e.scrollbarYRail,t)),!e.settings.suppressScrollX&&e.containerWidth+e.settings.scrollXMarginOffset<e.contentWidth?(e.scrollbarXActive=!0,e.railXWidth=e.containerWidth-e.railXMarginWidth,e.railXRatio=e.containerWidth/e.railXWidth,e.scrollbarXWidth=r(e,s.toInt(e.railXWidth*e.containerWidth/e.contentWidth)),e.scrollbarXLeft=s.toInt((e.negativeScrollAdjustment+t.scrollLeft)*(e.railXWidth-e.scrollbarXWidth)/(e.contentWidth-e.containerWidth))):e.scrollbarXActive=!1,!e.settings.suppressScrollY&&e.containerHeight+e.settings.scrollYMarginOffset<e.contentHeight?(e.scrollbarYActive=!0,e.railYHeight=e.containerHeight-e.railYMarginHeight,e.railYRatio=e.containerHeight/e.railYHeight,e.scrollbarYHeight=r(e,s.toInt(e.railYHeight*e.containerHeight/e.contentHeight)),e.scrollbarYTop=s.toInt(t.scrollTop*(e.railYHeight-e.scrollbarYHeight)/(e.contentHeight-e.containerHeight))):e.scrollbarYActive=!1,e.scrollbarXLeft>=e.railXWidth-e.scrollbarXWidth&&(e.scrollbarXLeft=e.railXWidth-e.scrollbarXWidth),e.scrollbarYTop>=e.railYHeight-e.scrollbarYHeight&&(e.scrollbarYTop=e.railYHeight-e.scrollbarYHeight),o(t,e),e.scrollbarXActive?i.add(t,"ps-active-x"):(i.remove(t,"ps-active-x"),e.scrollbarXWidth=0,e.scrollbarXLeft=0,c(t,"left",0)),e.scrollbarYActive?i.add(t,"ps-active-y"):(i.remove(t,"ps-active-y"),e.scrollbarYHeight=0,e.scrollbarYTop=0,c(t,"top",0))}},{"../lib/class":2,"../lib/dom":3,"../lib/helper":6,"./instances":18,"./update-scroll":20}],20:[function(t,e,n){"use strict";var r,o,i=t("./instances"),l=document.createEvent("Event"),s=document.createEvent("Event"),a=document.createEvent("Event"),c=document.createEvent("Event"),u=document.createEvent("Event"),d=document.createEvent("Event"),p=document.createEvent("Event"),f=document.createEvent("Event"),h=document.createEvent("Event"),v=document.createEvent("Event");l.initEvent("ps-scroll-up",!0,!0),s.initEvent("ps-scroll-down",!0,!0),a.initEvent("ps-scroll-left",!0,!0),c.initEvent("ps-scroll-right",!0,!0),u.initEvent("ps-scroll-y",!0,!0),d.initEvent("ps-scroll-x",!0,!0),p.initEvent("ps-x-reach-start",!0,!0),f.initEvent("ps-x-reach-end",!0,!0),h.initEvent("ps-y-reach-start",!0,!0),v.initEvent("ps-y-reach-end",!0,!0),e.exports=function(t,e,n){if("undefined"==typeof t)throw"You must provide an element to the update-scroll function";if("undefined"==typeof e)throw"You must provide an axis to the update-scroll function";if("undefined"==typeof n)throw"You must provide a value to the update-scroll function";if("top"===e&&0>=n)return t.scrollTop=0,void t.dispatchEvent(h);if("left"===e&&0>=n)return t.scrollLeft=0,void t.dispatchEvent(p);var b=i.get(t);return"top"===e&&n>=b.contentHeight-b.containerHeight?(t.scrollTop=b.contentHeight-b.containerHeight,void t.dispatchEvent(v)):"left"===e&&n>=b.contentWidth-b.containerWidth?(t.scrollLeft=b.contentWidth-b.containerWidth,void t.dispatchEvent(f)):(r||(r=t.scrollTop),o||(o=t.scrollLeft),"top"===e&&r>n&&t.dispatchEvent(l),"top"===e&&n>r&&t.dispatchEvent(s),"left"===e&&o>n&&t.dispatchEvent(a),"left"===e&&n>o&&t.dispatchEvent(c),"top"===e&&(t.scrollTop=r=n,t.dispatchEvent(u)),void("left"===e&&(t.scrollLeft=o=n,t.dispatchEvent(d))))}},{"./instances":18}],21:[function(t,e,n){"use strict";var r=t("../lib/dom"),o=t("../lib/helper"),i=t("./instances"),l=t("./update-geometry"),s=t("./update-scroll");e.exports=function(t){var e=i.get(t);e&&(e.negativeScrollAdjustment=e.isNegativeScroll?t.scrollWidth-t.clientWidth:0,r.css(e.scrollbarXRail,"display","block"),r.css(e.scrollbarYRail,"display","block"),e.railXMarginWidth=o.toInt(r.css(e.scrollbarXRail,"marginLeft"))+o.toInt(r.css(e.scrollbarXRail,"marginRight")),e.railYMarginHeight=o.toInt(r.css(e.scrollbarYRail,"marginTop"))+o.toInt(r.css(e.scrollbarYRail,"marginBottom")),r.css(e.scrollbarXRail,"display","none"),r.css(e.scrollbarYRail,"display","none"),l(t),s(t,"top",t.scrollTop),s(t,"left",t.scrollLeft),r.css(e.scrollbarXRail,"display",""),r.css(e.scrollbarYRail,"display",""))}},{"../lib/dom":3,"../lib/helper":6,"./instances":18,"./update-geometry":19,"./update-scroll":20}]},{},[1]);
// **** end perfect-scrollbar.jquery.min.js ***

// **** shader-loader.js ***
(function() {
  
  var shaderLoader = {};
  
  shaderLoader.getShaderCode = function(name) {
    for(var i=0; i<window.shaderData.length; i++) {
      if(shaderData[i].name === name) {
        return shaderData[i].code;
      }
    }
    return null;
  };
  
  window.shaderLoader = shaderLoader;
  
})();
// **** end shader-loader.js ***

// **** color-scheme.js ***
/* global groups */
(function() {
	
	var ColorScheme = function(colorizer) {
		this.colorizer = colorizer;
		this.colorBuf = gl.createBuffer();
    this.pickableBuf = gl.createBuffer();
	};
	
	ColorScheme.prototype.calculateColorBuffers = function() {
		var numSats = satSet.numSats;
		var colorData = new Float32Array(numSats*4);
    var pickableData = new Float32Array(numSats);
		for(var i=0; i < numSats; i++) {
			var colors = this.colorizer(i);
			colorData[i*4] = colors.color[0];  //R
			colorData[i*4+1] = colors.color[1]; //G
			colorData[i*4+2] = colors.color[2]; //B
			colorData[i*4+3] = colors.color[3]; //A
      pickableData[i] = colors.pickable ? 1 : 0;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuf);
		gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pickableBuf);
    gl.bufferData(gl.ARRAY_BUFFER, pickableData, gl.STATIC_DRAW);
		return {
      colorBuf : this.colorBuf,
      pickableBuf : this.pickableBuf
    };
	};
	
	ColorScheme.init = function() {
		ColorScheme.default = new ColorScheme(function(satId){
			var sat = satSet.getSat(satId);
      var color;
			if(sat.OBJECT_TYPE === 'PAYLOAD') {
				color = [1.0, 0.2, 0.0, 1.0];
			} else if (sat.OBJECT_TYPE === 'ROCKET BODY'){
				color = [0.2, 0.5, 1.0, 0.85];
			//	return [0.6, 0.6, 0.6];
			} else if (sat.OBJECT_TYPE === 'DEBRIS') {
				color = [0.5, 0.5, 0.5, 0.85];
			} else {
				color = [1.0, 1.0, 0.0, 1.0];
			}
      return {
        color : color,
        pickable : true
      };
		});
		
		ColorScheme.apogee = new ColorScheme(function(satId) {
			var ap = satSet.getSat(satId).apogee;
			var gradientAmt = Math.min(ap / 45000, 1.0);
			return {
        color : [1.0 - gradientAmt, gradientAmt, 0.0, 1.0],
        pickable : true
      }
		});
		
		ColorScheme.velocity = new ColorScheme(function(satId) {
			var vel = satSet.getSat(satId).velocity;
			var gradientAmt = Math.min(vel / 15, 1.0);
			return {
        color : [1.0 - gradientAmt, gradientAmt, 0.0, 1.0],
        pickable : true 
      };
		});
		
		ColorScheme.group = new ColorScheme(function(satId) {
			if(groups.selectedGroup.hasSat(satId)) {
				return {
          color : [1.0, 0.2, 0.0, 1.0],
          pickable : true 
        };
			} else {
				return {
          color : [1.0, 1.0, 1.0, 0.1],
          pickable : false
			 };
      }
		});
    
    $('#color-schemes-submenu').mouseover(function() {
 
    });
	};
	
	window.ColorScheme = ColorScheme;
})();
// **** end color-scheme.js ***

// **** groups.js ***
/* global $ */
/* global ColorScheme */
/* global orbitDisplay */
/* global satSet */
(function() {
	var groups = {};
	groups.selectedGroup = null;
	
	function SatGroup(groupType, data) {
		this.sats = [];
    if(groupType === 'intlDes') {
      for(var i=0; i < data.length; i++){
        this.sats.push({
          satId : satSet.getIdFromIntlDes(data[i]),
          isIntlDes : true,
          strIndex : 0,
        });
      }
    } else if (groupType === 'nameRegex') {
      var satIdList = satSet.searchNameRegex(data);
      for(var i=0; i < satIdList.length; i++) {
        this.sats.push({
          satId : satIdList[i],
          isIntlDes : false,
          strIndex : 0,
        });
      } 
    } else if (groupType === 'idList') {
      for(var i=0; i < data.length; i++) {
        this.sats.push({
          satId : data[i],
          isIntlDes : false,
          strIndex : 0
        });
      } 
    }
	}
	
	SatGroup.prototype.hasSat = function(id) {
		var len = this.sats.length;
		for(var i=0; i < len; i++) {
			if(this.sats[i].satId === id) return true;
		}
		return false;
	};
  
  SatGroup.prototype.updateOrbits = function() {
    for(var i=0; i < this.sats.length; i++) {
      orbitDisplay.updateOrbitBuffer(this.sats[i].satId);
    }
  };
  
  SatGroup.prototype.forEach = function(callback) {
    for(var i=0; i<this.sats.length; i++) {
      callback(this.sats[i].satId);
    }
  };

  groups.SatGroup = SatGroup;
  
  groups.selectGroup = function(group) {
    var start = performance.now();
		groups.selectedGroup = group;
    group.updateOrbits();
    satSet.setColorScheme(ColorScheme.group);
    var t = performance.now() - start;
   // console.log('selectGroup: ' + t + ' ms');
	};
  
  groups.clearSelect = function() {
    groups.selectedGroup = null;
    satSet.setColorScheme(ColorScheme.default);
  };
	
	groups.init = function() {
    var start = performance.now();
    
    var clicked = false;
    $('#groups-display').mouseout(function() {
      if(!clicked) {
        if(searchBox.isResultBoxOpen()) {
          groups.selectGroup(searchBox.getLastResultGroup());
        } else {
          groups.clearSelect();
        }
      }
    });
    
		$('#groups-display>li').mouseover(function() {
      clicked = false;
      var groupName = $(this).data('group');
      if(groupName === '<clear>') {
			 groups.clearSelect();
      } else {
       groups.selectGroup(groups[groupName]);
      }
		});
    
    $('#groups-display>li').click(function() {
      clicked = true;
      var groupName = $(this).data('group');
      if(groupName === '<clear>') {
        groups.clearSelect();
        $('#menu-groups .menu-title').text('Groups');
        $(this).css('display', 'none');
      } else {
        selectSat(-1); //clear selected sat
        groups.selectGroup(groups[groupName]);

        searchBox.fillResultBox(groups[groupName].sats, '');

        $('#menu-groups .clear-option').css({
          display: 'block'
        });
        $('#menu-groups .menu-title').text('Groups (' + $(this).text() + ')');
      }
      
      $('#groups-display').css({
        display: 'none'
      });
    });
	
	  groups.GPSGroup = new SatGroup('intlDes', [
  		'90103A',
      '93068A',
      '96041A',
      '97035A',
      '99055A',
      '00025A',
      '00040A',
      '00071A',
      '01004A',
      '03005A',
      '03010A',
      '03058A',
      '04009A',
      '04023A',
      '04045A',
      '05038A',
      '06042A',
      '06052A',
      '07047A',
      '07062A',
      '08012A',
      '09043A',
      '10022A',
      '11036A',
      '12053A',
      '13023A',
      '14008A',
      '14026A',
      '14045A',
      '14068A',
      '15013A'
    ]);   
    groups.IridiumGroup = new SatGroup('nameRegex', /IRIDIUM(?!.*DEB)/);
    groups.Iridium33DebrisGroup = new SatGroup('nameRegex', /(COSMOS 2251|IRIDIUM 33) DEB/);
    groups.GlonassGroup = new SatGroup('nameRegex', /GLONASS/);
    groups.GalileoGroup = new SatGroup('nameRegex', /GALILEO/);
    groups.FunGroup = new SatGroup('nameRegex', /SYLDA/);
    groups.WestfordNeedlesGroup = new SatGroup('nameRegex', /WESTFORD NEEDLES/);
    groups.SpaceXGroup = new SatGroup('nameRegex', /FALCON [19]/);
    
    console.log('groups init: ' + (performance.now() - start) + ' ms');
  };
	window.groups = groups;
	
	
})();
// **** end groups.js ***

// **** search-box.js ***
(function() {
  var searchBox = {};
  var SEARCH_LIMIT = 200;
  var satData;

  var hovering = false;
  var hoverSatId = -1;

  var resultsOpen = false;
  var lastResultGroup;

  searchBox.isResultBoxOpen = function() {
    return resultsOpen;
  };

  searchBox.getLastResultGroup = function() {
    return lastResultGroup;
  };

  searchBox.getCurrentSearch = function() {
    if(resultsOpen) {
      return $('#search').val();
    } else {
      return null;
    }
  };


  searchBox.isHovering = function() {
    return hovering;
  };

  searchBox.getHoverSat = function() {
    return hoverSatId;
  };
  
  searchBox.hideResults = function() {
    var sr = $('#search-results');
    sr.slideUp();
    groups.clearSelect();
    resultsOpen = false;
  };

  searchBox.doSearch = function(str) {
    selectSat(-1);

    if(str.length === 0) {
      hideResults();
      return;
    }

    var searchStart = performance.now();

    str = str.toUpperCase();

    var results = [];
    for(var i=0; i < satData.length; i++) {
      if(satData[i].OBJECT_NAME.indexOf(str) !== -1) {
        results.push({
          isIntlDes : false, 
          strIndex : satData[i].OBJECT_NAME.indexOf(str),
          satId : i
        });
      }
      
      if(satData[i].intlDes.indexOf(str) !== -1) {
        results.push({
          isIntlDes : true, 
          strIndex : satData[i].intlDes.indexOf(str),
          satId : i
        });
      }
      
    }
    var resultCount = results.length;

    if(results.length > SEARCH_LIMIT) {
      results.length = SEARCH_LIMIT;
    }

    //make a group to hilight results
    var idList = [];
    for(var i=0; i<results.length; i++) {
      idList.push(results[i].satId);
    }
    var dispGroup = new groups.SatGroup('idList', idList);
    lastResultGroup = dispGroup;
    groups.selectGroup(dispGroup);

    searchBox.fillResultBox(results, str);
    updateUrl();
  };

  searchBox.fillResultBox = function (results, searchStr) {
    // results:
    // [ 
    //   { sat: { id: <id>, } }
    // ]

    var resultBox = $('#search-results');
    var html = '';
    for(var i=0; i < results.length; i++) {
      var sat = satData[results[i].satId];
      html += '<div class="search-result" data-sat-id="' + sat.id + '">';
      if(results[i].isIntlDes) {
        html += sat.OBJECT_NAME;
      } else {
        html += sat.OBJECT_NAME.substring(0, results[i].strIndex);
        html += '<span class="search-hilight">';
        html += sat.OBJECT_NAME.substring(results[i].strIndex, results[i].strIndex + searchStr.length);
        html += '</span>';
        html += sat.OBJECT_NAME.substring(results[i].strIndex + searchStr.length);
      }
      html += '<div class="search-result-intldes">';
      if(results[i].isIntlDes) {
        html += sat.intlDes.substring(0, results[i].strIndex);
        html += '<span class="search-hilight">';
        html += sat.intlDes.substring(results[i].strIndex, results[i].strIndex + searchStr.length);
        html += '</span>';
        html += sat.intlDes.substring(results[i].strIndex + searchStr.length);
      } else {
        html += sat.intlDes;
      }
      html += '</div></div>';
    }
            var resultStart = performance.now();
    //  resultBox.append(html);
    resultBox[0].innerHTML = html;
    resultBox.slideDown();
    resultsOpen = true;
  };
  
  searchBox.init = function(_satData) {
    satData = _satData;
    $('#search-results').on('click', '.search-result', function(evt) {
      var satId = $(this).data('sat-id');
      selectSat(satId);
     // hideResults();
    });

    $('#search-results').on('mouseover', '.search-result', function(evt) {
      var satId = $(this).data('sat-id');
      orbitDisplay.setHoverOrbit(satId);
      satSet.setHover(satId);

      hovering = true;
      hoverSatId = satId;
    });

   $('#search-results').mouseout(function() {
      orbitDisplay.clearHoverOrbit();
      satSet.setHover(-1);
  //    hoverBoxOnSat(-1);
      hovering = false;
    }); 
    
    $('#search').on('input', function() {
        var initStart = performance.now();
        var searchStr = $('#search').val()

        searchBox.doSearch(searchStr);
    });

    $('#all-objects-link').click(function() {
      var intldes = satSet.getSat(selectedSat).intlDes;
      var searchStr = intldes.slice(0,8);
      searchBox.doSearch(searchStr);
      $('#search').val(searchStr);
    });
  };
  
  
  
  window.searchBox = searchBox;
})();
// **** end search-box.js ***

// **** orbit-display.js ***
/* global groups */
/* global satSet */
/* global mat4 */
/* global shaderLoader */
/* global gl */
(function() {
var NUM_SEGS = 255;

var glBuffers = [];
var inProgress = [];


var orbitDisplay = {};

var pathShader;

var selectOrbitBuf;
var hoverOrbitBuf;

var selectColor = [0.0, 1.0, 0.0, 1.0];
var hoverColor =  [0.5, 0.5, 1.0, 1.0];
var groupColor = [0.3, 0.5, 1.0, 0.4];

var currentHoverId = -1;
var currentSelectId = -1;

var orbitMvMat = mat4.create();

var orbitWorker = new Worker('scripts/orbit-calculation-worker.js');

var initialized = false;

orbitDisplay.init = function() {

  var startTime = performance.now();

  var vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, shaderLoader.getShaderCode('path-vertex.glsl'));
  gl.compileShader(vs);

  var fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, shaderLoader.getShaderCode('path-fragment.glsl'));
  gl.compileShader(fs);

  pathShader = gl.createProgram();
  gl.attachShader(pathShader,vs);
  gl.attachShader(pathShader,fs);
  gl.linkProgram(pathShader);

  pathShader.aPos = gl.getAttribLocation(pathShader, 'aPos');
  pathShader.uMvMatrix = gl.getUniformLocation(pathShader, 'uMvMatrix');
  pathShader.uCamMatrix = gl.getUniformLocation(pathShader, 'uCamMatrix');
  pathShader.uPMatrix = gl.getUniformLocation(pathShader, 'uPMatrix');
  pathShader.uColor = gl.getUniformLocation(pathShader, 'uColor');

  selectOrbitBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, selectOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS+1)*3), gl.STATIC_DRAW);

  hoverOrbitBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, hoverOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS+1)*3), gl.STATIC_DRAW);

  for(var i=0; i<satSet.numSats; i++) {
    glBuffers.push(allocateBuffer());
  }
  orbitWorker.postMessage({
    isInit : true,
    satData : satSet.satDataString,
    numSegs : NUM_SEGS
  });

  initialized = true;

  var time = performance.now() - startTime;
  console.log('orbitDisplay init: ' + time + ' ms');
};



orbitDisplay.updateOrbitBuffer = function(satId) {
  if(!inProgress[satId]) {
    orbitWorker.postMessage({
      isInit : false,
      satId : satId
    });
    inProgress[satId] = true;
  }
};

orbitWorker.onmessage = function(m) {
  var satId = m.data.satId;
  var pointsOut = new Float32Array(m.data.pointsOut);
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[satId]);
  gl.bufferData(gl.ARRAY_BUFFER, pointsOut, gl.DYNAMIC_DRAW);
  inProgress[satId] = false;
};

/*orbitDisplay.setOrbit = function(satId) {
  var sat = satSet.getSat(satId);
  mat4.identity(orbitMvMat);
  //apply steps in reverse order because matrix multiplication
  // (last multiplied in is first applied to vertex)

  //step 5. rotate to RAAN
  mat4.rotateZ(orbitMvMat, orbitMvMat, sat.raan + Math.PI/2);
  //step 4. incline the plane
  mat4.rotateY(orbitMvMat, orbitMvMat, -sat.inclination);
  //step 3. rotate to argument of periapsis
  mat4.rotateZ(orbitMvMat, orbitMvMat, sat.argPe - Math.PI/2);
  //step 2. put earth at the focus
  mat4.translate(orbitMvMat, orbitMvMat, [sat.semiMajorAxis - sat.apogee - 6371, 0, 0]);
  //step 1. stretch to ellipse
  mat4.scale(orbitMvMat, orbitMvMat, [sat.semiMajorAxis, sat.semiMinorAxis, 0]);

};

orbitDisplay.clearOrbit = function() {
  mat4.identity(orbitMvMat);
}*/

orbitDisplay.setSelectOrbit = function(satId) {
 // var start = performance.now();
  currentSelectId = satId;
  orbitDisplay.updateOrbitBuffer(satId);
 // console.log('setOrbit(): ' + (performance.now() - start) + ' ms');
};

orbitDisplay.clearSelectOrbit = function() {
  currentSelectId = -1;
  gl.bindBuffer(gl.ARRAY_BUFFER, selectOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS+1)*3), gl.DYNAMIC_DRAW);
};

orbitDisplay.setHoverOrbit = function(satId) {
  if(satId === currentHoverId) return;
  currentHoverId = satId;
  orbitDisplay.updateOrbitBuffer(satId);
};

orbitDisplay.clearHoverOrbit = function(satId) {
  if(currentHoverId === -1) return;
  currentHoverId = -1;

  gl.bindBuffer(gl.ARRAY_BUFFER, hoverOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS+1)*3), gl.DYNAMIC_DRAW);
};

orbitDisplay.draw = function(pMatrix, camMatrix) { //lol what do I do here
  if(!initialized) return;

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(pathShader);

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
 // gl.depthMask(false);

  gl.uniformMatrix4fv(pathShader.uMvMatrix, false, orbitMvMat);
  gl.uniformMatrix4fv(pathShader.uCamMatrix, false, camMatrix);
  gl.uniformMatrix4fv(pathShader.uPMatrix, false, pMatrix);

  if(currentSelectId !== -1) {
    gl.uniform4fv(pathShader.uColor, selectColor);
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[currentSelectId]);
    gl.vertexAttribPointer(pathShader.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, NUM_SEGS + 1);
  }

  if(currentHoverId !== -1 && currentHoverId !== currentSelectId) { //avoid z-fighting
    gl.uniform4fv(pathShader.uColor, hoverColor);
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[currentHoverId]);
    gl.vertexAttribPointer(pathShader.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, NUM_SEGS + 1);
  }
  if(groups.selectedGroup !== null) {
    gl.uniform4fv(pathShader.uColor, groupColor);
    groups.selectedGroup.forEach(function(id){
      gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[id]);
      gl.vertexAttribPointer(pathShader.aPos, 3, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.LINE_STRIP, 0, NUM_SEGS + 1);
    });
  }

  //  gl.depthMask(true);
    gl.disable(gl.BLEND);
};

function allocateBuffer() {
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS+1)*3), gl.STATIC_DRAW);
  return buf;
}

orbitDisplay.getPathShader = function() {
  return pathShader;
};

window.orbitDisplay = orbitDisplay;
})();
// **** end orbit-display.js ***

// **** line.js ***
/* global orbitDisplay */
(function() {
	function Line() {
		this.vertBuf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(6), gl.STREAM_DRAW);
	}
	
	Line.prototype.set = function(pt1, pt2) {
		var buf = [];
		buf.push(pt1[0]);
		buf.push(pt1[1]);
		buf.push(pt1[2]);
		buf.push(pt2[0]);
		buf.push(pt2[1]);
		buf.push(pt2[2]);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buf), gl.STREAM_DRAW);
	};
	
	Line.prototype.draw = function() {
		var shader = orbitDisplay.getPathShader();
	    gl.useProgram(shader);
		gl.uniform4fv(shader.uColor, [1.0, 0.0, 1.0, 1.0]);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuf);
		gl.vertexAttribPointer(shader.aPos, 3, gl.FLOAT, false, 0, 0);
 	    gl.drawArrays(gl.LINES, 0, 2);
	};
	
	window.Line = Line;
})();
// **** end line.js ***

// **** earth.js ***
/* global satellite */
//earth.js
(function() {
var earth = {};

var R2D = 180 / Math.PI;
var D2R = Math.PI / 180;

var NUM_LAT_SEGS = 64;
var NUM_LON_SEGS = 64;
var pos = [3.0, 0.0, 1.0];
var radius = 6371.0;

var vertPosBuf, vertNormBuf, texCoordBuf, vertIndexBuf; //GPU mem buffers, data and stuff?
var vertCount;

var earthShader;

earth.pos = [0, 0, 0];

var texture, nightTexture;

var texLoaded = false, nightLoaded = false;
var loaded = false;

function onImageLoaded() {
  if (texLoaded && nightLoaded) {
    loaded = true;
    $('#loader-text').text('Downloading satellites...');
  }
}

earth.init = function() {
  var startTime = new Date().getTime();

  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  var fragCode = shaderLoader.getShaderCode('earth-fragment.glsl');
  gl.shaderSource(fragShader, fragCode);
  gl.compileShader(fragShader);

  var vertShader = gl.createShader(gl.VERTEX_SHADER);
  var vertCode = shaderLoader.getShaderCode('earth-vertex.glsl');
  gl.shaderSource(vertShader, vertCode);
  gl.compileShader(vertShader);

  earthShader = gl.createProgram();
  gl.attachShader(earthShader, vertShader);
  gl.attachShader(earthShader, fragShader);
  gl.linkProgram(earthShader);

  earthShader.aVertexPosition  =        gl.getAttribLocation(earthShader, 'aVertexPosition');
  earthShader.aTexCoord =               gl.getAttribLocation(earthShader, 'aTexCoord');
  earthShader.aVertexNormal =           gl.getAttribLocation(earthShader, 'aVertexNormal');
  earthShader.uPMatrix =                gl.getUniformLocation(earthShader, 'uPMatrix');
  earthShader.uCamMatrix =              gl.getUniformLocation(earthShader, 'uCamMatrix');
  earthShader.uMvMatrix =               gl.getUniformLocation(earthShader, 'uMvMatrix');
  earthShader.uNormalMatrix =           gl.getUniformLocation(earthShader, 'uNormalMatrix');
  earthShader.uLightDirection =         gl.getUniformLocation(earthShader, 'uLightDirection');
  earthShader.uAmbientLightColor =      gl.getUniformLocation(earthShader, 'uAmbientLightColor');
  earthShader.uDirectionalLightColor =  gl.getUniformLocation(earthShader, 'uDirectionalLightColor');
  earthShader.uSampler =                gl.getUniformLocation(earthShader, 'uSampler');
  earthShader.uNightSampler =           gl.getUniformLocation(earthShader, 'uNightSampler');

  texture = gl.createTexture();
  var img = new Image();
  img.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT	);
    console.log('earth.js loaded texture');
    texLoaded = true;
    onImageLoaded();
  };
  img.src = 'images/mercator-tex.jpg';
//  img.src = '/mercator-tex-512.jpg';

  nightTexture = gl.createTexture();
  var nightImg = new Image();
  nightImg.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, nightTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, nightImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT	);
    console.log('earth.js loaded nightearth');
    nightLoaded = true;
    onImageLoaded();
  };
  nightImg.src = 'images/nightearth-4096.png';
 // nightImg.src = '/nightearth-512.jpg';

  //generate a uvsphere bottom up, CCW order
  var vertPos = [];
  var vertNorm = [];
  var texCoord = [];
  var i = 0;
  for (var lat = 0; lat <= NUM_LAT_SEGS; lat++) {
    var latAngle = (Math.PI / NUM_LAT_SEGS) * lat - (Math.PI / 2);
    var diskRadius = Math.cos(Math.abs(latAngle));
    var z = Math.sin(latAngle);
 //   console.log('LAT: ' + latAngle * R2D + ' , Z: ' + z);
    for(var lon = 0; lon <= NUM_LON_SEGS; lon++) { //add an extra vertex for texture funness
      var lonAngle = (Math.PI * 2 / NUM_LON_SEGS) * lon;
      var x = Math.cos(lonAngle) * diskRadius;
      var y = Math.sin(lonAngle) * diskRadius;
  //      console.log('i: ' + i + '    LON: ' + lonAngle * R2D + ' X: ' + x + ' Y: ' + y)

      //mercator cylindrical projection (simple angle interpolation)
      var v = 1-(lat / NUM_LAT_SEGS);
      var u = 0.5 + (lon / NUM_LON_SEGS); //may need to change to move map
  //    console.log('u: ' + u + ' v: ' + v);
      //normals: should just be a vector from center to point (aka the point itself!

      vertPos.push(x * radius);
      vertPos.push(y * radius);
      vertPos.push(z * radius);
      texCoord.push(u);
      texCoord.push(v);
      vertNorm.push(x);
      vertNorm.push(y);
      vertNorm.push(z);

      i++;
    }
  }

  //ok let's calculate vertex draw orders.... indiv triangles
  var vertIndex = [];
  for(var lat=0; lat < NUM_LAT_SEGS; lat++) { //this is for each QUAD, not each vertex, so <
    for(var lon=0; lon < NUM_LON_SEGS; lon++) {
      var blVert = lat * (NUM_LON_SEGS+1) + lon; //there's NUM_LON_SEGS + 1 verts in each horizontal band
      var brVert = blVert + 1;
      var tlVert = (lat + 1) * (NUM_LON_SEGS+1) + lon;
      var trVert = tlVert + 1;
  //    console.log('bl: ' + blVert + ' br: ' + brVert +  ' tl: ' + tlVert + ' tr: ' + trVert);
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


  var end = new Date().getTime() - startTime;
  console.log('earth init: ' + end + ' ms');
};

earth.draw = function(pMatrix, camMatrix) {
  if(!loaded) return;

  var now = new Date();
  var j = 	jday(now.getUTCFullYear(),
               now.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
               now.getUTCDate(),
               now.getUTCHours(),
               now.getUTCMinutes(),
               now.getUTCSeconds());
  j += now.getUTCMilliseconds() * 1.15741e-8; //days per millisecond

  var era = satellite.gstime_from_jday(j);

  var lightDirection = sun.currentDirection();
  vec3.normalize(lightDirection, lightDirection);

  var mvMatrix = mat4.create();
  mat4.identity(mvMatrix);
  mat4.rotateZ(mvMatrix, mvMatrix, era);
  mat4.translate(mvMatrix, mvMatrix, earth.pos);
  var nMatrix = mat3.create();
  mat3.normalFromMat4(nMatrix, mvMatrix);

  gl.useProgram(earthShader);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.uniformMatrix3fv(earthShader.uNormalMatrix, false, nMatrix);
  gl.uniformMatrix4fv(earthShader.uMvMatrix, false, mvMatrix);
  gl.uniformMatrix4fv(earthShader.uPMatrix, false, pMatrix);
  gl.uniformMatrix4fv(earthShader.uCamMatrix, false, camMatrix);
  gl.uniform3fv(earthShader.uLightDirection, lightDirection);
  gl.uniform3fv(earthShader.uAmbientLightColor, [0.03, 0.03, 0.03]); //RGB ambient light
  gl.uniform3fv(earthShader.uDirectionalLightColor, [1, 1, 0.9]); //RGB directional light

  gl.uniform1i(earthShader.uSampler, 0); //point sampler to TEXTURE0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture); //bind texture to TEXTURE0

  gl.uniform1i(earthShader.uNightSampler, 1);  //point sampler to TEXTURE1
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, nightTexture); //bind tex to TEXTURE1

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
  gl.uniformMatrix4fv(gl.pickShaderProgram.uMvMatrix, false, mvMatrix); //set up picking
  gl.disableVertexAttribArray(gl.pickShaderProgram.aColor);
  gl.enableVertexAttribArray(gl.pickShaderProgram.aPos);
  gl.drawElements(gl.TRIANGLES, vertCount, gl.UNSIGNED_SHORT, 0);

}

function jday(year, mon, day, hr, minute, sec){ //from satellite.js
  'use strict';
  return (367.0 * year -
        Math.floor((7 * (year + Math.floor((mon + 9) / 12.0))) * 0.25) +
        Math.floor( 275 * mon / 9.0 ) +
        day + 1721013.5 +
        ((sec / 60.0 + minute) / 60.0 + hr) / 24.0  //  ut in days
        //#  - 0.5*sgn(100.0*year + mon - 190002.5) + 0.5;
        );
}


window.earth = earth;
})();
// **** end earth.js ***

// **** sun.js ***
(function() {
var D2R = Math.PI / 180.0;

function currentDirection() {
  var now = new Date();
  var j = 	jday(now.getUTCFullYear(), 
             now.getUTCMonth() + 1, // Note, this function requires months in range 1-12. 
             now.getUTCDate(),
             now.getUTCHours(), 
             now.getUTCMinutes(), 
             now.getUTCSeconds());
  j += now.getUTCMilliseconds() * 1.15741e-8; //days per millisecond   
  
  return getDirection(j);
}

function getDirection(jd) {
  var n = jd - 2451545;
  var L = (280.460) + (0.9856474 * n); //mean longitude of sun
  var g = (357.528) + (0.9856003 * n); //mean anomaly
  L = L % 360.0;
  g = g % 360.0;
  
  var ecLon = L + 1.915 * Math.sin(g * D2R) + 0.020 * Math.sin(2 * g * D2R);
  var ob = getObliquity(jd);

  var x = Math.cos(ecLon * D2R);
  var y = Math.cos(ob * D2R) * Math.sin(ecLon * D2R);
  var z = Math.sin(ob * D2R) * Math.sin(ecLon * D2R);
  
  return [x, y, z];
 //return [1, 0, 0];
}

function getObliquity(jd) {
  var t = (jd - 2451545) / 3652500;
  var ob =  //arcseconds
    84381.448
   - 4680.93  * t
   -    1.55  * Math.pow(t, 2)
   + 1999.25  * Math.pow(t, 3)
   -   51.38  * Math.pow(t, 4)
   -  249.67  * Math.pow(t, 5)
   -   39.05  * Math.pow(t, 6)
   +    7.12  * Math.pow(t, 7)
   +   27.87  * Math.pow(t, 8)
   +    5.79  * Math.pow(t, 9)
   +    2.45  * Math.pow(t, 10);
  
  return ob / 3600.0;
}

function jday(year, mon, day, hr, minute, sec){ //from satellite.js
  'use strict';
  return (367.0 * year -
        Math.floor((7 * (year + Math.floor((mon + 9) / 12.0))) * 0.25) +
        Math.floor( 275 * mon / 9.0 ) +
        day + 1721013.5 +
        ((sec / 60.0 + minute) / 60.0 + hr) / 24.0  //  ut in days
        //#  - 0.5*sgn(100.0*year + mon - 190002.5) + 0.5;
        );

}

window.sun = {
  getDirection: getDirection,
  currentDirection: currentDirection
};

})();

// **** end sun.js ***

// **** sat.js ***
/* global browserUnsupported */
/* global satellite */
/* global mat4 */
/* global shaderLoader */
/* global gl */
/* global ColorScheme */
/* global $ */
(function() {
  var satSet = {};

  var dotShader;

  var satPosBuf;
  var satColorBuf;
  var pickColorBuf;
  var pickableBuf;

  var currentColorScheme;

  var shadersReady = false;

  var satPos;
  var satVel;
  var satAlt;

  var satData;
  var satExtraData;

  var hoveringSat = -1;
  var selectedSat = -1;

  var hoverColor =   [0.1, 1.0, 0.0, 1.0];
  var selectedColor = [0.0, 1.0, 1.0, 1.0];



  try {
    var satCruncher = new Worker('scripts/sat-cruncher.js');
  } catch (E) {
    browserUnsupported();
  }

  var cruncherReady = false;
  var lastDrawTime = 0;

  var cruncherReadyCallback;

  var gotExtraData = false;
  satCruncher.onmessage = function(m) {

    if(!gotExtraData) { // store extra data that comes from crunching
      var start = performance.now();

      satExtraData = JSON.parse(m.data.extraData);

      for(var i=0; i < satSet.numSats; i++) {
        satData[i].inclination = satExtraData[i].inclination;
        satData[i].eccentricity = satExtraData[i].eccentricity;
        satData[i].raan = satExtraData[i].raan;
        satData[i].argPe = satExtraData[i].argPe;
        satData[i].meanMotion = satExtraData[i].meanMotion;

        satData[i].semiMajorAxis = satExtraData[i].semiMajorAxis;
        satData[i].semiMinorAxis = satExtraData[i].semiMinorAxis;
        satData[i].apogee = satExtraData[i].apogee;
        satData[i].perigee = satExtraData[i].perigee;
        satData[i].period = satExtraData[i].period;
      }

      console.log('sat.js copied extra data in ' + (performance.now() - start) + ' ms');
      gotExtraData = true;
      return;
    }

    satPos = new Float32Array(m.data.satPos);
    satVel = new Float32Array(m.data.satVel);
    satAlt = new Float32Array(m.data.satAlt);

    if(!cruncherReady) {
      $('#load-cover').fadeOut();
      satSet.setColorScheme(currentColorScheme); //force color recalc
       cruncherReady = true;
       if(cruncherReadyCallback) {
        cruncherReadyCallback(satData);
       }
    }

  };

  satSet.init = function(satsReadyCallback) {

    dotShader = gl.createProgram();

    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, shaderLoader.getShaderCode('dot-vertex.glsl'));
    gl.compileShader(vertShader);

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, shaderLoader.getShaderCode('dot-fragment.glsl'));
    gl.compileShader(fragShader);

    gl.attachShader(dotShader, vertShader);
    gl.attachShader(dotShader, fragShader);
    gl.linkProgram(dotShader);

    dotShader.aPos = gl.getAttribLocation(dotShader, 'aPos');
    dotShader.aColor = gl.getAttribLocation(dotShader, 'aColor');
    dotShader.uMvMatrix = gl.getUniformLocation(dotShader, 'uMvMatrix');
    dotShader.uCamMatrix = gl.getUniformLocation(dotShader, 'uCamMatrix');
    dotShader.uPMatrix = gl.getUniformLocation(dotShader, 'uPMatrix');

    $.get('data/TLE.json?fakeparameter=to_avoid_browser_cache2', function(resp) {
      var startTime = new Date().getTime();


      console.log('sat.js downloaded data');
      $('#loader-text').text('Crunching numbers...');

      satData = resp;
      satSet.satDataString = JSON.stringify(satData);

      var postStart = performance.now();
        satCruncher.postMessage(satSet.satDataString); //kick off satCruncher
      var postEnd = performance.now();

      //do some processing on our satData response
      for(var i = 0; i < satData.length; i++) {

        var year = satData[i].INTLDES.substring(0,2); //clean up intl des for display
        var prefix = (year > 50) ? '19' : '20';
        year = prefix + year;
        var rest = satData[i].INTLDES.substring(2);
        satData[i].intlDes = year + '-' + rest;

        satData[i].id = i;

      }

      //populate GPU mem buffers, now that we know how many sats there are

      satPosBuf = gl.createBuffer();
      satPos = new Float32Array(satData.length * 3);

      var pickColorData = [];
      pickColorBuf = gl.createBuffer();
      for(var i = 0; i < satData.length; i++) {
        var byteR = (i+1) & 0xff;
        var byteG = ((i+1) & 0xff00) >> 8;
        var byteB = ((i+1) & 0xff0000) >> 16;
        pickColorData.push(byteR / 255.0);
        pickColorData.push(byteG / 255.0);
        pickColorData.push(byteB / 255.0);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, pickColorBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pickColorData), gl.STATIC_DRAW);

      satSet.numSats = satData.length;

      satSet.setColorScheme(ColorScheme.default);
     // satSet.setColorScheme(ColorScheme.apogee);
   //  satSet.setColorScheme(ColorScheme.velocity);

       var end = new Date().getTime();
      console.log('sat.js init: ' + (end - startTime) + ' ms (incl post: ' + (postEnd - postStart) + ' ms)');

      shadersReady = true;
      if(satsReadyCallback) {
        satsReadyCallback(satData);
      }

    });
  };

satSet.setColorScheme = function(scheme) {
  currentColorScheme = scheme;
  var buffers = scheme.calculateColorBuffers();
  satColorBuf = buffers.colorBuf;
  pickableBuf = buffers.pickableBuf;
};

satSet.draw = function(pMatrix, camMatrix) {
  if(!shadersReady || !cruncherReady) return;

  var now = Date.now();
  var dt = Math.min((now - lastDrawTime) / 1000.0, 1.0);
  for(var i=0; i<(satData.length*3); i++) {
    satPos[i] += satVel[i] * dt;
  }

    gl.useProgram(dotShader);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 //   gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);

    gl.uniformMatrix4fv(dotShader.uMvMatrix, false, mat4.create());
    gl.uniformMatrix4fv(dotShader.uCamMatrix, false, camMatrix);
    gl.uniformMatrix4fv(dotShader.uPMatrix, false, pMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, satPosBuf);
    gl.bufferData(gl.ARRAY_BUFFER, satPos, gl.STREAM_DRAW);
    gl.vertexAttribPointer(dotShader.aPos, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, satColorBuf);
    gl.enableVertexAttribArray(dotShader.aColor);
    gl.vertexAttribPointer(dotShader.aColor, 4, gl.FLOAT, false, 0, 0);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.depthMask(false);

     gl.drawArrays(gl.POINTS, 0, satData.length);

    gl.depthMask(true);
    gl.disable(gl.BLEND);

    // now pickbuffer stuff......

    gl.useProgram(gl.pickShaderProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
 //   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.uniformMatrix4fv(gl.pickShaderProgram.uMvMatrix, false, mat4.create());
      gl.uniformMatrix4fv(gl.pickShaderProgram.uCamMatrix, false, camMatrix);
      gl.uniformMatrix4fv(gl.pickShaderProgram.uPMatrix, false, pMatrix);

      gl.bindBuffer(gl.ARRAY_BUFFER, satPosBuf);
      gl.enableVertexAttribArray(gl.pickShaderProgram.aPos);
      gl.vertexAttribPointer(gl.pickShaderProgram.aPos, 3, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(gl.pickShaderProgram.aColor);
      gl.bindBuffer(gl.ARRAY_BUFFER, pickColorBuf);
      gl.vertexAttribPointer(gl.pickShaderProgram.aColor, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, pickableBuf);
      gl.enableVertexAttribArray(gl.pickShaderProgram.aPickable);
      gl.vertexAttribPointer(gl.pickShaderProgram.aPickable, 1, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, satData.length); //draw pick

    lastDrawTime = now;
  };

  satSet.getSat = function(i) {
    if(!satData) return null;
    var ret = satData[i];
    if(!ret) return null;
    if(gotExtraData) {
      ret.altitude = satAlt[i];
      ret.velocity = Math.sqrt(
        satVel[i*3] * satVel[i*3] +
        satVel[i*3+1] * satVel[i*3+1] +
        satVel[i*3+2] * satVel[i*3+2]
      );
      ret.position = {
        x : satPos[i*3],
        y : satPos[i*3+1],
        z : satPos[i*3+2]
      };
    }
    return ret;
  };

  satSet.getIdFromIntlDes = function(intlDes) {
    for(var i=0; i <satData.length; i++) {
      if(satData[i].INTLDES === intlDes || satData[i].intlDes === intlDes) {
        return i;
      }
    }
    return null;
  };

  satSet.getScreenCoords = function(i, pMatrix, camMatrix) {
    var pos = satSet.getSat(i).position;
    var posVec4 = vec4.fromValues(pos.x, pos.y, pos.z, 1);
    var transform = mat4.create();

    vec4.transformMat4(posVec4, posVec4, camMatrix);
    vec4.transformMat4(posVec4, posVec4, pMatrix);

    var glScreenPos =  {
      x : (posVec4[0] / posVec4[3]),
      y : (posVec4[1] / posVec4[3]),
      z : (posVec4[2] / posVec4[3]),
    };

    return {
      x : (glScreenPos.x + 1) * 0.5 * window.innerWidth,
      y : (-glScreenPos.y + 1) * 0.5 * window.innerHeight,
    };
  }

  satSet.searchNameRegex = function(regex) {
    var res = [];
    for(var i=0; i<satData.length; i++) {
      if(regex.test(satData[i].OBJECT_NAME)) {
        res.push(i);
      }
    }
    return res;
  };


  satSet.setHover = function(i) {
    if (i === hoveringSat) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, satColorBuf);
    if(hoveringSat != -1 && hoveringSat != selectedSat) {
      gl.bufferSubData(gl.ARRAY_BUFFER, hoveringSat * 4 * 4, new Float32Array(currentColorScheme.colorizer(hoveringSat).color));
    }
    if(i != -1) {
      gl.bufferSubData(gl.ARRAY_BUFFER, i * 4 * 4, new Float32Array(hoverColor));
    }
    hoveringSat = i;
  };

  satSet.selectSat = function(i) {
    if(i === selectedSat) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, satColorBuf);
    if(selectedSat != -1) {
      gl.bufferSubData(gl.ARRAY_BUFFER, selectedSat * 4 * 4, new Float32Array(currentColorScheme.colorizer(selectedSat).color));
    }
    if(i != -1) {
      gl.bufferSubData(gl.ARRAY_BUFFER, i * 4 * 4, new Float32Array(selectedColor));
    }
    selectedSat = i;
  };

  satSet.onCruncherReady = function(cb) {
    cruncherReadyCallback = cb;
    if(cruncherReady) cb;
  }

  window.satSet = satSet;

})();
// **** end sat.js ***

// **** main.js ***
/* global groups */
/* global ColorScheme */
/* global satSet */
/* global $ */
/* global shaderLoader */
/* global Line */
/* global vec4 */
/* global mat4 */
/* global vec3 */
/* global mat3 */
/* global earth */
/* global searchBox */
/* global Spinner */
/* global sun */
/* global orbitDisplay */
var gl;
var cubeVertIndexBuffer;

var R2D = 180 / Math.PI;

var camYaw = 0;
var camPitch = 0.5;

var camYawTarget = 0;
var camPitchTarget = 0;
var camSnapMode = false;
var camZoomSnappedOnSat = false;
var camAngleSnappedOnSat = false;

var camDistTarget = 10000;
var zoomLevel = 0.5;
var zoomTarget = 0.5;
var ZOOM_EXP = 3;
var DIST_MIN = 6400;
var DIST_MAX = 200000;

var camPitchSpeed = 0;
var camYawSpeed = 0;

var pickFb, pickTex;
var pickColorBuf;

var pMatrix = mat4.create(), camMatrix = mat4.create();

var selectedSat = -1;

var mouseX = 0, mouseY = 0, mouseSat = -1;

var dragPoint = [0,0,0];
var screenDragPoint = [0,0];
var dragStartPitch = 0;
var dragStartYaw = 0;
var isDragging = false;
var dragHasMoved = false;

var initialRotation = true;
var initialRotSpeed = 0.000075;

var debugContext, debugImageData;

var debugLine, debugLine2, debugLine3;
var spinner;
$(document).ready(function() {
  var opts = {
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
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '50%', // Top position relative to parent
    left: '50%' // Left position relative to parent
  };
  var target = document.getElementById('spinner');
  spinner = new Spinner(opts).spin(target);

  $('#search-results').perfectScrollbar();
 
  var resizing = false;
  
  $(window).resize(function() {
    if(!resizing) {
      window.setTimeout(function() {
        resizing = false;
        webGlInit();
      }, 500);
    } 
    resizing = true;
  });
  
  webGlInit();
  earth.init();
  ColorScheme.init();
  satSet.init(function(satData) {
    orbitDisplay.init();
    groups.init();
    searchBox.init(satData);
    
    debugLine = new Line();
    debugLine2 = new Line();
    debugLine3 = new Line();
  });

  satSet.onCruncherReady(function(satData) {
    //do querystring stuff
    var queryStr = window.location.search.substring(1);
    var params = queryStr.split('&');
    for(var i=0; i < params.length; i++){
      var key = params[i].split('=')[0];
      var val = params[i].split('=')[1];
      if(key === 'intldes') {
        console.log('url snapping to ' + val);
        var urlSatId = satSet.getIdFromIntlDes(val.toUpperCase());
        if(urlSatId !== null) {
          selectSat(urlSatId);
        }
      } else if (key === 'search') {
        console.log('preloading search to ' + val);
        searchBox.doSearch(val);
        $('#search').val(val);
      }
    }

    searchBox.init(satData);
  });
    
	$('#canvas').on('touchmove', function(evt) {
		evt.preventDefault();
	  if(isDragging) {
      dragHasMoved = true;
      camAngleSnappedOnSat = false;
      camZoomSnappedOnSat = false;
    }
      mouseX = evt.originalEvent.touches[0].clientX;
      mouseY = evt.originalEvent.touches[0].clientY;
	});
	
    $('#canvas').mousemove(function(evt) {
      if(isDragging) {
        dragHasMoved = true;
        camAngleSnappedOnSat = false;
        camZoomSnappedOnSat = false;
      }
      mouseX = evt.clientX;
      mouseY = evt.clientY;
    });
    
    $('#canvas').on('wheel', function (evt) {
      var delta = evt.originalEvent.deltaY;
      if(evt.originalEvent.deltaMode === 1) {
        delta *= 33.3333333;
      }
      zoomTarget += delta * 0.0002;
      if(zoomTarget > 1) zoomTarget = 1;
      if(zoomTarget < 0) zoomTarget = 0;
      initialRotation = false;
      camZoomSnappedOnSat = false;
    });
    
    $('#canvas').click(function(evt) {
	  
    
    });
    
    $('#canvas').contextmenu(function() {
     return false; //stop right-click menu
    });
	
    $('#canvas').mousedown(function(evt){
   //   if(evt.which === 3) {//RMB
        dragPoint = getEarthScreenPoint(evt.clientX, evt.clientY);
        screenDragPoint = [evt.clientX, evt.clientY];
        dragStartPitch = camPitch;
        dragStartYaw = camYaw;
     //   debugLine.set(dragPoint, getCamPos());
        isDragging = true;
        camSnapMode = false;
        initialRotation = false;
   //   }
    });
	
	$('#canvas').on('touchstart', function (evt) {
    var x = evt.originalEvent.touches[0].clientX;
    var y = evt.originalEvent.touches[0].clientY;
		dragPoint = getEarthScreenPoint(x,y);
    screenDragPoint = [x,y];
    dragStartPitch = camPitch;
    dragStartYaw = camYaw;
     //   debugLine.set(dragPoint, getCamPos());
    isDragging = true;
    camSnapMode = false;
    initialRotation = false;
	});
    
    $('#canvas').mouseup(function(evt){
   //   if(evt.which === 3) {//RMB
		if(!dragHasMoved) {
		  var clickedSat = getSatIdFromCoord(evt.clientX, evt.clientY);
      if(clickedSat === -1) searchBox.hideResults();
		  selectSat(clickedSat);
	    }
		dragHasMoved = false;
        isDragging = false;
        initialRotation = false;
  //    }
    });
	
	$('#canvas').on('touchend', function(evt) {
		dragHasMoved = false;
    isDragging = false;
    initialRotation = false;
	});
    
    $('.menu-item').mouseover(function(evt){
      $(this).children('.submenu').css({
        display: 'block'
      });
    });
    
    $('.menu-item').mouseout(function(evt){
      $(this).children('.submenu').css({
        display: 'none'
      });
    });
    
    $('#zoom-in').click(function() {
      zoomTarget -= 0.04;
      if(zoomTarget < 0) zoomTarget = 0;
      initialRotation = false;
      camZoomSnappedOnSat = false;
    });
    
    $('#zoom-out').click(function() {
      zoomTarget += 0.04;
      if(zoomTarget > 1) zoomTarget = 1;
      initialRotation = false;
      camZoomSnappedOnSat = false;
    });
 //   debugContext = $('#debug-canvas')[0].getContext('2d');
 //   debugImageData = debugContext.createImageData(debugContext.canvas.width, debugContext.canvas.height);
  drawLoop(); //kick off the animationFrame()s
});

function selectSat(satId) {
  selectedSat = satId;
  if(satId === -1) {
    $('#sat-infobox').fadeOut();
     orbitDisplay.clearSelectOrbit();
  } else {
    camZoomSnappedOnSat = true;
    camAngleSnappedOnSat = true;

    satSet.selectSat(satId);
 //   camSnapToSat(satId);
    var sat = satSet.getSat(satId);
    if(!sat) return;
    orbitDisplay.setSelectOrbit(satId);
    $('#sat-infobox').fadeIn();
    $('#sat-info-title').html(sat.OBJECT_NAME);
    $('#sat-intl-des').html(sat.intlDes);
    $('#sat-type').html(sat.OBJECT_TYPE);
    $('#sat-apogee').html(sat.apogee.toFixed(0) + ' km');
    $('#sat-perigee').html(sat.perigee.toFixed(0) + ' km');
    $('#sat-inclination').html((sat.inclination * R2D).toFixed(2) + '°');  
    $('#sat-period').html(sat.period.toFixed(2) + ' min');
  }
  updateUrl();
}

function browserUnsupported() {
  $('#canvas-holder').hide();
  $('#no-webgl').css('display', 'block');
}

function webGlInit() {
  var can = $('#canvas')[0];
  
  can.width = window.innerWidth;
  can.height = window.innerHeight;
 
  var gl = can.getContext('webgl', {alpha: false}) || can.getContext('experimental-webgl', {alpha: false});
  if(!gl) {
      browserUnsupported();
  }
  
  gl.viewport(0, 0, can.width, can.height);
  
  gl.enable(gl.DEPTH_TEST);
  gl.enable(0x8642); //enable point sprites(?!) This might get browsers with 
                     // underlying OpenGL to behave
                     //although it's not technically a part of the WebGL standard
  
  var pFragShader = gl.createShader(gl.FRAGMENT_SHADER);
  var pFragCode = shaderLoader.getShaderCode('pick-fragment.glsl');
  gl.shaderSource(pFragShader, pFragCode);
  gl.compileShader(pFragShader);
  
  var pVertShader = gl.createShader(gl.VERTEX_SHADER);
  var pVertCode = shaderLoader.getShaderCode('pick-vertex.glsl');
  gl.shaderSource(pVertShader, pVertCode);
  gl.compileShader(pVertShader);
  
  var pickShaderProgram = gl.createProgram();
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
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //makes clearing work
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  
  var rb = gl.createRenderbuffer(); //create RB to store the depth buffer
  gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.drawingBufferWidth, gl.drawingBufferHeight);
  
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickTex, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
  
  gl.pickFb = pickFb;
  
  pickColorBuf = new Uint8Array(4);
  
  pMatrix = mat4.create();
  mat4.perspective(pMatrix, 1.01, gl.drawingBufferWidth / gl.drawingBufferHeight, 20.0, 600000.0);
  var eciToOpenGlMat = [
    1,  0,  0,  0,
    0,  0, -1,  0,
    0,  1,  0,  0,
    0,  0,  0,  1
  ];
  mat4.mul(pMatrix, pMatrix, eciToOpenGlMat); //pMat = pMat * ecioglMat 
  
  window.gl = gl;
}

function getCamPos() {
  var r = getCamDist();
  var z = r * Math.sin(camPitch);
  var rYaw = r * Math.cos(camPitch);
  var x = rYaw * Math.sin(camYaw);
  var y = rYaw * Math.cos(camYaw) * -1;
  return [x, y, z];
}

function unProject(mx, my) {
  var glScreenX = (mx / gl.drawingBufferWidth * 2) - 1.0;
  var glScreenY = 1.0 - (my / gl.drawingBufferHeight * 2);
  var screenVec = [glScreenX, glScreenY, -0.01, 1.0]; //gl screen coords
 
  var comboPMat = mat4.create();
  mat4.mul(comboPMat, pMatrix, camMatrix);
  var invMat = mat4.create();
  mat4.invert(invMat, comboPMat);
  var worldVec = vec4.create();
  vec4.transformMat4(worldVec, screenVec, invMat);
 
  return [worldVec[0] / worldVec[3], worldVec[1] / worldVec[3], worldVec[2] / worldVec[3]];
}

function getEarthScreenPoint(x, y) {
//  var start = performance.now();
  
  var rayOrigin = getCamPos();
  var ptThru = unProject(x, y);

  var rayDir = vec3.create();
  vec3.subtract(rayDir, ptThru, rayOrigin); //rayDir = ptThru - rayOrigin
  vec3.normalize(rayDir, rayDir);

  var toCenterVec = vec3.create();
  vec3.scale(toCenterVec, rayOrigin, -1); //toCenter is just -camera pos because center is at [0,0,0]
  var dParallel = vec3.dot(rayDir, toCenterVec);
  
  var longDir = vec3.create();
  vec3.scale(longDir, rayDir, dParallel); //longDir = rayDir * distParallel
  vec3.add(ptThru, rayOrigin, longDir); //ptThru is now on the plane going through the center of sphere
  var dPerp = vec3.len(ptThru);
  
  var dSubSurf = Math.sqrt(6371*6371 - dPerp*dPerp);
  var dSurf = dParallel - dSubSurf;
  
  var ptSurf = vec3.create();
  vec3.scale(ptSurf, rayDir, dSurf);
  vec3.add(ptSurf, ptSurf, rayOrigin);
  
 // console.log('earthscreenpt: ' + (performance.now() - start) + ' ms');
  
  return ptSurf;
}


function getCamDist() {
  return Math.pow(zoomLevel, ZOOM_EXP) * (DIST_MAX - DIST_MIN) + DIST_MIN;
}

function camSnapToSat(satId) {
  /* this function runs every frame that a satellite is seleected. However, the user might have broken out of the
  zoom snap or angle snap. If so, don't change those targets. */
 
  var sat = satSet.getSat(satId);

  if(camAngleSnappedOnSat) {
    var pos = sat.position;
    var r = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
    var yaw = Math.atan2(pos.y, pos.x) + Math.PI/2;
    var pitch = Math.atan2(pos.z, r);
    camSnap(pitch, yaw);
  }
  
  if(camZoomSnappedOnSat) {
    var camDistTarget = sat.altitude + 6371 + 2000;
    zoomTarget = Math.pow((camDistTarget - DIST_MIN) / (DIST_MAX - DIST_MIN), 1/ZOOM_EXP);
  }
}

function camSnap(pitch, yaw) {
  camPitchTarget = pitch;
  camYawTarget = normalizeAngle(yaw);
  camSnapMode = true;
}

function normalizeAngle(angle) {
  angle %= Math.PI * 2;
  if(angle > Math.PI) angle -= Math.PI*2;
  if(angle < -Math.PI) angle += Math.PI*2;
  return angle;
}


var oldT = new Date();
function drawLoop() {
  var newT = new Date();
  var dt = Math.min(newT - oldT, 1000);
  oldT = newT;
  var dragTarget = getEarthScreenPoint(mouseX, mouseY);
  if(isDragging) {
       if(isNaN(dragTarget[0]) || isNaN(dragTarget[1]) || isNaN(dragTarget[2])
       || isNaN(dragPoint[0]) || isNaN(dragPoint[1]) || isNaN(dragPoint[2])) { //random screen drag
         var xDif = screenDragPoint[0] - mouseX;
         var yDif = screenDragPoint[1] - mouseY;
         var yawTarget = dragStartYaw + xDif*0.005;
         var pitchTarget = dragStartPitch + yDif*-0.005;
         camPitchSpeed = normalizeAngle(camPitch - pitchTarget) * -0.005;
         camYawSpeed = normalizeAngle(camYaw - yawTarget) * -0.005;
       } else {  //earth surface point drag  
        var dragPointR = Math.sqrt(dragPoint[0]*dragPoint[0] + dragPoint[1]*dragPoint[1]);
        var dragTargetR = Math.sqrt(dragTarget[0]*dragTarget[0] + dragTarget[1]*dragTarget[1]);
        
        var dragPointLon =  Math.atan2(dragPoint[1], dragPoint[0]);
        var dragTargetLon = Math.atan2(dragTarget[1], dragTarget[0]);
        
        var dragPointLat = Math.atan2(dragPoint[2] , dragPointR);
        var dragTargetLat = Math.atan2(dragTarget[2] , dragTargetR);
        
        var pitchDif = dragPointLat - dragTargetLat;
        var yawDif = normalizeAngle(dragPointLon - dragTargetLon);
        camPitchSpeed = pitchDif * 0.015;
        camYawSpeed = yawDif * 0.015;
      }
      camSnapMode = false;
  } else {
    camPitchSpeed -= (camPitchSpeed * dt * 0.005); //decay speeds when globe is "thrown"
    camYawSpeed -= (camYawSpeed * dt * 0.005);
  }
  
  camPitch += camPitchSpeed * dt;
  camYaw += camYawSpeed * dt;
  
  if(initialRotation) {
    camYaw += initialRotSpeed * dt;
  }
  
  if(camSnapMode) { 
    camPitch += (camPitchTarget - camPitch) * 0.003 * dt;
    
    var yawErr = normalizeAngle(camYawTarget - camYaw);
    camYaw += yawErr * 0.003 * dt;
    
 /*   if(Math.abs(camPitchTarget - camPitch) < 0.002 && Math.abs(camYawTarget - camYaw) < 0.002 && Math.abs(zoomTarget - zoomLevel) < 0.002) {
      camSnapMode = false; Stay in camSnapMode forever. Is this a good idea? dunno....
    }*/
     zoomLevel = zoomLevel + (zoomTarget - zoomLevel)*dt*0.0025;
  } else {
     zoomLevel = zoomLevel + (zoomTarget - zoomLevel)*dt*0.0075;
  }
  
  if(camPitch > Math.PI/2) camPitch = Math.PI/2;
  if(camPitch < -Math.PI/2) camPitch = -Math.PI/2;
 // camYaw = (camYaw % (Math.PI*2));
 camYaw = normalizeAngle(camYaw);
// console.log(camYaw * R2D);
  if (selectedSat !== -1) {
    var sat = satSet.getSat(selectedSat);
    debugLine.set(sat, [0,0,0]);
    camSnapToSat(selectedSat);
  }

  drawScene();
  updateHover();
  updateSelectBox();
  requestAnimationFrame(drawLoop);
}


function drawScene() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
 // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 // gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
 
  camMatrix = mat4.create();
  mat4.identity(camMatrix);
  mat4.translate(camMatrix, camMatrix, [0, getCamDist(), 0]);
  mat4.rotateX(camMatrix, camMatrix, camPitch);
  mat4.rotateZ(camMatrix, camMatrix, -camYaw);
  
  gl.useProgram(gl.pickShaderProgram);
    gl.uniformMatrix4fv(gl.pickShaderProgram.uPMatrix, false, pMatrix);
    gl.uniformMatrix4fv(gl.pickShaderProgram.camMatrix, false,camMatrix);
   

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if(debugLine) debugLine.draw();
  if(debugLine2)debugLine2.draw();
  if(debugLine3)debugLine3.draw();
  earth.draw(pMatrix, camMatrix);
  satSet.draw(pMatrix, camMatrix);
  orbitDisplay.draw(pMatrix, camMatrix);
 
  
  /* DEBUG - show the pickbuffer on a canvas */
 // debugImageData.data = pickColorMap;
 /* debugImageData.data.set(pickColorMap);
  debugContext.putImageData(debugImageData, 0, 0);*/
}

function updateSelectBox() {
  if(selectedSat === -1) return;
  var satData = satSet.getSat(selectedSat);
  $('#sat-altitude').html(satData.altitude.toFixed(2) + ' km');
  $('#sat-velocity').html(satData.velocity.toFixed(2) + ' km/s');
}

function updateHover() {
  if(searchBox.isHovering()) {
    var satId =  searchBox.getHoverSat();
    var satPos = satSet.getScreenCoords(satId, pMatrix, camMatrix);
    if(!earthHitTest(satPos.x, satPos.y)) {
      hoverBoxOnSat(satId, satPos.x, satPos.y);
    } else {
      hoverBoxOnSat(-1, 0, 0);
    }
  } else {
    mouseSat = getSatIdFromCoord(mouseX, mouseY);
    if(mouseSat !== -1) {
      orbitDisplay.setHoverOrbit(mouseSat);
    } else {
      orbitDisplay.clearHoverOrbit();
    }
    satSet.setHover(mouseSat);
    hoverBoxOnSat(mouseSat, mouseX, mouseY);
  }
}

function hoverBoxOnSat(satId, satX, satY) {
  if(satId === -1) {
    $('#sat-hoverbox').html('(none)');
    $('#sat-hoverbox').css({display: 'none'});
    $('#canvas').css({cursor : 'default'});
  } else {
   try{
  //    console.log(pos);
      $('#sat-hoverbox').html(satSet.getSat(satId).OBJECT_NAME);
      $('#sat-hoverbox').css({
        display: 'block',
        position: 'absolute',
        left: satX + 20,
        top: satY - 10
      });
      $('#canvas').css({cursor : 'pointer'});
    } catch(e){}
  }
}

function getSatIdFromCoord(x, y) {
 // var start = performance.now();

  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
  gl.readPixels(x, gl.drawingBufferHeight - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pickColorBuf);
  
  var pickR = pickColorBuf[0];
  var pickG = pickColorBuf[1];
  var pickB = pickColorBuf[2];
  
 // console.log('picking op: ' + (performance.now() - start) + ' ms');
  return((pickB << 16) | (pickG << 8) | (pickR)) - 1;
}

function earthHitTest(x, y) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
  gl.readPixels(x, gl.drawingBufferHeight - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pickColorBuf);

  return (pickColorBuf[0] === 0 &&
          pickColorBuf[1] === 0 &&
          pickColorBuf[2] === 0);
}

function updateUrl() {
  var url = '/';
  var paramSlices = [];

  if(selectedSat !== -1){
    paramSlices.push('intldes=' + satSet.getSat(selectedSat).intlDes);
  }

  var currentSearch = searchBox.getCurrentSearch();
  if(currentSearch != null) {
    paramSlices.push('search=' + currentSearch);
  }

  if(paramSlices.length > 0) {
    url += '?' + paramSlices.join('&');
  }

  window.history.replaceState(null, 'Stuff in Space', url);
}





// **** end main.js ***


var shaderData = [{"name":"earth-fragment.glsl","code":"precision mediump float;\n\nuniform vec3 uAmbientLightColor;\nuniform vec3 uDirectionalLightColor;\nuniform vec3 uLightDirection;\n\nvarying vec2 texCoord;\nvarying vec3 normal;\n\nuniform sampler2D uSampler;\nuniform sampler2D uNightSampler;\n\n\n\nvoid main(void) {\n  float directionalLightAmount = max(dot(normal, uLightDirection), 0.0);\n  vec3 lightColor = uAmbientLightColor + (uDirectionalLightColor * directionalLightAmount);\n  \n  vec3 litTexColor = texture2D(uSampler, texCoord).rgb * lightColor * 2.0;\n  \n  vec3 nightLightColor = texture2D(uNightSampler, texCoord).rgb * pow(1.0 - directionalLightAmount, 2.0) ;\n\n  gl_FragColor = vec4(litTexColor + nightLightColor, 1.0);\n}"},{"name":"earth-vertex.glsl","code":"attribute vec3 aVertexPosition;\n\nattribute vec2 aTexCoord;\nattribute vec3 aVertexNormal;\n\nuniform mat4 uPMatrix;\nuniform mat4 uCamMatrix;\nuniform mat4 uMvMatrix;\nuniform mat3 uNormalMatrix;\n\n\nvarying vec2 texCoord;\nvarying vec3 normal;\nvarying float directionalLightAmount;\n\nvoid main(void) {\n  gl_Position = uPMatrix * uCamMatrix * uMvMatrix * vec4(aVertexPosition, 1.0);\n  texCoord = aTexCoord;\n  \n  normal = uNormalMatrix * aVertexNormal;\n}\n"},{"name":"dot-fragment.glsl","code":"precision mediump float;\n\nvarying vec4 vColor;\n\nvoid main(void) {\n  vec2 ptCoord = gl_PointCoord * 2.0 - vec2(1.0, 1.0);\n  float r = 1.0 - min(abs(length(ptCoord)), 1.0);\n \/\/ r -= abs(ptCoord.x * ptCoord.y * 0.5);\n float alpha = pow(r + 0.1, 3.0);\n alpha = min(alpha, 1.0);\n\/\/ float alpha = r;\n  gl_FragColor = vec4(vColor.rgb, vColor.a * alpha);\n}"},{"name":"dot-vertex.glsl","code":"attribute vec3 aPos;\nattribute vec4 aColor;\n\nuniform mat4 uCamMatrix;\nuniform mat4 uMvMatrix;\nuniform mat4 uPMatrix;\n\nvarying vec4 vColor;\n\nvoid main(void) {\n \/\/ gl_PointSize = 16.0;\n  vec4 position = uPMatrix * uCamMatrix *  uMvMatrix * vec4(aPos, 1.0);\n  gl_PointSize = min(max(320000.0 \/ position.w, 7.5), 20.0) * 1.0;\n  gl_Position = position;\n  vColor = aColor;\n}\n"},{"name":"pick-fragment.glsl","code":"precision mediump float;\n\nvarying vec3 vColor;\n\nvoid main(void) {\n  gl_FragColor = vec4(vColor, 1.0);\n}"},{"name":"pick-vertex.glsl","code":"attribute vec3 aPos;\nattribute vec3 aColor;\nattribute float aPickable;\n\nuniform mat4 uCamMatrix;\nuniform mat4 uMvMatrix;\nuniform mat4 uPMatrix;\n\nvarying vec3 vColor;\n\nvoid main(void) {\n  float dotSize = 16.0;\n  vec4 position = uPMatrix * uCamMatrix *  uMvMatrix * vec4(aPos, 1.0);\n  gl_Position = position;\n  gl_PointSize = dotSize * aPickable;\n  vColor = aColor * aPickable;\n}"},{"name":"path-fragment.glsl","code":"precision mediump float;\n\nvarying vec4 vColor;\n\nvoid main(void) {\n  gl_FragColor = vColor;\n}"},{"name":"path-vertex.glsl","code":"attribute vec3 aPos;\n\nuniform mat4 uCamMatrix;\nuniform mat4 uMvMatrix;\nuniform mat4 uPMatrix;\nuniform vec4 uColor;\n\nvarying vec4 vColor;\n\nvoid main(void) {\n  vec4 position = uPMatrix * uCamMatrix *  uMvMatrix * vec4(aPos, 1.0);\n  gl_Position = position;\n  vColor = uColor;\n}\n"}];
