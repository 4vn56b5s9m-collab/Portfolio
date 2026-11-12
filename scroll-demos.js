for (const story of document.querySelectorAll("[data-scroll-story]")) {
  const stage = story.querySelector(".scroll-story-stage");
  const track = story.querySelector(".scroll-story-distance");
  const timeline = story.querySelector(".case-timeline");
  const nodes = [...timeline.querySelectorAll("[data-story-node]")];
  const summary = story.querySelector(".case-mobile-step");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let current = -1;
  let frame = 0;

  function stickyTop() {
    return parseFloat(getComputedStyle(stage).top) || 0;
  }

  function travel() {
    return track.offsetHeight - (parseFloat(getComputedStyle(track).paddingBottom) || 0);
  }

  function update() {
    frame = 0;
    const distance = travel();
    if (distance <= 0) return;
    const offset = stickyTop() - story.getBoundingClientRect().top;
    const progress = Math.max(0, Math.min(1, offset / distance));
    timeline.style.setProperty("--case-progress", String(progress));
    const index = Math.min(nodes.length - 1, Math.floor(progress * (nodes.length - 1) + .006));
    if (index === current) return;
    current = index;
    nodes.forEach((node, i) => {
      if (i === index) node.setAttribute("aria-current", "step");
      else node.removeAttribute("aria-current");
    });
    if (summary) {
      summary.querySelector("strong").textContent = nodes[index].querySelector("strong").textContent;
      summary.querySelector("span").textContent = nodes[index].querySelector(".case-step-copy > span").textContent;
    }
    story.dispatchEvent(new CustomEvent("story:step", { detail: index }));
  }

  function queue() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  function goTo(index) {
    const y = scrollY + story.getBoundingClientRect().top - stickyTop();
    scrollTo({
      top: y + travel() * index / (nodes.length - 1) + 1,
      behavior: reduced.matches ? "instant" : "smooth"
    });
  }

  nodes.forEach((node, index) => {
    node.addEventListener("click", () => goTo(index));
    node.addEventListener("keydown", event => {
      const direction = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[event.key];
      const next = event.key === "Home" ? 0 : event.key === "End" ? nodes.length - 1
        : direction ? (index + direction + nodes.length) % nodes.length : null;
      if (next === null) return;
      event.preventDefault();
      nodes[next].focus({ preventScroll: true });
      goTo(next);
    });
  });

  addEventListener("scroll", queue, { passive: true });
  new ResizeObserver(queue).observe(story);
  queue();
}
