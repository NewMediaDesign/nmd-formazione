// Bozza v3: micro-animazioni e interazioni. Nessuna libreria.
// Rispetta prefers-reduced-motion. La pagina funziona anche senza questo file.
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ── Comparsa allo scroll (con scaglionamento dei figli) ──
  $$('[data-stagger]').forEach((p) => {
    [...p.children].forEach((c, i) => { c.style.setProperty('--d', i * 90 + 'ms'); c.setAttribute('data-reveal', ''); });
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach((el) => io.observe(el));

  // ── Numeri che salgono ──
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target;
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (reduce) { el.textContent = end.toLocaleString('it-IT') + suffix; return; }
      const t0 = performance.now(), dur = 1200;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(end * eased).toLocaleString('it-IT') + suffix;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => {
    if (!reduce) el.textContent = '0' + (el.dataset.suffix || '');
    countIO.observe(el);
  });

  // ── Fisarmoniche animate (programma e FAQ) ──
  $$('details.acc, .faq details').forEach((d) => {
    const sum = $('summary', d);
    const body = document.createElement('div');
    body.className = 'acc-body';
    [...d.children].filter((c) => c !== sum).forEach((c) => body.appendChild(c));
    d.appendChild(body);
    let anim;
    sum.addEventListener('click', (e) => {
      e.preventDefault();
      if (anim) anim.cancel();
      const opening = !d.open;
      if (opening) d.open = true;
      const h = body.scrollHeight;
      const from = opening ? 0 : h, to = opening ? h : 0;
      if (reduce) { d.open = opening; return; }
      anim = body.animate([{ height: from + 'px', opacity: opening ? 0 : 1 }, { height: to + 'px', opacity: opening ? 1 : 0 }],
        { duration: 380, easing: 'cubic-bezier(0.22, 0.8, 0.24, 1)' });
      anim.onfinish = () => { d.open = opening; anim = null; };
    });
  });

  // ── Barra di avanzamento + voce di menu attiva ──
  const bar = $('.progress');
  const onScroll = () => {
    const sheet = $('.sheet');
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max) : 0);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const links = $$('.bar-nav a[href^="#"]');
  const secs = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id)));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach((s) => navIO.observe(s));

  // ── Finestre in sovrapposizione: condizioni di vendita e privacy ──
  // Chiusura con il pulsante «chiudi», con un clic fuori dalla finestra o con Esc.
  (function () {
    let current = null, lastFocus = null;
    const open = (name) => {
      const m = document.getElementById('modal-' + name);
      if (!m) return false;
      lastFocus = document.activeElement;
      m.hidden = false;
      document.body.classList.add('lmodal-open');
      requestAnimationFrame(() => m.classList.add('open'));
      current = m;
      const c = m.querySelector('.lmodal-close'); if (c) c.focus();
      return true;
    };
    const close = () => {
      if (!current) return;
      const m = current; current = null;
      m.classList.remove('open');
      setTimeout(() => { m.hidden = true; if (!document.querySelector('.lmodal.open')) document.body.classList.remove('lmodal-open'); }, reduce ? 0 : 300);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    document.addEventListener('click', (e) => {
      const om = e.target.closest('[data-open-modal]');
      if (om && !e.ctrlKey && !e.metaKey && !e.shiftKey) { e.preventDefault(); open(om.dataset.openModal); return; }
      if (e.target.closest('[data-close]')) { close(); return; }
      const a = e.target.closest('a[href$="condizioni.html"], a[href$="privacy.html"]');
      if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const name = a.getAttribute('href').includes('privacy') ? 'privacy' : 'condizioni';
      if (open(name)) e.preventDefault();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  })();
})();

// ── Indicatore di scorrimento ──
// Compare dopo 1 secondo dall'arrivo e ogni volta che l'utente resta fermo per IDLE_MS su una sezione
// con altro contenuto sotto. Sparisce appena si scorre o si clicca. Il clic porta alla sezione successiva.
(function () {
  const cue = document.querySelector('.scroll-cue');
  if (!cue) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IDLE_MS = 6000;
  let idleTimer = null, visible = false;
  const moreBelow = () => scrollY + innerHeight < document.documentElement.scrollHeight - 160;
  const show = () => {
    if (visible || !moreBelow()) return;
    visible = true; cue.hidden = false;
    requestAnimationFrame(() => cue.classList.add('show'));
  };
  const hide = () => {
    if (!visible) return;
    visible = false; cue.classList.remove('show');
    setTimeout(() => { if (!visible) cue.hidden = true; }, reduce ? 0 : 900);
  };
  const armIdle = () => { clearTimeout(idleTimer); idleTimer = setTimeout(show, IDLE_MS); };
  setTimeout(() => { if (scrollY <= 40) show(); armIdle(); }, 1000);
  let lastY = scrollY;
  addEventListener('scroll', () => {
    if (Math.abs(scrollY - lastY) < 4) return;
    lastY = scrollY; hide(); armIdle();
  }, { passive: true });
  cue.addEventListener('click', () => {
    const bar = document.querySelector('.bar');
    const barH = bar ? bar.offsetHeight : 0;
    const secs = [...document.querySelectorAll('main > .band, main > header.band, main > section')];
    const next = secs.find((el) => el.getBoundingClientRect().top > barH + 60);
    const y = next ? next.getBoundingClientRect().top + scrollY - barH : scrollY + innerHeight * 0.8;
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    hide(); armIdle();
  });
})();

// ── Menu a scomparsa (hamburger) su tablet e telefono ──
// Solo nelle pagine con piu voci di menu (le pagine dei corsi). Sotto i 960 px le voci stanno
// in un pannello che si apre dal pulsante; «Iscrizione», se c'e, resta visibile nella barra.
// Icone Phosphor Bold «list» e «x» (icons/).
(function () {
  const bar = document.querySelector('.bar');
  const nav = bar && bar.querySelector('.bar-nav');
  if (!nav || nav.querySelectorAll('a').length < 3) return;
  const LIST = '<svg class="ic-open" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128ZM40,76H216a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24ZM216,180H40a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Z"/></svg>';
  const X = '<svg class="ic-close" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"/></svg>';
  nav.id = nav.id || 'bar-nav';
  // Senza transizione al primo passaggio: il pannello non deve dissolversi all'apertura della pagina.
  nav.style.transition = 'none';
  bar.classList.add('has-menu');
  void nav.offsetHeight;
  nav.style.transition = '';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'bar-toggle';
  btn.setAttribute('aria-controls', nav.id);
  btn.innerHTML = LIST + X;
  const iscr = nav.querySelector('a[href="#iscrizione"]');
  if (iscr) {
    const cta = iscr.cloneNode(true);
    cta.className = 'bar-cta';
    cta.removeAttribute('aria-current');
    nav.after(cta);
    cta.after(btn);
  } else nav.after(btn);
  const set = (open) => {
    bar.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  };
  set(false);
  btn.addEventListener('click', () => set(!bar.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('click', (e) => { if (!bar.contains(e.target)) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bar.classList.contains('is-open')) { set(false); btn.focus(); }
  });
  const wide = matchMedia('(min-width: 961px)');
  const onWide = () => { if (wide.matches) set(false); };
  if (wide.addEventListener) wide.addEventListener('change', onWide); else wide.addListener(onWide);
})();
