class t{constructor(t){this.particles=[],this.maxParticles=1e3,this.gl=t,this.initGL()}initGL(){const t=this.gl,e=this.createShader(t.VERTEX_SHADER,"#version 300 es\nlayout(location=0) in vec2 a_position;\nlayout(location=1) in vec4 a_color;\nlayout(location=2) in float a_size;\nout vec4 v_color;\nuniform vec2 u_resolution;\nvoid main() {\n  v_color = a_color;\n  vec2 zeroToOne = a_position / u_resolution;\n  vec2 clipSpace = zeroToOne * 2.0 - 1.0;\n  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);\n  gl_PointSize = a_size;\n}"),i=this.createShader(t.FRAGMENT_SHADER,"#version 300 es\nprecision highp float;\nin vec4 v_color;\nout vec4 outColor;\nvoid main() {\n  float dist = distance(gl_PointCoord, vec2(0.5));\n  if (dist > 0.5) discard;\n  outColor = v_color;\n}");this.program=this.createProgram(e,i),this.vao=t.createVertexArray(),this.buffer=t.createBuffer(),t.bindVertexArray(this.vao),t.bindBuffer(t.ARRAY_BUFFER,this.buffer);t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,28,0),t.enableVertexAttribArray(1),t.vertexAttribPointer(1,4,t.FLOAT,!1,28,8),t.enableVertexAttribArray(2),t.vertexAttribPointer(2,1,t.FLOAT,!1,28,24),t.bindVertexArray(null),this.uResolutionLoc=t.getUniformLocation(this.program,"u_resolution")}emit(t,e,i,s){const r=i?50:20;for(let o=0;o<r;o++){const r=2*Math.random()*Math.PI,o=Math.random()*(i?2:1)+.5,n=[Math.cos(r)*o*60,Math.sin(r)*o*60],h=.5*Math.random()+.5;let a;a=s||(i?[Math.random(),1,Math.random()]:[1,Math.random(),Math.random()]);const c=[a[0],a[1],a[2],1],l=20*Math.random()+10;this.particles.length<this.maxParticles&&this.particles.push({pos:[t,e],vel:n,life:h,color:c,size:l})}}update(){const t=1/60;this.particles.forEach((e=>{e.life-=t,e.life>0&&(e.pos[0]+=e.vel[0]*t,e.pos[1]+=e.vel[1]*t,e.color[3]=e.life)})),this.particles=this.particles.filter((t=>t.life>0))}render(t,e){const i=this.gl;i.useProgram(this.program),i.bindVertexArray(this.vao),i.uniform2f(this.uResolutionLoc,t,e);const s=new Float32Array(7*this.particles.length);this.particles.forEach(((t,e)=>{const i=7*e;s[i]=t.pos[0],s[i+1]=t.pos[1],s[i+2]=t.color[0],s[i+3]=t.color[1],s[i+4]=t.color[2],s[i+5]=t.color[3],s[i+6]=t.size})),i.bindBuffer(i.ARRAY_BUFFER,this.buffer),i.bufferData(i.ARRAY_BUFFER,s,i.DYNAMIC_DRAW),i.drawArrays(i.POINTS,0,this.particles.length),i.bindVertexArray(null)}createShader(t,e){const i=this.gl.createShader(t);if(this.gl.shaderSource(i,e),this.gl.compileShader(i),!this.gl.getShaderParameter(i,this.gl.COMPILE_STATUS)){const t=this.gl.getShaderInfoLog(i);throw this.gl.deleteShader(i),new Error(`Shader compile failed:\n${t}`)}return i}createProgram(t,e){const i=this.gl.createProgram();if(this.gl.attachShader(i,t),this.gl.attachShader(i,e),this.gl.linkProgram(i),!this.gl.getProgramParameter(i,this.gl.LINK_STATUS)){const t=this.gl.getProgramInfoLog(i);throw this.gl.deleteProgram(i),new Error(`Program link failed:\n${t}`)}return i}}class e{constructor(e,i,s,r){this.particleColor=[1,1,1],this.currentWord="",this.letterColors=[],this.history=[],this.maxHistory=20,this.startTime=0,this.charCount=0,this.running=!1,this.animate=()=>{this.gl.clearColor(0,0,0,1),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.particleSystem.update(),this.particleSystem.render(this.canvas.width,this.canvas.height),requestAnimationFrame(this.animate)},this.canvas=e,this.uiText=i,this.uiHistory=s,this.uiWPM=r;const o=this.canvas.getContext("webgl2");if(!o)throw new Error("WebGL2 not supported");this.gl=o,this.resize(),window.addEventListener("resize",(()=>this.resize())),this.particleSystem=new t(o),window.addEventListener("keydown",(t=>this.onKeyDown(t)))}start(){this.updateUI(),this.running=!0,this.animate()}resize(){this.canvas.width=window.innerWidth,this.canvas.height=window.innerHeight,this.gl.viewport(0,0,this.canvas.width,this.canvas.height)}onKeyDown(t){if(!this.running)return;const e=t.key,i=performance.now();if("Enter"===e){if(0===this.currentWord.length)return;return speechSynthesis.speak(new SpeechSynthesisUtterance(this.currentWord)),this.particleSystem.emit(this.canvas.width/2,this.canvas.height/2,!0,this.particleColor),this.history.push(this.currentWord),this.history.length>this.maxHistory&&this.history.shift(),this.updateHistoryUI(),void this.resetWord()}if("Backspace"!==e)if(" "!==e&&"Space"!==t.code){if(1===e.length&&/^[a-zA-Z]$/.test(e)){const t=e.toUpperCase();speechSynthesis.speak(new SpeechSynthesisUtterance(t));const s=360*Math.random(),r=80+20*Math.random(),o=50+10*Math.random(),n=`hsl(${s.toFixed(0)}, ${r.toFixed(0)}%, ${o.toFixed(0)}%)`,h=(s+180)%360,[a,c,l]=function(t,e,i){const s=t/360;let r,o,n;if(0===e)r=o=n=i;else{const t=i<.5?i*(1+e):i+e-i*e,h=2*i-t,a=(t,e,i)=>(i<0&&(i+=1),i>1&&(i-=1),i<1/6?t+6*(e-t)*i:i<.5?e:i<2/3?t+(e-t)*(2/3-i)*6:t);r=a(h,t,s+1/3),o=a(h,t,s),n=a(h,t,s-1/3)}return[r,o,n]}(h,r/100,o/100);this.particleColor=[a,c,l],0===this.charCount&&(this.startTime=i),this.charCount++,this.currentWord+=t,this.letterColors.push(n),this.updateUI();const d=this.uiText.getElementsByClassName("char"),u=d[d.length-1];u.style.transform="scale(1.5)";const p=u.getBoundingClientRect();this.particleSystem.emit(p.left+p.width/2,p.top+p.height/2,!0,this.particleColor),setTimeout((()=>{u.style.transform="scale(1)"}),200);const m=(i-this.startTime)/1e3/60,g=m>0?this.charCount/5/m:0;this.uiWPM.textContent=`WPM: ${Math.round(g)}`}}else{this.currentWord+=" ",this.letterColors.push("transparent"),this.updateUI();const t=this.canvas.width/2,e=this.canvas.height/2;for(let i=0;i<4;i++)this.particleSystem.emit(t,e,!0,this.particleColor)}else if(this.currentWord.length>0){this.currentWord=this.currentWord.slice(0,-1),this.letterColors.length>0&&this.letterColors.pop(),this.charCount>0&&this.charCount--,this.updateUI();const t=(performance.now()-this.startTime)/1e3/60,e=t>0?this.charCount/5/t:0;this.uiWPM.textContent=this.charCount>0?`WPM: ${Math.round(e)}`:""}}updateUI(){const t=this.uiText;t.innerHTML="",this.currentWord.split("").forEach(((e,i)=>{const s=document.createElement("span");s.className="char",s.textContent=e,s.style.color=this.letterColors[i]||"#fff",t.appendChild(s)}));const e=.1*window.innerWidth;t.style.fontSize=`${e}px`;const i=t.clientWidth,s=t.clientHeight;let r=e;for(;(t.scrollWidth>i||t.scrollHeight>s)&&r>10;)r-=1,t.style.fontSize=`${r}px`}resetWord(){this.currentWord="",this.charCount=0,this.startTime=0,this.uiText.innerHTML="",this.uiText.style.fontSize="6vw",this.uiText.style.backgroundColor="transparent",this.uiWPM.textContent=""}updateHistoryUI(){this.uiHistory.innerHTML="",this.history.forEach((t=>{const e=document.createElement("div");e.className="history-item",e.textContent=t.length>20?t.slice(0,17)+"...":t,e.title=t,e.addEventListener("click",(()=>{speechSynthesis.speak(new SpeechSynthesisUtterance(t)),this.particleSystem.emit(this.canvas.width/2,this.canvas.height/2,!0)})),this.uiHistory.appendChild(e)}))}}window.addEventListener("load",(()=>{const t=document.getElementById("glCanvas"),i=document.getElementById("text"),s=document.getElementById("history"),r=document.getElementById("wpm");new e(t,i,s,r).start()}));
//# sourceMappingURL=bundle.js.map
