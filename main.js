/* =====================================================================
   MAIN.JS — behaviour of the whole website
   ---------------------------------------------------------------------
   You normally do NOT need to edit this file.
   Texts and images live in content.js.

   01  HELPERS
   02  IMAGES (finds .png / .jpg / .jpeg automatically)
   03  HEADER & MENU
   04  SCROLL ENGINE (pinned scenes, steps, curtain reveals)
   05  FLYING TITLES (centre → header)
   06  POP-UP CARDS
   10  MAIN PAGE
   20  CERTIFICATES PAGE
   30  STORYTELLER PAGE
   40  PROJECT PAGE
   99  START
   ===================================================================== */
(() => {
"use strict";

/* =====================================================================
   01  HELPERS
   ===================================================================== */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const DESK = window.matchMedia("(min-width: 900px) and (min-height: 560px)");
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isDesk = () => DESK.matches;
const page = document.body.dataset.page;

const ICON = {
  ne: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 10 10 2M4 2h6v6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  se: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 4v6H4" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
  e:  '<svg viewBox="0 0 14 12" aria-hidden="true"><path d="M1 6h11M8 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  w:  '<svg viewBox="0 0 14 12" aria-hidden="true"><path d="M13 6H2M6 2 2 6l4 4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
};
const html = (strings, ...vals) => strings.reduce((a, s, i) => a + s + (i < vals.length ? vals[i] ?? "" : ""), "");
const make = (markup) => { const t = document.createElement("template"); t.innerHTML = markup.trim(); return t.content.firstElementChild; };
const plusLink = (label, attrs = "", cls = "") => {
  const txt = String(label).replace(/^\+\s*/, "");
  return `<button class="plus-link ${cls}" ${attrs}><span class="p">+</span><span>${txt}</span></button>`;
};
const linkAttrs = (url) => url ? `href="${url}" target="_blank" rel="noopener"` : `href="#" data-empty-link`;


/* =====================================================================
   02  IMAGES — <img data-img="NAME"> tries NAME.png → .jpg → .jpeg
   ===================================================================== */
function img(name, cls = "", alt = "") {
  return name ? `<img data-img="${name}" class="${cls}" alt="${alt}" decoding="async">` : "";
}
function hydrateImages(root = document) {
  $$("img[data-img]", root).forEach(el => {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const base = el.dataset.img.startsWith("Source/") ? el.dataset.img : "Source/" + el.dataset.img;
    const exts = /\.(png|jpe?g|gif|webp|svg)$/i.test(base) ? [""] : [".png", ".jpg", ".jpeg"];
    let i = 0;
    const next = () => {
      if (i >= exts.length) { el.classList.add("img-missing"); el.onerror = null; el.closest("[data-ph]")?.classList.add("is-missing"); return; }
      el.src = encodeURI(base + exts[i++]);
    };
    el.onerror = next;
    el.addEventListener("load", () => { el.classList.remove("img-missing"); el.closest("[data-ph]")?.classList.remove("is-missing"); Engine.requestLayout(); });
    next();
  });
}


/* =====================================================================
   03  HEADER & MENU
   ===================================================================== */
function buildMenu() {
  const menu = make(html`
    <nav class="menu" aria-hidden="true">
      <button class="menu-close" aria-label="Close menu">+</button>
      <ul class="menu-list">${MENU.map(m => `<li><a href="${m.href}">${m.label}</a></li>`).join("")}</ul>
      <p class="menu-foot">${SITE.copyright}</p>
    </nav>`);
  document.body.appendChild(menu);
  const open = () => { menu.classList.add("is-open"); menu.setAttribute("aria-hidden", "false"); };
  const close = () => { menu.classList.remove("is-open"); menu.setAttribute("aria-hidden", "true"); };
  $$(".hdr-burger, .side-menu").forEach(b => b.addEventListener("click", open));
  $(".menu-close", menu).addEventListener("click", close);
  $$("a", menu).forEach(a => a.addEventListener("click", e => {
    const [file, hash] = a.getAttribute("href").split("#");
    if (page === "main" && file === "index.html" && hash) {   // same page → smooth scroll
      e.preventDefault(); close(); scrollToId(hash);
    } else close();
  }));
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

  // logo always goes home
  $$(".hdr-logo").forEach(l => l.addEventListener("click", e => {
    if (page === "main") { e.preventDefault(); scrollToId("home"); }
  }));
}
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = id === "home" ? 0 : el.getBoundingClientRect().top + scrollY + 2;
  window.scrollTo({ top: y, behavior: REDUCED ? "auto" : "smooth" });
}
// empty links (LinkedIn / YouTube not filled yet) do nothing
document.addEventListener("click", e => {
  if (e.target.closest("[data-empty-link]")) e.preventDefault();
  const s = e.target.closest("[data-scroll]");
  if (s) { e.preventDefault(); scrollToId(s.dataset.scroll); }
});


/* =====================================================================
   04  SCROLL ENGINE
   ---------------------------------------------------------------------
   <section class="pin" data-steps="N">  → pinned for N steps (desktop).
   Inside:  data-step="k"  → gets .is-on from step k onward
            data-only="k"  → gets .is-on only at step k
   Elsewhere / mobile: elements get .is-on when they scroll into view.
   ===================================================================== */
const Engine = {
  pins: [], flowEls: [], frameHooks: [], layoutHooks: [], lastY: -1, needLayout: true,
  stepLen() { return window.innerHeight * 0.72; },
  isPinned(sec) { return isDesk() || sec.hasAttribute("data-pin-mobile"); },

  init() {
    this.pins = $$(".pin").map(sec => ({
      sec, stepsDesk: +sec.dataset.steps || 0, steps: +sec.dataset.steps || 0, step: null, t: -9, top: 0,
      els: [], onStep: null, onFrame: null
    }));
    addEventListener("resize", () => this.requestLayout());
    DESK.addEventListener?.("change", () => this.requestLayout());
    if (document.fonts) document.fonts.ready.then(() => this.requestLayout());
    addEventListener("load", () => this.requestLayout());
    const loop = (time) => { this.frame(time); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  },
  get(sec) { return this.pins.find(p => p.sec === sec); },
  requestLayout() { this.needLayout = true; },

  layout() {
    const L = this.stepLen(), vh = innerHeight;
    this.pins.forEach(p => {
      p.pinned = this.isPinned(p.sec);
      p.steps = (!isDesk() && p.sec.dataset.stepsMobile !== undefined) ? +p.sec.dataset.stepsMobile : p.stepsDesk;
      p.sec.style.height = p.pinned ? (vh + p.steps * L) + "px" : "";
    });
    this.pins.forEach(p => {
      p.top = p.sec.getBoundingClientRect().top + scrollY; p.step = null;
      p.els = $$("[data-step],[data-only]", p.sec);
    });
    this.flowEls = $$("[data-step],[data-only],[data-reveal]").filter(el => {
      const p = this.pins.find(q => q.sec.contains(el));
      return !p || !p.pinned;
    });
    this.layoutHooks.forEach(fn => fn());
    this.needLayout = false;
    this.lastY = -1;
  },

  frame(time) {
    if (this.needLayout) this.layout();
    const y = scrollY, vh = innerHeight, L = this.stepLen();
    const moved = y !== this.lastY;
    this.lastY = y;

    this.pins.forEach(p => {
      p.t = (y - p.top) / L;
      if (!p.pinned) return;
      const step = clamp(Math.floor(p.t + 0.3), -1, p.steps);
      if (step !== p.step) {
        p.step = step;
        p.sec.dataset.stepNow = step;
        p.els.forEach(el => {
          if (el.dataset.step !== undefined) el.classList.toggle("is-on", step >= +el.dataset.step);
          else el.classList.toggle("is-on", step === +el.dataset.only);
        });
        p.onStep && p.onStep(step);
      }
    });

    if (moved) this.flowEls.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) el.classList.add("is-on");
      else if (r.top > vh) el.classList.remove("is-on");
    });

    this.pins.forEach(p => p.onFrame && p.onFrame(p.t, time, p));
    this.frameHooks.forEach(fn => fn(time, moved));
  },

  // jump to a step of a pinned section (or to the element on mobile)
  goToStep(sec, k, el) {
    const p = this.get(sec);
    let top;
    if (p && p.pinned) top = p.top + (k + 0.12) * this.stepLen();
    else top = (el || sec).getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64) - 10;
    window.scrollTo({ top, behavior: REDUCED ? "auto" : "smooth" });
  }
};


