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

class HoSlide extends ObjectModel
{
    public $id_slide;
    public $id_shop;
    public $position;
    public $active;
    
    // Multilang fields
    public $title;
    public $description;
    public $legend;
    public $url;
    public $image;

    /**
     * @see ObjectModel::$definition
     */
    public static $definition = array(
        'table' => 'ho_slider',
        'primary' => 'id_slide',
        'multilang' => true,
        'fields' => array(
            'id_shop' => array('type' => self::TYPE_INT, 'validate' => 'isUnsignedInt'),
            'position' => array('type' => self::TYPE_INT, 'validate' => 'isUnsignedInt'),
            'active' => array('type' => self::TYPE_BOOL, 'validate' => 'isBool'),
            
            // Multilang fields
            'title' => array(
                'type' => self::TYPE_STRING,
                'lang' => true,
                'validate' => 'isGenericName',
                'size' => 255
            ),
            'description' => array(
                'type' => self::TYPE_HTML,
                'lang' => true,
                'validate' => 'isCleanHtml'
            ),
            'legend' => array(
                'type' => self::TYPE_STRING,
                'lang' => true,
                'validate' => 'isGenericName',
                'size' => 255
            ),
            'url' => array(
                'type' => self::TYPE_STRING,
                'lang' => true,
                'validate' => 'isUrl',
                'size' => 255
            ),
            'image' => array(
                'type' => self::TYPE_STRING,
                'lang' => true,
                'validate' => 'isGenericName',
                'size' => 255
            ),
        )
    );

    /**
     * Get all slides
     *
     * @param int $idLang Language ID
     * @param int $idShop Shop ID
     * @param bool $active Get only active slides
     * @return array
     */
    public static function getSlides($idLang, $idShop, $active = true)
    {
        $sql = 'SELECT s.*, sl.*
                FROM `' . _DB_PREFIX_ . 'ho_slider` s
                LEFT JOIN `' . _DB_PREFIX_ . 'ho_slider_lang` sl 
                    ON (s.id_slide = sl.id_slide AND sl.id_lang = ' . (int)$idLang . ')
                WHERE s.id_shop = ' . (int)$idShop;
        
        if ($active) {
            $sql .= ' AND s.active = 1';
        }
        
        $sql .= ' ORDER BY s.position ASC';

        return Db::getInstance()->executeS($sql);
    }

    /**
     * Update positions
     *
     * @param array $positions
     * @return bool
     */
    public static function updatePositions($positions)
    {
        foreach ($positions as $position => $idSlide) {
            Db::getInstance()->update(
                'ho_slider',
                array('position' => (int)$position),
                'id_slide = ' . (int)$idSlide
            );
        }
        return true;
    }

    /**
     * Get next position
     *
     * @param int $idShop
     * @return int
     */
    public static function getNextPosition($idShop)
    {
        $sql = 'SELECT MAX(position) as max_position
                FROM `' . _DB_PREFIX_ . 'ho_slider`
                WHERE id_shop = ' . (int)$idShop;
        
        $result = Db::getInstance()->getRow($sql);
        return (int)$result['max_position'] + 1;
    }
}
