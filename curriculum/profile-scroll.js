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
    overlay.textContent = element.textContent;
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
        range.setEndAfter(element.firstChild);
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
    const amount = clamp((innerHeight * .92 - group.top) / (innerHeight * .59 + group.height));
    slides.forEach((element, index) => {
      const style = getComputedStyle(element);
      const travel = Math.max(0, group.width - element.offsetWidth - 2 * parseFloat(style.marginInlineStart));
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
