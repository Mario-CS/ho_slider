<?php
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

if (!defined('_PS_VERSION_')) {
    exit;
}

require_once dirname(__FILE__) . '/classes/HoSlide.php';

class Ho_slider extends Module
{
    protected $config_form = false;

    public function __construct()
    {
        $this->name = 'ho_slider';
        $this->tab = 'administration';
        $this->version = '1.0.0';
        $this->author = 'Mario';
        $this->need_instance = 0;

        /**
         * Set $this->bootstrap to true if your module is compliant with bootstrap (PrestaShop 1.6)
         */
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('Slider home');
        $this->description = $this->l('Mi modulo de sliders para la home');

        $this->ps_versions_compliancy = array('min' => '8.0', 'max' => '9.0');
    }

    /**
     * Don't forget to create update methods if needed:
     * http://doc.prestashop.com/display/PS16/Enabling+the+Auto-Update
     */
    public function install()
    {
        // Crear directorio para imágenes en img/ho_slider/
        if (!file_exists(_PS_ROOT_DIR_ . '/img/ho_slider/')) {
            mkdir(_PS_ROOT_DIR_ . '/img/ho_slider/', 0755, true);
        }

        include(dirname(__FILE__) . '/sql/install.php');

        Configuration::updateValue('HO_SLIDER_SPEED', 5000);
        Configuration::updateValue('HO_SLIDER_AUTOPLAY', true);
        Configuration::updateValue('HO_SLIDER_PAUSE_ON_HOVER', true);

        return parent::install() &&
            $this->registerHook('header') &&
            $this->registerHook('displayBackOfficeHeader') &&
            $this->registerHook('displayHome');
    }

    public function uninstall()
    {
        include(dirname(__FILE__) . '/sql/uninstall.php');

        Configuration::deleteByName('HO_SLIDER_SPEED');
        Configuration::deleteByName('HO_SLIDER_AUTOPLAY');
        Configuration::deleteByName('HO_SLIDER_PAUSE_ON_HOVER');

        // Limpiar directorio de imágenes
        $upload_dir = _PS_ROOT_DIR_ . '/img/ho_slider/';
        if (is_dir($upload_dir)) {
            $files = glob($upload_dir . '*');
            foreach ($files as $file) {
                if (is_file($file)) {
                    @unlink($file);
                }
            }
            @rmdir($upload_dir);
        }

        return parent::uninstall();
    }

    /**
     * Load the configuration form
     */
    public function getContent()
    {
        $output = '';

        // Manejar peticiones AJAX
        if (Tools::getValue('ajax')) {
            $this->processAjax();
            exit;
        }

        // Procesar acciones
        if (Tools::isSubmit('submitSlide')) {
            $output .= $this->postProcessSlide();
            // No retornar aquí, continuar para mostrar la lista o el formulario
        } elseif (Tools::isSubmit('deleteSlide')) {
            $output .= $this->deleteSlide();
            // La función deleteSlide hace redirect, no llegará aquí
        } elseif (Tools::isSubmit('statusSlide')) {
            $output .= $this->toggleStatus();
            // La función toggleStatus hace redirect, no llegará aquí
        } elseif (Tools::isSubmit('submitSettings')) {
            $output .= $this->postProcessSettings();
        }

        // Si se solicita añadir o editar, mostrar solo el formulario
        if (Tools::isSubmit('addSlide') || Tools::isSubmit('updateSlide') || Tools::getValue('id_slide')) {
            $output .= $this->renderAddSlideForm();
            return $output;
        }

        // Vista principal: mostrar lista de slides y configuración
        $output .= $this->renderSlidesList();
        $output .= $this->renderSettingsForm();

        return $output;
    }

    /**
     * Procesar peticiones AJAX
     */
    protected function processAjax()
    {
        header('Content-Type: application/json');
        
        $action = Tools::getValue('action');
        
        if ($action === 'updatePositions') {
            $positions = json_decode(Tools::getValue('positions'), true);
            
            if (empty($positions)) {
                echo json_encode(['success' => false, 'message' => 'No positions provided']);
                return;
            }
            
            $success = true;
            foreach ($positions as $item) {
                $idSlide = (int)$item['id'];
                $position = (int)$item['position'];
                
                $result = Db::getInstance()->update(
                    'ho_slider',
                    array('position' => $position),
                    'id_slide = ' . $idSlide
                );
                
                if (!$result) {
                    $success = false;
                }
            }
            
            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Positions updated' : 'Error updating positions'
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Unknown action']);
        }
    }

