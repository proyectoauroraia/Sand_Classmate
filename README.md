# Sand Classmate - Documentación Técnica

Bienvenido a la documentación para desarrolladores de Sand Classmate. Este documento proporciona una visión general de la arquitectura de la aplicación, las tecnologías utilizadas y los flujos de trabajo clave.

## 1. Descripción General del Proyecto

Sand Classmate es una aplicación web diseñada para docentes universitarios. Su función principal es utilizar IA generativa (Google Gemini a través de Genkit) para analizar documentos académicos (como programas de curso o apuntes) y, a partir de ese análisis, generar materiales educativos de alta calidad como presentaciones de PowerPoint, guías de trabajo y modelos de examen.

El objetivo es actuar como un asistente pedagógico inteligente, optimizando el tiempo del docente y mejorando la calidad de los recursos educativos.

## 2. Stack Tecnológico

La aplicación está construida sobre un stack moderno de JavaScript:

- **Framework Frontend:** [Next.js](https://nextjs.org/) (con App Router y Server Components)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [ShadCN/UI](https://ui.shadcn.com/)
- **Backend y Autenticación:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **Inteligencia Artificial:** [Firebase Genkit](https://firebase.google.com/docs/genkit) (con modelos de Google Gemini)
- **Formularios:** [React Hook Form](https://react-hook-form.com/) y [Zod](https://zod.dev/) para validación.

## 3. Estructura de Archivos Clave

El proyecto sigue la estructura estándar de una aplicación Next.js con el App Router:

```
/src
├── app/                  # Rutas principales de la aplicación (App Router)
│   ├── (auth)/           # Rutas de autenticación (callback, etc.)
│   ├── dashboard/        # Rutas protegidas (perfil, historial, etc.)
│   ├── layout.tsx        # Layout raíz
│   └── page.tsx          # Página de inicio y dashboard principal
├── ai/                   # Lógica de Inteligencia Artificial con Genkit
│   ├── flows/            # Define los flujos de Genkit para análisis y generación
│   └── genkit.ts         # Configuración e inicialización de Genkit
├── components/           # Componentes de React reutilizables
│   ├── auth/             # Componentes para inicio de sesión y registro
│   ├── dashboard/        # Componentes específicos del dashboard
│   └── ui/               # Componentes de ShadCN (Botones, Cards, etc.)
├── lib/                  # Lógica de soporte, acciones y tipos
│   ├── actions.ts        # Server Actions de Next.js
│   ├── supabase/         # Clientes de Supabase (client, server, middleware)
│   ├── types.ts          # Definiciones de tipos de TypeScript
│   └── utils.ts          # Funciones de utilidad (ej. cn para Tailwind)
└── hooks/                # Hooks personalizados de React (ej. useToast)
```

## 4. Flujos de Trabajo Principales

### 4.1. Autenticación con Supabase

- El flujo de autenticación (inicio de sesión, registro) se gestiona a través del cliente de Supabase (`@supabase/ssr` y `@supabase/auth-helpers-nextjs`).
- **Middleware (`src/lib/supabase/middleware.ts`):** Refresca la sesión del usuario en cada petición al servidor, manteniendo al usuario autenticado.
- **Seguridad (RLS):** La base de datos utiliza Row Level Security (RLS) en la tabla `profiles` para asegurar que un usuario solo pueda leer y modificar su propia información. Se utiliza un *trigger* en la base de datos para crear un perfil automáticamente cuando un nuevo usuario se registra.

### 4.2. Flujo de Análisis de Documentos

1.  **Carga del Archivo (`FileUploader`):** El usuario sube un archivo (PDF o DOCX) en el cliente.
2.  **Conversión a Data URI:** El archivo se convierte a un `data URI` (Base64) en el navegador.
3.  **Llamada a la Server Action (`analyzeContentAction`):** Se invoca una Server Action, pasando el `data URI`.
4.  **Ejecución del Flujo de Genkit (`analyzeAndEnrichContent`):** La Server Action llama al flujo de Genkit. Este flujo envía el documento al modelo de IA (Gemini) con un *prompt* diseñado para analizar el contenido desde una perspectiva pedagógica.
5.  **Respuesta Estructurada:** La IA devuelve una respuesta en formato JSON estructurado (`AnalysisResult`).
6.  **Visualización en el Cliente (`AnalysisDisplay`):** El resultado se muestra al usuario en el cliente, dividido en pestañas para facilitar la visualización.

### 4.3. Flujo de Generación de Materiales

1.  **Interacción del Usuario (`GenerationButton`):** El usuario hace clic en un botón para generar un material específico (ej. "Generar Presentación").
2.  **Llamada a la Server Action (`generateMaterialsActionFromAnalysis`):** Se pasa el resultado del análisis previo, el tipo de material deseado y el formato (`docx`, `pdf`, `pptx`).
3.  **Ejecución del Flujo de Genkit (`generateMaterialFromAnalysis`):** La acción llama a un segundo flujo de Genkit. Este flujo utiliza el análisis y el perfil pedagógico del usuario para generar el contenido del material en formato Markdown.
4.  **Conversión de Formato:** La Server Action recibe el Markdown y utiliza librerías (`pptxgenjs`, `docx`, `pdf-lib`) para convertirlo al formato de archivo final solicitado.
5.  **Descarga en el Cliente:** La acción devuelve el archivo final como un `data URI`, que se utiliza para iniciar la descarga en el navegador del usuario.

## 5. Configuración del Entorno de Desarrollo

Para ejecutar este proyecto localmente, un nuevo desarrollador debe seguir estos pasos:

1.  **Clonar el repositorio.**
2.  **Instalar las dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar las variables de entorno:**
    - Crear un archivo `.env.local` en la raíz del proyecto.
    - Añadir las siguientes variables, reemplazando los valores con las credenciales correspondientes:
      ```env
      # Credenciales de Supabase (se encuentran en Project Settings > API)
      NEXT_PUBLIC_SUPABASE_URL=https://<id-proyecto>.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-llave-anon>

      # Clave de API para el modelo de Google Gemini
      GEMINI_API_KEY=<tu-llave-de-api-de-gemini>
      
      # URL base de la aplicación (para desarrollo)
      NEXT_PUBLIC_BASE_URL=http://localhost:3000

      # Credenciales de Webpay (opcional, para pasarela de pago)
      WEBPAY_PLUS_COMMERCE_CODE=...
      WEBPAY_PLUS_API_KEY=...
      ```

4.  **Ejecutar el proyecto en modo de desarrollo:**
    ```bash
    npm run dev
    ```

La aplicación estará disponible en `http://localhost:3000`.