/* =====================================================================
   05  FLYING TITLES
   ---------------------------------------------------------------------
   <h2 class="sec-title" data-title="SOLUTIONS"> inside a section:
   a copy flies from the centre (big, gray) into the header (navy).
   ===================================================================== */
const GRAY = [171, 171, 171], NAVY = [0, 45, 85];
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(" ")})`;
const Flyers = {
  list: [],
  init() {
    $$(".sec-title[data-title]").forEach(slot => {
      const el = make(`<div class="flyer flyer-title" aria-hidden="true"><span class="plus">+&nbsp;</span>${slot.dataset.title}</div>`);
      document.body.appendChild(el);
      slot.innerHTML = `+&nbsp;${slot.dataset.title}`;
      const sec = slot.closest(".pin, section");
      this.list.push({ slot, el, sec, plus: $(".plus", el) });
    });
    Engine.layoutHooks.push(() => this.measure());
    Engine.frameHooks.push(() => this.update());
  },
  measure() {
    this.list.forEach(f => {
      f.w = f.el.offsetWidth; f.h = f.el.offsetHeight;
      f.S = parseFloat(getComputedStyle(f.slot).fontSize) / parseFloat(getComputedStyle(f.el).fontSize);
      f.pin = Engine.get(f.sec);
      const r = f.slot.getBoundingClientRect();
      f.y0 = Math.min(innerHeight * 0.3, r.top + scrollY + r.height / 2);
    });
  },
  update() {
    const anchor = $(".hdr-anchor");
    if (!anchor || !this.list.length) return;
    const a = anchor.getBoundingClientRect(), vh = innerHeight;
    this.list.forEach((f, i) => {
      const r = f.slot.getBoundingClientRect();
      let p;
      if (f.pin && f.pin.pinned) p = clamp(f.pin.t / 0.6);
      else p = clamp((f.y0 - (r.top + r.height / 2)) / (vh * 0.2));
      const e = ease(p);
      const x = lerp(r.left, a.left - f.w, e);
      const y = lerp(r.top, a.top + a.height / 2 - f.h / 2, e);
      const s = lerp(f.S, 1, e);
      let o = 1;
      const next = this.list[i + 1];
      if (next) o = clamp((next.sec.getBoundingClientRect().top - vh * 0.15) / (vh * 0.55));
      if (r.top > vh && e === 0) o = 0;
      f.el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
      f.el.style.color = mix(GRAY, NAVY, e);
      f.el.style.opacity = o;
      f.plus.style.opacity = 1 - e;
    });
  }
};


/* =====================================================================
   06  POP-UP CARDS — any element with data-card="id" opens CARDS[id]
   ===================================================================== */
const Cards = {
  init() {
    this.layer = make(html`
      <div class="card-layer" aria-hidden="true">
        <div class="card-backdrop"></div>
        <article class="card" role="dialog" aria-modal="true">
          <button class="card-close" aria-label="Close">+</button>
          <figure class="card-media"><img alt=""><figcaption></figcaption><div class="card-dots"></div></figure>
          <div class="card-body"><h3></h3><p></p><h4></h4><ul></ul><div class="card-link"></div></div>
        </article>
      </div>`);
    document.body.appendChild(this.layer);
    $(".card-backdrop", this.layer).addEventListener("click", () => this.close());
    $(".card-close", this.layer).addEventListener("click", () => this.close());
    document.addEventListener("keydown", e => e.key === "Escape" && this.close());
    document.addEventListener("click", e => {
      const t = e.target.closest("[data-card]");
      if (t) { e.preventDefault(); this.open(t.dataset.card); }
    });
  },
  open(id) {
    const c = (typeof CARDS !== "undefined" && CARDS[id]) || { title: "" };
    const L = this.layer, card = $(".card", L), media = $(".card-media", L);
    const images = (c.images || []).filter(Boolean);
    card.className = "card " + (images.length ? "card--media" : "card--text");
    media.hidden = !images.length;
    $("figcaption", media).innerHTML = c.caption || "";
    $("figcaption", media).hidden = !c.caption;
    const im = $("img", media), dots = $(".card-dots", media);
    const show = (k) => {
      im.removeAttribute("data-done"); im.dataset.img = images[k]; hydrateImages(media);
      $$("button", dots).forEach((b, j) => b.classList.toggle("is-on", j === k));
    };
    dots.innerHTML = images.length > 1 ? images.map((_, k) => `<button aria-label="Image ${k + 1}"></button>`).join("") : "";
    $$("button", dots).forEach((b, k) => b.addEventListener("click", () => show(k)));
    if (images.length) show(0);

    const body = $(".card-body", L);
    $("h3", body).innerHTML = c.title || "";
    const hasAny = c.text || (c.list && c.list.length) || images.length;
    $("p", body).innerHTML = c.text || (hasAny ? "" : '<span class="card-empty">Content coming soon.</span>');
    $("p", body).hidden = !$("p", body).innerHTML;
    $("h4", body).innerHTML = (c.list && c.list.length) ? (c.listTitle || "") : "";
    $("h4", body).hidden = !$("h4", body).innerHTML;
    $("ul", body).innerHTML = (c.list || []).map(li => `<li>${li}</li>`).join("");
    $("ul", body).hidden = !(c.list && c.list.length);
    $(".card-link", body).innerHTML = c.link ? `<a class="pill pill--navy" ${linkAttrs(c.link.url)}>${c.link.label}</a>` : "";
    if (card.classList.contains("card--text")) $$(".pill", body).forEach(p => p.classList.replace("pill--navy", "pill--ghost"));

    L.classList.add("is-open"); L.setAttribute("aria-hidden", "false");
    setTimeout(() => $(".card-close", L).focus({ preventScroll: true }), 60);
  },
  close() { this.layer.classList.remove("is-open"); this.layer.setAttribute("aria-hidden", "true"); }
};


/* =====================================================================
   10  MAIN PAGE
   ===================================================================== */
function initMain() {
  /* ---- 10.1 hero: name + buttons fly into the header ---- */
  const name = make(`<a class="flyer flyer-name" href="#home" aria-label="${SITE.name}"><span class="fp">${SITE.name}</span></a>`);
  const ctaMarkup = `<div class="cta"><a class="btn-cv" href="${SITE.cv}" download>CV${ICON.se}</a><a class="pill" href="storyteller.html" target="_blank" rel="noopener">STORYTELLER</a></div>`;
  const cta = make(`<div class="flyer flyer-cta">${ctaMarkup}</div>`);
  $(".hdr-slot-cta").innerHTML = ctaMarkup;
  document.body.append(name, cta);
  name.addEventListener("click", e => { e.preventDefault(); scrollToId("home"); });
  // when the entrance (focus pull) ends, release its GPU layer so the text stays sharp
  $(".fp", name).addEventListener("animationend", ev => { ev.target.style.animation = "none"; ev.target.style.opacity = "1"; });

  const solutions = $("#solutions");
  let nm = {}, cm = {};
  Engine.layoutHooks.push(() => {
    nm = { w: name.offsetWidth, h: name.offsetHeight };
    cm = { w: cta.offsetWidth, h: cta.offsetHeight };
  });
  Engine.frameHooks.push(() => {
    const vw = document.documentElement.clientWidth, vh = innerHeight;
    const pad = parseFloat(getComputedStyle($(".hdr")).paddingLeft);
    const e = ease(clamp(scrollY / (vh * 0.7)));
    const ns = $(".hdr-slot-name").getBoundingClientRect();
    const S0 = (vw - pad * 2) / nm.w;
    if (e >= 1) {   // landed in the header: plain text at whole pixels (sharp edges)
      name.style.transform = "none"; name.style.willChange = "auto";
      name.style.left = Math.round(ns.left) + "px"; name.style.top = Math.round(ns.top) + "px";
    } else {
      name.style.left = name.style.top = name.style.willChange = "";
      name.style.transform = `translate3d(${lerp(pad, ns.left, e)}px, ${lerp(vh * 0.055, ns.top, e)}px, 0) scale(${lerp(S0, 1, e)})`;
    }
    const cs = $(".hdr-slot-cta").getBoundingClientRect();
    cta.style.transform = `translate3d(${lerp(vw - pad - cm.w, cs.left, e)}px, ${lerp(vh * 0.9 - cm.h, cs.top, e)}px, 0)`;

    const nav = solutions.getBoundingClientRect().top < vh * 0.55;
    document.body.classList.toggle("hdr-nav", nav);
    document.body.classList.toggle("hdr-intro", !nav);
    document.body.classList.toggle("show-side-menu", !nav && scrollY > vh * 0.6);
  });

  /* ---- 10.2 solutions ---- */
  initSolutions();
  /* ---- 10.3 key projects ---- */
  initKeyProjects();
  /* ---- 10.4 contacts ---- */
  initContacts();
}

/* ---------- 10.2 SOLUTIONS : floating network ---------- */
function initSolutions() {
  const sec = $("#solutions"), stage = $(".stage", sec);
  const net = $(".net", sec), svg = $(".net-lines", sec), core = $(".net-core", sec);
  const panels = $(".sol-panels", sec);

  // panels
  panels.innerHTML = SOLUTIONS.map((s, i) => html`
    <article class="sol-panel rv" id="solution-${i + 1}" data-only="${4 + i}">
      <h3>+ ${s.label}</h3>
      <p class="sol-intro">${s.intro}</p>
      <div class="tags">${s.tools.map(t => `<span class="tag">${t}</span>`).join("")}</div>
      <div class="sol-pr">
        <p><b>Problem:</b> ${s.problem}</p>
        <p><b>Result:</b> ${s.result}</p>
      </div>
    </article>`).join("");

  // nodes
  const OVER = [ // position relative to the core (fraction of stage w / h) + label placement
    { x: -0.065, y:  0.20, lab: "translate(-50%, 12px)" },
    { x: -0.135, y: -0.07, lab: "translate(calc(-100% + 14px), -26px)" },
    { x:  0.115, y: -0.14, lab: "translate(-14px, -26px)" },
    { x:  0.125, y:  0.10, lab: "translate(-10px, 10px)" }
  ];
  const OVER_M = [ { x: -0.18, y: 0.30 }, { x: -0.30, y: -0.14 }, { x: 0.22, y: -0.30 }, { x: 0.28, y: 0.16 } ];
  const nodes = SOLUTIONS.map((s, i) => {
    const n = make(`<div class="net-node"><i></i><button>+ ${s.label}</button></div>`);
    net.appendChild(n);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    svg.appendChild(line);
    $("button", n).addEventListener("click", () => Engine.goToStep(sec, 4 + i, $(`#solution-${i + 1}`)));
    return { n, line, btn: $("button", n), x: 0, y: 0, ph: Math.random() * 6.28, sp: 0.7 + Math.random() * 0.6 };
  });
  core.addEventListener("click", () => Engine.goToStep(sec, 3));

  // ambient floating dots
  const cv = $(".dots-canvas", sec), ctx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1, dots = [];
  const sizeCanvas = () => {
    const r = stage.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr;
    const count = Math.round(clamp(W * H / 26000, 18, 60));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: 0.8 + Math.random() * 2.2,
      vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22, a: .12 + Math.random() * .4
    }));
  };
  Engine.layoutHooks.push(sizeCanvas);

  const pin = () => Engine.get(sec);
  let amp = 0, speed = 1, cx = 0, cy = 0;
  pin().onStep = (step) => {
    sec.classList.toggle("net-core-on", step >= 2);
    sec.classList.toggle("net-open", step >= 3);
  };
  pin().onFrame = (t, time) => {
    const r = stage.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const desk = pin().pinned, step = pin().step ?? -1;
    const nb = net.getBoundingClientRect();
    const w = nb.width, h = nb.height;
    const detail = desk && step >= 4, active = detail ? step - 4 : -1;

    // targets
    const tcx = detail ? 0.625 * w : 0.5 * w, tcy = detail ? 0.565 * h : (desk ? 0.53 : 0.5) * h;
    const k = REDUCED ? 1 : 0.07;
    cx = cx ? lerp(cx, tcx, k) : tcx; cy = cy ? lerp(cy, tcy, k) : tcy;
    amp = lerp(amp, (detail ? 0.006 : 0.03) * Math.min(w, h), 0.05);
    speed = lerp(speed, detail ? 0.3 : 1, 0.05);
    core.style.transform = `translate(${cx}px, ${cy}px)`;

    nodes.forEach((nd, i) => {
      let tx, ty;
      if (detail) { tx = 0.765 * w; ty = (0.43 + i * 0.09) * h; }
      else if (desk) { tx = tcx + OVER[i].x * w; ty = tcy + OVER[i].y * h; }
      else { tx = tcx + OVER_M[i].x * w; ty = tcy + OVER_M[i].y * h; }
      nd.x = nd.x ? lerp(nd.x, tx, k) : tx; nd.y = nd.y ? lerp(nd.y, ty, k) : ty;
      const ft = REDUCED ? 0 : time * 0.0006 * nd.sp;
      const fx = nd.x + Math.sin(ft + nd.ph) * amp, fy = nd.y + Math.cos(ft * 0.83 + nd.ph * 1.7) * amp;
      nd.n.style.transform = `translate(${fx}px, ${fy}px)`;
      nd.btn.style.transform = detail ? "translate(-8px, -26px)"
        : desk ? OVER[i].lab
        : (OVER_M[i].x > 0 ? "translate(calc(-100% + 8px), -26px)" : "translate(-8px, -26px)");
      nd.n.classList.toggle("is-on", i === active);
      nd.line.setAttribute("x1", cx); nd.line.setAttribute("y1", cy);
      nd.line.setAttribute("x2", fx); nd.line.setAttribute("y2", fy);
      nd.line.classList.toggle("is-on", i === active);
    });

    // dots
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      if (!REDUCED) { d.x += d.vx * speed; d.y += d.vy * speed; }
      if (d.x < -5) d.x = W + 5; if (d.x > W + 5) d.x = -5;
      if (d.y < -5) d.y = H + 5; if (d.y > H + 5) d.y = -5;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283);
      ctx.fillStyle = `rgba(0,45,85,${d.a})`; ctx.fill();
    });
  };
}

