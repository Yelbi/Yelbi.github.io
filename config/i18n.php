<?php
// config/i18n.php - Sistema de traducción mejorado

class I18n {
    private static $instance = null;
    private $translations = [];
    private $currentLang = 'es';
    private $defaultLang = 'es';
    private $availableLangs = ['es', 'en'];
    private $fallbackTranslations = [];
    
    private function __construct() {
        $this->loadLanguage();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Detecta y carga el idioma apropiado
     */
    private function loadLanguage() {
        $lang = $this->detectLanguage();
        $this->currentLang = $lang;
        
        // Cargar traducciones del idioma principal
        $this->translations = $this->loadTranslations($lang);
        
        // Cargar traducciones de fallback si no es el idioma por defecto
        if ($lang !== $this->defaultLang) {
            $this->fallbackTranslations = $this->loadTranslations($this->defaultLang);
        }
    }
    
    /**
     * Detecta el idioma basado en prioridades
     */
    private function detectLanguage() {
        // 1. Parámetro URL (máxima prioridad)
        if (isset($_GET['lang']) && $this->isValidLanguage($_GET['lang'])) {
            $lang = $_GET['lang'];
            $this->setLanguageCookie($lang);
            return $lang;
        }
        
        // 2. Cookie existente
        if (isset($_COOKIE['lang']) && $this->isValidLanguage($_COOKIE['lang'])) {
            return $_COOKIE['lang'];
        }
        
        // 3. Detección por cabecera HTTP del navegador
        $browserLang = $this->detectBrowserLanguage();
        if ($browserLang) {
            return $browserLang;
        }
        
        // 4. Idioma por defecto
        return $this->defaultLang;
    }
    
    /**
     * Detecta el idioma del navegador de manera más robusta
     */
    private function detectBrowserLanguage() {
        if (!isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
            return null;
        }
        
        // Parsear Accept-Language header
        $acceptLang = $_SERVER['HTTP_ACCEPT_LANGUAGE'];
        preg_match_all('/([a-z]{1,8}(?:-[a-z]{1,8})?)\s*(?:;\s*q\s*=\s*(1|0\.[0-9]+))?/i', $acceptLang, $matches);
        
        $languages = [];
        if (count($matches[1]) > 0) {
            for ($i = 0; $i < count($matches[1]); $i++) {
                $lang = strtolower($matches[1][$i]);
                $quality = isset($matches[2][$i]) ? (float)$matches[2][$i] : 1.0;
                
                // Extraer solo el código de idioma principal (ej: 'en' de 'en-US')
                $langCode = substr($lang, 0, 2);
                
                if ($this->isValidLanguage($langCode)) {
                    $languages[$langCode] = $quality;
                }
            }
            
            // Ordenar por calidad (q-value)
            arsort($languages);
            
            // Retornar el idioma con mayor calidad
            if (!empty($languages)) {
                return array_key_first($languages);
            }
        }
        
        return null;
    }
    
    /**
     * Valida si un idioma está disponible
     */
    private function isValidLanguage($lang) {
        return in_array($lang, $this->availableLangs, true);
    }
    
    /**
     * Establece cookie de idioma
     */
    private function setLanguageCookie($lang) {
        setcookie('lang', $lang, [
            'expires' => time() + (86400 * 30), // 30 días
            'path' => '/',
            'secure' => isset($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    }
    
    /**
     * Carga las traducciones de un archivo
     */
    private function loadTranslations($lang) {
        $langFile = __DIR__ . "/../lang/{$lang}.json";
        
        if (!file_exists($langFile)) {
            error_log("Archivo de idioma no encontrado: {$langFile}");
            return [];
        }
        
        $content = file_get_contents($langFile);
        if ($content === false) {
            error_log("Error al leer archivo de idioma: {$langFile}");
            return [];
        }
        
        $translations = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("Error al decodificar JSON del archivo: {$langFile} - " . json_last_error_msg());
            return [];
        }
        
        return $translations ?: [];
    }
    
    /**
     * Obtiene una traducción
     */
    public function translate($key, $params = []) {
        $translation = $this->getTranslation($key);
        
        // Reemplazar parámetros si existen
        if (!empty($params) && is_array($params)) {
            foreach ($params as $param => $value) {
                $translation = str_replace("{{$param}}", $value, $translation);
            }
        }
        
        return $translation;
    }
    
    /**
     * Obtiene una traducción con fallback
     */
    private function getTranslation($key) {
        // Buscar en traducciones principales
        if (isset($this->translations[$key])) {
            return $this->translations[$key];
        }
        
        // Buscar en traducciones de fallback
        if (!empty($this->fallbackTranslations) && isset($this->fallbackTranslations[$key])) {
            error_log("Usando traducción de fallback para la clave: {$key}");
            return $this->fallbackTranslations[$key];
        }
        
        // Si no se encuentra, registrar y retornar la clave
        error_log("Traducción no encontrada para la clave: {$key}");
        return $key;
    }
    
    /**
     * Obtiene el idioma actual
     */
    public function getCurrentLanguage() {
        return $this->currentLang;
    }
    
    /**
     * Obtiene todos los idiomas disponibles
     */
    public function getAvailableLanguages() {
        return $this->availableLangs;
    }
    
    /**
     * Cambia el idioma actual
     */
    public function changeLanguage($lang) {
        if (!$this->isValidLanguage($lang)) {
            return false;
        }
        
        $this->currentLang = $lang;
        $this->setLanguageCookie($lang);
        $this->translations = $this->loadTranslations($lang);
        
        // Actualizar fallback si es necesario
        if ($lang !== $this->defaultLang) {
            $this->fallbackTranslations = $this->loadTranslations($this->defaultLang);
        } else {
            $this->fallbackTranslations = [];
        }
        
        return true;
    }
    
    /**
     * Genera URL con parámetro de idioma
     */
    public function getLanguageUrl($lang, $currentUrl = null) {
        if (!$this->isValidLanguage($lang)) {
            return '#';
        }
        
        if ($currentUrl === null) {
            $currentUrl = $_SERVER['REQUEST_URI'];
        }
        
        // Remover parámetro lang existente
        $url = preg_replace('/[?&]lang=[^&]*/', '', $currentUrl);
        
        // Agregar nuevo parámetro lang
        $separator = strpos($url, '?') !== false ? '&' : '?';
        return $url . $separator . 'lang=' . $lang;
    }
    
    /**
     * Obtiene información del idioma alternativo
     */
    public function getAlternativeLanguage() {
        return $this->currentLang === 'es' ? 'en' : 'es';
    }
    
    /**
     * Obtiene el nombre del idioma en su idioma nativo
     */
    public function getLanguageName($lang = null) {
        $lang = $lang ?: $this->currentLang;
        $names = [
            'es' => 'Español',
            'en' => 'English'
        ];
        return $names[$lang] ?? $lang;
    }
}

// Inicializar instancia global
$i18n = I18n::getInstance();
$current_lang = $i18n->getCurrentLanguage();

/**
 * Función helper para traducir
 */
function __($key, $params = []) {
    global $i18n;
    return $i18n->translate($key, $params);
}

/**
 * Función helper para obtener idioma actual
 */
function current_lang() {
    global $current_lang;
    return $current_lang;
}

/**
 * Función helper para cambiar idioma
 */
function change_language($lang) {
    global $i18n;
    return $i18n->changeLanguage($lang);
}

/**
 * Función helper para URL con idioma
 */
function lang_url($lang, $url = null) {
    global $i18n;
    return $i18n->getLanguageUrl($lang, $url);
}

/**
 * Función helper para idioma alternativo
 */
function alt_lang() {
    global $i18n;
    return $i18n->getAlternativeLanguage();
}

/**
 * Función helper para nombre del idioma
 */
function lang_name($lang = null) {
    global $i18n;
    return $i18n->getLanguageName($lang);
}
?>