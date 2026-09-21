/**
 * Star Sanctuary — Minimal Application Orchestrator
 * Integrates 3D Hero, Audio Synthesizer, and Experience Modal.
 */

import { StarHero } from './star-hero.js';
import { sanctuaryAudio } from './audio.js';
import { CosmicStarfield } from './starfield.js';
import { mediaPlayer } from './player.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Ambient Twinkling Cosmic Starfield Background
  const starfield = new CosmicStarfield('cosmic-starfield');
  window.starfield = starfield;

  // 2. Initialize 3D Star Hero
  const starHero = new StarHero('star-hero-canvas');
  window.starHero = starHero;

  // 3. Header Fade In on Scroll (Hidden at hero, fades in as user scrolls)
  const siteHeader = document.getElementById('site-header');
  if (siteHeader) {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
  }

  // 4. Initialize Full Media Player (Ported from psypher5)
  mediaPlayer.init();
  window.mediaPlayer = mediaPlayer;

  // 4. Sound effects on interactive elements
  const interactiveElements = document.querySelectorAll('.bento-card, .btn-tactile, .nav-item, .footer-link');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      sanctuaryAudio.playChime(null, 0.03);
    });
  });

  // 4. Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        sanctuaryAudio.playChime(369.99, 0.08);
      }
    });
  });

  // 5. Experience Modal / Drawer
  const modal = document.getElementById('experience-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalTagline = document.getElementById('modal-tagline');
  const modalDesc = document.getElementById('modal-desc');
  const modalImg = document.getElementById('modal-img');
  const modalActionLink = document.getElementById('modal-action-link');

  const experienceData = {
    noblegnomes: {
      title: 'Noble Gnomes',
      tagline: 'Steam-Powered Pond Exploration & Slime Arcana',
      desc: 'Captain the steam-powered "Puddlehopper" across an enchanted lilypad pond with a stalwart crew of gnomes, confronting ancient glowing moss slime behemoths with arcane shield runes.',
      img: 'assets/showcase/noble_gnomes.png',
      link: 'https://psypher5.co.uk/#projects',
      linkLabel: 'Launch Playable 3D Build ↗'
    },
    moments: {
      title: 'Moments',
      tagline: 'WebGL Acoustic Garden',
      desc: 'A serene spatial audio and visual diorama exploring organic flora growth, interactive ripples, and procedural harmonic resonance.',
      img: 'assets/showcase/moments.jpg',
      link: 'https://psypher5.co.uk/#projects',
      linkLabel: 'Experience Spatial WebGL ↗'
    },
    ewefo: {
      title: 'ewe-FO',
      tagline: 'Cosmic Physics Sandbox',
      desc: 'Extraterrestrial tractor-beam physics playground exploring rigid-body dynamics and playful chaos engineering.',
      img: 'assets/showcase/ewefo.png',
      link: 'https://psypher5.co.uk/#projects',
      linkLabel: 'Inspect Physics Prototype ↗'
    },
    aegis: {
      title: 'Aegis of Ages',
      tagline: 'Real-time 3D Fortress Siege',
      desc: 'Tactical fortress defense prototype testing real-time WebGL instancing, pathfinding algorithms, and dynamic atmospheric weather.',
      img: 'assets/showcase/aegis_of_ages.webp',
      link: 'https://psypher5.co.uk/#projects',
      linkLabel: 'View Battlefield Architecture ↗'
    }
  };

  document.querySelectorAll('[data-experience]').forEach(card => {
    card.addEventListener('click', () => {
      const expKey = card.getAttribute('data-experience');
      const data = experienceData[expKey];
      if (data && modal) {
        modalTitle.textContent = data.title;
        modalTagline.textContent = data.tagline;
        modalDesc.textContent = data.desc;
        modalImg.src = data.img;
        modalImg.alt = data.title;
        modalActionLink.href = data.link;
        modalActionLink.textContent = data.linkLabel;

        modal.classList.add('active');
        sanctuaryAudio.playChime(466.16, 0.12);
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('active');
      sanctuaryAudio.playChime(233.08, 0.08);
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
});
