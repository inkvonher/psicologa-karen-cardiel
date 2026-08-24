---
name: auth-md
description: Registro y autenticación automatizada para agentes de Inteligencia Artificial (Auth.md).
---

# Skill: Auth.md Agent Registration Discovery

Esta habilidad describe las instrucciones para el registro y provisión de credenciales de agentes de Inteligencia Artificial.

## Endpoints de Descubrimiento

- **Protected Resource Metadata (PRM):** `https://www.karencardiel.com/.well-known/oauth-protected-resource`
- **OAuth Authorization Server:** `https://www.karencardiel.com/.well-known/oauth-authorization-server`
- **Endpoint de Registro:** `https://www.karencardiel.com/agent/auth`
- **Endpoint de Reclamación Anónima:** `https://www.karencardiel.com/agent/claim`

## Tipos de Identidad

- `identity_assertion`: Vía tokens ID-JAG (`urn:ietf:params:oauth:token-type:id-jag`) o `verified_email`.
- `anonymous`: Acceso con bearer token provisional para operaciones públicas.
