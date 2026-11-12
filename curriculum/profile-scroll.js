document.addEventListener("DOMContentLoaded", () => {
  const story = document.querySelector("[data-profile-story]");
  if (!story) return;
  const motion = matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
  const compact = matchMedia("(max-width:700px)");
  const disciplines = story.querySelector(".cv-profile-disciplines");
  const slides = [...disciplines.querySelectorAll("[data-profile-slide]")];
  const fills = [...story.querySelectorAll("[data-profile-fill]")].map(element => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const text = [];
    while (walker.nextNode()) if (walker.currentNode.textContent.trim()) text.push(walker.currentNode);
    const overlay = document.createElement("span");
    overlay.className = "cv-fill-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.replaceChildren(...[...element.childNodes].map(node => node.cloneNode(true)));
    element.append(overlay);
    return {element, overlay, text, lines: [], lastMask: ""};
  });
  const range = document.createRange();
  const clamp = value => Math.max(0, Math.min(1, value));
  let frame = 0;
  let needsMeasure = true;
  let entries = [];
  let previousStep = [];

  function measure() {
    disciplines.style.removeProperty("--cv-disciplines-size");
    if (compact.matches) {
      const widest = Math.max(...slides.map(slide => slide.getBoundingClientRect().width));
      const size = parseFloat(getComputedStyle(disciplines).fontSize);
      if (widest) disciplines.style.setProperty("--cv-disciplines-size",
        size * document.documentElement.clientWidth * .90 / widest + "px");
    }
    const openingTop = fills[0].element.getBoundingClientRect().top + scrollY;
    const openingStart = Math.max(24, openingTop - innerHeight * .76);
    const starts = [];
    for (const slide of slides) {
      const visibleAt = slide.getBoundingClientRect().top + scrollY - innerHeight + 8;
      const earliest = starts.length ? starts.at(-1) + 32 : openingStart + 72;
      starts.push(Math.max(visibleAt, earliest));
    }
    const duration = compact.matches ? 115 : 220;
    entries = starts.map((start, index) => ({
      start,
      end: Math.min(start + duration, starts[index + 1] ?? Infinity)
    }));
    previousStep = [];
    for (const [index, fill] of fills.entries()) {
      const box = fill.element.getBoundingClientRect();
      const lines = [];
      for (const node of fill.text) {
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (!rect.width) continue;
          const top = rect.top - box.top;
          const left = rect.left - box.left;
          const right = rect.right - box.left;
          const line = lines.at(-1);
          if (line && Math.abs(line.top - top) < 1) {
            line.left = Math.min(line.left, left);
            line.right = Math.max(line.right, right);
          } else {
            lines.push({top, left, right, bottom:rect.bottom-box.top});
          }
        }
      }
      fill.lines = lines;
      fill.height = box.height;
      const top = box.top + scrollY;
      fill.start = index === 0 ? Math.max(24, top - innerHeight * .76)
        : Math.max(entries.at(-1).end, top - innerHeight * .96);
      fill.end = Math.max(fill.start + 72, top + box.height - innerHeight * (index > 0 && compact.matches ? .81 : .76));
      if (index === 0) fill.end = Math.min(fill.end, Math.max(fill.start + 1, entries[0].start));
      fill.lastMask = "";
    }
    needsMeasure = false;
  }

  function draw() {
    frame = 0;
    if (needsMeasure) measure();
    if (motion.matches) return;
    const scroll = scrollY;
    const distance = 40;
    slides.forEach((element, index) => {
      const {start, end} = entries[index];
      if (compact.matches) {
        element.classList.toggle("is-in-view", scroll >= start);
        return;
      }
      const step = clamp((scroll - start) / (end - start));
      if (step === previousStep[index]) return;
      previousStep[index] = step;
      const eased = step * step * (3 - 2 * step);
      element.style.setProperty("--profile-shift", distance * (1 - eased) * (index % 2 === 0 ? -1 : 1) + "px");
    });
    for (const fill of fills) {
      const {element, overlay, lines} = fill;
      if (!lines.length) continue;
      const position = clamp((scroll - fill.start) / (fill.end - fill.start)) * lines.length;
      const index = Math.min(lines.length - 1, Math.floor(position));
      const line = lines[index];
      const width = line.left + (line.right - line.left) * (position - index);
      const top = index === 0 ? 0 : (lines[index - 1].bottom + line.top) / 2;
      const bottom = index === lines.length - 1 ? fill.height : (line.bottom + lines[index + 1].top) / 2;
      const mask = position === lines.length ? "inset(0)"
        : `polygon(0 0, 100% 0, 100% ${top}px, ${width}px ${top}px, ${width}px ${bottom}px, 0 ${bottom}px)`;
      if (mask === fill.lastMask) continue;
      overlay.style.setProperty("--profile-mask", mask);
      element.classList.add("is-filling");
      fill.lastMask = mask;
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function resize() {
    needsMeasure = true;
    schedule();
  }

  function updateMotion() {
    disciplines.classList.toggle("is-sliding", !motion.matches);
    disciplines.classList.toggle("has-rise-entries", !motion.matches && compact.matches);
    resize();
  }

  addEventListener("scroll", () => { if (!motion.matches) schedule(); }, {passive:true});
  addEventListener("resize", resize);
  compact.addEventListener("change", updateMotion);
  document.fonts?.ready.then(resize);
  motion.addEventListener("change", updateMotion);
  updateMotion();
});

