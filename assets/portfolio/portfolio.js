/* global fetch */

// Portfolio renderer: before/after pairs grouped by project + category filtering + pair lightbox
(function () {
  const PROJECTS_URL = 'assets/portfolio/projects.json';

  const container = document.getElementById('portfolioProjects');
  const filters = Array.from(document.querySelectorAll('.pf-filter'));

  const lightbox = document.getElementById('lightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxBeforeImg = document.getElementById('lightboxBeforeImg');
  const lightboxAfterImg = document.getElementById('lightboxAfterImg');
  const lightboxBeforeLabel = document.getElementById('lightboxBeforeLabel');
  const lightboxAfterLabel = document.getElementById('lightboxAfterLabel');

  if (!container) return;

  let lastFocused = null;
  let activeFilter = 'all';
  const swipeThreshold = 50;
  let touchStartX = 0;
  let touchStartY = 0;

  /** @type {{projects: Array<{id: string, title: string, category: string, location?: string, pairs: Array<{label?: string, beforeSrc: string, afterSrc: string, altBefore?: string, altAfter?: string}>}>} | null} */
  let manifest = null;

  /** @type {Array<{projectId: string, pairIndex: number}>} */
  let openPairs = [];
  let openIndex = -1;

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeCategoryLabel(category) {
    if (category === 'custom-builds') return 'Custom Builds';
    if (category === 'decking') return 'Decking';
    if (category === 'property-maintenance') return 'Property Maintenance';
    if (category === 'home-improvement') return 'Home Improvements';
    return category || 'Project';
  }

  function getFilteredProjects() {
    const projects = (manifest && manifest.projects) ? manifest.projects : [];
    if (activeFilter === 'all') return projects;
    return projects.filter((p) => p && p.category === activeFilter);
  }

  function renderProjects(projects) {
    const list = Array.isArray(projects) ? projects : [];

    if (!list.length) {
      container.innerHTML = `
        <div class="p-6 border rounded-lg bg-slate-50 text-slate-700">
          <div class="font-semibold">No portfolio projects yet.</div>
          <div class="mt-2 text-sm">
            Add projects and before/after pairs to
            <code class="px-1 py-0.5 rounded bg-white border">assets/portfolio/projects.json</code>.
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map((project) => {
      const title = escapeHtml(project.title || 'Project');
      const location = escapeHtml(project.location || '');
      const category = escapeHtml(project.category || '');
      const categoryLabel = escapeHtml(safeCategoryLabel(project.category));
      const pid = escapeHtml(project.id || '');
      const pairs = Array.isArray(project.pairs) ? project.pairs : [];
      const singles = Array.isArray(project.singles) ? project.singles : [];

      const pairsHtml = pairs.map((pair, idx) => {
        const beforeSrc = escapeHtml(pair.beforeSrc);
        const afterSrc = escapeHtml(pair.afterSrc);
        const label = escapeHtml(pair.label || `Pair ${idx + 1}`);
        const altBefore = escapeHtml(pair.altBefore || `${title} before`);
        const altAfter = escapeHtml(pair.altAfter || `${title} after`);
        const status = String(pair.status || '');
        const note = status === 'completed'
          ? 'Completed project – final photos.'
          : 'In progress or example finish; final results may vary.';
        const badge = status === 'completed'
          ? '<span class="ml-2 inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold">Completed</span>'
          : '';

        return `
          <div class="pf-pair mt-4" data-project-id="${pid}" data-pair-index="${idx}">
            <div class="text-sm font-semibold text-slate-800">${label}${badge}</div>
            <p class="text-xs text-slate-500 mt-1">${escapeHtml(note)}</p>
            <div class="mt-2 grid grid-cols-2 gap-3">
              <button type="button"
                class="pf-pair-img group rounded-lg overflow-hidden border bg-white focus:outline-none focus:ring-2 focus:ring-green-700/60"
                data-role="before"
                data-project-id="${pid}"
                data-pair-index="${idx}">
                <div class="px-3 py-2 border-b text-xs font-semibold text-slate-600 bg-slate-50">Before</div>
                <div class="w-full aspect-[5/4]">
                  <img src="${beforeSrc}" alt="${altBefore}" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" loading="lazy" />
                </div>
              </button>
              <button type="button"
                class="pf-pair-img group rounded-lg overflow-hidden border bg-white focus:outline-none focus:ring-2 focus:ring-green-700/60"
                data-role="after"
                data-project-id="${pid}"
                data-pair-index="${idx}">
                <div class="px-3 py-2 border-b text-xs font-semibold text-slate-600 bg-slate-50">After</div>
                <div class="w-full aspect-[5/4]">
                  <img src="${afterSrc}" alt="${altAfter}" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" loading="lazy" />
                </div>
              </button>
            </div>
          </div>
        `;
      }).join('');

      const singlesHtml = singles.map((item, idx) => {
        const src = escapeHtml(item.src);
        const label = escapeHtml(item.label || `Photo ${idx + 1}`);
        const alt = escapeHtml(item.alt || `${title} photo`);
        const status = String(item.status || '');
        const note = status === 'completed'
          ? 'Completed project – final photos.'
          : 'Example photo; final results may vary.';
        const badge = status === 'completed'
          ? '<span class="ml-2 inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold">Completed</span>'
          : '';

        // For singles, reuse the pair lightbox navigation by treating each single as a "pair" with only an after image:
        // we store it as a clickable tile with data-project-id and data-pair-index, but the lightbox expects before+after.
        // Instead, singles open in a new tab for now (simple + honest).
        return `
          <div class="mt-4">
            <div class="text-sm font-semibold text-slate-800">${label}${badge}</div>
            <p class="text-xs text-slate-500 mt-1">${escapeHtml(note)}</p>
            <a href="${src}" target="_blank" rel="noopener noreferrer" class="group block mt-2 rounded-lg overflow-hidden border bg-white focus:outline-none focus:ring-2 focus:ring-green-700/60">
              <div class="w-full aspect-[5/4]">
                <img src="${src}" alt="${alt}" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" loading="lazy" />
              </div>
            </a>
          </div>
        `;
      }).join('');

      return `
        <section class="pf-project mt-6 rounded-lg border bg-white p-5" data-project="${category}">
          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <div class="text-xs uppercase tracking-wide text-slate-500">${categoryLabel}${location ? ` • ${location}` : ''}</div>
              <h3 class="mt-1 text-xl font-bold">${title}</h3>
            </div>
          </div>
          ${pairsHtml}${singlesHtml}${(!pairsHtml && !singlesHtml) ? '<div class="mt-3 text-sm text-slate-600">No items added yet.</div>' : ''}
        </section>
      `;
    }).join('');
  }

  function setActiveFilter(filter) {
    activeFilter = filter || 'all';

    filters.forEach((btn) => {
      const isActive = btn.getAttribute('data-filter') === activeFilter;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.classList.toggle('bg-green-700', isActive);
      btn.classList.toggle('text-white', isActive);
      btn.classList.toggle('border-green-700', isActive);
      btn.classList.toggle('hover:bg-slate-50', !isActive);
    });

    // If manifest hasn't loaded yet, don't show any empty/error UI.
    if (!manifest) return;

    // Re-render from manifest to avoid any stale hidden state and make "All" reliable.
    const filtered = getFilteredProjects();

    // If the site has projects but this category has none yet, show a subtle empty state (no error box).
    if (Array.isArray(manifest.projects) && manifest.projects.length > 0 && filtered.length === 0) {
      container.innerHTML = '<div class="mt-6 text-sm text-slate-500">No items in this category yet.</div>';
      return;
    }

    renderProjects(filtered);
  }

  function getPair(projectId, pairIndex) {
    if (!manifest || !Array.isArray(manifest.projects)) return null;
    const project = manifest.projects.find((p) => p && p.id === projectId);
    if (!project || !Array.isArray(project.pairs)) return null;
    return {
      project,
      pair: project.pairs[pairIndex],
      pairIndex
    };
  }

  function buildOpenPairsFromVisible() {
    const visibleProjects = Array.from(container.querySelectorAll('.pf-project:not(.hidden)'));
    const visiblePairs = [];
    visibleProjects.forEach((projEl) => {
      Array.from(projEl.querySelectorAll('.pf-pair')).forEach((pairEl) => {
        const pid = pairEl.getAttribute('data-project-id');
        const idx = Number(pairEl.getAttribute('data-pair-index'));
        if (pid && Number.isFinite(idx)) visiblePairs.push({ projectId: pid, pairIndex: idx });
      });
    });
    openPairs = visiblePairs;
  }

  function setLightboxPair(projectId, pairIndex) {
    if (!lightboxBeforeImg || !lightboxAfterImg) return false;

    const resolved = getPair(projectId, pairIndex);
    if (!resolved || !resolved.pair) return false;

    const { project, pair } = resolved;
    const title = project.title || 'Project';
    const label = pair.label ? ` • ${pair.label}` : '';

    if (lightboxTitle) lightboxTitle.textContent = `${title}${label}`;
    if (lightboxBeforeLabel) lightboxBeforeLabel.textContent = 'Before';
    if (lightboxAfterLabel) lightboxAfterLabel.textContent = 'After';

    lightboxBeforeImg.src = pair.beforeSrc;
    lightboxBeforeImg.alt = pair.altBefore || `${title} before`;
    lightboxAfterImg.src = pair.afterSrc;
    lightboxAfterImg.alt = pair.altAfter || `${title} after`;

    return true;
  }

  function syncLightboxNav() {
    const hasMany = openPairs.length > 1;
    if (lightboxPrev) lightboxPrev.disabled = !hasMany;
    if (lightboxNext) lightboxNext.disabled = !hasMany;
  }

  function openLightbox(projectId, pairIndex, focusEl) {
    if (!lightbox) return;

    buildOpenPairsFromVisible();
    openIndex = openPairs.findIndex((p) => p.projectId === projectId && p.pairIndex === pairIndex);
    if (openIndex < 0) openIndex = 0;

    const ok = setLightboxPair(openPairs[openIndex].projectId, openPairs[openIndex].pairIndex);
    if (!ok) return;

    lastFocused = focusEl || document.activeElement;
    lightbox.classList.remove('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
    syncLightboxNav();

    // Reset touch positions
    touchStartX = 0;
    touchStartY = 0;
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.add('hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lightboxBeforeImg) lightboxBeforeImg.src = '';
    if (lightboxAfterImg) lightboxAfterImg.src = '';
    if (lightboxTitle) lightboxTitle.textContent = 'Preview';

    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    lastFocused = null;

    openPairs = [];
    openIndex = -1;
  }

  function goLightbox(delta) {
    if (!lightbox || lightbox.classList.contains('hidden')) return;
    if (!openPairs.length) return;
    openIndex = (openIndex + delta + openPairs.length) % openPairs.length;
    const item = openPairs[openIndex];
    if (!item) return;
    setLightboxPair(item.projectId, item.pairIndex);
    syncLightboxNav();
  }

  function attachEvents() {
    filters.forEach((btn) => {
      btn.addEventListener('click', () => setActiveFilter(btn.getAttribute('data-filter') || 'all'));
    });

    container.addEventListener('click', (e) => {
      const target = e.target && e.target.closest ? e.target.closest('.pf-pair-img') : null;
      if (!target) return;
      const pid = target.getAttribute('data-project-id');
      const idx = Number(target.getAttribute('data-pair-index'));
      if (!pid || !Number.isFinite(idx)) return;
      openLightbox(pid, idx, target);
    });

    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => goLightbox(-1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => goLightbox(1));

    // Graceful fallback if a lightbox image is missing
    function attachLightboxImgFallback(imgEl, labelText) {
      if (!imgEl) return;
      imgEl.addEventListener('error', () => {
        if (imgEl.src && imgEl.src.startsWith('data:image/svg+xml')) return;
        imgEl.alt = `${labelText} image not found. Check assets/portfolio/projects.json paths.`;
        imgEl.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#0f766e"/><stop offset="1" stop-color="#16a34a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><g fill="white" font-family="system-ui,-apple-system,Segoe UI,Roboto" text-anchor="middle"><text x="600" y="380" font-size="40" font-weight="700">Image not found</text><text x="600" y="440" font-size="22" opacity="0.9">Verify beforeSrc/afterSrc in projects.json</text></g></svg>'
        );
      });
    }
    attachLightboxImgFallback(lightboxBeforeImg, 'Before');
    attachLightboxImgFallback(lightboxAfterImg, 'After');

    // Touch swipe for mobile (navigate pairs)
    const imageContainer = document.getElementById('lightboxImageContainer');
    if (imageContainer) {
      imageContainer.addEventListener('touchstart', (e) => {
        if (!lightbox || lightbox.classList.contains('hidden')) return;
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      imageContainer.addEventListener('touchmove', (e) => {
        if (!lightbox || lightbox.classList.contains('hidden')) return;
        const deltaX = Math.abs(e.changedTouches[0].screenX - touchStartX);
        const deltaY = Math.abs(e.changedTouches[0].screenY - touchStartY);
        if (deltaX > deltaY && deltaX > 10) e.preventDefault();
      }, { passive: false });

      imageContainer.addEventListener('touchend', (e) => {
        if (!lightbox || lightbox.classList.contains('hidden')) return;
        const endX = e.changedTouches[0].screenX;
        const endY = e.changedTouches[0].screenY;
        const deltaX = endX - touchStartX;
        const deltaY = Math.abs(endY - touchStartY);

        if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > deltaY) {
          if (deltaX > 0) goLightbox(-1);
          else goLightbox(1);
        }
        touchStartX = 0;
        touchStartY = 0;
      }, { passive: true });
    }

    document.addEventListener('keydown', (e) => {
      if (!lightbox || lightbox.classList.contains('hidden')) return;
      if (e.key === 'Escape') {
        closeLightbox();
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'Left') {
        e.preventDefault();
        goLightbox(-1);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'Right') {
        e.preventDefault();
        goLightbox(1);
      }
    });
  }

  function showLoadError(message) {
    container.innerHTML = `
      <div class="p-6 border rounded-lg bg-slate-50 text-slate-700">
        <div class="font-semibold">Could not load portfolio projects.</div>
        <div class="mt-2 text-sm">${escapeHtml(message)}</div>
      </div>
    `;
  }

  async function init() {
    attachEvents();
    // Default button state before the manifest loads
    setActiveFilter('all');

    try {
      const inline = (typeof window !== 'undefined') ? window.PORTFOLIO_PROJECTS_MANIFEST : null;
      if (inline && Array.isArray(inline.projects)) {
        manifest = inline;
        setActiveFilter(activeFilter);
        return;
      }

      const res = await fetch(PROJECTS_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || !Array.isArray(data.projects)) throw new Error('Invalid manifest format');
      manifest = data;
      // Render using current filter (default is all)
      setActiveFilter(activeFilter);
    } catch (err) {
      console.error('Failed to load portfolio manifest:', err);
      showLoadError('Could not load projects. If you are opening files directly, use a local web server or ensure projects-data.js is loaded.');
    }
  }

  init();
})();


