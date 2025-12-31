class SnowEffect {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';

    this.container = document.createElement('div');
    this.container.style.position = 'fixed';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100vw';
    this.container.style.height = '100vh';
    this.container.style.overflow = 'hidden';
    this.container.style.pointerEvents = 'none';
    this.container.appendChild(this.canvas);

    document.body.insertBefore(this.container, document.body.firstChild);

    this.snowflakes = [];
    this.resize();

    window.addEventListener('resize', () => this.resize());

    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Reduce snowflake count for better performance
    const targetCount = 80;

    if (this.snowflakes.length === 0) {
      this.snowflakes = Array(targetCount).fill().map(() => {
        const flake = this.createSnowflake();
        flake.y = Math.random() * this.canvas.height;
        return flake;
      });
    }
  }

  createSnowflake(atTop = false) {
    return {
      x: Math.random() * this.canvas.width,
      y: atTop ? -10 : Math.random() * this.canvas.height,
      size: Math.random() * 2 + 1.5,
      speedY: Math.random() * 1 + 0.8,
      speedX: Math.random() * 0.5 - 0.25,
      wobbleSpeed: Math.random() * 0.02,
      wobbleDistance: Math.random() * 0.8,
      wobbleOffset: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.4 + 0.4
    };
  }

  updateSnowflake(flake) {
    flake.y += flake.speedY;
    flake.x += Math.sin(flake.y * flake.wobbleSpeed + flake.wobbleOffset) * flake.wobbleDistance;
    flake.x += flake.speedX;

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

    for (let i = 0; i < this.snowflakes.length; i++) {
      this.updateSnowflake(this.snowflakes[i]);
      this.drawSnowflake(this.snowflakes[i]);
    }

    requestAnimationFrame(() => this.animate());
  }
}
