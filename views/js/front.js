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

document.addEventListener('DOMContentLoaded', function () {
    const slider = document.getElementById('ho-slider');

    if (!slider) return;

    const slides = slider.querySelectorAll('.ho-slide');
    const dots = slider.querySelectorAll('.ho-slider-dot');
    const prevBtn = slider.querySelector('.ho-slider-prev');
    const nextBtn = slider.querySelector('.ho-slider-next');

    if (slides.length <= 1) return; // No necesitamos slider si solo hay 1 slide

    let currentSlide = 0;
    let autoplayInterval = null;
    let isPaused = false;

    // Configuración desde PHP
    const speed = typeof hoSliderSpeed !== 'undefined' ? hoSliderSpeed : 5000;
    const autoplay = typeof hoSliderAutoplay !== 'undefined' ? hoSliderAutoplay : true;
    const pauseOnHover = typeof hoSliderPauseOnHover !== 'undefined' ? hoSliderPauseOnHover : true;

    /**
     * Ir a un slide específico
     */
    function goToSlide(index) {
        // Remover clase active de todos
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        dots.forEach(dot => {
            dot.classList.remove('active');
        });

        // Añadir clase active al slide actual
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    /**
     * Ir al siguiente slide
     */
    function nextSlide() {
        let next = currentSlide + 1;
        if (next >= slides.length) {
            next = 0;
        }
        goToSlide(next);
    }

    /**
     * Ir al slide anterior
     */
    function prevSlide() {
        let prev = currentSlide - 1;
        if (prev < 0) {
            prev = slides.length - 1;
        }
        goToSlide(prev);
    }

    /**
     * Iniciar autoplay
     */
    function startAutoplay() {
        if (autoplay && !isPaused) {
            stopAutoplay(); // Limpiar cualquier intervalo existente
            autoplayInterval = setInterval(nextSlide, speed);
        }
    }

    /**
     * Detener autoplay
     */
    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    /**
     * Pausar autoplay
     */
    function pauseAutoplay() {
        isPaused = true;
        stopAutoplay();
    }

    /**
     * Reanudar autoplay
     */
    function resumeAutoplay() {
        isPaused = false;
        startAutoplay();
    }

    // Event listeners para botones
    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            prevSlide();
            stopAutoplay();
            setTimeout(startAutoplay, speed * 2); // Reiniciar después de 2 ciclos
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            nextSlide();
            stopAutoplay();
            setTimeout(startAutoplay, speed * 2); // Reiniciar después de 2 ciclos
        });
    }

    // Event listeners para dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function () {
            goToSlide(index);
            stopAutoplay();
            setTimeout(startAutoplay, speed * 2); // Reiniciar después de 2 ciclos
        });
    });

    // Pausar en hover
    if (pauseOnHover) {
        slider.addEventListener('mouseenter', pauseAutoplay);
        slider.addEventListener('mouseleave', resumeAutoplay);
    }

    // Soporte para touch/swipe en móviles
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    slider.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 50; // Mínimo de píxeles para considerar un swipe

        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe izquierda - siguiente slide
            nextSlide();
            stopAutoplay();
            setTimeout(startAutoplay, speed * 2);
        }

        if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe derecha - slide anterior
            prevSlide();
            stopAutoplay();
            setTimeout(startAutoplay, speed * 2);
        }
    }

    // Soporte para teclado (accesibilidad)
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            stopAutoplay();
            setTimeout(startAutoplay, speed * 2);
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            stopAutoplay();
            setTimeout(startAutoplay, speed * 2);
        }
    });

    // Pausar cuando la página no es visible (optimización)
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            pauseAutoplay();
        } else {
            resumeAutoplay();
        }
    });

    // Iniciar autoplay
    startAutoplay();
});
