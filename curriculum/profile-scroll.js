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
  let sequenceStart = 0, sequenceLength = 1;
  let shifts = [];
  let previousStep = [];

  function measure() {
    disciplines.style.removeProperty("--cv-disciplines-size");
    if (compact.matches) {
      const widest = Math.max(...slides.map(slide => slide.getBoundingClientRect().width));
      const size = parseFloat(getComputedStyle(disciplines).fontSize);
      if (widest) disciplines.style.setProperty("--cv-disciplines-size",
        size * document.documentElement.clientWidth * .95 / widest + "px");
    }
    const group = disciplines.getBoundingClientRect();
    sequenceStart = group.top + scrollY - innerHeight * .91;
    sequenceLength = Math.min(group.height * .78, innerHeight * .68);
    shifts = slides.map(slide => Math.max(0,
      group.width - slide.offsetWidth - 2 * parseFloat(getComputedStyle(slide).marginInlineStart)));
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
      fill.start = index === 0 ? top - innerHeight * .92
        : Math.max(sequenceStart + sequenceLength, top - innerHeight * .96);
      fill.end = Math.max(fill.start + 72, top + box.height - innerHeight * .76);
      fill.lastMask = "";
    }
    needsMeasure = false;
  }

  function draw() {
    frame = 0;
    if (needsMeasure) measure();
    if (motion.matches) return;
    const scroll = scrollY;
    const phase = clamp((scroll - sequenceStart) / sequenceLength) * slides.length;
    slides.forEach((element, index) => {
      const step = clamp(phase - index);
      if (step === previousStep[index]) return;
      previousStep[index] = step;
      const eased = step * step * (3 - 2 * step);
      element.style.setProperty("--profile-shift", shifts[index] * (index % 2 === 0 ? eased : 1 - eased) + "px");
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
    resize();
  }

  addEventListener("scroll", () => { if (!motion.matches) schedule(); }, {passive:true});
  addEventListener("resize", resize);
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
