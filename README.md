# Garage to ADU Site

Static single-page site (Tailwind via CDN) for a garage-to-ADU service.

## Edit content
- Replace `hero-placeholder.jpg` and `gallery-*.jpg` with your photos.
- Update copy in `index.html` (hero, pricing, process, ROI).

## Contact form (Formspree)
1) Create a Formspree form and copy the form ID (e.g., `https://formspree.io/f/xxxxxx`).
2) In `index.html`, replace `your-form-id` in the form `action` URL.
3) Keep the `mailto:` fallback visible in case JavaScript is blocked.

## Deploy (Netlify)
- Drag-and-drop the `garage-adu-site/` folder into Netlify (app.netlify.com) or link a repo.
- Set publish directory to `garage-adu-site`.
- Netlify will assign a URL (you can add a custom domain).

## Deploy (GitHub Pages)
- Commit this folder to a GitHub repo.
- In repo settings → Pages → Build from branch → select `main` and `/ (root)` or `docs/` if you move files.
- Your site will be live at `https://<user>.github.io/<repo>`.
