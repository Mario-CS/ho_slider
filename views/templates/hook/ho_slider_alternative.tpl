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

{* Modern Minimal Slider *}
<section class="minimal-slider">
    <div class="swiper">
        <div class="swiper-wrapper">
            {foreach $slides as $slide}
                <div class="swiper-slide">
                    <article class="slide-card">
                        {if $slide.url}
                            <a href="{$slide.url|escape:'html':'UTF-8'}" class="slide-link-wrapper">
                            {/if}

                            <div class="slide-image">
                                <img src="{$image_baseurl|escape:'html':'UTF-8'}{$slide.image|escape:'html':'UTF-8'}"
                                    alt="{if isset($slide.title)}{$slide.title|escape:'html':'UTF-8'}{else}{l s='Slide' mod='ho_slider'}{/if}"
                                    loading="lazy">

                                {if isset($slide.badge) && $slide.badge}
                                    <span class="slide-badge">{$slide.badge|escape:'html':'UTF-8'}</span>
                                {/if}
                            </div>

                            <div class="slide-content">
                                {if isset($slide.title) && $slide.title}
                                    <h2 class="slide-title">{$slide.title|escape:'html':'UTF-8'}</h2>
                                {/if}

                                {if isset($slide.description) && $slide.description}
                                    <p class="slide-description">{$slide.description|escape:'html':'UTF-8'}</p>
                                {/if}
                            </div>

                            {if $slide.url}
                            </a>
                        {/if}
                    </article>
                </div>
            {/foreach}
        </div>

        {if $slides|@count > 1}
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-pagination"></div>
        {/if}
    </div>
</section>

{* Swiper CSS & JS *}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>