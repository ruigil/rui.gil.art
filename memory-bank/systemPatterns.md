# System Patterns: OceanOS Travel Log

## Architecture Overview

```
Signal Messenger ──→ signal-api.ts ──→ JSON files (./messages/)
                                            │
                                            ▼
Lume SSG ──→ TypeScript pages ──→ Static HTML shell ──→ ./site/
                                            │
                                            ▼
                                  Web Components (client-side)
                                  fetch JSON → render posts
```

### Hybrid SSG + Client-Side Rendering
The site uses a **hybrid architecture**:
- **Build-time (SSG)**: Lume generates static HTML pages (layouts, navigation, gallery)
- **Runtime (CSR)**: Web Components fetch post JSON from `/messages/` and render dynamically

This means the posts page is essentially a **single-page app** within a static shell — the `<os-posts>` component fetches `messages.json`, then individual `message-{id}.json` files, and renders them client-side.

## Key Design Patterns

### 1. Signal-as-CMS Pattern
```
Signal Group Message → signal-api.ts → JSON files → Client-side fetch → Rendered posts
```
- Messages are the content authoring mechanism
- Auto-tagging by: year, month, content type (PHOTO, VIDEO, AUDIO, TEXT, POSITION)
- User hashtags extracted from message text (e.g., `#sailing` → tag `SAILING`)
- Supports message deletion (remote delete signals)
- Media referenced by Signal attachment IDs

### 2. Layout Composition (Template Chain)
```
base.ts (HTML document shell)
  └── page.ts (page wrapper with header)
        └── Individual page content
```
- `base.ts`: Full HTML document — `<head>`, nav, SVG wave animation, scripts, theme toggle
- `page.ts`: Sets `layout = "layouts/base.ts"`, adds page title header and content section
- Pages export metadata (`title`, `url`, `menu`, `layout`) as module constants

### 3. Web Components Architecture
Six custom elements using **Shadow DOM** for style encapsulation:

| Component | Tag | Pattern |
|---|---|---|
| `PostComponent` | `<os-post>` | Attribute-driven card renderer |
| `PostsFilterComponent` | `<os-posts>` | Data-fetching container with tag filter UI |
| `Photo360Viewer` | `<photo-360-viewer>` | WebGPU shader-based 360° image viewer |
| `Video360Viewer` | `<video-360-viewer>` | WebGPU shader-based 360° video viewer |
| `AudioWaveformPlayer` | `<audio-player>` | Canvas-based waveform + HTML5 Audio |
| `VideoPlayerComponent` | `<video-player>` | Custom video controls over HTML5 Video |

**Pattern**: `PostsFilterComponent` is the **orchestrator** — it fetches data, manages tag state, and creates `<os-post>` elements. Each `<os-post>` conditionally includes media sub-components based on its attributes.

### 4. Async Generator for Gallery Pages
`gallery.page.ts` uses an **async generator** (`async function*`) to recursively walk the `./media/gallery/` filesystem at build time:
```
processDirectory(name, url) → yields page objects for each directory
  ├── Recurse into subdirectories → yield* processDirectory(subdir)
  └── Yield { layout, title, url, menu, content } for current directory
```
This generates one HTML page per directory with folder thumbnails and a 4-column masonry photo grid.

### 5. Theme System
- CSS custom properties define the color palette
- `data-theme` attribute on `<html>` toggles light/dark
- Persisted to `localStorage`
- Falls back to `prefers-color-scheme` media query
- Animated SVG wave uses theme variables for gradient colors

### 6. Menu System
- Pages declare menu visibility and order via exports: `export const menu = { visible: true, order: 1 }`
- `base.ts` uses Lume's `search.pages()` to dynamically build the navbar from page metadata

## Data Flow

### Post Data Model (JSON)
```json
{
  "author": "Name",
  "time": 1720610247000,
  "avatar": "/media/signal/avatars/profile-+1234567890",
  "tags": ["2024", "JUL", "PHOTO", "SAILING"],
  "message": "Optional text",
  "image": "/media/signal/attachments/abc123",
  "video": "/media/signal/attachments/def456",
  "audio": "/media/signal/attachments/ghi789",
  "maps": ["/media/signal/attachments/map.jpg", "https://maps.google.com/..."]
}
```

### Post Index (`messages.json`)
```json
[
  { "id": 1720610247000, "tags": ["2024", "JUL", "PHOTO"] },
  ...
]
```

## Component Relationships
```
base.ts layout
  ├── navbar (dynamic from page metadata)
  ├── SVG wave animation
  ├── theme toggle (localStorage)
  └── content slot
        ├── posts.page.ts → <os-posts>
        │     ├── tag filter UI
        │     └── <os-post> (×N)
        │           ├── <photo-360-viewer> (if 360° image)
        │           ├── <video-360-viewer> (if 360° video)
        │           ├── <video-player> (if regular video)
        │           ├── <audio-player> (if audio)
        │           └── position display (if GPS)
        ├── gallery.page.ts → folder grid / photo masonry
        ├── globe.page.ts → CesiumJS viewer
        └── contact.md → markdown content
```
