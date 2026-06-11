import React, { useEffect, useRef } from "react";

export const ShaderBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;

    const syncSize = () => {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(canvas);
    syncSize();

    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    vec2 mouse = u_mouse / u_resolution;
    
    float time = u_time * 0.2;
    
    vec2 displacement = vec2(
        sin(uv.y * 4.0 + time + mouse.x * 2.0),
        cos(uv.x * 3.0 - time + mouse.y * 2.0)
    ) * 0.1;
    
    vec2 displacedUv = uv + displacement * (0.5 + 0.5 * sin(time));
    
    float flow = sin(displacedUv.x * 3.0 + time) * cos(displacedUv.y * 2.0 - time * 0.5);
    
    float mouseDist = length(uv - mouse);
    
    float glow = smoothstep(0.4, 0.0, mouseDist);
    
    float distScale = 1.0 - smoothstep(0.0, 0.5, mouseDist);
    vec2 distortedGridUv = uv + (mouse - uv) * distScale * 0.2;
    
    vec3 color1 = vec3(0.02, 0.05, 0.1); 
    vec3 color2 = vec3(0.1, 0.15, 0.25); 
    vec3 accent = vec3(0.2, 0.4, 0.9); 
    
    vec3 finalColor = mix(color1, color2, flow * 0.5 + 0.5);
    
    finalColor += accent * glow * 0.3;
    finalColor += accent * pow(glow, 4.0) * 0.6; 
    
    vec2 grid = fract(distortedGridUv * 40.0 + flow * 0.1);
    float gridLine = smoothstep(0.03, 0.0, grid.x) + smoothstep(0.03, 0.0, grid.y);
    finalColor += gridLine * 0.04 * (sin(time * 2.0) * 0.5 + 0.5);
    
    float pulse = sin(uv.y * 100.0 - time * 10.0) * 0.01;
    finalColor += pulse * distScale;
    
    gl_FragColor = vec4(finalColor, 1.0);
}`;

    const cs = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) throw new Error("Shader creation failed");
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram();
    if (!prog) return;

    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = (t: number) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
