# Configuración de Registros DNS para AI Discovery (DNS-AID) y DNSSEC

Este documento describe la configuración de registros DNS necesaria para cumplir con el estándar **DNS-AID** ([draft-mozleywilliams-dnsop-dnsaid](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/)) y el descubrimiento de agentes a través de resolución DNS.

---

## 1. Registros DNS Requeridos en tu Proveedor (Cloudflare / Route53 / Namecheap / etc.)

Añade los siguientes registros en la zona de administración DNS de tu dominio `karencardiel.com`:

### A. Registro SVCB para el Índice General de Agentes (`_index._agents`)
- **Tipo:** `SVCB` (o `HTTPS` si tu proveedor lo prefiere para endpoints web)
- **Nombre (Host):** `_index._agents` (FQDN: `_index._agents.karencardiel.com`)
- **Prioridad / SvcPriority:** `1`
- **Target:** `www.karencardiel.com.`
- **Parámetros / SvcParams:** `alpn="h2,h3" port=443 mandatory=alpn,port`
- **TTL:** `3600` (o Auto)

### B. Registro SVCB para Agente a Agente (`_a2a._agents`)
- **Tipo:** `SVCB`
- **Nombre (Host):** `_a2a._agents` (FQDN: `_a2a._agents.karencardiel.com`)
- **Prioridad / SvcPriority:** `1`
- **Target:** `www.karencardiel.com.`
- **Parámetros / SvcParams:** `alpn="a2a" port=443 mandatory=alpn,port`
- **TTL:** `3600` (o Auto)

### C. Registro TXT para el Catálogo ARD (`_catalog._agents`)
- **Tipo:** `TXT`
- **Nombre (Host):** `_catalog._agents` (FQDN: `_catalog._agents.karencardiel.com`)
- **Contenido / Valor:** `"url=https://www.karencardiel.com/.well-known/ai-catalog.json"`
- **TTL:** `3600` (o Auto)

### D. Registro SRV para Búsqueda Semántica de Agentes (`_search._agents`)
- **Tipo:** `SRV`
- **Servicio:** `_search`
- **Protocolo:** `_tcp` (o `_agents`)
- **Nombre (Host):** `_search._agents`
- **Prioridad:** `10`
- **Peso (Weight):** `10`
- **Puerto:** `443`
- **Target:** `www.karencardiel.com.`
- **TTL:** `3600`

---

## 2. Formato de Zona Bind (Exportación / Importación)

Si tu proveedor de DNS permite importar archivos de zona en formato BIND, utiliza el siguiente bloque:

```dns
; Registros DNS-AID para Psicóloga Karen Cardiel
_index._agents.karencardiel.com. 3600 IN SVCB 1 www.karencardiel.com. alpn="h2,h3" port=443 mandatory=alpn,port
_a2a._agents.karencardiel.com.   3600 IN SVCB 1 www.karencardiel.com. alpn="a2a" port=443 mandatory=alpn,port
_catalog._agents.karencardiel.com. 3600 IN TXT "url=https://www.karencardiel.com/.well-known/ai-catalog.json"
_search._agents.karencardiel.com.  3600 IN SRV 10 10 443 www.karencardiel.com.
```

---

## 3. Habilitar DNSSEC (Autenticación Criptográfica de Registros)

Para que los agentes de IA y resolvers que validan DNSSEC acepten los registros como auténticos:

1. Ingresa al panel de control de tu registrador / proveedor DNS (por ejemplo Cloudflare o tu panel de dominio).
2. Ve a la pestaña **DNS** > **DNSSEC**.
3. Haz clic en **Enable DNSSEC** (Habilitar DNSSEC).
4. Copia los registros `DS` provistos (Key Tag, Algorithm, Digest Type, Digest) y agrégalos en el panel de tu registrador de dominio si tu DNS está delegado externamente.

---

## 4. Validación

Puedes comprobar la resolución de tus registros DNS-AID con la herramienta `dig` o mediante DoH (DNS over HTTPS):

```bash
# Comprobar registro SVCB de agentes
dig +short SVCB _a2a._agents.karencardiel.com

# Comprobar registro TXT del catálogo
dig +short TXT _catalog._agents.karencardiel.com
```