    /**
     * Renderizar lista de slides
     */
    protected function renderSlidesList()
    {
        $slides = HoSlide::getSlides(
            $this->context->language->id,
            $this->context->shop->id,
            false // Mostrar todos, activos e inactivos
        );

        $currentIndex = AdminController::$currentIndex . '&configure=' . $this->name;
        $token = Tools::getAdminTokenLite('AdminModules');

        $this->context->smarty->assign(array(
            'slides' => $slides,
            'module_dir' => $this->_path,
            'image_baseurl' => $this->context->link->getBaseLink() . 'img/ho_slider/',
            'current_index' => $currentIndex,
            'token' => $token
        ));

        return $this->display(__FILE__, 'views/templates/admin/slides_list.tpl');
    }

    /**
     * Renderizar formulario para añadir/editar slide
     */
    protected function renderAddSlideForm()
    {
        $idSlide = (int)Tools::getValue('id_slide');
        $slide = null;

        if ($idSlide) {
            $slide = new HoSlide($idSlide);
            if (!Validate::isLoadedObject($slide)) {
                return '';
            }
        } else {
            $slide = new HoSlide();
        }

        $fields_form = array(
            'form' => array(
                'legend' => array(
                    'title' => $idSlide ? $this->l('Editar Slide') : $this->l('Añadir Slide'),
                    'icon' => 'icon-picture',
                    'id' => 'add_slide_form'
                ),
                'input' => array(
                    array(
                        'type' => 'text',
                        'label' => $this->l('Título'),
                        'name' => 'title',
                        'lang' => true,
                        'required' => true,
                        'col' => 6,
                        'hint' => $this->l('Título principal del slide')
                    ),
                    array(
                        'type' => 'textarea',
                        'label' => $this->l('Descripción'),
                        'name' => 'description',
                        'lang' => true,
                        'autoload_rte' => true,
                        'col' => 6,
                        'hint' => $this->l('Texto descriptivo del slide con formato enriquecido (opcional)')
                    ),
                    array(
                        'type' => 'text',
                        'label' => $this->l('URL'),
                        'name' => 'url',
                        'lang' => true,
                        'col' => 6,
                        'hint' => $this->l('Enlace al hacer clic en el slide (opcional)')
                    ),
                    array(
                        'type' => 'text',
                        'label' => $this->l('Leyenda'),
                        'name' => 'legend',
                        'lang' => true,
                        'col' => 6,
                        'hint' => $this->l('Texto alternativo para accesibilidad (opcional)')
                    ),
                    array(
                        'type' => 'file',
                        'label' => $this->l('Imagen'),
                        'name' => 'image',
                        'accept' => '.jpg,.jpeg,.png,.gif,.webp',
                        'desc' => $this->l('Formatos permitidos: JPG, PNG, GIF, WebP. Tamaño máximo: 20MB'),
                        'required' => !$idSlide // Obligatorio solo para nuevos slides
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Activo'),
                        'name' => 'active',
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Sí')
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('No')
                            )
                        )
                    )
                ),
                'submit' => array(
                    'title' => $this->l('Guardar'),
                    'class' => 'btn btn-default pull-right'
                ),
                'buttons' => array(
                    array(
                        'type' => 'button',
                        'title' => $this->l('Cancelar'),
                        'icon' => 'process-icon-cancel',
                        'class' => 'btn btn-default',
                        'href' => AdminController::$currentIndex . '&configure=' . $this->name . '&token=' . Tools::getAdminTokenLite('AdminModules')
                    )
                )
            )
        );

        // Si estamos editando, mostrar la imagen actual
        if ($idSlide && isset($slide->image[$this->context->language->id])) {
            $image_url = $this->context->link->getBaseLink() . 'img/ho_slider/' . $slide->image[$this->context->language->id];
            $fields_form['form']['input'][] = array(
                'type' => 'html',
                'name' => 'current_image',
                'html_content' => '<div class="form-group">
                    <label class="control-label col-lg-3">' . $this->l('Imagen actual') . '</label>
                    <div class="col-lg-9">
                        <img src="' . $image_url . '" style="max-width: 300px; height: auto;" />
                        <p class="help-block">' . $this->l('Sube una nueva imagen para reemplazar la actual') . '</p>
                    </div>
                </div>'
            );
        }

        $helper = new HelperForm();
        $helper->module = $this;
        $helper->name_controller = $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->currentIndex = AdminController::$currentIndex . '&configure=' . $this->name;
        $helper->submit_action = 'submitSlide';
        
        // Configuración de idiomas
        $helper->default_form_language = (int)Configuration::get('PS_LANG_DEFAULT');
        $helper->allow_employee_form_lang = (int)Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG');
        $helper->show_toolbar = false;
        
        // Importante: establecer los idiomas disponibles
        $helper->languages = Language::getLanguages(false);
        $helper->id_language = $this->context->language->id;

        // Valores del formulario
        if ($idSlide) {
            $helper->fields_value = array(
                'id_slide' => $idSlide,
                'active' => $slide->active
            );
            
            // Campos multiidioma
            foreach (Language::getLanguages(false) as $lang) {
                $helper->fields_value['title'][$lang['id_lang']] = $slide->title[$lang['id_lang']];
                $helper->fields_value['description'][$lang['id_lang']] = $slide->description[$lang['id_lang']];
                $helper->fields_value['url'][$lang['id_lang']] = $slide->url[$lang['id_lang']];
                $helper->fields_value['legend'][$lang['id_lang']] = $slide->legend[$lang['id_lang']];
            }
        } else {
            $helper->fields_value = array(
                'active' => 1
            );
        }

        // Campo oculto para el ID
        if ($idSlide) {
            $fields_form['form']['input'][] = array(
                'type' => 'hidden',
                'name' => 'id_slide'
            );
        }

        $formHtml = $helper->generateForm(array($fields_form));
        
        // Envolver el formulario con un div con ID para hacer scroll
        return '<div id="add_slide_form">' . $formHtml . '</div>';
    }

    /**
     * Renderizar formulario de configuración general
     */
    protected function renderSettingsForm()
    {
        $fields_form = array(
            'form' => array(
                'legend' => array(
                    'title' => $this->l('Configuración del Slider'),
                    'icon' => 'icon-cogs'
                ),
                'input' => array(
                    array(
                        'type' => 'text',
                        'label' => $this->l('Velocidad de transición'),
                        'name' => 'HO_SLIDER_SPEED',
                        'suffix' => 'ms',
                        'desc' => $this->l('Tiempo entre slides en milisegundos (ej: 5000 = 5 segundos)'),
                        'col' => 2
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Autoplay'),
                        'name' => 'HO_SLIDER_AUTOPLAY',
                        'is_bool' => true,
                        'desc' => $this->l('Cambiar automáticamente de slide'),
                        'values' => array(
                            array(
                                'id' => 'autoplay_on',
                                'value' => 1,
                                'label' => $this->l('Sí')
                            ),
                            array(
                                'id' => 'autoplay_off',
                                'value' => 0,
                                'label' => $this->l('No')
                            )
                        )
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Pausar al pasar el ratón'),
                        'name' => 'HO_SLIDER_PAUSE_ON_HOVER',
                        'is_bool' => true,
                        'desc' => $this->l('Pausar el autoplay cuando el usuario pasa el ratón por encima'),
                        'values' => array(
                            array(
                                'id' => 'pause_on',
                                'value' => 1,
                                'label' => $this->l('Sí')
                            ),
                            array(
                                'id' => 'pause_off',
                                'value' => 0,
                                'label' => $this->l('No')
                            )
                        )
                    )
                ),
                'submit' => array(
                    'title' => $this->l('Guardar Configuración'),
                    'class' => 'btn btn-default pull-right'
                )
            )
        );

        $helper = new HelperForm();
        $helper->module = $this;
        $helper->name_controller = $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->currentIndex = AdminController::$currentIndex . '&configure=' . $this->name;
        $helper->submit_action = 'submitSettings';

        $helper->fields_value = array(
            'HO_SLIDER_SPEED' => Configuration::get('HO_SLIDER_SPEED'),
            'HO_SLIDER_AUTOPLAY' => Configuration::get('HO_SLIDER_AUTOPLAY'),
            'HO_SLIDER_PAUSE_ON_HOVER' => Configuration::get('HO_SLIDER_PAUSE_ON_HOVER')
        );

        return $helper->generateForm(array($fields_form));
    }

    /**
     * Procesar formulario de slide
     */
    protected function postProcessSlide()
    {
        $idSlide = (int)Tools::getValue('id_slide');
        
        if ($idSlide) {
            $slide = new HoSlide($idSlide);
            if (!Validate::isLoadedObject($slide)) {
                return $this->displayError($this->l('Slide no encontrado'));
            }
        } else {
            $slide = new HoSlide();
            $slide->id_shop = $this->context->shop->id;
            $slide->position = HoSlide::getNextPosition($this->context->shop->id);
        }

        $slide->active = (int)Tools::getValue('active');

        // Procesar campos multiidioma
        $languages = Language::getLanguages(false);
        $defaultLangId = (int)Configuration::get('PS_LANG_DEFAULT');
        $hasImage = false;

        foreach ($languages as $lang) {
            $idLang = (int)$lang['id_lang'];
            $slide->title[$idLang] = Tools::getValue('title_' . $idLang, '');
            $slide->description[$idLang] = Tools::getValue('description_' . $idLang, '');
            $slide->url[$idLang] = Tools::getValue('url_' . $idLang, '');
            $slide->legend[$idLang] = Tools::getValue('legend_' . $idLang, '');
            
            // Mantener imagen existente si no se sube una nueva
            if ($idSlide && isset($slide->image[$idLang]) && $slide->image[$idLang]) {
                // Mantener la imagen existente
            } else {
                // Inicializar como vacío (se llenará después si se sube imagen)
                $slide->image[$idLang] = '';
            }
        }

        // Validar que al menos el idioma por defecto tenga título
        if (empty($slide->title[$defaultLangId])) {
            // Mantener parámetro para volver al formulario
            $_GET['addSlide'] = 1;
            return $this->displayError($this->l('El título es obligatorio'));
        }

        // Procesar imágenes
        $upload_dir = _PS_ROOT_DIR_ . '/img/ho_slider/';
        
        // Asegurar que el directorio existe
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }

        // Procesar imagen (un solo archivo para todos los idiomas)
        if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
            $file = $_FILES['image'];
            
            // Validar extensión de archivo
            $allowed_extensions = array('jpg', 'jpeg', 'png', 'gif', 'webp');
            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            
            if (!in_array($extension, $allowed_extensions)) {
                $_GET['addSlide'] = 1;
                return $this->displayError(
                    $this->l('Formato de imagen no válido. Use JPG, PNG, GIF o WebP.') . 
                    ' Archivo: ' . $file['name'] . 
                    ' Extensión: ' . $extension
                );
            }
            
            // Validar que sea realmente una imagen
            $image_info = @getimagesize($file['tmp_name']);
            if ($image_info === false) {
                $_GET['addSlide'] = 1;
                return $this->displayError($this->l('El archivo no es una imagen válida: ') . $file['name']);
            }
            
            // Validar tamaño (máx 20MB)
            if ($file['size'] > 20 * 1024 * 1024) {
                $_GET['addSlide'] = 1;
                return $this->displayError($this->l('La imagen es demasiado grande. Tamaño máximo: 20MB'));
            }
            
            $filename = uniqid('slide_') . '.' . $extension;
            
            if (move_uploaded_file($file['tmp_name'], $upload_dir . $filename)) {
                // Eliminar imágenes anteriores si existen
                if ($idSlide) {
                    foreach ($languages as $lang) {
                        $idLang = (int)$lang['id_lang'];
                        if (isset($slide->image[$idLang]) && $slide->image[$idLang]) {
                            @unlink($upload_dir . $slide->image[$idLang]);
                        }
                    }
                }
                
                // Asignar la misma imagen a todos los idiomas
                foreach ($languages as $lang) {
                    $idLang = (int)$lang['id_lang'];
                    $slide->image[$idLang] = $filename;
                }
                $hasImage = true;
            } else {
                $_GET['addSlide'] = 1;
                return $this->displayError($this->l('Error al mover el archivo subido: ') . $file['name']);
            }
        } elseif (!$idSlide) {
            // Si es nuevo slide, la imagen es obligatoria
            $_GET['addSlide'] = 1;
            return $this->displayError($this->l('Debe subir al menos una imagen'));
        }
        
        if ($slide->save()) {
            Tools::redirectAdmin(AdminController::$currentIndex . '&configure=' . $this->name . '&conf=4&token=' . Tools::getAdminTokenLite('AdminModules'));
        } else {
            $_GET['addSlide'] = 1;
            // Mostrar errores de validación si existen
            $errors = '';
            if (method_exists($slide, 'getErrors')) {
                $slideErrors = $slide->getErrors();
                if (!empty($slideErrors)) {
                    $errors = ' Errores: ' . implode(', ', $slideErrors);
                }
            }
            return $this->displayError($this->l('Error al guardar el slide') . $errors);
        }
    }

    /**
     * Eliminar slide
     */
    protected function deleteSlide()
    {
        $idSlide = (int)Tools::getValue('id_slide');
        $slide = new HoSlide($idSlide);

        if (Validate::isLoadedObject($slide)) {
            // Eliminar imágenes
            $upload_dir = _PS_ROOT_DIR_ . '/img/ho_slider/';
            foreach ($slide->image as $image) {
                if ($image && file_exists($upload_dir . $image)) {
                    @unlink($upload_dir . $image);
                }
            }

            if ($slide->delete()) {
                Tools::redirectAdmin(AdminController::$currentIndex . '&configure=' . $this->name . '&conf=1&token=' . Tools::getAdminTokenLite('AdminModules'));
            }
        }

        return $this->displayError($this->l('Error al eliminar el slide'));
    }

    /**
     * Cambiar estado del slide
     */
    protected function toggleStatus()
    {
        $idSlide = (int)Tools::getValue('id_slide');
        $slide = new HoSlide($idSlide);

        if (Validate::isLoadedObject($slide)) {
            $slide->active = !$slide->active;
            if ($slide->save()) {
                Tools::redirectAdmin(AdminController::$currentIndex . '&configure=' . $this->name . '&conf=4&token=' . Tools::getAdminTokenLite('AdminModules'));
            }
        }

        return $this->displayError($this->l('Error al actualizar el estado'));
    }

    /**
     * Procesar configuración general
     */
    protected function postProcessSettings()
    {
        Configuration::updateValue('HO_SLIDER_SPEED', (int)Tools::getValue('HO_SLIDER_SPEED'));
        Configuration::updateValue('HO_SLIDER_AUTOPLAY', (int)Tools::getValue('HO_SLIDER_AUTOPLAY'));
        Configuration::updateValue('HO_SLIDER_PAUSE_ON_HOVER', (int)Tools::getValue('HO_SLIDER_PAUSE_ON_HOVER'));

        return $this->displayConfirmation($this->l('Configuración guardada correctamente'));
    }

    /**
    * Add the CSS & JavaScript files you want to be loaded in the BO.
    */
    public function hookDisplayBackOfficeHeader()
    {
        if (Tools::getValue('configure') == $this->name) {
            $this->context->controller->addJS($this->_path.'views/js/back.js');
            $this->context->controller->addCSS($this->_path.'views/css/back.css');
        }
    }

    /**
     * Add the CSS & JavaScript files you want to be added on the FO.
     */
    public function hookHeader()
    {
        $this->context->controller->addJS($this->_path.'views/js/front.js');
        $this->context->controller->addCSS($this->_path.'views/css/front.css');
        
        // Pasar configuración al JavaScript
        Media::addJsDef(array(
            'hoSliderSpeed' => (int)Configuration::get('HO_SLIDER_SPEED'),
            'hoSliderAutoplay' => (bool)Configuration::get('HO_SLIDER_AUTOPLAY'),
            'hoSliderPauseOnHover' => (bool)Configuration::get('HO_SLIDER_PAUSE_ON_HOVER')
        ));
    }

    /**
     * Hook para mostrar el slider en el home
     */
    public function hookDisplayHome()
    {
        $slides = HoSlide::getSlides(
            $this->context->language->id,
            $this->context->shop->id,
            true // Solo slides activos
        );

        if (empty($slides)) {
            return '';
        }

        $this->context->smarty->assign(array(
            'slides' => $slides,
            'module_dir' => $this->_path,
            'image_baseurl' => $this->context->link->getBaseLink() . 'img/ho_slider/'
        ));

        return $this->display(__FILE__, 'views/templates/hook/ho_slider.tpl');
    }
}
