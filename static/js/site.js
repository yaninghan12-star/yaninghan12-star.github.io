// 页面交互：论文筛选、复制邮箱、首页轨迹示意图。内容数据不在这里，见 data/ 目录。
(function () {
  const root = document.documentElement;

  /* ---------- publications filter ---------- */
  const pubRoot = document.getElementById("pub-list");
  if (pubRoot) {
    const chips = document.querySelectorAll(".chip[data-tag]");
    const search = document.getElementById("pub-search");
    const empty = document.getElementById("pub-empty");
    let active = "all";
    const apply = () => {
      const q = (search.value || "").trim().toLowerCase();
      let shown = 0;
      pubRoot.querySelectorAll(".year").forEach((year) => {
        let n = 0;
        year.querySelectorAll(".pub").forEach((p) => {
          const tags = (p.dataset.tags || "").split(" ");
          const ok = (active === "all" || tags.includes(active)) &&
            (!q || p.textContent.toLowerCase().includes(q));
          p.hidden = !ok;
          if (ok) n++;
        });
        year.hidden = n === 0;
        shown += n;
      });
      empty.hidden = shown !== 0;
    };
    chips.forEach((c) => c.addEventListener("click", () => {
      active = c.dataset.tag;
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      apply();
    }));
    search.addEventListener("input", apply);
  }

  /* ---------- copy email ---------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.copy);
      const label = btn.textContent;
      const done = () => { btn.textContent = btn.dataset.copied; setTimeout(() => (btn.textContent = label), 1500); };
      const fallback = () => {
        const r = document.createRange(); r.selectNodeContents(target);
        const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      };
      try { navigator.clipboard.writeText(target.textContent.trim()).then(done, fallback); } catch (e) { fallback(); }
    });
  });

  /* ---------- hero trajectory illustration ---------- */
  const cv = document.getElementById("traj");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const gauss = () => { const u = rnd() || 1e-6, v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  function pathPoint(t, br) {
    if (t < 0.45) { const s = t / 0.45; return [0.12 + 0.36 * s, 0.78 - 0.28 * s + 0.05 * Math.sin(s * 3)]; }
    const s = (t - 0.45) / 0.55;
    return br ? [0.48 + 0.40 * s, 0.50 - 0.34 * s + 0.04 * Math.sin(s * 4)]
              : [0.48 + 0.38 * s, 0.50 + 0.22 * s - 0.08 * s * s];
  }
  const cells = Array.from({ length: 520 }, () => {
    const t = Math.pow(rnd(), 0.85), br = rnd() < 0.55 ? 1 : 0;
    const [x, y] = pathPoint(t, br), sp = 0.022 + 0.018 * (1 - Math.abs(t - 0.45));
    return { t, x: x + gauss() * sp, y: y + gauss() * sp, ph: rnd() * Math.PI * 2 };
  }).sort((p, q) => p.t - q.t);
  const hex = (h) => { h = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
  let W = 0, H = 0, C;
  const colors = () => {
    const cs = getComputedStyle(root), g = (n) => cs.getPropertyValue(n).trim();
    return { t0: hex(g("--t0")), t1: hex(g("--t1")), muted: g("--muted"), line: g("--line"), mono: g("--mono") };
  };
  function resize() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); C = colors();
  }
  function draw(time) {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(W * i / 5, 0); ctx.lineTo(W * i / 5, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, H * i / 5); ctx.lineTo(W, H * i / 5); ctx.stroke();
    }
    ctx.setLineDash([3, 4]); ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.55;
    [0, 1].forEach((br) => {
      ctx.beginPath();
      for (let t = 0; t <= 1.001; t += 0.02) { const [x, y] = pathPoint(t, br); t === 0 ? ctx.moveTo(x * W, y * H) : ctx.lineTo(x * W, y * H); }
      ctx.stroke();
    });
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    const pulse = reduce ? -1 : (time / 6000) % 1.25, r0 = Math.max(2, W / 190);
    cells.forEach((c) => {
      const dx = reduce ? 0 : Math.sin(time / 1400 + c.ph) * 0.6, dy = reduce ? 0 : Math.cos(time / 1700 + c.ph) * 0.6;
      const glow = Math.max(0, 1 - Math.abs(c.t - pulse) * 9);
      ctx.fillStyle = mix(C.t0, C.t1, c.t);
      ctx.beginPath(); ctx.arc(c.x * W + dx, c.y * H + dy, r0 * (1 + glow * 0.7), 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = C.muted; ctx.font = `11px ${C.mono}`;
    ctx.fillText("UMAP 1 →", 10, H - 10);
    ctx.save(); ctx.translate(16, 70); ctx.rotate(-Math.PI / 2); ctx.fillText("UMAP 2 →", 0, 0); ctx.restore();
    const [sx, sy] = pathPoint(0, 0), [ex1, ey1] = pathPoint(1, 1), [ex2, ey2] = pathPoint(1, 0);
    ctx.fillText("t = 0 h", sx * W - 8, sy * H + 26);
    ctx.fillText("fate A", Math.min(ex1 * W - 10, W - 44), ey1 * H - 12);
    ctx.fillText("fate B", Math.min(ex2 * W - 10, W - 44), ey2 * H + 22);
    if (!reduce) requestAnimationFrame(draw);
  }
  addEventListener("resize", () => { resize(); if (reduce) draw(0); });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { C = colors(); if (reduce) draw(0); });
  resize(); requestAnimationFrame(draw);
})();
