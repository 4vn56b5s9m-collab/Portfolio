(() => {
  const headings = [...document.querySelectorAll(".scroll-heading")].map(heading => {
    const source = document.createElement("span");
    source.className = "scroll-heading-source";
    source.append(...heading.childNodes);
    const ink = source.cloneNode(true);
    ink.className = "scroll-heading-ink";
    ink.setAttribute("aria-hidden", "true");
    heading.append(source, ink);
    const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    return {heading, ink, textNodes};
  });
  const motion = matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
  const range = document.createRange();
  let frame = 0;

  function draw() {
    frame = 0;
    if (motion.matches) return;
    const height = window.innerHeight;
    for (const {heading, ink, textNodes} of headings) {
      const box = heading.getBoundingClientRect();
      if (!box.width || !box.height) continue;
      const footer = heading.closest("#contacto");
      const footerBox = footer?.getBoundingClientRect();
      const footerSpan = footerBox ? Math.min(footerBox.height * .8, height * .8) : 0;
      const footerDelay = footerSpan * Number(footer?.dataset.headingRevealDelay || 0);
      const reveal = footerBox
        ? (height - footerBox.top - footerDelay) / (footerSpan - footerDelay)
        : (.80 * height - box.top - box.height / 2) / (.35 * height);
      const progress = Math.max(0, Math.min(1, reveal));
      const bleed = Math.ceil(parseFloat(getComputedStyle(heading).fontSize) * .35);
      const lines = [];
      for (const node of textNodes) {
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (!rect.width || !rect.height) continue;
          const last = lines.at(-1);
          if (last && Math.abs(last.top - rect.top) < 3) {
            last.left = Math.min(last.left, rect.left);
            last.right = Math.max(last.right, rect.right);
            last.bottom = Math.max(last.bottom, rect.bottom);
          } else {
            lines.push({top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right});
          }
        }
      }
      if (!lines.length) continue;
      const step = progress * lines.length;
      const index = Math.min(lines.length - 1, Math.floor(step));
      const line = lines[index];
      const top = index ? (lines[index - 1].bottom + line.top) / 2 - box.top : -bleed;
      const bottom = index === lines.length - 1 ? box.height + bleed : (line.bottom + lines[index + 1].top) / 2 - box.top;
      const right = line.left - box.left + (line.right - line.left + bleed) * (step - index);
      const far = box.width + bleed;
      const mask = progress === 1 ? "none" : progress === 0 ? "inset(100%)" :
        `polygon(${-bleed}px ${-bleed}px,${far}px ${-bleed}px,${far}px ${top}px,${right}px ${top}px,${right}px ${bottom}px,${-bleed}px ${bottom}px)`;
      ink.style.setProperty("--heading-mask", mask);
      heading.classList.add("has-scroll-ink");
    }
  }
  function queue() { if (!frame) frame = requestAnimationFrame(draw); }
  addEventListener("scroll", queue, {passive:true});
  addEventListener("resize", queue);
  motion.addEventListener("change", queue);
  document.fonts?.ready.then(queue);
  queue();
})();
