type Particle = { pos: [number, number]; vel: [number, number]; life: number; color: [number, number, number, number]; size: number };

export class ParticleSystem {
  private gl: WebGL2RenderingContext;
  private particles: Particle[] = [];
  private maxParticles = 1000;
  private program!: WebGLProgram;
  private vao!: WebGLVertexArrayObject;
  private buffer!: WebGLBuffer;
  private uResolutionLoc!: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.initGL();
  }

  private initGL() {
    const gl = this.gl;
    const vsSource = `#version 300 es
layout(location=0) in vec2 a_position;
layout(location=1) in vec4 a_color;
layout(location=2) in float a_size;
out vec4 v_color;
uniform vec2 u_resolution;
void main() {
  v_color = a_color;
  vec2 zeroToOne = a_position / u_resolution;
  vec2 clipSpace = zeroToOne * 2.0 - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  gl_PointSize = a_size;
}`;
    const fsSource = `#version 300 es
precision highp float;
in vec4 v_color;
out vec4 outColor;
void main() {
  float dist = distance(gl_PointCoord, vec2(0.5));
  if (dist > 0.5) discard;
  outColor = v_color;
}`;
    const vert = this.createShader(gl.VERTEX_SHADER, vsSource);
    const frag = this.createShader(gl.FRAGMENT_SHADER, fsSource);
    this.program = this.createProgram(vert, frag);
    this.vao = gl.createVertexArray()!;
    this.buffer = gl.createBuffer()!;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    const F = 4;
    const stride = (2 + 4 + 1) * F;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, stride, 2 * F);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, (2 + 4) * F);
    gl.bindVertexArray(null);
    this.uResolutionLoc = gl.getUniformLocation(this.program, 'u_resolution')!;
  }

  emit(x: number, y: number, correct: boolean, overrideColor?: [number, number, number]) {
    const count = correct ? 50 : 20;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = Math.random() * (correct ? 2 : 1) + 0.5;
      const vel: [number, number] = [Math.cos(angle) * speed * 60, Math.sin(angle) * speed * 60];
      const life = Math.random() * 0.5 + 0.5;
      let rgb: [number, number, number];
      if (overrideColor) {
        rgb = overrideColor;
      } else if (correct) {
        rgb = [Math.random(), 1, Math.random()];
      } else {
        rgb = [1, Math.random(), Math.random()];
      }
      const color: [number, number, number, number] = [rgb[0], rgb[1], rgb[2], 1];
      const size = Math.random() * 20 + 10;
      if (this.particles.length < this.maxParticles) {
        this.particles.push({ pos: [x, y], vel, life, color, size });
      }
    }
  }

  update() {
    const dt = 1 / 60;
    this.particles.forEach(p => {
      p.life -= dt;
      if (p.life > 0) {
        p.pos[0] += p.vel[0] * dt;
        p.pos[1] += p.vel[1] * dt;
        p.color[3] = p.life;
      }
    });
    this.particles = this.particles.filter(p => p.life > 0);
  }

  render(width: number, height: number) {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.uniform2f(this.uResolutionLoc, width, height);
    const data = new Float32Array(this.particles.length * 7);
    this.particles.forEach((p, i) => {
      const o = i * 7;
      data[o] = p.pos[0]; data[o+1] = p.pos[1];
      data[o+2] = p.color[0]; data[o+3] = p.color[1]; data[o+4] = p.color[2]; data[o+5] = p.color[3];
      data[o+6] = p.size;
    });
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, this.particles.length);
    gl.bindVertexArray(null);
  }

  private createShader(type: number, src: string) {
    const s = this.gl.createShader(type)!;
    this.gl.shaderSource(s, src);
    this.gl.compileShader(s);
    if (!this.gl.getShaderParameter(s, this.gl.COMPILE_STATUS)) {
      const e = this.gl.getShaderInfoLog(s);
      this.gl.deleteShader(s);
      throw new Error(`Shader compile failed:\n${e}`);
    }
    return s;
  }

  private createProgram(v: WebGLShader, f: WebGLShader) {
    const p = this.gl.createProgram()!;
    this.gl.attachShader(p, v);
    this.gl.attachShader(p, f);
    this.gl.linkProgram(p);
    if (!this.gl.getProgramParameter(p, this.gl.LINK_STATUS)) {
      const e = this.gl.getProgramInfoLog(p);
      this.gl.deleteProgram(p);
      throw new Error(`Program link failed:\n${e}`);
    }
    return p;
  }
}