/* ---------- 10.3 KEY PROJECTS ---------- */
function initKeyProjects() {
  const sec = $("#key-projects"), wrap = $(".kp-wrap", sec), dots = $(".kp-dots", sec);
  sec.dataset.steps = PROJECTS.length;
  wrap.innerHTML = PROJECTS.map((p, i) => html`
    <article class="kp" data-step="${i + 1}" style="z-index:${i + 1}">
      <div class="kp-embed" data-embed="${p.embed || ""}"></div>
      <div class="kp-card">
        <h3 class="kp-title">${p.id} | ${p.title}</h3>
        <p class="kp-tools">${p.tools}</p>
        <p><b>Challenge:</b> ${p.challenge}</p>
        <p><b>Solution:</b> ${p.solution}</p>
        <a class="plus-link" href="project.html?id=${encodeURIComponent(p.id)}" target="_blank" rel="noopener"><span class="p">+</span><span>See the project</span></a>
      </div>
    </article>`).join("");
  dots.innerHTML = PROJECTS.map((p, i) => `<button aria-label="Project ${p.id}"></button>`).join("");
  $$("button", dots).forEach((b, i) => b.addEventListener("click", () => Engine.goToStep(sec, i + 1)));
  loadEmbeds(sec);
  const p = Engine.get(sec); p.stepsDesk = PROJECTS.length;
  p.onStep = (step) => $$("button", dots).forEach((b, i) => b.classList.toggle("is-on", i === clamp(step - 1, 0, PROJECTS.length - 1)));
}
function loadEmbeds(root) {
  $$("[data-embed]", root).forEach(box => {
    const src = box.dataset.embed;
    if (!src || location.protocol === "file:") return;
    fetch(src, { method: "HEAD" }).then(r => {
      if (r.ok) box.innerHTML = `<iframe src="${src}" title="Project preview" loading="lazy"></iframe>`;
    }).catch(() => {});
  });
}

