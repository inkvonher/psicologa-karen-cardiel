const WHATSAPP_NUMBER = "522211655438";

const footerYear = document.querySelector("#footer-year");
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

const form = document.querySelector("#appointment-form");
const newsletterForm = document.querySelector("#newsletter-form");
const newsletterStatus = newsletterForm.querySelector(".newsletter-status");
const dateInput = form.querySelector('input[name="fecha"]');
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
    button.disabled = isBeforeToday(date);
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
      selectionLabel.textContent = `Fecha seleccionada: ${formatReadableDate(date)}`;
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
    selectionLabel.textContent = "Selecciona una fecha antes de enviar.";
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

newsletterForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!newsletterForm.checkValidity()) {
    newsletterForm.reportValidity();
    return;
  }

  const data = new FormData(newsletterForm);
  const email = data.get("email").trim();
  const message = [
    "Hola Karen, me gustaría suscribirme a tu espacio.",
    "",
    `Correo electrónico: ${email}`,
  ].join("\n");

  newsletterStatus.textContent = "Abriendo WhatsApp para confirmar tu suscripción...";
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
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
