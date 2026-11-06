/* ==========================================================================
   🌿 VIJAY ORGANIC FARMING - MASTER JAVASCRIPT ENGINE
   Includes Navigation, Cart System, Gallery Lightbox, Counters, Validation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Init All Core Modules
  initNavigation();
  initThemeToggle();
  initScrollAnimations();
  initCounters();
  initShoppingCart();
  initProductFilterAndSearch();
  initGalleryLightbox();
  initAccordion();
  initContactForm();
  initScrollToTop();
});

/* --------------------------------------------------------------------------
   1. NAVIGATION & STICKY HEADER
   -------------------------------------------------------------------------- */
function initNavigation() {
  const header = document.querySelector('.header');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky Header on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = hamburgerBtn.querySelector('i');
      if (navMenu.classList.contains('active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });
  }

  // Active Link Highlight
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* --------------------------------------------------------------------------
   2. DARK MODE TOGGLE
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('vijay_theme') || 'light';

  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    updateThemeIcon('dark');
  }

  themeBtn?.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    if (newTheme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
    
    localStorage.setItem('vijay_theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    const icon = themeBtn?.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }
}

/* --------------------------------------------------------------------------
   3. ANIMATED STATISTICS COUNTER
   -------------------------------------------------------------------------- */
function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length === 0) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target') || '100');
          const suffix = counter.getAttribute('data-suffix') || '';
          let count = 0;
          const speed = Math.ceil(target / 40);

          const updateCount = () => {
            count += speed;
            if (count >= target) {
              counter.innerText = target + suffix;
            } else {
              counter.innerText = count + suffix;
              setTimeout(updateCount, 40);
            }
          };
          updateCount();
        });
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) observer.observe(statsSection);
}

/* --------------------------------------------------------------------------
   4. SCROLL ANIMATIONS (INTERSECTION OBSERVER)
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.feature-card, .product-card, .farming-card, .timeline-item');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
  });
}

/* --------------------------------------------------------------------------
   5. SHOPPING CART ENGINE
   -------------------------------------------------------------------------- */
let cart = JSON.parse(localStorage.getItem('vijay_organic_cart')) || [];

function initShoppingCart() {
  const cartToggleBtn = document.getElementById('cart-toggle');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartDrawer = document.getElementById('cart-drawer');
  const closeCartBtn = document.getElementById('close-cart-btn');

  // Cart Toggle Events
  cartToggleBtn?.addEventListener('click', openCart);
  closeCartBtn?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  // Bind Add to Cart Buttons
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-cart-btn');
    if (btn) {
      const card = btn.closest('.product-card');
      if (card) {
        const id = card.dataset.id || card.querySelector('.product-title')?.innerText;
        const title = card.querySelector('.product-title')?.innerText || 'Organic Product';
        const price = parseFloat(card.querySelector('.product-price')?.innerText.replace('₹', '') || '100');
        const img = card.querySelector('.product-img')?.src || '';

        addToCart({ id, title, price, img, qty: 1 });
      }
    }
  });

  renderCart();
}

function openCart() {
  document.getElementById('cart-overlay')?.classList.add('active');
  document.getElementById('cart-drawer')?.classList.add('active');
}

function closeCart() {
  document.getElementById('cart-overlay')?.classList.remove('active');
  document.getElementById('cart-drawer')?.classList.remove('active');
}

function addToCart(item) {
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push(item);
  }
  saveCart();
  renderCart();
  openCart();
  showToast(`Added "${item.title}" to your cart!`);
}

function updateCartQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    saveCart();
    renderCart();
  }
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
  showToast('Item removed from cart');
}

function saveCart() {
  localStorage.setItem('vijay_organic_cart', JSON.stringify(cart));
}

