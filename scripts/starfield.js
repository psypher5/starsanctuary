/**
 * Star Sanctuary — Ambient Twinkling Cosmic Starfield
 * Full-screen deep space canvas with gentle twinkling stars, subtle drift,
 * and occasional starlight flares (synthesized from the psypher5 aesthetic).
 */

export class CosmicStarfield {
  constructor(canvasId = 'cosmic-starfield') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      this.canvas.className = 'cosmic-starfield';
      document.body.prepend(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.numStars = 140;
    this.width = 0;
    this.height = 0;
    this.animationFrameId = null;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    // Hues: Ice Cyan (195), Astral Amethyst (275), Starlight Amber (42), Pure Crystal White (210)
    const hues = [195, 275, 42, 210];

    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.6 + 0.4,
        speedX: (Math.random() - 0.5) * 0.08,
        speedY: -Math.random() * 0.12 - 0.02, // Subtle upward cosmic drift
        alpha: Math.random(),
        twinkleSpeed: 0.006 + Math.random() * 0.016,
        hue: hues[Math.floor(Math.random() * hues.length)],
        isBright: Math.random() > 0.85
      });
    }

    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];

      // Update position with wrap-around
      star.x += star.speedX;
      star.y += star.speedY;

      if (star.x < 0) star.x = this.width;
      if (star.x > this.width) star.x = 0;
      if (star.y < 0) star.y = this.height;
      if (star.y > this.height) star.y = 0;

      // Sinusoidal twinkle
      star.alpha += star.twinkleSpeed;
      if (star.alpha > 1 || star.alpha < 0) {
        star.twinkleSpeed = -star.twinkleSpeed;
      }

      const currentAlpha = Math.max(0.12, Math.min(0.95, star.alpha));

      // Draw subtle glow halo for brighter stars
      if (star.isBright && currentAlpha > 0.6) {
        this.ctx.fillStyle = `hsla(${star.hue}, 90%, 80%, ${currentAlpha * 0.25})`;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size * 2.8, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Draw star core
      this.ctx.fillStyle = `hsla(${star.hue}, 100%, 82%, ${currentAlpha})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
