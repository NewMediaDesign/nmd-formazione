// Mini-sito corsi NMD — comportamenti, nessuna libreria.
//
// 1) Pagamento: l'elemento con data-pay sceglie il Payment Link Stripe in base
//    alla data. Fino a data-early-until (incluso) usa data-link-early, dopo
//    data-link-full. Senza link il bottone resta disattivato («Iscrizioni in apertura»).
//    Gli elementi data-show="early|full" compaiono solo nella fase giusta.
// 2) Richiesta informazioni: overlay con modulo Formspree (stesso schema della
//    landing new-media-design). I bottoni .js-open-contact lo aprono; data-motivo
//    preseleziona il motivo.
// 3) Reveal sobrio allo scroll (rispetta prefers-reduced-motion).

(function () {
  // ── 1) Pagamento ──────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isEarly = (el) => {
    const until = el.dataset.earlyUntil ? new Date(el.dataset.earlyUntil + 'T23:59:59') : null;
    return Boolean(until && today <= until);
  };

  document.querySelectorAll('[data-pay]').forEach((btn) => {
    const link = isEarly(btn) ? btn.dataset.linkEarly : btn.dataset.linkFull;
    if (link) {
      btn.href = link;
    } else {
      btn.removeAttribute('href');
      btn.setAttribute('aria-disabled', 'true');
      btn.querySelector('.label').textContent = 'Iscrizioni in apertura';
    }
  });
  document.querySelectorAll('[data-show]').forEach((el) => {
    const early = isEarly(el);
    el.hidden = el.dataset.show === 'early' ? !early : early;
  });

  // ── 2) Overlay richiesta informazioni ─────────────────────────
  const overlay = document.getElementById('contact-overlay');
  if (overlay) {
    const form = document.getElementById('co-form');
    const success = document.getElementById('co-success');
    const status = document.getElementById('co-status');
    const motivo = document.getElementById('co-motivo');
    const submit = form.querySelector('[type="submit"] .label');

    const open = (preset) => {
      if (motivo) motivo.value = preset || motivo.options[0].value;
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.js-open-contact');
      if (!btn) return;
      e.preventDefault();
      open(btn.dataset.motivo || '');
    });
    document.getElementById('co-close').addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      submit.textContent = 'Invio in corso…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(String(res.status));
        form.classList.add('hidden');
        success.classList.add('visible');
      } catch {
        submit.textContent = 'Invia richiesta';
        status.textContent = 'Invio non riuscito. Riprova tra poco, oppure scrivimi via email.';
      }
    });
  }

  // ── 3) Reveal ─────────────────────────────────────────────────
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('reveal-on');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.header, .section, .footer').forEach((t) => io.observe(t));
})();
