# Ho_Slider - PrestaShop 8 Module

Módulo profesional de slider 3D para la página principal de PrestaShop 8 con efectos modernos, gestión completa desde el back office y soporte para imágenes adaptativas (desktop/mobile).

## Descripción

Ho_Slider es un módulo avanzado que permite crear y gestionar un slider de imágenes ultra moderno con efectos 3D para mostrar en la página principal de tu tienda PrestaShop. Incluye una interfaz de administración completa, diseño totalmente responsive y soporte para imágenes diferenciadas entre desktop y móvil.

## Características

### Front Office
- ✅ **Slider 3D moderno** con efectos de profundidad y perspectiva
- ✅ **Imágenes adaptativas** - diferentes imágenes para desktop y mobile
- ✅ **Navegación múltiple**: flechas laterales, puntos indicadores, clic en slides vecinos, teclado y touch/swipe
- ✅ **Autoplay configurable** con velocidad ajustable y pausa en hover
- ✅ **Soporte multiidioma** - contenido diferente por idioma
- ✅ **Enlaces opcionales** en cada slide
- ✅ **Transiciones suaves** con cubic-bezier personalizados
- ✅ **Previsualización lateral** - slides previos/siguientes visibles y clicables
- ✅ **Optimización de rendimiento** - detección de visibilidad de página
- ✅ **Accesibilidad completa** - soporte de teclado y ARIA labels
- ✅ **Sin dependencias** - JavaScript vanilla puro (no jQuery)

### Back Office
- ✅ **Gestión completa de slides** - añadir, editar, eliminar, duplicar
- ✅ **Previsualización de imágenes** en la lista con thumbnails
- ✅ **Drag & drop para reordenar** slides fácilmente
- ✅ **Activar/desactivar** slides individuales con un clic
- ✅ **Duplicación rápida** de slides existentes
- ✅ **Configuración del slider**: velocidad, autoplay, pausa en hover, template
- ✅ **2 Templates disponibles**: Default 3D y Alternative full-width
- ✅ **Soporte multiidioma** - campos específicos por idioma
- ✅ **Carga de imágenes doble**: desktop (1200x480px) y mobile (768x512px)
- ✅ **Validación de formatos**: JPG, PNG, GIF, WebP (hasta 20MB)
- ✅ **Interfaz moderna** con iconos FontAwesome y diseño limpio
- ✅ **Cumple estándares PrestaShop 8** - validado y optimizado

## Instalación

1. Descarga o clona el módulo
2. Sube la carpeta `ho_slider` a `/modules/` en tu instalación de PrestaShop
3. Ve a **Módulos > Module Manager** en el back office
4. Busca "Ho Slider"
5. Haz clic en "Instalar"
6. Configura el módulo y añade tus slides

## Configuración

### Añadir Slides

1. Ve a **Módulos > Module Manager**
2. Busca "Ho Slider" y haz clic en "Configurar"
3. En el formulario "Añadir Slide":
   - **URL**: Link de destino al hacer clic (opcional, multiidioma)
   - **Imagen Desktop**: Subir imagen principal (tamaño recomendado: 1200x480px)
   - **Imagen Mobile**: Subir imagen optimizada para móvil (tamaño recomendado: 768x512px, opcional)
   - **Activo**: Activar/desactivar el slide
4. Haz clic en "Guardar"

**Nota**: Si no subes imagen mobile, se usará la imagen desktop en todos los dispositivos. Para mejor experiencia, sube ambas versiones optimizadas para cada pantalla.

### Configuración General

En la sección "Configuración del Slider" puedes ajustar:

- **Slider Template**: Elegir entre dos diseños diferentes
  - **Default - 3D Modern**: Slider con efectos 3D, slides vecinos visibles, perspectiva y profundidad (max-width: 1200px)
  - **Alternative - Full width**: Slider ancho completo sin márgenes laterales, ideal para banners hero full-screen
