class FireworksEffect {
  constructor(duration = 30000) {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    // Style canvas
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';

    // Create container
    this.container = document.createElement('div');
    this.container.style.position = 'fixed';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100vw';
    this.container.style.height = '100vh';
    this.container.style.overflow = 'hidden';
    this.container.style.pointerEvents = 'none';
    this.container.appendChild(this.canvas);

    // Add to document
    document.body.insertBefore(this.container, document.body.firstChild);

    // Rich, vibrant color palette
    this.colors = {
      primary: [
        '#FF3E3E',  // Vivid red
        '#FF8C00',  // Deep orange
        '#FFD700',  // Rich gold
        '#00E676',  // Vibrant green
        '#00BFFF',  // Deep sky blue
        '#8A2BE2',  // Blue violet
        '#FF1493',  // Deep pink
        '#FFFFFF',  // Pure white
      ],
      evolution: {
        '#FF3E3E': ['#FF6B6B', '#FF9999', '#FFCCCC'],
        '#FF8C00': ['#FFA500', '#FFB84D', '#FFD699'],
        '#FFD700': ['#FFDF4D', '#FFE880', '#FFF2B3'],
        '#00E676': ['#4DFF9E', '#80FFBA', '#B3FFD6'],
        '#00BFFF': ['#4DD4FF', '#80E3FF', '#B3F0FF'],
        '#8A2BE2': ['#A855F7', '#C084FC', '#D8B4FE'],
        '#FF1493': ['#FF69B4', '#FF99CC', '#FFCCE0'],
        '#FFFFFF': ['#F5F5F5', '#E8E8E8', '#D4D4D4'],
      }
    };

    // Initialize
    this.fireworks = [];
    this.particles = [];
    this.isActive = true;
    this.launchInterval = null;
    this.resize();

    // Event listeners
    window.addEventListener('resize', () => this.resize());

    // Start animation
    this.animate();
    this.launchFireworks();

    // Set cleanup timeout
    setTimeout(() => {
      this.cleanup();
    }, duration);
  }

