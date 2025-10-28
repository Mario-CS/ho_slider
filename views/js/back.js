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
    console.log('HO Slider: Sistema de drag & drop inicializado');
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


