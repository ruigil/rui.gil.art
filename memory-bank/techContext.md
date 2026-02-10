# Tech Context: OceanOS Travel Log

## Runtime & Build
| Technology | Details |
|---|---|
| **Runtime** | Deno (TypeScript-first) |
| **Static Site Generator** | [Lume](https://lume.land) v2.1.2 |
| **CMS (optional)** | Lume CMS v0.3.9 (imported but not actively configured) |
| **Package Management** | Deno URL imports (no node_modules) |

## Lume Plugins (configured in `_config.ts`)
| Plugin | Purpose |
|---|---|
| `postcss` | CSS processing |
| `basePath` | Base URL path handling |
| `date` | Date formatting |
| `metas` | SEO meta tags |
| `image` (markdown-plugins) | Image handling in markdown |
| `resolveUrls` | URL resolution |
| `terser` | JavaScript minification |
| `sitemap` | Sitemap generation |
| `feed` | RSS (Atom XML) + JSON feed generation |

## Build Configuration
- **Source directory**: `./src`
- **Output directory**: `./site`
- **Static assets**: `src/assets/` copied as-is
- **Feed output**: `/feed.xml` and `/feed.json` for posts (`type=post`)

## Templating
- **TypeScript pages** (`.page.ts`) — Tagged template literals with `/*html*/` comment hints for syntax highlighting
- **Vento templates** (`.vto`) — Used for some partials (e.g., `post-details.vto`, `post-list.vto`)
- **YAML data** — `_data.yml` for global site data; `_data/i18n.yml` for internationalization

## Client-Side Technologies
| Technology | Purpose |
|---|---|
| **Web Components** | Custom Elements with Shadow DOM (vanilla, no framework) |
| **WebGPU + WGSL** | 360° photo/video rendering via `poiesis.js` library |
| **CesiumJS v1.119** | 3D globe with terrain, KML route visualization |
| **Canvas API** | Audio waveform rendering |
| **CSS Custom Properties** | Design system theming (light/dark mode) |

## External Dependencies (CDN)
- CesiumJS v1.119 (JS + CSS from cesium.com CDN)
- `poiesis.js` — Likely author's own WebGPU animation framework (loaded as local module)

## Content Pipeline
- **Signal API** → `signal-api.ts` (Deno script) → JSON files in `./messages/`
- Uses `dotenv` for environment variables (`OCEANOS_GROUP_ID`, `API_URL`)
- Media stored in `./media/signal/attachments/` and `./media/signal/avatars/`

## Deno Tasks (`deno.json`)
| Task | Command |
|---|---|
| `build` | `deno task lume` — Build the static site |
| `serve` | `deno task lume -s` — Build + serve with hot reload |
| `signal` | `deno run --allow-net --allow-read --allow-write signal-api.ts` — Ingest Signal messages |

## CSS Architecture
- Modular CSS with imports in `src/styles.css`
- Design system: `ds.css` (tokens/variables)
- Component CSS: `navbar.css`, `page.css`, `post-list.css`, `post.css`, `gallery.css`, `timeline.css`
- CSS custom properties for theming: `--color-background`, `--color-highlight`, `--color-contrast`, `--color-text`, `--color-base`, `--color-dim`, `--color-link`
- PostCSS processing at build time

## File Structure
```
/
├── _config.ts              # Lume configuration
├── deno.json               # Deno config, imports, tasks
├── signal-api.ts           # Signal message ingestion script
├── media/                  # Media files (gallery, signal attachments)
├── src/
│   ├── _data.yml           # Global site data (metas, lang)
│   ├── _data/i18n.yml      # Internationalization
│   ├── index.page.ts       # Homepage (redirects to /posts/)
│   ├── styles.css          # Main stylesheet (imports all CSS)
│   ├── 404.md              # 404 page
│   ├── _includes/
│   │   ├── css/            # Component CSS files
│   │   ├── layouts/        # base.ts, page.ts
│   │   └── templates/      # Vento templates (post-details, post-list)
│   ├── assets/
│   │   ├── img/            # Static images
│   │   ├── js/             # Client JS (components, shaders, data)
│   │   └── tgv.kml         # Travel route KML file
│   └── pages/
│       ├── posts.page.ts   # Posts feed page
│       ├── gallery.page.ts # Photo gallery (recursive generator)
│       ├── globe.page.ts   # CesiumJS 3D globe
│       └── contact.md      # Contact page
└── site/                   # Build output (gitignored)
```