- **Velocidad de transición**: Tiempo entre slides en milisegundos (por defecto: 5000 = 5 segundos)
- **Autoplay**: Activar/desactivar cambio automático de slides
- **Pausar al pasar el ratón**: Pausar autoplay cuando el usuario coloca el cursor sobre el slider

### Gestionar Slides

En la lista de slides puedes:
- 📋 **Ver previsualización** de las imágenes desktop y mobile
- ✏️ **Editar** slides existentes
- 📋 **Duplicar** slides rápidamente
- 🗑️ **Eliminar** slides
- ✓/✗ **Activar/Desactivar** slides con un clic
- 🔀 **Reordenar** slides con drag & drop (arrastra el icono ☰)

## Estructura de Base de Datos

El módulo crea dos tablas:

### `ps_ho_slider`
- `id_slide`: ID del slide
- `id_shop`: ID de la tienda
- `position`: Orden de visualización
- `active`: Estado activo/inactivo

### `ps_ho_slider_lang`
- `id_slide`: ID del slide
- `id_lang`: ID del idioma
- `url`: URL de destino (opcional)
- `image`: Nombre del archivo de imagen desktop
- `image_mobile`: Nombre del archivo de imagen mobile (opcional)

## Estructura de Archivos

```
ho_slider/
├── ho_slider.php                 # Clase principal del módulo
├── config.xml                    # Metadata del módulo
├── README.md                     # Documentación
├── .htaccess                     # Seguridad (bloquea PHP, permite assets)
├── index.php                     # Archivo de seguridad
├── classes/
│   ├── HoSlide.php              # Modelo de datos para slides
│   └── index.php                # Archivo de seguridad
├── sql/
│   ├── install.php              # Script de instalación DB (con _PS_VERSION_ check)
│   ├── uninstall.php            # Script de desinstalación DB (con _PS_VERSION_ check)
│   └── index.php                # Archivo de seguridad
├── views/
│   ├── css/
│   │   ├── front.css            # Estilos slider 3D moderno (973 líneas)
│   │   ├── front_alternative.css # Estilos slider full-width (nuevo)
│   │   ├── back.css             # Estilos del panel admin (360+ líneas)
│   │   └── index.php            # Archivo de seguridad
│   ├── js/
│   │   ├── front.js             # JavaScript slider default (499 líneas)
│   │   ├── front_alternative.js  # JavaScript slider alternative (nuevo)
│   │   ├── back.js              # JavaScript drag & drop admin (132 líneas)
│   │   └── index.php            # Archivo de seguridad
│   ├── img/
│   │   └── index.php            # Archivo de seguridad
│   └── templates/
│       ├── admin/
│       │   ├── slides_list.tpl  # Lista de slides en admin
│       │   └── index.php        # Archivo de seguridad
│       └── hook/
│           ├── ho_slider.tpl    # Template del slider en front
│           └── index.php        # Archivo de seguridad
└── translations/
    └── index.php                # Archivo de seguridad
```

## Hooks Utilizados

- `displayHome`: Muestra el slider en la página principal
- `header`: Añade CSS y JavaScript al front office (usando registerStylesheet/registerJavascript)
- `displayBackOfficeHeader`: Añade assets al back office

## Requisitos Técnicos

- PrestaShop 8.x o superior
- PHP 7.2 o superior
- MySQL 5.6 o superior

## Características Técnicas

### Templates y Estilos
- **2 Templates incluidos**: Default 3D y Alternative Full-width
- **Cambio dinámico**: El módulo carga los CSS/JS correspondientes según el template seleccionado
- **Archivos separados**: Cada template tiene su propio CSS y JavaScript independiente
- **Sin conflictos**: Solo se carga un template a la vez

### Imágenes Adaptativas
- **Desktop**: 1200x480px (ratio 5:2) - Imagen horizontal optimizada
- **Mobile**: 768x512px (ratio 3:2) - Imagen más cuadrada, mejor para vertical
- **Cambio automático** en breakpoint 768px
- **Lazy loading** con atributo `loading="lazy"`
- **Formatos soportados**: JPG, JPEG, PNG, GIF, WebP
- **Tamaño máximo**: 20MB por imagen