/* ---------- 10.4 CONTACTS ---------- */
function initContacts() {
  $(".ct-pages").innerHTML = MENU.map(m => `<li><a href="${m.href}">${m.label}</a></li>`).join("");
  $$(".ct-pages a").forEach(a => a.addEventListener("click", e => { e.preventDefault(); scrollToId(a.getAttribute("href").split("#")[1]); }));
  $(".ct-contacts").innerHTML = html`
    <li>${SITE.location}</li>
    <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
    <li><a href="tel:${SITE.phone.replace(/\s/g, "")}">${SITE.phone}</a></li>
    <li><a ${linkAttrs(SITE.linkedin)}>LinkedIn${ICON.ne}</a></li>
    <li><a ${linkAttrs(SITE.youtube)}>YouTube${ICON.ne}</a></li>`;
  $(".ct-cta").innerHTML = `<a class="pill pill--navy" href="storyteller.html" target="_blank" rel="noopener">STORYTELLER</a><a class="btn-cv" href="${SITE.cv}" download>CV${ICON.se}</a>`;
  $(".ct-copy").textContent = SITE.copyright;
  $(".ct-top").addEventListener("click", () => scrollToId("home"));
}


/* =====================================================================
   20  CERTIFICATES PAGE
   ===================================================================== */
function initCertificates() {
  const sec = $("#certificates"), track = $(".cert-track", sec), dots = $(".cert-dots", sec);
  const N = CERTIFICATES.length, pad = n => String(n).padStart(2, "0");
  sec.dataset.steps = N;
  track.innerHTML = CERTIFICATES.map((c, i) => html`
    <article class="cert rv-x" style="z-index:${i + 1}" data-i="${i}">
      <div class="cert-img" data-ph="${c.image}">${img(c.image, "", c.title)}</div>
      <div class="cert-card">
        <p class="cert-count">Certificate ${pad(i + 1)}/${pad(N)}</p>
        <h2 class="cert-title">${pad(i + 1)} | ${c.title}</h2>
        <p class="cert-text">${c.text}</p>
        <div class="cert-rows">
          <div><span>Course hour:</span><span>${c.hours}</span></div>
          <div><span>Issued by:</span><span>${c.issuer}</span></div>
          <div><span>Year:</span><span>${c.year}</span></div>
        </div>
      </div>
    </article>`).join("");
  dots.innerHTML = CERTIFICATES.map((_, i) => `<button aria-label="Certificate ${i + 1}"></button>`).join("");
  const certs = $$(".cert", track), btns = $$("button", dots);
  const setActive = (a) => {
    certs.forEach((c, i) => c.classList.toggle("is-on", i <= a));
    btns.forEach((b, i) => b.classList.toggle("is-on", i === a));
  };
  btns.forEach((b, i) => b.addEventListener("click", () => {
    if (isDesk()) Engine.goToStep(sec, i + 1);
    else track.scrollTo({ left: certs[i].offsetLeft - track.offsetLeft - 20, behavior: "smooth" });
  }));
  const p = Engine.get(sec); p.stepsDesk = N;
  p.onStep = (step) => { if (isDesk()) setActive(step - 1); };
  // mobile: swipe carousel
  const io = new IntersectionObserver(entries => {
    if (isDesk()) return;
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-on"); btns.forEach((b, i) => b.classList.toggle("is-on", i === +en.target.dataset.i)); } });
  }, { root: track, threshold: 0.6 });
  certs.forEach(c => io.observe(c));
  Engine.layoutHooks.push(() => { if (!isDesk()) { certs.forEach(c => c.getBoundingClientRect().left < innerWidth && c.classList.add("is-on")); } });
}


