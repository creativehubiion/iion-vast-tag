/**
 * Interactive End Card JavaScript
 * Pure vanilla JS - no dependencies
 * Touch-friendly swipeable carousel with click tracking
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION - Customize these values
  // ============================================
  var CONFIG = {
    // App Information
    appName: 'Amazing Game',
    appSubtitle: 'Free to Play',
    appRating: '4.8',
    appReviews: '125K ratings',

    // Click-through URL (App Store or Landing Page)
    clickUrl: 'https://apps.apple.com/app/amazing-game',

    // Screenshot URLs (3-4 images recommended)
    screenshots: [
      'https://cdn.example.com/screen1.jpg',
      'https://cdn.example.com/screen2.jpg',
      'https://cdn.example.com/screen3.jpg',
      'https://cdn.example.com/screen4.jpg'
    ],

    // App Icon URL
    appIcon: 'https://cdn.example.com/icon.png',

    // Tracking URL (set to empty string to disable)
    trackingUrl: 'https://tracking.example.com/pixel',

    // CTA Button Text
    ctaText: 'Install Now',

    // Auto-rotate carousel (ms, 0 to disable)
    autoRotateInterval: 4000,

    // Swipe threshold (px)
    swipeThreshold: 50
  };

  // ============================================
  // STATE
  // ============================================
  var state = {
    currentSlide: 0,
    totalSlides: 0,
    isDragging: false,
    startX: 0,
    currentX: 0,
    autoRotateTimer: null,
    trackingFired: {}
  };

  // ============================================
  // TRACKING
  // ============================================
  function track(eventName) {
    if (!CONFIG.trackingUrl || state.trackingFired[eventName]) return;

    try {
      var url = CONFIG.trackingUrl +
        '?event=' + encodeURIComponent(eventName) +
        '&cb=' + Date.now();
      var img = new Image();
      img.src = url;
      state.trackingFired[eventName] = true;
      console.log('[EndCard] Track:', eventName);
    } catch (e) {
      console.warn('[EndCard] Tracking error:', e);
    }
  }

  // ============================================
  // CLICK HANDLER
  // ============================================
  function handleClick(source) {
    track('click_' + (source || 'cta'));

    // Notify parent frame (for VAST integration)
    try {
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'clickthrough',
          action: 'cta',
          url: CONFIG.clickUrl
        }, '*');
      }
    } catch (e) {
      // Cross-origin restriction - proceed with direct open
    }

    // Open click URL
    window.open(CONFIG.clickUrl, '_blank');
  }

  // ============================================
  // CAROUSEL FUNCTIONS
  // ============================================
  function goToSlide(index) {
    var track = document.getElementById('carousel-track');
    var dots = document.querySelectorAll('.carousel-dot');

    if (!track || state.totalSlides === 0) return;

    // Wrap around
    if (index < 0) index = state.totalSlides - 1;
    if (index >= state.totalSlides) index = 0;

    state.currentSlide = index;
    track.style.transform = 'translateX(-' + (index * 100) + '%)';

    // Update dots
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === index);
    });

    track('carousel_slide_' + index);
  }

  function nextSlide() {
    goToSlide(state.currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(state.currentSlide - 1);
  }

  function startAutoRotate() {
    if (CONFIG.autoRotateInterval <= 0) return;

    stopAutoRotate();
    state.autoRotateTimer = setInterval(nextSlide, CONFIG.autoRotateInterval);
  }

  function stopAutoRotate() {
    if (state.autoRotateTimer) {
      clearInterval(state.autoRotateTimer);
      state.autoRotateTimer = null;
    }
  }

  // ============================================
  // TOUCH/DRAG HANDLERS
  // ============================================
  function onDragStart(e) {
    stopAutoRotate();
    state.isDragging = true;
    state.startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    state.currentX = state.startX;

    var track = document.getElementById('carousel-track');
    if (track) {
      track.style.transition = 'none';
    }
  }

  function onDragMove(e) {
    if (!state.isDragging) return;

    state.currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    var diff = state.currentX - state.startX;
    var baseOffset = state.currentSlide * 100;
    var dragPercent = (diff / window.innerWidth) * 100;

    var track = document.getElementById('carousel-track');
    if (track) {
      track.style.transform = 'translateX(' + (-baseOffset + dragPercent) + '%)';
    }
  }

  function onDragEnd() {
    if (!state.isDragging) return;
    state.isDragging = false;

    var track = document.getElementById('carousel-track');
    if (track) {
      track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }

    var diff = state.currentX - state.startX;

    if (Math.abs(diff) > CONFIG.swipeThreshold) {
      if (diff > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    } else {
      goToSlide(state.currentSlide);
    }

    // Restart auto-rotate after interaction
    setTimeout(startAutoRotate, 2000);
  }

  // ============================================
  // BUILD UI
  // ============================================
  function buildCarousel() {
    var container = document.getElementById('carousel-track');
    var dotsContainer = document.getElementById('carousel-dots');

    if (!container || !dotsContainer) return;

    state.totalSlides = CONFIG.screenshots.length;

    // Build slides
    CONFIG.screenshots.forEach(function(url, index) {
      var slide = document.createElement('div');
      slide.className = 'carousel-slide';

      var img = document.createElement('img');
      img.src = url;
      img.alt = 'Screenshot ' + (index + 1);
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.onerror = function() {
        // Fallback placeholder on error
        this.src = 'data:image/svg+xml,' + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">' +
          '<rect fill="#333" width="300" height="200"/>' +
          '<text fill="#666" font-family="sans-serif" font-size="14" x="150" y="100" text-anchor="middle">Screenshot ' + (index + 1) + '</text>' +
          '</svg>'
        );
      };

      slide.appendChild(img);
      container.appendChild(slide);

      // Build dots
      var dot = document.createElement('button');
      dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (index + 1));
      dot.onclick = function() {
        stopAutoRotate();
        goToSlide(index);
        setTimeout(startAutoRotate, 2000);
      };
      dotsContainer.appendChild(dot);
    });
  }

  function setAppInfo() {
    var nameEl = document.getElementById('app-name');
    var subtitleEl = document.getElementById('app-subtitle');
    var ratingTextEl = document.getElementById('rating-text');
    var iconEl = document.getElementById('app-icon-img');
    var ctaEl = document.getElementById('cta-text');

    if (nameEl) nameEl.textContent = CONFIG.appName;
    if (subtitleEl) subtitleEl.textContent = CONFIG.appSubtitle;
    if (ratingTextEl) ratingTextEl.textContent = CONFIG.appRating + ' (' + CONFIG.appReviews + ')';
    if (ctaEl) ctaEl.innerHTML = '<span class="cta-icon">&#x2B07;</span> ' + CONFIG.ctaText;

    if (iconEl && CONFIG.appIcon) {
      iconEl.src = CONFIG.appIcon;
      iconEl.onerror = function() {
        // Hide icon on error, show placeholder
        this.style.display = 'none';
      };
    }
  }

  function bindEvents() {
    var track = document.getElementById('carousel-track');
    var prevBtn = document.getElementById('carousel-prev');
    var nextBtn = document.getElementById('carousel-next');
    var ctaBtn = document.getElementById('cta-button');
    var container = document.querySelector('.endcard-container');

    // Touch events for carousel
    if (track) {
      track.addEventListener('touchstart', onDragStart, { passive: true });
      track.addEventListener('touchmove', onDragMove, { passive: true });
      track.addEventListener('touchend', onDragEnd);

      // Mouse events for desktop testing
      track.addEventListener('mousedown', onDragStart);
      track.addEventListener('mousemove', onDragMove);
      track.addEventListener('mouseup', onDragEnd);
      track.addEventListener('mouseleave', onDragEnd);
    }

    // Arrow buttons
    if (prevBtn) {
      prevBtn.onclick = function() {
        stopAutoRotate();
        prevSlide();
        setTimeout(startAutoRotate, 2000);
      };
    }
    if (nextBtn) {
      nextBtn.onclick = function() {
        stopAutoRotate();
        nextSlide();
        setTimeout(startAutoRotate, 2000);
      };
    }

    // CTA Button
    if (ctaBtn) {
      ctaBtn.onclick = function(e) {
        e.preventDefault();
        handleClick('cta');
      };
    }

    // Click anywhere on container (optional - remove if you only want CTA clicks)
    if (container) {
      container.addEventListener('click', function(e) {
        // Only handle if not clicking on interactive elements
        if (e.target.closest('.carousel-dot, .carousel-arrow, #cta-button')) return;
        // Optional: track background click but don't navigate
        track('background_click');
      });
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    // Allow URL params to override config (for testing)
    var params = new URLSearchParams(window.location.search);
    if (params.get('clickUrl')) CONFIG.clickUrl = params.get('clickUrl');
    if (params.get('appName')) CONFIG.appName = params.get('appName');

    setAppInfo();
    buildCarousel();
    bindEvents();
    startAutoRotate();

    // Fire view tracking
    track('endcard_view');

    // Fire load complete
    track('endcard_loaded');

    console.log('[EndCard] Initialized', CONFIG.appName);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose config for external updates
  window.EndCardConfig = CONFIG;
  window.EndCardHandleClick = handleClick;

})();
