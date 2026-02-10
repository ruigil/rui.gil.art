# Project Brief: rui.gil.art (OceanOS Travel Log)

## Project Name
**OceanOS** — A personal travel log / blog website at `rui.gil.art`

## Repository
- GitHub: https://github.com/ruigil/rui.gil.art.git
- Domain: rui.gil.art

## Core Purpose
A static travel blog that aggregates multimedia content (text, photos, videos, audio, GPS positions) sent via Signal Messenger and presents them in a rich, interactive website with 360° media viewers, a 3D globe, and a photo gallery.

## Key Requirements
1. **Signal-as-CMS**: Content is authored by sending messages (with media and hashtags) to a Signal Messenger group, which are then ingested into the site
2. **Rich Media Support**: Photos, videos, audio, 360° equirectangular photos/videos, and GPS positions
3. **Interactive Globe**: CesiumJS-powered 3D globe showing travel routes from KML data
4. **Photo Gallery**: Recursive directory-based photo gallery generated at build time
5. **Social Feed UX**: Posts displayed as social-media-style cards with tag filtering
6. **Dark/Light Theme**: User-selectable theme with system preference detection

## Target Audience
Personal use — a travel log for documenting and sharing travel experiences.
