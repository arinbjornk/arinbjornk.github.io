/**
 * Unified Effects Controller
 * Single canvas, single animation loop, heavily optimized
 */
class EffectsController {
  constructor(options = {}) {
    this.enableSnow = options.snow || false;
    this.enableFireworks = options.fireworks || false;
    this.duration = options.duration || 30000;

    // Single canvas for all effects
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: true });

    // Container for absolute positioning within document flow
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      overflow: hidden;
    `;

    // Canvas fills container
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      will-change: transform;
    `;

    this.container.appendChild(this.canvas);
    document.body.insertBefore(this.container, document.body.firstChild);

    // State
    this.snowflakes = [];
    this.fireworks = [];
    this.particles = [];
    this.isActive = true;
    this.lastLaunch = 0;
    this.launchInterval = 1000;

    // Pre-computed color data
    this.colorData = this.initColorData();

    // Pre-computed opacity strings for snow (avoid string creation in loop)
    this.snowAlphas = [];
    for (let i = 0; i <= 100; i++) {
      this.snowAlphas[i] = `rgba(255,255,255,${(i / 100).toFixed(2)})`;
    }

    // Particle pool
    this.particlePool = [];

    // Cache canvas dimensions
    this.width = 0;
    this.height = 0;

    this.resize();
    this.resizeHandler = () => this.resize();
    window.addEventListener('resize', this.resizeHandler);

    if (this.enableSnow) this.initSnow();

    // Bind once
    this.animate = this.animate.bind(this);
    this.lastTime = 0;
    requestAnimationFrame(this.animate);

    if (this.enableFireworks) {
      setTimeout(() => {
        this.enableFireworks = false;
      }, this.duration);
    }
  }

  initColorData() {
    const primary = [
      { hex: '#FF3E3E', rgb: [255, 62, 62] },
      { hex: '#FF8C00', rgb: [255, 140, 0] },
      { hex: '#FFD700', rgb: [255, 215, 0] },
      { hex: '#00E676', rgb: [0, 230, 118] },
      { hex: '#00BFFF', rgb: [0, 191, 255] },
      { hex: '#8A2BE2', rgb: [138, 43, 226] },
      { hex: '#FF1493', rgb: [255, 20, 147] },
      { hex: '#FFFFFF', rgb: [255, 255, 255] },
    ];

    const evolution = {
      '#FF3E3E': [[255, 107, 107], [255, 153, 153], [255, 204, 204]],
      '#FF8C00': [[255, 165, 0], [255, 184, 77], [255, 214, 153]],
      '#FFD700': [[255, 223, 77], [255, 232, 128], [255, 242, 179]],
      '#00E676': [[77, 255, 158], [128, 255, 186], [179, 255, 214]],
      '#00BFFF': [[77, 212, 255], [128, 227, 255], [179, 240, 255]],
      '#8A2BE2': [[168, 85, 247], [192, 132, 252], [216, 180, 254]],
      '#FF1493': [[255, 105, 180], [255, 153, 204], [255, 204, 224]],
      '#FFFFFF': [[245, 245, 245], [232, 232, 232], [212, 212, 212]],
    };

    return { primary, evolution };
  }

  resize() {
    this.width = window.innerWidth;
    // Use full document height for scrollable content
    this.height = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.scrollHeight
    );
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.container.style.height = this.height + 'px';
  }

  // ========== SNOW ==========

  initSnow() {
    for (let i = 0; i < 80; i++) {
      this.snowflakes.push(this.createSnowflake(false));
    }
  }

  createSnowflake(atTop) {
    const size = Math.random() * 2 + 2;
    return {
      x: Math.random() * this.width,
      y: atTop ? -10 : Math.random() * this.height,
      size: size,
      speedY: size * 0.6,
      speedX: Math.random() * 0.5 - 0.25,
      wobbleSpeed: Math.random() * 0.02,
      wobbleDistance: Math.random() * 0.8,
      wobbleOffset: Math.random() * Math.PI * 2,
      alphaIndex: (Math.random() * 50 + 50) | 0 // 50-100, pre-computed index
    };
  }

  updateAndDrawSnow() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const flakes = this.snowflakes;
    const len = flakes.length;
    const pi2 = Math.PI * 2;

    for (let i = 0; i < len; i++) {
      const f = flakes[i];

      // Update
      f.y += f.speedY;
      f.x += Math.sin(f.y * f.wobbleSpeed + f.wobbleOffset) * f.wobbleDistance + f.speedX;

      if (f.y > h || f.x < -10 || f.x > w + 10) {
        f.x = Math.random() * w;
        f.y = -10;
        f.alphaIndex = (Math.random() * 50 + 50) | 0;
      }

      // Draw circle
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, pi2);
      ctx.fillStyle = this.snowAlphas[f.alphaIndex];
      ctx.fill();
    }
  }

  // ========== FIREWORKS ==========

  selectColor() {
    return this.colorData.primary[(Math.random() * this.colorData.primary.length) | 0];
  }

  selectBurstType() {
    const r = Math.random();
    return r < 0.5 ? 0 : r < 0.8 ? 1 : 2;
  }

  createFirework() {
    const colorData = this.selectColor();
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;

    // Launch from bottom of visible viewport
    const launchY = scrollY + viewportHeight;
    // Explode in the upper portion of visible viewport
    const targetY = scrollY + viewportHeight * 0.1 + Math.random() * viewportHeight * 0.4;

    return {
      x: Math.random() * this.width * 0.8 + this.width * 0.1,
      y: launchY,
      targetY: targetY,
      velocity: Math.random() * 8 + 14,
      acceleration: -0.12,
      minVelocity: 2.5,
      trailX: new Float32Array(14),
      trailY: new Float32Array(14),
      trailLen: 0,
      colorData: colorData,
      size: Math.random() * 1.2 + 1.8,
      sparkTimer: 0
    };
  }

  getParticle() {
    return this.particlePool.pop() || {};
  }

  releaseParticle(p) {
    if (this.particlePool.length < 500) {
      this.particlePool.push(p);
    }
  }

  emitSpark(x, y) {
    const p = this.getParticle();
    p.x = x + (Math.random() - 0.5) * 6;
    p.y = y + Math.random() * 10;
    p.size = Math.random() * 1.2 + 0.4;
    p.rgb = [255, 215, 0];
    p.vx = (Math.random() - 0.5) * 2;
    p.vy = Math.random() * 1 + 0.5;
    p.life = 50;
    p.maxLife = 50;
    p.gravity = 0.06;
    p.drag = 0.98;
    p.type = 3;
    this.particles.push(p);
  }

  createParticles(x, y, colorData, burstType) {
    const configs = [
      { count: 80, baseSpeed: 7, drag: 0.987, fade: 1.8, gravity: 0.045 },
      { count: 65, baseSpeed: 5, drag: 0.992, fade: 1.2, gravity: 0.035 },
      { count: 95, baseSpeed: 6, drag: 0.984, fade: 2.2, gravity: 0.05 }
    ];
    const cfg = configs[burstType];
    const count = cfg.count + ((Math.random() * 20) | 0);
    const evolution = this.colorData.evolution[colorData.hex];
    const pi2 = Math.PI * 2;

    for (let i = 0; i < count; i++) {
      const angle = (pi2 * i) / count + (Math.random() - 0.5) * 0.9;
      const speed = (Math.random() * 4 + cfg.baseSpeed) * (0.5 + Math.random() * 0.9);

      const p = this.getParticle();
      p.x = x;
      p.y = y;
      p.size = Math.random() * 2.2 + 0.8;
      p.rgb = colorData.rgb;
      p.evolution = evolution;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 100;
      p.maxLife = 100;
      p.fade = cfg.fade + Math.random() * 0.8;
      p.gravity = cfg.gravity + Math.random() * 0.015;
      p.drag = cfg.drag + (Math.random() - 0.5) * 0.006;
      p.type = burstType;
      p.willowFactor = burstType === 1 ? 0.25 + Math.random() * 0.35 : 0;
      p.crackled = false;
      this.particles.push(p);
    }
  }

  updateFireworks(time) {
    const fw = this.fireworks;

    // Launch
    if (this.enableFireworks && fw.length < 4 && time - this.lastLaunch > this.launchInterval) {
      fw.push(this.createFirework());
      this.lastLaunch = time;
    }

    // Update
    for (let i = fw.length - 1; i >= 0; i--) {
      const f = fw[i];

      f.velocity += f.acceleration;
      if (f.velocity < f.minVelocity) f.velocity = f.minVelocity;

      f.y -= f.velocity;
      f.x += Math.sin(f.y * 0.05) * 0.4;

      // Trail using typed arrays
      if (f.trailLen < 14) f.trailLen++;
      for (let j = f.trailLen - 1; j > 0; j--) {
        f.trailX[j] = f.trailX[j - 1];
        f.trailY[j] = f.trailY[j - 1];
      }
      f.trailX[0] = f.x;
      f.trailY[0] = f.y;

      // Sparks
      if (++f.sparkTimer % 3 === 0 && f.velocity > 6) {
        this.emitSpark(f.x, f.y);
      }

      // Explode
      if (f.y <= f.targetY || f.velocity <= f.minVelocity) {
        this.createParticles(f.x, f.y, f.colorData, this.selectBurstType());
        fw.splice(i, 1);
      }
    }
  }

  updateParticles() {
    const particles = this.particles;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;

      if (p.type !== 3) {
        p.gravity += 0.006;

        if (p.type === 1) {
          const age = 1 - p.life / p.maxLife;
          p.vy += p.willowFactor * age * 0.15;
          if (p.drag > 0.965) p.drag -= 0.0003;
        }

        if (p.type === 2 && !p.crackled && p.life < 55 && Math.random() < 0.025) {
          p.vx += (Math.random() - 0.5) * 3;
          p.vy += (Math.random() - 0.5) * 3;
          p.crackled = true;
        }
      }

      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.fade;

      if (p.life <= 0) {
        this.releaseParticle(p);
        particles.splice(i, 1);
      }
    }
  }

  drawFireworks() {
    const ctx = this.ctx;
    const fw = this.fireworks;

    for (let i = 0; i < fw.length; i++) {
      const f = fw[i];
      const rgb = f.colorData.rgb;
      const r = rgb[0], g = rgb[1], b = rgb[2];

      // Trail
      ctx.lineCap = 'round';
      for (let j = 1; j < f.trailLen; j++) {
        const opacity = (1 - j / f.trailLen) * 0.7;
        ctx.beginPath();
        ctx.moveTo(f.trailX[j - 1] | 0, f.trailY[j - 1] | 0);
        ctx.lineTo(f.trailX[j] | 0, f.trailY[j] | 0);
        ctx.strokeStyle = `rgba(${r},${g},${b},${opacity.toFixed(2)})`;
        ctx.lineWidth = f.size * (1 - j / f.trailLen * 0.6);
        ctx.stroke();
      }

      // Glow
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},0.4)`;
      ctx.fill();

      // White-hot core
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF';
      ctx.fill();
    }
  }

  drawParticles() {
    const ctx = this.ctx;
    const particles = this.particles;
    const len = particles.length;
    const pi2 = Math.PI * 2;

    for (let i = 0; i < len; i++) {
      const p = particles[i];
      const lifeRatio = p.life / p.maxLife;

      let rgb = p.rgb;
      if (p.evolution && lifeRatio <= 0.7) {
        rgb = lifeRatio > 0.4 ? p.evolution[0] : lifeRatio > 0.2 ? p.evolution[1] : p.evolution[2];
      }

      const opacity = lifeRatio < 0.8 ? lifeRatio + 0.2 : 1;

      // Draw circle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, pi2);
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity.toFixed(2)})`;
      ctx.fill();
    }
  }

  // ========== MAIN LOOP ==========

  animate(time) {
    const ctx = this.ctx;

    // Clear
    ctx.clearRect(0, 0, this.width, this.height);

    // Snow
    if (this.enableSnow) {
      this.updateAndDrawSnow();
    }

    // Fireworks
    const hasFireworks = this.enableFireworks || this.fireworks.length > 0 || this.particles.length > 0;
    if (hasFireworks) {
      this.updateFireworks(time);
      this.updateParticles();
      if (this.fireworks.length > 0) this.drawFireworks();
      if (this.particles.length > 0) this.drawParticles();
    }

    // Continue or cleanup
    if (this.enableSnow || hasFireworks) {
      requestAnimationFrame(this.animate);
    } else {
      window.removeEventListener('resize', this.resizeHandler);
      this.container.remove();
    }
  }
}