### Efectos 3D y Animaciones
- **Perspectiva 3D** con CSS `transform-style: preserve-3d`
- **Slides vecinos visibles** con opacidad reducida y escala 0.85
- **Transiciones suaves** usando `cubic-bezier(0.68, -0.55, 0.265, 1.55)`
- **Efecto de profundidad** con shadows y filtros de brillo
- **Hover effects** en controles y slides vecinos

### Optimizaciones de Rendimiento
- **JavaScript vanilla puro** - sin jQuery ni dependencias
- **Page Visibility API** - pausa autoplay cuando la pestaña no es visible
- **CSS3 hardware-accelerated** - transiciones con GPU
- **Preload de imágenes** para transiciones suaves
- **Event delegation** para mejor rendimiento
- **Debounce en resize** para evitar cálculos excesivos

### Accesibilidad (WCAG 2.1)
- **ARIA labels** completos en todos los controles
- **Soporte de teclado**: ←/→ para navegar, Space para pausar
- **Textos alternativos** en todas las imágenes
- **Focus visible** en elementos interactivos
- **Semántica HTML5** correcta

## Personalización

### Templates Disponibles

El módulo incluye **2 templates** que puedes seleccionar desde el back office:

#### 1. **Default - 3D Modern** (Recomendado)
- Slider con efectos 3D y perspectiva
- Slides vecinos visibles con opacidad reducida
- Max-width: 1200px con márgenes laterales
- Ideal para: tiendas con diseño clásico/boxed
- Archivos: `front.css` + `front.js`

#### 2. **Alternative - Full Width**
- Slider ancho completo sin márgenes
- Ocupa todo el ancho de la ventana
- Sin slides vecinos visibles
- Ideal para: banners hero, tiendas con diseño moderno edge-to-edge
- Archivos: `front_alternative.css` + `front_alternative.js`

Para cambiar el template:
1. Ve a la configuración del módulo
2. Sección "Slider Settings"
3. Selecciona "Slider Template"
4. Guarda cambios

### CSS
Puedes personalizar los estilos editando `/views/css/front.css`. Las principales variables y clases son:

**Variables CSS:**
```css
.ho-slider-container {
    --slider-transition: 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    --slider-control-size: 60px;
    --slider-dot-size: 14px;
    --slider-primary: #a6312e; /* Color principal */
    --slider-card-depth: 40px;
}
```

**Clases principales:**
- `.ho-slider-container`: Contenedor principal (max-width: 1200px)
- `.ho-slide`: Slide individual con efectos 3D
- `.ho-slide.active`: Slide actualmente visible
- `.ho-slide.prev` / `.ho-slide.next`: Slides vecinos visibles
- `.ho-slider-control`: Botones de navegación laterales
- `.ho-slider-dot`: Indicadores de puntos

### JavaScript
El comportamiento del slider puede modificarse en `/views/js/front.js`. Las funciones principales son:

**API Pública:**
```javascript
// Navegación
goToSlide(index)          // Ir a un slide específico
nextSlide()               // Siguiente slide
prevSlide()               // Slide anterior

// Autoplay
startAutoplay()           // Iniciar reproducción automática
stopAutoplay()            // Detener reproducción

// Touch/Swipe
handleTouchStart(e)       // Inicio de swipe
handleTouchMove(e)        // Movimiento de swipe
handleTouchEnd()          // Fin de swipe

// Responsive
updateSlideImage()        // Cambiar imagen según viewport
```

### Archivos de Idioma
Las traducciones se generan automáticamente en `/translations/`. Para añadir nuevos textos traducibles, usa:

```php
$this->l('Your text here')  // En PHP
{l s='Your text here' mod='ho_slider'}  // En Smarty
```

## Seguridad y Cumplimiento de Estándares

