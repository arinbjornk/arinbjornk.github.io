// snow.js
class SnowEffect {
  constructor() {
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
    
    // Create a container that matches body dimensions
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
    this.snowflakes = [];
    this.resize();
    
    // Event listeners
    window.addEventListener('resize', () => this.resize());
    
    // Start animation
    this.animate();
  }

  resize() {
    // Get the actual height of the content
    const contentHeight = Math.max(
      document.body.offsetHeight,
      document.body.scrollHeight
    );

    // Set container height to match content
    this.container.style.height = `${contentHeight}px`;
    
    // Set canvas dimensions
    this.canvas.width = window.innerWidth;
    this.canvas.height = contentHeight;
    
    // Create initial snowflakes if none exist
    if (this.snowflakes.length === 0) {
      this.snowflakes = Array(100).fill().map(() => {
        const flake = this.createSnowflake();
        // Distribute initial y positions across the full height
        flake.y = Math.random() * this.canvas.height;
        return flake;
      });
    }
  }

  createSnowflake(atTop = false) {
    return {
      x: Math.random() * this.canvas.width,
      y: atTop ? -10 : Math.random() * this.canvas.height,
      size: Math.random() * 2 + 2,
      speedY: 0, // Will be set based on size
      speedX: Math.random() * 0.5 - 0.25,
      wobbleSpeed: Math.random() * 0.02,
      wobbleDistance: Math.random() * 0.8,
      wobbleOffset: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.5
    };
  }

  updateSnowflake(flake) {
    // Set speed based on size (if not already set)
    if (!flake.speedY) {
      flake.speedY = flake.size * 0.6;
    }

    // Update position
    flake.y += flake.speedY;
    flake.x += Math.sin(flake.y * flake.wobbleSpeed + flake.wobbleOffset) * flake.wobbleDistance;
    flake.x += flake.speedX;

    // Reset if out of bounds
    if (flake.y > this.canvas.height || flake.x < -10 || flake.x > this.canvas.width + 10) {
      Object.assign(flake, this.createSnowflake(true));
    }
  }

  drawSnowflake(flake) {
    this.ctx.beginPath();
    this.ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
    this.ctx.fill();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.snowflakes.forEach(flake => {
      this.updateSnowflake(flake);
      this.drawSnowflake(flake);
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize snow effect when the page loads
window.addEventListener('load', () => {
  new SnowEffect();
});