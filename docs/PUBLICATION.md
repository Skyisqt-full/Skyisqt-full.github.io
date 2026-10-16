# Public content

This repository contains the portfolio frontend, its build and verification scripts, self-hosted Onest fonts, contact QR codes and final processed screenshots.

The commercial SCADA and industrial marking source code is not distributed here. Product screenshots show isolated demonstrations with synthetic data. Marking identifiers and the Inspector address field are masked in the final images. Prototype screenshot origins are recorded in adjacent JSON files; Onest is distributed under its included SIL Open Font License.

Raw captures, commercial repositories, environment files, databases, private review documents, local demo infrastructure and generated archives are excluded by the root publication allowlist in `.gitignore`. The production build needs only tracked files.

Before publishing changes, inspect `git diff --cached`, review any changed images, run `npm run audit:output`, and scan the staged export with Gitleaks. Check the built HTML and any new assets for private data as well as credentials. Synthetic data is not a substitute for reviewing images.
