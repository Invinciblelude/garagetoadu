/* global fetch */

// Home page gallery: pick random AFTER photos from the portfolio manifest
(function () {
  const PROJECTS_URL = 'assets/portfolio/projects.json';
  const galleryImages = document.querySelectorAll('.gallery-img');
  if (!galleryImages.length) return;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function init() {
    try {
      const inline = (typeof window !== 'undefined') ? window.PORTFOLIO_PROJECTS_MANIFEST : null;
      const dataFromInline = (inline && Array.isArray(inline.projects)) ? inline : null;

      const data = dataFromInline || await (async () => {
      const res = await fetch(PROJECTS_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      })();
      const projects = (data && Array.isArray(data.projects)) ? data.projects : [];

      const afterCandidates = [];
      projects.forEach((p) => {
        if (!p || !Array.isArray(p.pairs)) return;
        p.pairs.forEach((pair) => {
          if (pair && pair.afterSrc) {
            afterCandidates.push({
              src: pair.afterSrc,
              alt: (pair.altAfter || (p.title ? `${p.title} after` : 'Project after'))
            });
          }
        });
      });

      if (!afterCandidates.length) throw new Error('No afterSrc images in manifest');

      const picked = shuffle(afterCandidates);
      galleryImages.forEach((img, index) => {
        const item = picked[index];
        if (!item) return;
        img.src = item.src;
        img.alt = item.alt;
        img.addEventListener('error', function () {
          this.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=60';
          this.alt = 'Project photo';
        }, { once: true });
      });
    } catch (err) {
      console.error('Failed to load home gallery from manifest:', err);
      // Keep previous behavior (or empty) if manifest can't be loaded.
    }
  }

  init();
})();