  cleanup() {
    this.isActive = false;
    clearInterval(this.launchInterval);

    const checkEmpty = setInterval(() => {
      if (this.fireworks.length === 0 && this.particles.length === 0) {
        this.container.remove();
        clearInterval(checkEmpty);
      }
    }, 1000);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Helper: hex to rgba
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // Helper: hex to HSL
  hexToHSL(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  // Helper: HSL to hex
  hslToHex(hsl) {
    let { h, s, l } = hsl;
    h = ((h % 360) + 360) % 360;
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    b = Math.round((b + m) * 255).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
  }

  // Helper: vary color hue slightly
  varyColor(hex, variance) {
    const hsl = this.hexToHSL(hex);
    hsl.h += (Math.random() - 0.5) * variance * 2;
    hsl.s = Math.min(100, Math.max(0, hsl.s + (Math.random() - 0.5) * 10));
    return this.hslToHex(hsl);
  }

  // Get evolved color based on particle life
  getParticleColor(particle) {
    const lifeRatio = particle.life / particle.initialLife;
    const baseColor = particle.baseColor;
    const evolution = this.colors.evolution[baseColor];

    if (!evolution || lifeRatio > 0.7) {
      return { color: particle.color, opacity: Math.min(1, lifeRatio + 0.3) };
    } else if (lifeRatio > 0.4) {
      return { color: evolution[0], opacity: lifeRatio + 0.2 };
    } else if (lifeRatio > 0.2) {
      return { color: evolution[1], opacity: lifeRatio + 0.1 };
    } else {
      return { color: evolution[2], opacity: lifeRatio * 2.5 };
    }
  }

  selectColor() {
    return this.colors.primary[Math.floor(Math.random() * this.colors.primary.length)];
  }

  selectBurstType() {
    const rand = Math.random();
    if (rand < 0.5) return 'classic';
    if (rand < 0.8) return 'willow';
    return 'crackle';
  }

  createFirework() {
    const color = this.selectColor();
    return {
      x: Math.random() * this.canvas.width * 0.8 + this.canvas.width * 0.1,
      y: this.canvas.height,
      targetY: Math.random() * (this.canvas.height * 0.4) + this.canvas.height * 0.1,

      // Physics-based liftoff
      velocity: Math.random() * 8 + 14,
      acceleration: -0.12,
      minVelocity: 2.5,

      // Trail
      trail: [],
      maxTrailLength: 14,

      // Visual
      color: color,
      size: Math.random() * 1.2 + 1.8,
      sparkTimer: 0,
      exploded: false
    };
  }

  emitLiftoffSpark(firework) {
    this.particles.push({
      x: firework.x + (Math.random() - 0.5) * 6,
      y: firework.y + Math.random() * 10,
      size: Math.random() * 1.2 + 0.4,
      color: '#FFD700',
      baseColor: '#FFD700',
      angle: Math.PI / 2 + (Math.random() - 0.5) * 0.6,
      speed: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 1 + 0.5,
      initialLife: 50,
      life: 50,
      fade: 1.2,
      gravity: 0.06,
      drag: 0.98,
      burstType: 'spark'
    });
  }

  createParticles(x, y, baseColor, burstType) {
    const particles = [];

    const counts = { classic: 80, willow: 65, crackle: 95 };
    const particleCount = counts[burstType] + Math.floor(Math.random() * 20);

    const configs = {
      classic: { baseSpeed: 7, drag: 0.987, fade: 0.018, gravity: 0.045 },
      willow:  { baseSpeed: 5, drag: 0.992, fade: 0.012, gravity: 0.035 },
      crackle: { baseSpeed: 6, drag: 0.984, fade: 0.022, gravity: 0.05 }
    };

    const config = configs[burstType];

    for (let i = 0; i < particleCount; i++) {
      const baseAngle = (Math.PI * 2 * i) / particleCount;
      const angleVariance = (Math.random() - 0.5) * 0.9;
      const angle = baseAngle + angleVariance;

      const speedMultiplier = 0.5 + Math.random() * 0.9;
      const speed = (Math.random() * 4 + config.baseSpeed) * speedMultiplier;

      const variedColor = this.varyColor(baseColor, 15);

      particles.push({
        x: x,
        y: y,
        size: Math.random() * 2.2 + 0.8,
        color: variedColor,
        baseColor: baseColor,
        angle: angle,
        speed: speed,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,

        initialLife: 100,
        life: 100,
        fade: config.fade + Math.random() * 0.008,

        gravity: config.gravity + Math.random() * 0.015,
        drag: config.drag + (Math.random() - 0.5) * 0.006,

        burstType: burstType,
        willowFactor: burstType === 'willow' ? 0.25 + Math.random() * 0.35 : 0,
        crackled: false
      });
    }
    return particles;
  }

  launchFireworks() {
    this.launchInterval = setInterval(() => {
      if (this.isActive && this.fireworks.length < 4) {
        this.fireworks.push(this.createFirework());
      }
    }, 1000);
  }

  updateFirework(firework) {
    if (firework.exploded) return;

    // Apply deceleration
    firework.velocity += firework.acceleration;
    firework.velocity = Math.max(firework.velocity, firework.minVelocity);

    // Update position
    firework.y -= firework.velocity;
    firework.x += Math.sin(firework.y / 20) * 0.4;

    // Emit sparks
    firework.sparkTimer++;
    if (firework.sparkTimer % 3 === 0 && firework.velocity > 6) {
      this.emitLiftoffSpark(firework);
    }

    // Explode condition
    if (firework.y <= firework.targetY || firework.velocity <= firework.minVelocity) {
      firework.exploded = true;
      const burstType = this.selectBurstType();
      this.particles = this.particles.concat(
        this.createParticles(firework.x, firework.y, firework.color, burstType)
      );
    }
  }

  updateParticle(particle) {
    if (particle.burstType === 'spark') {
      // Simple spark physics
      particle.vy += particle.gravity;
      particle.vx *= particle.drag;
      particle.vy *= particle.drag;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.fade;
      return;
    }

    // Apply drag
    particle.vx *= particle.drag;
    particle.vy *= particle.drag;

    // Apply gravity
    particle.vy += particle.gravity;
    particle.gravity += 0.006;

    // Willow effect: particles droop more as they age
    if (particle.burstType === 'willow') {
      const ageFactor = 1 - (particle.life / particle.initialLife);
      particle.vy += particle.willowFactor * ageFactor * 0.15;
      particle.drag = Math.max(0.965, particle.drag - 0.0003);
    }

    // Crackle effect: random pops
    if (particle.burstType === 'crackle' && !particle.crackled && particle.life < 55 && Math.random() < 0.025) {
      particle.vx += (Math.random() - 0.5) * 3;
      particle.vy += (Math.random() - 0.5) * 3;
      particle.crackled = true;
    }

    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Fade
    particle.life -= particle.fade * 100;
  }

  drawFirework(firework) {
    if (firework.exploded) return;

    // Add current position to trail
    firework.trail.unshift({ x: firework.x, y: firework.y });
    if (firework.trail.length > firework.maxTrailLength) {
      firework.trail.pop();
    }

    // Draw gradient trail
    const trailLength = firework.trail.length;
    for (let i = 1; i < trailLength; i++) {
      const opacity = (1 - (i / trailLength)) * 0.7;
      const width = firework.size * (1 - i / trailLength * 0.6);

      this.ctx.beginPath();
      this.ctx.moveTo(firework.trail[i - 1].x, firework.trail[i - 1].y);
      this.ctx.lineTo(firework.trail[i].x, firework.trail[i].y);
      this.ctx.strokeStyle = this.hexToRgba(firework.color, opacity);
      this.ctx.lineWidth = width;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();
    }

    // Outer glow
    this.ctx.beginPath();
    this.ctx.arc(firework.x, firework.y, firework.size * 2, 0, Math.PI * 2);
    this.ctx.fillStyle = this.hexToRgba(firework.color, 0.4);
    this.ctx.fill();

    // White-hot core
    this.ctx.beginPath();
    this.ctx.arc(firework.x, firework.y, firework.size, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fill();
  }

  drawParticle(particle) {
    const { color, opacity } = this.getParticleColor(particle);

    // Glow effect only for large, bright particles (reduces draw calls)
    if (particle.size > 2 && particle.life > 60) {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size * 1.8, 0, Math.PI * 2);
      this.ctx.fillStyle = this.hexToRgba(color, opacity * 0.25);
      this.ctx.fill();
    }

    // Main particle
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fillStyle = this.hexToRgba(color, opacity);
    this.ctx.fill();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      this.updateFirework(this.fireworks[i]);
      this.drawFirework(this.fireworks[i]);
      if (this.fireworks[i].exploded) {
        this.fireworks.splice(i, 1);
      }
    }

    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.updateParticle(this.particles[i]);
      this.drawParticle(this.particles[i]);
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (this.isActive || this.fireworks.length > 0 || this.particles.length > 0) {
      requestAnimationFrame(() => this.animate());
    }
  }
}
