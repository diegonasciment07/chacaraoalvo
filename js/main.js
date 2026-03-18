/* ══════════════════════════════════════════════════════════════
   CHÁCARA O ALVO — main.js v2.0
   ══════════════════════════════════════════════════════════════ */

/* ── Supabase ─────────────────────────────────────────────── */
var SUPABASE_URL = 'https://jgascbtbwyvflpicixyd.supabase.co';
var SUPABASE_KEY = 'sb_publishable_czELIEaD2b6ZLNZowXmW-g_CDZENy6d';
var supabaseClient = (typeof supabase !== 'undefined')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;


/* ── Cursor personalizado ─────────────────────────────────── */
(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  var dot     = document.getElementById('cursorDot');
  var outline = document.getElementById('cursorOutline');
  if (!dot || !outline) return;

  var mouseX = 0, mouseY = 0;
  var outX = 0, outY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  /* Suaviza o outline */
  (function animate() {
    outX += (mouseX - outX) * 0.14;
    outY += (mouseY - outY) * 0.14;
    outline.style.left = outX + 'px';
    outline.style.top  = outY + 'px';
    requestAnimationFrame(animate);
  })();

  /* Expande ao passar sobre interativos */
  var interativos = 'a, button, [role="button"], label, .galeria-item, .depo-card, .data-chip--ok';
  document.querySelectorAll(interativos).forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', function () {
      document.body.classList.remove('cursor-hover');
    });
  });

  /* Esconde ao sair da janela */
  document.addEventListener('mouseleave', function () {
    dot.style.opacity = '0';
    outline.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    dot.style.opacity = '1';
    outline.style.opacity = '1';
  });
})();


/* ── Header: scroll ───────────────────────────────────────── */
(function () {
  var header = document.getElementById('header');
  if (!header) return;
  function tick() {
    header.classList.toggle('scrolled', window.scrollY > 72);
  }
  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();


/* ── Sticky CTA Bar ───────────────────────────────────────── */
(function () {
  var cta  = document.getElementById('stickyCta');
  var hero = document.getElementById('hero');
  if (!cta || !hero) return;

  var observer = new IntersectionObserver(function (entries) {
    var heroVisible = entries[0].isIntersecting;
    cta.classList.toggle('visible', !heroVisible);
    cta.setAttribute('aria-hidden', String(heroVisible));
  }, { threshold: 0.1 });

  observer.observe(hero);
})();


/* ── Hamburger / Mobile menu ──────────────────────────────── */
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


/* ── Smooth scroll ────────────────────────────────────────── */
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
  GLightbox({ touchNavigation: true, loop: true, openEffect: 'fade', closeEffect: 'fade' });
})();


/* ── Intersection Observer: fade-in (.js-fade) ───────────── */
(function () {
  var targets = document.querySelectorAll('.js-fade, .js-stagger');
  if (!targets.length || !('IntersectionObserver' in window)) {
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
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) { observer.observe(el); });
})();


/* ── Contadores animados ──────────────────────────────────── */
(function () {
  var counters = document.querySelectorAll('[data-target]');
  if (!counters.length || !('IntersectionObserver' in window)) return;

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1600;
    var start = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var value = Math.round(easeOut(progress) * target);

      /* Formatar números grandes com ponto */
      var formatted = value >= 1000
        ? value.toLocaleString('pt-BR')
        : String(value);

      el.textContent = formatted + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(function (el) { observer.observe(el); });
})();


/* ── Formulário multi-step ────────────────────────────────── */
(function () {
  var form      = document.getElementById('orcamentoForm');
  var indicator = document.getElementById('stepIndicator');
  var barFill   = document.getElementById('stepBarFill');
  if (!form) return;

  var currentStep = 1;
  var totalSteps  = 4;

  function showStep(n) {
    /* Esconde todos */
    form.querySelectorAll('.form-step').forEach(function (step) {
      step.classList.remove('active');
    });
    /* Mostra o atual */
    var target = form.querySelector('#step' + n);
    if (target) target.classList.add('active');

    /* Atualiza barra */
    if (barFill) {
      barFill.style.width = (n / totalSteps * 100) + '%';
    }

    /* Atualiza labels */
    if (indicator) {
      indicator.querySelectorAll('.step-label').forEach(function (label) {
        var s = parseInt(label.getAttribute('data-step'), 10);
        label.classList.remove('active', 'done');
        if (s === n) label.classList.add('active');
        if (s < n)  label.classList.add('done');
      });
    }

    currentStep = n;

    /* Scroll suave para o form */
    var wrapper = document.querySelector('.orcamento-form-wrapper');
    if (wrapper) {
      var offset = (document.getElementById('header') || {}).offsetHeight || 76;
      var top = wrapper.getBoundingClientRect().top + window.pageYOffset - offset - 20;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  /* Botões next */
  form.querySelectorAll('.btn-step-next').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = parseInt(this.getAttribute('data-next'), 10);
      showStep(next);
    });
  });

  /* Botões back */
  form.querySelectorAll('.btn-step-back').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var back = parseInt(this.getAttribute('data-back'), 10);
      showStep(back);
    });
  });

  /* Inicializa */
  showStep(1);
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
  var indicator = document.getElementById('stepIndicator');
  if (!form) return;

  function getCheckboxValues(name) {
    return Array.from(form.querySelectorAll('input[name="' + name + '"]:checked'))
                .map(function (el) { return el.value; });
  }

  function validar() {
    var fields = form.querySelectorAll('[required]');
    var valido = true;
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

  form.querySelectorAll('[required]').forEach(function (f) {
    f.addEventListener('input', function () { this.classList.remove('field-error'); });
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validar()) return;

    var btn = form.querySelector('.btn-submit');
    btn.textContent = 'Enviando…';
    btn.disabled = true;

    var flexEl  = form.querySelector('input[name="flexibilidade"]');
    var dataEl  = form.querySelector('#data');
    var dataVal = dataEl && dataEl.value ? dataEl.value : null;

    var payload = {
      nome:          form.nome.value.trim(),
      email:         form.email.value.trim(),
      telefone:      form.telefone.value.trim(),
      tipo_evento:   getCheckboxValues('tipo_evento'),
      convidados:    form.convidados ? form.convidados.value : null,
      data_evento:   dataVal,
      flexibilidade: !!(flexEl && flexEl.checked),
      espacos:       getCheckboxValues('espacos'),
      servicos:      getCheckboxValues('servicos'),
      investimento:  form.investimento ? form.investimento.value : null,
      como_conheceu: form.origem.value || null,
      mensagem:      form.mensagem.value.trim() || null,
    };

    if (supabaseClient) {
      var result = await supabaseClient.from('orcamentos').insert([payload]);
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
    if (indicator) indicator.hidden = true;
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
    div.textContent = 'Ocorreu um erro ao enviar. Tente novamente ou fale pelo WhatsApp.';
    form.prepend(div);
    setTimeout(function () { div.remove(); }, 8000);
  }
})();
