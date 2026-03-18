/* ══════════════════════════════════════════════════════════════
   CHÁCARA O ALVO — main.js v2.0
   ══════════════════════════════════════════════════════════════ */

/* ── Força início no topo da página ──────────────────────── */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);


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

  function showStep(n, doScroll) {
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

    /* Scroll suave para o form apenas ao navegar entre steps */
    if (doScroll) {
      var wrapper = document.querySelector('.orcamento-form-wrapper');
      if (wrapper) {
        var offset = (document.getElementById('header') || {}).offsetHeight || 76;
        var top = wrapper.getBoundingClientRect().top + window.pageYOffset - offset - 20;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }
  }

  /* Botões next */
  form.querySelectorAll('.btn-step-next').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = parseInt(this.getAttribute('data-next'), 10);
      showStep(next, true);
    });
  });

  /* Botões back */
  form.querySelectorAll('.btn-step-back').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var back = parseInt(this.getAttribute('data-back'), 10);
      showStep(back, true);
    });
  });

  /* Inicializa sem scroll */
  showStep(1, false);
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


/* ── Calendário de Disponibilidade ───────────────────────── */
(function () {

  var modal         = document.getElementById('calendarModal');
  var backdrop      = document.getElementById('calModalBackdrop');
  var closeBtn      = document.getElementById('calModalClose');
  var prevBtn       = document.getElementById('calPrevMonth');
  var nextBtn       = document.getElementById('calNextMonth');
  var monthLabel    = document.getElementById('calMonthLabel');
  var grid          = document.getElementById('calGrid');
  var loadingEl     = document.getElementById('calLoading');
  var errorEl       = document.getElementById('calError');
  var selectedLabel = document.getElementById('calSelectedLabel');
  var confirmBtn    = document.getElementById('calConfirm');

  if (!modal) return;

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var viewYear  = today.getFullYear();
  var viewMonth = today.getMonth(); /* 0-based */
  var bookedDates  = new Set();
  var dataFetched  = false;
  var selectedISO  = null;

  var PT_MONTHS = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function toISO(year, month, day) {
    return year + '-' + pad(month + 1) + '-' + pad(day);
  }

  function formatPTBR(isoStr) {
    var parts = isoStr.split('-');
    var d = parseInt(parts[2], 10);
    var m = parseInt(parts[1], 10) - 1;
    var y = parts[0];
    var date = new Date(parseInt(y, 10), m, d);
    var weekdays = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    return weekdays[date.getDay()] + ', ' + d + ' de ' + PT_MONTHS[m] + ' de ' + y;
  }

  /* Busca datas reservadas na tabela 'agenda' do Supabase */
  function fetchBookedDates() {
    if (!supabaseClient) {
      dataFetched = true;
      return Promise.resolve();
    }
    if (loadingEl) loadingEl.hidden = false;
    if (grid) grid.style.opacity = '0.35';

    return supabaseClient
      .from('agenda')
      .select('data')
      .then(function (result) {
        if (loadingEl) loadingEl.hidden = true;
        if (grid) grid.style.opacity = '1';
        if (result.error) {
          /* 404 = tabela ainda não criada → silencioso, mostra tudo disponível */
          var status = result.error.code || '';
          var is404  = status === '42P01' || (result.error.message && result.error.message.indexOf('does not exist') !== -1);
          if (!is404) {
            console.error('Agenda fetch error:', result.error);
            if (errorEl) errorEl.hidden = false;
          }
          dataFetched = true;
          return;
        }
        bookedDates = new Set((result.data || []).map(function (r) { return r.data; }));
        dataFetched = true;
      })
      .catch(function (err) {
        if (loadingEl) loadingEl.hidden = true;
        if (grid) grid.style.opacity = '1';
        /* Silencia erros de tabela inexistente */
        var msg = (err && err.message) ? err.message : '';
        if (msg.indexOf('does not exist') === -1 && msg.indexOf('404') === -1) {
          console.warn('Agenda exception:', err);
        }
        dataFetched = true;
      });
  }

  /* Renderiza o grid do mês */
  function renderMonth() {
    if (!grid || !monthLabel) return;

    monthLabel.textContent = PT_MONTHS[viewMonth] + ' ' + viewYear;

    var firstDay     = new Date(viewYear, viewMonth, 1).getDay();
    var daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();

    /* Desabilita prev se estamos no mês atual */
    if (prevBtn) {
      prevBtn.disabled = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
    }

    grid.innerHTML = '';

    /* Células vazias no início */
    for (var i = 0; i < firstDay; i++) {
      var empty = document.createElement('div');
      empty.className = 'cal-day cal-day--empty';
      empty.setAttribute('aria-hidden', 'true');
      grid.appendChild(empty);
    }

    /* Células de dias */
    for (var day = 1; day <= daysInMonth; day++) {
      var iso  = toISO(viewYear, viewMonth, day);
      var date = new Date(viewYear, viewMonth, day);
      date.setHours(0, 0, 0, 0);

      var cell    = document.createElement('div');
      var classes = ['cal-day'];
      var isToday = (date.getTime() === today.getTime());

      if (isToday) classes.push('cal-day--today');

      if (date < today) {
        classes.push('cal-day--past');
        cell.setAttribute('aria-disabled', 'true');
      } else if (bookedDates.has(iso)) {
        classes.push('cal-day--off');
        cell.setAttribute('aria-disabled', 'true');
        cell.setAttribute('aria-label', day + ' de ' + PT_MONTHS[viewMonth] + ' — reservado');
      } else {
        classes.push('cal-day--ok');
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('data-iso', iso);
        cell.setAttribute('aria-label', day + ' de ' + PT_MONTHS[viewMonth] + ' — disponível');
        cell.addEventListener('click', function () { selectDate(this.getAttribute('data-iso')); });
        cell.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectDate(this.getAttribute('data-iso'));
          }
        });
      }

      if (iso === selectedISO) classes.push('cal-day--selected');
      cell.className = classes.join(' ');
      cell.textContent = day;
      grid.appendChild(cell);
    }
  }

  /* Seleciona uma data */
  function selectDate(iso) {
    selectedISO = iso;

    /* Atualiza highlight */
    grid.querySelectorAll('.cal-day--selected').forEach(function (el) {
      el.classList.remove('cal-day--selected');
    });
    var chosen = grid.querySelector('[data-iso="' + iso + '"]');
    if (chosen) chosen.classList.add('cal-day--selected');

    /* Atualiza rodapé */
    if (selectedLabel) {
      selectedLabel.textContent = formatPTBR(iso);
      selectedLabel.style.color = 'var(--verde-500)';
      selectedLabel.style.fontStyle = 'normal';
      selectedLabel.style.fontWeight = '500';
    }

    /* Habilita botão confirmar */
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.removeAttribute('aria-disabled');
    }
  }

  /* Confirma data → preenche formulário */
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      if (!selectedISO) return;

      /* Preenche campo #data no formulário */
      var dataInput = document.getElementById('data');
      if (dataInput) {
        dataInput.value = selectedISO;
        dataInput.dispatchEvent(new Event('change', { bubbles: true }));
        dataInput.dispatchEvent(new Event('input',  { bubbles: true }));
        dataInput.classList.add('field-prefilled');
        setTimeout(function () { dataInput.classList.remove('field-prefilled'); }, 2000);
      }

      closeModal();

      /* Navega para step 2 se ainda estiver no step 1 */
      var step1 = document.getElementById('step1');
      if (step1 && step1.classList.contains('active')) {
        var btnNext = document.querySelector('.btn-step-next[data-next="2"]');
        if (btnNext) btnNext.click();
      }

      /* Rola para o formulário */
      setTimeout(function () {
        var orcamento = document.getElementById('orcamento');
        if (orcamento) {
          var offset = (document.getElementById('header') || {}).offsetHeight || 76;
          var top = orcamento.getBoundingClientRect().top + window.pageYOffset - offset - 20;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      }, 100);
    });
  }

  /* Abre o modal */
  function openModal(preselectedISO) {
    if (errorEl) errorEl.hidden = true;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    /* Reset de estado */
    viewYear  = today.getFullYear();
    viewMonth = today.getMonth();
    selectedISO = null;
    if (selectedLabel) {
      selectedLabel.textContent = 'Selecione uma data disponível acima';
      selectedLabel.style.color = '';
      selectedLabel.style.fontStyle = 'italic';
      selectedLabel.style.fontWeight = '';
    }
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.setAttribute('aria-disabled', 'true');
    }

    /* Se veio com data pré-selecionada */
    if (preselectedISO) {
      var parts = preselectedISO.split('-');
      viewYear  = parseInt(parts[0], 10);
      viewMonth = parseInt(parts[1], 10) - 1;
      selectedISO = preselectedISO;
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.removeAttribute('aria-disabled');
      }
      if (selectedLabel) {
        selectedLabel.textContent = formatPTBR(preselectedISO);
        selectedLabel.style.color = 'var(--verde-500)';
        selectedLabel.style.fontStyle = 'normal';
        selectedLabel.style.fontWeight = '500';
      }
    }

    /* Busca dados do Supabase apenas na primeira abertura */
    if (!dataFetched) {
      fetchBookedDates().then(function () { renderMonth(); });
    } else {
      renderMonth();
    }

    setTimeout(function () { if (closeBtn) closeBtn.focus(); }, 60);
  }

  /* Fecha o modal */
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    var trigger = document.getElementById('btnVerificarData');
    if (trigger) trigger.focus();
  }

  /* Navegação de meses */
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (viewMonth === 0) { viewMonth = 11; viewYear--; }
      else { viewMonth--; }
      renderMonth();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (viewMonth === 11) { viewMonth = 0; viewYear++; }
      else { viewMonth++; }
      renderMonth();
    });
  }

  /* Fechar */
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (backdrop)  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  /* Botão principal "Verificar minha data" */
  var btnVerificar = document.getElementById('btnVerificarData');
  if (btnVerificar) {
    btnVerificar.addEventListener('click', function () { openModal(null); });
  }

  /* Chips disponíveis abrem o calendário na data certa */
  document.querySelectorAll('.data-chip--ok[data-iso]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      openModal(this.getAttribute('data-iso'));
    });
    chip.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(this.getAttribute('data-iso'));
      }
    });
    /* Cursor personalizado */
    chip.addEventListener('mouseenter', function () { document.body.classList.add('cursor-hover'); });
    chip.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-hover'); });
  });

})();
