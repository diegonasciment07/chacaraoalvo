/* ══════════════════════════════════════════════════════════════
   CHÁCARA O ALVO — main.js
   ══════════════════════════════════════════════════════════════ */

/* ── Supabase client ─────────────────────────────────────────
   A anon/publishable key é pública por design (protegida por RLS).
   https://supabase.com/docs/guides/api/api-keys
   ─────────────────────────────────────────────────────────── */
var SUPABASE_URL  = 'https://jgascbtbwyvflpicixyd.supabase.co';
var SUPABASE_KEY  = 'sb_publishable_czELIEaD2b6ZLNZowXmW-g_CDZENy6d';
var supabaseClient = (typeof supabase !== 'undefined')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

/* ── Header: scroll behavior ─────────────────────────────── */
(function () {
  var header = document.getElementById('header');
  if (!header) return;
  function tick() {
    header.classList.toggle('scrolled', window.scrollY > 72);
  }
  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();

/* ── Hamburger / Mobile menu ─────────────────────────────── */
(function () {
  var btn  = document.getElementById('hamburger');
  var menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
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
      var target = this.getAttribute('href');
      if (target === '#') return;
      var el = document.querySelector(target);
      if (!el) return;
      e.preventDefault();
      var offset = (document.getElementById('header') || {}).offsetHeight || 76;
      var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
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

/* ── Formulário → Supabase ────────────────────────────────── */
(function () {
  var form    = document.getElementById('orcamentoForm');
  var sucesso = document.getElementById('formSucesso');
  if (!form) return;

  /* Coleta checkboxes múltiplos em array */
  function getCheckboxValues(name) {
    return Array.from(form.querySelectorAll('input[name="' + name + '"]:checked'))
                .map(function (el) { return el.value; });
  }

  /* Validação dos campos obrigatórios */
  function validar() {
    var fields  = form.querySelectorAll('[required]');
    var valido  = true;
    fields.forEach(function (f) {
      f.classList.remove('field-error');
      if (!f.value.trim()) {
        f.classList.add('field-error');
        valido = false;
      }
    });
    if (!valido) {
      var primeiro = form.querySelector('.field-error');
      if (primeiro) {
        primeiro.focus();
        primeiro.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    return valido;
  }

  /* Remove erro ao digitar */
  form.querySelectorAll('[required]').forEach(function (f) {
    f.addEventListener('input', function () { this.classList.remove('field-error'); });
  });

  /* Submit */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validar()) return;

    var btn = form.querySelector('.btn-submit');
    btn.textContent = 'Enviando…';
    btn.disabled = true;

    /* Monta payload */
    var flexEl   = form.querySelector('input[name="flexibilidade"]');
    var dataEl   = form.querySelector('#data');
    var dataVal  = dataEl && dataEl.value ? dataEl.value : null;

    var payload = {
      nome:          form.nome.value.trim(),
      email:         form.email.value.trim(),
      telefone:      form.telefone.value.trim(),
      tipo_evento:   getCheckboxValues('tipo_evento'),
      convidados:    (form.convidados ? form.convidados.value : null),
      data_evento:   dataVal,
      flexibilidade: !!(flexEl && flexEl.checked),
      espacos:       getCheckboxValues('espacos'),
      servicos:      getCheckboxValues('servicos'),
      investimento:  (form.investimento ? form.investimento.value : null),
      como_conheceu: form.origem.value || null,
      mensagem:      form.mensagem.value.trim() || null,
    };

    /* Tenta enviar ao Supabase */
    if (supabaseClient) {
      var result = await supabaseClient
        .from('orcamentos')
        .insert([payload]);

      if (result.error) {
        console.error('Supabase error:', result.error);
        btn.textContent = 'Enviar Solicitação de Orçamento';
        btn.disabled = false;
        mostrarErro();
        return;
      }
    }

    /* Sucesso */
    form.hidden = true;
    if (sucesso) {
      sucesso.hidden = false;
      sucesso.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  function mostrarErro() {
    var existente = form.querySelector('.form-erro-geral');
    if (existente) return;
    var div = document.createElement('div');
    div.className = 'form-erro-geral';
    div.textContent = 'Ocorreu um erro ao enviar. Por favor, tente novamente ou entre em contato pelo WhatsApp.';
    form.prepend(div);
    setTimeout(function () { div.remove(); }, 8000);
  }
})();
