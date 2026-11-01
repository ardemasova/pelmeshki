/* Pelmeshki 2.0 — scroll story, language switch, menu, stickers.
 * Frames: frames/d0…d7 (desktop, 1280 px) and frames/m0…m7 (phones, 854 px),
 * 100 frames per folder, named f_0000.webp … f_0740.webp.
 */
(() => {
  const FRAME_COUNT = 741;
  const mobileSet = window.matchMedia("(max-width: 760px)").matches;
  const KIND = mobileSet ? "m" : "d";
  const framePath = (i) => `frames/${KIND}${Math.floor(i / 100)}/f_${String(i).padStart(4, "0")}.webp`;
  const VW = 1280, VH = 720; // video frame size the sticker positions refer to
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  /* ================= Language ================= */
  const LANGS = ["en", "es", "ru"];
  const IDX = { en: 0, es: 1, ru: 2 };
  let lang = "es";
  try { lang = localStorage.getItem("pm-lang") || ""; } catch (e) { lang = ""; }
  if (!LANGS.includes(lang)) {
    const nav = (navigator.language || "es").slice(0, 2).toLowerCase();
    lang = nav === "ru" || nav === "uk" ? "ru" : nav === "es" || nav === "ca" ? "es" : nav === "en" ? "en" : "es";
  }

  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l;
    const t = window.T[l];
    $$("[data-i18n]").forEach((el) => { const v = t[el.dataset.i18n]; if (v !== undefined) el.textContent = v; });
    $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
    renderMenu();
    renderStickers();
    try { localStorage.setItem("pm-lang", l); } catch (e) {}
  }
  $$(".lang button").forEach((b) => b.addEventListener("click", () => applyLang(b.dataset.lang)));

  /* ================= Menu ================= */
  function renderMenu() {
    const i = IDX[lang], t = window.T[lang];
    const eur = (n) => `${n} €`;
    $("#menuGrid").innerHTML = window.MENU.map((col) => `
      <div class="col">
        <h3>${col.title[i]}<small>${col.perKgOnly ? `<span>${t.perKg}</span>` : `<span>${t.perKg}</span><span>${t.perHalf}</span>`}</small></h3>
        ${col.groups.map((g) => `
          <div class="grp">
            ${g.title ? `<h4>${g.title[i]}</h4>` : ""}
            ${g.note ? `<p class="note">${g.note[i]}</p>` : ""}
            ${g.items.map((it) => `
              <div class="row"><span class="nm">${it.name[i]}</span>${
                it.kg == null ? `<span class="pr ask">${t.onRequest}</span>`
                : `<span class="pr">${eur(it.kg)}</span>${col.perKgOnly ? "" : `<span class="pr half">${eur(it.half)}</span>`}`
              }</div>`).join("")}
          </div>`).join("")}
      </div>`).join("");
  }

  /* ================= QR ================= */
  function qrSvg(fg = "#1a0507") {
    const { n, d } = window.QR;
    return `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" role="img" aria-label="QR WhatsApp"><path fill="${fg}" d="${d}"/></svg>`;
  }
  $("#qrBig").innerHTML = qrSvg();

  /* ================= Stickers ================= */
  const ICONS = {
    pelmen: `<path d="M78 90c2-18 13-28 22-28s20 10 22 28c-7 4-14 6-22 6s-15-2-22-6z"/><path d="M78 90c-6-1-9 4-6 8m50-8c6-1 9 4 6 8M92 70c3 5 13 5 16 0"/>`,
    varenik: `<path d="M74 92a26 24 0 0 1 52 0z"/><path d="M78 80q4 4 0 8M86 72q4 4 0 8M100 68q4 4 0 8M114 72q-4 4 0 8M122 80q-4 4 0 8"/>`,
    syrnik: `<ellipse cx="100" cy="84" rx="24" ry="9"/><path d="M76 84v6c0 5 11 9 24 9s24-4 24-9v-6"/><path d="M90 82l4 3m10-4l4 3"/>`,
    cutlet: `<ellipse cx="100" cy="82" rx="25" ry="15"/><path d="M84 76l8 10m4-14l10 14m4-10l6 8"/>`,
    chicken: `<path d="M86 96c-8-6-10-18-2-26 6-6 16-6 22 0l8-6 4 6-4 3c6 8 4 18-4 23z"/><path d="M106 70l4-8m4 11h8"/><circle cx="104" cy="76" r="1.5"/>`,
  };
  function stickerSvg(s) {
    const i = IDX[lang];
    const name = s.name[i];
    const fs = name.length > 10 ? 10.5 : name.length > 8 ? 12.5 : 14;
    const id = Math.random().toString(36).slice(2, 7);
    return `<svg viewBox="0 0 200 200">
      <defs>
        <path id="t${id}" d="M24 100a76 76 0 0 1 152 0"/>
        <path id="b${id}" d="M8 100a92 92 0 0 0 184 0"/>
      </defs>
      <circle cx="100" cy="100" r="99" fill="${s.ring}"/>
      <circle cx="100" cy="100" r="66" fill="#141010"/>
      <text font-family="Unbounded, Arial Black, sans-serif" font-weight="700" font-size="19" fill="${s.ink}" letter-spacing="1.5">
        <textPath href="#t${id}" startOffset="50%" text-anchor="middle">PELMESHKI 2.0</textPath></text>
      <text font-family="Manrope, Arial, sans-serif" font-weight="700" font-size="10.5" fill="${s.ink}" letter-spacing="1">
        <textPath href="#b${id}" startOffset="50%" text-anchor="middle">ДОМАШНИЕ / CASEROS</textPath></text>
      <g fill="none" stroke="#f6ede1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ICONS[s.icon]}</g>
      <text x="100" y="117" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="600" font-size="${fs}" fill="#f6ede1">${name}</text>
      <rect x="85" y="125" width="30" height="30" rx="3" fill="#f6ede1"/>
      <g transform="translate(88 128) scale(${24 / window.QR.n})"><path fill="#141010" d="${window.QR.d}"/></g>
    </svg>`;
  }
  const stickerBox = $("#stickers");
  function renderStickers() {
    stickerBox.innerHTML = window.STICKERS.map((s) => `<div class="sticker">${stickerSvg(s)}</div>`).join("");
    placeStickers();
  }

  /* ================= Frames ================= */
  const story = $(".story");
  const canvas = $("#film");
  const ctx = canvas.getContext("2d");
  const frames = new Array(FRAME_COUNT);
  const order = [], seen = new Set();
  for (const step of [64, 32, 16, 8, 4, 2, 1]) for (let i = 0; i < FRAME_COUNT; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
  let loaded = 0, cursor = 0, needsDraw = true, targetFrame = 0;
  const loadbar = $("#loadbar"), loader = $(".loader");
  function loadNext() {
    if (cursor >= order.length) return;
    const i = order[cursor++];
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      frames[i] = img; loaded++;
      loadbar.style.width = `${(loaded / FRAME_COUNT) * 100}%`;
      if (loaded === FRAME_COUNT) loader.classList.add("is-done");
      if (Math.abs(i - targetFrame) < 10) needsDraw = true;
      loadNext();
    };
    img.onerror = loadNext;
    img.src = framePath(i);
  }
  for (let k = 0; k < 6; k++) loadNext();
  function nearest(i) {
    if (frames[i]) return frames[i];
    for (let d = 1; d < FRAME_COUNT; d++) { if (frames[i - d]) return frames[i - d]; if (frames[i + d]) return frames[i + d]; }
    return null;
  }

  let cw = 0, ch = 0;
  const view = { x: 0, y: 0, w: 1, h: 1 }; // where the video frame is drawn, in CSS px
  // 1×1 canvas to average the top / bottom rows of the frame (for phones)
  const strip = document.createElement("canvas"); strip.width = 1; strip.height = 1;
  const sctx = strip.getContext("2d", { willReadFrequently: true });
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = canvas.clientWidth; ch = canvas.clientHeight;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = "high";
    needsDraw = true;
  }
  function draw(img) {
    const iw = img.naturalWidth, ih = img.naturalHeight, ir = iw / ih;
    if (cw / ch >= 1.05) {                         // landscape: cover
      let w, h;
      if (cw / ch > ir) { w = cw; h = cw / ir; } else { h = ch; w = ch * ir; }
      Object.assign(view, { x: (cw - w) / 2, y: (ch - h) / 2, w, h });
      ctx.drawImage(img, view.x, view.y, w, h);
    } else {                                       // portrait: a wide band, zoomed in on the action
      // zoom out for the last scenes so all five packages fit
      const zoom = 1.5 - 0.5 * clamp((current - 0.74) / 0.08);
      const w = cw * zoom, h = w / ir;
      Object.assign(view, { x: (cw - w) / 2, y: ch * 0.4 - h / 2, w, h });
      const avg = (sy) => { sctx.drawImage(img, 0, sy, iw, ih * 0.05, 0, 0, 1, 1); const d = sctx.getImageData(0, 0, 1, 1).data; return `rgb(${d[0]},${d[1]},${d[2]})`; };
      const topC = avg(0), botC = avg(ih * 0.95);
      let g = ctx.createLinearGradient(0, 0, 0, view.y + 2);
      g.addColorStop(0, "#1a0507"); g.addColorStop(1, topC);
      ctx.fillStyle = g; ctx.fillRect(0, 0, cw, view.y + 2);
      g = ctx.createLinearGradient(0, view.y + h - 2, 0, ch);
      g.addColorStop(0, botC); g.addColorStop(0.7, "#1a0507");
      ctx.fillStyle = g; ctx.fillRect(0, view.y + h - 2, cw, ch - view.y - h + 2);
      ctx.drawImage(img, view.x, view.y, w, h);
      const f = 28;                                 // soften the top and bottom edge of the frame
      g = ctx.createLinearGradient(0, view.y, 0, view.y + f); g.addColorStop(0, topC); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, view.y, cw, f);
      g = ctx.createLinearGradient(0, view.y + h - f, 0, view.y + h); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, botC);
      ctx.fillStyle = g; ctx.fillRect(0, view.y + h - f, cw, f);
    }
    placeStickers();
  }
  function placeStickers() {
    const k = view.w / VW;
    stickerBox.querySelectorAll(".sticker").forEach((el, n) => {
      const s = window.STICKERS[n];
      const size = s.r * 2 * k * 1.04;
      el.style.left = `${view.x + s.x * k}px`; el.style.top = `${view.y + s.y * k}px`;
      el.style.width = el.style.height = `${size}px`;
    });
  }

  /* ================= Scroll ================= */
  const stations = $$(".station");
  const rail = $$(".rail li"), railEl = $(".rail");
  const hint = $(".hint"), bar = $(".bar"), scrimTop = $(".scrim-top");
  const progress = () => {
    const total = story.offsetHeight - window.innerHeight;
    return clamp(-story.getBoundingClientRect().top / total);
  };
  function fade(p, from, to) {
    const e = 0.018;
    if (p < from || p > to) return 0;
    return Math.min(from <= 0 ? 1 : (p - from) / e, to >= 1 ? 1 : (to - p) / e, 1);
  }
  let current = 0, lastFrame = -1;
  function update(p) {
    targetFrame = Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1)));
    const zooming = ch > cw && current > 0.73 && current < 0.83;
    if (targetFrame !== lastFrame || needsDraw || zooming) {
      const img = nearest(targetFrame);
      if (img) { draw(img); lastFrame = targetFrame; needsDraw = false; }
    }
    let topVis = 0;
    const wide = window.innerWidth > 760;
    for (const s of stations) {
      const o = fade(p, +s.dataset.from, +s.dataset.to);
      s.style.opacity = o;
      s.style.visibility = o > 0.01 ? "visible" : "hidden";
      if (s.classList.contains("is-top")) topVis = Math.max(topVis, o);
      else if (wide && !reduceMotion) s.style.transform = `translateY(calc(-50% + ${(1 - o) * 22}px))`;
    }
    scrimTop.style.opacity = topVis;
    let on = 0;
    rail.forEach((li, i) => { if (p >= +li.dataset.at) on = i; });
    rail.forEach((li, i) => { li.classList.toggle("is-on", i === on); li.classList.toggle("is-done", i < on); });
    railEl.style.opacity = 1 - clamp((p - 0.77) / 0.02);
    const sOp = clamp((p - 0.968) / 0.022);
    stickerBox.querySelectorAll(".sticker").forEach((el) => (el.style.opacity = sOp));
    hint.style.opacity = p > 0.015 ? 0 : 1;
  }
  function tick() {
    const target = progress();
    current = reduceMotion ? target : current + (target - current) * 0.15;
    if (Math.abs(target - current) < 0.0003) current = target;
    update(current);
    bar.classList.toggle("is-solid", window.scrollY > story.offsetHeight - window.innerHeight - 10);
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  resize();
  applyLang(lang);
  requestAnimationFrame(tick);
})();
