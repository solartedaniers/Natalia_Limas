# Portafolio de Julieth Limas

Este es el portafolio digital que construí para Julieth Natalia Limas Solarte, Ingeniera Industrial. El diseño es la propuesta "Horizonte Sereno": azul marino, azul claro y lila pastel, con un estilo profesional, formas suaves y transiciones.

## Tecnologías

- Next.js 15 (App Router) con TypeScript
- Tailwind CSS 4
- Framer Motion para las animaciones
- Fuentes autoalojadas: Playfair Display y Manrope

## Cómo lo corro en local

```bash
npm install
npm run dev
```

Abro http://localhost:3000. Para verificar antes de subir:

```bash
npm run lint
npm run build
```

## Cómo está organizado

```
src/
  app/            layout, página principal y estilos globales (paleta en variables CSS)
  components/
    layout/       encabezado y selector de idioma
    sections/     una sección por archivo: Hero, About, Experience, Credentials, Testimonials, Contact
    ui/           piezas reutilizables: Icon, Reveal, AccentTitle, SparkleBurst
    assistant/    robot y ventana de chat del asistente
  app/api/chat/   ruta del servidor que habla con Gemini
  config/         ids de las secciones, efectos y límites del asistente
  content/        todo el texto y los datos: es.json, en.json, site.json y assistant.json
  i18n/           proveedor de idioma
  lib/            ContentRepository, LanguagePreference, LinkBuilder y assistant/ (servicio, instrucciones y límites)
  services/       ContactService (validación y envío del formulario)
  types/          tipos del contenido
public/
  images/         foto de perfil
  documents/      aquí van los PDF de los soportes
```

## Cómo cambio el contenido

No hay texto, colores ni rutas escritos dentro de los componentes:

- Los textos en español están en `src/content/es.json` y en inglés en `src/content/en.json`. Si cambio uno, cambio el otro con la misma estructura.
- Los datos que no dependen del idioma (correo, WhatsApp, LinkedIn, foto, documentos y el tiempo de rotación de los testimonios) están en `src/content/site.json`.
- Los colores están solo en `src/app/globals.css`, en las variables de `:root` (modo claro) y en el bloque `prefers-color-scheme: dark` (modo oscuro).

## Lo que falta completar

1. **LinkedIn**: pongo la URL en `contact.linkedinUrl` de `site.json`. Mientras esté vacío, el botón aparece como "LinkedIn · pronto".
2. **Soportes**: copio cada PDF a `public/documents/` y pongo su ruta en `documents` de `site.json`, por ejemplo `"iso-9001": "/documents/certificado-iso-9001.pdf"`. Mientras esté vacío, la tarjeta muestra "Soporte pendiente". Antes de subir un diploma tapo la cédula.
3. **Testimonios**: reemplazo los textos entre corchetes en `testimonials.items` de los dos JSON.
4. **Formulario**: usa FormSubmit con el correo de `contact.formEndpoint`. El primer mensaje que llegue trae un correo de activación que hay que confirmar una vez.

## Comportamiento

- El tema claro u oscuro sigue al sistema operativo; no hay botón para cambiarlo.
- El idioma inicial sale del navegador, y los botones ES/EN lo cambian y lo recuerdan.
- Es responsivo en celular, tablet y escritorio, y respeta la preferencia de movimiento reducido.

## Asistente con IA

En la esquina inferior derecha hay un robot que abre un chat. Responde dudas sobre Julieth usando Gemini, la IA de Google.

**Dónde está la clave.** En Vercel: proyecto → Settings → Environment Variables → `GEMINI_API_KEY`. En mi computador está en `.env.local`, que Git ignora; `.env.example` muestra las variables sin valores. La clave solo se usa en el servidor (`src/app/api/chat/route.ts`) y nunca llega al navegador ni al repositorio.

**Cómo le agrego información.** El asistente lee solo el contenido de la página (`es.json`, `en.json` y `site.json`), así que si actualizo la experiencia, los soportes o el CV, ya lo sabe. Para datos que no están en la página, o para cambiar su tono y sus reglas, edito `src/content/assistant.json` (`extraFacts`, `persona` y `rules`). Los textos del chat (nombre, saludo, preguntas sugeridas, avisos) están en el bloque `assistant` de los dos JSON, y los límites y tiempos en `src/config/assistant.ts`.

**Si algún día deja de responder.** El chat nunca muestra errores técnicos: muestra un mensaje amable con los botones de WhatsApp y correo. Para encontrar la causa:

1. En Vercel → Logs busco las líneas que empiezan con `[assistant]`. Ahí sale el motivo, nunca la clave.
2. Si dice `429`, se agotó el cupo gratuito del día: se recupera solo.
3. Si dice `400`, `401` o `403`, la clave dejó de servir: creo una nueva en https://aistudio.google.com/apikey, la cambio en Vercel y hago Redeploy.
4. Si dice `404`, el modelo ya no existe: en Vercel creo la variable `GEMINI_MODEL` con un modelo vigente (por ejemplo `gemini-flash-latest`) y hago Redeploy.

Por defecto usa `gemini-flash-latest`, un alias que Google actualiza solo, y si está saturado prueba una vez con `gemini-flash-lite-latest`.

## Despliegue

Subo el proyecto a GitHub, lo importo en Vercel y le doy Deploy. Vercel detecta Next.js solo, sin configuración extra.
