const siteHeader=document.querySelector(".site-header");
const siteNav=siteHeader?.querySelector("nav");
if (siteNav) {
  const mobileMenu=matchMedia("(max-width: 700px)");
  const menuButton=document.createElement("button");
  menuButton.type="button";
  menuButton.className="site-menu-toggle";
  menuButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  siteNav.id ||= "site-navigation";
  menuButton.setAttribute("aria-controls",siteNav.id);

  function setMenu(open) {
    siteHeader.classList.toggle("is-menu-open",open);
    menuButton.setAttribute("aria-expanded",String(open));
    menuButton.setAttribute("aria-label",open?"Cerrar menú":"Abrir menú");
    menuButton.querySelector("path").setAttribute("d",open?"M5 5l14 14M19 5 5 19":"M4 6h16M4 12h16M4 18h16");
  }

  menuButton.addEventListener("click",()=>setMenu(menuButton.getAttribute("aria-expanded")!=="true"));
  siteNav.addEventListener("click",event=>{if (event.target.closest("a")) setMenu(false);});
  document.addEventListener("keydown",event=>{
    if (event.key==="Escape"&&menuButton.getAttribute("aria-expanded")==="true") {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener("click",event=>{if (!siteHeader.contains(event.target)) setMenu(false);});
  mobileMenu.addEventListener("change",()=>setMenu(false));
  setMenu(false);
  siteNav.before(menuButton);
  siteHeader.classList.add("has-mobile-menu");
}
if (siteHeader && document.body.classList.contains("detail")) {
  const updateHeader=()=>document.documentElement.style.setProperty("--nav-height",siteHeader.offsetHeight+"px");
  new ResizeObserver(updateHeader).observe(siteHeader);
  updateHeader();
}

const captions={
  ui:["Los datos compiten con la acción.","El espacio separa lo que la persona debe comparar.","El precio vigente y la acción tienen prioridad. El precio anterior queda como referencia.","El botón gana superficie pulsable y muestra un foco visible al navegar con el teclado."],
  motion:["Al entrar en foco, la tarjeta crece un poco. Tras 1,5 segundos a la vista muestra más información.","La confirmación aparece junto a la solicitud y conserva el contexto.","La tarjeta mantiene su título y abre el detalle en el mismo lugar."],
  handoff:["Cada equipo prepara y revisa sus archivos con criterios distintos.","El componente llega, pero faltan estados y reglas que el equipo receptor necesita.","Los dos equipos comparten nombres, estados y criterios de revisión y entrega."],
  brands:["Petróleo, espaciado medio y tipografía sans.","Tonos cálidos, más espacio y una tipografía serif.","Azul intenso, espaciado compacto y esquinas más rectas."]
};

for (const demo of document.querySelectorAll("[data-demo]")) {
  const kind=demo.dataset.demo;
  const story=demo.closest("[data-scroll-story]");
  const buttons=[...demo.querySelectorAll("[data-select]")];
  const preview=demo.querySelector("[data-preview]");
  const caption=demo.querySelector("[data-caption]");
  const panels=[...demo.querySelectorAll("[data-motion-panel]")];
  const slot=demo.querySelector("[data-slot]");
  let current=-1;
  function select(index) {
    if (index===current) return;
    current=index;
    buttons.forEach((button,i)=>button.setAttribute("aria-pressed",String(i===index)));
    if (preview) preview.dataset.step=String(index);
    panels.forEach((panel,i)=>{panel.hidden=i!==index;});
    if (slot) slot.textContent=["Necesita estados y reglas de uso","Faltan el estado de error y sus reglas","Estados y reglas compartidos"][index];
    caption.textContent=captions[kind][index];
  }
  buttons.forEach((button,index)=>button.addEventListener("click",()=>{
    select(index);
  }));
  story?.addEventListener("story:step",event=>select(event.detail));
  select(0);
  if (kind==="ui") {
    const cart=preview.querySelector(".product-cta");
    cart.addEventListener("click",()=>{
      const added=cart.getAttribute("aria-pressed")!=="true";
      cart.setAttribute("aria-pressed",String(added));
      cart.textContent=added?"Añadido · deshacer":"Añadir al carrito";
    });
  }
  if (kind==="motion") {
    const focus=demo.querySelector(".focus-card");
    const focusButton=demo.querySelector("[data-focus]");
    let dwell=0;
    let manualFocus=false;
    function expand(card,button,expanded) {
      card.classList.toggle("is-reading",expanded);
      button.setAttribute("aria-expanded",String(expanded));
      button.textContent=expanded?"Cerrar detalle":"Mostrar detalle";
    }
    const observer=new IntersectionObserver(entries=>{
      for (const entry of entries) {
        clearTimeout(dwell);
        focus.classList.toggle("is-near",entry.isIntersecting);
        if (entry.isIntersecting && !manualFocus) {
          dwell=setTimeout(()=>expand(focus,focusButton,true),1500);
        } else if (!entry.isIntersecting && !manualFocus) {
          expand(focus,focusButton,false);
        }
      }
    },{threshold:.75});
    observer.observe(focus);
    focusButton.setAttribute("aria-expanded","false");
    focusButton.addEventListener("click",()=>{
      manualFocus=true;
      clearTimeout(dwell);
      expand(focus,focusButton,!focus.classList.contains("is-reading"));
    });
    const confirm=demo.querySelector("[data-confirm]");
    const status=demo.querySelector("[data-confirm-state]");
    confirm.addEventListener("click",()=>{
      const sent=confirm.dataset.sent!=="true";
      confirm.dataset.sent=String(sent);
      status.textContent=sent?"Solicitud enviada":"Lista para enviar";
      status.classList.toggle("is-confirmed",sent);
      confirm.textContent=sent?"Repetir demo":"Enviar solicitud";
    });
    const detail=demo.querySelector("[data-detail]");
    detail.addEventListener("click",()=>{
      const card=detail.closest(".focus-card");
      expand(card,detail,!card.classList.contains("is-reading"));
    });
  }
}

function copyOnHttp(value) {
  const field=document.createElement("textarea");
  field.value=value;
  field.readOnly=true;
  field.style.cssText="position:fixed;left:0;top:0;opacity:0";
  document.body.append(field);
  const previous=document.activeElement;
  field.focus({preventScroll:true});
  field.select();
  field.setSelectionRange(0,value.length);
  try {
    return document.execCommand("copy");
  } finally {
    field.remove();
    previous?.focus({preventScroll:true});
  }
}

for (const button of document.querySelectorAll("[data-copy-contact]")) {
  button.hidden=false;
  button.addEventListener("click",async()=>{
    const value=button.closest(".contact-item").querySelector(".contact-value");
    const status=button.closest(".site-footer").querySelector(".contact-status");
    let copied=false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value.textContent);
        copied=true;
      } else {
        copied=copyOnHttp(value.textContent);
      }
    } catch {
      copied=false;
    }
    if (copied) {
      status.textContent="Copiado al portapapeles.";
    } else {
      const selection=window.getSelection();
      const range=document.createRange();
      range.selectNodeContents(value);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent="Mantén pulsado el dato para copiarlo.";
    }
  });
}


