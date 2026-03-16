/* ══════════════════════════════════════════════════════════════
   CHÁCARA O ALVO — main.js
   ══════════════════════════════════════════════════════════════ */

/* ── Header: scroll behavior ─────────────────────────────── */
(function () {
  const header = document.getElementById('header');
  if (!header) return;
  function tick() {
    header.classList.toggle('scrolled', window.scrollY > 72);
  }
  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();

/* ── Hamburger / Mobile menu ─────────────────────────────── */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', function () {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('active', open);
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('.mobile-link').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });
})();

/* ── Smooth scroll (âncoras) ─────────────────────────────── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = this.getAttribute('href');
      if (target === '#') return;
      const el = document.querySelector(target);
      if (!el) return;
      e.preventDefault();
      const offset = (document.getElementById('header') || {}).offsetHeight || 76;
      const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();

/* ── GLightbox ────────────────────────────────────────────── */
(function () {
  if (typeof GLightbox === 'undefined') return;
  GLightbox({
    touchNavigation: true,
    loop: true,
    openEffect: 'fade',
    closeEffect: 'fade',
    cssEfects: { fade: { in: 'fadeIn', out: 'fadeOut' } },
  });
})();

/* ── Intersection Observer: fade-in (.js-fade) ───────────── */
(function () {
  var targets = document.querySelectorAll('.js-fade');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) { observer.observe(el); });
})();

/* ── Phone mask ───────────────────────────────────────────── */
(function () {
  var tel = document.getElementById('telefone');
  if (!tel) return;
  tel.addEventListener('input', function () {
    var v = this.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6)      v = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
    else if (v.length > 2) v = '(' + v.slice(0,2) + ') ' + v.slice(2);
    else if (v.length > 0) v = '(' + v;
    this.value = v;
  });
})();

/* ── Form validation ──────────────────────────────────────── */
(function () {
  var form = document.getElementById('orcamentoForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    var required = form.querySelectorAll('[required]');
    var valid = true;
    required.forEach(function (f) {
      f.classList.remove('field-error');
      if (!f.value.trim()) { f.classList.add('field-error'); valid = false; }
    });
    if (!valid) {
      e.preventDefault();
      var first = form.querySelector('.field-error');
      if (first) { first.focus(); first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }
  });

  form.querySelectorAll('[required]').forEach(function (f) {
    f.addEventListener('input', function () { this.classList.remove('field-error'); });
  });
})();
