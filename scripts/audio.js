/**
 * Star Sanctuary — Celestial Audio & Studio Soundtrack Engine
 * Features Tom Woodward's soundtrack tracks from psypher5 alongside
 * crisp Web Audio celestial chimes for interactive void feedback.
 */

export const SANCTUARY_TRACKS = [
  {
    id: 0,
    title: 'Arrival at the Maw',
    artist: 'Tom Woodward & Gemini AI',
    file: 'assets/audio/Arrival_at_the_Maw.mp3',
    genre: 'Orchestral / Ambient'
  },
  {
    id: 1,
    title: 'Cathedral at Speed',
    artist: 'Tom Woodward & Gemini AI',
    file: 'assets/audio/Cathedral_at_Speed.mp3',
    genre: 'Cyber Synthwave'
  },
  {
    id: 2,
    title: "Gravity's Last Stand",
    artist: 'Tom Woodward & Gemini AI',
    file: 'assets/audio/Gravity_s_Last_Stand.mp3',
    genre: 'Sci-Fi / Cinematic'
  },
  {
    id: 3,
    title: 'Quantum Entanglement',
    artist: 'Tom Woodward & Gemini AI',
    file: 'assets/audio/Quantum_Entanglement.mp3',
    genre: 'Atmospheric Glitch'
  },
  {
    id: 4,
    title: 'Salt-Stained Morning',
    artist: 'Tom Woodward & Gemini AI',
    file: 'assets/audio/Salt_Stained_Morning.mp3',
    genre: 'Reflective Melodic'
  },
  {
    id: 5,
    title: "The Archmage's Gait",
    artist: 'Tom Woodward & Gemini AI',
    file: 'assets/audio/The_Archmage_s_Gait.mp3',
    genre: 'Arcane Fantasy'
  }
];

class SanctuaryAudioEngine {
  constructor() {
    // 1. Soundtrack Audio Element
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.currentTrackIndex = 0;
    this.isPlaying = false;
    this.volume = 0.75;
    this.audio.volume = this.volume;

    // 2. Web Audio Context for UI Chimes (no drone hum!)
    this.ctx = null;
    this.masterGain = null;
    this.frequencies = [
      155.56, 185.00, 207.65, 233.08, 277.18, 311.13,
      369.99, 415.30, 466.16, 554.37, 622.25, 739.99, 932.33
    ];

    this.listeners = new Set();

    // Auto-advance to next track on finish
    this.audio.addEventListener('ended', () => {
      this.nextTrack();
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.notifyListeners();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notifyListeners();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      this.isPlaying = false;
      this.notifyListeners();
    });

    // Load initial track source
    this.loadTrack(0);
  }

  initWebAudio() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  loadTrack(index) {
    if (index < 0 || index >= SANCTUARY_TRACKS.length) return;
    this.currentTrackIndex = index;
    const track = SANCTUARY_TRACKS[this.currentTrackIndex];
    this.audio.src = track.file;
    this.notifyListeners();
  }

  async play(index = null) {
    this.initWebAudio();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (index !== null && index !== this.currentTrackIndex) {
      this.loadTrack(index);
    }

    try {
      await this.audio.play();
      this.isPlaying = true;
      this.playChime(311.13, 0.1); // subtle chime confirmation
    } catch (err) {
      console.warn('Audio play request blocked or failed:', err);
      this.isPlaying = false;
    }
    this.notifyListeners();
    return this.isPlaying;
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.notifyListeners();
  }

  async togglePlay() {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      return await this.play();
    }
  }

  async nextTrack() {
    const nextIdx = (this.currentTrackIndex + 1) % SANCTUARY_TRACKS.length;
    this.loadTrack(nextIdx);
    if (this.isPlaying) {
      await this.play();
    } else {
      this.notifyListeners();
    }
  }

  async prevTrack() {
    const prevIdx = (this.currentTrackIndex - 1 + SANCTUARY_TRACKS.length) % SANCTUARY_TRACKS.length;
    this.loadTrack(prevIdx);
    if (this.isPlaying) {
      await this.play();
    } else {
      this.notifyListeners();
    }
  }

  getCurrentTrack() {
    return SANCTUARY_TRACKS[this.currentTrackIndex];
  }

  onStateChange(fn) {
    this.listeners.add(fn);
    fn(this.getState());
    return () => this.listeners.delete(fn);
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      currentTrack: this.getCurrentTrack(),
      trackIndex: this.currentTrackIndex,
      totalTracks: SANCTUARY_TRACKS.length
    };
  }

  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  /**
   * Play a crisp crystalline chime on UI interaction
   */
  playChime(freq = null, vol = 0.12) {
    this.initWebAudio();
    if (!this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const f = freq || this.frequencies[Math.floor(Math.random() * this.frequencies.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.9);
    } catch (e) {
      // Ignore if tab suspended
    }
  }

  /**
   * Play an ethereal 3-note harmonic resonance triad on Star click
   */
  playResonanceChord() {
    const chord = [311.13, 466.16, 622.25]; // Eb4 - Bb4 - Eb5 celestial triad
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 0.16 / (idx + 1));
      }, idx * 60);
    });
  }
}

export const sanctuaryAudio = new SanctuaryAudioEngine();
