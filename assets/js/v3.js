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
