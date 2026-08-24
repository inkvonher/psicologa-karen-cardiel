const WHATSAPP_NUMBER = "522211655438";

// Control del Menú Móvil
const menuToggle = document.querySelector("#menu-toggle");
const siteHeader = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".main-nav a");

if (menuToggle && siteHeader) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", isOpen);
  });

  // Cerrar menú al hacer clic en cualquier enlace
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteHeader.classList.remove("nav-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Resaltado de enlace activo según la sección visible
  const observedSections = document.querySelectorAll("section[id], footer[id]");
  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -70% 0px",
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, observerOptions);

  observedSections.forEach((section) => navObserver.observe(section));
}

const footerYear = document.querySelector("#footer-year");
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

const cookieBanner = document.querySelector("#cookie-banner");
if (cookieBanner) {
  let stored = null;
  try {
    stored = localStorage.getItem("cookie-consent");
  } catch (error) {
    stored = null;
  }

  if (!stored) {
    cookieBanner.classList.add("is-visible");
  }

  const closeBanner = (value) => {
    try {
      localStorage.setItem("cookie-consent", value);
    } catch (error) {
      /* almacenamiento no disponible */
    }
    cookieBanner.classList.remove("is-visible");
  };

  const acceptButton = document.querySelector("#cookie-accept");
  const rejectButton = document.querySelector("#cookie-reject");
  if (acceptButton) acceptButton.addEventListener("click", () => closeBanner("accepted"));
  if (rejectButton) rejectButton.addEventListener("click", () => closeBanner("rejected"));
}

const form = document.querySelector("#appointment-form");
const dateInput = form ? form.querySelector('input[name="fecha"]') : null;
const calendar = document.querySelector(".calendar-card");
const monthLabel = calendar.querySelector(".calendar-month");
const calendarGrid = calendar.querySelector(".calendar-grid");
const prevMonthButton = calendar.querySelector(".calendar-prev");
const nextMonthButton = calendar.querySelector(".calendar-next");
const selectionLabel = calendar.querySelector(".calendar-selection");

const today = new Date();
const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let visibleMonth = new Date(currentMonth);
let selectedDate = null;

const monthFormatter = new Intl.DateTimeFormat("es-MX", {
  month: "long",
  year: "numeric",
});

const selectedDateFormatter = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const isSameDay = (dateA, dateB) =>
  dateA &&
  dateB &&
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

const isBeforeToday = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()) <
  new Date(today.getFullYear(), today.getMonth(), today.getDate());

// Deshabilitar fines de semana u otras fechas (Domingos deshabilitados por defecto)
const isDayDisabled = (date) => {
  return isBeforeToday(date) || date.getDay() === 0;
};

const formatReadableDate = (date) => {
  const formatted = selectedDateFormatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const renderCalendar = () => {
  calendarGrid.innerHTML = "";
  monthLabel.textContent = monthFormatter.format(visibleMonth).replace(/^\w/, (letter) => letter.toUpperCase());
  prevMonthButton.disabled = visibleMonth <= currentMonth;

  ["D", "L", "M", "M", "J", "V", "S"].forEach((day) => {
    const label = document.createElement("span");
    label.className = "calendar-weekday";
    label.textContent = day;
    calendarGrid.append(label);
  });

  const firstDay = visibleMonth.getDay();
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();

  for (let index = 0; index < firstDay; index += 1) {
    calendarGrid.append(document.createElement("span"));
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = day;
    button.disabled = isDayDisabled(date);
    button.setAttribute("aria-label", formatReadableDate(date));

    if (isSameDay(date, today)) {
      button.classList.add("today");
    }

    if (isSameDay(date, selectedDate)) {
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.setAttribute("aria-pressed", "false");
    }

    button.addEventListener("click", () => {
      selectedDate = date;
      dateInput.value = isoDateFormatter.format(date);
      selectionLabel.textContent = `✓ Fecha seleccionada: ${formatReadableDate(date)}`;
      selectionLabel.style.color = "var(--blue-dark)";
      selectionLabel.style.fontWeight = "600";
      renderCalendar();
    });

    calendarGrid.append(button);
  }
};

prevMonthButton.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  renderCalendar();
});

nextMonthButton.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  renderCalendar();
});

