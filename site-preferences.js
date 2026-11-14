(() => {
  const root = document.documentElement;
  const appearance = matchMedia("(prefers-color-scheme: dark)");
  function read(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, value); } catch { /* Preferences still apply for this visit. */ }
  }
  const savedLanguage = new URLSearchParams(location.search).get("lang") ?? read("portfolio-language");
  let language = ["en", "es"].includes(savedLanguage) ? savedLanguage
    : /^es(?:-|$)/i.test(navigator.language) ? "es" : "en";
  const savedTheme = read("portfolio-theme");
  let chosenTheme = ["light", "dark"].includes(savedTheme) ? savedTheme : null;
  const copy = {
  "Especialidades": "Specialties",
  "Decisiones más claras": "Clearer decisions",
  "Coherencia a escala": "Consistency at scale",
  "Movimiento con intención": "Motion with purpose",
  "Criterio compartido": "Shared design judgment",
  "Elegir especialidad":"Choose specialty",
  "Cambiar idioma":"Change language",
  "Inicio": "Home",
  "Formaciones a empresas": "Training for companies",
  "Currículum": "Résumé",
  "Hola, soy Álex": "Hi, I’m Álex",
  "Experto en diseño de interfaces mediante": "I design interfaces through",
  "Behavioral Design, sistemas de diseño, motion e inmersión y formación de equipos.": "Behavioral design, design systems, motion and immersion, and team training.",
  "proyectos": "projects",
  "clientes": "clients",
  "países": "countries",
  "Sigue bajando": "Keep scrolling",
  "Cada proyecto": "Every project",
  "pide algo": "calls for",
  "distinto.": "something different.",
  "Cada proyecto pide algo distinto.": "Every project calls for something different.",
  "UI y Behavioral Design": "UI & Behavioral Design",
  "Motion e inmersión": "Motion & Immersion",
  "Formación de equipos": "Team Training",
  "Sistemas de diseño": "Design Systems",
  "Formación de equipos de diseño": "Training Design Teams",
  "Sistemas de diseño para múltiples marcas": "Design Systems for Multiple Brands",
  "Liderazgo y formación de equipos": "Design Leadership & Team Training",
  "Interfaces claras en el momento de decidir.": "Clear interfaces at the point of decision.",
  "Microinteracciones que guían la atención.": "Microinteractions that guide attention.",
  "Práctica compartida para elevar el nivel del equipo.": "Shared practices that help the team improve.",
  "Una base común que cada marca puede adaptar.": "A shared foundation each brand can adapt.",
  "Guía al usuario": "Guide the user",
  "Facilita el siguiente paso": "Make the next step easier",
  "Una microinteracción": "One microinteraction",
  "puede cambiar tu foco de atención": "can redirect your attention",
  "Comparte el criterio": "Share how you make decisions",
  "Eleva el nivel del equipo": "Help the team improve",
  "Una base común": "A shared foundation",
  "Distintas marcas": "Different brands",
  "Distintos proyectos, el mismo criterio.": "Different projects, the same design principles.",
  "He diseñado productos para e-commerce, seguros, aprendizaje y servicio técnico. Combino diseño de interfaz, prototipado y trabajo con equipos para que lo que se decide pueda llegar a producción.": "I’ve designed products for e-commerce, insurance, learning and technical support. I combine interface design, prototyping and collaboration to bring design decisions into production.",
  "Experto en diseño.": "Design expert.",
  "Equipo de UX/UI y sistema de diseño para productos digitales de domótica.": "UX/UI team and design system for smart home products.",
  "Diseño de interfaz, desarrollo web y formación para equipos y clientes en distintos mercados.": "Interface design, web development and training for teams and clients across markets.",
  "Dirección de arte y diseño web para e-commerce editorial.": "Art direction and web design for publishing e-commerce.",
  "Diseño digital y de interfaz para e-commerce, reservas y campañas.": "Digital and interface design for e-commerce, bookings and campaigns.",
  "Hablemos": "Let’s talk",
  "Si quieres conocer un caso o hablar de un proyecto, puedes encontrarme aquí.": "Get in touch to discuss a case study or a project.",
  "Copiar": "Copy",
  "Correo": "Email",
  "Teléfono": "Phone",
  "Llamada": "Call",
  "Volver al inicio ↑": "Back to top ↑",
  "Especialidad anterior": "Previous specialty",
  "Especialidad siguiente": "Next specialty",
  "Vistas de especialidades": "Specialty previews",
  "Navegación principal": "Main navigation",
  "Trayectoria y formación": "Experience & education",
  "Formación": "Education",
  "Explorar el portfolio": "Explore the portfolio",
  "Contacto": "Contact",
  "Cómo trabajo": "How I work",
  "En proyectos reales": "In real projects",
  "Otras especialidades": "Other specialties",
  "Que el siguiente paso esté claro": "Make the next step clear",
  "Empiezo por la decisión": "I start with the decision",
  "Diseño también las excepciones": "I design for edge cases too",
  "Compruebo si se entiende": "I check whether it makes sense",
  "De una ficha confusa a una decisión clara": "From a confusing product card to a clear decision",
  "Ficha inicial": "Original card",
  "Agrupar y espaciar": "Group and space",
  "Dar jerarquía": "Establish hierarchy",
  "Contraste y foco": "Contrast and focus",
  "Lámpara Nube": "Cloud Lamp",
  "Añadir al carrito": "Add to cart",
  "Accesibilidad en la práctica": "Accessibility in practice",
  "Contraste y controles": "Contrast and controls",
  "Tipografía y lectura": "Typography and reading",
  "Movimiento": "Motion",
  "Consultar WCAG 2.2": "Read WCAG 2.2",
  "Movimiento que ayuda a orientarse": "Motion that helps people find their way",
  "Doy continuidad a la acción": "I keep actions connected",
  "Pruebo el ritmo con la interacción real": "I test timing with real interactions",
  "Lo llevo al navegador": "I bring it into the browser",
  "Enfoca la atención con motion": "Guide attention with motion",
  "Contenido en foco": "Content in focus",
  "Confirmación": "Confirmation",
  "Abrir detalle": "Open details",
  "Entrega del dispositivo": "Device delivery",
  "Mostrar detalle": "Show details",
  "Solicitud de reparación": "Repair request",
  "Enviar solicitud": "Send request",
  "Seguimiento de la reparación": "Track repair",
  "Que el criterio circule por el equipo": "Share design judgment across the team",
  "Alineo al equipo alrededor del trabajo": "I align the team around its work",
  "Formo sobre situaciones del día a día": "I teach through everyday situations",
  "Convierto el acuerdo en algo reutilizable": "I turn agreements into reusable practices",
  "Dos equipos, una entrega que encaja": "Two teams, one handoff that works",
  "Punto de partida": "Starting point",
  "Probar el traspaso": "Test the handoff",
  "Acordar un estándar": "Agree on a standard",
  "Equipo de diseño": "Design team",
  "Equipo receptor": "Receiving team",
  "Formación en empresas": "In-company training",
  "Una base común para productos distintos": "A shared foundation for different products",
  "Defino qué merece ser común": "I define what should be shared",
  "Hago explícito qué puede variar": "I make it clear what can vary",
  "Acompaño la adopción": "I support adoption",
  "Un componente, tres marcas": "One component, three brands",
  "Marca 1": "Brand 1",
  "Marca 2": "Brand 2",
  "Marca 3": "Brand 3",
  "Configura tu entrega": "Set up your delivery",
  "Diseñar con criterios compartidos": "Design with shared standards",
  "Ver áreas de formación": "Browse training areas",
  "Que el equipo pueda seguir por su cuenta": "Help the team work independently",
  "Qué podemos trabajar": "What we can work on",
  "Diseño de producto y decisiones": "Product design and decision-making",
  "Figma, sistemas y formas de trabajo": "Figma, design systems and workflows",
  "Dirección visual, prototipado y motion": "Art direction, prototyping and motion",
  "IA aplicada al diseño": "AI for design",
  "Agentes y automatización": "Agents and automation",
  "Liderazgo y desarrollo de equipos": "Leadership and team development",
  "Cómo podemos trabajarlo": "Training formats",
  "Una capacidad concreta": "A specific skill",
  "Un programa para el equipo": "A team programme",
  "Implantación y autonomía": "Implementation and independence",
  "Ver liderazgo y formación": "Explore leadership and training",
  "¿Qué necesita tu equipo?": "What does your team need?",
  "Decisiones de diseño, cómo las pusimos a prueba y qué cambió.": "Design decisions, how we tested them and what changed.",
  "Rediseño de la compra de entradas": "Redesigning ticket purchases",
  "Cómo hicimos visibles las diferencias entre tres formas de vivir un evento.": "How we made the differences between three event experiences clear.",
  "Leer caso": "Read case study",
  "Próximo caso": "Upcoming case study",
  "Caso anónimo · UI y Behavioral Design": "Anonymous case study · UI & Behavioral Design",
  "Cómo cambiamos la forma de comparar tres entradas para que las personas entendieran qué experiencia compraban en cada una.": "How we changed the way people compare three ticket tiers so they could understand the experience each one offers.",
  "Ventas de la opción intermedia frente a la básica": "Mid-tier sales compared with basic",
  "Ventas de la opción Premium": "Premium sales",
  "Cuota diaria de ventas recuperada por la opción intermedia": "Daily sales share regained by the mid-tier",
  "El reto": "The challenge",
  "Mi aportación": "My contribution",
  "Las prestaciones se presentaban con el mismo énfasis. Las opciones con mejor ubicación o servicios adicionales resultaban difíciles de distinguir de la entrada básica.": "All benefits received the same emphasis. Options with better seats or additional services were hard to distinguish from the basic ticket.",
  "Colaboré en el análisis de cómo se comparaban las entradas y en la traducción de los principios de anclaje, encuadre y simulación a decisiones de interfaz.": "I helped analyse how people compared tickets and translate anchoring, framing and mental simulation into interface decisions.",
  "De comparar entradas a elegir una experiencia": "From comparing tickets to choosing an experience",
  "Desplázate para recorrer las intervenciones. También puedes elegir un nodo o activar los cambios por separado al final.": "Scroll through the changes, select a step or apply individual changes at the end.",
  "Comparativa inicial": "Original comparison",
  "Orden de comparación": "Order of comparison",
  "Encuadre de la experiencia": "Framing the experience",
  "Imaginarse allí": "Picturing yourself there",
  "La opción básica abría la comparación. Las llamadas a la acción aparecían antes de las prestaciones y las tres fichas tenían una jerarquía similar.": "The basic option came first. Calls to action appeared before benefits, and all three cards had a similar hierarchy.",
  "La opción Premium pasa a la izquierda. Abre la comparación y sirve de referencia para entender las diferencias entre las tres entradas.": "The Premium option moves to the left. It leads the comparison and sets a reference point for all three tickets.",
  "La ficha Premium explica la experiencia desde el asiento, hace visibles sus prestaciones y distingue lo incluido de lo opcional.": "The Premium card describes the experience from the seat, highlights its benefits and distinguishes inclusions from optional extras.",
  "Una escena con público aporta contexto. En la ficha Premium, la ilustración cobra vida al pasar el ratón o pulsar el control de reproducción.": "An audience scene adds context. On the Premium card, the illustration animates on hover or when you press play.",
  "Básica": "Basic",
  "Acceso al evento.": "Admission to the event.",
  "Elegir entrada": "Choose ticket",
  "Asiento estándar": "Standard seat",
  "Intermedia": "Plus",
  "Una ubicación con más opciones.": "Better seating with more options.",
  "Asiento con preferencia": "Preferred seating",
  "Acceso prioritario": "Priority access",
  "Incluye las ventajas de la entrada intermedia y servicios adicionales.": "Includes the benefits of the Plus ticket and additional services.",
  "Vive el evento desde una ubicación preferente, con espacio reservado y restauración.": "Enjoy the event from a preferred location with reserved space and catering.",
  "Elegir experiencia Premium": "Choose Premium experience",
  "Ubicación preferente": "Preferred location",
  "Espacio reservado": "Reserved space",
  "Restauración": "Catering",
  "Extras opcionales disponibles por separado.": "Optional extras available separately.",
  "Reconstrucción ilustrativa con nombres y gráficos genéricos.": "Illustrative reconstruction using generic names and graphics.",
  "Aplicar cambios": "Apply changes",
  "Escena con público": "Audience scene",
  "Currículum · Alejandro Sánchez Bretones": "Résumé · Alejandro Sánchez Bretones",
  "Alejandro Sánchez Bretones": "Alejandro Sánchez Bretones",
  "Experto en diseño. Trabajo en interfaz, experiencias interactivas, formación de equipos y sistemas de diseño.": "Design expert working on interfaces, interactive experiences, team training and design systems.",
  "Diseño UI y liderazgo de UX/UI. Sistema de diseño y gobernanza para interfaces domóticas y herramientas internas.": "UI design and UX/UI leadership. Design system and governance for smart home interfaces and internal tools.",
  "Diseño de interfaz, desarrollo en Webflow y formación de equipos. Proyectos de e-commerce, seguros, reparación y aprendizaje.": "Interface design, Webflow development and team training across e-commerce, insurance, repair and learning.",
  "Ingeniería de Diseño Industrial y Bellas Artes, UX/UI en Ironhack y formación en marketing digital.": "Industrial Design Engineering and Fine Arts, UX/UI at Ironhack and digital marketing training.",
  "alejandrosanchezbretones@gmail.com": "alejandrosanchezbretones@gmail.com",
  "Formaciones a empresas · Alejandro Sánchez Bretones": "Training for companies · Alejandro Sánchez Bretones",
  "Ayudo a equipos de diseño a acordar cómo trabajan, revisar con los mismos criterios y entregar con más consistencia. La formación se aplica a sus archivos, herramientas y proyectos.": "I help design teams agree on how they work, review against shared standards and deliver more consistently. We apply the training to their own files, tools and projects.",
  "Cuéntame el reto de tu equipo": "Tell me about your team’s challenge",
  "Para empezar basta con el tamaño del equipo y una situación que queráis mejorar.": "To get started, share your team size and one situation you’d like to improve.",
  "empresas en las que he impartido formación": "companies where I’ve delivered training",
  "personas por equipo de diseño": "people per design team",
  "He entrado como formador, lead o director de diseño, según la empresa. He ayudado a definir flujos de trabajo y estándares transversales, y a aplicarlos en revisiones y entregas hasta que el equipo podía mantenerlos con autonomía.": "I’ve joined companies as a trainer, design lead or design director. I helped define shared workflows and standards and apply them in reviews and handoffs until the team could maintain them independently.",
  "He trabajado con consultoras y empresas con producto propio, tanto en organizaciones de servicios como en equipos que diseñan para el cliente final. Mi formación en Ingeniería de Diseño Industrial y Bellas Artes reúne criterio técnico y dirección visual.": "I’ve worked with consultancies and companies with their own products, including service organisations and teams designing for end customers. My background in Industrial Design Engineering and Fine Arts brings together technical judgment and art direction.",
  "Elige el reto que más se parece al vuestro. Estas son áreas que podemos combinar y adaptar al nivel, las herramientas y los objetivos del equipo.": "Choose the challenge closest to yours. We can combine these areas and adapt them to your team’s experience, tools and goals.",
  "Cuando cuesta entender qué elegir o qué hacer a continuación.": "When it’s hard to understand what to choose or do next.",
  "UX y UI, arquitectura de información y diseño de flujos": "UX and UI, information architecture and user flows",
  "Diseño conductual, fricción, conversión y experimentación": "Behavioral design, friction, conversion and experimentation",
  "Accesibilidad, evaluación heurística y diseño inclusivo": "Accessibility, heuristic evaluation and inclusive design",
  "Consultar por esta formación": "Ask about this training",
  "Cuando cada equipo organiza, revisa o entrega de forma distinta.": "When teams organise, review or hand off work differently.",
  "Archivos, Auto Layout, componentes, variables y bibliotecas": "Files, Auto Layout, components, variables and libraries",
  "Tokens, sistemas multimarca, documentación y gobernanza": "Tokens, multi-brand systems, documentation and governance",
  "Estándares, plantillas, revisiones y transferencia a desarrollo": "Standards, templates, reviews and developer handoff",
  "Cuando el equipo necesita explorar una dirección visual y probarla antes de construir.": "When the team needs to explore a visual direction and test it before building.",
  "Creatividad, dirección visual y diseño adaptable": "Creativity, art direction and responsive design",
  "Prototipos avanzados, estados, microinteracciones y movimiento accesible": "Advanced prototypes, states, microinteractions and accessible motion",
  "Prototipado web con Webflow y comunicación de interacciones a desarrollo": "Web prototyping with Webflow and communicating interactions to developers",
  "Cuando el equipo quiere incorporar IA con criterio a su trabajo diario.": "When the team wants to use AI thoughtfully in everyday work.",
  "Investigación, benchmarking e ideación asistida": "AI-assisted research, benchmarking and ideation",
  "Exploración de interfaces, microcopy y revisión de contenido": "Interface exploration, microcopy and content review",
  "IA con contexto de proyecto, bibliotecas, sistemas de diseño y MCP": "AI with project context, libraries, design systems and MCP",
  "Cuando hay tareas repetitivas que consumen tiempo de diseño o revisión.": "When repetitive tasks take up design or review time.",
  "Diseño de flujos con agentes, entradas, salidas y validaciones": "Designing agent workflows, inputs, outputs and validation",
  "Aplicaciones en investigación, contenido, documentación y handoff": "Applications in research, content, documentation and handoff",
  "Pilotos, supervisión humana, calidad y medición de resultados": "Pilots, human oversight, quality and measurement",
  "Cuando el criterio y el conocimiento dependen de unas pocas personas.": "When design judgment and knowledge depend on a few people.",
  "Criterios de calidad, crítica de diseño y feedback": "Quality standards, design critique and feedback",
  "Mentoría, formación de referentes internos y recursos reutilizables": "Mentoring, training internal champions and reusable resources",
  "Adopción de estándares y seguimiento de su aplicación": "Adopting standards and following up on their application",
  "Sesiones especializadas de 1 a 2 horas o talleres prácticos en los que aplicamos lo aprendido a un problema real.": "One- to two-hour focused sessions or practical workshops where we apply what we learn to a real problem.",
  "Varias sesiones por nivel o un programa a medida. Si el punto de partida es difuso, una auditoría de archivos y procesos ayuda a decidir qué trabajar primero.": "A series of sessions by skill level or a bespoke programme. If the starting point is unclear, an audit of files and processes helps decide what to tackle first.",
  "Acompañamiento para incorporar estándares y herramientas al trabajo diario, con formación para las personas que los mantendrán y enseñarán dentro del equipo.": "Support for bringing standards and tools into everyday work, including training for the people who will maintain and teach them.",
  "Cuéntame qué queréis mejorar y vemos qué formato encaja.": "Tell me what you’d like to improve and we can work out which format fits.",
  "UI y Behavioral Design · Alejandro Sánchez Bretones": "UI & Behavioral Design · Alejandro Sánchez Bretones",
  "Diseño interfaces para momentos en los que una persona necesita decidir qué hacer. Ordeno opciones, condiciones y estados para que pueda actuar con una idea clara de lo que viene después.": "I design interfaces for moments when someone needs to decide what to do. I organise options, conditions and states so people know what will happen next.",
  "Identifico qué necesita saber la persona antes de elegir y qué información puede esperar. En un servicio de reparación, el alcance, el precio y el siguiente paso deben quedar claros en el momento de confirmar.": "I identify what people need to know before choosing and what can wait. In a repair service, scope, price and the next step should be clear at confirmation.",
  "Trabajo los estados que suelen quedar fuera del flujo principal: un dispositivo que no cumple las condiciones, una solicitud en espera o un error de pago. Cada estado explica qué ha pasado y qué puede hacer la persona.": "I design for states beyond the main flow, such as an ineligible device, a pending request or a payment error. Each state explains what happened and what the person can do.",
  "En un prototipo puedo pedir a alguien que elija una opción y explique qué cree que ocurrirá después. Esa respuesta ayuda a decidir qué información necesita más peso o debe aparecer antes.": "In a prototype, I can ask someone to pick an option and explain what they expect to happen. That helps determine which information needs more emphasis or should appear earlier.",
  "Una tarjeta ficticia. Recorre los pasos o cambia el estado para ver cómo se agrupa la información, gana jerarquía el precio y se distingue la acción.": "A fictional product card. Move through the steps to see how grouping, price hierarchy and the main action change.",
  "Los datos tienen el mismo peso y compiten entre sí.": "All information has the same emphasis and competes for attention.",
  "Producto, condiciones y precio se leen como grupos.": "Product, conditions and price read as groups.",
  "El precio vigente y la acción ganan prioridad.": "The current price and main action take priority.",
  "Comprueba el tamaño del área pulsable y el foco al navegar con Tab.": "Check the target size and focus indicator as you tab through.",
  "Luz cálida · Envío en 48 h": "Warm light · Ships in 48 hours",
  "Los datos compiten con la acción.": "The details compete with the action.",
  "Compruebo el contraste entre texto y fondo, el foco visible y el área pulsable de cada control. Para texto normal, WCAG AA pide un contraste de al menos 4,5:1.": "I check contrast between text and background, visible focus and the target size of each control. WCAG AA requires at least 4.5:1 for normal text.",
  "Compruebo que se pueda ampliar el texto al 200 % y aumentar su espaciado sin perder contenido ni funcionalidad. La jerarquía y el espacio ayudan a recorrer la interfaz.": "I check that people can resize text to 200% and increase spacing without losing content or functionality. Hierarchy and spacing help people navigate the interface.",
  "Respeto la preferencia de movimiento reducido y mantengo accesible el contenido cuando se desactivan las animaciones.": "I respect reduced-motion preferences and keep content available when animations are disabled.",
  "Amazon · Out of Warranty Service": "Amazon · Out of Warranty Service",
  "Diseñé la interfaz de un servicio de reparación fuera de garantía que reunía en un mismo recorrido a Amazon, el servicio técnico y la empresa de paquetería.": "I designed the interface for an out-of-warranty repair service that brought Amazon, the repair provider and the carrier into one flow.",
  "Trabajé en el rediseño de procesos e interfaces de salud, hogar y auto, con flujos que tenían que convivir dentro de una misma experiencia.": "I worked on redesigning health, home and car insurance flows that needed to coexist within a single experience.",
  "Criterios y formas de trabajar que el equipo comparte.": "Standards and ways of working the team shares.",
  "Componentes comunes que cada marca puede adaptar.": "Shared components each brand can adapt.",
  "Motion e inmersión · Alejandro Sánchez Bretones": "Motion & Immersion · Alejandro Sánchez Bretones",
  "Diseño microinteracciones y experiencias web que muestran qué ha cambiado y dónde seguir. Trabajo desde el prototipo hasta la implementación, con especial atención al ritmo, el scroll y el comportamiento en móvil.": "I design microinteractions and web experiences that show what changed and where to go next. I work from prototype to implementation, focusing on timing, scroll and mobile behaviour.",
  "Si una tarjeta cambia de estado, mantengo visible la información que permite reconocerla. La transición conecta el antes y el después y la confirmación sigue siendo legible cuando termina.": "When a card changes state, I keep its identifying information visible. The transition connects both states and the confirmation stays readable when it ends.",
  "Prototipo la entrada, la salida y los casos en que alguien interrumpe o repite un gesto. En esta web, el relieve señala la rama activa y la misma geometría acompaña el paso entre secciones.": "I prototype entrances, exits and what happens when someone interrupts or repeats a gesture. On this site, the raised geometry marks the active specialty and carries through transitions.",
  "He desarrollado experiencias en Webflow y trabajado el comportamiento responsive. Ajusto la densidad, la duración y el movimiento según el dispositivo y la preferencia de movimiento reducido.": "I’ve built experiences in Webflow and designed responsive behaviour. I adapt density, duration and motion to the device and reduced-motion preferences.",
  "Prueba cómo el movimiento señala contenido relevante, confirma una acción o mantiene el contexto al abrir un detalle.": "See how motion highlights relevant content, confirms an action or preserves context when details open.",
  "El detalle aparece tras un breve tiempo a la vista.": "Details appear after a short time in view.",
  "La respuesta aparece junto a la acción y conserva el contexto.": "The response appears beside the action and preserves context.",
  "La tarjeta se amplía en su sitio para mostrar más información.": "The card expands in place to show more information.",
  "Elige cuándo podemos recogerlo.": "Choose when we can pick it up.",
  "Disponible de lunes a viernes. Podrás cambiar la franja desde el seguimiento.": "Available Monday to Friday. You can change the time slot in tracking.",
  "El dispositivo está en revisión. Te avisaremos cuando esté listo.": "The device is being inspected. We’ll let you know when it’s ready.",
  "Al entrar en foco, la tarjeta crece un poco. Tras 1,5 segundos a la vista muestra más información.": "The card grows slightly when it comes into focus. After 1.5 seconds in view, it shows more information.",
  "SweetRush · Aprendizaje digital": "SweetRush · Digital learning",
  "Diseñé y desarrollé experiencias de formación en Webflow. Entre los proyectos del portfolio anterior están It’s about time y una experiencia de onboarding para Manpower.": "I designed and built training experiences in Webflow, including It’s about time and an onboarding experience for Manpower.",
  "Trabajé en el rediseño y desarrollo en Webflow, además de landings promocionales y comunicaciones por correo.": "I worked on the Webflow redesign and development, along with promotional landing pages and email communications.",
  "Liderazgo y formación de equipos de diseño · Alejandro Sánchez Bretones": "Design Leadership & Team Training · Alejandro Sánchez Bretones",
  "Liderazgo y formación de equipos de diseño": "Design Leadership & Team Training",
  "He formado a equipos de diseño en empresas y les he ayudado a acordar formas de trabajar que se puedan mantener entre personas, proyectos y entregas.": "I’ve trained in-house design teams and helped them agree on practices they can maintain across people, projects and handoffs.",
  "Aclaro quién decide, quién revisa y cuándo conviene incorporar a producto o desarrollo. La revisión sirve para resolver preguntas concretas antes de que se conviertan en retrabajo.": "I clarify who decides, who reviews and when to involve product or engineering. Reviews address specific questions before they cause rework.",
  "Trabajo con ejemplos de archivos, entregas y decisiones de interfaz. El equipo practica cómo organizar una propuesta, justificar una decisión y dejar suficiente contexto para que otra persona pueda continuar.": "I use examples from files, handoffs and interface decisions. The team practises organising proposals, explaining decisions and leaving enough context for someone else to continue.",
  "He ayudado a definir estándares de archivo, flujos de revisión y pautas de entrega. La documentación recoge las decisiones que se repiten y deja espacio para resolver las particularidades de cada proyecto.": "I’ve helped define file standards, review workflows and handoff guidelines. Documentation captures recurring decisions and leaves room for project-specific needs.",
  "Un traspaso ilustrativo. Al compartir criterios de estados, nombres y revisión, el mismo componente puede viajar de un equipo a otro con la información necesaria.": "An illustrative handoff. Shared rules for states, names and reviews let a component travel between teams with the information they need.",
  "Los equipos preparan sus archivos con criterios distintos.": "The teams prepare their files using different conventions.",
  "Al entregar el componente se hacen visibles los estados que faltan.": "The handoff makes missing states visible.",
  "El equipo receptor recibe estados, nombres y reglas compartidos.": "The receiving team gets shared states, names and rules.",
  "Estados y notas de revisión": "States and review notes",
  "Necesita estados y reglas de uso": "Needs states and usage rules",
  "Cada equipo prepara y revisa sus archivos con criterios distintos.": "Each team prepares and reviews files using different conventions.",
  "Mi trabajo incluyó crear y liderar un equipo de UX/UI para mejorar la experiencia de sus productos digitales, desde pantallas de control domótico hasta herramientas internas.": "I created and led a UX/UI team to improve the experience of digital products, from smart home control panels to internal tools.",
  "He acompañado a equipos de diseño en la definición de flujos, estándares y criterios compartidos, conectando la formación con el trabajo que ya estaban haciendo.": "I’ve helped design teams define workflows, standards and shared criteria by connecting training to work already underway.",
  "Sistemas de diseño para múltiples marcas · Alejandro Sánchez Bretones": "Design Systems for Multiple Brands · Alejandro Sánchez Bretones",
  "Diseño sistemas que permiten compartir componentes, patrones y criterios entre productos o unidades de negocio, con espacio para que cada marca y cada servicio tengan sus propias necesidades.": "I design systems that share components, patterns and standards across products or business units while accommodating each brand and service.",
  "Reviso qué comportamientos se repiten entre productos. Un estado de confirmación puede compartir estructura, accesibilidad y reglas aunque el color, el texto o los pasos previos dependan de cada marca.": "I review behaviours that recur across products. A confirmation state can share structure, accessibility and rules while colour, copy and preceding steps vary by brand.",
  "Organizo los componentes para que una variante de marca sea una decisión reconocible. Los equipos pueden adaptar identidad y contenido manteniendo patrones compartidos de interacción.": "I organise components so brand variation is an explicit choice. Teams can adapt identity and content while keeping shared interaction patterns.",
  "Alineo prioridades con cliente y desarrollo, documento estados y excepciones, y planteo cómo introducir el sistema en productos que ya están en marcha. La gobernanza define quién revisa los cambios y cómo llegan al resto.": "I align priorities with clients and developers, document states and exceptions, and plan how to introduce the system into existing products. Governance defines who reviews changes and how they reach teams.",
  "Cambia de marca para ver cómo los tokens de color, espaciado, radio y tipografía transforman la misma tarjeta. Su contenido y su estructura se comparten.": "Switch brands to see how colour, spacing, radius and typography tokens transform the same card. Its content and structure stay shared.",
  "Azul petróleo, espaciado medio y tipografía sans.": "Petrol blue, medium spacing and sans-serif type.",
  "Tonos cálidos, más espacio y tipografía serif.": "Warm tones, more space and serif type.",
  "Azul intenso, espaciado compacto y esquinas rectas.": "Deep blue, compact spacing and square corners.",
  "Elige la franja que mejor te venga.": "Choose the time slot that works best for you.",
  "Petróleo, espaciado medio y tipografía sans.": "Petrol blue, medium spacing and sans-serif type.",
  "Zennio · Sistema multiproducto": "Zennio · Multi-product system",
  "Creé un sistema de diseño y definí su gobernanza e implementación para dar coherencia a distintos productos, incluidas interfaces domóticas y herramientas internas.": "I created a design system and defined its governance and implementation to bring consistency to products including smart home interfaces and internal tools.",
  "Caser Helvetia · Líneas de negocio": "Caser Helvetia · Business lines",
  "Participé en la actualización del sistema de diseño y en flujos de salud, hogar y auto, donde conviven patrones comunes y reglas específicas de cada servicio.": "I helped update the design system and health, home and car insurance flows, where shared patterns coexist with service-specific rules.",
  "Hasta 20": "Up to 20",
  "Rediseño de la compra de entradas · Alejandro Sánchez Bretones": "Redesigning ticket purchases · Alejandro Sánchez Bretones",
  "← Portfolio": "← Portfolio",
  "Diseño de interfaz": "Interface design",
  "Flujos de decisión": "Decision flows",
  "Estados y recuperación": "States and recovery",
  "Caser Helvetia · Seguros": "Caser Helvetia · Insurance",
  "Microinteracciones": "Microinteractions",
  "Prototipos": "Prototypes",
  "Lista para enviar": "Ready to send",
  "Liderazgo de diseño": "Design leadership",
  "Flujos de trabajo": "Workflows",
  "Tarjeta de solicitud": "Request card",
  "Zennio · Equipo de UX/UI": "Zennio · UX/UI team",
  "Gobernanza": "Governance",
  "Componentes y variantes": "Components and variants",
  "Sistemas multiproducto": "Multi-product systems",
  "Continuar": "Continue",
  "Copiado al portapapeles.": "Copied to the clipboard.",
  "Mantén pulsado el dato para copiarlo.": "Press and hold the contact detail to copy it.",
  "El espacio separa lo que la persona debe comparar.": "Spacing separates the information people need to compare.",
  "El precio vigente y la acción tienen prioridad. El precio anterior queda como referencia.": "The current price and action take priority. The previous price remains for reference.",
  "El botón gana superficie pulsable y muestra un foco visible al navegar con el teclado.": "The button gets a larger target and a visible keyboard focus indicator.",
  "La confirmación aparece junto a la solicitud y conserva el contexto.": "The confirmation appears beside the request and preserves context.",
  "La tarjeta mantiene su título y abre el detalle en el mismo lugar.": "The card keeps its title and opens details in place.",
  "El componente llega, pero faltan estados y reglas que el equipo receptor necesita.": "The component arrives without the states and rules the receiving team needs.",
  "Los dos equipos comparten nombres, estados y criterios de revisión y entrega.": "Both teams share naming, states, and review and handoff criteria.",
  "Tonos cálidos, más espacio y una tipografía serif.": "Warm tones, more space and serif type.",
  "Azul intenso, espaciado compacto y esquinas más rectas.": "Deep blue, compact spacing and square corners.",
  "Faltan el estado de error y sus reglas": "Missing the error state and its rules",
  "Estados y reglas compartidos": "Shared states and rules",
  "Añadido · deshacer": "Added · undo",
  "Cerrar detalle": "Close details",
  "Solicitud enviada": "Request sent",
  "Repetir demo": "Replay demo",
  "Reanudar rotación automática": "Resume autoplay",
  "Pausar rotación automática": "Pause autoplay",
  "Especialidades de la cabecera": "Featured specialties",
  "Experiencia en cifras": "Experience in numbers",
  "Más de 81": "More than 81",
  "Más de 25": "More than 25",
  "Opciones de contacto": "Contact options",
  "Copiar correo electrónico": "Copy email address",
  "Copiar número de teléfono": "Copy phone number",
  "Guía al usuario y facilita el siguiente paso. Un camino de piezas conecta dos puertas y conduce a la salida de la derecha.": "Guide the user and make the next step easier. A tiled path connects two doors and leads to the exit on the right.",
  "Una microinteracción puede cambiar tu foco de atención.": "One microinteraction can redirect your attention.",
  "Tres torres de altura creciente, con tres piezas concéntricas cada una": "Three towers of increasing height with three concentric pieces each",
  "Un cubo se integra en un marco, el marco en una tarjeta y la tarjeta en una interfaz": "A cube fits into a frame, the frame into a card, and the card into an interface"
};
  root.lang = language;
  window.siteLanguage = language;
  window.siteText = (es, en = copy[es] ?? es) => language === "en" ? en : es;
  let themeButton;
  function applyTheme() {
    const theme = chosenTheme ?? (appearance.matches ? "dark" : "light");
    root.dataset.theme = theme;
    if (themeButton) {
      themeButton.setAttribute("aria-pressed", String(theme === "dark"));
      themeButton.setAttribute("aria-label", siteText("Modo oscuro", "Dark mode"));
    }
  }
  applyTheme();
  appearance.addEventListener("change", applyTheme);

  function translateDocument() {
    if (language !== "en") return;
    const pageCopy = document.getElementById("page-translations");
    if (pageCopy) Object.assign(copy, JSON.parse(pageCopy.textContent));
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.parentElement.closest("script,style,noscript")) continue;
      const original = node.nodeValue.trim();
      if (Object.hasOwn(copy, original)) node.nodeValue = node.nodeValue.replace(original, copy[original]);
    }
    for (const element of document.querySelectorAll("[aria-label], [title], [data-caption], [alt]")) {
      for (const attr of ["aria-label", "title", "alt"]) {
        const value = element.getAttribute(attr);
        if (value && Object.hasOwn(copy, value)) element.setAttribute(attr, copy[value]);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    translateDocument();
    const nav = document.querySelector(".site-header nav");
    if (!nav) return;
    const label = document.createElement("label");
    label.className = "site-language";
    const select = document.createElement("select");
    select.setAttribute("aria-label", siteText("Cambiar idioma"));
    select.add(new Option("Español", "es"));
    select.add(new Option("English", "en"));
    select.value = language;
    select.addEventListener("change", () => {
      save("portfolio-language", select.value);
      const url = new URL(location.href);
      url.searchParams.set("lang", select.value);
      location.replace(url);
    });
    label.append(select);
    nav.append(label);
    [...nav.children].forEach((item, index) => item.style.setProperty("--menu-order", index));

    themeButton = document.createElement("button");
    themeButton.type = "button";
    themeButton.className = "theme-switch";
    themeButton.innerHTML = '<span class="theme-thumb" aria-hidden="true"><svg viewBox="0 0 24 24"><defs><mask id="theme-phase"><rect width="24" height="24" fill="white"/><circle class="theme-cutout" cx="20" cy="4" r="7" fill="black"/></mask></defs><circle class="theme-disc" cx="12" cy="12" r="5" fill="currentColor" mask="url(#theme-phase)"/><path class="theme-rays" d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span>';
    themeButton.addEventListener("click", () => {
      chosenTheme = root.dataset.theme === "dark" ? "light" : "dark";
      save("portfolio-theme", chosenTheme);
      applyTheme();
    });
    document.body.append(themeButton);
    applyTheme();
  });
})();
