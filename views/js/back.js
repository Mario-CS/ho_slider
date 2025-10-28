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
    initSlideDragAndDrop();
    initSliderPreview();
    console.log('HO Slider: Sistema de drag & drop y vista previa inicializados');
});

function initSlideDragAndDrop() {
    const slides = document.querySelectorAll('.ho-slide-card');

    if (slides.length === 0) {
        console.log('HO Slider: No hay slides para ordenar');
        return;
    }

    slides.forEach(slide => {
        // Hacer la tarjeta draggable
        slide.setAttribute('draggable', 'true');

        // Eventos de arrastre
        slide.addEventListener('dragstart', handleDragStart);
        slide.addEventListener('dragend', handleDragEnd);
        slide.addEventListener('dragover', handleDragOver);
        slide.addEventListener('dragenter', handleDragEnter);
        slide.addEventListener('drop', handleDrop);
        slide.addEventListener('dragleave', handleDragLeave);
    });

    console.log(`HO Slider: ${slides.length} slides configurados para drag & drop`);
}

let draggedElement = null;
let sourceIndex = null;

function handleDragStart(e) {
    draggedElement = this;
    sourceIndex = getElementIndex(this);

    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);

    console.log('Drag iniciado desde posición:', sourceIndex + 1);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');

    // Remover todas las clases drag-over
    document.querySelectorAll('.ho-slide-card').forEach(slide => {
        slide.classList.remove('drag-over');
    });

    const newIndex = getElementIndex(draggedElement);

    // Solo actualizar si cambió la posición
    if (sourceIndex !== newIndex) {
        console.log('Posición cambiada de', sourceIndex + 1, 'a', newIndex + 1);
        updateSlidePositions();
    } else {
        console.log('Posición sin cambios');
    }

    draggedElement = null;
    sourceIndex = null;
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';

    return false;
}

function handleDragEnter(e) {
    // Solo aplicar estilos si es un elemento diferente
    if (this !== draggedElement && draggedElement) {
        this.classList.add('drag-over');

        // Intercambiar posiciones en el DOM
        const parent = this.parentNode;
        const allSlides = Array.from(parent.querySelectorAll('.ho-slide-card'));
        const draggedIndex = allSlides.indexOf(draggedElement);
        const targetIndex = allSlides.indexOf(this);

        if (draggedIndex !== targetIndex && draggedIndex !== -1) {
            if (draggedIndex < targetIndex) {
                parent.insertBefore(draggedElement, this.nextSibling);
            } else {
                parent.insertBefore(draggedElement, this);
            }
        }
    }
}

function handleDragLeave(e) {
    // Solo quitar el estilo si realmente salimos del elemento
    if (e.target === this) {
        this.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    this.classList.remove('drag-over');

    return false;
}

function getElementIndex(element) {
    const parent = element.parentNode;
    const slides = Array.from(parent.querySelectorAll('.ho-slide-card'));
    return slides.indexOf(element);
}

function updateSlidePositions() {
    const slides = document.querySelectorAll('.ho-slide-card');
    const positions = [];

    slides.forEach((slide, index) => {
        const slideId = slide.getAttribute('data-slide-id');
        positions.push({
            id: slideId,
            position: index + 1
        });
    });

    console.log('Actualizando posiciones:', positions);

    // Enviar al servidor
    const formData = new FormData();
    formData.append('action', 'updatePositions');
    formData.append('positions', JSON.stringify(positions));

    // Obtener URL del módulo desde la página
    const moduleUrl = document.querySelector('[data-module-url]');
    if (!moduleUrl) {
        console.error('HO Slider: No se encontró data-module-url');
        alert('Error: No se pudo encontrar la URL del módulo');
        return;
    }

    const ajaxUrl = moduleUrl.getAttribute('data-module-url') + '&ajax=1';
    console.log('Enviando petición AJAX a:', ajaxUrl);

    // Mostrar indicador de carga
    showLoadingIndicator();

    fetch(ajaxUrl, {
        method: 'POST',
        body: formData
    })
        .then(response => {
            console.log('Respuesta recibida:', response.status);
            return response.json();
        })
        .then(data => {
            hideLoadingIndicator();
            console.log('Datos recibidos:', data);

            if (data.success) {
                console.log('✓ Posiciones actualizadas correctamente');
                showSuccessMessage();
            } else {
                console.error('✗ Error al actualizar posiciones:', data.message);
                alert('Error al actualizar el orden de los slides: ' + (data.message || 'Error desconocido'));
            }
        })
        .catch(error => {
            hideLoadingIndicator();
            console.error('✗ Error de red:', error);
            alert('Error de conexión al actualizar el orden. Por favor, recargue la página.');
        });
}

function showLoadingIndicator() {
    // Crear indicador si no existe
    let indicator = document.getElementById('ho-slider-loading');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'ho-slider-loading';
        indicator.className = 'ho-slider-loading-indicator';
        indicator.innerHTML = '<i class="icon-refresh icon-spin"></i> Actualizando orden...';
        document.body.appendChild(indicator);
    }
    indicator.style.display = 'block';
}

