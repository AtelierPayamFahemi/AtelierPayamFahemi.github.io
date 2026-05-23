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

  item.addEventListener('mouseenter', () => {
    preview.style.opacity = '1';
  });

  item.addEventListener('mouseleave', (e) => {
    // only hide if mouse is NOT moving to the preview itself
    if (!preview.contains(e.relatedTarget)) {
      preview.style.opacity = '0';
    }
  });

  preview.addEventListener('mouseleave', () => {
    preview.style.opacity = '0';
  });
});