/* =====================================================================
   30  STORYTELLER PAGE
   ===================================================================== */
/* window shapes in % of the scene (x, y). "edge" = the line that is drawn,
   the navy area = edge + bottom corners. "box" = where moments live. */
const SHAPES = {
  desk: {
    right:  { edge: [[0, 87.4], [33.6, 87.4], [33.6, 4.7], [100, 4.7]],   box: [33.6, 4.7, 100, 87.4], axis: "y" },
    left:   { edge: [[0, 24.6], [72, 24.6], [72, 90.6], [100, 90.6]],     box: [0, 24.6, 72, 100],     axis: "y" },
    bottom: { edge: [[0, 25.7], [71.5, 25.7], [71.5, 7.6], [100, 7.6]],   box: [0, 25.7, 100, 100],    axis: "y" },
    frame:  { edge: [[0, 91], [97, 91], [97, 17.4], [100, 17.4]],         box: [0, 0, 97, 80],         axis: "x" },
    today:  { edge: [[0, 0], [100, 0]],                                   box: [0, 0, 100, 100],       axis: "none" }
  },
  mob: {
    right:  { edge: [[0, 29], [100, 29]], box: [0, 29, 100, 100], axis: "y" },
    left:   { edge: [[0, 29], [100, 29]], box: [0, 29, 100, 100], axis: "y" },
    bottom: { edge: [[0, 29], [100, 29]], box: [0, 29, 100, 100], axis: "y" },
    frame:  { edge: [[0, 94], [96, 94], [96, 36], [100, 36]], box: [0, 0, 96, 90], axis: "x" },
    today:  { edge: [[0, 0], [100, 0]], box: [0, 0, 100, 100], axis: "none" }
  }
};
const ROMAN = ["I", "II", "III", "IV", "V"];

