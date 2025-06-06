// ═══════════════════ ENHANCED TYPING ANIMATION ═══════════════════
const fullName = 'Junseok Joon Kang';
const typedEl = document.getElementById('typed');
let idx = 0;
const typingSpeed = 120;
const cursorSpeed = 530;

function typeChar() {
  if (idx < fullName.length) {
    typedEl.textContent += fullName[idx++];
    setTimeout(typeChar, typingSpeed + Math.random() * 50); // Add slight variation
  } else {
    setTimeout(transition, 800);
  }
}

// ═══════════════════ ENHANCED POPUP SYSTEM ═══════════════════
document.addEventListener('click', e => {
if (e.target.matches('.show-more-btn')) {
    const popup = e.target.nextElementSibling;
    const isActive = popup.classList.contains('active');
    
    // Close all other popups
    document.querySelectorAll('.popup.active').forEach(p => {
      p.classList.remove('active');
    });
    
    // Toggle current popup
    if (!isActive) {
      popup.classList.add('active');
    }
    
    e.stopPropagation();
  } else {
    // Close all popups when clicking elsewhere
    document.querySelectorAll('.popup.active').forEach(p => {
      p.classList.remove('active');
    });
  }
});

// Close popups on Escape key
document.addEventListener('keyup', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.popup.active').forEach(p => {
      p.classList.remove('active');
    });
  }
});

// ═══════════════════ ENHANCED EXPAND/COLLAPSE ═══════════════════
function showFull() {
  const entries = document.querySelectorAll('.timeline .entry');
  const trigger = document.querySelector('.expand-trigger');
  const isCurrentlyExpanded = trigger.textContent.trim() === 'Show Less';
  
  entries.forEach((el, i) => {
    if (!isCurrentlyExpanded && i >= 3) { // If currently collapsed, show more entries
      el.style.display = 'flex';
      setTimeout(() => {
        el.style.opacity = '1';
      }, (i - 3) * 100); // Stagger animation for newly shown entries
    } else if (isCurrentlyExpanded && i >= 3) { // If currently expanded, hide extra entries
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.display = 'none';
      }, 200);
    }
  });
  
  // Update button text
  trigger.textContent = isCurrentlyExpanded ? 'Show More' : 'Show Less';
  trigger.setAttribute('aria-expanded', !isCurrentlyExpanded);
}

// ═══════════════════ SMOOTH TRANSITION ANIMATION ═══════════════════
function transition() {
  const introNameEl = document.querySelector('.intro-name');
  const headerNameEl = document.querySelector('header .name');
  const introEl = document.getElementById('intro');
  
  if (!introNameEl || !headerNameEl || !introEl) return;
  
  // First, make header name invisible but take up space for measurement
  headerNameEl.style.opacity = '0';
  headerNameEl.style.visibility = 'visible';
  
  // Force layout calculation
  setTimeout(() => {
    // Get positions after layout
    const introRect = introNameEl.getBoundingClientRect();
    const headerRect = headerNameEl.getBoundingClientRect();
    
    // Hide header name again during transition
    headerNameEl.style.visibility = 'hidden';
    headerNameEl.style.opacity = '0';
    
    // Calculate exact movement needed
    const deltaX = headerRect.left - introRect.left;
    const deltaY = headerRect.top - introRect.top;
    const scaleX = headerRect.width / introRect.width;
    const scaleY = headerRect.height / introRect.height;
    
    // Apply initial position
    introNameEl.style.position = 'fixed';
    introNameEl.style.top = introRect.top + 'px';
    introNameEl.style.left = introRect.left + 'px';
    introNameEl.style.transformOrigin = 'left top';
    introNameEl.style.zIndex = '1001';
    
    // Start the transition
    requestAnimationFrame(() => {
      introNameEl.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
      introNameEl.style.transition = 'transform 1.6s cubic-bezier(0.25, 0.1, 0.25, 1)';
    });
    
    // Reveal header name after transition completes
    setTimeout(() => {
      headerNameEl.style.visibility = 'visible';
      headerNameEl.style.opacity = '1';
      
      // Start fading out intro
      introEl.style.transition = 'opacity 0.8s ease-out, backdrop-filter 0.8s ease-out';
      introEl.style.opacity = '0';
      introEl.style.backdropFilter = 'blur(20px)';
      
      // Remove intro completely
      setTimeout(() => {
        introEl.remove();
        
        // Trigger section animations
        document.querySelectorAll('section').forEach((section, i) => {
          section.style.animationDelay = `${i * 0.1}s`;
          section.classList.add('fade-in');
        });
      }, 800);
    }, 1600);
  }, 50); // Small delay to ensure layout calculation
}

// ═══════════════════ SCROLL ANIMATIONS ═══════════════════
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// ═══════════════════ MOBILE NAVIGATION ═══════════════════
function toggleMobileNav() {
  const nav = document.getElementById('side-nav');
  nav.classList.toggle('mobile-open');
}

// ═══════════════════ KEYBOARD NAVIGATION ═══════════════════
document.addEventListener('keydown', e => {
  // Alt + number for quick navigation
  if (e.altKey && e.key >= '1' && e.key <= '9') {
    e.preventDefault();
    const links = document.querySelectorAll('#side-nav a');
    const index = parseInt(e.key) - 1;
    if (links[index]) {
      links[index].click();
    }
  }
});

// ═══════════════════ SMOOTH SCROLLING ═══════════════════
document.querySelectorAll('#side-nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ═══════════════════ PERFORMANCE OPTIMIZATIONS ═══════════════════
// Lazy load images
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('loading');
      imageObserver.unobserve(img);
    }
  });
});

// ═══════════════════ INITIALIZATION ═══════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Start typing animation
  typeChar();
  
  // Initialize expand/collapse - start collapsed
  const entries = document.querySelectorAll('.timeline .entry');
  const trigger = document.querySelector('.expand-trigger');
  
  // Initially hide entries beyond first 3
  entries.forEach((el, i) => {
    if (i >= 3) {
      el.style.display = 'none';
      el.style.opacity = '0';
    }
  });
  
  // Set initial button text - should say "Show More" when collapsed
  if (trigger) {
    trigger.textContent = 'Show More';
    trigger.setAttribute('aria-expanded', 'false');
  }
  
  // Setup intersection observers
  document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
  });
  
  // Setup lazy loading for images
  document.querySelectorAll('img[data-src]').forEach(img => {
    img.classList.add('loading');
    imageObserver.observe(img);
  });
  
  // Add loading states
  document.body.classList.add('loaded');
});

// ═══════════════════ ERROR HANDLING ═══════════════════
window.addEventListener('error', (e) => {
  console.error('Portfolio error:', e.error);
  // Graceful degradation - ensure basic functionality works
});
