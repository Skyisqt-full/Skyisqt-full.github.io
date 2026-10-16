# Artem — Portfolio

Personal product / full-stack portfolio: commercial WEB SCADA, an industrial marking platform and five selected product prototypes. Russian and English, detailed case studies, a portrait pitch and offline PWA support.

**Live:** [skyisqt-full.github.io](https://skyisqt-full.github.io/)

## Development

Node.js 22 LTS and npm. No frontend framework or application server.

```sh
npm ci
npm run dev
```

Open the local address printed by the preview server.

## Build

```sh
npm run build
npm run audit:output
```

The static site is written to `dist/`. Pushes to `main` build, verify and deploy through GitHub Actions to GitHub Pages.

See [deployment and browser checks](docs/DEPLOYMENT.md) and [public content boundaries](docs/PUBLICATION.md). Commercial application source code and raw working captures are excluded.