function momentHTML(m, chapter) {
  const P = {
    note:    m.note ? `<p class="mo-note">${m.note}</p>` : "",
    year:    m.year ? `<p class="mo-year">${m.year}</p>` : "",
    title:   m.title ? `<p class="mo-title">${m.title}</p>` : "",
    heading: m.heading ? `<p class="mo-heading">${m.heading}</p>` : "",
    text:    m.text ? `<p class="mo-text">${m.text}</p>` : "",
    after:   m.after ? `<p class="mo-after">${m.after}</p>` : "",
    check:   m.check ? img("STORYTELLER_Checkmark", "mo-check", "done") : "",
    links:   (m.links && m.links.length) || m.goto ? `<div class="mo-links">${
               (m.links || []).map(l => plusLink(l.label, `data-card="${l.card}"`)).join("")}${
               m.goto ? plusLink(m.goto.label, `data-goto="${m.goto.chapter}"`, "mo-goto") : ""}</div>` : ""
  };
  let media = "";
  if (m.shape === "geometry") {
    media = `<div class="mo-media mo-geometry"><svg viewBox="-52 -52 104 104"><circle class="g-shape" r="48" pathLength="1"/><polygon class="g-shape g-inner" points="0,-48 41.6,24 -41.6,24" pathLength="1"/></svg></div>`;
  } else if (m.image && chapter.layout !== "frame") {
    const pic = m.shape === "circle" ? `<div class="disc">${img(m.image)}</div>` : img(m.image);
    const grade = m.grade ? `<div class="mo-grade">${img(m.grade, "", "grade")}${img("STORYTELLER_GradeIcon")}</div>` : "";
    media = `<div class="mo-media">${pic}${grade}</div>`;
  }
  let order, shape = m.shape || "text";
  if (chapter.layout === "frame") {
    const logo = m.image ? `<div class="mo-logo-box">${img(m.image)}</div>` : "";
    order = [P.note, logo, P.title, P.heading, P.text, P.links];
  } else if (!media) order = [P.year, P.title, P.heading, P.text, P.after, P.check, P.links];
  else if (shape === "photo") order = [P.title, P.heading, P.text, media, P.after, P.check, P.links];
  else if (shape === "circle" && m.after) order = [P.heading, P.text, media, P.after,
    m.year ? `<p class="mo-year">${m.year}&nbsp;&nbsp;<b>${m.title || ""}</b></p>` : P.title, P.links];
  else if (shape === "circle") order = [media, P.year, P.heading, P.title, P.text, P.after, P.links];
  else if (shape === "plain" && m.year) order = [P.year, media, P.title, P.text, P.links];
  else if (shape === "geometry") order = [media, P.heading, P.text, P.links];
  else order = [P.heading, media, P.text, P.after, P.links];
  const tick = m.check && !media && chapter.layout !== "frame";
  if (tick) order = [P.check, ...order.filter(x => x !== P.check)];
  const logos = m.logos ? `<div class="mo-logos">${m.logos.map(l => `<div>${img(l.image)}<span>${l.text}</span></div>`).join("")}</div>` : "";
  return `<div class="mo mo--${media ? shape : "text"}${tick ? " mo--tick" : ""}">${order.join("")}${logos}</div>`;
}

function initStory() {
  const main = $("#story");
  const chapters = STORY.chapters;

  /* ---- 30.1 build sections ---- */
  let out = html`
    <section class="pin st-intro" id="story-intro" data-steps="1" data-pin-mobile>
      <div class="stage">
        <h2 class="sec-title" data-title="${STORY.intro.title}"></h2>
        <div class="st-intro-panel" data-step="1">
          <h1>${STORY.intro.title}</h1>
          <p>${STORY.intro.text}</p>
        </div>
      </div>
    </section>
    <section class="pin st-list" id="chapters" data-steps="${chapters.length + 1}" data-pin-mobile>
      <div class="stage">
        <nav class="st-chapters" aria-label="Chapters">${chapters.map((c, i) =>
          `<button data-step="${i + 1}" data-goto="${i}"><span class="p">+</span> ${c.title}</button>`).join("")}</nav>
        <p class="st-hint" data-step="${chapters.length + 1}">Choose a chapter — or keep scrolling.</p>
      </div>
    </section>`;

  chapters.forEach((c, ci) => {
    const today = c.layout === "today";
    const steps = today ? 4 : c.moments.length + 1;
    let inner;
    if (today) {
      const T = c.today;
      inner = html`
        <div class="today">
          <div class="today-portrait" data-step="1"><svg viewBox="-55 -55 110 110"><circle r="53" pathLength="1"/></svg>
            <div class="disc">${img("MAIN_ProfilePicture", "", SITE.name)}</div><span class="today-dot"></span></div>
          <div class="today-copy">
            <div class="rv" data-step="2"><p class="today-lead">${T.lead}</p><p class="today-role">${T.role}</p></div>
            <div class="today-focus rv" data-step="3"><h3>${T.focusTitle}</h3>
              <ul>${T.focus.map(f => `<li>${plusLink(f.label, `data-card="${f.card}"`)}</li>`).join("")}</ul></div>
            <div class="today-close rv" data-step="4"><p>${T.closing}</p>
              <div class="row">
                <a class="pill pill--ghost" href="index.html#key-projects">+ KEY PROJECTS</a>
                <a class="pill pill--ghost" href="index.html#contacts">+ CONTACTS</a>
                <a class="btn-cv" href="${SITE.cv}" download>CV${ICON.se}</a>
              </div></div>
          </div>
        </div>`;
    } else {
      inner = html`
        <div class="ch-track-box"><div class="ch-track">
          <svg class="thread"><defs><mask id="thread-mask-${ci}" maskUnits="userSpaceOnUse" x="-20000" y="-20000" width="60000" height="60000"><path class="msk"/></mask></defs>
            <path class="dash" mask="url(#thread-mask-${ci})"/><g class="pins"></g></svg>
          ${c.moments.map(m => momentHTML(m, c)).join("")}
        </div></div>`;
    }
    out += html`
      <section class="pin ch ch--${c.layout}" id="chapter-${ci + 1}" data-steps="${steps}" data-pin-mobile data-ch="${ci}">
        <div class="stage">
          <div class="ch-scene">
            <div class="ch-window"><div class="ch-fill"></div></div>
            <svg class="ch-outline"><path pathLength="1"/></svg>
            ${c.skyline ? img(c.skyline, "ch-skyline", "") : ""}
            ${c.plane ? img("STORYTELLER_PlaneOutline", "ch-plane", "") + img(c.plane, "ch-plane ch-plane-white", "") : ""}
            <div class="ch-label"><span>+ ${c.title}</span><small>Chapter ${c.roman || ROMAN[ci]}</small></div>
            ${inner}
          </div>
        </div>
      </section>`;
  });
  main.innerHTML = out;

  // progress bar
  const bar = make(`<div class="st-progress"><span class="track"></span><span class="fill"></span>${
    chapters.map((c, i) => `<button data-goto="${i}" aria-label="Chapter ${c.roman || ROMAN[i]}"><span>${c.roman || ROMAN[i]}</span></button>`).join("")}</div>`);
  document.body.appendChild(bar);
}

