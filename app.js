/* ============================================================
   RentCar – app.js
   Booking widget, car filter, form handling, scroll effects
   ============================================================ */

'use strict';

// ──────────────────────────────────────────
// 1. NAVBAR: sticky shrink + mobile toggle + active link
// ──────────────────────────────────────────
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');
  const navLinks  = document.querySelectorAll('.nav-menu a');
  const sections  = document.querySelectorAll('main section[id]');

  // Mobile toggle
  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        navMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Scroll: shrink + active section highlight
  function onScroll() {
    if (!navbar) return;

    // Add scrolled class
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    // Active nav highlight
    let currentId = '';
    sections.forEach(section => {
      const top    = section.offsetTop - 100;
      const bottom = top + section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < bottom) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// ──────────────────────────────────────────
// 2. SCROLL-REVEAL for [data-animate] elements
// ──────────────────────────────────────────
(function initScrollReveal() {
  const targets = document.querySelectorAll('[data-animate]');
  if (!targets.length) return;

  // Stagger cards in a grid
  const grids = ['.cars-grid', '.why-grid', '.testimonials-grid', '.about-badges'];
  grids.forEach(selector => {
    const grid = document.querySelector(selector);
    if (!grid) return;
    grid.querySelectorAll('[data-animate]').forEach((el, i) => {
      el.style.transitionDelay = `${i * 60}ms`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();


// ──────────────────────────────────────────
// 3. TOAST helper
// ──────────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className   = `toast toast-${type} show`;

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}


// ──────────────────────────────────────────
// 4. BOOKING WIDGET validation
// ──────────────────────────────────────────
(function initBookingWidget() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  const pickupDate  = document.getElementById('pickupDate');
  const dropoffDate = document.getElementById('dropoffDate');
  if (pickupDate)  pickupDate.min  = today;
  if (dropoffDate) dropoffDate.min = today;

  // When pickup date changes, update dropoff min
  if (pickupDate && dropoffDate) {
    pickupDate.addEventListener('change', () => {
      dropoffDate.min = pickupDate.value || today;
      // If dropoff is before pickup, clear it
      if (dropoffDate.value && dropoffDate.value < pickupDate.value) {
        dropoffDate.value = '';
        setError('dropoffDate', 'İade tarihi alış tarihinden önce olamaz.');
      } else {
        clearError('dropoffDate');
      }
    });
  }

  function setError(fieldId, msg) {
    const el  = document.getElementById(fieldId);
    const err = document.getElementById(fieldId + 'Error');
    if (el) el.classList.add('error');
    if (err) err.textContent = msg;
  }

  function clearError(fieldId) {
    const el  = document.getElementById(fieldId);
    const err = document.getElementById(fieldId + 'Error');
    if (el) el.classList.remove('error');
    if (err) err.textContent = '';
  }

  function validateBooking() {
    let valid = true;
    const fields = [
      { id: 'pickupLocation',  label: 'Teslim alma lokasyonu seçiniz.' },
      { id: 'dropoffLocation', label: 'Teslim etme lokasyonu seçiniz.' },
      { id: 'pickupDate',      label: 'Alış tarihi seçiniz.' },
      { id: 'pickupTime',      label: 'Alış saati seçiniz.' },
      { id: 'dropoffDate',     label: 'İade tarihi seçiniz.' },
      { id: 'dropoffTime',     label: 'İade saati seçiniz.' },
      { id: 'carClass',        label: 'Araç sınıfı seçiniz.' },
    ];

    fields.forEach(({ id, label }) => {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        setError(id, label);
        valid = false;
      } else {
        clearError(id);
      }
    });

    // Cross-field: dropoff must be after pickup
    const pDate = document.getElementById('pickupDate');
    const dDate = document.getElementById('dropoffDate');
    const pTime = document.getElementById('pickupTime');
    const dTime = document.getElementById('dropoffTime');

    if (pDate && dDate && pDate.value && dDate.value) {
      if (dDate.value < pDate.value) {
        setError('dropoffDate', 'İade tarihi alış tarihinden önce olamaz.');
        valid = false;
      } else if (dDate.value === pDate.value && pTime && dTime) {
        if (dTime.value && pTime.value && dTime.value <= pTime.value) {
          setError('dropoffTime', 'İade saati alış saatinden sonra olmalıdır.');
          valid = false;
        }
      }
    }

    return valid;
  }

  // Live clear on change
  form.querySelectorAll('select, input').forEach(el => {
    el.addEventListener('change', () => clearError(el.id));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateBooking()) {
      showToast('Araçlar listeleniyor… (Demo modu)', 'success');
      // Scroll to fleet section
      const fleet = document.getElementById('fleet');
      if (fleet) fleet.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();


// ──────────────────────────────────────────
// 5. FLEET FILTER (tabs)
// ──────────────────────────────────────────
(function initFleetFilter() {
  const tabs    = document.querySelectorAll('.filter-tab');
  const cards   = document.querySelectorAll('.car-card');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      // Update tab states
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Show / hide cards
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.classList.remove('hidden');
          // Re-trigger animation
          card.classList.remove('visible');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => card.classList.add('visible'));
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();


// ──────────────────────────────────────────
// 6. CAR DETAIL modal (simple toast for now)
// ──────────────────────────────────────────
function showCarDetail(carName) {
  showToast(`${carName} – Detay sayfası yakında aktif olacak.`, 'success');
}


// ──────────────────────────────────────────
// 7. RESERVATION FORM with loading + success
// ──────────────────────────────────────────
(function initReservationForm() {
  const form        = document.getElementById('reservationForm');
  const success     = document.getElementById('resSuccess');
  const submitBtn   = document.getElementById('resSubmit');
  const submitText  = document.getElementById('resSubmitText');
  const spinner     = document.getElementById('resSubmitSpinner');
  const resetBtn    = document.getElementById('resReset');

  if (!form) return;

  const fields = {
    resName:     { label: 'Ad soyad boş bırakılamaz.' },
    resEmail:    { label: 'Geçerli bir e-posta adresi giriniz.', type: 'email' },
    resPhone:    { label: 'Telefon numarası boş bırakılamaz.' },
    resCarClass: { label: 'Araç sınıfı seçiniz.' },
  };

  function setError(id, msg) {
    const el  = document.getElementById(id);
    const err = document.getElementById(id + 'Error');
    if (el) el.classList.add('error');
    if (err) err.textContent = msg;
  }

  function clearError(id) {
    const el  = document.getElementById(id);
    const err = document.getElementById(id + 'Error');
    if (el) el.classList.remove('error');
    if (err) err.textContent = '';
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validate() {
    let valid = true;

    Object.entries(fields).forEach(([id, { label, type }]) => {
      const el = document.getElementById(id);
      if (!el) return;

      const val = el.value.trim();
      if (!val) {
        setError(id, label);
        valid = false;
      } else if (type === 'email' && !validateEmail(val)) {
        setError(id, 'Geçerli bir e-posta adresi giriniz.');
        valid = false;
      } else {
        clearError(id);
      }
    });

    return valid;
  }

  // Live validation on blur
  Object.keys(fields).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => {
      const val = el.value.trim();
      if (!val) {
        setError(id, fields[id].label);
      } else if (fields[id].type === 'email' && !validateEmail(val)) {
        setError(id, 'Geçerli bir e-posta adresi giriniz.');
      } else {
        clearError(id);
      }
    });
    el.addEventListener('input', () => clearError(id));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Show loading state
    submitText.style.display = 'none';
    spinner.style.display    = 'inline-flex';
    if (submitBtn) submitBtn.disabled = true;

    // Mock API call (1.5s delay)
    setTimeout(() => {
      form.style.display    = 'none';
      success.style.display = 'block';
      showToast('Rezervasyon talebiniz alındı!', 'success');

      // Reset button state (for future reuse)
      submitText.style.display = '';
      spinner.style.display    = 'none';
      if (submitBtn) submitBtn.disabled = false;
    }, 1500);
  });

  // Reset form
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.style.display    = '';
      success.style.display = 'none';
      // Clear all errors
      Object.keys(fields).forEach(clearError);
    });
  }
})();
