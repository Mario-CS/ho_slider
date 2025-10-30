/**
* 2007-2025 PrestaShop
*
* NOTICE OF LICENSE
*
* This source file is subject to the Academic Free License (AFL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/afl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@prestashop.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade PrestaShop to newer
* versions in the future. If you wish to customize PrestaShop for your
* needs please refer to http://www.prestashop.com for more information.
*
*  @author    PrestaShop SA <contact@prestashop.com>
*  @copyright 2007-2025 PrestaShop SA
*  @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*
* Don't forget to prefix your containers with your own identifier
* to avoid any conflicts with others containers.
*/

/**
 * HO SLIDER - Modern Slider for PrestaShop
 */

class HoSlider {
    constructor(container, options = {}) {
        // Configuración
        this.config = {
            autoplay: true,
            autoplayDelay: 5000,
            loop: true,
            swipeThreshold: 50,
            transitionDuration: 600,
            keyboard: true,
            keyboard: true,
            ...options
        };

        // Elementos del DOM
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        if (!this.container) {
            console.error('HoSlider: Contenedor no encontrado');
            return;
        }

        this.wrapper = this.container.querySelector('.ho-slider-wrapper');
        this.slidesContainer = this.container.querySelector('.ho-slider-slides');
        this.slides = Array.from(this.container.querySelectorAll('.ho-slide'));
        this.prevBtn = this.container.querySelector('.ho-slider-prev');
        this.nextBtn = this.container.querySelector('.ho-slider-next');
        this.dots = Array.from(this.container.querySelectorAll('.ho-slider-dot'));

        // Estado
        this.currentIndex = this.findActiveSlide();
        this.isTransitioning = false;
        this.autoplayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.direction = 'next';

        // Variables para drag con mouse (desktop)
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragEndX = 0;
        this.dragEndY = 0;
        this.hasDragged = false; // Flag para saber si realmente se arrastró

        // Inicializar
        this.init();
    }

    init() {
        // Configurar slide inicial
        this.updateSlides(false);

        // Cambiar imágenes según resolución
        this.switchResponsiveImages();

        // Event listeners
        this.attachEventListeners();

        // Iniciar autoplay si está habilitado
        if (this.config.autoplay) {
            this.startAutoplay();
        }
    }

    switchResponsiveImages() {
        const isMobile = window.innerWidth <= 768;

        this.slides.forEach(slide => {
            const img = slide.querySelector('.ho-slide-image');
            if (!img) return;

            const mobileUrl = img.getAttribute('data-mobile');
            const desktopUrl = img.getAttribute('data-desktop');

            // Cambiar imagen según el tamaño de pantalla
            if (isMobile && mobileUrl) {
                img.setAttribute('src', mobileUrl);
            } else if (desktopUrl) {
                img.setAttribute('src', desktopUrl);
            }
        });
    }

    findActiveSlide() {
        const activeSlide = this.slides.findIndex(slide =>
            slide.classList.contains('active')
        );
        return activeSlide !== -1 ? activeSlide : 0;
    }

    attachEventListeners() {
        // Navegación con botones
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Navegación con dots
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Soporte táctil
        this.wrapper.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.wrapper.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.wrapper.addEventListener('touchend', () => this.handleTouchEnd());

        // Soporte para arrastrar con mouse (desktop)
        this.wrapper.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.wrapper.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.wrapper.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.wrapper.addEventListener('mouseleave', (e) => this.handleMouseUp(e));

        // Prevenir comportamiento por defecto de arrastrar imágenes
        this.wrapper.addEventListener('dragstart', (e) => e.preventDefault());

        // Interceptar clics en enlaces para prevenir navegación si se arrastró
        this.wrapper.addEventListener('click', (e) => {
            if (this.hasDragged) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.hasDragged = false; // Reset el flag
                return false;
            }
        }, true); // Usar capture phase para interceptar antes

        // Pausar autoplay al pasar el mouse
        if (this.config.pauseOnHover) {
            this.wrapper.addEventListener('mouseenter', () => this.pauseAutoplay());
            this.wrapper.addEventListener('mouseleave', () => this.resumeAutoplay());
        }

        // Navegación por teclado
        if (this.config.keyboard) {
            document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        }

