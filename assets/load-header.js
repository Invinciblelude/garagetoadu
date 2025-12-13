// Load shared header and set active navigation state
(function() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (!headerPlaceholder) return;

  fetch('assets/header.html')
    .then(response => response.text())
    .then(html => {
      headerPlaceholder.innerHTML = html;
      
      // Determine current page from filename
      let currentPage = window.location.pathname.split('/').pop() || '';
      currentPage = currentPage.replace('.html', '').replace('index', '');
      if (!currentPage || currentPage === '') currentPage = 'index';
      
      // Set active state for current page
      const navLinks = headerPlaceholder.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        if (linkPage === currentPage) {
          link.classList.add('underline', 'underline-offset-4', 'decoration-white/70');
          link.classList.remove('hover:underline');
        }
      });
    })
    .catch(err => {
      console.error('Failed to load header:', err);
      // Fallback: show basic header if fetch fails
      headerPlaceholder.innerHTML = `
        <div class="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <a href="index.html" class="flex items-center gap-2 text-xl font-bold hover:opacity-90">
            <img src="assets/logo.png" alt="Home Riser Fix" class="h-6 w-6" />
            <span>Home Riser Fix</span>
          </a>
          <div class="hidden md:flex items-center gap-6 text-sm">
            <a href="who-we-are.html" class="hover:underline">Who we are</a>
            <a href="services.html" class="hover:underline">Services</a>
            <a href="portfolio.html" class="hover:underline">Portfolio</a>
            <a href="contact.html" class="hover:underline">Contact Us</a>
          </div>
        </div>
      `;
    });
})();