document.addEventListener("DOMContentLoaded", () => {
  for (const list of document.querySelectorAll(".cv-clients:has([data-client-toggle])")) {
    const control = list.querySelector(".cv-client-control");
    const button = control.querySelector("button");
    const items = [...list.children].filter(item => item !== control);
    const mobile = matchMedia("(max-width:700px)");
    let expanded = false;
    let previousWidth = 0;

    function layout() {
      control.hidden = false;
      items.forEach(item => { item.hidden = false; });
      if (expanded) return;
      const gap = parseFloat(getComputedStyle(list).columnGap);
      const rows = mobile.matches ? 2 : 1;
      const available = list.clientWidth;
      const reserved = control.getBoundingClientRect().width + gap;
      let row = 1;
      let used = 0;
      let firstHidden = items.length;
      for (const [index,item] of items.entries()) {
        const width = item.getBoundingClientRect().width;
        const next = used + (used ? gap : 0) + width;
        if (next <= available - (row === rows ? reserved : 0)) {
          used = next;
        } else if (row < rows && width <= available - reserved) {
          row++;
          used = width;
        } else {
          firstHidden = index;
          break;
        }
      }
      items.slice(firstHidden).forEach(item => { item.hidden = true; });
      control.hidden = firstHidden === items.length;
    }

    button.addEventListener("click", () => {
      expanded = !expanded;
      button.setAttribute("aria-expanded", String(expanded));
      button.firstElementChild.textContent = siteText(expanded ? "Ver menos" : "Ver todos los clientes",
        expanded ? "See fewer" : "See all clients");
      layout();
    });
    new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === previousWidth) return;
      previousWidth = entry.contentRect.width;
      layout();
    }).observe(list);
    mobile.addEventListener("change", layout);
    document.fonts?.ready.then(layout);
    layout();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const picker = document.querySelector("[data-cv-switch]");
  if (!picker) return;
  const buttons = [...picker.querySelectorAll("button")];
  const panels = buttons.map(button => document.getElementById(button.getAttribute("aria-controls")));
  picker.setAttribute("role", "tablist");
  picker.setAttribute("aria-label", siteText("Trayectoria", "Career and education"));
  picker.hidden = false;

  function select(index, focus = false, animate = true) {
    picker.dataset.active = index;
    buttons.forEach((button, i) => {
      const active = index === i;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      panels[i].setAttribute("role", "tabpanel");
      panels[i].setAttribute("aria-labelledby", button.id);
      panels[i].hidden = !active;
      panels[i].classList.toggle("is-entering", active && animate);
    });
    if (focus) buttons[index].focus();
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => select(index));
    button.addEventListener("keydown", event => {
      const next = {ArrowLeft:1-index, ArrowRight:1-index, Home:0, End:1}[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(next, true);
    });
  });
  const education = ["#formacion", "#herramientas", "#cv-education"].includes(location.hash);
  select(education ? 1 : 0, false, false);
});

document.addEventListener("DOMContentLoaded", () => {
  const compact = matchMedia("(max-width:700px)");
  const entries = [...document.querySelectorAll(".cv-switch-panel .cv-row,.cv-switch-panel .cv-skills>div")];
  if (!entries.length) return;
  let observer;
  let current = null;
  const candidates = new Set();

  function update() {
    const middle = innerHeight / 2;
    const next = [...candidates].reduce((best, entry) => {
      const {top,bottom} = entry.getBoundingClientRect();
      const distance = Math.abs((top + bottom) / 2 - middle);
      return !best || distance < best.distance ? {entry,distance} : best;
    }, null)?.entry ?? null;
    if (next === current) return;
    current?.classList.remove("is-reading");
    current = next;
    current?.classList.add("is-reading");
  }

  function connect() {
    observer?.disconnect();
    candidates.clear();
    update();
    if (!compact.matches) return;
    observer = new IntersectionObserver(changes => {
      for (const change of changes) {
        if (change.isIntersecting) candidates.add(change.target);
        else candidates.delete(change.target);
      }
      update();
    }, {rootMargin:`-${Math.round(innerHeight*.44)}px 0px`});
    entries.forEach(entry => observer.observe(entry));
  }
  addEventListener("resize", connect);
  connect();
});