function hideLoadingIndicator() {
    const indicator = document.getElementById('ho-slider-loading');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

function showSuccessMessage() {
    // Crear mensaje de éxito temporal
    const message = document.createElement('div');
    message.className = 'ho-slider-success-message';
    message.innerHTML = '<i class="icon-check"></i> Orden actualizado correctamente';
    document.body.appendChild(message);

    // Eliminar después de 3 segundos
    setTimeout(() => {
        message.classList.add('slide-out');
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// ============================================
// VISTA PREVIA DEL SLIDER
// ============================================

function initSliderPreview() {
    const previewButtons = document.querySelectorAll('.ho-preview-btn');

    console.log('HO Slider Preview: Buscando botones...', previewButtons.length);

    if (previewButtons.length === 0) {
        console.log('HO Slider Preview: No se encontraron botones de vista previa');
        return;
    }

    previewButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const slideId = this.getAttribute('data-slide-id');
            console.log('HO Slider Preview: Click en botón, slide ID:', slideId);
            showSliderPreview(slideId);
        });
    });

    console.log(`HO Slider: ${previewButtons.length} botones de vista previa inicializados`);
}

function showSliderPreview(slideId) {
    console.log('HO Slider Preview: Iniciando vista previa para slide', slideId);

    const modal = document.getElementById('hoSliderPreviewModal');
    const previewContent = document.getElementById('hoSliderPreviewContent');

    if (!modal) {
        console.error('HO Slider Preview: No se encontró el modal con ID hoSliderPreviewModal');
        return;
    }

    if (!previewContent) {
        console.error('HO Slider Preview: No se encontró el contenedor con ID hoSliderPreviewContent');
        return;
    }

    console.log('HO Slider Preview: Modal y contenedor encontrados');

    // Mostrar loading
    previewContent.innerHTML = '<div class="ho-preview-loading"><i class="icon-spinner icon-spin"></i> Cargando vista previa...</div>';

    // Mostrar el modal (compatible con Bootstrap 3 de PrestaShop)
    if (typeof $ !== 'undefined' && $.fn.modal) {
        console.log('HO Slider Preview: Usando jQuery modal');
        $(modal).modal('show');
    } else {
        console.log('HO Slider Preview: Usando modal nativo');
        modal.style.display = 'block';
        modal.classList.add('in');
    }

    // Obtener la URL del módulo desde el atributo data
    const panelBody = document.querySelector('.panel-body');
    if (!panelBody) {
        console.error('HO Slider Preview: No se encontró .panel-body');
        return;
    }

    const moduleUrl = panelBody.getAttribute('data-module-url');
    console.log('HO Slider Preview: URL del módulo:', moduleUrl);

    const ajaxUrl = moduleUrl + '&ajax=1&action=getSliderPreview&id_slide=' + slideId;
    console.log('HO Slider Preview: Llamando a:', ajaxUrl);

    // Hacer petición AJAX
    fetch(ajaxUrl)
        .then(response => {
            console.log('HO Slider Preview: Respuesta recibida', response.status);
            return response.text();
        })
        .then(html => {
            console.log('HO Slider Preview: HTML recibido, longitud:', html.length);
            previewContent.innerHTML = html;

            // Inicializar el slider después de cargar el HTML
            setTimeout(() => {
                initPreviewSlider();
            }, 100);
        })
        .catch(error => {
            console.error('HO Slider Preview: Error al cargar vista previa:', error);
            previewContent.innerHTML = '<div class="alert alert-danger ho-preview-alert-danger"><i class="icon-warning"></i> Error al cargar la vista previa.</div>';
        });
}

function initPreviewSlider() {
    // Reutilizar el código del slider del frontend
    const slider = document.querySelector('#hoSliderPreviewContent .ho-slider-wrapper');

    if (!slider) {
        console.log('No se encontró slider en la vista previa');
        return;
    }

    const slides = slider.querySelectorAll('.ho-slide');
    const prevBtn = slider.querySelector('.ho-slider-prev');
    const nextBtn = slider.querySelector('.ho-slider-next');
    const dots = slider.querySelectorAll('.ho-slider-dot');

    let currentSlide = 0;
    let autoplayInterval = null;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }

        currentSlide = index;
    }

    function nextSlide() {
        let next = currentSlide + 1;
        if (next >= slides.length) {
            next = 0;
        }
        showSlide(next);
    }

    function prevSlide() {
        let prev = currentSlide - 1;
        if (prev < 0) {
            prev = slides.length - 1;
        }
        showSlide(prev);
    }

    // Eventos de navegación
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    // Eventos de los dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    // Autoplay
    autoplayInterval = setInterval(nextSlide, 5000);

    // Pausar en hover
    slider.addEventListener('mouseenter', () => {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    });

    slider.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(nextSlide, 5000);
    });

    // Soporte táctil (swipe)
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            nextSlide();
        }
        if (touchEndX > touchStartX + 50) {
            prevSlide();
        }
    }

    // Teclado
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'block' || modal.classList.contains('in')) {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'Escape') closeModal();
        }
    });

    console.log('Vista previa del slider inicializada con', slides.length, 'slides');
}

function closeModal() {
    const modal = document.getElementById('hoSliderPreviewModal');
    if (typeof $ !== 'undefined' && $.fn.modal) {
        $(modal).modal('hide');
    } else {
        modal.style.display = 'none';
        modal.classList.remove('in');
    }
}

