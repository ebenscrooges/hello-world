document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile menu ---------- */
  (function () {
    var toggle = document.getElementById('menuToggle');
    var menu = document.getElementById('mobileMenu');
    var backdrop = document.getElementById('menuBackdrop');
    if (!toggle || !menu || !backdrop) return;

    var focusableSelector = 'a[href], button:not([disabled])';
    var lastFocused = null;

    function openMenu() {
      lastFocused = document.activeElement;
      menu.classList.add('is-open');
      backdrop.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nav-open');
      var firstLink = menu.querySelector(focusableSelector);
      if (firstLink) firstLink.focus();
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-open');
      if (lastFocused) lastFocused.focus();
    }

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.contains('is-open');
      if (isOpen) closeMenu(); else openMenu();
    });

    backdrop.addEventListener('click', closeMenu);

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
      }
    });

    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusables = Array.prototype.slice.call(menu.querySelectorAll(focusableSelector));
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  })();

  /* ---------- Scrollspy nav highlighting ---------- */
  (function () {
    var sections = document.querySelectorAll('main section[id]');
    var navLinks = document.querySelectorAll('nav.links a[href^="#"]');
    if (!sections.length || !navLinks.length || !('IntersectionObserver' in window)) return;

    var linkMap = {};
    navLinks.forEach(function (link) {
      linkMap[link.getAttribute('href').slice(1)] = link;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkMap[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(function (section) {
      if (linkMap[section.id]) observer.observe(section);
    });
  })();

  /* ---------- Back to top ---------- */
  (function () {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 640) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var answer = item.querySelector('.faq-a');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-a').style.maxHeight = null;
          openItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = null;
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Testimonials slideshow ---------- */
  (function () {
    var track = document.querySelector('#testiSlideshow .testi-slide-track');
    var slides = track ? track.querySelectorAll('.testi-slide') : [];
    var dotsWrap = document.getElementById('testiDots');
    var prevBtn = document.getElementById('testiPrev');
    var nextBtn = document.getElementById('testiNext');
    if (!slides.length) return;
    var current = 0;
    var timer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); resetTimer(); });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll('.testi-dot');

    function goTo(i) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }
    function resetTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 7000);
    }

    nextBtn.addEventListener('click', function () { next(); resetTimer(); });
    prevBtn.addEventListener('click', function () { prev(); resetTimer(); });
    var wrap = document.getElementById('testiSlideshow');
    wrap.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    wrap.addEventListener('mouseleave', resetTimer);

    resetTimer();
  })();

  /* ---------- Gallery lightbox ---------- */
  (function () {
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
    var lightbox = document.getElementById('lightbox');
    if (!items.length || !lightbox) return;

    var imgEl = lightbox.querySelector('.lightbox-figure img');
    var captionEl = lightbox.querySelector('.lightbox-caption');
    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');
    var current = 0;
    var lastFocused = null;

    function show(i) {
      current = (i + items.length) % items.length;
      var item = items[current];
      var fullSrc = item.getAttribute('data-full') || item.querySelector('img').src;
      imgEl.src = fullSrc;
      imgEl.alt = item.querySelector('img').alt || '';
      captionEl.textContent = item.getAttribute('data-caption') || '';
    }

    function open(i) {
      lastFocused = document.activeElement;
      show(i);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nav-open');
      closeBtn.focus();
    }

    function close() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-open');
      imgEl.src = '';
      if (lastFocused) lastFocused.focus();
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () { open(i); });
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(current - 1); });
    nextBtn.addEventListener('click', function () { show(current + 1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  })();

  /* ---------- Contact form ---------- */
  (function () {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var success = document.getElementById('formSuccess');
    var error = document.getElementById('formError');
    var submitBtn = document.getElementById('contactSubmit');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (success) success.classList.remove('is-visible');
      if (error) error.classList.remove('is-visible');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) { return res.json().catch(function () { return { success: res.ok }; }); })
        .then(function (data) {
          if (data && data.success) {
            if (success) {
              success.textContent = 'Thank you — your message has been sent. We will get back to you shortly.';
              success.classList.add('is-visible');
              success.focus();
            }
            form.reset();
          } else {
            throw new Error((data && data.error) || 'send_failed');
          }
        })
        .catch(function () {
          if (error) {
            error.textContent = 'Sorry — your message could not be sent. Please try again, or email info@wilwininitiative.org directly.';
            error.classList.add('is-visible');
            error.focus();
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
          }
        });
    });
  })();

});
