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
        $this->tab = 'front_office_features';
        $this->version = '1.0.0';
        $this->author = 'Mario';
        $this->need_instance = 0;

        /**
         * Set $this->bootstrap to true if your module is compliant with bootstrap (PrestaShop 1.6)
         */
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('Home Slider');
        $this->description = $this->l('Advanced slider module for homepage with 3D effects');

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
        Configuration::updateValue('HO_SLIDER_TEMPLATE', 'default'); // default, minimal, modern

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
        Configuration::deleteByName('HO_SLIDER_TEMPLATE');

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
        } elseif (Tools::isSubmit('duplicateSlide')) {
            $output .= $this->duplicateSlide();
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
        $action = Tools::getValue('action');
        
        if ($action === 'updatePositions') {
            header('Content-Type: application/json');
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
            header('Content-Type: application/json');
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
                    'title' => $idSlide ? $this->l('Edit Slide') : $this->l('Add Slide'),
                    'icon' => 'icon-picture',
                    'id' => 'add_slide_form'
                ),
                'input' => array(
                    array(
                        'type' => 'text',
                        'label' => $this->l('URL'),
                        'name' => 'url',
                        'lang' => true,
                        'col' => 6,
                        'hint' => $this->l('Link when clicking on the slide (optional)')
                    ),
                    array(
                        'type' => 'file',
                        'label' => $this->l('Image'),
                        'name' => 'image',
                        'accept' => '.jpg,.jpeg,.png,.gif,.webp',
                        'desc' => $idSlide && isset($slide->image[$this->context->language->id]) 
                            ? $this->l('Current image: ') . $slide->image[$this->context->language->id] . '. ' . $this->l('Upload a new file to replace it.')
                            : $this->l('Allowed formats: JPG, PNG, GIF, WebP. Max size: 20MB. Recommended resolution: 1000 x 400px.'),
                        'required' => !$idSlide,
                        'image' => $idSlide && isset($slide->image[$this->context->language->id]) 
                            ? $this->context->link->getBaseLink() . 'img/ho_slider/' . $slide->image[$this->context->language->id]
                            : null,
                        'thumb' => $idSlide && isset($slide->image[$this->context->language->id]) 
                            ? $this->context->link->getBaseLink() . 'img/ho_slider/' . $slide->image[$this->context->language->id]
                            : null
                    ),
                    array(
                        'type' => 'file',
                        'label' => $this->l('Mobile Image'),
                        'name' => 'image_mobile',
                        'accept' => '.jpg,.jpeg,.png,.gif,.webp',
                        'desc' => $idSlide && isset($slide->image_mobile[$this->context->language->id]) && $slide->image_mobile[$this->context->language->id]
                            ? $this->l('Current mobile image: ') . $slide->image_mobile[$this->context->language->id] . '. ' . $this->l('Upload a new file to replace it.')
                            : $this->l('Optimized image for mobile (≤768px). If not specified, the main image will be used.'),
                        'required' => false
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Active'),
                        'name' => 'active',
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Yes')
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
                    'title' => $this->l('Save'),
                    'class' => 'btn btn-default pull-right'
                ),
                'buttons' => array(
                    array(
                        'type' => 'button',
                        'title' => $this->l('Cancel'),
                        'icon' => 'process-icon-cancel',
                        'class' => 'btn btn-default',
                        'href' => AdminController::$currentIndex . '&configure=' . $this->name . '&token=' . Tools::getAdminTokenLite('AdminModules')
                    )
                )
            )
        );

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
        $languages = Language::getLanguages(false);
        
        // Configurar el idioma por defecto para evitar el error "is_default"
        foreach ($languages as &$language) {
            $language['is_default'] = ($language['id_lang'] == $helper->default_form_language) ? 1 : 0;
        }
        unset($language);
        
        $helper->languages = $languages;

        // Valores del formulario
        $helper->fields_value = array(
            'active' => $idSlide ? $slide->active : 1
        );
        
        if ($idSlide) {
            $helper->fields_value['id_slide'] = $idSlide;
        }
        
        // Inicializar campos multiidioma para todos los idiomas
        foreach (Language::getLanguages(false) as $lang) {
            $idLang = $lang['id_lang'];
            
            if ($idSlide && isset($slide->url[$idLang])) {
                // Si estamos editando, usar valores existentes
                $helper->fields_value['url'][$idLang] = $slide->url[$idLang];
            } else {
                // Si es nuevo, inicializar con valores vacíos
                $helper->fields_value['url'][$idLang] = '';
            }
        }

        // Campo oculto para el ID
        if ($idSlide) {
            $fields_form['form']['input'][] = array(
                'type' => 'hidden',
                'name' => 'id_slide'
            );
        }

        $formHtml = $helper->generateForm(array($fields_form));

        return $formHtml;
    }

    /**
     * Duplicar un slide existente
     */
    protected function duplicateSlide()
    {
        $idSlide = (int)Tools::getValue('id_slide');
        if (!$idSlide) {
            return $this->displayError($this->l('Invalid slide ID'));
        }

        $original = new HoSlide($idSlide);
        if (!Validate::isLoadedObject($original)) {
            return $this->displayError($this->l('Slide not found'));
        }

        $new = new HoSlide();
        $new->id_shop = (int)$this->context->shop->id;
        $new->position = HoSlide::getNextPosition($this->context->shop->id);
        // Crear duplicado inactivo por defecto para revisión
        $new->active = 0;

        $languages = Language::getLanguages(false);
        $uploadDir = _PS_ROOT_DIR_ . '/img/ho_slider/';

        // Determinar nombre de imagen origen (usar cualquier idioma que la tenga)
        $sourceImage = '';
        foreach ($languages as $lang) {
            $idLang = (int)$lang['id_lang'];
            if (!empty($original->image[$idLang])) {
                $sourceImage = $original->image[$idLang];
                break;
            }
        }

        $newFilename = '';
        if ($sourceImage && file_exists($uploadDir . $sourceImage)) {
            $ext = pathinfo($sourceImage, PATHINFO_EXTENSION);
            $newFilename = uniqid('slide_') . '.' . $ext;
            if (!@copy($uploadDir . $sourceImage, $uploadDir . $newFilename)) {
                // If copy failed, keep reference to same image as fallback
                $newFilename = $sourceImage;
            }
        }

        foreach ($languages as $lang) {
            $idLang = (int)$lang['id_lang'];
            $new->url[$idLang] = (string)$original->url[$idLang];
            $new->image[$idLang] = $newFilename ?: '';
        }

        if ($new->save()) {
            Tools::redirectAdmin(AdminController::$currentIndex . '&configure=' . $this->name . '&conf=3&token=' . Tools::getAdminTokenLite('AdminModules'));
        }

        return $this->displayError($this->l('Could not duplicate slide'));
    }

    /**
     * Render general settings form
     */
    protected function renderSettingsForm()
    {
        $fields_form = array(
            'form' => array(
                'legend' => array(
                    'title' => $this->l('Slider Settings'),
                    'icon' => 'icon-cogs'
                ),
                'input' => array(
                    array(
                        'type' => 'select',
                        'label' => $this->l('Slider Template'),
                        'name' => 'HO_SLIDER_TEMPLATE',
                        'desc' => $this->l('Choose the slider design/layout'),
                        'options' => array(
                            'query' => array(
                                array(
                                    'id' => 'default',
                                    'name' => $this->l('Default - 3D Modern (side slides visible)')
                                ),
                                array(
                                    'id' => 'alternative',
                                    'name' => $this->l('Alternative (beta) - Full width without margins ')
                                )
                            ),
                            'id' => 'id',
                            'name' => 'name'
                        )
                    ),
                    array(
                        'type' => 'text',
                        'label' => $this->l('Transition speed'),
                        'name' => 'HO_SLIDER_SPEED',
                        'suffix' => 'ms',
                        'desc' => $this->l('Time between slides in milliseconds (e.g.: 5000 = 5 seconds)'),
                        'col' => 2
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Autoplay'),
                        'name' => 'HO_SLIDER_AUTOPLAY',
                        'is_bool' => true,
                        'desc' => $this->l('Automatically change slides'),
                        'values' => array(
                            array(
                                'id' => 'autoplay_on',
                                'value' => 1,
                                'label' => $this->l('Yes')
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
                        'label' => $this->l('Pause on hover'),
                        'name' => 'HO_SLIDER_PAUSE_ON_HOVER',
                        'is_bool' => true,
                        'desc' => $this->l('Pause autoplay when user hovers over the slider'),
                        'values' => array(
                            array(
                                'id' => 'pause_on',
                                'value' => 1,
                                'label' => $this->l('Yes')
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
                    'title' => $this->l('Save Settings'),
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
            'HO_SLIDER_TEMPLATE' => Configuration::get('HO_SLIDER_TEMPLATE'),
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
                return $this->displayError($this->l('Slide not found'));
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
            $slide->url[$idLang] = Tools::getValue('url_' . $idLang, '');
            
            // Mantener imagen existente si no se sube una nueva
            if ($idSlide && isset($slide->image[$idLang]) && $slide->image[$idLang]) {
                // Mantener la imagen existente
            } else {
                // Inicializar como vacío (se llenará después si se sube imagen)
                $slide->image[$idLang] = '';
            }
        }

        // Procesar imágenes
        $upload_dir = _PS_ROOT_DIR_ . '/img/ho_slider/';
        
        // Asegurar que el directorio existe
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }

        // Definir extensiones permitidas para ambos uploads
        $allowed_extensions = array('jpg', 'jpeg', 'png', 'gif', 'webp');

        // Procesar imagen (un solo archivo para todos los idiomas)
        if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
            $file = $_FILES['image'];
            
            // Validar extensión de archivo
            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            
            if (!in_array($extension, $allowed_extensions)) {
                $_GET['addSlide'] = 1;
                return $this->displayError(
                    $this->l('Invalid image format. Use JPG, PNG, GIF or WebP.') . 
                    ' File: ' . $file['name'] . 
                    ' Extension: ' . $extension
                );
            }
            
            // Validate that it's really an image
            $image_info = @getimagesize($file['tmp_name']);
            if ($image_info === false) {
                $_GET['addSlide'] = 1;
                return $this->displayError($this->l('The file is not a valid image: ') . $file['name']);
            }
            
            // Validate size (max 20MB)
            if ($file['size'] > 20 * 1024 * 1024) {
                $_GET['addSlide'] = 1;
                return $this->displayError($this->l('The image is too large. Maximum size: 20MB'));
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
                return $this->displayError($this->l('Error moving uploaded file: ') . $file['name']);
            }
        } elseif (!$idSlide) {
            // If it's a new slide, the image is required
            $_GET['addSlide'] = 1;
            return $this->displayError($this->l('You must upload at least one image'));
        }
        
        // Process mobile image (optional)
        if (isset($_FILES['image_mobile']) && $_FILES['image_mobile']['error'] === UPLOAD_ERR_OK) {
            $fileMobile = $_FILES['image_mobile'];
            
            // Validate extension
            $extensionMobile = strtolower(pathinfo($fileMobile['name'], PATHINFO_EXTENSION));
            
            if (!in_array($extensionMobile, $allowed_extensions)) {
                $_GET['addSlide'] = 1;
                return $this->displayError($this->l('Invalid mobile image format.'));
            }
            
            // Validate that it's an image
            $imageMobileInfo = @getimagesize($fileMobile['tmp_name']);
            if ($imageMobileInfo === false) {
                $_GET['addSlide'] = 1;
                return $this->displayError($this->l('The mobile image file is not valid.'));
            }
            
            // Validate size
            if ($fileMobile['size'] > 20 * 1024 * 1024) {
                $_GET['addSlide'] = 1;
                return $this->displayError($this->l('The mobile image is too large. Maximum: 20MB'));
            }
            
            $filenameMobile = uniqid('slide_') . '_mobile.' . $extensionMobile;
            
            if (move_uploaded_file($fileMobile['tmp_name'], $upload_dir . $filenameMobile)) {
                // Eliminar imágenes móviles anteriores si existen
                if ($idSlide) {
                    foreach ($languages as $lang) {
                        $idLang = (int)$lang['id_lang'];
                        if (isset($slide->image_mobile[$idLang]) && $slide->image_mobile[$idLang]) {
                            @unlink($upload_dir . $slide->image_mobile[$idLang]);
                        }
                    }
                }
                
                // Asignar la imagen móvil a todos los idiomas
                foreach ($languages as $lang) {
                    $idLang = (int)$lang['id_lang'];
                    $slide->image_mobile[$idLang] = $filenameMobile;
                }
            }
        }
        
        if ($slide->save()) {
            Tools::redirectAdmin(AdminController::$currentIndex . '&configure=' . $this->name . '&conf=4&token=' . Tools::getAdminTokenLite('AdminModules'));
        } else {
            $_GET['addSlide'] = 1;
            // Show validation errors if they exist
            $errors = '';
            if (method_exists($slide, 'getErrors')) {
                $slideErrors = $slide->getErrors();
                if (!empty($slideErrors)) {
                    $errors = ' Errors: ' . implode(', ', $slideErrors);
                }
            }
            return $this->displayError($this->l('Error saving slide') . $errors);
        }
    }

    /**
     * Delete slide
     */
    protected function deleteSlide()
    {
        $idSlide = (int)Tools::getValue('id_slide');
        $slide = new HoSlide($idSlide);

        if (Validate::isLoadedObject($slide)) {
            // Delete images
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

        return $this->displayError($this->l('Error deleting slide'));
    }

    /**
     * Toggle slide status
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

        return $this->displayError($this->l('Error updating status'));
    }

    /**
     * Process general settings
     */
    protected function postProcessSettings()
    {
        Configuration::updateValue('HO_SLIDER_TEMPLATE', Tools::getValue('HO_SLIDER_TEMPLATE'));
        Configuration::updateValue('HO_SLIDER_SPEED', (int)Tools::getValue('HO_SLIDER_SPEED'));
        Configuration::updateValue('HO_SLIDER_AUTOPLAY', (int)Tools::getValue('HO_SLIDER_AUTOPLAY'));
        Configuration::updateValue('HO_SLIDER_PAUSE_ON_HOVER', (int)Tools::getValue('HO_SLIDER_PAUSE_ON_HOVER'));

        return $this->displayConfirmation($this->l('Settings saved successfully'));
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
        // Obtener la plantilla seleccionada
        $template = Configuration::get('HO_SLIDER_TEMPLATE');
        if (!$template) {
            $template = 'default';
        }

        // Determinar qué archivos CSS/JS cargar según la plantilla
        $cssFile = ($template === 'alternative') ? 'front_alternative.css' : 'front.css';
        $jsFile = ($template === 'alternative') ? 'front_alternative.js' : 'front.js';

        // Registrar CSS del slider
        $this->context->controller->registerStylesheet(
            'module-ho_slider-front',
            'modules/' . $this->name . '/views/css/' . $cssFile,
            [
                'media' => 'all',
                'priority' => 150,
            ]
        );
        
        // Registrar JS del slider
        $this->context->controller->registerJavascript(
            'module-ho_slider-front',
            'modules/' . $this->name . '/views/js/' . $jsFile,
            [
                'position' => 'bottom',
                'priority' => 150,
            ]
        );
        
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

        // Obtener la plantilla seleccionada
        $template = Configuration::get('HO_SLIDER_TEMPLATE');
        if (!$template) {
            $template = 'default';
        }

        // Validar que la plantilla existe
        $validTemplates = array('default', 'alternative');
        if (!in_array($template, $validTemplates)) {
            $template = 'default';
        }

        $this->context->smarty->assign(array(
            'slides' => $slides,
            'module_dir' => $this->_path,
            'image_baseurl' => $this->context->link->getBaseLink() . 'img/ho_slider/',
            'template' => $template
        ));

        // Usar la plantilla seleccionada
        $templateFile = 'views/templates/hook/ho_slider_' . $template . '.tpl';
        
        return $this->display(__FILE__, $templateFile);
    }
}
