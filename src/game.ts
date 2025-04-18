import { ParticleSystem } from './particle';

// Convert HSL [0-360,0-1,0-1] to RGB [0-1]
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue = h / 360;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    r = hue2rgb(p, q, hue + 1 / 3);
    g = hue2rgb(p, q, hue);
    b = hue2rgb(p, q, hue - 1 / 3);
  }
  return [r, g, b];
}

export default class Game {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private uiText: HTMLDivElement;
  private uiHistory: HTMLDivElement;
  private uiWPM: HTMLDivElement;
  private particleSystem: ParticleSystem;
  private particleColor: [number, number, number] = [1, 1, 1];
  private currentWord: string = '';
  // per-character colors for the currentWord
  private letterColors: string[] = [];
  private history: string[] = [];
  private maxHistory: number = 20;
  private startTime: number = 0;
  private charCount: number = 0;
  private running: boolean = false;

  constructor(canvas: HTMLCanvasElement, uiText: HTMLDivElement, uiHistory: HTMLDivElement, uiWPM: HTMLDivElement) {
    this.canvas = canvas;
    this.uiText = uiText;
    this.uiHistory = uiHistory;
    this.uiWPM = uiWPM;
    const gl = this.canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');
    this.gl = gl;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.particleSystem = new ParticleSystem(gl);
    window.addEventListener('keydown', e => this.onKeyDown(e));
  }

  start() {
    this.updateUI();
    this.running = true;
    this.animate();
  }

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  // no longer used: free typing mode

  private onKeyDown(e: KeyboardEvent) {
    if (!this.running) return;
    const key = e.key;
    const now = performance.now();
    // Enter: speak the current word and add to history
    if (key === 'Enter') {
      if (this.currentWord.length === 0) return;
      // speak full word
      speechSynthesis.speak(new SpeechSynthesisUtterance(this.currentWord));
      // explosion at center
      this.particleSystem.emit(this.canvas.width / 2, this.canvas.height / 2, true, this.particleColor);
      // add to history
      this.history.push(this.currentWord);
      if (this.history.length > this.maxHistory) this.history.shift();
      this.updateHistoryUI();
      this.resetWord();
      return;
    }
    // Backspace: remove last character
    if (key === 'Backspace') {
      if (this.currentWord.length > 0) {
        this.currentWord = this.currentWord.slice(0, -1);
        if (this.letterColors.length > 0) this.letterColors.pop();
        if (this.charCount > 0) this.charCount--;
        this.updateUI();
        // update WPM display
        const now2 = performance.now();
        const elapsedMin2 = (now2 - this.startTime) / 1000 / 60;
        const wpm2 = elapsedMin2 > 0 ? (this.charCount / 5) / elapsedMin2 : 0;
        this.uiWPM.textContent = this.charCount > 0 ? `WPM: ${Math.round(wpm2)}` : '';
      }
      return;
    }
    // Space: insert space character with big particle blast
    if (key === ' ' || e.code === 'Space') {
      // insert space with blank color
      this.currentWord += ' ';
      this.letterColors.push('transparent');
      this.updateUI();
      // big animation: multiple blasts at center
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;
      for (let i = 0; i < 4; i++) {
        this.particleSystem.emit(cx, cy, true, this.particleColor);
      }
      return;
    }
    // only letters A-Z
    if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
      const letter = key.toUpperCase();
      // speak the letter
      speechSynthesis.speak(new SpeechSynthesisUtterance(letter));
      // choose a random bright HSL color for the letter
      const hue = Math.random() * 360;
      const sat = 80 + Math.random() * 20;  // 80%–100%
      const light = 50 + Math.random() * 10; // 50%–60%
      const letterColor = `hsl(${hue.toFixed(0)}, ${sat.toFixed(0)}%, ${light.toFixed(0)}%)`;
      // compute complementary color for particles
      const compHue = (hue + 180) % 360;
      const [pr, pg, pb] = hslToRgb(compHue, sat / 100, light / 100);
      this.particleColor = [pr, pg, pb];
      // timing and word update
      if (this.charCount === 0) this.startTime = now;
      this.charCount++;
      this.currentWord += letter;
      this.letterColors.push(letterColor);
      // render updated UI
      this.updateUI();
      // animate and particle at last char
      const spans = this.uiText.getElementsByClassName('char');
      const lastSpan = spans[spans.length - 1] as HTMLElement;
      lastSpan.style.transform = 'scale(1.5)';
      const rect = lastSpan.getBoundingClientRect();
      this.particleSystem.emit(rect.left + rect.width / 2, rect.top + rect.height / 2, true, this.particleColor);
      setTimeout(() => { lastSpan.style.transform = 'scale(1)'; }, 200);
      // update WPM indicator
      const elapsedMin = (now - this.startTime) / 1000 / 60;
      const wpm = elapsedMin > 0 ? (this.charCount / 5) / elapsedMin : 0;
      this.uiWPM.textContent = `WPM: ${Math.round(wpm)}`;
    }
  }

  // update the text display with dynamic font-size and per-letter spans
  private updateUI() {
    // render each character as a span with per-letter colors
    const container = this.uiText;
    container.innerHTML = '';
    this.currentWord.split('').forEach((ch, idx) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      span.style.color = this.letterColors[idx] || '#fff';
      container.appendChild(span);
    });
    // dynamic font sizing: start large, shrink only if overflow occurs
    const defaultFontPx = window.innerWidth * 0.1; // 10vw equivalent in px
    container.style.fontSize = `${defaultFontPx}px`;
    const maxW = container.clientWidth;
    const maxH = container.clientHeight;
    let fontPx = defaultFontPx;
    while ((container.scrollWidth > maxW || container.scrollHeight > maxH) && fontPx > 10) {
      fontPx -= 1;
      container.style.fontSize = `${fontPx}px`;
    }
  }

  // reset the current word, UI, and background
  private resetWord() {
    this.currentWord = '';
    this.charCount = 0;
    this.startTime = 0;
    this.uiText.innerHTML = '';
    this.uiText.style.fontSize = '6vw';
    // clear background color from text container
    this.uiText.style.backgroundColor = 'transparent';
    this.uiWPM.textContent = '';
  }
  
  // update the history panel with past words
  private updateHistoryUI() {
    this.uiHistory.innerHTML = '';
    this.history.forEach(word => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.textContent = word.length > 20 ? word.slice(0, 17) + '...' : word;
      div.title = word;
      div.addEventListener('click', () => {
        speechSynthesis.speak(new SpeechSynthesisUtterance(word));
        // optional explosion
        this.particleSystem.emit(this.canvas.width / 2, this.canvas.height / 2, true);
      });
      this.uiHistory.appendChild(div);
    });
  }

  private animate = () => {
    // clear canvas to black to reveal particles behind UI
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.particleSystem.update();
    this.particleSystem.render(this.canvas.width, this.canvas.height);
    requestAnimationFrame(this.animate);
  }
}
