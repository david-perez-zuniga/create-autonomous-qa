# Landing page — create-autonomous-qa

Landing page estática de **create-autonomous-qa**, construida con
[Astro](https://astro.build/) + Tailwind CSS.

## Desarrollo

```bash
pnpm install
pnpm dev
```

El sitio queda disponible en `http://localhost:4321`.

## Build

```bash
pnpm build      # genera dist/
pnpm preview    # sirve dist/ localmente
pnpm astro check  # validación de tipos
```

## Estructura

```text
src/
├── components/    # Header, Terminal, Card, Phases, Faq, Tree
├── layouts/       # BaseLayout con SEO y fuentes
├── pages/         # index.astro
└── styles/        # global.css (Tailwind + fuentes)
public/            # favicon.svg, og-image.svg
```

## Despliegue

La salida es 100% estática (`dist/`), por lo que funciona en cualquier hosting:

- **Netlify**: `build: pnpm build`, `publish: dist`
- **Vercel**: framework preset "Astro"
- **GitHub Pages**: `base` en `astro.config.mjs` + action de despliegue
- **Cloudflare Pages**: `pnpm build` / `dist`

## Contenido

La información mostrada (comandos, features, fases de la skill, opciones de
CLI) está en `src/pages/index.astro`. Para actualizarla tras un release,
edita los arrays `features`, `installCommands` y `stats`.
