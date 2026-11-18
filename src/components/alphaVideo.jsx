// Transparent video for Safari and every iPhone/iPad browser, which can't show the alpha channel of a WebM.
// The file is an ordinary H.264 MP4 twice the height: the picture on top, its cut-out mask (white = solid)
// below (scripts/stack-alpha.sh). WebGL draws the picture with the mask as its transparency.
// If WebGL or the video fails, the poster still shows.
import { useEffect, useRef, useState } from 'react';

const VS = 'attribute vec2 p;varying vec2 v;void main(){v=vec2((p.x+1.)/2.,(1.-p.y)/2.);gl_Position=vec4(p,0.,1.);}';
const FS = 'precision mediump float;uniform sampler2D t;varying vec2 v;void main(){vec3 c=texture2D(t,vec2(v.x,v.y*.5)).rgb;float a=texture2D(t,vec2(v.x,.5+v.y*.5)).r;gl_FragColor=vec4(c*a,a);}';

export function AlphaVideo({ src, poster, className }) {
  const canvas = useRef();
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const cv = canvas.current;
    const gl = cv?.getContext('webgl', { premultipliedAlpha: true, alpha: true });
    if (!gl) { setFailed(true); return undefined; }
    const sh = (type, code) => { const s = gl.createShader(type); gl.shaderSource(s, code); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFailed(true); return undefined; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const video = Object.assign(document.createElement('video'), { muted: true, loop: true, playsInline: true, autoplay: true, crossOrigin: 'anonymous', src });
    video.setAttribute('playsinline', ''); video.setAttribute('muted', '');
    let raf = 0; let live = true; let shown = false;
    const draw = () => {
      if (!live) return;
      if (video.readyState >= 2 && video.videoWidth) {
        const w = video.videoWidth, h = video.videoHeight / 2;
        if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
        try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video); } catch { setFailed(true); return; }
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (!shown) { shown = true; setReady(true); }
      }
      raf = video.requestVideoFrameCallback ? video.requestVideoFrameCallback(draw) : requestAnimationFrame(draw);
    };
    video.addEventListener('error', () => setFailed(true));
    video.play().catch(() => {});
    draw();
    return () => { live = false; video.cancelVideoFrameCallback?.(raf); cancelAnimationFrame(raf); video.pause(); video.removeAttribute('src'); video.load(); };
  }, [src]);
  if (failed) return <img className={className} src={poster} alt="" />;
  // The poster shows until the first frame is drawn
  return (
    <span className={className} style={{ display: 'block' }} aria-hidden>
      {!ready && <img src={poster} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />}
      <canvas ref={canvas} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
    </span>
  );
}
