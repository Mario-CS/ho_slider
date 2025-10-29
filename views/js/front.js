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
            transitionDuration: 1000,
            pauseOnHover: true,
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
        this.direction = 'next';

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

        // Navegación haciendo clic en las slides laterales
        this.slides.forEach((slide) => {
            slide.addEventListener('click', (e) => {
                if (slide.classList.contains('prev')) {
                    e.stopPropagation();
                    this.prev();
                } else if (slide.classList.contains('next')) {
                    e.stopPropagation();
                    this.next();
                }
            });
        });

        // Soporte táctil
        this.wrapper.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.wrapper.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        this.wrapper.addEventListener('touchend', () => this.handleTouchEnd());

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
        if (this.isTransitioning) return;

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
        if (this.isTransitioning) return;

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
        if (this.isTransitioning || index === this.currentIndex) return;

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
        setTimeout(() => {
            this.isTransitioning = false;
        }, this.config.transitionDuration);
    }

    updateSlides(animate = true) {
        // Calcular índices de prev y next con loop
        const prevIndex = this.currentIndex === 0 ? this.slides.length - 1 : this.currentIndex - 1;
        const nextIndex = this.currentIndex === this.slides.length - 1 ? 0 : this.currentIndex + 1;

        // Limpiar todas las clases y estilos inline
        this.slides.forEach((slide) => {
            slide.classList.remove('active', 'prev', 'next');
            slide.style.transform = '';
            slide.style.zIndex = '';
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
    }

    handleTouchMove(e) {
        this.touchEndX = e.touches[0].clientX;
        this.touchEndY = e.touches[0].clientY;
    }

    handleTouchEnd() {
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
