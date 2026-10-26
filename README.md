# Diente de León — Recursos para estimular el aprendizaje

Sitio web de **Barbara Caballero Veas**, psicopedagoga y educadora diferencial en formación (San Felipe, V Región, Chile).

## Páginas

| Archivo | Contenido |
|---|---|
| `index.html` | Inicio: presentación, lo que hago, testimonio y contacto rápido |
| `nosotros.html` | Sobre mí: enfoque, formación y galería de fotos con visor |
| `servicios.html` | Servicios para niños, familias y colegios, y cómo empezamos |
| `contacto.html` | WhatsApp, redes, formulario de contacto y opiniones |
| `404.html` | Página para enlaces rotos |

## Estructura

```
assets/
  css/site.css      estilos de todo el sitio
  js/main.js        menú en celular, visor de fotos, año del pie
  js/contacto.js    formulario (EmailJS) y opiniones (Firebase)
  img/              fotos optimizadas
database.rules.json reglas de seguridad para Firebase
```

## Funciones

- Diseño adaptado a celular, tablet y computador
- Botón flotante de WhatsApp con mensaje inicial
- Formulario con validación, protección anti-spam y avisos claros de éxito o error (EmailJS)
- Opiniones guardadas en Firebase: los visitantes pueden publicar y dar "me gusta", pero **no pueden borrar**
- Galería con visor (flechas, teclado y deslizar con el dedo)
- Accesible: navegación con teclado, textos alternativos, respeta "reducir movimiento"

## Configuración pendiente (una sola vez)

**Reglas de Firebase** — para que nadie pueda borrar o modificar opiniones:
1. Entra a [Firebase Console](https://console.firebase.google.com) → proyecto `barbara-caballero`.
2. Realtime Database → pestaña **Reglas**.
3. Pega el contenido de `database.rules.json` y presiona **Publicar**.

Para **moderar** (borrar una opinión), hazlo desde la pestaña **Datos** de la misma consola.

**EmailJS** — la plantilla `template_47b6twm` recibe: `name`, `email`, `reply_to`, `time` y `message`
(el mensaje incluye el motivo y el teléfono).

## Publicar

Es un sitio estático: funciona en GitHub Pages o Netlify sin compilar nada.

---
Desarrollado por Ariel Rivera — Rivera Systems.
