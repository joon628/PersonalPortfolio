// ═══════════════════ SPLIT-SCREEN INTRO ANIMATION ═══════════════════
let currentIndex = 0;
const animationDelay = 1200; // Pause between each movement

function moveStackUp() {
  const textItems = document.querySelectorAll('.text-item');
  const textStack = document.querySelector('.text-stack');
  
  if (currentIndex < textItems.length - 1) {
    // Remove active class from current item
    textItems[currentIndex].classList.remove('active');
    textItems[currentIndex].classList.add('exited');
    
    // Move to next item
    currentIndex++;
    
    // Add active class to new current item
    textItems[currentIndex].classList.add('active');
    
    // Calculate exact spacing based on actual rendered dimensions
    const computedStyle = getComputedStyle(textStack);
    const gap = parseFloat(computedStyle.gap);
    const itemHeight = textItems[0].getBoundingClientRect().height;
    
    // Use the actual spacing (gap + item height) for perfect alignment
    const actualSpacing = gap + itemHeight;
    const moveDistance = currentIndex * -actualSpacing;
    
    textStack.style.transform = `translateY(${moveDistance}px)`;
    
    // Continue animation if not at "Joon Kang"
    if (currentIndex < textItems.length - 1) {
      setTimeout(moveStackUp, animationDelay);
    } else {
      // Animation complete, transition to main page
      setTimeout(transition, 800);
    }
  }
}

function startIntroAnimation() {
  // Start the animation after initial delay
  setTimeout(moveStackUp, 1500);
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
  const headerNameEl = document.querySelector('header .name');
  const introEl = document.getElementById('intro');
  
  if (!headerNameEl || !introEl) return;
  
  // Make header name visible
  headerNameEl.style.visibility = 'visible';
  headerNameEl.style.opacity = '1';
  
  // Start fading out intro
  introEl.style.transition = 'opacity 0.8s ease-out';
  introEl.style.opacity = '0';
  
  // Remove intro completely
  setTimeout(() => {
    introEl.remove();
    
    // Trigger section animations
    document.querySelectorAll('section').forEach((section, i) => {
      section.style.animationDelay = `${i * 0.1}s`;
      section.classList.add('fade-in');
    });
  }, 800);
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
  // Check if user has already seen the intro in this session
  const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');

  if (hasSeenIntro) {
    // Skip intro, go directly to main content
    const intro = document.getElementById('intro');
    const mainContent = document.getElementById('main-content');
    const sideNav = document.getElementById('side-nav');
    const headerName = document.querySelector('header .name');

    intro.style.display = 'none';
    mainContent.style.display = 'block';
    mainContent.style.opacity = '1';
    sideNav.style.display = 'block';
    sideNav.style.opacity = '1';

    // Make header name visible
    if (headerName) {
      headerName.style.visibility = 'visible';
      headerName.style.opacity = '1';
    }

    // Ensure body classes are set
    document.body.classList.add('intro-done');
  } else {
    // Start split-screen intro animation
    startIntroAnimation();
    // Mark that user has seen the intro
    sessionStorage.setItem('hasSeenIntro', 'true');
  }
  
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
