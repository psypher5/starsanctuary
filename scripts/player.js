/**
 * Star Sanctuary — Full Media Player Engine
 * Ported directly from psypher5: Vinyl Turntable, Dynamic Squiggly Wavy Scrubber,
 * Like & Share Systems, Tracklist Drawer, and Reactive Header Synchronization.
 */

export const TRACKS = [
  {
    id: 0,
    title: 'Arrival at the Maw',
    artist: 'Tom Woodward & Gemini AI',
    file: 'assets/audio/Arrival_at_the_Maw.mp3',
    art: 'assets/audio/art/track_0.png',
    genre: 'Orchestral / Ambient'
  },
  {
    id: 1,
    title: 'Cathedral at Speed',
    artist: 'Tom Woodward & Gemini AI',
    file: 'assets/audio/Cathedral_at_Speed.mp3',
    art: 'assets/audio/art/track_1.png',
    genre: 'Cyber Synthwave'
  },
  {
    id: 2,
    title: "Gravity's Last Stand",
    artist: 'Tom Woodward & Gemini AI',
    file: 'assets/audio/Gravity_s_Last_Stand.mp3',
    art: 'assets/audio/art/track_2.webp',
    genre: 'Sci-Fi / Cinematic'
  },
  {
    id: 3,
    title: 'Quantum Entanglement',
    artist: 'Tom Woodward & Gemini AI',
    file: 'assets/audio/Quantum_Entanglement.mp3',
    art: 'assets/audio/art/track_3.webp',
    genre: 'Atmospheric Glitch'
  },
  {
    id: 4,
    title: 'Salt-Stained Morning',
    artist: 'Tom Woodward & Gemini AI',
    file: 'assets/audio/Salt_Stained_Morning.mp3',
    art: 'assets/audio/art/track_4.jpg',
    genre: 'Reflective Melodic'
  },
  {
    id: 5,
    title: "The Archmage's Gait",
    artist: 'Tom Woodward & Gemini AI',
    file: 'assets/audio/The_Archmage_s_Gait.mp3',
    art: 'assets/audio/art/track_5.webp',
    genre: 'Arcane Fantasy'
  }
];

export class MediaPlayer {
  constructor() {
    this.tracks = TRACKS;
    this.currentTrackIndex = 0;
    this.lastVolume = 0.8;
    this.audioEl = null;
    this.widgetEl = null;
    this.headerBtn = null;
    this.headerLabel = null;

    // Wave Scrubber State
    this.waveCanvas = null;
    this.waveCtx = null;
    this.wavePhase = 0;
    this.waveAnimId = null;
    this.isSeeking = false;

    // Likes
    this.baselineLikes = [142, 98, 115, 87, 104, 126];
  }

