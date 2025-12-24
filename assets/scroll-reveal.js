// Scroll reveal animation utility
(function() {
  // Check if IntersectionObserver is supported
  if (!('IntersectionObserver' in window)) {
    return; // Fallback: elements will just appear normally
  }

  // Safety fallback: never leave the page invisible if observers don't fire for any reason.
  // (Some environments can delay/disable IntersectionObserver callbacks.)
  const FAILSAFE_MS = 1200;

  // Create observer with options
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
        entry.target.classList.remove('opacity-0', 'translate-y-4');
        // Stop observing once animated
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Function to initialize scroll reveal
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => {
      // Set initial state
      el.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-700', 'ease-out');
      observer.observe(el);
    });

    // Failsafe: if anything is still hidden after a short delay, show it.
    window.setTimeout(() => {
      revealElements.forEach((el) => {
        if (el.classList.contains('opacity-0')) {
          el.classList.add('opacity-100', 'translate-y-0');
          el.classList.remove('opacity-0', 'translate-y-4');
        }
      });
    }, FAILSAFE_MS);
  }

  // Initialize immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    initScrollReveal();
  }
})();