renderCalendar();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!selectedDate) {
    selectionLabel.textContent = "Por favor, selecciona una fecha en el calendario antes de enviar.";
    selectionLabel.style.color = "#d9534f"; // Color de alerta rojo suave
    calendar.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const data = new FormData(form);
  const message = [
    "Hola Karen, me gustaría agendar una sesión de terapia en línea.",
    "",
    `Nombre: ${data.get("nombre")}`,
    `Edad: ${data.get("edad")}`,
    `WhatsApp: ${data.get("whatsapp")}`,
    `Motivo de consulta: ${data.get("motivo")}`,
    `Fecha preferida: ${formatReadableDate(selectedDate)}`,
    `Horario preferido: ${data.get("horario")}`,
  ].join("\n");

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

// Control del Acordeón de Preguntas Frecuentes (FAQ)
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach((item) => {
  const button = item.querySelector(".faq-question");
  if (!button) return;

  button.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");

    // Cerrar los demás items para mantener un diseño limpio (opcional y cómodo)
    faqItems.forEach((otherItem) => {
      if (otherItem !== item) {
        otherItem.classList.remove("is-open");
        const otherBtn = otherItem.querySelector(".faq-question");
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Alternar el item actual
    if (isOpen) {
      item.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    } else {
      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".reveal").forEach((element) => {
    gsap.from(element, {
      y: 42,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 86%",
        toggleActions: "play none none none",
      },
    });
  });

  gsap.to(".floating-phrase", {
    y: -18,
    x: 10,
    rotation: 1.5,
    duration: 5,
    ease: "sine.inOut",
    stagger: 0.7,
    repeat: -1,
    yoyo: true,
  });
}

// ==========================================
// WebMCP (Web Model Context Protocol) para Agentes IA en Navegador
// ==========================================
function initWebMCP() {
  const tools = [
    {
      name: "get_services",
      description: "Obtener lista completa de servicios terapéuticos y modalidades de consulta con la Psicóloga Karen Cardiel.",
      inputSchema: {
        type: "object",
        properties: {}
      },
      execute: async () => {
        return {
          services: [
            { name: "Terapia para Ansiedad", focus: "Regulación somática, detonantes y calma", modality: "En línea (Google Meet)" },
            { name: "Terapia de Amor Propio", focus: "Autoestima, límites saludables y diálogo compasivo", modality: "En línea (Google Meet)" },
            { name: "Acompañamiento en Rupturas y Duelo", focus: "Cierre de ciclos y elaboración del dolor", modality: "En línea (Google Meet)" },
            { name: "Terapia Individual Personalizada", focus: "Acompañamiento clínico integral", modality: "En línea (Google Meet)" },
            { name: "Talleres y Cursos", focus: "Psicoeducación y crecimiento grupal", modality: "En línea" }
          ]
        };
      }
    },
    {
      name: "get_faq_and_policies",
      description: "Consultar preguntas frecuentes, políticas de cancelación de citas y modalidades de pago.",
      inputSchema: {
        type: "object",
        properties: {}
      },
      execute: async () => {
        return {
          session_duration: "50 a 60 minutos",
          platform: "Google Meet",
          payment_methods: "Transferencia bancaria SPEI (México)",
          cancellation_policy: "Reprogramaciones con al menos 24 horas de anticipación sin costo adicional. Cancelaciones extemporáneas no son reembolsables."
        };
      }
    },
    {
      name: "book_appointment",
      description: "Generar mensaje predeterminado y abrir el canal de WhatsApp para agendar una sesión de terapia.",
      inputSchema: {
        type: "object",
        required: ["patient_name", "service_or_reason"],
        properties: {
          patient_name: { type: "string", description: "Nombre completo de la persona interesada" },
          service_or_reason: { type: "string", description: "Motivo de la consulta o tipo de terapia" },
          preferred_date: { type: "string", description: "Fecha opcional deseada (YYYY-MM-DD)" },
          preferred_time: { type: "string", description: "Horario opcional (ej. Mañana, Tarde, 11:00 AM)" }
        }
      },
      execute: async (params) => {
        const name = (params && params.patient_name) || "Paciente";
        const reason = (params && params.service_or_reason) || "Consulta";
        const date = params && params.preferred_date ? ` el día ${params.preferred_date}` : "";
        const time = params && params.preferred_time ? ` a las ${params.preferred_time}` : "";
        const text = `Hola Psic. Karen Cardiel, mi nombre es ${name}. Me gustaría solicitar informes y agendar una sesión de terapia enfocada en ${reason}${date}${time}.`;
        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
        return {
          action: "whatsapp_link_generated",
          url: waUrl,
          message: text
        };
      }
    },
    {
      name: "subscribe_to_newsletter",
      description: "Suscribir una dirección de correo al boletín de salud mental y bienestar.",
      inputSchema: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", description: "Correo electrónico del suscriptor" }
        }
      },
      execute: async (params) => {
        try {
          const res = await fetch("/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: params && params.email })
          });
          const data = await res.json();
          return data;
        } catch (err) {
          return { error: err.message };
        }
      }
    }
  ];

  // Exponer a window.__webMcpTools para compatibilidad con extensiones y frameworks de agentes
  window.__webMcpTools = tools;

  if (typeof navigator !== "undefined" && navigator.modelContext) {
    try {
      if (typeof navigator.modelContext.provideContext === "function") {
        navigator.modelContext.provideContext({
          tools: tools
        });
      }
      if (typeof navigator.modelContext.registerTool === "function") {
        tools.forEach((tool) => {
          navigator.modelContext.registerTool(tool);
        });
      }
    } catch (err) {
      console.warn("WebMCP registration note:", err);
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWebMCP);
} else {
  initWebMCP();
}

