// Load shared header and set active navigation state
(function() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (!headerPlaceholder) return;

  fetch('assets/header.html')
    .then(response => response.text())
    .then(html => {
      headerPlaceholder.innerHTML = html;
      
      // Determine current page from pathname.
      // Supports direct file access (/services.html) and root (/index.html).
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      let currentPage = (pathParts[pathParts.length - 1] || 'index');
      currentPage = currentPage.replace(/\.html$/i, '');
      if (!currentPage || currentPage === 'index') currentPage = 'index';
      
      // Set active state for current page (desktop nav)
      const navLinks = headerPlaceholder.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        if (linkPage === currentPage) {
          link.classList.add('underline', 'underline-offset-4', 'decoration-white/70');
          link.classList.remove('hover:underline');
        }
      });
      
      // Set active state for mobile nav
      const mobileNavLinks = headerPlaceholder.querySelectorAll('.nav-link-mobile');
      mobileNavLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        if (linkPage === currentPage) {
          link.classList.add('text-green-400', 'font-semibold');
        }
      });
      
      // Mobile menu toggle functionality
      const mobileMenuToggle = headerPlaceholder.querySelector('#mobileMenuToggle');
      const mobileMenu = headerPlaceholder.querySelector('#mobileMenu');
      const menuIcon = headerPlaceholder.querySelector('#menuIcon');
      const closeIcon = headerPlaceholder.querySelector('#closeIcon');
      
      if (mobileMenuToggle && mobileMenu && menuIcon && closeIcon) {
        mobileMenuToggle.addEventListener('click', (e) => {
          // Prevent any parent click handlers from interfering (and avoid accidental form submits)
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

          const isOpen = !mobileMenu.classList.contains('hidden');
          
          if (isOpen) {
            // Close menu
            mobileMenu.classList.add('hidden');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
          } else {
            // Open menu
            mobileMenu.classList.remove('hidden');
            menuIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            mobileMenuToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
          }
        });
        
        // Close menu when clicking on a link
        mobileNavLinks.forEach(link => {
          link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
          });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
          if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            if (!mobileMenu.classList.contains('hidden')) {
              mobileMenu.classList.add('hidden');
              menuIcon.classList.remove('hidden');
              closeIcon.classList.add('hidden');
              mobileMenuToggle.setAttribute('aria-expanded', 'false');
              document.body.style.overflow = '';
            }
          }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
          }
        });
      }
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

