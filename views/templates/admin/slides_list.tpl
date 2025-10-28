{*
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
*}

<div class="panel">
    <div class="panel-heading" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <i class="icon-list"></i> {l s='Lista de diapositivas' mod='ho_slider'}
        </div>
        <a href="{$current_index|escape:'html':'UTF-8'}&addSlide=1&token={$token|escape:'html':'UTF-8'}"
            class="btn btn-default pull-right">
            <i class="icon-plus"></i> {l s='Añadir diapositiva' mod='ho_slider'}
        </a>
    </div>

    <div class="panel-body"
        data-module-url="{$current_index|escape:'html':'UTF-8'}&configure=ho_slider&token={$token|escape:'html':'UTF-8'}">
        {if $slides|@count > 0}
            {foreach $slides as $slide}
                <div class="ho-slide-card" data-slide-id="{$slide.id_slide|intval}" draggable="true"
                    style="display: flex; align-items: center; padding: 20px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px; background: #fff; user-select: none;">
                    <!-- Icono de arrastre -->
                    <div class="drag-handle" style="margin-right: 20px; cursor: move; color: #ccc;">
                        <i class="icon-move" style="font-size: 24px;"></i>
                    </div>

                    <!-- Imagen del slide -->
                    <div style="margin-right: 20px;">
                        {if $slide.image}
                            <img src="{$image_baseurl|escape:'html':'UTF-8'}{$slide.image|escape:'html':'UTF-8'}"
                                alt="{$slide.title|escape:'html':'UTF-8'}"
                                style="max-width: 260px; height: auto; border-radius: 4px; border: 1px solid #eee;">
                        {else}
                            <div
                                style="width: 260px; height: 150px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid #eee;">
                                <span class="text-muted">{l s='Sin imagen' mod='ho_slider'}</span>
                            </div>
                        {/if}
                    </div>

                    <!-- Información del slide -->
                    <div style="flex: 1; min-width: 220px;">
                        <h4 style="margin: 0 0 5px 0; font-weight: 600;">
                            #{$slide.id_slide|escape:'html':'UTF-8'} - {$slide.title|escape:'html':'UTF-8'}
                        </h4>
                        {if $slide.description}
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 13px;">{$slide.description|escape:'html':'UTF-8'}
                            </p>
                        {/if}
                        {if $slide.url}
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                <i class="icon-link"></i> {$slide.url|escape:'html':'UTF-8'}
                            </p>
                        {/if}
                    </div>

                    <!-- Botones de acción -->
                    <div style="display: flex; gap: 10px; margin-left: 20px;">
                        {if $slide.active}
                            <a href="{$current_index|escape:'html':'UTF-8'}&statusSlide=1&id_slide={$slide.id_slide|intval}&token={$token|escape:'html':'UTF-8'}"
                                class="btn btn-success" title="{l s='Activado' mod='ho_slider'}">
                                <i class="icon-check"></i> {l s='Activado' mod='ho_slider'}
                            </a>
                        {else}
                            <a href="{$current_index|escape:'html':'UTF-8'}&statusSlide=1&id_slide={$slide.id_slide|intval}&token={$token|escape:'html':'UTF-8'}"
                                class="btn btn-danger" title="{l s='Desactivado' mod='ho_slider'}">
                                <i class="icon-remove"></i> {l s='Desactivado' mod='ho_slider'}
                            </a>
                        {/if}

                        <a href="{$current_index|escape:'html':'UTF-8'}&updateSlide=1&id_slide={$slide.id_slide|intval}&token={$token|escape:'html':'UTF-8'}"
                            class="btn btn-default" title="{l s='Modificar' mod='ho_slider'}">
                            <i class="icon-edit"></i> {l s='Modificar' mod='ho_slider'}
                        </a>

                        <a href="{$current_index|escape:'html':'UTF-8'}&duplicateSlide=1&id_slide={$slide.id_slide|intval}&token={$token|escape:'html':'UTF-8'}"
                            class="btn btn-default" title="{l s='Duplicar' mod='ho_slider'}">
                            <i class="icon-copy"></i> {l s='Duplicar' mod='ho_slider'}
                        </a>

                        <a href="{$current_index|escape:'html':'UTF-8'}&deleteSlide=1&id_slide={$slide.id_slide|intval}&token={$token|escape:'html':'UTF-8'}"
                            class="btn btn-default" title="{l s='Eliminar' mod='ho_slider'}"
                            onclick="return confirm('{l s='¿Está seguro de que desea eliminar este slide?' mod='ho_slider' js=1}');">
                            <i class="icon-trash"></i> {l s='Eliminar' mod='ho_slider'}
                        </a>
                    </div>
                </div>
            {/foreach}
        {else}
            <div class="alert alert-info">
                <i class="icon-info-circle"></i>
                {l s='No hay slides creados. Añade tu primer slide usando el botón de arriba.' mod='ho_slider'}
            </div>
        {/if}
    </div>
</div>