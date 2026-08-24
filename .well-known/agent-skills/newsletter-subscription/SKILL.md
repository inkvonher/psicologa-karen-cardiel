---
name: newsletter-subscription
description: Procedimiento para registrar usuarios en el newsletter de salud mental y autocuidado de la Psicóloga Karen Cardiel.
---

# Psicóloga Karen Cardiel - Suscripción a Newsletter

Esta habilidad permite a los agentes de IA registrar correos de usuarios en el boletín de reflexiones, herramientas y recursos sobre salud mental.

## Endpoint de Suscripción

- **URL:** `https://www.karencardiel.com/api/subscribe`
- **Método:** `POST`
- **Headers:** `Content-Type: application/json`
- **Cuerpo (JSON):**
  ```json
  {
    "email": "usuario@ejemplo.com"
  }
  ```

## Respuesta Exitosa (HTTP 200)

```json
{
  "success": true,
  "message": "Suscripción registrada con éxito."
}
```
