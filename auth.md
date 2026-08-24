# auth.md

Protocolo de autenticación y registro automatizado para agentes de Inteligencia Artificial (Auth.md).

## 1. Audience (Público Objetivo)

- **Target Audience:** Agentes autónomos de IA, asistentes de lenguaje y modelos de IA autorizados por usuarios.
- **Service Name:** Psicóloga Karen Cardiel - Consulta y Servicios Psicológicos
- **Service URL:** `https://www.karencardiel.com`
- **Protected Resource Metadata (PRM):** `https://www.karencardiel.com/.well-known/oauth-protected-resource`
- **Authorization Server Metadata:** `https://www.karencardiel.com/.well-known/oauth-authorization-server`

## 2. Supported Registration & Identity Methods

### A. Anonymous Identity (`anonymous`)
- **Identity Type:** `anonymous`
- **Credential Type:** `bearer_token`
- **Claim Endpoint:** `https://www.karencardiel.com/agent/claim`
- **Usage:** Consulta pública de catálogo de servicios, preguntas frecuentes y generación de enlaces de contacto.

### B. Identity Assertion (`identity_assertion`)
- **Identity Type:** `identity_assertion`
- **Supported Assertion Formats:**
  - `urn:ietf:params:oauth:token-type:id-jag`
  - `verified_email`
- **Registration Endpoint:** `https://www.karencardiel.com/agent/auth`
- **Credential Type:** `bearer_token`
- **Events & Revocation Endpoint:** `https://www.karencardiel.com/agent/events`
- **Usage:** Suscripción al boletín a nombre del usuario y gestión de solicitudes de cita.

## 3. Supported Scopes

- `read:services`: Consulta de servicios de psicología clínica y tarifas.
- `write:appointments`: Envío y formulación de citas terapéuticas.
- `write:newsletter`: Suscripción al boletín de salud mental.

## 4. Credential Usage

Todas las peticiones autenticadas deben incluir el token Bearer en el encabezado HTTP estándar:

```http
Authorization: Bearer <agent_access_token>
```