  init() {
    this.audioEl = document.getElementById('gemini-audio-player');
    this.widgetEl = document.getElementById('audio-player-widget');
    this.headerBtn = document.getElementById('audio-toggle');
    this.headerLabel = document.getElementById('audio-toggle-label');

    if (!this.audioEl || !this.widgetEl) return;

    this.audioEl.volume = 0.8;

    this.bindGlobals();
    this.initWaveScrubber();
    this.initAudioTracklist();

    // Check for deep-linking: #soundtrack?track=X
    let initialTrack = 0;
    const hashMatch = window.location.hash.match(/track=(\d+)/);
    const searchMatch = window.location.search.match(/track=(\d+)/);
    if (hashMatch && this.tracks[parseInt(hashMatch[1], 10)]) {
      initialTrack = parseInt(hashMatch[1], 10);
      this.widgetEl.classList.remove('collapsed');
    } else if (searchMatch && this.tracks[parseInt(searchMatch[1], 10)]) {
      initialTrack = parseInt(searchMatch[1], 10);
      this.widgetEl.classList.remove('collapsed');
    }

    this.loadTrack(initialTrack, false);
    this.updateLikeUI(initialTrack);
    this.startWaveLoop();

    // Audio Event Listeners
    this.audioEl.addEventListener('play', () => this.setPlayingStateUI(true));
    this.audioEl.addEventListener('pause', () => {
      this.setPlayingStateUI(false);
      this.drawWaveScrubber();
    });
    this.audioEl.addEventListener('ended', () => {
      const nextIdx = (this.currentTrackIndex + 1) % this.tracks.length;
      this.loadTrack(nextIdx, true);
    });
    this.audioEl.addEventListener('timeupdate', () => {
      const curr = this.audioEl.currentTime;
      const currTimeEl = document.getElementById('audio-time-curr');
      if (currTimeEl) currTimeEl.textContent = this.formatAudioTime(curr);
      this.drawWaveScrubber();
    });
    this.audioEl.addEventListener('loadedmetadata', () => {
      const durTimeEl = document.getElementById('audio-time-dur');
      if (durTimeEl && isFinite(this.audioEl.duration)) {
        durTimeEl.textContent = this.formatAudioTime(this.audioEl.duration);
      }
      this.drawWaveScrubber();
    });
    this.audioEl.addEventListener('durationchange', () => {
      const durTimeEl = document.getElementById('audio-time-dur');
      if (durTimeEl && isFinite(this.audioEl.duration)) {
        durTimeEl.textContent = this.formatAudioTime(this.audioEl.duration);
      }
      this.drawWaveScrubber();
    });
    this.audioEl.addEventListener('progress', () => {
      this.drawWaveScrubber();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      const popover = document.getElementById('audio-share-popover');
      if (popover && popover.classList.contains('active')) {
        const shareWrap = document.querySelector('.audio-share-wrapper');
        if (shareWrap && !shareWrap.contains(e.target)) {
          popover.classList.remove('active');
        }
      }

      if (!this.widgetEl || this.widgetEl.classList.contains('collapsed')) return;
      if (!this.widgetEl.contains(e.target)) {
        this.widgetEl.classList.add('collapsed');
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.widgetEl && !this.widgetEl.classList.contains('collapsed')) {
        this.widgetEl.classList.add('collapsed');
        const popover = document.getElementById('audio-share-popover');
        if (popover) popover.classList.remove('active');
      }
    });

    // Header sync
    if (this.headerBtn) {
      this.headerBtn.addEventListener('click', () => {
        // Toggle player expansion or playback
        if (this.widgetEl.classList.contains('collapsed')) {
          this.widgetEl.classList.remove('collapsed');
          setTimeout(() => this.drawWaveScrubber(), 50);
          if (this.audioEl.paused) {
            this.togglePlayback();
          }
        } else {
          this.togglePlayback();
        }
      });
    }
  }

  bindGlobals() {
    window.toggleAudioPlayer = (e) => this.togglePlayer(e);
    window.toggleAudioPlayback = (e) => this.togglePlayback(e);
    window.playTrack = (index) => this.playTrackByIndex(index);
    window.prevAudioTrack = () => this.prevTrack();
    window.nextAudioTrack = () => this.nextTrack();
    window.setAudioVolume = (val) => this.setVolume(val);
    window.toggleAudioMute = () => this.toggleMute();
    window.toggleAudioLike = (e) => this.toggleLike(e);
    window.toggleAudioShareMenu = (e) => this.toggleShareMenu(e);
    window.shareTrackOnX = (e) => this.shareOnX(e);
    window.copyTrackLink = (e) => this.copyLink(e);
  }

  formatAudioTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  updateTrackUI(index) {
    const track = this.tracks[index];
    if (!track) return;

    const miniArt = document.getElementById('audio-mini-art');
    const deckArt = document.getElementById('audio-deck-art');
    const titleEl = document.getElementById('audio-track-title');
    const countEl = document.getElementById('audio-track-count');
    const genreEl = document.getElementById('audio-track-genre');
    const artistEl = document.getElementById('audio-track-artist');

    if (miniArt) miniArt.src = track.art;
    if (deckArt) deckArt.src = track.art;
    if (titleEl) titleEl.textContent = track.title;
    if (countEl) countEl.textContent = `TRACK 0${index + 1} OF 0${this.tracks.length}`;
    if (genreEl) genreEl.textContent = track.genre;
    if (artistEl) artistEl.textContent = track.artist;

    if (this.headerLabel && this.audioEl && !this.audioEl.paused) {
      this.headerLabel.textContent = `♫ ${track.title}`;
    }

    document.querySelectorAll('.audio-track-item').forEach(item => {
      const itemIdx = parseInt(item.getAttribute('data-track-index'), 10);
      if (itemIdx === index) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    this.updateLikeUI(index);
  }

  setPlayingStateUI(isPlaying) {
    if (!this.widgetEl) return;
    this.widgetEl.classList.toggle('is-playing', isPlaying);

    const miniPlayIcon = document.getElementById('mini-play-icon');
    const miniPauseIcon = document.getElementById('mini-pause-icon');
    const deckPlayIcon = document.getElementById('deck-play-icon');
    const deckPauseIcon = document.getElementById('deck-pause-icon');

    if (miniPlayIcon && miniPauseIcon) {
      miniPlayIcon.style.display = isPlaying ? 'none' : 'block';
      miniPauseIcon.style.display = isPlaying ? 'block' : 'none';
    }
    if (deckPlayIcon && deckPauseIcon) {
      deckPlayIcon.style.display = isPlaying ? 'none' : 'block';
      deckPauseIcon.style.display = isPlaying ? 'block' : 'none';
    }

    // Sync header button
    if (this.headerBtn) {
      this.headerBtn.classList.toggle('active', isPlaying);
    }
    if (this.headerLabel) {
      const track = this.tracks[this.currentTrackIndex];
      this.headerLabel.textContent = isPlaying ? `♫ ${track.title}` : 'SOUNDTRACK';
    }
  }

  togglePlayer(e) {
    if (e) e.stopPropagation();
    if (!this.widgetEl) return;
    this.widgetEl.classList.toggle('collapsed');
    if (!this.widgetEl.classList.contains('collapsed')) {
      setTimeout(() => this.drawWaveScrubber(), 50);
    }
  }

  togglePlayback(e) {
    if (e) e.stopPropagation();
    if (!this.audioEl) return;

    if (this.audioEl.paused) {
      const p = this.audioEl.play();
      if (p !== undefined) {
        p.catch(err => {
          console.warn('Playback error, reloading:', err);
          this.audioEl.load();
          this.audioEl.play().catch(e => console.error('Play failed:', e));
        });
      }
    } else {
      this.audioEl.pause();
    }
  }

  loadTrack(index, autoPlay = false) {
    if (!this.audioEl || !this.tracks[index]) return;
    this.currentTrackIndex = index;
    const track = this.tracks[index];

    const resolvedUrl = new URL(track.file, window.location.href).href;
    if (this.audioEl.src !== resolvedUrl) {
      this.audioEl.src = resolvedUrl;
      this.audioEl.load();
    }

    this.updateTrackUI(index);

    const currTimeEl = document.getElementById('audio-time-curr');
    if (currTimeEl) currTimeEl.textContent = '0:00';
    const durTimeEl = document.getElementById('audio-time-dur');
    if (durTimeEl && this.audioEl.duration && isFinite(this.audioEl.duration)) {
      durTimeEl.textContent = this.formatAudioTime(this.audioEl.duration);
    }

    this.drawWaveScrubber();

    if (autoPlay) {
      const p = this.audioEl.play();
      if (p !== undefined) {
        p.catch(err => console.warn('Autoplay prevented:', err));
      }
    }
  }

  playTrackByIndex(index) {
    if (index === this.currentTrackIndex) {
      this.togglePlayback();
    } else {
      this.loadTrack(index, true);
    }
  }

  prevTrack() {
    if (!this.audioEl) return;
    if (this.audioEl.currentTime > 3) {
      this.audioEl.currentTime = 0;
      this.drawWaveScrubber();
    } else {
      const nextIdx = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
      this.loadTrack(nextIdx, !this.audioEl.paused);
    }
  }

  nextTrack() {
    if (!this.audioEl) return;
    const nextIdx = (this.currentTrackIndex + 1) % this.tracks.length;
    this.loadTrack(nextIdx, !this.audioEl.paused);
  }

  setVolume(val) {
    if (!this.audioEl) return;
    const volume = parseFloat(val);
    this.audioEl.volume = volume;
    this.audioEl.muted = volume === 0;
    this.updateVolumeIcons(volume);
  }

  toggleMute() {
    if (!this.audioEl) return;
    const slider = document.getElementById('audio-vol-slider');
    if (this.audioEl.muted || this.audioEl.volume === 0) {
      this.audioEl.muted = false;
      this.audioEl.volume = this.lastVolume > 0 ? this.lastVolume : 0.8;
      if (slider) slider.value = this.audioEl.volume;
      this.updateVolumeIcons(this.audioEl.volume);
    } else {
      this.lastVolume = this.audioEl.volume;
      this.audioEl.muted = true;
      this.audioEl.volume = 0;
      if (slider) slider.value = 0;
      this.updateVolumeIcons(0);
    }
  }

  updateVolumeIcons(volume) {
    const volHigh = document.getElementById('vol-high-icon');
    const volMuted = document.getElementById('vol-muted-icon');
    if (volHigh && volMuted) {
      if (volume === 0 || (this.audioEl && this.audioEl.muted)) {
        volHigh.style.display = 'none';
        volMuted.style.display = 'block';
      } else {
        volHigh.style.display = 'block';
        volMuted.style.display = 'none';
      }
    }
  }

  // ── Likes System ──
  getLikedTracks() {
    try {
      return JSON.parse(localStorage.getItem('starsanctuary_liked_tracks') || '[]');
    } catch (e) {
      return [];
    }
  }

  getTrackLikes(idx) {
    try {
      const cached = JSON.parse(localStorage.getItem('starsanctuary_track_likes') || '{}');
      if (typeof cached[idx] === 'number') {
        return cached[idx];
      }
    } catch (e) {}
    return this.baselineLikes[idx] || 0;
  }

  setTrackLikes(idx, count) {
    try {
      const cached = JSON.parse(localStorage.getItem('starsanctuary_track_likes') || '{}');
      cached[idx] = count;
      localStorage.setItem('starsanctuary_track_likes', JSON.stringify(cached));
    } catch (e) {}
  }

  updateLikeUI(index) {
    const likeBtn = document.getElementById('audio-like-btn');
    const countEl = document.getElementById('audio-like-count');
    if (!likeBtn || !countEl) return;

    const likedTracks = this.getLikedTracks();
    const isLiked = likedTracks.includes(index);
    const count = this.getTrackLikes(index);

    likeBtn.classList.toggle('liked', isLiked);
    likeBtn.setAttribute('title', isLiked ? 'Unlike this track' : 'Like this track');
    countEl.textContent = count.toLocaleString();
  }

  spawnLikeParticles() {
    const container = document.getElementById('audio-like-particles');
    if (!container) return;
    container.innerHTML = '';

    const symbols = ['❤️', '✨', '✦', '⭐', '🎵'];
    for (let i = 0; i < 5; i++) {
      const p = document.createElement('span');
      p.className = 'heart-particle';
      p.textContent = symbols[i % symbols.length];
      const angle = (Math.PI * 2 * i) / 5 + (Math.random() - 0.5) * 0.5;
      const dist = 24 + Math.random() * 20;
      const tx = Math.cos(angle) * dist;
      const ty = -18 - Math.random() * 25;
      p.style.setProperty('--tx', `${tx}px`);
      p.style.setProperty('--ty', `${ty}px`);
      p.style.left = '20%';
      p.style.top = '30%';
      container.appendChild(p);
      setTimeout(() => {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 850);
    }
  }

  toggleLike(e) {
    if (e) e.stopPropagation();
    const likedTracks = this.getLikedTracks();
    const trackIdx = this.currentTrackIndex;
    const alreadyLiked = likedTracks.includes(trackIdx);
    let currentCount = this.getTrackLikes(trackIdx);

    if (alreadyLiked) {
      const updated = likedTracks.filter(id => id !== trackIdx);
      localStorage.setItem('starsanctuary_liked_tracks', JSON.stringify(updated));
      currentCount = Math.max(0, currentCount - 1);
      this.setTrackLikes(trackIdx, currentCount);
    } else {
      likedTracks.push(trackIdx);
      localStorage.setItem('starsanctuary_liked_tracks', JSON.stringify(likedTracks));
      currentCount += 1;
      this.setTrackLikes(trackIdx, currentCount);
      this.spawnLikeParticles();
    }
    this.updateLikeUI(trackIdx);
  }

  // ── Share System ──
  toggleShareMenu(e) {
    if (e) e.stopPropagation();
    const popover = document.getElementById('audio-share-popover');
    if (!popover) return;
    popover.classList.toggle('active');
  }

  getShareableUrl(index) {
    const origin = window.location.origin;
    const path = window.location.pathname && window.location.pathname !== '/' ? window.location.pathname : '/';
    return `${origin}${path}#soundtrack?track=${index}`;
  }

  shareOnX(e) {
    if (e) e.stopPropagation();
    const track = this.tracks[this.currentTrackIndex];
    const shareUrl = this.getShareableUrl(this.currentTrackIndex);
    const tweetText = `Listening to "${track.title}" (${track.genre}) on @psypher5's Star Sanctuary Soundtrack! 🎧✨`;
    const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterIntent, '_blank', 'noopener,noreferrer,width=560,height=440');
    const popover = document.getElementById('audio-share-popover');
    if (popover) popover.classList.remove('active');
  }

  copyLink(e) {
    if (e) e.stopPropagation();
    const shareUrl = this.getShareableUrl(this.currentTrackIndex);
    const label = document.getElementById('copy-link-label');

    navigator.clipboard.writeText(shareUrl).then(() => {
      if (label) {
        const origText = label.textContent;
        label.textContent = 'Copied! ✓';
        label.style.color = '#00e5ff';
        setTimeout(() => {
          label.textContent = origText;
          label.style.color = '';
          const popover = document.getElementById('audio-share-popover');
          if (popover) popover.classList.remove('active');
        }, 1400);
      }
    }).catch(() => {
      if (label) {
        label.textContent = 'Copied! ✓';
        setTimeout(() => { label.textContent = 'Copy Track Link'; }, 1400);
      }
    });
  }

  // ── Dynamic Squiggly Wavy Scrubber Canvas (Android Auto Style) ──
  initWaveScrubber() {
    this.waveCanvas = document.getElementById('audio-wave-canvas');
    if (!this.waveCanvas) return;
    this.waveCtx = this.waveCanvas.getContext('2d');

    const container = document.getElementById('audio-wave-container');
    if (!container) return;

    const updateCanvasSize = () => {
      if (!this.waveCanvas || !container) return;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0) return;
      const dpr = window.devicePixelRatio || 1;
      this.waveCanvas.width = rect.width * dpr;
      this.waveCanvas.height = rect.height * dpr;
      this.waveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.drawWaveScrubber();
    };

    window.addEventListener('resize', updateCanvasSize);
    setTimeout(updateCanvasSize, 100);

    const hoverLine = document.getElementById('audio-wave-hover-line');
    const tooltip = document.getElementById('audio-wave-tooltip');

    const handlePointerSeek = (e) => {
      if (!this.audioEl || !this.audioEl.duration) return;
      const rect = container.getBoundingClientRect();
      const clientX = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
      const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const pct = clickX / rect.width;
      this.audioEl.currentTime = pct * this.audioEl.duration;
      this.drawWaveScrubber();
    };

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
      const hoverX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const pct = hoverX / rect.width;

      if (hoverLine) {
        hoverLine.style.left = `${hoverX}px`;
      }
      if (tooltip && this.audioEl && this.audioEl.duration) {
        tooltip.style.left = `${hoverX}px`;
        tooltip.textContent = this.formatAudioTime(pct * this.audioEl.duration);
      }

      if (this.isSeeking) {
        handlePointerSeek(e);
      }
    };

    container.addEventListener('pointerdown', (e) => {
      this.isSeeking = true;
      container.setPointerCapture(e.pointerId);
      handlePointerSeek(e);
    });

    container.addEventListener('pointermove', handlePointerMove);

    container.addEventListener('pointerup', (e) => {
      if (this.isSeeking) {
        this.isSeeking = false;
        try { container.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    });

    container.addEventListener('pointercancel', (e) => {
      this.isSeeking = false;
      try { container.releasePointerCapture(e.pointerId); } catch (err) {}
    });
  }

  drawWaveScrubber() {
    if (!this.waveCanvas || !this.waveCtx) return;
    const rect = this.waveCanvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width === 0 || height === 0) return;

    this.waveCtx.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const duration = this.audioEl && this.audioEl.duration ? this.audioEl.duration : 1;
    const currentTime = this.audioEl ? this.audioEl.currentTime : 0;
    const progressPct = Math.max(0, Math.min(1, currentTime / duration));
    const playedWidth = progressPct * width;

    // 1. Draw Unplayed Track (Rail)
    this.waveCtx.beginPath();
    this.waveCtx.moveTo(playedWidth, centerY);
    this.waveCtx.lineTo(width, centerY);
    this.waveCtx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    this.waveCtx.lineWidth = 2.5;
    this.waveCtx.lineCap = 'round';
    this.waveCtx.stroke();

    // Buffered segment
    if (this.audioEl && this.audioEl.buffered && this.audioEl.buffered.length > 0 && duration > 0) {
      const bufferedEnd = this.audioEl.buffered.end(this.audioEl.buffered.length - 1);
      const bufferedWidth = Math.min(width, (bufferedEnd / duration) * width);
      if (bufferedWidth > playedWidth) {
        this.waveCtx.beginPath();
        this.waveCtx.moveTo(playedWidth, centerY);
        this.waveCtx.lineTo(bufferedWidth, centerY);
        this.waveCtx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        this.waveCtx.lineWidth = 2.5;
        this.waveCtx.stroke();
      }
    }

    // 2. Draw Dynamic Squiggly Sine Wave
    if (playedWidth > 0) {
      const wavelength = 22;
      const amplitude = 4.2;
      const isPlaying = this.audioEl && !this.audioEl.paused;

      this.waveCtx.save();
      this.waveCtx.beginPath();

      const step = 2;
      for (let x = 0; x <= playedWidth; x += step) {
        const taperStart = Math.min(1, x / 10);
        const taperEnd = Math.min(1, (playedWidth - x) / 14);
        const env = taperStart * taperEnd;

        const y = centerY + Math.sin((x / wavelength) * (Math.PI * 2) - this.wavePhase) * (amplitude * env);

        if (x === 0) {
          this.waveCtx.moveTo(x, y);
        } else {
          this.waveCtx.lineTo(x, y);
        }
      }

      this.waveCtx.lineTo(playedWidth, centerY);

      const grad = this.waveCtx.createLinearGradient(0, 0, playedWidth, 0);
      grad.addColorStop(0, '#0072f5');
      grad.addColorStop(1, '#00e5ff');

      this.waveCtx.strokeStyle = grad;
      this.waveCtx.lineWidth = 3.2;
      this.waveCtx.lineCap = 'round';
      this.waveCtx.lineJoin = 'round';
      this.waveCtx.shadowColor = '#00e5ff';
      this.waveCtx.shadowBlur = isPlaying ? 8 : 4;
      this.waveCtx.stroke();
      this.waveCtx.restore();
    }

    // 3. Draw Concentric Scrubber Thumb Handle
    const thumbRadius = this.isSeeking ? 7.5 : 5.8;
    this.waveCtx.save();
    this.waveCtx.beginPath();
    this.waveCtx.arc(playedWidth, centerY, thumbRadius, 0, Math.PI * 2);
    this.waveCtx.fillStyle = '#ffffff';
    this.waveCtx.shadowColor = '#00e5ff';
    this.waveCtx.shadowBlur = 10;
    this.waveCtx.fill();

    this.waveCtx.beginPath();
    this.waveCtx.arc(playedWidth, centerY, thumbRadius, 0, Math.PI * 2);
    this.waveCtx.strokeStyle = '#00e5ff';
    this.waveCtx.lineWidth = 2;
    this.waveCtx.stroke();
    this.waveCtx.restore();
  }

  startWaveLoop() {
    if (this.waveAnimId) cancelAnimationFrame(this.waveAnimId);

    const tick = () => {
      if (this.audioEl && !this.audioEl.paused) {
        this.wavePhase += 0.09;
        this.drawWaveScrubber();
      }
      this.waveAnimId = requestAnimationFrame(tick);
    };
    this.waveAnimId = requestAnimationFrame(tick);
  }

  initAudioTracklist() {
    const container = document.getElementById('audio-tracklist-items');
    if (!container) return;
    container.innerHTML = '';

    this.tracks.forEach((track, idx) => {
      const item = document.createElement('div');
      item.className = `audio-track-item ${idx === this.currentTrackIndex ? 'active' : ''}`;
      item.setAttribute('data-track-index', idx);
      item.onclick = () => window.playTrack(idx);

      item.innerHTML = `
        <span class="audio-item-num">${(idx + 1) < 10 ? '0' : ''}${idx + 1}</span>
        <img src="${track.art}" alt="${track.title}" class="audio-item-art" loading="lazy">
        <div class="audio-item-info">
          <span class="audio-item-title">${track.title}</span>
          <span class="audio-item-tag">${track.genre}</span>
        </div>
        <div class="audio-item-wave" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
      `;
      container.appendChild(item);
    });
  }
}

export const mediaPlayer = new MediaPlayer();