function initStoryBehaviour() {
  const chapters = STORY.chapters;
  const L = () => Engine.stepLen();

  // jump links (chapter list, "+ Go to Chapter …", progress ticks)
  document.addEventListener("click", e => {
    const g = e.target.closest("[data-goto]");
    if (!g) return;
    const sec = $(`#chapter-${+g.dataset.goto + 1}`);
    const p = Engine.get(sec);
    window.scrollTo({ top: p.top + 0.02 * L(), behavior: REDUCED ? "auto" : "smooth" });
  });

  // chapter list: titles turn navy one after the other
  const list = Engine.get($("#chapters"));
  list.onStep = step => $$(".st-chapters button").forEach((b, i) => b.classList.toggle("is-done", step >= i + 2));

  // chapters
  chapters.forEach((c, ci) => {
    const sec = $(`#chapter-${ci + 1}`), p = Engine.get(sec);
    const scene = $(".ch-scene", sec), win = $(".ch-window", sec), fill = $(".ch-fill", sec);
    const outline = $(".ch-outline path", sec), sky = $(".ch-skyline", sec), label = $(".ch-label", sec);
    const planeO = $(".ch-plane:not(.ch-plane-white)", sec), planeW = $(".ch-plane-white", sec);
    const box = $(".ch-track-box", sec), track = $(".ch-track", sec);
    const moments = $$(".mo", sec);
    const svg = $(".thread", sec);
    const dash = svg && $(".dash", svg), msk = svg && $(".msk", svg), pinsG = svg && $(".pins", svg);
    const geo = { shape: null, pos: [], focus: [], lens: [], total: 0, W: 0, H: 0 };
    let cur = null;

    const layout = () => {
      const S = (isDesk() ? SHAPES.desk : SHAPES.mob)[c.layout];
      geo.shape = S;
      const poly = [...S.edge, [100, 100], [0, 100]];
      win.style.clipPath = `polygon(${poly.map(([x, y]) => `${x}% ${y}%`).join(",")})`;
      const sr = scene.getBoundingClientRect();
      geo.sw = sr.width; geo.sh = sr.height;
      outline.ownerSVGElement.setAttribute("viewBox", `0 0 ${sr.width} ${sr.height}`);
      outline.setAttribute("d", "M" + S.edge.map(([x, y]) => `${x / 100 * sr.width} ${y / 100 * sr.height}`).join(" L"));
      if (!box) return;
      const [x0, y0, x1, y1] = S.box;
      Object.assign(box.style, { left: x0 + "%", top: y0 + "%", width: (x1 - x0) + "%", height: (y1 - y0) + "%" });
      const W = box.clientWidth, H = box.clientHeight;
      geo.W = W; geo.H = H;
      const desk = isDesk();
      if (S.axis === "y") {
        const colW = desk ? Math.max(260, W * 0.4) : W * 0.84;
        const xs = desk ? [W * 0.1, W * 0.52] : [W * 0.1, W * 0.1];
        let y = H * 0.12;
        const pts = [];
        moments.forEach((m, i) => {
          const x = xs[i % 2];
          m.style.width = colW + "px"; m.style.left = x + "px"; m.style.top = y + "px";
          const h = m.offsetHeight;
          pts.push({ x, y, h });
          y += h + H * (desk ? 0.24 : 0.2);
        });
        // thread (orthogonal dashed path)
        let d = "", len = 0, lx, ly;
        const lens = [];
        pts.forEach((q, i) => {
          const px = q.x - 18, py = q.y + 9;
          if (i === 0) { d = `M${px} ${-H} V${py}`; len = H + py; lx = px; ly = py; }
          else {
            const prev = pts[i - 1], mid = prev.y + prev.h + (q.y - prev.y - prev.h) / 2;
            d += ` V${mid} H${px} V${py}`;
            len += Math.abs(mid - ly) + Math.abs(px - lx) + Math.abs(py - mid);
            lx = px; ly = py;
          }
          lens.push(len);
        });
        const last = pts[pts.length - 1];
        d += ` V${last.y + last.h + H}`;
        geo.total = len + last.h + H;
        geo.pos = pts; geo.lens = lens;
        geo.focus = pts.map(q => q.y + Math.min(q.h, H * 0.7) / 2);
        svg.setAttribute("width", W); svg.setAttribute("height", y + H);
        svg.style.width = W + "px"; svg.style.height = (y + H) + "px";
        dash.setAttribute("d", d); msk.setAttribute("d", d);
        pinsG.innerHTML = pts.map(q => `<circle class="pin-dot" cx="${q.x - 18}" cy="${q.y + 9}" r="3"/>`).join("");
      } else if (S.axis === "x") {
        const sp = desk ? Math.max(W * 0.4, 360) : W * 0.84;
        const lineY = H * (desk ? 0.22 : 0.16);
        const boxH = moments[0] && $(".mo-logo-box", moments[0]) ? $(".mo-logo-box", moments[0]).offsetHeight : 50;
        const pts = [];
        moments.forEach((m, i) => {
          const x = i * sp;
          m.style.width = (sp * 0.82) + "px"; m.style.left = x + "px";
          const hasLogo = !!$(".mo-logo-box", m);
          m.style.top = (hasLogo ? lineY - boxH / 2 : lineY - m.offsetHeight - 14) + "px";
          pts.push({ x });
        });
        const end = pts[pts.length - 1].x + W;
        const d = `M${-W} ${lineY} H${end}`;
        geo.total = end + W; geo.pos = pts;
        geo.lens = pts.map(q => q.x + W + 4);
        geo.focus = pts.map(q => q.x);
        geo.lineY = lineY;
        svg.setAttribute("width", end); svg.setAttribute("height", H);
        svg.style.width = end + "px"; svg.style.height = H + "px"; svg.style.left = 0;
        dash.setAttribute("d", d); msk.setAttribute("d", d);
        pinsG.innerHTML = "";
      }
      if (msk) { msk.style.strokeDasharray = `${geo.total} ${geo.total}`; }
      cur = null;
    };
    Engine.layoutHooks.push(layout);

    p.onFrame = (t) => {
      if (t < -1.6 || t > p.steps + 1.2) return;
      // opening: line draws → navy pours → skyline & label
      const o = clamp(t);
      const draw = smooth(clamp(o / 0.55));
      outline.style.strokeDashoffset = 1 - draw;
      fill.style.transform = `scaleY(${smooth(clamp((o - 0.3) / 0.55))})`;
      sky && sky.classList.toggle("is-on", o > 0.45);
      label.classList.toggle("is-on", o > 0.5);
      planeW && planeW.classList.toggle("is-on", o > 0.75);
      if (planeO) {
        const S = geo.shape, a = S.edge[0], b = S.edge[1];
        const f = clamp(o / 0.5);
        const px = lerp(a[0] - 8, b[0], f) / 100 * geo.sw, py = lerp(a[1], b[1], f) / 100 * geo.sh;
        const wPl = Math.min(geo.sw * 0.09, 120);
        Object.assign(planeO.style, { width: wPl + "px", left: 0, top: 0,
          transform: `translate(${px - wPl * 0.55}px, ${py - wPl * 0.36}px)`,
          opacity: (o > 0.02 && o < 0.62 && isDesk()) ? 1 : 0, transition: "opacity .4s" });
      }
      if (!box || !geo.pos.length) return;

      // moments: focus moves from one to the next, resting on each
      const n = moments.length;
      const m = clamp(t - 1, 0, n - 1);
      const k = Math.min(Math.floor(m), n - 2 < 0 ? 0 : n - 2), f = n > 1 ? m - k : 0;
      const e = smooth(clamp((f - 0.35) / 0.55));
      const kk = n > 1 ? k : 0, k2 = Math.min(kk + 1, n - 1);
      const focus = lerp(geo.focus[kk], geo.focus[k2], m >= n - 1 ? 1 : e);
      const drawn = lerp(geo.lens[kk], geo.lens[k2], m >= n - 1 ? 1 : e) * (t < 1 ? clamp((t - 0.55) / 0.45) : 1);
      const target = geo.shape.axis === "y" ? geo.H * 0.5 - focus : geo.W * (isDesk() ? 0.3 : 0.06) - focus;
      cur = cur === null ? target : lerp(cur, target, REDUCED ? 1 : 0.12);
      track.style.transform = geo.shape.axis === "y" ? `translate3d(0, ${cur}px, 0)` : `translate3d(${cur}px, 0, 0)`;
      msk.style.strokeDashoffset = geo.total - drawn;
      moments.forEach((mo, i) => mo.classList.toggle("is-on", t > 0.55 && m >= i - 0.45 + (i === 0 ? 0 : 0.1)));
      if (pinsG) $$("circle", pinsG).forEach((cEl, i) => cEl.style.opacity = (t > 0.55 && m >= i - 0.45) ? 1 : 0);
    };
  });

  // progress bar
  const bar = $(".st-progress"), fillEl = $(".fill", bar), ticks = $$("button", bar);
  const secs = chapters.map((_, i) => $(`#chapter-${i + 1}`));
  let start = 0, end = 1;
  Engine.layoutHooks.push(() => {
    const tops = secs.map(s => Engine.get(s).top);
    start = tops[0]; end = tops[tops.length - 1] + 0.9 * L();
    ticks.forEach((b, i) => b.style.left = ((tops[i] - start) / (end - start) * 100) + "%");
    bar.tops = tops;
  });
  Engine.frameHooks.push(() => {
    const y = scrollY;
    bar.classList.toggle("is-on", y > start - innerHeight * 0.4);
    fillEl.style.transform = `scaleX(${clamp((y - start) / (end - start))})`;
    let current = -1;
    ticks.forEach((b, i) => { const done = y >= bar.tops[i] - 2; b.classList.toggle("is-done", done); if (done) current = i; });
    ticks.forEach((b, i) => b.classList.toggle("is-current", i === current));
  });
}


