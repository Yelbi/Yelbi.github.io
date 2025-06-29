<?php
// config/i18n.php
function load_language() {
    $default_lang = 'es';
    $available_langs = ['es', 'en'];
    
    $lang = $default_lang;
    
    // 1. Verificar parámetro de URL
    if (isset($_GET['lang']) && in_array($_GET['lang'], $available_langs)) {
        $lang = $_GET['lang'];
        setcookie('lang', $lang, time() + (86400 * 30), "/");
    }
    // 2. Verificar cookie
    elseif (isset($_COOKIE['lang']) && in_array($_COOKIE['lang'], $available_langs)) {
        $lang = $_COOKIE['lang'];
    }
    // 3. Verificar cabecera HTTP (navegador)
    else {
        $browser_lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
        if (in_array($browser_lang, $available_langs)) {
            $lang = $browser_lang;
        }
    }
    
    // Cargar archivo de idioma
    $lang_file = __DIR__ . "/../lang/$lang.json";
    if (file_exists($lang_file)) {
        return [
            'translations' => json_decode(file_get_contents($lang_file), true),
            'current_lang' => $lang
        ];
    }
    
    return ['translations' => [], 'current_lang' => $lang];
}

$i18n = load_language();
$translations = $i18n['translations'];
$current_lang = $i18n['current_lang'];

function __($key) {
    global $translations;
    return $translations[$key] ?? $key;
}
?>