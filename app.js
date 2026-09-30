/**
 * Seminar Materials & Gallery Application
 * Unit IV: Password Authentication & Cryptographic Storage
 */

// Exactly 3 unique seminar slides
const seminarData = [
  {
    id: 1,
    title: 'Slide 1: Password Fundamentals',
    src: 'assets/images/sem1.png',
    filename: 'sem1.png',
    alt: 'Seminar Notes Slide 1 - Unit IV Password Fundamentals'
  },
  {
    id: 2,
    title: 'Slide 2: Password Authentication & Storage',
    src: 'assets/images/sem2.png',
    filename: 'sem2.png',
    alt: 'Seminar Notes Slide 2 - Unit IV Password Authentication & Storage'
  },
  {
    id: 3,
    title: 'Slide 3: Authentication Process Flowchart',
    src: 'assets/images/sem3.png',
    filename: 'sem3.png',
    alt: 'Seminar Notes Slide 3 - Unit IV Authentication Process Flowchart'
  }
];

let activeLightboxIndex = 0;
let isZoomed = false;

document.addEventListener('DOMContentLoaded', () => {
  initCardInteractions();
  initDownloadButtons();
  initLightbox();
});

/**
 * Initializes card click handlers for enlargement
 */
function initCardInteractions() {
  document.querySelectorAll('.seminar-card').forEach((card) => {
    const index = parseInt(card.getAttribute('data-index'), 10);
    const overlay = card.querySelector('.image-overlay');

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(index);
      });

      overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    }
  });
}

/**
 * Initializes download buttons with reliable file downloading and feedback
 */
function initDownloadButtons() {
  const downloadButtons = document.querySelectorAll('.download-btn');

  downloadButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      const src = btn.getAttribute('data-src') || btn.getAttribute('href');
      const cardId = btn.getAttribute('data-card-id') || '1';
      const filename = btn.getAttribute('data-filename') || `sem${cardId}.png`;

      await triggerDownload(src, filename, `Slide ${cardId}`);
    });
  });
}

/**
 * Triggers reliable file download via fetch/blob or anchor fallback
 */
async function triggerDownload(url, filename, label = 'Image') {
  showToast(`Starting download: ${label}...`, 'info');

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    showToast(`${label} downloaded successfully!`, 'success');
  } catch (err) {
    // Direct anchor fallback (for local file:// or CORS restrictions)
    const fallbackLink = document.createElement('a');
    fallbackLink.href = url;
    fallbackLink.download = filename;
    fallbackLink.target = '_blank';
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    document.body.removeChild(fallbackLink);

    showToast(`${label} download triggered.`, 'success');
  }
}

/**
 * Initializes accessible Lightbox modal
 */
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const prevBtn = document.getElementById('lightbox-prev-btn');
  const nextBtn = document.getElementById('lightbox-next-btn');
  const zoomToggle = document.getElementById('lightbox-zoom-toggle');
  const downloadBtn = document.getElementById('lightbox-download-btn');
  const viewport = document.getElementById('lightbox-viewport');
  const backdrop = modal ? modal.querySelector('.lightbox-backdrop') : null;

  if (!modal) return;

  // Close handlers
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

  // Download from within lightbox
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const current = seminarData[activeLightboxIndex];
      if (current) {
        await triggerDownload(current.src, current.filename, current.title);
      }
    });
  }

  // Prev / Next navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateLightbox(-1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateLightbox(1);
    });
  }

  // Zoom toggle
  if (zoomToggle && viewport) {
    zoomToggle.addEventListener('click', toggleZoom);
    viewport.addEventListener('click', (e) => {
      if (e.target.id === 'lightbox-img' || e.target === viewport) {
        toggleZoom();
      }
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!isLightboxOpen()) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      navigateLightbox(-1);
    } else if (e.key === 'ArrowRight') {
      navigateLightbox(1);
    }
  });
}

function openLightbox(index) {
  const modal = document.getElementById('lightbox-modal');
  if (!modal) return;

  activeLightboxIndex = index;
  updateLightboxContent(index);
  isZoomed = false;
  document.getElementById('lightbox-viewport')?.classList.remove('zoomed');

  modal.showModal();
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (!modal) return;

  modal.close();
  document.body.style.overflow = '';
}

function isLightboxOpen() {
  const modal = document.getElementById('lightbox-modal');
  return modal && modal.open;
}

function navigateLightbox(direction) {
  const total = seminarData.length;
  activeLightboxIndex = (activeLightboxIndex + direction + total) % total;
  isZoomed = false;
  document.getElementById('lightbox-viewport')?.classList.remove('zoomed');
  updateLightboxContent(activeLightboxIndex);
}

function updateLightboxContent(index) {
  const item = seminarData[index];
  if (!item) return;

  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const counter = document.getElementById('lightbox-counter');
  const downloadBtn = document.getElementById('lightbox-download-btn');

  if (img) {
    img.src = item.src;
    img.alt = item.alt;
  }
  if (title) title.textContent = item.title;
  if (counter) counter.textContent = `Slide ${index + 1} of ${seminarData.length}`;
  if (downloadBtn) {
    downloadBtn.setAttribute('href', item.src);
    downloadBtn.setAttribute('download', item.filename);
  }
}

function toggleZoom() {
  const viewport = document.getElementById('lightbox-viewport');
  if (!viewport) return;

  isZoomed = !isZoomed;
  viewport.classList.toggle('zoomed', isZoomed);
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}
