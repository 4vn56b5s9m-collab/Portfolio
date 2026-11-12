const demo = document.querySelector("[data-ticket-demo]");
if (demo) {
  const timeline = demo.querySelector(".case-timeline");
  const steps = [...timeline.querySelectorAll("[data-story-node]")];
  const story = timeline.closest("[data-scroll-story]");
  const checks = [...demo.querySelectorAll("[data-ticket-change]")];
  const comparison = demo.querySelector("#ticket-comparison");
  const premium = comparison.querySelector(".ticket-premium");
  const mobileTitle = demo.querySelector(".case-mobile-step strong");
  const mobileCopy = demo.querySelector(".case-mobile-step span");
  const status = demo.querySelector("[data-ticket-status]");
  const play = premium.querySelector(".ticket-play");

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

  story.addEventListener("story:step", event => arrive(event.detail, true));

  checks.forEach((input, index) => {
    input.addEventListener("change", () => {
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
