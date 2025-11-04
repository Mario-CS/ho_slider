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
*/

/**
 * Modern Minimal Slider
 * Clean and elegant implementation
 */

(function () {
    'use strict';

    function initMinimalSlider() {
        if (typeof Swiper === 'undefined') {
            console.warn('Swiper not loaded, retrying...');
            setTimeout(initMinimalSlider, 100);
            return;
        }

        const swiperContainer = document.querySelector('.minimal-slider .swiper');
        if (!swiperContainer) {
            return;
        }

        const swiper = new Swiper('.minimal-slider .swiper', {
            effect: 'slide',
            speed: 800,
            slidesPerView: 1,
            spaceBetween: 20,
            centeredSlides: true,
            loop: true,
            watchSlidesProgress: true,

            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: false,
            },

            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },

            breakpoints: {
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
                1280: {
                    slidesPerView: 3,
                    spaceBetween: 35,
                },
                1400: {
                    slidesPerView: 3,
                    spaceBetween: 40,
                },
            },

            on: {
                init: function () {
                    console.log('✨ Minimal Slider initialized');
                }
            }
        });

        // Expandir slide al hacer clic (solo en pantallas grandes >= 1024px)
        const slides = swiperContainer.querySelectorAll('.swiper-slide');
        slides.forEach(slide => {
            const link = slide.querySelector('a');

            if (link) {
                link.addEventListener('click', function (e) {
                    // En dispositivos pequeños, permitir navegación directa
                    if (window.innerWidth < 1024) {
                        return; // Permitir que el enlace funcione normalmente
                    }

                    // Si la slide ya está expandida, permitir navegación
                    if (slide.classList.contains('expanded')) {
                        return; // Permitir que el enlace funcione
                    }

                    // Primer clic: prevenir navegación y expandir (solo en desktop)
                    e.preventDefault();
                    e.stopPropagation();

                    // Quitar clase expanded de todas las slides
                    slides.forEach(s => s.classList.remove('expanded'));

                    // Añadir clase expanded a la slide clickeada
                    slide.classList.add('expanded');
                });
            }

            // Quitar expansión al hacer clic fuera (solo desktop)
            document.addEventListener('click', function (e) {
                if (window.innerWidth >= 1024 && !slide.contains(e.target)) {
                    slide.classList.remove('expanded');
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMinimalSlider);
    } else {
        initMinimalSlider();
    }

})();
