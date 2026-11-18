/* Resonance download site — plain JS, no dependencies, no network requests. */
(() => {
  'use strict';

  // ---- Config, one entry per platform. ----
  // Windows: a GitHub Release asset (98 MiB is too big for the Pages repo).
  // Android: the APK is small enough to live in this repo, served by Pages from apk/.
  const CONFIG = {
    windows: {
      version: '0.4.0',
      downloadUrl: 'https://github.com/senthamizhanR/resonance/releases/download/v0.4.0/Resonance-Setup-0.4.0.exe',
      sizeBytes: 102888448,
      sha256: 'c4ac84117b65a674655ca6e43a2c841fcee2b1cb4e2a283499a9cc3f44733f12',
    },
    android: {
      version: '0.4.4',
      downloadUrl: 'apk/Resonance-0.4.4.apk',
      sizeBytes: 6130223,
      sha256: '2df5ca193b27b0621a9a40b932378fec17383e189b6eb43f4d9bb100bcb3aa8a',
    },
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMq = matchMedia('(prefers-reduced-motion: reduce)');

  // ---- Download links, version, size, hash ----
  Object.entries(CONFIG).forEach(([key, c]) => {
    $$(`[data-dl="${key}"]`).forEach(a => { a.href = c.downloadUrl; });
    $$(`[data-version="${key}"]`).forEach(el => { el.textContent = c.version; });
    $$(`[data-size="${key}"]`).forEach(el => { el.textContent = (c.sizeBytes / 1048576).toFixed(1) + ' MB'; });
    const shaEl = $(`#sha256-${key}`); if (shaEl) shaEl.textContent = c.sha256;
  });

  // ---- Mobile navigation ----
  const toggle = $('.menu-toggle'), navList = $('#nav-list');
  if (toggle && navList) {
    const setOpen = open => { toggle.setAttribute('aria-expanded', String(open)); navList.classList.toggle('open', open); };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    navList.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); } });
    document.addEventListener('click', e => { if (toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('.nav')) setOpen(false); });
    matchMedia('(min-width: 900px)').addEventListener('change', e => { if (e.matches) setOpen(false); });
  }

  // ---- Platform: lead with the visitor's own download (user agent; silent when unsure) ----
  function detectOS() {
    const p = (navigator.userAgentData && navigator.userAgentData.platform) || '';
    const ua = navigator.userAgent || '';
    if (/windows/i.test(p) || /Windows NT|Win64|WOW64/i.test(ua)) return 'windows';
    if (/android/i.test(p) || /Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'iOS';
    if (/macos/i.test(p) || /Mac OS X|Macintosh/.test(ua)) return 'macOS';
    if (/chrome ?os/i.test(p) || /CrOS/.test(ua)) return 'ChromeOS';
    if (/linux/i.test(p) || /Linux|X11/.test(ua)) return 'Linux';
    return null;
  }
  try {
    const os = detectOS();
    if (os === 'Android') {
      // Android button becomes the solid one and goes first; the Android edition leads the download section.
      const row = $('.cta-row');
      if (row) {
        const win = $('[data-dl="windows"]', row), and = $('[data-dl="android"]', row);
        win.classList.replace('btn-solid', 'btn-ghost'); and.classList.replace('btn-ghost', 'btn-solid');
        row.prepend(and);
      }
      const ed = $('#get-android'), first = $('#get-windows');
      if (ed && first) first.before(ed);
    } else if (os && os !== 'windows' && os !== 'ChromeOS') {
      const name = os === 'iOS' ? 'an iPhone or iPad' : os;
      const msg = `It looks like you’re on ${name}. Resonance is for Windows PCs and Android phones and tablets, so there’s no version for ${name} yet.`;
      $$('.os-note').forEach(n => { $('.os-note-text', n).textContent = msg; n.hidden = false; });
    }
  } catch (_) { /* no note is the graceful fallback */ }

  // ---- Copy SHA-256 ----
  $$('.copy-btn').forEach(btn => {
    const target = document.getElementById(btn.dataset.copyTarget);
    const label = $('.copy-label', btn), status = $('#copy-status');
    let timer;
    btn.addEventListener('click', async () => {
      const text = target.textContent.trim();
      let ok = false;
      try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); ok = true; } } catch (_) {}
      if (!ok) {
        const range = document.createRange(); range.selectNodeContents(target);
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
        try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
        if (ok) sel.removeAllRanges();
      }
      btn.classList.toggle('copied', ok);
      if (label) label.textContent = ok ? 'Copied' : 'Select';
      if (status) status.textContent = ok ? 'SHA-256 copied to clipboard' : 'Copy failed. The hash is selected; press Ctrl+C.';
      clearTimeout(timer);
      timer = setTimeout(() => { btn.classList.remove('copied'); if (label) label.textContent = 'Copy'; }, 2000);
    });
  });

  // ---- Reveal on scroll (content stays visible without JS or with reduced motion) ----
  const revealSel = '.sec-head, .side, .signal-head, .flow, .spread-text, .spread-shot, .room-head, .room-shot, .room-copy, .viz-head, .c, .lib-head, .lyric, .lib-shot, .index-list, .win-title, .plat, .edition';
  const reveals = $$(revealSel);
  if ('IntersectionObserver' in window) {
    reveals.forEach(el => el.classList.add('rv'));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    reveals.forEach(el => io.observe(el));
    const dl = $('#download');
    if (dl) new IntersectionObserver(([en]) => { if (en.isIntersecting) dl.classList.add('in'); }, { threshold: 0.25 }).observe(dl);
  } else {
    $('#download') && $('#download').classList.add('in');
  }

  // =====================================================================
  //  The thread: a damped-wave line drawn down the page as you scroll
  // =====================================================================
  const threadSvg = $('.thread'), threadPath = $('.thread-path');
  let threadLen = 0, threadTop = 0, threadBottom = 0;
  function buildThread() {
    if (!threadSvg || !threadPath) return;
    const hero = $('.hero'), stops = $$('main > section:not(.hero)');
    if (!hero || !stops.length) return;
    const W = document.documentElement.clientWidth;
    const docH = document.documentElement.scrollHeight;
    const narrow = W < 700;
    const edge = narrow ? 7 : Math.max(18, Math.min(48, W * 0.025));
    const top = hero.getBoundingClientRect().bottom + scrollY - 40;
    const pts = [[W * 0.5, top]];
    stops.forEach((s, i) => {
      const y = s.getBoundingClientRect().top + scrollY + (narrow ? 30 : 60);
      pts.push([i % 2 === 0 ? W - edge : edge, y]);
    });
    const last = stops[stops.length - 1];
    pts.push([W * 0.5, last.getBoundingClientRect().bottom + scrollY - 30]);

    const amp = narrow ? 5 : 22, lambda = narrow ? 60 : 110, decay = narrow ? 140 : 260;
    let d = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      const span = Math.max(1, y1 - y0);
      for (let y = y0; y <= y1; y += 6) {
        const t = (y - y0) / span, s = t * t * (3 - 2 * t);      // smoothstep across the gap
        const dy = y - y0;
        const wiggle = amp * Math.exp(-dy / decay) * Math.sin((2 * Math.PI * dy) / lambda);
        const x = x0 + (x1 - x0) * s + wiggle * (i === 0 ? 1 : (x0 > W / 2 ? -1 : 1));
        d += (d ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
    }
    threadSvg.setAttribute('viewBox', `0 0 ${W} ${docH}`);
    threadSvg.style.height = docH + 'px';
    threadSvg.setAttribute('width', W); threadSvg.setAttribute('height', docH);
    threadPath.setAttribute('d', d);
    threadLen = threadPath.getTotalLength();
    threadTop = top; threadBottom = pts[pts.length - 1][1];
    threadPath.style.strokeDasharray = threadLen;
    drawThread();
  }
  function drawThread() {
    if (!threadLen) return;
    if (reduceMq.matches) { threadPath.style.strokeDashoffset = 0; return; }
    const head = scrollY + innerHeight * 0.75;
    const p = Math.min(1, Math.max(0, (head - threadTop) / (threadBottom - threadTop)));
    threadPath.style.strokeDashoffset = (threadLen * (1 - p)).toFixed(1);
  }
  let threadQueued = false;
  addEventListener('scroll', () => {
    if (threadQueued) return; threadQueued = true;
    requestAnimationFrame(() => { threadQueued = false; drawThread(); });
  }, { passive: true });
  let rebuildT;
  const scheduleThread = () => { clearTimeout(rebuildT); rebuildT = setTimeout(buildThread, 120); };
  if ('ResizeObserver' in window) new ResizeObserver(scheduleThread).observe(document.body);
  addEventListener('load', buildThread);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleThread);
  reduceMq.addEventListener('change', drawThread);

  // =====================================================================
  //  Hero: a damped-wave field through the headline, plus a goniometer
  // =====================================================================
  const canvas = $('.hero-canvas'), hero = $('.hero');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const TAU = Math.PI * 2;
  let W = 0, H = 0, DPR = 1, narrow = false;
  let anchorY = 0, anchorH = 80, anchorX = 0.6, gonio = null;
  let raf = 0, running = false, heroVisible = true, tPrev = 0, simT = 7.3;
  const particles = [];

  function seed() {
    particles.length = 0;
    const n = narrow ? 16 : 34;
    for (let i = 0; i < n; i++) particles.push({ u: Math.random(), speed: 0.015 + Math.random() * 0.028, off: (Math.random() - 0.5) * 2, size: 0.8 + Math.random() * 1.6, ph: Math.random() * TAU });
  }

  function measure() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    narrow = W < 1100;
    DPR = Math.min(window.devicePixelRatio || 1, W < 700 ? 1.5 : 2);         // cap DPR
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const line = $('.ht-2');
    if (line) {
      const lr = line.getBoundingClientRect();
      anchorY = lr.top - r.top + lr.height * 0.55; anchorH = lr.height;
      anchorX = Math.min(0.75, Math.max(0.45, (lr.right - r.left) / W));
    } else { anchorY = H * 0.4; }
    const g = $('.gonio-anchor');
    gonio = null;
    if (g && !narrow) {
      const gr = g.getBoundingClientRect();
      if (gr.width > 0) gonio = { x: gr.left - r.left + gr.width * 0.62, y: gr.top - r.top + Math.min(150, H * 0.14), r: Math.min(110, gr.width * 0.28) };
    }
    seed();
    if (!running) drawFrame(0);
  }

  const n1 = x => Math.sin(x) * 0.5 + Math.sin(x * 2.17 + 1.3) * 0.3 + Math.sin(x * 4.31 + 0.7) * 0.2;

  function waveY(x, j, t, g) {
    // A sinusoid under a Gaussian envelope: the brand mark's damped wave
    const sig = g.sigma * (1 + j * 0.07);
    const dx = x - g.x0 - j * g.shift;
    const env = Math.exp(-(dx * dx) / (2 * sig * sig));
    return g.y0 + (j - (g.lines - 1) / 2) * g.spread + g.amp * g.scale[j] * env * Math.sin(g.k * dx - t * g.omega - j * 0.55);
  }

  function drawFrame(dt) {
    if (dt) simT += dt;
    const t = simT;
    ctx.clearRect(0, 0, W, H);
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, 'rgba(123,63,242,0.15)');
    grad.addColorStop(0.35, 'rgba(123,63,242,1)');
    grad.addColorStop(1, 'rgba(242,85,122,1)');

    const energy = 0.82 + 0.14 * Math.sin(t * 0.41) * n1(t * 0.2);
    const lines = narrow ? 5 : 8;
    const sigma = narrow ? W * 0.22 : W * 0.16;
    const g = {
      lines, sigma,
      x0: W * (anchorX + 0.06 * Math.sin(t * 0.09)),
      y0: anchorY, spread: narrow ? 4 : 8, shift: narrow ? 6 : 14,
      amp: Math.min(narrow ? 46 : 150, anchorH * 0.55) * energy,
      k: TAU / (sigma * 0.82), omega: 1.5, scale: [],
    };
    for (let j = 0; j < lines; j++) g.scale[j] = 1 - j * 0.07 + 0.12 * Math.sin(t * 0.5 + j * 1.7);

    const step = Math.max(3, Math.round(W / 360));
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = grad;
    ctx.globalCompositeOperation = 'lighter';
    for (let j = lines - 1; j >= 0; j--) {
      ctx.beginPath();
      for (let x = -step; x <= W + step; x += step) { const y = waveY(x, j, t, g); x === -step ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      const main = j === 0;
      ctx.lineWidth = main ? (narrow ? 2.2 : 3) : 1.1;
      ctx.globalAlpha = main ? 0.75 : 0.26 * (1 - j / (lines + 2));
      ctx.stroke();
    }
    if (!narrow) {                                   // soft glow under the main line
      ctx.beginPath();
      for (let x = -step; x <= W + step; x += step) { const y = waveY(x, 0, t, g); x === -step ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.lineWidth = 16; ctx.globalAlpha = 0.07; ctx.stroke();
    }
    ctx.fillStyle = grad;
    for (const p of particles) {                     // motes drifting along the wave
      if (dt) p.u = (p.u + p.speed * dt) % 1;
      const x = p.u * W, y = waveY(x, 0, t, g) + p.off * 24 * Math.sin(t * 0.7 + p.ph);
      ctx.globalAlpha = 0.65 * Math.sin(p.u * Math.PI);
      ctx.beginPath(); ctx.arc(x, y, p.size, 0, TAU); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    if (gonio) drawGonio(t, energy);
  }

  function drawGonio(t, energy) {
    const { x: cx, y: cy, r: R } = gonio;
    const ink = '242,238,232';
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${ink},0.13)`; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    const d = R * Math.SQRT1_2;
    ctx.strokeStyle = `rgba(${ink},0.08)`; ctx.beginPath();
    ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
    ctx.moveTo(cx - d, cy - d); ctx.lineTo(cx + d, cy + d); ctx.moveTo(cx + d, cy - d); ctx.lineTo(cx - d, cy + d); ctx.stroke();
    ctx.fillStyle = `rgba(${ink},0.4)`; ctx.font = '500 10px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
    ctx.fillText('L', cx - d - 8, cy - d - 6); ctx.fillText('R', cx + d + 8, cy - d - 6);
    const grad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    grad.addColorStop(0, '#7B3FF2'); grad.addColorStop(1, '#F2557A');
    ctx.fillStyle = grad; ctx.globalAlpha = 0.85;
    let sLR = 0, sLL = 0, sRR = 0; const N = 240, sc = R * 0.8;
    for (let i = 0; i < N; i++) {
      const u = i / N * TAU * 3 + t * 0.6, ph = 0.7 + 0.6 * Math.sin(t * 0.21);
      const L = (0.55 * Math.sin(u) + 0.22 * Math.sin(u * 2.03 + t * 0.4)) * energy;
      const Rr = (0.55 * Math.sin(u + ph) + 0.22 * Math.sin(u * 2.03 + ph * 1.7 + t * 0.4)) * energy;
      sLR += L * Rr; sLL += L * L; sRR += Rr * Rr;
      let x = (Rr - L) * Math.SQRT1_2, y = -(L + Rr) * Math.SQRT1_2; const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
      ctx.fillRect(cx + x * sc - 1, cy + y * sc - 1, 2, 2);
    }
    ctx.globalAlpha = 1;
    const corr = sLL && sRR ? sLR / Math.sqrt(sLL * sRR) : 0, by = cy + R + 20;
    ctx.fillStyle = `rgba(${ink},0.12)`; ctx.fillRect(cx - R, by, 2 * R, 2);
    ctx.fillStyle = corr >= 0 ? '#5BD6A0' : '#F2557A';
    const mx = cx + corr * R; ctx.fillRect(Math.min(cx, mx), by, Math.abs(mx - cx), 2); ctx.fillRect(mx - 2, by - 3, 4, 8);
    ctx.fillStyle = `rgba(${ink},0.4)`; ctx.textAlign = 'left'; ctx.fillText('−1', cx - R, by + 16); ctx.textAlign = 'right'; ctx.fillText('+1', cx + R, by + 16);
  }

  function loop(now) {
    if (!running) return;
    const dt = tPrev ? Math.min(0.05, (now - tPrev) / 1000) : 0; tPrev = now;
    drawFrame(dt);
    if (running) raf = requestAnimationFrame(loop);
  }
  const shouldRun = () => heroVisible && !document.hidden && !reduceMq.matches;   // reduced motion: one still frame
  function update() {
    const want = shouldRun();
    if (want && !running) { running = true; tPrev = 0; raf = requestAnimationFrame(loop); }
    else if (!want && running) { running = false; cancelAnimationFrame(raf); drawFrame(0); }
  }
  document.addEventListener('visibilitychange', update);
  reduceMq.addEventListener('change', update);
  if ('IntersectionObserver' in window && hero) new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; update(); }).observe(hero);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(canvas); else addEventListener('resize', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure(); drawFrame(0); update();
})();