function renderCart() {
  const cartBody = document.getElementById('cart-body');
  const cartCountBadge = document.getElementById('cart-count');
  const cartTotalAmount = document.getElementById('cart-total-amount');

  if (!cartBody) return;

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  if (cartCountBadge) cartCountBadge.innerText = totalItems;
  if (cartTotalAmount) cartTotalAmount.innerText = `₹${totalPrice.toFixed(2)}`;

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
        <p>Your basket is currently empty.</p>
        <a href="products.html" onclick="closeCart()" class="btn btn-primary" style="margin-top: 1rem; font-size: 0.85rem;">Explore Fresh Produce</a>
      </div>
    `;
    return;
  }

  cartBody.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.title}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">₹${item.price} x ${item.qty} = ₹${item.price * item.qty}</div>
        <div class="cart-qty-ctrl">
          <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
        </div>
      </div>
      <button onclick="removeFromCart('${item.id}')" style="color: #ef4444; font-size: 1.1rem;" title="Remove Item">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  `).join('');
}

// Global checkout trigger
window.checkoutCart = function() {
  if (cart.length === 0) {
    showToast('Your basket is empty!');
    return;
  }
  cart = [];
  saveCart();
  renderCart();
  closeCart();
  showToast('🌱 Order placed successfully! Thank you for supporting organic farming.');
};

/* --------------------------------------------------------------------------
   6. PRODUCT FILTER & SEARCH (products.html)
   -------------------------------------------------------------------------- */
function initProductFilterAndSearch() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('product-search-input');
  const productCards = document.querySelectorAll('.product-card');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-category');
        filterProducts(category, searchInput?.value.toLowerCase() || '');
      });
    });
  }

  searchInput?.addEventListener('input', (e) => {
    const activeBtn = document.querySelector('.filter-btn.active');
    const category = activeBtn ? activeBtn.getAttribute('data-category') : 'all';
    filterProducts(category, e.target.value.toLowerCase());
  });

  function filterProducts(category, searchTerm) {
    productCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const title = card.querySelector('.product-title')?.innerText.toLowerCase() || '';

      const matchesCat = (category === 'all' || cardCategory === category);
      const matchesSearch = title.includes(searchTerm);

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   7. GALLERY LIGHTBOX MODAL (gallery.html)
   -------------------------------------------------------------------------- */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close-btn');

  if (!lightboxModal) return;

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('.gallery-img');
      const title = item.querySelector('.gallery-title')?.innerText || 'Farm Gallery Image';

      if (img && lightboxImg) {
        lightboxImg.src = img.src;
        if (lightboxCaption) lightboxCaption.innerText = title;
        lightboxModal.classList.add('active');
      }
    });
  });

  closeBtn?.addEventListener('click', () => {
    lightboxModal.classList.remove('active');
  });

  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      lightboxModal.classList.remove('active');
    }
  });
}

/* --------------------------------------------------------------------------
   8. FAQ ACCORDION (farming.html)
   -------------------------------------------------------------------------- */
function initAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   9. CONTACT FORM VALIDATION & NOTIFICATION
   -------------------------------------------------------------------------- */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name')?.value.trim();
    const email = document.getElementById('contact-email')?.value.trim();
    const message = document.getElementById('contact-message')?.value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all required fields.');
      return;
    }

    contactForm.reset();
    showToast('🌿 Thank you! Your message has been sent to Vijay Organic Farming.');
  });
}

/* --------------------------------------------------------------------------
   10. SCROLL TO TOP & TOAST UTILITY
   -------------------------------------------------------------------------- */
function initScrollToTop() {
  const scrollTopBtn = document.getElementById('scroll-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn?.classList.add('active');
    } else {
      scrollTopBtn?.classList.remove('active');
    }
  });

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent-amber);"></i> <span>${message}</span>`;
  toast.classList.add('active');

  setTimeout(() => {
    toast.classList.remove('active');
  }, 3500);
}

// Expose globals for inline HTML event attributes
window.updateCartQty = updateCartQty;
window.removeFromCart = removeFromCart;
