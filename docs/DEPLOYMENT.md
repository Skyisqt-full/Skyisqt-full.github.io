# Deployment

The site is static HTML, CSS and JavaScript, built with Node.js 22 LTS and npm. GitHub Pages serves `dist`; no application server or commercial backend is required.

`src/config/profile.mjs` is the source for the public URL and contact destinations. Set `PUBLIC_PORTFOLIO_URL` to the complete HTTPS site URL with a trailing slash when moving the site. Canonical and social metadata are generated from it. Assets, the manifest and the service worker use relative paths. Case studies and pitch cards use hash routes, so direct links and reloads work on static hosting.

Pushes to `main` run `.github/workflows/deploy-pages.yml`: deterministic dependency installation, build, output audit, Chromium regression checks, Pages artifact upload and deployment. In repository Settings → Pages, the source is GitHub Actions. Only the deployment job receives Pages and OIDC write permissions. Deployments are serialized.

For local verification:

```sh
npm ci
npx playwright install chromium
npm run export:cards
npm run audit:output
npm test
npm run test:production -- https://skyisqt-full.github.io/
```

The export command creates temporary RU/EN card images needed by regression checks. Generated output is ignored. It does not belong in the public source tree.

After deployment, verify the workflow conclusion, the public URL, both languages, direct case links, images, contact QR codes and service-worker offline reloads. A failed build or browser regression blocks deployment. If a release breaks an essential flow, revert that commit and let the same workflow redeploy the previous source. The service-worker cache changes with the built content and removes older portfolio caches on activation.
