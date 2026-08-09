# Configuración de Supabase para Psicóloga Karen Cardiel

Para conectar tu panel de administración a la nube, sigue estos sencillos pasos para crear la base de datos de forma gratuita.

---

## Paso 1: Crear tu Proyecto en Supabase
1. Ingresa a [Supabase.com](https://supabase.com) y regístrate o inicia sesión (puedes usar tu cuenta de GitHub o correo electrónico).
2. Haz clic en **"New Project"** (Nuevo Proyecto).
3. Selecciona tu organización, ponle un nombre a tu proyecto (ej: `karen-cardiel-admin`), define una contraseña segura para tu base de datos y elige la región más cercana a ti.
    4. Haz clic en **"Create new project"**. Espera 1-2 minutos a que el servidor se configure por completo.

    --- ZKs0wJGXjFIeHi7w

    ## Paso 2: Crear las Tablas con el SQL Editor
    Una vez que el proyecto esté listo:
    1. En el menú lateral izquierdo de Supabase, busca y haz clic en el icono del **"SQL Editor"** (editor SQL, que tiene el símbolo `SQL`).
    2. Haz clic en **"New query"** (Nueva consulta).
    3. Copia el siguiente código SQL por completo y pégalo en el editor:

    ```sql
    -- 1. Crear tabla de Pacientes
    CREATE TABLE public.pacientes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER,
        phone TEXT,
        motive TEXT,
        start_date DATE,
        status TEXT DEFAULT 'active',
        notes JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );

    -- 2. Crear tabla de Citas
    CREATE TABLE public.citas (
        id TEXT PRIMARY KEY,
        patient_id TEXT REFERENCES public.pacientes(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time TEXT NOT NULL,
        cost INTEGER DEFAULT 600,
        status TEXT DEFAULT 'scheduled',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );

    -- 3. Crear tabla de Transacciones Financieras
    CREATE TABLE public.transacciones (
        id TEXT PRIMARY KEY,
        date DATE NOT NULL,
        concept TEXT NOT NULL,
        type TEXT NOT NULL, -- 'income' o 'expense'
        amount INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );

    -- 4. Crear tabla de Suscriptores del Newsletter
    CREATE TABLE public.suscriptores (
        email TEXT PRIMARY KEY,
        date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );

    -- Habilitar acceso de lectura/escritura pública temporal para desarrollo rápido (sin RLS estricto)
    ALTER TABLE public.pacientes DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.citas DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.transacciones DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.suscriptores DISABLE ROW LEVEL SECURITY;
    ```

4. Haz clic en el botón verde **"Run"** (Ejecutar) arriba a la derecha. Verás un mensaje que dice `Success. No rows returned`. ¡Tus tablas ya están listas!

---

## Paso 3: Obtener tus Credenciales
1. En el menú lateral izquierdo, haz clic en **"Project Settings"** (el icono de engranaje abajo del todo).
2. Haz clic en la opción **"API"**.
3. Copia los siguientes datos:
   * **Project URL** (sección *Project API keys*): Se ve como `https://xxxxxxxxxxxxxx.supabase.co`.
   * **anon / public key** (clave pública anónima): Un texto largo que empieza con `eyJhbGciOi...`.

---

## Paso 4: Conectar el Panel de Administración
1. Abre el panel de administración de Karen en tu navegador: [dashboard.html](file:///Users/vony/psicologa-karen-cardiel/dashboard.html).
2. Inicia sesión (contraseña: `karen2026`).
3. Ve a la pestaña **Ajustes** en el menú izquierdo.
4. En la sección **Sincronización en la Nube (Supabase)**, pega la **Project URL** y la **Anon Key** que copiaste en el paso anterior.
5. Haz clic en **"Guardar y Sincronizar"**.

> [!TIP]
> **Carga automática inicial:** Al presionar "Guardar y Sincronizar", el panel detectará si la base de datos está vacía. Si es así, subirá automáticamente los registros de muestra (*Ana Gómez*, *Carlos Rivera*, etc.) a tu base de datos de Supabase para que no empieces de cero. A partir de ese momento, todos tus dispositivos estarán sincronizados.

https://wqrcujtpbllasjhxffjf.supabase.co/rest/v1/
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcmN1anRwYmxsYXNqaHhmZmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMjY2OTMsImV4cCI6MjEwMTgwMjY5M30.slc8w_h_AA_hT8_yHCG9P-zWoaEvTVdUjKWXeuwakM0