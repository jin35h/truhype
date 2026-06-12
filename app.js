/**
 * TRUHYPE Men's Wear - Interactive Functions
 */

document.addEventListener('DOMContentLoaded', () => {
  initImageLoaders(); // Run first to setup JS fallback and loaders
  initScrollAnimations();
  initHeaderScroll();
  initMobileNav();
  initCategoryFilter();
  initStoreStatus();
  initInquiryForm();
  initFAQAccordion();
});

/* ==========================================================================
   Image Lazy Shimmer Loaders & Loader Block Control
   ========================================================================== */
function initImageLoaders() {
  document.body.classList.add('js-active');
  const images = document.querySelectorAll('.product-image-wrap img');
  const loader = document.getElementById('collections-loader');
  const grid = document.querySelector('.products-grid');
  
  let loadedCount = 0;
  const totalImages = images.length;
  
  if (totalImages === 0) {
    if (loader) loader.style.display = 'none';
    if (grid) grid.classList.add('grid-ready');
    return;
  }
  
  function checkAllLoaded() {
    loadedCount++;
    if (loadedCount >= totalImages) {
      if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.style.display = 'none';
          if (grid) grid.classList.add('grid-ready');
        }, 400); // Wait for fade-out animation to complete
      } else {
        if (grid) grid.classList.add('grid-ready');
      }
    }
  }

  images.forEach(img => {
    // Check if browser already has it cached
    if (img.complete) {
      img.parentElement.classList.add('loaded');
      checkAllLoaded();
    } else {
      img.addEventListener('load', () => {
        img.parentElement.classList.add('loaded');
        checkAllLoaded();
      });
      img.addEventListener('error', () => {
        // Complete load count even on error to prevent loader lock
        img.parentElement.classList.add('loaded');
        checkAllLoaded();
      });
    }
  });
}

/* ==========================================================================
   Scroll-Triggered Reveal Animations
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Stop observing once revealed to boost performance
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null, // viewport
    threshold: 0.15, // trigger when 15% of element is visible
    rootMargin: '0px 0px -50px 0px' // adjust trigger zone slightly upward
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });
}

/* ==========================================================================
   Header Scroll Styling
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    // Shrink header on scroll
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll spy: Active nav link highlighting
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      // Trigger mid-way through the viewport
      if (window.scrollY >= (sectionTop - varHeaderHeight() - 100)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
  });

  function varHeaderHeight() {
    return header.classList.contains('scrolled') ? 70 : 80;
  }
}

/* ==========================================================================
   Mobile Navigation Menu
   ========================================================================== */
function initMobileNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navMenu.classList.toggle('open');
    // Lock scroll when menu is open
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ==========================================================================
   Collections Grid Filtering
   ========================================================================== */
function initCategoryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Set active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const wrap = card.querySelector('.product-image-wrap');
        
        // Quick exit for 'all'
        if (filterValue === 'all') {
          animateCardShow(card, wrap);
          return;
        }

        // Match card categories
        const cardCategory = card.getAttribute('data-category');
        if (cardCategory === filterValue) {
          animateCardShow(card, wrap);
        } else {
          animateCardHide(card);
        }
      });
    });
  });

  function animateCardShow(card, wrap) {
    card.style.display = 'flex';
    
    // Simulate loading shimmer transition on card reveal
    if (wrap) {
      wrap.classList.remove('loaded');
    }
    
    // Small delay to trigger CSS transition
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
      
      // Complete loading transition
      setTimeout(() => {
        if (wrap) wrap.classList.add('loaded');
      }, 350); // Shimmer duration
    }, 50);
  }

  function animateCardHide(card) {
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';
    // Wait for transition duration before setting display: none
    setTimeout(() => {
      card.style.display = 'none';
    }, 300);
  }
}

/* ==========================================================================
   Dynamic Opening Hours (Indian Standard Time - IST)
   ========================================================================== */
function initStoreStatus() {
  const statusContainer = document.getElementById('store-status-badge');
  if (!statusContainer) return;

  function updateStatus() {
    // Store hours: 09:30 AM to 09:00 PM IST (Daily)
    const openTimeMinutes = 9 * 60 + 30; // 9:30 AM = 570 mins
    const closeTimeMinutes = 21 * 60;    // 9:00 PM = 1260 mins

    // Get current Indian Standard Time (IST is Asia/Kolkata)
    const now = new Date();
    let hours = 0;
    let minutes = 0;
    
    try {
      const options = { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', hour12: false };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(now);
      
      parts.forEach(part => {
        if (part.type === 'hour') hours = parseInt(part.value, 10);
        if (part.type === 'minute') minutes = parseInt(part.value, 10);
      });
    } catch (err) {
      // Fallback if Intl.DateTimeFormat is not supported or fails
      const utcTime = now.getTime();
      const istTime = new Date(utcTime + (5.5 * 3600000));
      hours = istTime.getUTCHours();
      minutes = istTime.getUTCMinutes();
    }

    const currentMins = hours * 60 + minutes;

    // Check if open
    const isOpen = currentMins >= openTimeMinutes && currentMins < closeTimeMinutes;

    if (isOpen) {
      statusContainer.innerHTML = `
        <span class="status-badge open">
          <span class="status-dot pulse"></span>
          🟢 Open Now (Closes at 9:00 PM)
        </span>
      `;
    } else {
      statusContainer.innerHTML = `
        <span class="status-badge closed">
          <span class="status-dot"></span>
          🔴 Closed Now (Opens at 9:30 AM)
        </span>
      `;
    }
  }

  // Update immediately
  updateStatus();
  // Check every 30 seconds
  setInterval(updateStatus, 30000);
}

/* ==========================================================================
   WhatsApp Lead Generation Inquiry Form
   ========================================================================== */
function initInquiryForm() {
  const form = document.getElementById('inquiry-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('cust-name').value.trim();
    const category = document.getElementById('cust-category').value;
    const message = document.getElementById('cust-msg').value.trim();

    // Primary store WhatsApp details
    const whatsappNumber = '918758398555';

    // Format pre-filled WhatsApp message
    let text = `Hi TRUHYPE Men's Wear!\n\n`;
    text += `I would like to make an inquiry from your website.\n\n`;
    text += `👤 *Name:* ${name || 'Customer'}\n`;
    text += `🏷️ *Interested Category:* ${category.toUpperCase()}\n`;
    if (message) {
      text += `💬 *Message:* ${message}\n`;
    }
    text += `\nCould you please share the availability or price details? Thank you!`;

    // Encode text payload
    const encodedText = encodeURIComponent(text);
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

    // Micro-interaction: Change button text, show spinner, redirect
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span>⏳ Connecting to WhatsApp...</span>`;
    submitBtn.style.background = '#ffffff';
    submitBtn.style.color = '#000000';

    setTimeout(() => {
      window.open(waUrl, '_blank');
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.style.background = '';
      submitBtn.style.color = '';
      form.reset();
    }, 1200);
  });
}

/* ==========================================================================
   FAQ Accordion System
   ========================================================================== */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    
    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(i => {
        i.classList.remove('active');
        const content = i.querySelector('.faq-content');
        if (content) content.style.maxHeight = '0px';
      });

      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
        const content = item.querySelector('.faq-content');
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}
