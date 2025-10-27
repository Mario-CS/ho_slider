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
});

function initSlideDragAndDrop() {
    const slides = document.querySelectorAll('.ho-slide-card');

    slides.forEach(slide => {
        // Hacer la tarjeta draggable
        slide.setAttribute('draggable', 'true');

        // Eventos de arrastre
        slide.addEventListener('dragstart', handleDragStart);
        slide.addEventListener('dragend', handleDragEnd);
        slide.addEventListener('dragover', handleDragOver);
        slide.addEventListener('drop', handleDrop);
        slide.addEventListener('dragleave', handleDragLeave);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');

    // Remover todas las clases drag-over
    document.querySelectorAll('.ho-slide-card').forEach(slide => {
        slide.classList.remove('drag-over');
    });

    // Actualizar posiciones en el servidor al terminar
    updateSlidePositions();

    draggedElement = null;
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';

    // Intercambiar posiciones inmediatamente al pasar sobre otro elemento
    if (this !== draggedElement) {
        const parent = this.parentNode;
        const allSlides = Array.from(parent.querySelectorAll('.ho-slide-card'));
        const draggedIndex = allSlides.indexOf(draggedElement);
        const targetIndex = allSlides.indexOf(this);

        if (draggedIndex !== targetIndex) {
            if (draggedIndex < targetIndex) {
                parent.insertBefore(draggedElement, this.nextSibling);
            } else {
                parent.insertBefore(draggedElement, this);
            }
        }
    }

    return false;
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    return false;
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

    // Enviar al servidor
    const formData = new FormData();
    formData.append('action', 'updatePositions');
    formData.append('positions', JSON.stringify(positions));

    // Obtener URL del módulo desde la página
    const moduleUrl = document.querySelector('[data-module-url]');
    if (moduleUrl) {
        const ajaxUrl = moduleUrl.getAttribute('data-module-url') + '&ajax=1';

        fetch(ajaxUrl, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Posiciones actualizadas correctamente');
                } else {
                    console.error('Error al actualizar posiciones:', data.message);
                    alert('Error al actualizar el orden de los slides');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error de conexión al actualizar el orden');
            });
    }
}
