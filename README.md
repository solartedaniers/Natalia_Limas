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
    ui/           piezas reutilizables: Icon, Reveal, AccentTitle
  config/         ids de las secciones
  content/        todo el texto y los datos: es.json, en.json y site.json
  i18n/           proveedor de idioma
  lib/            ContentRepository, LanguagePreference y LinkBuilder
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

## Despliegue

Subo el proyecto a GitHub, lo importo en Vercel y le doy Deploy. Vercel detecta Next.js solo, sin configuración extra.
