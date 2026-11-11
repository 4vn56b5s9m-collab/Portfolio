const siteHeader=document.querySelector(".site-header");
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
  const buttons=[...demo.querySelectorAll("[data-select]")];
  const preview=demo.querySelector("[data-preview]");
  const caption=demo.querySelector("[data-caption]");
  const panels=[...demo.querySelectorAll("[data-motion-panel]")];
  const slot=demo.querySelector("[data-slot]");
  let current=-1;
  let lastManual=-Infinity;
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
    lastManual=performance.now();
    select(index);
  }));
  select(0);
  if (kind==="ui") {
    const steps=[...demo.closest("section").querySelectorAll("[data-scroll-step]")];
    const observer=new IntersectionObserver(entries=>{
      if (performance.now()-lastManual<1300) return;
      const next=entries.filter(entry=>entry.isIntersecting).at(-1);
      if (next) select(Number(next.target.dataset.scrollStep));
    },{rootMargin:"-37% 0px -48% 0px"});
    steps.forEach(step=>observer.observe(step));
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
  const buttons=[...accordion.querySelectorAll("[data-accordion-branch]")];
  const panels=[...accordion.querySelectorAll("[data-accordion-panel]")];
  const visual=accordion.querySelector(".accordion-visual");
  const link=accordion.querySelector("[data-accordion-link]");
  const paths=["ui-behavioral-design","motion-e-inmersion","liderazgo-y-formacion","sistemas-de-diseno"];
  let active=-1;
  let measureFrame=0;
  function measureOrigin(button) {
    cancelAnimationFrame(measureFrame);
    measureFrame=requestAnimationFrame(()=>{
      const origin=button.getBoundingClientRect();
      const target=visual.getBoundingClientRect();
      visual.style.setProperty("--entry-x",((origin.left+origin.width*.5)-(target.left+target.width*.5))+"px");
      visual.style.setProperty("--entry-y",-Math.max(45,target.top-origin.bottom+30)+"px");
    });
  }
  function show(index) {
    if(index===active)return;
    active=index;
    measureOrigin(buttons[index]);
    buttons.forEach((button,i)=>button.setAttribute("aria-pressed",String(i===index)));
    panels.forEach((panel,i)=>{panel.hidden=i!==index;});
    link.href="especialidades/"+paths[index]+"/";
    link.setAttribute("aria-label","Explorar "+buttons[index].querySelector("strong").textContent);
  }
  buttons.forEach((button,index)=>{
    button.addEventListener("pointerenter",event=>{if(event.pointerType!=="touch")show(index);});
    button.addEventListener("focus",()=>show(index));
    button.addEventListener("click",()=>show(index));
  });
  show(0);
}
