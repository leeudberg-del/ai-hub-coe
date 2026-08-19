/**
 * SAGE AI HUB - CURSOR REACTIVE PARTICLE SYSTEM
 * Features:
 * - High-density neural particle constellation
 * - Dynamic mouse gravity and particle repulsion
 * - Brilliant Green (#00D639) glowing nodes & energetic interconnects
 * - Dynamic particle trail & ambient drift physics
 * - Smooth 60fps animation with Retina/HiDPI scaling
 */

class SageParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.particles = [];
    this.particleCount = 110;
    this.maxConnectDistance = 140;
    
    // Mouse state
    this.mouse = {
      x: null,
      y: null,
      radius: 170, // Interaction sphere
      isActive: false
    };

    // Color palette from Sage Brand
    this.colors = [
      'rgba(0, 214, 57, 0.85)',   // Sage Brilliant Green
      'rgba(68, 237, 144, 0.75)',  // Jade 80
      'rgba(0, 166, 92, 0.65)',   // Jade 60
      'rgba(91, 207, 205, 0.55)',  // Teal 80
      'rgba(143, 248, 183, 0.8)'   // Jade 90
    ];

    this.init();
  }

  init() {
    this.handleResize();
    this.bindEvents();
    this.createParticles();
    this.animate();
  }

  handleResize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = this.canvas.parentElement ? this.canvas.parentElement.offsetHeight : window.innerHeight;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);

    // Adjust particle count dynamically based on screen real estate
    this.particleCount = Math.floor((this.width * this.height) / 12000);
    this.particleCount = Math.min(Math.max(this.particleCount, 60), 160);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.handleResize();
      this.createParticles();
    });

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.isActive = true;

      // Update cursor aura if present
      const aura = document.querySelector('.cursor-aura');
      if (aura) {
        aura.style.left = `${e.clientX}px`;
        aura.style.top = `${e.clientY}px`;
        aura.style.opacity = '1';
      }
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
      this.mouse.isActive = false;
      const aura = document.querySelector('.cursor-aura');
      if (aura) aura.style.opacity = '0';
    });

    // Optional subtle click burst
    window.addEventListener('click', (e) => {
      if (this.mouse.x !== null && this.mouse.y !== null) {
        this.burst(this.mouse.x, this.mouse.y);
      }
    });
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        originX: Math.random() * this.width,
        originY: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        size: Math.random() * 2.2 + 1.2,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseVal: Math.random() * Math.PI,
        baseAlpha: 0.3 + Math.random() * 0.5
      });
    }
  }

  burst(x, y) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 220 && dist > 0) {
        const force = (220 - dist) / 220;
        p.vx += (dx / dist) * force * 5;
        p.vy += (dy / dist) * force * 5;
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Friction / Velocity damping
      p.vx *= 0.985;
      p.vy *= 0.985;

      // Maintain minimum ambient drift
      if (Math.abs(p.vx) < 0.2) p.vx += (Math.random() - 0.5) * 0.08;
      if (Math.abs(p.vy) < 0.2) p.vy += (Math.random() - 0.5) * 0.08;

      // Bounce / wrap edges
      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      if (p.x > this.width) { p.x = this.width; p.vx *= -1; }
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      if (p.y > this.height) { p.y = this.height; p.vy *= -1; }

      // Mouse Interaction (Push & Pull fluid dynamic)
      if (this.mouse.isActive && this.mouse.x !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouse.radius && dist > 0) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          // Repel gently with slight swirl
          p.vx += (dx / dist) * force * 0.6;
          p.vy += (dy / dist) * force * 0.6;

          // Connect cursor to nearby particles
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.strokeStyle = `rgba(0, 214, 57, ${force * 0.45})`;
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();
        }
      }

      // Draw particle node with pulsing glow
      p.pulseVal += p.pulseSpeed;
      const currentPulse = Math.sin(p.pulseVal) * 0.3 + 0.7;
      const nodeSize = p.size * currentPulse;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, nodeSize, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = 'rgba(0, 214, 57, 0.8)';
      this.ctx.shadowBlur = 10;
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // reset

      // Connect with neighboring particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.maxConnectDistance) {
          const alpha = (1 - dist / this.maxConnectDistance) * 0.25;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(0, 214, 57, ${alpha})`;
          this.ctx.lineWidth = 0.75;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.sageParticles = new SageParticleEngine('particle-canvas');
});