for (const accordion of document.querySelectorAll("[data-specialty-accordion]")) {
  const gallery = accordion.querySelector(".accordion-branches");
  const cards = [...gallery.querySelectorAll("[data-accordion-branch]")];
  const panels = [...accordion.querySelectorAll("[data-accordion-panel]")];
  const dots = [...accordion.querySelectorAll("[data-branch-page]")];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = matchMedia("(max-width: 700px)");
  let active = 0;
  let frame = 0;

  function preview(index) {
    if (index === active) return;
    active = index;
    accordion.dataset.litPiece = String([0, 2, 3, 1][index]);
    cards.forEach((card, i) => card.classList.toggle("is-previewed", i === index));
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  function previewCenteredCard() {
    frame = 0;
    if (!mobile.matches) return;
    const bounds = gallery.getBoundingClientRect();
    const center = bounds.left + bounds.width / 2;
    let closest = 0;
    let distance = Infinity;
    cards.forEach((card, index) => {
      const { left, width } = card.getBoundingClientRect();
      const offset = Math.abs(left + width / 2 - center);
      if (offset < distance) {
        closest = index;
        distance = offset;
      }
    });
    preview(closest);
  }

  cards.forEach((card, index) => {
    card.addEventListener("pointerenter", event => {
      if (!mobile.matches && event.pointerType !== "touch") preview(index);
    });
    card.addEventListener("focus", () => preview(index));
  });
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      const bounds = gallery.getBoundingClientRect();
      const card = cards[index].getBoundingClientRect();
      gallery.scrollTo({
        left: gallery.scrollLeft + card.left + card.width / 2 - bounds.left - bounds.width / 2,
        behavior: reduced.matches ? "instant" : "smooth"
      });
    });
    dot.addEventListener("keydown", event => {
      const offset = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
      const next = offset ? (index + offset + dots.length) % dots.length
        : event.key === "Home" ? 0 : event.key === "End" ? dots.length - 1 : null;
      if (next === null) return;
      event.preventDefault();
      dots[next].focus();
      dots[next].click();
    });
  });
  gallery.addEventListener("scroll", () => {
    if (mobile.matches && !frame) frame = requestAnimationFrame(previewCenteredCard);
  }, { passive: true });
  function sizeGallery() {
    if (!mobile.matches) return;
    const tallest = Math.max(...cards.map(card => {
      const style = getComputedStyle(card);
      const copy = card.querySelector(".branch-card-copy").getBoundingClientRect().height;
      const cta = card.querySelector(".branch-card-cta").getBoundingClientRect().height;
      const extra = ["paddingTop", "paddingBottom", "borderTopWidth", "borderBottomWidth", "rowGap"]
        .reduce((sum, name) => sum + (parseFloat(style[name]) || 0), 0);
      return Math.max(parseFloat(style.minHeight)||0, copy + cta + extra);
    }));
    const style = getComputedStyle(gallery);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    gallery.style.setProperty("--gallery-height", Math.ceil(tallest + padding) + "px");
  }
  const galleryObserver = new ResizeObserver(sizeGallery);
  cards.forEach(card => {
    galleryObserver.observe(card.querySelector(".branch-card-copy"));
    galleryObserver.observe(card.querySelector(".branch-card-cta"));
  });
  mobile.addEventListener("change", () => {
    sizeGallery();
    previewCenteredCard();
  });
  sizeGallery();
  previewCenteredCard();
}

for (const tape of document.querySelectorAll(".scene-marquee")) {
  const toggle = tape.querySelector(".scene-marquee-toggle");
  toggle.addEventListener("click", () => {
    const paused = tape.classList.toggle("is-paused");
    toggle.setAttribute("aria-label", paused ? "Reanudar cinta de texto" : "Pausar cinta de texto");
    toggle.firstElementChild.textContent = paused ? "▶" : "Ⅱ";
  });
}
