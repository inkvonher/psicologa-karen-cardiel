# auth.md - Psicóloga Karen Cardiel

Guía de autenticación y registro automatizado para agentes de Inteligencia Artificial (AI Agents).

## 1. Información General

- **Servicio:** Psicóloga Karen Cardiel - Consulta y Servicios Psicológicos
- **Dominio:** `https://www.karencardiel.com`
- **Público Objetivo:** Agentes autónomos de IA, asistentes personales y modelos de lenguaje autorizados por usuarios.
- **Protocolo de Recursos Protegidos (PRM):** [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) disponible en `/.well-known/oauth-protected-resource`.
- **Servidor de Autorización:** [RFC 8414](https://www.rfc-editor.org/rfc/rfc8414) disponible en `/.well-known/oauth-authorization-server`.

## 2. Métodos de Registro e Identidad Admitidos

Los agentes pueden registrarse e interactuar utilizando los siguientes métodos:

### A. Acceso Anónimo (Lectura Pública y Generación de Citas)
- **Tipo de Identidad:** `anonymous`
- **Tipo de Credencial:** `bearer_token`
- **Uso:** Consulta de catálogo de servicios, preguntas frecuentes y generación de enlaces de WhatsApp para agendar citas.
- **Endpoint de Registro / Reclamación:** `POST https://www.karencardiel.com/agent/claim`

### B. Declaración de Identidad Verificada (ID-JAG / Correo Verificado)
- **Tipo de Identidad:** `identity_assertion`
- **Formatos de Aserción:**
  - `urn:ietf:params:oauth:token-type:id-jag`
  - `verified_email`
- **Uso:** Suscripción al boletín a nombre del usuario delegante y gestión de solicitudes de cita.
- **Endpoint de Registro:** `POST https://www.karencardiel.com/agent/auth`

## 3. Alcances Disponibles (Scopes)

| Alcance | Descripción |
| :--- | :--- |
| `read:services` | Acceso de lectura al catálogo de servicios y tarifas. |
| `write:appointments` | Capacidad de formular y enviar solicitudes de cita. |
| `write:newsletter` | Registro de suscripción al boletín de salud mental. |

## 4. Uso de Credenciales

Todas las peticiones autenticadas deben incluir el token Bearer en el encabezado HTTP estándar:

```http
Authorization: Bearer <tu_token_de_agente>
```
