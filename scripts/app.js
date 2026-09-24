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
      link: 'https://noblegnomes.psypher5.workers.dev/',
      linkLabel: 'Launch Playable 3D Build ↗'
    },
    moments: {
      title: 'Moments',
      tagline: 'Memories of Merlin',
      desc: 'An emotional 3D memorial journey created for Merlin the miniature dachshund. Guide Merlin across celestial meadows, bridge rainbow chasms, collect memory prism gems, and run free under vibrant starry skies.',
      img: 'assets/showcase/moments.jpg',
      link: 'games/moments/index.html',
      linkLabel: 'Play 3D Memorial Journey ↗'
    },
    ewefo: {
      title: 'ewe-FO',
      tagline: 'Abduct. Automate. Ascend.',
      desc: 'An arcade physics-based abduction game set across a diorama-styled British countryside. Pilot a tractor-beam equipped UFO by night to herd and harvest livestock, while building automated conveyor networks, energy condensors, and processing pipelines by day.',
      img: 'assets/showcase/ewefo.png',
      link: 'games/ewefo/index.html',
      linkLabel: 'Launch 3D Physics Prototype ↗'
    },
    aegis: {
      title: 'Aegis of Ages',
      tagline: 'Hilltop Fortress Defense & Siege Arcana',
      desc: 'Command a hilltop fortress under siege from every direction! Strategically place archers, barricades, and spikes between waves, aim the heavy ballista by hand, douse spreading structural fires, and hold the line against escalating hostile incursions.',
      img: 'assets/showcase/aegis_of_ages.webp',
      link: 'https://www.spawn.co/@psypher5/aegis-of-ages/play',
      linkLabel: 'Play Live on Spawn ↗'
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
