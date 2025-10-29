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

<div id="ho-slider" class="ho-slider-container">
    <div class="ho-slider-wrapper">
        <div class="ho-slider-slides">
            {foreach $slides as $index => $slide}
                <div class="ho-slide {if $index == 0}active{/if}" data-slide="{$index|intval}">
                    {if $slide.url}
                        <a href="{$slide.url|escape:'html':'UTF-8'}" class="ho-slide-link">
                        {/if}

                        {* Imagen con cambio dinámico via JavaScript *}
                        <picture class="ho-slide-picture">
                            <img src="{$image_baseurl|escape:'html':'UTF-8'}{$slide.image|escape:'html':'UTF-8'}"
                                data-desktop="{$image_baseurl|escape:'html':'UTF-8'}{$slide.image|escape:'html':'UTF-8'}"
                                {if isset($slide.image_mobile) && $slide.image_mobile && $slide.image_mobile != ''}data-mobile="{$image_baseurl|escape:'html':'UTF-8'}{$slide.image_mobile|escape:'html':'UTF-8'}"
                                {/if}
                                alt="{if $slide.legend}{$slide.legend|escape:'html':'UTF-8'}{else}{$slide.title|escape:'html':'UTF-8'}{/if}"
                                class="ho-slide-image" loading="lazy">
                        </picture>

                        {if $slide.title || $slide.description}
                            <div class="ho-slide-caption">
                                <div class="container">
                                    {if $slide.title}
                                        <h2 class="ho-slide-title">{$slide.title|escape:'html':'UTF-8'}</h2>
                                    {/if}
                                    {if $slide.description}
                                        <div class="ho-slide-description">{$slide.description nofilter}</div>
                                    {/if}
                                </div>
                            </div>
                        {/if}
                        {if $slide.url}
                        </a>
                    {/if}
                </div>
            {/foreach}
        </div>

        {if $slides|@count > 1}
            <!-- Controles de navegación -->
            <button class="ho-slider-control ho-slider-prev" aria-label="{l s='Anterior' mod='ho_slider'}">
                <span class="icon-chevron-left"></span>
            </button>
            <button class="ho-slider-control ho-slider-next" aria-label="{l s='Siguiente' mod='ho_slider'}">
                <span class="icon-chevron-right"></span>
            </button>

            <!-- Indicadores de puntos -->
            <div class="ho-slider-dots">
                {foreach $slides as $index => $slide}
                    <button class="ho-slider-dot {if $index == 0}active{/if}" data-slide="{$index|intval}"
                        aria-label="{l s='Ir al slide' mod='ho_slider'} {$index + 1|intval}">
                    </button>
                {/foreach}
            </div>
        {/if}
    </div>
</div>