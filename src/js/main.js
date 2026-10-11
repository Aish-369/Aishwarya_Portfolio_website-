/*
 * Portfolio site script. No dependencies, no storage, no cookies, no tracking.
 * Strict-CSP friendly: no inline handlers, no eval, no dynamic <script>.
 */
(() => {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* CONFIG                                                              */
  /* ------------------------------------------------------------------ */

  // Contact form delivery.
  // 1) Create a free form at https://formspree.io and paste its URL below, e.g.
  //    'https://formspree.io/f/abcdwxyz'
  // 2) If you use another provider, also add its origin to connect-src and
  //    form-action in the CSP (src/index.html meta tag + src/static/_headers + vercel.json).
  // Leave it empty and the form opens the visitor's email app with a prefilled message.
  const FORM_ENDPOINT = '';

  const EMAIL_USER = 'aishpawar369';
  const EMAIL_HOST = 'gmail.com';

  const LIMITS = { name: 100, email: 254, message: 2000 };
  const COOLDOWN_MS = 30000;
  const PROJECT_LABELS = {
    website: 'Website / Portfolio',
    ai: 'AI / ML Project',
    ui: 'UI / UX Design',
    freelance: 'Freelance Project',
    other: 'Something else',
  };

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */

  const EMAIL = EMAIL_USER + '@' + EMAIL_HOST;
  const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

  // Remove control + bidi-override characters, trim, enforce max length.
  const clean = (value, max, multiline = false) => {
    let v = String(value == null ? '' : value)
      .normalize('NFC')
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/[‪-‮⁦-⁩]/g, '');
    if (!multiline) v = v.replace(/[\r\n\t]+/g, ' ');
    else v = v.replace(/\r\n?/g, '\n');
    return v.trim().slice(0, max);
  };

  /* ------------------------------------------------------------------ */
  /* Email links: address is assembled at runtime so scrapers can't read */
  /* it from the HTML source.                                            */
  /* ------------------------------------------------------------------ */

  document.querySelectorAll('a[data-email]').forEach((a) => {
    a.setAttribute('href', 'mailto:' + EMAIL);
  });

  /* ------------------------------------------------------------------ */
  /* Footer year                                                         */
  /* ------------------------------------------------------------------ */

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------ */
  /* Contact form                                                        */
  /* ------------------------------------------------------------------ */

  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  if (!form || !statusEl) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  let lastSent = 0;
  let sending = false;

  const STATUS_CLASS = {
    ok: 'mt-4 text-center text-sm font-semibold text-green-700',
    error: 'mt-4 text-center text-sm font-semibold text-red-700',
  };

  const showStatus = (type, text) => {
    statusEl.textContent = text; // textContent only: never innerHTML
    statusEl.className = STATUS_CLASS[type];
  };

  const setBusy = (busy) => {
    sending = busy;
    if (submitBtn) submitBtn.disabled = busy;
    form.setAttribute('aria-busy', busy ? 'true' : 'false');
  };

  const readForm = () => {
    const fd = new FormData(form);
    const project = clean(fd.get('project'), 20);
    return {
      name: clean(fd.get('name'), LIMITS.name),
      email: clean(fd.get('email'), LIMITS.email),
      project: Object.prototype.hasOwnProperty.call(PROJECT_LABELS, project) ? project : '',
      message: clean(fd.get('message'), LIMITS.message, true),
      honeypot: clean(fd.get('website'), 200),
    };
  };

  const validate = (d) => {
    if (!d.name) return 'Please enter your name.';
    if (!d.email || !EMAIL_RE.test(d.email)) return 'Please enter a valid email address.';
    if (!d.message) return 'Please write a short message.';
    return '';
  };

  const sendViaEndpoint = async (d) => {
    const url = new URL(FORM_ENDPOINT);
    if (url.protocol !== 'https:') throw new Error('Form endpoint must use https');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url.href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: d.name,
          email: d.email,
          project: PROJECT_LABELS[d.project] || 'Not specified',
          message: d.message,
        }),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('Request failed: ' + res.status);
    } finally {
      clearTimeout(timer);
    }
  };

  const sendViaMailto = (d) => {
    const subject = 'Portfolio message from ' + d.name;
    const body =
      d.message +
      '\n\n---\nName: ' + d.name +
      '\nEmail: ' + d.email +
      '\nLooking for: ' + (PROJECT_LABELS[d.project] || 'Not specified');
    window.location.href =
      'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;

    const data = readForm();

    // Honeypot: real people never see this field. Pretend success, send nothing.
    if (data.honeypot) {
      form.reset();
      showStatus('ok', 'Thanks! Your message has been sent.');
      return;
    }

    const problem = validate(data);
    if (problem) {
      showStatus('error', problem);
      return;
    }

    const wait = COOLDOWN_MS - (Date.now() - lastSent);
    if (wait > 0) {
      showStatus('error', 'Please wait ' + Math.ceil(wait / 1000) + ' seconds before sending another message.');
      return;
    }

    setBusy(true);
    try {
      if (FORM_ENDPOINT) {
        await sendViaEndpoint(data);
        lastSent = Date.now();
        form.reset();
        showStatus('ok', 'Thanks! Your message has been sent.');
      } else {
        sendViaMailto(data);
        lastSent = Date.now();
        showStatus('ok', 'Opening your email app to send the message…');
      }
    } catch (err) {
      showStatus('error', 'Sorry, something went wrong. Please email me directly instead.');
    } finally {
      setBusy(false);
    }
  });
})();
