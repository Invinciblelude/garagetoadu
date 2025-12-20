# Changelog

All notable changes to this project will be documented in this file.

## [2024-12-19] - Website Enhancements

### Added
- **Scroll reveal animations**: Added fade-in and slide-up animations to sections across all pages using Intersection Observer API
  - Created `assets/scroll-reveal.js` utility for reusable scroll animations
  - Applied animations to sections, service cards, gallery items, and CTA sections
  - Works on both desktop and mobile devices

- **Mobile hamburger menu**: Implemented responsive mobile navigation menu
  - Hamburger button appears on mobile devices (hidden on desktop)
  - Slide-down menu with smooth animations
  - Closes on outside click, link click, or Escape key press
  - Proper ARIA attributes for accessibility

- **Portfolio gallery swipe navigation**: Added touch swipe support for mobile devices
  - Swipe left to go to next image, swipe right for previous
  - 50px swipe threshold to prevent accidental navigation
  - Prevents vertical scrolling during horizontal swipes
  - Keyboard navigation (arrow keys) still works

- **Contact form enhancements**:
  - Service selection checkboxes (8 services: Permitting, Basic house inspection, Home maintenance, Custom home building, Decking, Property management, Painting & siding, Fencing)
  - Timing/urgency dropdown with 4 options (Emergency, Urgent, Standard, Flexible)
  - Form validation ensures at least one service is selected and timing is chosen
  - Selected services formatted as readable text in form submission
  - Timing included in form subject line for Formspree

### Changed
- **Navbar color**: Changed navbar background from `bg-green-700` (dark green) to `bg-slate-800` (dark slate) for better visual contrast with green hero sections
  - Updated header background classes across all HTML pages
  - Maintains white text for proper contrast

### Technical Details
- All enhancements are mobile-responsive and accessible
- Scroll animations use Intersection Observer API with fallback for older browsers
- Mobile menu uses fixed positioning and proper z-index layering
- Touch swipe detection uses touchstart/touchmove/touchend events
- Form enhancements integrate seamlessly with existing Formspree backend
