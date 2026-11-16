  /* ================= Boru cephesi ================= */
  const fac = { el: $('#facade'), g: null, W: 0, H: 0, pipes: [], pairOrder: [], glow: new Float32Array(1), target: new Float32Array(1), raf: 0 };

  function layoutFacade() {
    const r = fac.el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    fac.el.width = Math.round(r.width * dpr);
    fac.el.height = Math.round(r.height * dpr);
    fac.g = fac.el.getContext('2d');
    fac.g.setTransform(dpr, 0, 0, dpr, 0, 0);
    fac.W = r.width; fac.H = r.height;

    const N = r.width < 480 ? 17 : r.width < 800 ? 23 : 31;
    const M = (N - 1) / 2;
    const cEnd = Math.max(1, Math.round(M * 0.2));   // orta kule
    const fEnd = Math.round(M * 0.66);               // yassı bölümler
    const sideMid = (fEnd + 1 + M) / 2;              // yan kuleler
    const sideHalf = Math.max(1, (M - fEnd) / 2);
    const pad = 14;
    const slot = (r.width - pad * 2) / N;
    fac.pipes = [];
    for (let i = 0; i < N; i++) {
      const j = Math.abs(i - M);
      let h, tower = true;
      if (j <= cEnd) h = 1 - 0.07 * j;
      else if (j <= fEnd) { tower = false; h = 0.44 + 0.16 * (j - cEnd - 1) / Math.max(1, fEnd - cEnd - 1); }
      else h = 0.82 - 0.12 * Math.abs(j - sideMid) / sideHalf;
      fac.pipes.push({ x: pad + slot * (i + 0.5), w: slot * (tower ? 0.8 : 0.66), h, pair: j });
    }
    const pairs = [];
    for (let j = 0; j <= M; j++) pairs.push({ j, h: fac.pipes[M + j].h });
    pairs.sort((a, b) => b.h - a.h);
    fac.pairOrder = pairs.map(p => p.j);
    fac.glow = new Float32Array(M + 1);
    fac.target = new Float32Array(M + 1);
    updateFacadeTargets();
    fac.glow.set(fac.target);
    drawFacade();
  }

  function updateFacadeTargets() {
    if (!fac.pairOrder.length) return;
    fac.target.fill(0);
    const M = fac.target.length - 1;
    for (const [midi, v] of voices) {
      if (!v.stops.size) continue;
      const u = clamp((96 - midi) / (96 - 28), 0, 1); // kalın notalar uzun boruları yakar
      fac.target[fac.pairOrder[Math.round(u * M)]] = 1;
    }
    if (!fac.raf) fac.raf = requestAnimationFrame(stepFacade);
  }

  function stepFacade() {
    fac.raf = 0;
    let moving = false;
    for (let j = 0; j < fac.glow.length; j++) {
      const d = fac.target[j] - fac.glow[j];
      if (reducedMotion || Math.abs(d) < 0.004) fac.glow[j] = fac.target[j];
      else { fac.glow[j] += d * (d > 0 ? 0.45 : 0.08); moving = true; }
    }
    drawFacade();
    if (moving) fac.raf = requestAnimationFrame(stepFacade);
  }

  function drawFacade() {
    const g = fac.g;
    if (!g) return;
    const { W, H } = fac;
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0d0805'); bg.addColorStop(1, '#241810');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const light = g.createRadialGradient(W / 2, H * 0.05, 0, W / 2, H * 0.05, W * 0.5);
    light.addColorStop(0, 'rgba(240,205,120,0.12)'); light.addColorStop(1, 'rgba(240,205,120,0)');
    g.fillStyle = light; g.fillRect(0, 0, W, H);

    const ledge = 16;
    const toeY = H - ledge;
    const mouthY = H - ledge - Math.max(26, H * 0.2);
    for (const p of fac.pipes) {
      const top = mouthY - p.h * (mouthY - 12);
      drawPipe(g, p.x, p.w, top, mouthY, toeY, fac.glow[p.pair] || 0);
    }
    const wood = g.createLinearGradient(0, H - ledge, 0, H);
    wood.addColorStop(0, '#5a3e29'); wood.addColorStop(1, '#2b1d13');
    g.fillStyle = wood; g.fillRect(0, H - ledge, W, ledge);
    g.fillStyle = 'rgba(207,163,75,0.75)'; g.fillRect(0, H - ledge, W, 1.5);
  }

  function drawPipe(g, x, w, top, mouthY, toeY, glow) {
    const L = x - w / 2;
    const metal = g.createLinearGradient(L, 0, L + w, 0);
    metal.addColorStop(0, '#4d4840'); metal.addColorStop(0.18, '#a39c8c'); metal.addColorStop(0.36, '#eee8da');
    metal.addColorStop(0.5, '#c4bdad'); metal.addColorStop(0.82, '#6f695e'); metal.addColorStop(1, '#3e3a33');
    g.fillStyle = metal;
    g.fillRect(L, top, w, mouthY - top);
    const toeW = Math.max(2, w * 0.16);
    g.beginPath();
    g.moveTo(L, mouthY); g.lineTo(L + w, mouthY); g.lineTo(x + toeW / 2, toeY); g.lineTo(x - toeW / 2, toeY);
    g.closePath(); g.fill();
    g.fillStyle = '#17110c';
    g.beginPath(); g.ellipse(x, top, w / 2, Math.max(1.2, w * 0.12), 0, 0, Math.PI * 2); g.fill();

    const mw = w * 0.62, mh = Math.max(2, w * 0.2);
    g.fillStyle = 'rgba(207,163,75,0.9)'; // yaldızlı üst dudak
    g.beginPath();
    g.moveTo(x - mw / 2, mouthY - mh);
    g.quadraticCurveTo(x - mw / 2, mouthY - mh - w * 0.5, x, mouthY - mh - w * 0.62);
    g.quadraticCurveTo(x + mw / 2, mouthY - mh - w * 0.5, x + mw / 2, mouthY - mh);
    g.closePath(); g.fill();
    g.fillStyle = '#120c08';
    g.fillRect(x - mw / 2, mouthY - mh, mw, mh);
    g.fillStyle = 'rgba(0,0,0,0.2)';
    g.beginPath();
    g.moveTo(x - mw / 2, mouthY);
    g.quadraticCurveTo(x - mw / 2, mouthY + w * 0.35, x, mouthY + w * 0.45);
    g.quadraticCurveTo(x + mw / 2, mouthY + w * 0.35, x + mw / 2, mouthY);
    g.closePath(); g.fill();

    if (glow > 0.01) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.shadowColor = `rgba(240,205,120,${0.8 * glow})`;
      g.shadowBlur = 22 * glow;
      g.fillStyle = `rgba(240,190,90,${0.38 * glow})`;
      g.fillRect(L, top, w, mouthY - top);
      g.restore();
    }
  }

