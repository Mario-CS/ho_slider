# Ho_Slider - PrestaShop 8 Module

Módulo de slider responsive para la página principal de PrestaShop 8 con gestión completa desde el back office.

## Descripción

Ho_Slider es un módulo profesional que permite crear y gestionar un slider de imágenes para mostrar en la página principal de tu tienda PrestaShop. Incluye una interfaz de administración completa y un diseño totalmente responsive.

## Características

### Front Office
- ✅ **Slider responsive** con diseño adaptable a todos los dispositivos
- ✅ **Autoplay configurable** con velocidad ajustable
- ✅ **Navegación múltiple**: flechas, puntos indicadores, teclado y touch/swipe
- ✅ **Soporte multiidioma** - contenido diferente por idioma
- ✅ **Enlaces opcionales** en cada slide
- ✅ **Captions personalizables** con título y descripción
- ✅ **Optimización de rendimiento** - pausa automática cuando la página no es visible
- ✅ **Accesibilidad** - soporte completo de teclado y ARIA labels

### Back Office
- ✅ **Gestión completa de slides** - añadir, editar, eliminar
- ✅ **Previsualización de imágenes** en la lista
- ✅ **Activar/desactivar** slides individuales
- ✅ **Ordenación manual** de slides (próximamente)
- ✅ **Configuración del slider**: velocidad, autoplay, pausa en hover
- ✅ **Soporte multiidioma** - contenido diferente por idioma
- ✅ **Carga de imágenes** simple con validación

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
   - **Título**: Título principal del slide (multiidioma)
   - **Descripción**: Texto descriptivo (opcional, multiidioma)
   - **Imagen**: Subir imagen (tamaño recomendado: 1920x600px)
   - **URL**: Link de destino al hacer clic (opcional, multiidioma)
   - **Leyenda**: Texto alternativo para la imagen (multiidioma)
   - **Activo**: Activar/desactivar el slide
4. Haz clic en "Guardar"

### Configuración General

En la sección "Configuración del Slider" puedes ajustar:

- **Velocidad de transición**: Tiempo entre slides en milisegundos (por defecto: 5000 = 5 segundos)
- **Autoplay**: Activar/desactivar cambio automático de slides
- **Pausar al pasar el ratón**: Pausar autoplay en hover

### Gestionar Slides

En la lista de slides puedes:
- ✏️ **Editar** slides existentes
- 🗑️ **Eliminar** slides
- ✓/✗ **Activar/Desactivar** slides con un clic
- Ver **previsualización** de las imágenes

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
- `title`: Título del slide
- `description`: Descripción HTML
- `legend`: Texto alternativo
- `url`: URL de destino
- `image`: Nombre del archivo de imagen

## Estructura de Archivos

```
ho_slider/
├── ho_slider.php                 # Clase principal del módulo
├── config.xml                    # Metadata del módulo
├── Readme.md                     # Documentación
├── classes/
│   └── HoSlide.php              # Modelo de datos para slides
├── sql/
│   ├── install.php              # Script de instalación DB
│   └── uninstall.php            # Script de desinstalación DB
├── views/
│   ├── css/
│   │   ├── front.css            # Estilos del slider
│   │   └── back.css             # Estilos del admin
│   ├── js/
│   │   ├── front.js             # JavaScript del slider
│   │   └── back.js              # JavaScript del admin
│   ├── img/
│   │   └── slides/              # Directorio de imágenes
│   └── templates/
│       ├── admin/
│       │   └── slides_list.tpl  # Lista de slides en admin
│       └── hook/
│           └── ho_slider.tpl    # Template del slider en front
└── translations/
```

## Hooks Utilizados

- `displayHome`: Muestra el slider en la página principal
- `header`: Añade CSS y JavaScript al front office
- `displayBackOfficeHeader`: Añade assets al back office

## Requisitos Técnicos

- PrestaShop 8.x o superior
- PHP 7.2 o superior
- MySQL 5.6 o superior
- Extensión GD o Imagick para procesamiento de imágenes

## Características Técnicas

### Responsive Design
- **Desktop**: Ratio 16:5 (1920x600px recomendado)
- **Tablet**: Ratio 5:2 (más alto)
- **Mobile**: Ratio 16:9 (vertical)

### Optimizaciones
- Pausar autoplay cuando la página no es visible
- Lazy loading de imágenes
- Transiciones CSS3 suaves
- Sin dependencias de jQuery
- Código JavaScript vanilla optimizado

### Accesibilidad
- ARIA labels en controles
- Soporte completo de teclado
- Textos alternativos en imágenes
- Contraste adecuado en captions

## Personalización

### CSS
Puedes personalizar los estilos editando `/views/css/front.css`. Las principales clases son:

- `.ho-slider-container`: Contenedor principal
- `.ho-slide`: Slide individual
- `.ho-slide-caption`: Caption con título y descripción
- `.ho-slider-control`: Botones de navegación
- `.ho-slider-dot`: Indicadores de puntos

### JavaScript
El comportamiento del slider puede modificarse en `/views/js/front.js`. Las funciones principales son:

- `goToSlide(index)`: Ir a un slide específico
- `nextSlide()`: Siguiente slide
- `prevSlide()`: Slide anterior
- `startAutoplay()`: Iniciar reproducción automática
- `stopAutoplay()`: Detener reproducción

## Próximas Características

- [ ] Drag & drop para reordenar slides
- [ ] Efectos de transición personalizables (fade, slide, zoom)
- [ ] Soporte para videos
- [ ] Múltiples sliders por página
- [ ] Programación de slides por fechas
- [ ] Estadísticas de clics

## Licencia

Academic Free License (AFL 3.0)

## Autor

Mario - [GitHub](https://github.com/Mario-CS)

## Soporte

Para reportar problemas o solicitar características:
- **Issues**: https://github.com/Mario-CS/ho_slider/issues
- **Pull Requests**: Contribuciones bienvenidas

## Changelog

### v1.0.0 (2025-10-27)
- Lanzamiento inicial
- Sistema completo de gestión de slides
- Slider responsive con autoplay
- Soporte multiidioma
- Navegación completa (flechas, dots, keyboard, touch)
- Configuración desde back office
