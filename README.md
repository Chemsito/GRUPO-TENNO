# Grupo Tenno

Sitio web corporativo e informativo de **Grupo Tenno** — *Diferentes marcas, una misma visión.*

Grupo Tenno centraliza la dirección, administración y crecimiento de las marcas **Vidriería Misti Glass**, **Reserva Aqueris**, **Kantu Floral** y **Bocatto**, integrando gestión, supervisión, logística, ventas, finanzas, marketing, innovación y soporte.

Publicado en GitHub Pages: https://chemsito.github.io/GRUPO-TENNO/

## Estructura

| Archivo | Contenido |
| --- | --- |
| `index.html` | Página única: hero con núcleo 3D, qué es (explicado en 20 segundos), panel interactivo de 8 áreas, ciclo de trabajo, marcas, principios, fundador, cómo asociarse, preguntas frecuentes y contacto. Incluye meta SEO, Open Graph y datos estructurados (JSON-LD, con FAQPage). |
| `styles.css` | Sistema visual "centro de mando" (oscuro, paneles HUD, retícula técnica; Geist y Geist Mono), responsive y con soporte de `prefers-reduced-motion`. |
| `script.js` | Núcleo 3D en canvas (esfera de nodos con las 4 marcas en órbita, se puede girar arrastrando), pestañas accesibles de las 8 áreas, línea del ciclo ligada al scroll, revelados, menú móvil accesible y microinteracciones. Sin dependencias. |
| `404.html` | Página de error personalizada. |
| `sitemap.xml`, `robots.txt` | Indexación. |
| `assets/` | Logos, foto del fundador, imagen Open Graph e iconos. |

El sitio es estático: no requiere compilación. Para verlo en local basta con servir la carpeta, por ejemplo `npx serve .`.
