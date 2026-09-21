# Star Sanctuary (www.starsanctuary.uk)

> *“Our aim is to foster a sanctuary for creativity.”*  
> An experience studio for art, games, and media.

---

## Overview

**Star Sanctuary** is an interactive web experience and studio portal exploring celestial aesthetics, interactive 3D WebGL, and high-fidelity web audio.

### Features

- **3D Kepler Stella Octangula**: Freely spinning dual-tetrahedron Merkaba with dynamic tilt wobble, rocket ignition bursts, and mouse parallax rendered via Three.js.
- **Helical Rocket Booster Streamlines**: 8 smooth ascending double-helix streamlines wrapping the celestial core with white-hot leading spark tips.
- **Ambient Twinkling Starfield**: Cosmic starfield drifting across the deep void with soft multi-spectral chromatic twinkling.
- **The Sanctuary Creed**: Studio manifesto tablet with warm amber starlight accents.
- **Interactive Experience Bento Showcase**: Showcasing studio works including *Noble Gnomes* (Playable 3D), *Moments* (Acoustic Diorama), *ewe-FO* (Cosmic Physics), *Aegis of Ages* (Real-time 3D Fortress Siege), and *Sanctuary Core* (R&D Edge Shaders).
- **Full Studio Soundtrack Music Deck**:
  - Vinyl turntable deck with rotating record art and center spindle.
  - Dynamic squiggly sine-wave scrubber (Android Auto style) with hover timestamps and pointer-drag seeking.
  - Interactive like button with explosive heart/star particle micro-interactions.
  - Social share popover (X intent & clipboard link sharing).
  - 6-track drawer with live 3-bar animated equalizer.
  - Floating mini-dock trigger and synchronized top navigation audio pill.

---

## Local Development

Run the included local static server:

```bash
node server.js
```

Then navigate to `http://localhost:8089/` in your browser.

---

## Deployment

The project is structured as static assets and configured for instant deployment to Cloudflare Pages or Edge:

- `wrangler.jsonc` configured for Cloudflare deployment
- Compatible with GitHub Pages, Vercel, Netlify, or any static host

---

## License

© Tom Woodward / Star Sanctuary. All rights reserved.
