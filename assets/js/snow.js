class SnowEffect {
  constructor() {
    // Previous constructor code remains the same
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.overflow = 'hidden';
    this.container.style.pointerEvents = 'none';
    this.container.appendChild(this.canvas);
    
    document.body.insertBefore(this.container, document.body.firstChild);
    
    this.snowflakes = [];
    this.resize();
    
    window.addEventListener('resize', () => this.resize());
    
    this.animate();
  }

  // Previous methods remain the same
  resize() {
    const contentHeight = Math.max(
      document.body.offsetHeight,
      document.body.scrollHeight
    );

    this.container.style.height = `${contentHeight}px`;
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = contentHeight;
    
    if (this.snowflakes.length === 0) {
      this.snowflakes = Array(100).fill().map(() => {
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
      size: Math.random() * 2 + 2,
      speedY: 0,
      speedX: Math.random() * 0.5 - 0.25,
      wobbleSpeed: Math.random() * 0.02,
      wobbleDistance: Math.random() * 0.8,
      wobbleOffset: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.5
    };
  }

  updateSnowflake(flake) {
    if (!flake.speedY) {
      flake.speedY = flake.size * 0.6;
    }

    flake.y += flake.speedY;
    flake.x += Math.sin(flake.y * flake.wobbleSpeed + flake.wobbleOffset) * flake.wobbleDistance;
    flake.x += flake.speedX;

    if (flake.y > this.canvas.height || flake.x < -10 || flake.x > this.canvas.width + 10) {
      Object.assign(flake, this.createSnowflake(true));
    }
  }

  // Modified drawSnowflake method to better detect text
  drawSnowflake(flake) {
    // Get the element at the snowflake's position
    const element = document.elementFromPoint(flake.x, flake.y);
    let isOverText = false;
    
    if (element) {
      // Check if the element or its parent contains text
      const hasText = (el) => {
        // Check if element has direct text
        if (el.childNodes) {
          for (const node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
              return true;
            }
          }
        }
        
        // Check common text elements
        const textElements = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN'];
        return textElements.includes(el.tagName) && el.textContent.trim() !== '';
      };

      // Check current element and its parent
      isOverText = hasText(element) || (element.parentElement && hasText(element.parentElement));
    }

    // Significantly reduce opacity when over text (more than before)
    const finalOpacity = isOverText ? flake.opacity * 0.25 : flake.opacity;
    
    this.ctx.beginPath();
    this.ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
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
// new SnowEffect();