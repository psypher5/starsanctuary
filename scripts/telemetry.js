/**
 * Star Sanctuary — Telemetry HUD & Sacred Geometry Forge
 * Powers real-time celestial coordinates, telemetry readouts,
 * and the interactive mathematical mandala generator inspired by the studio concept art.
 */

import { sanctuaryAudio } from './audio.js';

export class SanctuaryTelemetry {
  constructor() {
    this.harmonyEl = document.getElementById('telemetry-harmony');
    this.coordEl = document.getElementById('telemetry-coords');
    this.trafficEl = document.getElementById('telemetry-traffic');
    this.initHUD();
    this.initMandalaForge();
  }

  initHUD() {
    // 1. Organic micro-variations for Harmony Index
    setInterval(() => {
      if (this.harmonyEl) {
        const val = (98.6 + Math.random() * 1.2).toFixed(1);
        this.harmonyEl.textContent = `${val}%`;
      }
    }, 2800);

    // 2. Dynamic coordinate tracking based on mouse position
    window.addEventListener('pointermove', (e) => {
      if (this.coordEl) {
        const lat = (45.12 + (e.clientY / window.innerHeight) * 0.45).toFixed(2);
        const lon = (12.34 + (e.clientX / window.innerWidth) * 0.55).toFixed(2);
        this.coordEl.textContent = `${lat}°N ${lon}°E`;
      }
    });
  }

  initMandalaForge() {
    const canvas = document.getElementById('mandala-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth || 420);
    let height = (canvas.height = canvas.parentElement.clientHeight || 420);

    // Controls
    let vertices = 5; // Default pentagon from concept art
    let layers = 28;
    let stepAngle = 0.045;
    let animSpeed = 0.003;
    let currentAngle = 0;
    let colorScheme = 'emerald'; // 'emerald', 'cyan', 'gold'

    const colorPalettes = {
      emerald: { stroke: 'rgba(52, 211, 153, 0.45)', core: '#10b981', glow: 'rgba(16, 185, 129, 0.25)' },
      cyan: { stroke: 'rgba(56, 189, 248, 0.45)', core: '#00f0ff', glow: 'rgba(56, 189, 248, 0.25)' },
      gold: { stroke: 'rgba(251, 191, 36, 0.45)', core: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)' }
    };

    // UI Sliders / Buttons binding
    const sidesSelect = document.getElementById('forge-sides');
    const layersRange = document.getElementById('forge-layers');
    const speedRange = document.getElementById('forge-speed');
    const paletteButtons = document.querySelectorAll('.palette-pill');

    if (sidesSelect) {
      sidesSelect.addEventListener('change', (e) => {
        vertices = parseInt(e.target.value, 10);
        sanctuaryAudio.playChime(415.30, 0.08);
      });
    }

    if (layersRange) {
      layersRange.addEventListener('input', (e) => {
        layers = parseInt(e.target.value, 10);
      });
    }

    if (speedRange) {
      speedRange.addEventListener('input', (e) => {
        animSpeed = parseFloat(e.target.value);
      });
    }

    paletteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        paletteButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        colorScheme = btn.dataset.palette || 'emerald';
        sanctuaryAudio.playChime(622.25, 0.1);
      });
    });

    window.addEventListener('resize', () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight || 420;
      }
    });

    // Render loop for sacred geometry polygon string-art
    const render = () => {
      requestAnimationFrame(render);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.44;
      const palette = colorPalettes[colorScheme];

      currentAngle += animSpeed;

      ctx.save();
      ctx.translate(cx, cy);

      for (let l = 0; l < layers; l++) {
        const factor = 1 - (l / layers) * 0.88;
        const radius = baseRadius * factor;
        const angleOffset = currentAngle + (l * stepAngle);

        ctx.beginPath();
        for (let v = 0; v <= vertices; v++) {
          const theta = angleOffset + (v * (Math.PI * 2 / vertices));
          const px = Math.cos(theta) * radius;
          const py = Math.sin(theta) * radius;

          if (v === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();

        // Facet chords connecting across
        ctx.strokeStyle = palette.stroke;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Subtle center node
        if (l === layers - 1) {
          ctx.beginPath();
          ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = palette.core;
          ctx.fill();
        }
      }

      ctx.restore();
    };

    render();
  }
}