        // Pausar cuando la pestaña no está visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else {
                this.resumeAutoplay();
            }
        });

        // Cambiar imágenes cuando se redimensiona la ventana
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.switchResponsiveImages();
            }, 250);
        });
    }

    next() {
        this.direction = 'next';
        let nextIndex = this.currentIndex + 1;

        if (nextIndex >= this.slides.length) {
            nextIndex = this.config.loop ? 0 : this.currentIndex;
        }

        if (nextIndex !== this.currentIndex) {
            this.goToSlide(nextIndex);
        }
    }

    prev() {
        this.direction = 'prev';
        let prevIndex = this.currentIndex - 1;

        if (prevIndex < 0) {
            prevIndex = this.config.loop ? this.slides.length - 1 : this.currentIndex;
        }

        if (prevIndex !== this.currentIndex) {
            this.goToSlide(prevIndex);
        }
    }

    goToSlide(index, animate = true) {
        if (index === this.currentIndex) return;

        // Permitir interrumpir transición si se solicita un cambio rápido
        if (this.isTransitioning) {
            // Cancelar el timeout anterior
            if (this.transitionTimeout) {
                clearTimeout(this.transitionTimeout);
            }
        }

        this.isTransitioning = true;

        // Determinar dirección
        if (index > this.currentIndex) {
            this.direction = 'next';
        } else if (index < this.currentIndex) {
            this.direction = 'prev';
        }

        // Actualizar índice actual
        this.currentIndex = index;

        // Actualizar slides
        this.updateSlides(animate);

        // Reiniciar autoplay
        if (this.config.autoplay) {
            this.restartAutoplay();
        }

        // Desbloquear después de la transición
        this.transitionTimeout = setTimeout(() => {
            this.isTransitioning = false;
            this.transitionTimeout = null;
        }, this.config.transitionDuration);
    }

    updateSlides(animate = true) {
        // Calcular índices de prev y next con loop
        const prevIndex = this.currentIndex === 0 ? this.slides.length - 1 : this.currentIndex - 1;
        const nextIndex = this.currentIndex === this.slides.length - 1 ? 0 : this.currentIndex + 1;

        // Limpiar todas las clases y estilos inline de TODOS los slides
        this.slides.forEach((slide) => {
            slide.classList.remove('active', 'prev', 'next');
            slide.style.transform = '';
            slide.style.zIndex = '';
            slide.style.opacity = '';
            slide.style.transition = '';
            slide.style.visibility = '';
        });

        // Aplicar clases según posición
        this.slides.forEach((slide, index) => {
            if (index === this.currentIndex) {
                slide.classList.add('active');
            } else if (index === prevIndex) {
                slide.classList.add('prev');
            } else if (index === nextIndex) {
                slide.classList.add('next');
            }
        });

        // Actualizar dots si existen
        if (this.dots && this.dots.length > 0) {
            this.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
            });
        }
    }

    // ===== Autoplay =====
    startAutoplay() {
        if (!this.config.autoplay) return;

        // Limpiar cualquier intervalo existente antes de crear uno nuevo
        this.pauseAutoplay();

        this.autoplayTimer = setInterval(() => {
            this.next();
        }, this.config.autoplayDelay);
    }

    pauseAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }

    resumeAutoplay() {
        if (this.config.autoplay && !this.autoplayTimer) {
            this.startAutoplay();
        }
    }

    restartAutoplay() {
        this.pauseAutoplay();
        this.startAutoplay();
    }

    // ===== Soporte Táctil =====
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.isTouchScrolling = null; // Resetear estado

        // Pausar autoplay mientras se desliza
        this.pauseAutoplay();
    }

    handleTouchMove(e) {
        this.touchEndX = e.touches[0].clientX;
        this.touchEndY = e.touches[0].clientY;

        const isMobile = window.innerWidth <= 768;

        // Calcular el desplazamiento en ambos ejes
        const deltaX = Math.abs(this.touchEndX - this.touchStartX);
        const deltaY = Math.abs(this.touchEndY - this.touchStartY);

        // Determinar dirección en el primer movimiento significativo
        if (this.isTouchScrolling === null && (deltaX > 5 || deltaY > 5)) {
            if (isMobile) {
                // En móvil: si hay más movimiento vertical = slider (prevenir scroll)
                // Si hay más movimiento horizontal = scroll de página (permitir)
                this.isTouchScrolling = deltaX > deltaY; // true = permitir scroll, false = slider
            } else {
                // En desktop: si hay más movimiento horizontal = slider (prevenir scroll)
                // Si hay más movimiento vertical = scroll de página (permitir)
                this.isTouchScrolling = deltaY > deltaX; // true = permitir scroll, false = slider
            }
        }

        // Si es interacción con el slider, prevenir scroll de la página SIEMPRE
        if (this.isTouchScrolling === false) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Añadir animación visual durante el swipe solo si es slider
        if (this.isTouchScrolling === false) {
            const activeSlide = this.slides[this.currentIndex];

            if (activeSlide) {
                if (isMobile) {
                    // En móviles: desplazamiento vertical
                    const deltaY = this.touchEndY - this.touchStartY;
                    const maxMove = 100;
                    const movePercent = Math.max(-maxMove, Math.min(maxMove, deltaY));

                    activeSlide.style.transition = 'none';
                    activeSlide.style.transform = `translateY(${movePercent}px) scale(${1 - Math.abs(movePercent) / 1000})`;
                    activeSlide.style.opacity = 1 - Math.abs(movePercent) / 500;
                } else {
                    // En desktop: desplazamiento horizontal
                    const deltaX = this.touchEndX - this.touchStartX;
                    const maxMove = 100;
                    const movePercent = Math.max(-maxMove, Math.min(maxMove, deltaX));

                    activeSlide.style.transition = 'none';
                    activeSlide.style.transform = `translateX(${movePercent}px) scale(${1 - Math.abs(movePercent) / 1000})`;
                    activeSlide.style.opacity = 1 - Math.abs(movePercent) / 500;
                }
            }
        }
    }

    handleTouchEnd() {
        // Solo procesar si fue interacción con el slider (no scroll de página)
        if (this.isTouchScrolling === false) {
            // Restaurar el slide activo con transición suave
            const activeSlide = this.slides[this.currentIndex];
            if (activeSlide) {
                activeSlide.style.transition = 'all 0.2s ease';
                activeSlide.style.transform = '';
                activeSlide.style.opacity = '';
            }

            // Detectar si es móvil/tablet (≤768px)
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                // Usar eje Y en móviles y tablets
                const difference = this.touchStartY - this.touchEndY;

                if (Math.abs(difference) > this.config.swipeThreshold) {
                    if (difference > 0) {
                        // Swipe hacia arriba = siguiente
                        this.next();
                    } else {
                        // Swipe hacia abajo = anterior
                        this.prev();
                    }
                }
            } else {
                // Usar eje X en desktop
                const difference = this.touchStartX - this.touchEndX;

                if (Math.abs(difference) > this.config.swipeThreshold) {
                    if (difference > 0) {
                        this.next();
                    } else {
                        this.prev();
                    }
                }
            }
        }

        // Reiniciar autoplay después de deslizar
        this.startAutoplay();

        // Resetear estado
        this.isTouchScrolling = null;
    }

    // ===== Soporte para Mouse (Desktop) =====
    handleMouseDown(e) {
        // Solo activar si no se está haciendo clic en un botón o dot
        if (e.target.closest('.ho-slider-control') || e.target.closest('.ho-slider-dot')) {
            return;
        }

        this.isDragging = true;
        this.hasDragged = false;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.dragEndX = e.clientX;
        this.dragEndY = e.clientY;
        this.wrapper.style.cursor = 'grabbing';

        // Pausar autoplay mientras se arrastra
        this.pauseAutoplay();
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;

        this.dragEndX = e.clientX;
        this.dragEndY = e.clientY;

        // Marcar que se ha arrastrado si se movió más de 5px
        const dragDistanceX = Math.abs(this.dragStartX - this.dragEndX);
        const dragDistanceY = Math.abs(this.dragStartY - this.dragEndY);

        if (dragDistanceX > 5 || dragDistanceY > 5) {
            this.hasDragged = true;
            // Prevenir el comportamiento por defecto mientras se arrastra
            e.preventDefault();
        }

        // Calcular la distancia del arrastre
        const isMobile = window.innerWidth <= 768;
        const activeSlide = this.slides[this.currentIndex];

        if (activeSlide) {
            if (isMobile) {
                // En móviles: desplazamiento vertical
                const deltaY = this.dragEndY - this.dragStartY;
                const maxMove = 100;
                const movePercent = Math.max(-maxMove, Math.min(maxMove, deltaY));

                activeSlide.style.transition = 'none';
                activeSlide.style.transform = `translateY(${movePercent}px) scale(${1 - Math.abs(movePercent) / 1000})`;
                activeSlide.style.opacity = 1 - Math.abs(movePercent) / 500;
            } else {
                // En desktop: desplazamiento horizontal
                const deltaX = this.dragEndX - this.dragStartX;
                const maxMove = 100;
                const movePercent = Math.max(-maxMove, Math.min(maxMove, deltaX));

                activeSlide.style.transition = 'none';
                activeSlide.style.transform = `translateX(${movePercent}px) scale(${1 - Math.abs(movePercent) / 1000})`;
                activeSlide.style.opacity = 1 - Math.abs(movePercent) / 500;
            }
        }
    } handleMouseUp(e) {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.wrapper.style.cursor = '';

        const isMobile = window.innerWidth <= 768;
        const dragDistanceX = Math.abs(this.dragStartX - this.dragEndX);
        const dragDistanceY = Math.abs(this.dragStartY - this.dragEndY);
        const totalDistance = isMobile ? dragDistanceY : dragDistanceX;

        // Restaurar el slide activo con transición suave
        const activeSlide = this.slides[this.currentIndex];
        if (activeSlide) {
            activeSlide.style.transition = 'all 0.2s ease';
            activeSlide.style.transform = '';
            activeSlide.style.opacity = '';
        }

        // < 5px: Click normal (permite enlace)
        if (totalDistance < 5) {
            this.hasDragged = false;
            // Reiniciar autoplay incluso si no se arrastró
            this.startAutoplay();
            return;
        }

        // >= 5px: Previene enlace
        this.hasDragged = true;
        e.preventDefault();
        e.stopPropagation();

        // >= 20px: Cambia slide
        if (totalDistance >= 20) {
            if (isMobile) {
                // Usar eje Y en móviles
                const difference = this.dragStartY - this.dragEndY;
                if (difference > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            } else {
                // Usar eje X en desktop
                const difference = this.dragStartX - this.dragEndX;
                if (difference > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        }

        // Resetear posiciones después de un pequeño delay
        setTimeout(() => {
            this.dragStartX = 0;
            this.dragStartY = 0;
            this.dragEndX = 0;
            this.dragEndY = 0;
            // Resetear hasDragged después de que el evento click se haya procesado
            setTimeout(() => {
                this.hasDragged = false;
            }, 50);
        }, 10);

        // Reiniciar autoplay después de arrastrar
        this.startAutoplay();
    }

    // ===== Navegación por Teclado =====
    handleKeyboard(e) {
        // Solo responder si el slider está en el viewport
        if (!this.isInViewport()) return;

        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // En móviles y tablets: usar flechas arriba/abajo
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.prev();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.next();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.slides.length - 1);
                    break;
            }
        } else {
            // En desktop: usar flechas izquierda/derecha
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prev();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.next();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.slides.length - 1);
                    break;
            }
        }
    }

    isInViewport() {
        const rect = this.container.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // ===== Métodos Públicos =====
    destroy() {
        this.pauseAutoplay();
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    getTotalSlides() {
        return this.slides.length;
    }
}

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const sliderElement = document.querySelector('#ho-slider');

    if (sliderElement) {
        // Configuración desde variables PHP si existen
        const config = {
            autoplay: typeof hoSliderAutoplay !== 'undefined' ? hoSliderAutoplay : true,
            autoplayDelay: typeof hoSliderSpeed !== 'undefined' ? hoSliderSpeed : 5000,
            loop: true,
            pauseOnHover: typeof hoSliderPauseOnHover !== 'undefined' ? hoSliderPauseOnHover : true,
            keyboard: true,
            swipeThreshold: 50
        };

        // Crear instancia del slider
        const slider = new HoSlider(sliderElement, config);

        // Hacer disponible globalmente
        window.hoSlider = slider;
    }
});