✅ **Validado para PrestaShop 8**
- Sin HTML inline en código PHP (usa HelperForm nativo)
- Verificación `_PS_VERSION_` en todos los archivos PHP
- Archivo `.htaccess` protege archivos sensibles pero permite assets
- Archivos `index.php` de seguridad en todos los directorios
- Sanitización de todas las entradas de usuario
- Escape de salidas en plantillas Smarty
- Uso de métodos seguros: `pSQL()`, `(int)`, `Tools::getValue()`

## Compatibilidad

- ✅ PrestaShop 8.0+
- ✅ PHP 7.2 - 8.2
- ✅ MySQL 5.6+ / MariaDB 10.2+
- ✅ Navegadores modernos: Chrome, Firefox, Safari, Edge
- ✅ Responsive: Desktop, Tablet, Mobile
- ✅ Multi-tienda compatible
- ✅ Multi-idioma compatible

## Changelog
### v1.0.0 (2025-11-04)
- ✅ Lanzamiento inicial completo
- ✅ **2 Templates incluidos**: Default 3D y Alternative Full-width
- ✅ **Slider 3D moderno** con efectos de profundidad y perspectiva (template default)
- ✅ **Slider full-width** sin márgenes para banners hero (template alternative)
- ✅ **Imágenes adaptativas** desktop/mobile con cambio automático
- ✅ Sistema completo de gestión de slides con CRUD
- ✅ Drag & drop para reordenar slides
- ✅ Duplicación rápida de slides
- ✅ Navegación múltiple (flechas, dots, clic en vecinos, teclado, swipe)
- ✅ Autoplay configurable con pausa en hover
- ✅ Soporte multiidioma completo
- ✅ JavaScript vanilla sin dependencias
- ✅ Cumple estándares PrestaShop 8 (validado)
- ✅ Seguridad mejorada con .htaccess y verificaciones
- ✅ Optimizaciones de rendimiento y accesibilidad
- ✅ Documentación completa

## Licencia

Academic Free License (AFL 3.0)

## Autor

Mario - [GitHub](https://github.com/Mario-CS)

## Soporte

Para reportar problemas o solicitar características:
- **Issues**: https://github.com/Mario-CS/ho_slider/issues
- **Pull Requests**: Contribuciones bienvenidas

## Soporte

Para reportar problemas o solicitar características:
- **GitHub Issues**: https://github.com/Mario-CS/ho_slider/issues
- **Pull Requests**: Contribuciones bienvenidas
- **Email**: Contacta al desarrollador para soporte comercial

## Preguntas Frecuentes (FAQ)

**P: ¿Cuál es la diferencia entre los templates Default y Alternative?**  
R: Default tiene efectos 3D con slides vecinos visibles (max-width 1200px), Alternative es full-width sin márgenes para banners hero modernos.

**P: ¿Puedo personalizar los templates?**  
R: Sí, edita `front.css` + `front.js` (Default) o `front_alternative.css` + `front_alternative.js` (Alternative).

**P: ¿Cómo cambio los colores del slider?**  
R: Edita las variables CSS en `/views/css/front.css` o `front_alternative.css`, especialmente `--slider-primary`.

**P: ¿Puedo usar solo una imagen para desktop y mobile?**  
R: Sí, si no subes imagen mobile, se usará la desktop en todos los dispositivos.

**P: ¿Cuántos slides puedo tener?**  
R: No hay límite técnico, pero se recomienda entre 3-7 slides para mejor rendimiento.

**P: ¿Funciona con HTTPS?**  
R: Sí, totalmente compatible con HTTPS.

**P: ¿Puedo tener múltiples sliders?**  
R: Actualmente solo uno por página (en displayHome). Próximamente se añadirá soporte para múltiples.

**P: ¿Es compatible con módulos de cache?**  
R: Sí, compatible con todos los sistemas de cache de PrestaShop.

## Créditos

- **Desarrollador**: Mario
- **Framework**: PrestaShop 8
- **Iconos**: FontAwesome (incluido en PrestaShop)
- **Inspiración**: Modern UI/UX trends 2025

---

**¿Te gusta este módulo?** ⭐ Dale una estrella en GitHub y comparte con otros desarrolladores PrestaShop.
