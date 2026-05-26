const WHATSAPP_NUMBER = "522211655438";

const form = document.querySelector("#appointment-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const message = [
    "Hola Karen, me gustaría agendar una sesión de terapia en línea.",
    "",
    `Nombre: ${data.get("nombre")}`,
    `Edad: ${data.get("edad")}`,
    `WhatsApp: ${data.get("whatsapp")}`,
    `Motivo de consulta: ${data.get("motivo")}`,
    `Horario preferido: ${data.get("horario")}`,
  ].join("\n");

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
