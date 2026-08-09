// api/subscribe.js - Función Serverless para procesar registros de la Newsletter en Vercel
// Esta función sincroniza el correo con Supabase y opcionalmente con Brevo sin exponer API keys en el cliente.

module.exports = async function (req, res) {
  // Configurar cabeceras de CORS para desarrollo local y producción
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder rápido a peticiones preflight (CORS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    let email = '';
    
    // Parsear el body independientemente del formato enviado
    if (typeof req.body === 'string') {
      const parsed = JSON.parse(req.body);
      email = parsed.email;
    } else if (req.body && req.body.email) {
      email = req.body.email;
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido o ausente.' });
    }

    email = email.trim().toLowerCase();
    const todayStr = new Date().toISOString().split('T')[0];

    // Variables de Entorno configuradas en Vercel
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const brevoListId = process.env.BREVO_LIST_ID; // Opcional: ID de lista en Brevo

    const results = { supabase: null, brevo: null };

    // 1. Sincronización con Supabase (vía API REST nativa libre de dependencias npm)
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, ''); // Limpiar si tiene la ruta al final
        const response = await fetch(`${cleanUrl}/rest/v1/suscriptores`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ email, date: todayStr })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `HTTP ${response.status}`);
        }
        results.supabase = 'success';
      } catch (err) {
        console.error('Error insertando en Supabase:', err);
        results.supabase = `error: ${err.message}`;
      }
    }

    // 2. Sincronización con Brevo (Mailing List)
    if (brevoApiKey) {
      try {
        const response = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': brevoApiKey
          },
          body: JSON.stringify({
            email: email,
            updateEnabled: true,
            listIds: brevoListId ? [parseInt(brevoListId)] : []
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || `HTTP ${response.status}`);
        }
        results.brevo = 'success';
      } catch (err) {
        console.error('Error insertando en Brevo:', err);
        results.brevo = `error: ${err.message}`;
      }
    }

    // Alerta de configuración
    if (!supabaseUrl && !brevoApiKey) {
      return res.status(500).json({
        error: 'Falta configurar las Variables de Entorno en el panel de Vercel.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Suscripción registrada con éxito.',
      results
    });

  } catch (err) {
    console.error('Error en el handler de API:', err);
    return res.status(500).json({ error: 'Error interno del servidor.', details: err.message });
  }
};
