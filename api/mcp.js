// api/mcp.js - Streamable HTTP JSON-RPC endpoint para MCP (Model Context Protocol)

const SERVICES_DATA = [
  {
    id: "ansiedad",
    name: "Terapia para ansiedad",
    description: "Espacio para comprender el origen de tu ansiedad, aprender herramientas prácticas de autorregulación y recuperar la calma.",
    modality: "En línea (Google Meet)",
    duration: "50-60 minutos"
  },
  {
    id: "amor-propio",
    name: "Terapia de amor propio",
    description: "Proceso para reconstruir la relación contigo misma/o, fortalecer tu autoestima y establecer límites saludables.",
    modality: "En línea (Google Meet)",
    duration: "50-60 minutos"
  },
  {
    id: "rupturas-duelo",
    name: "Acompañamiento en rupturas y duelo",
    description: "Acompañamiento compasivo para transitar el dolor de una pérdida o separación afectiva con respeto a tus tiempos.",
    modality: "En línea (Google Meet)",
    duration: "50-60 minutos"
  },
  {
    id: "terapia-individual",
    name: "Terapia individual personalizada",
    description: "Sesiones personalizadas de psicología clínica y salud mental adaptadas a tus necesidades emocionales actuales.",
    modality: "En línea (Google Meet)",
    duration: "50-60 minutos"
  },
  {
    id: "talleres-cursos",
    name: "Talleres y cursos",
    description: "Espacios grupales y psicoeducativos enfocados en gestión emocional, bienestar y crecimiento personal.",
    modality: "En línea",
    duration: "Variables"
  }
];

const FAQ_DATA = [
  {
    question: "¿Cómo funciona la terapia en línea y qué plataforma se usa?",
    answer: "Las sesiones se realizan por videollamada a través de Google Meet. Una vez confirmada tu cita y enviado tu comprobante de pago, recibirás el enlace privado de acceso."
  },
  {
    question: "¿Cuánto dura cada sesión y cuál es la frecuencia?",
    answer: "Cada sesión dura entre 50 y 60 minutos, y la frecuencia sugerida al inicio suele ser semanal o quincenal según tus objetivos."
  },
  {
    question: "¿Qué métodos de pago se aceptan?",
    answer: "Transferencias electrónicas bancarias (SPEI para México). Los datos se proporcionan al solicitar tu cita."
  },
  {
    question: "¿Cuál es la política de reprogramación o cancelación?",
    answer: "Se requiere avisar con un mínimo de 24 horas de anticipación para reagendar sin costo; cancelaciones con menor tiempo o ausencias no son reembolsables."
  }
];

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      name: "psicologa-karen-cardiel-mcp",
      version: "1.0.0",
      status: "ready",
      transport: "streamable-http",
      tools: ["get_services", "get_faq", "generate_appointment_whatsapp_link", "subscribe_newsletter"]
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null });
    }
  }

  const { jsonrpc, id, method, params } = body || {};

  if (method === 'initialize') {
    return res.status(200).json({
      jsonrpc: "2.0",
      id: id || 1,
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: {
          name: "psicologa-karen-cardiel-mcp",
          version: "1.0.0"
        },
        capabilities: {
          tools: { listChanged: false }
        }
      }
    });
  }

  if (method === 'tools/list') {
    return res.status(200).json({
      jsonrpc: "2.0",
      id: id || 1,
      result: {
        tools: [
          {
            name: "get_services",
            description: "Obtener catálogo de servicios de psicología clínica y terapia en línea.",
            inputSchema: { type: "object", properties: {} }
          },
          {
            name: "get_faq",
            description: "Obtener preguntas frecuentes sobre sesiones, plataforma y pagos.",
            inputSchema: { type: "object", properties: {} }
          },
          {
            name: "generate_appointment_whatsapp_link",
            description: "Generar enlace directo a WhatsApp para agendar cita.",
            inputSchema: {
              type: "object",
              required: ["name", "service_or_reason"],
              properties: {
                name: { type: "string", description: "Nombre del paciente" },
                service_or_reason: { type: "string", description: "Motivo o servicio" },
                preferred_date: { type: "string", description: "Fecha opcional YYYY-MM-DD" },
                preferred_time: { type: "string", description: "Hora opcional ej. 10:00 AM" }
              }
            }
          },
          {
            name: "subscribe_newsletter",
            description: "Suscribir correo al newsletter.",
            inputSchema: {
              type: "object",
              required: ["email"],
              properties: { email: { type: "string", format: "email" } }
            }
          }
        ]
      }
    });
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments || {};

    if (toolName === 'get_services') {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: id || 1,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(SERVICES_DATA, null, 2)
            }
          ]
        }
      });
    }

    if (toolName === 'get_faq') {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: id || 1,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(FAQ_DATA, null, 2)
            }
          ]
        }
      });
    }

    if (toolName === 'generate_appointment_whatsapp_link') {
      const name = args.name || "Paciente";
      const reason = args.service_or_reason || "Consulta general";
      const date = args.preferred_date ? ` el día ${args.preferred_date}` : "";
      const time = args.preferred_time ? ` a las ${args.preferred_time}` : "";
      const text = `Hola Psic. Karen Cardiel, mi nombre es ${name}. Me gustaría solicitar informes y agendar una sesión de terapia enfocada en ${reason}${date}${time}.`;
      const whatsappUrl = `https://wa.me/522211655438?text=${encodeURIComponent(text)}`;

      return res.status(200).json({
        jsonrpc: "2.0",
        id: id || 1,
        result: {
          content: [
            {
              type: "text",
              text: `Enlace de WhatsApp generado:\n${whatsappUrl}\n\nMensaje:\n"${text}"`
            }
          ]
        }
      });
    }

    if (toolName === 'subscribe_newsletter') {
      const email = args.email;
      if (!email || !email.includes('@')) {
        return res.status(200).json({
          jsonrpc: "2.0",
          id: id || 1,
          result: { isError: true, content: [{ type: "text", text: "Email inválido" }] }
        });
      }
      return res.status(200).json({
        jsonrpc: "2.0",
        id: id || 1,
        result: {
          content: [{ type: "text", text: `Correo ${email} registrado exitosamente en la newsletter.` }]
        }
      });
    }

    return res.status(200).json({
      jsonrpc: "2.0",
      id: id || 1,
      error: { code: -32601, message: `Tool '${toolName}' not found` }
    });
  }

  return res.status(200).json({
    jsonrpc: "2.0",
    id: id || 1,
    error: { code: -32600, message: "Invalid request" }
  });
};
