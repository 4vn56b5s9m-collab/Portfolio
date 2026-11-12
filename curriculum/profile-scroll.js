const story = document.querySelector("[data-profile-story]");
const motion = matchMedia("(prefers-reduced-motion: reduce)");

if (story) {
  const fills = [...story.querySelectorAll("[data-profile-fill]")];
  const slides = [...story.querySelectorAll("[data-profile-slide]")];
  let frame = 0;

  function progress(element, start, end) {
    const top = element.getBoundingClientRect().top;
    return Math.max(0, Math.min(1, (innerHeight * start - top) / (innerHeight * (start - end))));
  }

  function draw() {
    frame = 0;
    if (motion.matches) return;
    for (const element of fills) {
      element.style.setProperty("--profile-progress", progress(element, .88, .48) * 100 + "%");
    }
    const travel = Math.min(46, story.clientWidth * .06);
    slides.forEach((element, index) => {
      const direction = index % 2 === 0 ? -1 : 1;
      const remaining = 1 - progress(element, .94, .56);
      element.style.setProperty("--profile-shift", direction * travel * remaining + "px");
    });
  }

  function schedule() {
    if (!motion.matches && !frame) frame = requestAnimationFrame(draw);
  }

  function updateMotion() {
    story.classList.toggle("is-scroll-ready", !motion.matches);
    schedule();
  }

  addEventListener("scroll", schedule, {passive:true});
  addEventListener("resize", schedule);
  motion.addEventListener("change", updateMotion);
  updateMotion();
}
