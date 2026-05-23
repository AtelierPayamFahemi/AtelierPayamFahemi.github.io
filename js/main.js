/* ═══════════════════════════════════════════
   main.js — PayamFahemiPortfolio
═══════════════════════════════════════════ */

/* TODO: No active JS logic needed for the homepage yet.
   Add your scripts below as pages grow.

   Examples of future additions:
   - Smooth page transitions
   - Video lazy-load triggers
   - Active nav-link detection based on current page
*/

// Auto-highlight the active nav link based on current page filename
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});
document.querySelectorAll('.nav-item').forEach(item => {
  const preview = item.querySelector('.nav-preview');
  if (!preview) return;

  let hideTimeout;

  const show = () => {
    clearTimeout(hideTimeout);
    preview.style.opacity = '1';
  };

  const hide = () => {
    hideTimeout = setTimeout(() => {
      preview.style.opacity = '0';
    }, 100); // small delay prevents flicker during mouse travel
  };

  item.addEventListener('mouseenter', show);
  item.addEventListener('mouseleave', hide);
  preview.addEventListener('mouseenter', show);
  preview.addEventListener('mouseleave', hide);
});
