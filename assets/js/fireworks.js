class FireworksEffect {
  constructor(duration = 30000) { // Default duration of 30 seconds
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Style canvas
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    
    // Create container
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.overflow = 'hidden';
    this.container.style.pointerEvents = 'none';
    this.container.appendChild(this.canvas);
    
    // Add to document
    document.body.insertBefore(this.container, document.body.firstChild);
    
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
    
    // Wait for all particles to fade out before removing canvas
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

  createFirework() {
    // Bright festive colors based on theme
    const colors = [
      '#4A9DFF', // Bright blue
      '#00FFE5', // Bright teal
      '#B088FF', // Bright purple
      '#FFD700', // Gold
      '#FFFFFF'  // White for contrast
    ];
    
    return {
      x: Math.random() * this.canvas.width,
      y: this.canvas.height,
      targetY: Math.random() * (this.canvas.height * 0.6),
      speed: Math.random() * 4 + 3, // Slightly faster for more excitement
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 2 + 1,
      exploded: false
    };
  }

  createParticles(x, y, color) {
    const particles = [];
    const particleCount = 150; // More particles for a bigger explosion
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      particles.push({
        x: x,
        y: y,
        size: Math.random() * 2.5 + 0.5,
        color: color,
        angle: angle + (Math.random() - 0.5) * 0.5, // More organized spread
        speed: Math.random() * 6 + 3,
        life: 100,
        fade: Math.random() * 0.03 + 0.02, // Slower fade
        gravity: 0.1 // Add gravity effect
      });
    }
    return particles;
  }

  launchFireworks() {
    this.launchInterval = setInterval(() => {
      if (this.isActive && this.fireworks.length < 8) { // Allow more concurrent fireworks
        this.fireworks.push(this.createFirework());
      }
    }, 800); // Launch more frequently
  }

  updateFirework(firework) {
    if (!firework.exploded) {
      firework.y -= firework.speed;
      // Add slight wobble
      firework.x += Math.sin(firework.y / 30) * 0.5;
      
      if (firework.y <= firework.targetY) {
        firework.exploded = true;
        this.particles = this.particles.concat(
          this.createParticles(firework.x, firework.y, firework.color)
        );
      }
    }
  }

  updateParticle(particle) {
    particle.speed *= 0.97; // Slower speed decay
    particle.x += Math.cos(particle.angle) * particle.speed;
    particle.y += Math.sin(particle.angle) * particle.speed + particle.gravity;
    particle.gravity += 0.03; // Increase gravity effect
    particle.life -= particle.fade;
  }

  drawFirework(firework) {
    if (!firework.exploded) {
      this.ctx.beginPath();
      this.ctx.arc(firework.x, firework.y, firework.size, 0, Math.PI * 2);
      this.ctx.fillStyle = firework.color;
      this.ctx.fill();
      
      // Add trail effect
      this.ctx.beginPath();
      this.ctx.moveTo(firework.x, firework.y);
      this.ctx.lineTo(firework.x, firework.y + 10);
      this.ctx.strokeStyle = firework.color;
      this.ctx.lineWidth = firework.size * 0.8;
      this.ctx.stroke();
    }
  }

  drawParticle(particle) {
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    
    // Convert hex color to rgba for fade effect
    const r = parseInt(particle.color.slice(1,3), 16);
    const g = parseInt(particle.color.slice(3,5), 16);
    const b = parseInt(particle.color.slice(5,7), 16);
    this.ctx.fillStyle = `rgba(${r},${g},${b},${particle.life/100})`;
    
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

// Initialize fireworks effect when the page loads
window.addEventListener('load', () => {
  // Duration in milliseconds (30 seconds)
  new FireworksEffect(30000);
});