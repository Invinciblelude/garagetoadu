# Garage to ADU Site

Static single-page site (Tailwind via CDN) for a garage-to-ADU service.

## Pages
- `index.html`: Homepage (benefits, pricing, process, ROI, contact)
- `services.html`: Services (permitting, inspection, maintenance)
- `portfolio.html`: Portfolio gallery (click-to-enlarge lightbox)

## Edit content
- Update copy in `index.html` (hero, pricing, process, ROI, contact).
- Add portfolio photos to `assets/portfolio/` and update the image list in `portfolio.html`.
  - The grid and lightbox are wired to filenames like `assets/portfolio/adu-01.jpg`.
  - If a local image is missing, the page uses a clean placeholder/fallback until you add your photos.

## Portfolio gallery notes (for editors)
- Photos live under:
  - `assets/portfolio/custom-builds/`
  - `assets/portfolio/decking/`
  - `assets/portfolio/property-maintenance/`
- **Filtering** is controlled by each tile’s `data-project` attribute and the filter buttons’ `data-filter` values.
- **Lightbox** opens when a tile is clicked and supports:
  - Prev/Next buttons
  - Keyboard navigation: Left/Right arrows
  - ESC to close
- **Hero image** on `portfolio.html` is chosen randomly from the gallery tiles (`data-full`) on each page load.

## Contact form (Formspree)
1) Create a Formspree form and copy the form ID (e.g., `https://formspree.io/f/xxxxxx`).
2) In `contact.html`, replace `your-form-id` in the form `action` URL.
3) Keep the `mailto:` fallback visible in case JavaScript is blocked.

## Deploy (Netlify)
- Drag-and-drop this folder into Netlify (app.netlify.com) or link a repo.
- Set publish directory to the repo root.
- Netlify will assign a URL (you can add a custom domain).

## Deploy (GitHub Pages)
- Commit this folder to a GitHub repo.
- In repo settings → Pages → Build from branch → select `main` and `/ (root)` or `docs/` if you move files.
- Your site will be live at `https://<user>.github.io/<repo>`.
