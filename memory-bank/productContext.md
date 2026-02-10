# Product Context: OceanOS Travel Log

## Why This Project Exists
OceanOS is a personal travel blog that transforms Signal Messenger into a content management system. Instead of using a traditional CMS or blogging platform, the author sends messages, photos, videos, and audio to a Signal group, which are automatically processed and published to a static website.

## Problems It Solves
1. **Friction-free content creation** — No need to log into a CMS; just send a Signal message with media
2. **Rich travel documentation** — Captures text, images, videos, audio recordings, 360° panoramas, and GPS positions
3. **Offline-first authoring** — Signal works on mobile with limited connectivity, ideal for remote travel
4. **Travel route visualization** — Interactive 3D globe shows travel routes overlaid on real terrain
5. **Photo organization** — Automatic gallery generation from directory structure

## How It Works
1. **Content Creation**: User sends messages to a Signal group with text, media attachments, and hashtags (e.g., `#sailing`, `#360`)
2. **Ingestion**: `signal-api.ts` script polls the Signal API, extracts messages, auto-tags them (by year, month, content type), and saves as JSON files
3. **Build**: Lume SSG generates the static site from TypeScript page templates
4. **Client-Side Rendering**: Web Components fetch post JSON at runtime, render social-media-style cards with rich media players
5. **Interactive Features**: 360° viewers (WebGPU), audio waveform players, video players, tag filtering, CesiumJS globe

## User Experience Goals
- **Social media feel** — Posts look like Instagram/Facebook cards with avatars, timestamps, tags
- **Immersive media** — 360° photos/videos rendered via WebGPU shaders
- **Easy navigation** — Tag-based filtering, responsive design, dark/light theme
- **Visual travel tracking** — Globe page showing actual travel routes on 3D terrain

## Pages
| Page | Purpose |
|---|---|
| `/posts/` (home) | Social feed with filterable posts |
| `/gallery/` | Recursive photo gallery |
| `/globe/` | 3D CesiumJS globe with KML travel routes |
| `/contact` | Contact information |