/* =====================================================================
   40  PROJECT PAGE  (project.html?id=01)
   ===================================================================== */
function initProject() {
  const id = new URLSearchParams(location.search).get("id") || PROJECTS[0].id;
  const i = Math.max(0, PROJECTS.findIndex(p => p.id === id));
  const p = PROJECTS[i], next = PROJECTS[(i + 1) % PROJECTS.length];
  document.title = `${p.id} | ${p.title} — ${SITE.name}`;
  $("#project").innerHTML = html`
    <header class="pj-hero">
      <p class="pj-num rv" data-reveal>${p.id} / ${String(PROJECTS.length).padStart(2, "0")}</p>
      <h1 class="pj-title rv" data-reveal>${p.title}</h1>
      <p class="pj-tools rv" data-reveal>${p.tools}</p>
    </header>
    <div class="kp-embed pj-embed rv" data-reveal data-embed="${p.embed || ""}"></div>
    <section class="pj-cols">
      <div class="rv" data-reveal><h2>Challenge</h2><p>${p.challenge}</p></div>
      <div class="rv" data-reveal><h2>Solution</h2><p>${p.solution}</p></div>
    </section>
    <section class="pj-flow">
      <h2 class="rv" data-reveal>Workflow process</h2>
      <div class="pj-steps">${(p.workflow || []).map(s => html`
        <article class="pj-step rv" data-reveal><h3>${s.title}</h3><p>${s.text}</p>${img(s.image)}</article>`).join("")}</div>
    </section>
    <nav class="pj-nav">
      <a href="index.html#key-projects">${ICON.w} Key projects</a>
      <a href="project.html?id=${encodeURIComponent(next.id)}">${next.id} | ${next.title} ${ICON.e}</a>
    </nav>
    <p class="pj-foot">${SITE.copyright}</p>`;
  loadEmbeds($("#project"));
}


/* =====================================================================
   99  START
   ===================================================================== */
function start() {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  // links such as index.html#contacts: jump once the scenes are measured
  if (location.hash) {
    let done = false;
    Engine.layoutHooks.push(() => {
      if (done) return; done = true;
      requestAnimationFrame(() => {
        const el = document.getElementById(location.hash.slice(1));
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY + 2);
      });
    });
  }
  if (page === "story") initStory();
  if (page === "project") initProject();
  $$("[data-icon]").forEach(el => el.insertAdjacentHTML("beforeend", ICON[el.dataset.icon]));
  hydrateImages();
  buildMenu();
  Engine.init();
  Flyers.init();
  Cards.init();
  if (page === "main") initMain();
  if (page === "certificates") initCertificates();
  if (page === "story") initStoryBehaviour();
  hydrateImages();
  Engine.requestLayout();
}
start();
})();
