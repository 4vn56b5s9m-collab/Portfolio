const demo = document.querySelector("[data-ticket-demo]");
if (demo) {
  const timeline = demo.querySelector(".case-timeline");
  const steps = [...timeline.querySelectorAll("[data-case-step]")];
  const checks = [...demo.querySelectorAll("[data-ticket-change]")];
  const comparison = demo.querySelector("#ticket-comparison");
  const premium = comparison.querySelector(".ticket-premium");
  const mobileTitle = demo.querySelector(".case-mobile-step strong");
  const mobileCopy = demo.querySelector(".case-mobile-step span");
  const status = demo.querySelector("[data-ticket-status]");
  const play = premium.querySelector(".ticket-play");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let arrivalTimer = 0;

  function stopIllustration() {
    premium.classList.remove("is-playing");
    play.setAttribute("aria-pressed", "false");
    play.firstElementChild.textContent = "▶";
  }

  function render() {
    checks.forEach(input => demo.classList.toggle("has-" + input.dataset.ticketChange, input.checked));
    const premiumFirst = checks[0].checked;
    if (premiumFirst && comparison.firstElementChild !== premium) {
      comparison.prepend(premium);
      comparison.scrollLeft = 0;
    } else if (!premiumFirst && comparison.lastElementChild !== premium) {
      comparison.append(premium);
      comparison.scrollLeft = 0;
    }
    if (!checks[2].checked) stopIllustration();
  }

  function arrive(index, updateChecks) {
    const selected = steps[index];
    steps.forEach((button, i) => {
      if (i === index) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    demo.dataset.step = String(index);
    if (updateChecks) checks.forEach((input, i) => { input.checked = i < index; });
    mobileTitle.textContent = selected.querySelector("strong").textContent;
    mobileCopy.textContent = selected.querySelector(".case-step-copy > span").textContent;
    status.textContent = mobileTitle.textContent + ". " + mobileCopy.textContent;
    render();
  }

  function goTo(index) {
    clearTimeout(arrivalTimer);
    timeline.style.setProperty("--case-progress", String(index / (steps.length - 1)));
    if (reduced.matches) arrive(index, true);
    else arrivalTimer = setTimeout(() => arrive(index, true), 320);
  }

  steps.forEach((button, index) => {
    button.addEventListener("click", () => goTo(index));
    button.addEventListener("keydown", event => {
      const moves = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 };
      const next = event.key === "Home" ? 0 : event.key === "End" ? steps.length - 1
        : moves[event.key] ? (index + moves[event.key] + steps.length) % steps.length : null;
      if (next === null) return;
      event.preventDefault();
      steps[next].focus();
      goTo(next);
    });
  });

  checks.forEach((input, index) => {
    input.addEventListener("change", () => {
      clearTimeout(arrivalTimer);
      const active = input.checked ? index + 1 : checks.findLastIndex(check => check.checked) + 1;
      timeline.style.setProperty("--case-progress", String(active / (steps.length - 1)));
      arrive(active, false);
    });
  });

  play.addEventListener("click", () => {
    if (premium.classList.contains("is-playing")) {
      stopIllustration();
    } else {
      premium.classList.add("is-playing");
      play.setAttribute("aria-pressed", "true");
      play.firstElementChild.textContent = "Ⅱ";
    }
  });

  render();
}
