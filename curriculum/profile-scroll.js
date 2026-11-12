document.addEventListener("DOMContentLoaded", () => {
  const stories = [...document.querySelectorAll("[data-profile-story]")];
  if (!stories.length) return;
  const motion = matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
  const fills = stories.flatMap(story => [...story.querySelectorAll("[data-profile-fill]")].map(element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const overlay = document.createElement("span");
    overlay.className = "cv-fill-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.replaceChildren(...[...element.childNodes].map(node => node.cloneNode(true)));
    element.append(overlay);
    return {element, range, overlay, lines: []};
  }));
  const disciplines = document.querySelector(".cv-profile-disciplines");
  const slides = [...disciplines.querySelectorAll("[data-profile-slide]")];
  let frame = 0;
  let measure = true;
  const clamp = value => Math.max(0, Math.min(1, value));

  function draw() {
    frame = 0;
    if (motion.matches) return;
    for (const fill of fills) {
      const {element, range, overlay} = fill;
      const box = element.getBoundingClientRect();
      if (measure) {
        range.setEndBefore(overlay);
        fill.lines = [...range.getClientRects()].filter(line => line.width > 0).map(line => ({
          left: line.left - box.left,
          right: line.right - box.left,
          top: line.top - box.top,
          bottom: line.bottom - box.top
        }));
      }
      const {lines} = fill;
      if (!lines.length) continue;
      const position = clamp((innerHeight * .9 - box.top) / (innerHeight * .49 + box.height)) * lines.length;
      const index = Math.min(lines.length - 1, Math.floor(position));
      const line = lines[index];
      const width = line.left + (line.right - line.left) * (position - index);
      const top = index === 0 ? 0 : (lines[index - 1].bottom + line.top) / 2;
      const bottom = index === lines.length - 1 ? box.height : (line.bottom + lines[index + 1].top) / 2;
      const mask = position === lines.length ? "inset(0)"
        : `polygon(0 0, 100% 0, 100% ${top}px, ${width}px ${top}px, ${width}px ${bottom}px, 0 ${bottom}px)`;
      overlay.style.setProperty("--profile-mask", mask);
      element.classList.add("is-filling");
    }
    const group = disciplines.getBoundingClientRect();
    slides.forEach((element, index) => {
      const row = element.getBoundingClientRect();
      const amount = clamp((innerHeight - row.top) / (innerHeight + row.height));
      const style = getComputedStyle(element);
      const travel = group.width - element.offsetWidth - 2 * parseFloat(style.marginInlineStart);
      element.style.setProperty("--profile-shift", travel * (index % 2 === 0 ? amount : 1 - amount) + "px");
    });
    measure = false;
  }

  function schedule() {
    if (!motion.matches && !frame) frame = requestAnimationFrame(draw);
  }

  function resize() {
    measure = true;
    schedule();
  }

  function updateMotion() {
    disciplines.classList.toggle("is-sliding", !motion.matches);
    resize();
  }

  addEventListener("scroll", schedule, {passive:true});
  addEventListener("resize", resize);
  const observer = new ResizeObserver(resize);
  stories.forEach(story => observer.observe(story));
  document.fonts?.ready.then(resize);
  motion.addEventListener("change", updateMotion);
  updateMotion();
});

document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector(".cv-clients-flat");
  if (!list) return;
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
    button.textContent = siteText(expanded ? "Ver menos" : "Ver todos los clientes",
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
});
