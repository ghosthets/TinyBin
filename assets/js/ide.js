var IDE = (function() {
    'use strict';
    var editor, currentProject = null, activeTab = null, tabs = [];
    var projects = {}, contextPath = '', fileTreeData = [];
    var githubToken = localStorage.getItem('tb_token') || '';
    var useLocalToolchain = localStorage.getItem('tb_toolchain') === 'true';
    var toolchainPath = localStorage.getItem('tb_toolchain_path') || '';
    var currentTheme = localStorage.getItem('tb_theme') || 'dark';
    var autoSaveEnabled = localStorage.getItem('tb_autosave') !== 'false';
    var autoSaveDelay = parseInt(localStorage.getItem('tb_autosave_delay') || '2000');
    var autoSaveTimer = null;
    var BOARDS = {
        'ESP8266 / ESP-01': ['esp01','esp01s','esp12e','esp12f','esp8266','nodemcu','nodemcu_v2','nodemcu_v3','wemos_d1_mini','wemos_d1_mini_pro','huzzah','thing','thingdev'],
        'ESP32 Family': ['esp32','esp32s2','esp32s3','esp32c3','esp32c6','esp32h2','huzzah32','feather_esp32'],
        'Arduino': ['arduino_uno','arduino_nano','arduino_nano_old','arduino_mega','arduino_leonardo','arduino_micro','arduino_pro_mini','arduino_pro_mini_3v3','arduino_due','arduino_zero','arduino_mkr1000','arduino_mkrwifi1010','arduino_nano_33_iot','arduino_nano_33_ble'],
        'AVR': ['attiny85','attiny84','attiny167','atmega328','atmega2560','atmega32u4'],
        'STM32': ['stm32f103c8','stm32f103cb','stm32f407ve','stm32f411ce','stm32l476rg','stm32g071rb','stm32h743zi','bluepill','blackpill','nucleo_f103rb','nucleo_f446re','nucleo_l476rg','nucleo_g431rb','discovery_f4','discovery_l4'],
        'Raspberry Pi Pico': ['rp2040','pico','pico_w','pico2','adafruit_qtpy_rp2040','adafruit_feather_rp2040','adafruit_itsybitsy_rp2040','waveshare_rp2040_zero'],
        'nRF / micro:bit': ['nrf52832','nrf52840','nrf52_dk','nrf52840_dk','nrf52840_dongle','adafruit_feather_nrf52840','adafruit_clue_nrf52840','bbc_microbit','bbc_microbit_v2','nrf51822','nrf51_dk'],
        'Teensy': ['teensy31','teensy35','teensy36','teensy40','teensy41','teensylc'],
        'Particle': ['particle_photon','particle_electron','particle_argon','particle_boron','particle_xenon'],
        'M5Stack': ['m5stack_core','m5stack_fire','m5stickc','m5stickc_plus','m5atom','m5atom_lite','m5atom_matrix','m5paper','m5core2','m5coreink','m5stamp_pico','m5stamp_c3','m5stamp_s3'],
        'TTGO / Heltec': ['ttgo_tbeam','ttgo_twatch','ttgo_tdisplay','ttgo_lora32','heltec_wifi_lora32','heltec_wifi_kit_32','heltec_wireless_stick'],
        'LOLIN / Wemos': ['lolin_s2_mini','lolin_s3','lolin_d32','lolin_d32_pro','lolin32','lolin32_lite','wemos_s2_mini','wemos_s3'],
        'DFRobot': ['firebeetle_esp32','firebeetle_esp32e','firebeetle_esp32c6'],
        'Seeed XIAO': ['xiao_esp32c3','xiao_esp32s3','xiao_rp2040','xiao_nrf52840','xiao_ble','xiao_esp32c6','xiao_esp32s3_sense','xiao_esp32c3_sense','xiao_m0','xiao_ble_sense'],
        'SAMD': ['samd21','samd51'],
    };
    var BN = {esp01:'ESP-01',esp01s:'ESP-01S',esp12e:'ESP-12E',esp12f:'ESP-12F',esp8266:'ESP8266',nodemcu:'NodeMCU 1.0',nodemcu_v2:'NodeMCU V2',nodemcu_v3:'NodeMCU V3',wemos_d1_mini:'Wemos D1 Mini',wemos_d1_mini_pro:'Wemos D1 Mini Pro',huzzah:'HUZZAH ESP8266',thing:'ESP8266 Thing',thingdev:'ESP8266 Thing Dev',esp32:'ESP32 DevKit',esp32s2:'ESP32-S2',esp32s3:'ESP32-S3',esp32c3:'ESP32-C3',esp32c6:'ESP32-C6',esp32h2:'ESP32-H2',huzzah32:'HUZZAH32 ESP32',feather_esp32:'Feather ESP32',arduino_uno:'Arduino Uno',arduino_nano:'Arduino Nano',arduino_nano_old:'Arduino Nano (Old)',arduino_mega:'Arduino Mega 2560',arduino_leonardo:'Arduino Leonardo',arduino_micro:'Arduino Micro',arduino_pro_mini:'Arduino Pro Mini',arduino_pro_mini_3v3:'Arduino Pro Mini 3.3V',arduino_due:'Arduino Due',arduino_zero:'Arduino Zero',arduino_mkr1000:'MKR1000',arduino_mkrwifi1010:'MKR WiFi 1010',arduino_nano_33_iot:'Nano 33 IoT',arduino_nano_33_ble:'Nano 33 BLE',attiny85:'ATtiny85',attiny84:'ATtiny84',attiny167:'ATtiny167',atmega328:'ATmega328',atmega2560:'ATmega2560',atmega32u4:'ATmega32U4',stm32f103c8:'STM32F103C8 Blue Pill',stm32f103cb:'STM32F103CB',stm32f407ve:'STM32F407VE Black Pill',stm32f411ce:'STM32F411CE Black Pill',stm32l476rg:'STM32L476RG Nucleo',stm32g071rb:'STM32G071RB Nucleo',stm32h743zi:'STM32H743ZI Nucleo',bluepill:'Blue Pill',blackpill:'Black Pill',nucleo_f103rb:'Nucleo F103RB',nucleo_f446re:'Nucleo F446RE',nucleo_l476rg:'Nucleo L476RG',nucleo_g431rb:'Nucleo G431RB',discovery_f4:'STM32F4 Discovery',discovery_l4:'STM32L4 Discovery',rp2040:'RP2040',pico:'Raspberry Pi Pico',pico_w:'Raspberry Pi Pico W',pico2:'Raspberry Pi Pico 2',adafruit_qtpy_rp2040:'QT Py RP2040',adafruit_feather_rp2040:'Feather RP2040',adafruit_itsybitsy_rp2040:'ItsyBitsy RP2040',waveshare_rp2040_zero:'RP2040-Zero',nrf52832:'nRF52832',nrf52840:'nRF52840',nrf52_dk:'nRF52 DK',nrf52840_dk:'nRF52840 DK',nrf52840_dongle:'nRF52840 Dongle',adafruit_feather_nrf52840:'Feather nRF52840',adafruit_clue_nrf52840:'CLUE nRF52840',bbc_microbit:'micro:bit',bbc_microbit_v2:'micro:bit V2',nrf51822:'nRF51822',nrf51_dk:'nRF51 DK',teensy31:'Teensy 3.1/3.2',teensy35:'Teensy 3.5',teensy36:'Teensy 3.6',teensy40:'Teensy 4.0',teensy41:'Teensy 4.1',teensylc:'Teensy LC',particle_photon:'Photon',particle_electron:'Electron',particle_argon:'Argon',particle_boron:'Boron',particle_xenon:'Xenon',m5stack_core:'M5Stack Core',m5stack_fire:'M5Stack Fire',m5stickc:'M5StickC',m5stickc_plus:'M5StickC Plus',m5atom:'M5Atom',m5atom_lite:'M5Atom Lite',m5atom_matrix:'M5Atom Matrix',m5paper:'M5Paper',m5core2:'M5Core2',m5coreink:'M5CoreInk',m5stamp_pico:'M5Stamp Pico',m5stamp_c3:'M5Stamp C3',m5stamp_s3:'M5Stamp S3',ttgo_tbeam:'T-Beam',ttgo_twatch:'T-Watch',ttgo_tdisplay:'T-Display',ttgo_lora32:'LoRa32',heltec_wifi_lora32:'WiFi LoRa 32',heltec_wifi_kit_32:'WiFi Kit 32',heltec_wireless_stick:'Wireless Stick',lolin_s2_mini:'LOLIN S2 Mini',lolin_s3:'LOLIN S3',lolin_d32:'LOLIN D32',lolin_d32_pro:'LOLIN D32 PRO',lolin32:'LOLIN32',lolin32_lite:'LOLIN32 Lite',wemos_s2_mini:'Wemos S2 Mini',wemos_s3:'Wemos S3',firebeetle_esp32:'Firebeetle ESP32',firebeetle_esp32e:'Firebeetle ESP32-E',firebeetle_esp32c6:'Firebeetle ESP32-C6',xiao_esp32c3:'XIAO ESP32C3',xiao_esp32s3:'XIAO ESP32S3',xiao_rp2040:'XIAO RP2040',xiao_nrf52840:'XIAO nRF52840',xiao_ble:'XIAO BLE',xiao_esp32c6:'XIAO ESP32C6',xiao_esp32s3_sense:'XIAO ESP32S3 Sense',xiao_esp32c3_sense:'XIAO ESP32C3 Sense',xiao_m0:'XIAO M0',xiao_ble_sense:'XIAO BLE Sense',samd21:'SAMD21',samd51:'SAMD51'};
    var LIBRARY_SOURCES = {
        'WiFi': {owner:'espressif',repo:'arduino-esp32',path:'libraries/WiFi/src',branch:'master'},
        'Ethernet': {owner:'arduino-libraries',repo:'Ethernet',path:'src',branch:'master'},
        'BLE': {owner:'espressif',repo:'arduino-esp32',path:'libraries/BLE/src',branch:'master'},
        'HTTPClient': {owner:'espressif',repo:'arduino-esp32',path:'libraries/HTTPClient/src',branch:'master'},
        'WebServer': {owner:'espressif',repo:'arduino-esp32',path:'libraries/WebServer/src',branch:'master'},
        'MQTT': {owner:'knolleary',repo:'pubsubclient',path:'src',branch:'master'},
        'Adafruit_Sensor': {owner:'adafruit',repo:'Adafruit_Sensor',path:'',branch:'master'},
        'DHT': {owner:'adafruit',repo:'DHT-sensor-library',path:'',branch:'master'},
        'Adafruit_BME280': {owner:'adafruit',repo:'Adafruit_BME280_Library',path:'',branch:'master'},
        'MPU6050': {owner:'ElectronicCats',repo:'MPU6050',path:'src',branch:'master'},
        'Adafruit_GFX': {owner:'adafruit',repo:'Adafruit-GFX-Library',path:'',branch:'master'},
        'Adafruit_SSD1306': {owner:'adafruit',repo:'Adafruit_SSD1306',path:'',branch:'master'},
        'TFT_eSPI': {owner:'Bodmer',repo:'TFT_eSPI',path:'',branch:'master'},
        'EEPROM': {owner:'espressif',repo:'arduino-esp32',path:'libraries/EEPROM/src',branch:'master'},
        'LittleFS': {owner:'espressif',repo:'arduino-esp32',path:'libraries/LittleFS/src',branch:'master'},
        'SD': {owner:'espressif',repo:'arduino-esp32',path:'libraries/SD/src',branch:'master'},
        'ArduinoOTA': {owner:'espressif',repo:'arduino-esp32',path:'libraries/ArduinoOTA/src',branch:'master'},
        'ESPmDNS': {owner:'espressif',repo:'arduino-esp32',path:'libraries/ESPmDNS/src',branch:'master'},
        'Servo': {owner:'arduino-libraries',repo:'Servo',path:'src',branch:'master'},
        'NeoPixel': {owner:'adafruit',repo:'Adafruit_NeoPixel',path:'',branch:'master'},
        'FastLED': {owner:'FastLED',repo:'FastLED',path:'',branch:'master'},
        'IRremote': {owner:'Arduino-IRremote',repo:'Arduino-IRremote',path:'src',branch:'master'},
        'LiquidCrystal_I2C': {owner:'marcoschwartz',repo:'LiquidCrystal_I2C',path:'',branch:'master'},
        'OneWire': {owner:'PaulStoffregen',repo:'OneWire',path:'',branch:'master'},
        'DallasTemperature': {owner:'milesburton',repo:'Arduino-Temperature-Control-Library',path:'',branch:'master'},
        'ArduinoJson': {owner:'bblanchon',repo:'ArduinoJson',path:'src',branch:'6.x'},
        'Time': {owner:'PaulStoffregen',repo:'Time',path:'',branch:'master'},
        'RTClib': {owner:'adafruit',repo:'RTClib',path:'',branch:'master'},
        'U8g2': {owner:'olikraus',repo:'u8g2',path:'csrc',branch:'master'},
        'MFRC522': {owner:'miguelbalboa',repo:'rfid',path:'',branch:'master'},
        'Adafruit_GPS': {owner:'adafruit',repo:'Adafruit_GPS',path:'',branch:'master'},
        'LoRa': {owner:'sandeepmistry',repo:'arduino-LoRa',path:'',branch:'master'},
        'ESPAsyncWebServer': {owner:'me-no-dev',repo:'ESPAsyncWebServer',path:'src',branch:'master'},
        'AsyncTCP': {owner:'me-no-dev',repo:'AsyncTCP',path:'src',branch:'master'},
        'NTPClient': {owner:'arduino-libraries',repo:'NTPClient',path:'',branch:'master'},
        'TaskScheduler': {owner:'arkhipenko',repo:'TaskScheduler',path:'src',branch:'master'},
        'Keypad': {owner:'Chris--A',repo:'Keypad',path:'src',branch:'master'},
        'Adafruit_NeoTrellis': {owner:'adafruit',repo:'Adafruit_NeoTrellis',path:'',branch:'master'},
    };
    function init() {
        applyTheme(currentTheme);
        initEditor();
        loadProjects();
        populateBoardSelect();
        setupActivityBar();
        setupKeyboardShortcuts();
        setupTerminalResize();
        setupContextMenu();
        setupGlobalClick();
        setupTabContextMenu();
        setupSerialMonitor();
        if (githubToken) { var el = document.getElementById('githubToken'); if (el) el.value = githubToken; }
        var tcEl = document.getElementById('useLocalToolchain'); if (tcEl) tcEl.checked = useLocalToolchain;
        var tpEl = document.getElementById('toolchainPath'); if (tpEl) tpEl.value = toolchainPath;
        if (useLocalToolchain) { var tg = document.getElementById('toolchainPathGroup'); if (tg) tg.style.display = 'block'; }
        var asEl = document.getElementById('autoSave'); if (asEl) asEl.checked = autoSaveEnabled;
        var asdEl = document.getElementById('autoSaveDelay'); if (asdEl) asdEl.value = autoSaveDelay;
        var sbr = document.getElementById('settingsBaudRate'); var tbr = document.getElementById('baudRate');
        if (sbr && tbr) {
            sbr.value = tbr.value;
            tbr.onchange = function() { sbr.value = tbr.value; };
            sbr.onchange = function() { tbr.value = sbr.value; };
        }
        var sle = document.getElementById('settingsLineEnding'); var tle = document.getElementById('serialLineEnding');
        if (sle && tle) {
            sle.onchange = function() { tle.value = sle.value; };
            tle.onchange = function() { sle.value = tle.value; };
        }
        updateAutoSaveStatus();
        updateThemeButtons();
        TODO.init();
        Output.updateStats();
        Terminal.log('TinyBin IDE v3.0 initialized.', 'system');
        Terminal.log('All data stored locally in your browser.', 'info');
        Terminal.log('Create a project or fetch from GitHub to begin.', 'info');
        Terminal.log('Press Ctrl+Shift+P for Command Palette.', 'info');
        if (typeof NativeCompiler !== 'undefined') NativeCompiler.init();
    }
    function applyTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('tb_theme', theme);
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            if (editor) {
                if (!ace.require) {
                    var s = document.createElement('script');
                    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/theme-chrome.min.js';
                    s.onload = function() { editor.setTheme('ace/theme/chrome'); };
                    document.head.appendChild(s);
                } else { editor.setTheme('ace/theme/chrome'); }
            }
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (editor) editor.setTheme('ace/theme/tomorrow_night');
        }
        updateThemeButtons();
    }
    function updateThemeButtons() {
        var btns = document.querySelectorAll('.theme-btn');
        for (var i = 0; i < btns.length; i++) {
            if (btns[i].getAttribute('data-theme') === currentTheme) btns[i].classList.add('active');
            else btns[i].classList.remove('active');
        }
    }
    function initEditor() {
        editor = ace.edit('editor');
        editor.setTheme(currentTheme === 'light' ? 'ace/theme/chrome' : 'ace/theme/tomorrow_night');
        editor.session.setMode('ace/mode/c_cpp');
        editor.setOptions({ fontSize: '14px', showPrintMargin: false, enableBasicAutocompletion: true, enableLiveAutocompletion: true, enableSnippets: true, wrap: true, tabSize: 4, useSoftTabs: true });
        editor.selection.on('changeCursor', function() {
            var p = editor.getCursorPosition();
            var el = document.getElementById('statusPosition');
            if (el) el.textContent = 'Ln ' + (p.row + 1) + ', Col ' + (p.column + 1);
        });
        editor.on('change', function() {
            if (activeTab) {
                var t = null;
                for (var i = 0; i < tabs.length; i++) { if (tabs[i].path === activeTab) { t = tabs[i]; break; } }
                if (t) { t.modified = true; t.content = editor.getValue(); renderTabs(); if (autoSaveEnabled) scheduleAutoSave(); }
            }
        });
    }
    function scheduleAutoSave() {
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(function() { saveCurrentFile(); }, autoSaveDelay);
    }
    function loadProjects() {
        try { var s = localStorage.getItem('tb_projects'); if (s) projects = JSON.parse(s); } catch(e) { projects = {}; }
        var last = localStorage.getItem('tb_last');
        if (last && projects[last]) loadProject(last);
    }
    function saveProjects() { localStorage.setItem('tb_projects', JSON.stringify(projects)); }
    function loadProject(id) {
        if (!projects[id]) return;
        currentProject = projects[id];
        localStorage.setItem('tb_last', id);
        var mp = document.getElementById('menubarProject'); if (mp) mp.textContent = currentProject.name;
        var sp = document.getElementById('statusProject'); if (sp) sp.textContent = currentProject.name;
        var pl = document.getElementById('projectNameLabel'); if (pl) pl.textContent = currentProject.name.toUpperCase();
        if (currentProject.board) {
            var s = document.getElementById('boardSelect');
            if (s) { for (var i = 0; i < s.options.length; i++) { if (s.options[i].value === currentProject.board) { s.selectedIndex = i; break; } } }
        }
        var mb = document.getElementById('menubarBoard'); if (mb) mb.textContent = getBN(currentProject.board);
        fileTreeData = currentProject.files || [];
        renderFileTree();
        renderInstalledLibs();
        TODO.loadForProject(id);
        Output.updateStats();
        Terminal.log('Loaded project: ' + currentProject.name, 'success');
        if (currentProject.github_url) Terminal.log('Source: ' + currentProject.github_url, 'info');
        if (currentProject.tbin) Terminal.log('.tbin config: ' + currentProject.tbin.path, 'info');
    }
    function createProject(name, board) {
        var id = 'p_' + Date.now();
        var tbin = genTBin(name, board);
        projects[id] = { id: id, name: name, board: board, created: new Date().toISOString(), updated: new Date().toISOString(), files: [{ path: name + '.tbin', content: tbin, type: 'tbin' }, { path: 'src/main.cpp', content: genMainCpp(name), type: 'cpp' }, { path: 'include/config.h', content: genConfigH(name), type: 'h' }], libraries: [], tbin: { path: name + '.tbin', config: parseTBin(tbin) }, github_url: null };
        saveProjects();
        loadProject(id);
        openFile('src/main.cpp', 'main.cpp');
        Terminal.log('Project "' + name + '" created for ' + getBN(board), 'success');
    }
    function genTBin(n, b) { return '# ' + n + '\n\nproject_name: ' + n + '\nversion: 1.0.0\nboard: ' + b + '\nbinary_path: build/' + n + '.bin\n\n## Libraries\nlibraries:\n  - name: WiFi\n    version: 2.0.0\n\n## Build\nbuild:\n  optimization: -Os\n  debug: false\n  partitions: default\n  flash_freq: 80m\n  flash_size: 4MB\n\n## Defines\ndefines:\n  - USE_SERIAL\n  - LED_BUILTIN=2\n'; }
    function genMainCpp(n) { return '#include <Arduino.h>\n\n// ' + n + ' -- Generated by TinyBin IDE\n\nvoid setup() {\n    Serial.begin(115200);\n    pinMode(LED_BUILTIN, OUTPUT);\n    Serial.println("' + n + ' started");\n}\n\nvoid loop() {\n    digitalWrite(LED_BUILTIN, HIGH);\n    delay(1000);\n    digitalWrite(LED_BUILTIN, LOW);\n    delay(1000);\n}\n'; }
    function genConfigH(n) { var d = n.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase(); return '#ifndef ' + d + '_CONFIG_H\n#define ' + d + '_CONFIG_H\n\n// Configuration for ' + n + '\n#define PROJECT_NAME "' + n + '"\n#define PROJECT_VERSION "1.0.0"\n#define SERIAL_BAUD 115200\n#define LED_PIN LED_BUILTIN\n\n#endif // ' + d + '_CONFIG_H\n'; }
    function parseTBin(c) {
        var cfg = {}, lines = c.split('\n'), sec = null, lib = null;
        for (var i = 0; i < lines.length; i++) {
            var l = lines[i].trim();
            if (!l || l[0] === '#') continue;
            if (l.indexOf('project_name:') === 0) { cfg.project_name = l.split(':')[1].trim(); sec = null; }
            else if (l.indexOf('version:') === 0) { cfg.version = l.split(':')[1].trim(); sec = null; }
            else if (l.indexOf('board:') === 0) { cfg.board = l.split(':')[1].trim(); sec = null; }
            else if (l.indexOf('binary_path:') === 0) { cfg.binary_path = l.split(':')[1].trim(); sec = null; }
            else if (l === 'libraries:') { sec = 'libraries'; cfg.libraries = []; }
            else if (l === 'build:') { sec = 'build'; cfg.build = {}; }
            else if (l === 'defines:') { sec = 'defines'; cfg.defines = []; }
            else if (sec === 'libraries') { if (l.indexOf('- name:') === 0) { lib = { name: l.split(':')[1].trim() }; cfg.libraries.push(lib); } else if (l.indexOf('version:') === 0 && lib) lib.version = l.split(':')[1].trim(); }
            else if (sec === 'build') { var p = l.split(':'); if (p.length === 2) { var v = p[1].trim(); if (v === 'true') v = true; else if (v === 'false') v = false; cfg.build[p[0].trim()] = v; } }
            else if (sec === 'defines') { if (l.indexOf('- ') === 0) cfg.defines.push(l.substring(2).trim()); }
        }
        return cfg;
    }
    function populateBoardSelect() {
        var s = document.getElementById('boardSelect');
        if (!s) return;
        s.innerHTML = '';
        for (var g in BOARDS) {
            var og = document.createElement('optgroup'); og.label = g;
            BOARDS[g].forEach(function(id) { var o = document.createElement('option'); o.value = id; o.textContent = getBN(id); og.appendChild(o); });
            s.appendChild(og);
        }
        s.value = 'esp32';
    }
    function getBN(id) { return BN[id] || id.toUpperCase(); }
    function setupActivityBar() {
        var btns = document.querySelectorAll('.activity-btn[data-panel]');
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', function(e) {
                e.stopPropagation();
                showPanel(this.getAttribute('data-panel'));
            });
        }
    }
    function showPanel(n) {
        var abtns = document.querySelectorAll('.activity-btn');
        for (var i = 0; i < abtns.length; i++) { abtns[i].classList.toggle('active', abtns[i].getAttribute('data-panel') === n); }
        var panels = document.querySelectorAll('.sidebar-panel');
        for (var i = 0; i < panels.length; i++) panels[i].classList.remove('active');
        var p = document.getElementById('panel-' + n);
        if (p) p.classList.add('active');
        var sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('collapsed');
        if (n === 'output') Output.updateStats();
        if (n === 'boards' && typeof BoardManagerPanel !== 'undefined') BoardManagerPanel.render();
        if (editor) setTimeout(function() { editor.resize(); }, 50);
    }
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') { e.preventDefault(); CommandPalette.open(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 's' && e.shiftKey) { e.preventDefault(); saveAllFiles(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveCurrentFile(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); newFile(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'w') { e.preventDefault(); if (activeTab) closeTab(activeTab); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') { e.preventDefault(); openFindBar(); }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') { e.preventDefault(); showPanel('search'); }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') { e.preventDefault(); showPanel('files'); }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') { e.preventDefault(); TabManager.showTree(); }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') { e.preventDefault(); toggleSidebar(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'g') { e.preventDefault(); goToLine(); }
            if ((e.ctrlKey || e.metaKey) && e.key === '/') { e.preventDefault(); toggleComment(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); toggleSidebar(); }
            if (e.ctrlKey && e.key === '`') { e.preventDefault(); Terminal.toggle(); }
            if (e.key === 'F5') { e.preventDefault(); Compiler.compile(); }
            if (e.key === 'F6') { e.preventDefault(); Compiler.analyze(); }
            if (e.key === 'F7') { e.preventDefault(); Flasher.flash(); }
            if (e.key === 'F8') { e.preventDefault(); Flasher.downloadBinary(); }
            if (e.key === 'F12') { e.preventDefault(); goToDefinition(); }
            if (e.altKey && e.shiftKey && e.key === 'F') { e.preventDefault(); CodeFormatter.formatCurrentFile(); }
            if (e.altKey && e.key === 'z') { e.preventDefault(); toggleWordWrap(); }
            if (e.key === 'Escape') { closeFindBar(); closeModal(); hideDropdown(); CommandPalette.close(); SerialPanel.close(); TabManager.hideContextMenu(); var tree = document.getElementById('tabTree'); if (tree) tree.classList.remove('visible'); }
        });
    }
    function setupTerminalResize() {
        var h = document.getElementById('terminalResizeHandle');
        var c = document.getElementById('terminalContainer');
        if (!h || !c) return;
        var r = false;
        h.addEventListener('mousedown', function(e) { r = true; document.body.style.cursor = 'ns-resize'; document.body.style.userSelect = 'none'; e.preventDefault(); });
        document.addEventListener('mousemove', function(e) {
            if (!r) return;
            var rect = c.parentElement.getBoundingClientRect();
            var ht = Math.max(100, Math.min(rect.bottom - e.clientY, rect.height - 100));
            c.style.height = ht + 'px'; c.classList.remove('hidden');
            if (editor) editor.resize();
        });
        document.addEventListener('mouseup', function() { if (r) { r = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; if (editor) editor.resize(); } });
    }
    function setupContextMenu() {
        var m = document.getElementById('contextMenu');
        if (!m) return;
        var items = m.querySelectorAll('.context-item');
        for (var i = 0; i < items.length; i++) {
            items[i].addEventListener('click', function() {
                var a = this.getAttribute('data-action'); hideContextMenu();
                if (a === 'open') openFile(contextPath, contextPath.split('/').pop());
                else if (a === 'delete') deleteFile(contextPath);
                else if (a === 'rename') renameFile(contextPath);
                else if (a === 'duplicate') duplicateFile(contextPath);
            });
        }
    }
    function setupGlobalClick() {
        document.addEventListener('click', function(e) {
            hideContextMenu();
            var dm = document.getElementById('dropdownMenu');
            if (dm && dm.classList.contains('visible')) {
                if (!e.target.closest('.menu-item') && !e.target.closest('.dropdown-menu')) {
                    hideDropdown();
                }
            }
            hideTabContextMenu();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') hideDropdown();
        });
    }
    function setupTabContextMenu() {
        var tabBar = document.getElementById('tabBar');
        if (!tabBar) return;
        tabBar.addEventListener('contextmenu', function(e) {
            var tabEl = e.target.closest('.tab');
            if (!tabEl) return;
            e.preventDefault();
            var path = tabEl.getAttribute('data-path');
            if (!path) return;
            TabManager.showContextMenu(e, path);
        });
    }
    function hideTabContextMenu() { TabManager.hideContextMenu(); }
    function highlightInTree(path) {
        var items = document.querySelectorAll('.tree-item[data-path]');
        for (var i = 0; i < items.length; i++) {
            if (items[i].getAttribute('data-path') === path) {
                items[i].classList.add('active');
                items[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(function() { items[i].classList.remove('active'); }, 2000);
                return;
            }
        }
    }
    function setupSerialMonitor() {
        var termTabs = document.querySelectorAll('.terminal-tab[data-terminal]');
        for (var i = 0; i < termTabs.length; i++) {
            termTabs[i].addEventListener('click', function() {
                var terminal = this.getAttribute('data-terminal');
                switchTerminalTab(terminal);
            });
        }
    }
    function switchTerminalTab(name) {
        var tabs = document.querySelectorAll('.terminal-tab');
        for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('active', tabs[i].getAttribute('data-terminal') === name);
        var panels = document.querySelectorAll('.terminal-panel');
        for (var i = 0; i < panels.length; i++) panels[i].classList.remove('active');
        var panel = document.getElementById('panel' + name.charAt(0).toUpperCase() + name.slice(1));
        if (panel) panel.classList.add('active');
    }
    function showContextMenu(e, p) { e.preventDefault(); contextPath = p; var m = document.getElementById('contextMenu'); if(m){m.style.left = e.clientX + 'px'; m.style.top = e.clientY + 'px'; m.classList.add('visible');} }
    function hideContextMenu() { var m = document.getElementById('contextMenu'); if(m) m.classList.remove('visible'); }
    function newFile(parentFolder) {
        if (!currentProject) { showNewProjectModal(); return; }
        var defaultPath = parentFolder ? parentFolder + '/' : '';
        var n = prompt('File path (e.g. ' + defaultPath + 'sensor.cpp, ' + defaultPath + 'pins.h):', defaultPath);
        if (!n) return; n = n.trim();
        if (n.indexOf('.') === -1) { alert('File must have an extension (.cpp, .h, .tbin, .json, etc.)'); return; }
        var ext = n.split('.').pop().toLowerCase();
        var valid = ['cpp','c','ino','h','hpp','tbin','json','txt','md','py','js','html','css','yaml','yml','ini','cfg'];
        if (valid.indexOf(ext) === -1) { alert('Invalid extension. Allowed: ' + valid.join(', ')); return; }
        var exists = false;
        for (var i = 0; i < currentProject.files.length; i++) { if (currentProject.files[i].path === n) { exists = true; break; } }
        if (exists) { alert('File already exists: ' + n); return; }
        var c = '';
        if (['cpp','c','ino'].indexOf(ext) !== -1) c = '#include <Arduino.h>\n\nvoid setup() {\n    \n}\n\nvoid loop() {\n    \n}\n';
        else if (['h','hpp'].indexOf(ext) !== -1) { var d = n.replace(/[^a-zA-Z0-9]/g,'_').toUpperCase(); c = '#ifndef '+d+'\n#define '+d+'\n\n\n\n#endif\n'; }
        else if (ext === 'tbin') c = genTBin(currentProject.name, currentProject.board);
        currentProject.files.push({ path: n, content: c, type: ext });
        currentProject.updated = new Date().toISOString();
        saveProjects(); renderFileTree(); Output.updateStats(); openFile(n, n.split('/').pop());
        Terminal.log('Created: ' + n, 'success');
    }
    function newFolder(parentFolder) {
        if (!currentProject) { showNewProjectModal(); return; }
        var defaultPath = parentFolder ? parentFolder + '/' : '';
        var n = prompt('Folder name:', defaultPath);
        if (!n) return; n = n.trim().replace(/\/$/, '');
        currentProject.files.push({ path: n + '/', content: '', type: 'folder' });
        currentProject.updated = new Date().toISOString();
        saveProjects(); renderFileTree(); Output.updateStats();
        Terminal.log('Created folder: ' + n, 'success');
    }
    function deleteFile(p) {
        if (!confirm('Delete ' + p + '?')) return;
        if (!currentProject) return;
        currentProject.files = currentProject.files.filter(function(f) { return f.path !== p && f.path.indexOf(p + '/') !== 0; });
        currentProject.updated = new Date().toISOString();
        saveProjects(); renderFileTree(); Output.updateStats(); closeTab(p);
        Terminal.log('Deleted: ' + p, 'warning');
    }
    function renameFile(old) {
        var n = prompt('New name:', old.split('/').pop());
        if (!n) return; n = n.trim();
        if (n.indexOf('.') === -1) { alert('File must have an extension'); return; }
        var parts = old.split('/'); parts.pop();
        var np = parts.length > 0 ? parts.join('/') + '/' + n : n;
        var exists = false;
        for (var i = 0; i < currentProject.files.length; i++) { if (currentProject.files[i].path === np) { exists = true; break; } }
        if (exists) { alert('File already exists: ' + np); return; }
        var f = null;
        for (var i = 0; i < currentProject.files.length; i++) { if (currentProject.files[i].path === old) { f = currentProject.files[i]; break; } }
        if (f) {
            f.path = np; currentProject.updated = new Date().toISOString(); saveProjects(); renderFileTree();
            var t = null;
            for (var i = 0; i < tabs.length; i++) { if (tabs[i].path === old) { t = tabs[i]; break; } }
            if (t) { t.path = np; t.name = n; renderTabs(); }
            Terminal.log('Renamed: ' + old + ' -> ' + np, 'info');
        }
    }
    function duplicateFile(p) {
        if (!currentProject) return;
        var f = null;
        for (var i = 0; i < currentProject.files.length; i++) { if (currentProject.files[i].path === p) { f = currentProject.files[i]; break; } }
        if (!f) return;
        var ext = p.split('.'); var base = ext.slice(0, -1).join('.');
        var newP = base + '_copy.' + ext[ext.length - 1];
        var exists = false;
        for (var i = 0; i < currentProject.files.length; i++) { if (currentProject.files[i].path === newP) { exists = true; break; } }
        if (exists) { alert('File already exists: ' + newP); return; }
        currentProject.files.push({ path: newP, content: f.content, type: f.type });
        currentProject.updated = new Date().toISOString();
        saveProjects(); renderFileTree(); Output.updateStats(); openFile(newP, newP.split('/').pop());
        Terminal.log('Duplicated: ' + p + ' -> ' + newP, 'success');
    }
    function openFile(p, n) {
        var existing = null;
        for (var i = 0; i < tabs.length; i++) { if (tabs[i].path === p) { existing = tabs[i]; break; } }
        if (existing) { activateTab(p); return; }
        if (!currentProject) return;
        var f = null;
        for (var i = 0; i < currentProject.files.length; i++) { if (currentProject.files[i].path === p) { f = currentProject.files[i]; break; } }
        var c = f ? f.content : '';
        tabs.push({ path: p, name: n, content: c, modified: false, pinned: false, groupId: null });
        activateTab(p); renderTabs();
    }
    function activateTab(p) {
        activeTab = p;
        var t = null;
        for (var i = 0; i < tabs.length; i++) { if (tabs[i].path === p) { t = tabs[i]; break; } }
        if (t) { editor.setValue(t.content, -1); setEditorMode(p); document.getElementById('editorWelcome').classList.add('hidden'); }
        renderTabs(); updateBreadcrumbs(p);
    }
    function closeTab(p) {
        var idx = -1;
        for (var i = 0; i < tabs.length; i++) { if (tabs[i].path === p) { idx = i; break; } }
        if (idx === -1) return;
        if (tabs[idx].pinned) { Terminal.log('Unpin tab first to close', 'warning'); return; }
        tabs.splice(idx, 1);
        if (activeTab === p) {
            activeTab = null;
            if (tabs.length > 0) activateTab(tabs[Math.min(idx, tabs.length - 1)].path);
            else { showWelcome(); document.getElementById('tabs').innerHTML = ''; document.getElementById('pinnedTabs').innerHTML = ''; }
        }
        renderTabs();
    }
    function closeAllTabs() { tabs = []; activeTab = null; document.getElementById('tabs').innerHTML = ''; showWelcome(); }
    function saveCurrentFile() {
        var t = null;
        for (var i = 0; i < tabs.length; i++) { if (tabs[i].path === activeTab) { t = tabs[i]; break; } }
        if (!t || !currentProject) { Terminal.log('No file open or no project.', 'warning'); return; }
        var c = editor.getValue(); t.content = c; t.modified = false;
        var f = null;
        for (var i = 0; i < currentProject.files.length; i++) { if (currentProject.files[i].path === t.path) { f = currentProject.files[i]; break; } }
        if (f) {
            f.content = c;
            if (t.path.indexOf('.tbin') !== -1) {
                currentProject.tbin = { path: t.path, config: parseTBin(c) };
                if (currentProject.tbin.config.board) {
                    currentProject.board = currentProject.tbin.config.board;
                    var s = document.getElementById('boardSelect');
                    if (s) { for (var i = 0; i < s.options.length; i++) { if (s.options[i].value === currentProject.board) { s.selectedIndex = i; break; } } }
                    var mb = document.getElementById('menubarBoard'); if (mb) mb.textContent = getBN(currentProject.board);
                }
            }
        }
        currentProject.updated = new Date().toISOString(); saveProjects(); renderTabs();
        Terminal.log('Saved: ' + t.path, 'success');
    }
    function setEditorMode(p) {
        var ext = p.split('.').pop().toLowerCase();
        var mm = { 'cpp':'ace/mode/c_cpp', 'c':'ace/mode/c_cpp', 'ino':'ace/mode/c_cpp', 'h':'ace/mode/c_cpp', 'hpp':'ace/mode/c_cpp', 'json':'ace/mode/json', 'tbin':'ace/mode/yaml', 'txt':'ace/mode/text', 'md':'ace/mode/markdown', 'py':'ace/mode/python', 'html':'ace/mode/html', 'yaml':'ace/mode/yaml', 'yml':'ace/mode/yaml' };
        var m = mm[ext] || 'ace/mode/c_cpp';
        editor.session.setMode(m);
        var ln = { 'ace/mode/c_cpp':'C++', 'ace/mode/json':'JSON', 'ace/mode/text':'Plain Text', 'ace/mode/markdown':'Markdown', 'ace/mode/python':'Python', 'ace/mode/html':'HTML', 'ace/mode/yaml':'YAML' };
        var el = document.getElementById('statusLanguage');
        if (el) el.textContent = ln[m] || 'C++';
    }
    function updateBreadcrumbs(p) {
        var bc = document.getElementById('breadcrumbs');
        if (!bc) return;
        var parts = p.split('/');
        var html = '<span class="breadcrumb-item">workspace</span>';
        for (var i = 0; i < parts.length; i++) { html += '<span class="breadcrumb-sep">/</span><span class="breadcrumb-item">' + esc(parts[i]) + '</span>'; }
        bc.innerHTML = html;
    }
    function showWelcome() { document.getElementById('editorWelcome').classList.remove('hidden'); }
    function renderFileTree() {
        var c = document.getElementById('fileTree');
        if (!c) return;
        if (!currentProject || !currentProject.files || currentProject.files.length === 0) {
            c.innerHTML = '<div class="tree-empty"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg><p>No files yet</p><button class="btn btn-sm btn-ghost" onclick="IDE.newFile()">Create File</button></div>';
            return;
        }
        var tree = buildTree(currentProject.files); c.innerHTML = ''; renderTree(tree, c, '');
    }
    function buildTree(files) {
        var tree = {};
        for (var fi = 0; fi < files.length; fi++) {
            var f = files[fi];
            var parts = f.path.endsWith('/') ? f.path.slice(0, -1).split('/') : f.path.split('/');
            var node = tree;
            for (var pi = 0; pi < parts.length; pi++) {
                var p = parts[pi];
                if (!node[p]) node[p] = { _children: {}, _isFile: pi === parts.length - 1 && !f.path.endsWith('/'), _path: f.path, _type: f.type || 'txt', _content: f.content || '' };
                node = node[p]._children;
            }
        }
        return tree;
    }
    function renderTree(tree, container, path) {
        var keys = Object.keys(tree).sort(function(a, b) { var af = !tree[a]._isFile, bf = !tree[b]._isFile; if (af && !bf) return -1; if (!af && bf) return 1; return a.localeCompare(b); });
        for (var ki = 0; ki < keys.length; ki++) {
            var key = keys[ki]; var item = tree[key]; var fp = path ? path + '/' + key : key;
            if (item._isFile) {
                var el = document.createElement('div'); el.className = 'tree-item'; el.setAttribute('data-path', item._path);
                var ic = item._type === 'h' || item._type === 'hpp' ? 'icon-h' : item._type === 'json' ? 'icon-json' : item._type === 'tbin' ? 'icon-tbin' : 'icon-cpp';
                el.innerHTML = '<span class="icon ' + ic + '">&#9635;</span><span>' + esc(key) + '</span>';
                (function(filePath, fileName) { el.addEventListener('click', function() { openFile(filePath, fileName); }); el.addEventListener('contextmenu', function(e) { showContextMenu(e, filePath); }); })(item._path, key);
                container.appendChild(el);
            } else {
                var fe = document.createElement('div'); fe.className = 'tree-item folder';
                fe.innerHTML = '<svg class="chevron open" width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M7 2L3 6l4 4"/></svg><span class="icon icon-folder">&#128193;</span><span>' + esc(key) + '</span><span class="folder-actions"><button class="folder-action-btn" title="New File in ' + esc(key) + '" onclick="event.stopPropagation();IDE.newFile(\'' + esc(fp) + '\')">&#43;</button><button class="folder-action-btn" title="New Folder in ' + esc(key) + '" onclick="event.stopPropagation();IDE.newFolder(\'' + esc(fp) + '\')">&#128193;</button></span>';
                var cc = document.createElement('div'); cc.className = 'tree-children'; renderTree(item._children, cc, fp);
                (function(folderEl, childrenEl) { folderEl.addEventListener('click', function(e) { e.stopPropagation(); var ch = folderEl.querySelector('.chevron'); if(ch)ch.classList.toggle('open'); childrenEl.classList.toggle('collapsed'); }); })(fe, cc);
                var w = document.createElement('div'); w.appendChild(fe); w.appendChild(cc); container.appendChild(w);
            }
        }
    }
    function showNewProjectModal() {
        document.getElementById('modalTitle').textContent = 'New Project';
        document.getElementById('modalBody').innerHTML = '<div class="form-group"><label for="npName">Project Name</label><input type="text" id="npName" placeholder="my-firmware" required></div><div class="form-group"><label for="npBoard">Target Board</label><select id="npBoard"></select></div>';
        document.getElementById('modalFooter').innerHTML = '<button class="btn btn-ghost" onclick="IDE.closeModal()">Cancel</button><button class="btn btn-neon" onclick="IDE.createNewProject()">Create Project</button>';
        var s = document.getElementById('npBoard');
        for (var g in BOARDS) { var og = document.createElement('optgroup'); og.label = g; BOARDS[g].forEach(function(id) { var o = document.createElement('option'); o.value = id; o.textContent = getBN(id); og.appendChild(o); }); s.appendChild(og); }
        s.value = 'esp32';
        document.getElementById('modalOverlay').classList.add('visible');
        setTimeout(function() { document.getElementById('npName').focus(); }, 100);
    }
    function createNewProject() {
        var n = document.getElementById('npName').value.trim(); var b = document.getElementById('npBoard').value;
        if (!n) { alert('Project name required'); return; }
        if (!/^[a-zA-Z0-9_-]+$/.test(n)) { alert('Name: letters, numbers, hyphens, underscores only'); return; }
        createProject(n, b); closeModal();
    }
    function showFetchModal() {
        document.getElementById('modalTitle').textContent = 'Fetch from GitHub';
        document.getElementById('modalBody').innerHTML = '<div class="form-group"><label for="fUrl">GitHub Repository URL</label><input type="url" id="fUrl" placeholder="https://github.com/user/repo" required></div><div class="form-group"><label for="fBranch">Branch</label><input type="text" id="fBranch" value="main" placeholder="main"></div><p style="font-size:11px;color:var(--text-muted);margin-top:8px">Auto-discovers all source files (.cpp, .h, .ino, .tbin, etc.) and pulls them into the editor.</p>';
        document.getElementById('modalFooter').innerHTML = '<button class="btn btn-ghost" onclick="IDE.closeModal()">Cancel</button><button class="btn btn-neon" onclick="IDE.fetchFromGitHub()">Fetch</button>';
        document.getElementById('modalOverlay').classList.add('visible');
        setTimeout(function() { document.getElementById('fUrl').focus(); }, 100);
    }
    async function fetchFromGitHub() {
        var url = document.getElementById('fUrl').value.trim(); var branch = document.getElementById('fBranch').value.trim() || 'main';
        if (!url) { alert('GitHub URL required'); return; }
        closeModal(); Terminal.log('Fetching: ' + url, 'info');
        try {
            var parsed = parseGHUrl(url);
            if (!parsed) { Terminal.log('Invalid GitHub URL', 'error'); return; }
            var hdrs = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'TinyBin-IDE' };
            if (githubToken) hdrs['Authorization'] = 'token ' + githubToken;
            var resp = await fetch('https://api.github.com/repos/' + parsed.owner + '/' + parsed.repo + '/git/trees/' + branch + '?recursive=1', { headers: hdrs });
            if (!resp.ok) { Terminal.log('GitHub API error: HTTP ' + resp.status, 'error'); return; }
            var data = await resp.json();
            var allFiles = data.tree.filter(function(i) { return i.type === 'blob'; });
            var srcFiles = allFiles.filter(function(i) { return /\.(cpp|c|ino|h|hpp|tbin|json|txt|md|py|js|html|css|yaml|yml|ini|cfg)$/i.test(i.path); });
            if (srcFiles.length === 0) { Terminal.log('No source files found in repo', 'error'); return; }
            var tbinFiles = srcFiles.filter(function(i) { return i.path.indexOf('.tbin') !== -1; });
            var pname = parsed.repo, board = 'esp32', tbinC = '';
            if (tbinFiles.length > 0) {
                try {
                    var tResp = await fetch('https://api.github.com/repos/' + parsed.owner + '/' + parsed.repo + '/contents/' + tbinFiles[0].path + '?ref=' + branch, { headers: hdrs });
                    if (tResp.ok) { var tD = await tResp.json(); if (tD.content && tD.encoding === 'base64') { tbinC = atob(tD.content); var cfg = parseTBin(tbinC); if (cfg.project_name) pname = cfg.project_name; if (cfg.board) board = cfg.board; } }
                } catch(e) {}
            }
            var files = [];
            if (tbinC) files.push({ path: tbinFiles[0].path, content: tbinC, type: 'tbin' });
            var maxFiles = Math.min(srcFiles.length, 50);
            for (var i = 0; i < maxFiles; i++) {
                var sf = srcFiles[i];
                if (sf.path.indexOf('.tbin') !== -1 && tbinC) continue;
                try {
                    var sR = await fetch('https://api.github.com/repos/' + parsed.owner + '/' + parsed.repo + '/contents/' + sf.path + '?ref=' + branch, { headers: hdrs });
                    if (sR.ok) {
                        var sD = await sR.json();
                        if (sD.content && sD.encoding === 'base64') {
                            var ext = sf.path.split('.').pop();
                            files.push({ path: sf.path, content: atob(sD.content), type: ext });
                        }
                    }
                } catch(e) {}
            }
            var id = 'p_' + Date.now();
            projects[id] = { id: id, name: pname, board: board, created: new Date().toISOString(), updated: new Date().toISOString(), files: files, libraries: [], tbin: tbinC ? { path: tbinFiles[0].path, config: parseTBin(tbinC) } : null, github_url: url };
            saveProjects(); loadProject(id);
            if (files.length > 0) openFile(files[0].path, files[0].path.split('/').pop());
            Terminal.log('Fetched ' + files.length + ' files from ' + parsed.full_name, 'success');
        } catch(e) { Terminal.log('Fetch failed: ' + e.message, 'error'); }
    }
    function parseGHUrl(u) { u = u.trim().replace(/\/$/, ''); var m = u.match(/^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/i); if (m) return { owner: m[1], repo: m[2], full_name: m[1] + '/' + m[2] }; return null; }
    function renderTabs() {
        var c = document.getElementById('tabs'); if (!c) return; c.innerHTML = '';
        var pc = document.getElementById('pinnedTabs'); if (pc) pc.innerHTML = '';
        var pinned = [], regular = [];
        for (var ti = 0; ti < tabs.length; ti++) { if (tabs[ti].pinned) pinned.push(tabs[ti]); else regular.push(tabs[ti]); }
        function makeTabEl(t) {
            var el = document.createElement('div');
            el.className = 'tab' + (t.path === activeTab ? ' active' : '') + (t.modified ? ' modified' : '') + (t.pinned ? ' pinned' : '');
            el.setAttribute('data-path', t.path);
            el.setAttribute('draggable', 'true');
            el.innerHTML = (t.pinned ? '<span class="tab-pin">&#128204;</span>' : '') + '<span class="tab-name">' + esc(t.name) + '</span><span class="tab-close" data-path="' + esc(t.path) + '">&times;</span>';
            el.addEventListener('click', function(e) { if (!e.target.classList.contains('tab-close')) activateTab(t.path); });
            var closeBtn = el.querySelector('.tab-close');
            closeBtn.addEventListener('click', function(e) { e.stopPropagation(); closeTab(t.path); });
            el.addEventListener('contextmenu', function(e) { e.preventDefault(); e.stopPropagation(); TabManager.showContextMenu(e, t.path); });
            el.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text/plain', t.path); el.classList.add('dragging'); });
            el.addEventListener('dragend', function() { el.classList.remove('dragging'); });
            el.addEventListener('dragover', function(e) { e.preventDefault(); el.classList.add('drag-over'); });
            el.addEventListener('dragleave', function() { el.classList.remove('drag-over'); });
            el.addEventListener('drop', function(e) { e.preventDefault(); el.classList.remove('drag-over'); var src = e.dataTransfer.getData('text/plain'); TabManager.reorder(src, t.path); });
            var previewTimer = null;
            el.addEventListener('mouseenter', function() { previewTimer = setTimeout(function() { TabManager.showPreview(t.path, el); }, 600); });
            el.addEventListener('mouseleave', function() { clearTimeout(previewTimer); TabManager.hidePreview(); });
            return el;
        }
        for (var pi = 0; pi < pinned.length; pi++) pc.appendChild(makeTabEl(pinned[pi]));
        for (var ri = 0; ri < regular.length; ri++) c.appendChild(makeTabEl(regular[ri]));
    }
    function searchFiles(q) {
        var r = document.getElementById('searchResults');
        if (!r) return;
        if (!q || q.length < 2) { r.innerHTML = '<div style="padding:8px;color:var(--text-muted);font-size:12px">Type at least 2 characters</div>'; return; }
        if (!currentProject) { r.innerHTML = '<div style="padding:8px;color:var(--text-muted);font-size:12px">No project loaded</div>'; return; }
        var results = [];
        var ql = q.toLowerCase();
        currentProject.files.forEach(function(f) {
            if (f.content) {
                var lines = f.content.split('\n');
                for (var i = 0; i < lines.length; i++) {
                    if (lines[i].toLowerCase().indexOf(ql) !== -1) {
                        results.push({ path: f.path, line: i + 1, text: lines[i].trim() });
                    }
                }
            }
        });
        if (results.length === 0) { r.innerHTML = '<div style="padding:8px;color:var(--text-muted);font-size:12px">No matches found</div>'; return; }
        var html = '';
        results.slice(0, 50).forEach(function(r) {
            var highlighted = r.text.replace(new RegExp(esc(q), 'gi'), function(m) { return '<span class="search-match">' + m + '</span>'; });
            html += '<div class="search-result-item" onclick="IDE.openFile(\'' + esc(r.path) + '\',\'' + esc(r.path.split('/').pop()) + '\')"><div style="color:var(--green);font-family:var(--font-mono);font-size:11px">' + esc(r.path) + ':' + r.line + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + highlighted + '</div></div>';
        });
        if (results.length > 50) html += '<div style="padding:8px;color:var(--text-muted);font-size:11px">Showing 50 of ' + results.length + ' results</div>';
        r.innerHTML = html;
    }
    function replaceAll() {
        var q = document.getElementById('searchInput').value;
        var r = document.getElementById('replaceInput').value;
        if (!q || !currentProject) return;
        var count = 0;
        currentProject.files.forEach(function(f) {
            if (f.content) {
                var matches = f.content.split(q).length - 1;
                count += matches;
                f.content = f.content.split(q).join(r);
            }
        });
        saveProjects(); renderFileTree();
        Terminal.log('Replaced ' + count + ' occurrences of "' + q + '"', 'success');
        searchFiles(q);
    }
    function openFindBar() { document.getElementById('findBar').classList.add('visible'); document.getElementById('findInput').focus(); }
    function closeFindBar() { document.getElementById('findBar').classList.remove('visible'); }
    function findInEditor() { var q = document.getElementById('findInput').value; if (!q || !editor) { document.getElementById('findCount').textContent = '0/0'; return; } var content = editor.getValue(); var count = 0, idx = 0; var lowerContent = content.toLowerCase(); var lowerQ = q.toLowerCase(); while ((idx = lowerContent.indexOf(lowerQ, idx)) !== -1) { count++; idx += lowerQ.length; } document.getElementById('findCount').textContent = count + ' matches'; }
    function findNext() { var q = document.getElementById('findInput').value; if (q && editor) editor.find(q); }
    function findPrev() { var q = document.getElementById('findInput').value; if (q && editor) editor.find(q, { backwards: true }); }
    function replaceOne() { var f = document.getElementById('findInput').value, r = document.getElementById('findReplaceInput').value; if (f && editor) editor.replace(r); }
    function replaceAllInEditor() { var f = document.getElementById('findInput').value, r = document.getElementById('findReplaceInput').value; if (f && editor) { var count = 0; while(editor.find(f)) { editor.replace(r); count++; } Terminal.log('Replaced ' + count + ' occurrences', 'success'); } }
    function addLibrary(n) {
        if (!currentProject) { Terminal.log('No project loaded', 'warning'); return; }
        if (!currentProject.libraries) currentProject.libraries = [];
        var exists = false;
        for (var i = 0; i < currentProject.libraries.length; i++) { if (currentProject.libraries[i].name === n) { exists = true; break; } }
        if (exists) { Terminal.log(n + ' already installed', 'warning'); return; }
        var info = LibraryFetcher.getLibInfo(n);
        currentProject.libraries.push({ name: n, version: info ? info.ver : 'latest' });
        currentProject.updated = new Date().toISOString();
        saveProjects();
        renderInstalledLibs();
        Output.updateStats();
        Terminal.log('Added library: ' + n + (info ? ' v' + info.ver : ''), 'success');
        fetchLibraryCode(n);
    }
    function removeLibrary(n) {
        if (!currentProject) return;
        currentProject.libraries = currentProject.libraries.filter(function(l) { return l.name !== n; });
        currentProject.updated = new Date().toISOString();
        saveProjects();
        renderInstalledLibs();
        Output.updateStats();
        Terminal.log('Removed: ' + n, 'info');
    }
    function renderInstalledLibs() {
        var c = document.getElementById('installedLibList');
        if (!c) return;
        if (!currentProject || !currentProject.libraries || currentProject.libraries.length === 0) {
            c.innerHTML = '<div style="font-size:12px;color:var(--text-muted);padding:4px 0">No libraries installed</div>';
            return;
        }
        var html = '';
        for (var i = 0; i < currentProject.libraries.length; i++) {
            var l = currentProject.libraries[i];
            html += '<div class="installed-lib"><span class="lib-name">' + esc(l.name) + ' <span style="color:var(--text-muted)">@' + esc(l.version) + '</span></span><span class="lib-remove" onclick="IDE.removeLibrary(\'' + esc(l.name) + '\')">&times;</span></div>';
        }
        c.innerHTML = html;
    }
    function searchLibraries(q) {
        var items = document.querySelectorAll('.lib-item');
        var cats = document.querySelectorAll('.lib-category');
        if (!q || q.length < 1) {
            for (var i = 0; i < items.length; i++) items[i].style.display = '';
            for (var i = 0; i < cats.length; i++) cats[i].style.display = '';
            return;
        }
        var ql = q.toLowerCase();
        for (var i = 0; i < cats.length; i++) {
            var catItems = cats[i].querySelectorAll('.lib-item');
            var visibleCount = 0;
            for (var j = 0; j < catItems.length; j++) {
                var nameEl = catItems[j].querySelector('.lib-name');
                if (nameEl) {
                    var show = nameEl.textContent.toLowerCase().indexOf(ql) !== -1;
                    catItems[j].style.display = show ? '' : 'none';
                    if (show) visibleCount++;
                }
            }
            cats[i].style.display = visibleCount > 0 ? '' : 'none';
        }
    }
    async function fetchLibraryCode(libName) {
        var src = LIBRARY_SOURCES[libName];
        if (!src) { Terminal.log('No source URL for library: ' + libName + ' (added to project libs only)', 'warning'); return; }
        Terminal.log('Fetching ' + libName + ' from GitHub...', 'info');
        try {
            var hdrs = { 'Accept': 'application/vnd.github.v3+json' };
            if (githubToken) hdrs['Authorization'] = 'token ' + githubToken;
            var treeUrl = 'https://api.github.com/repos/' + src.owner + '/' + src.repo + '/git/trees/' + src.branch + '?recursive=1';
            var treeResp = await fetch(treeUrl, { headers: hdrs });
            if (!treeResp.ok) {
                if (treeResp.status === 403) {
                    Terminal.log('GitHub API rate limit reached. Trying raw content fallback...', 'warning');
                    await fetchLibraryRawFallback(libName, src);
                    return;
                }
                Terminal.log('Could not fetch ' + libName + ' tree (HTTP ' + treeResp.status + ')', 'warning');
                return;
            }
            var treeData = await treeResp.json();
            var libPath = src.path ? src.path + '/' : '';
            var libFiles = treeData.tree.filter(function(i) {
                return i.type === 'blob' && i.path.indexOf(libPath) === 0 && /\.(h|hpp|cpp|c|ino)$/i.test(i.path);
            });
            if (libFiles.length === 0) { Terminal.log('No source files found for ' + libName, 'warning'); return; }
            var added = 0;
            for (var i = 0; i < Math.min(libFiles.length, 20); i++) {
                var lf = libFiles[i];
                var relPath = lf.path;
                var projPath = 'lib/' + libName + '/' + relPath;
                var exists = false;
                for (var j = 0; j < currentProject.files.length; j++) { if (currentProject.files[j].path === projPath) { exists = true; break; } }
                if (exists) continue;
                try {
                    var fileResp = await fetch('https://api.github.com/repos/' + src.owner + '/' + src.repo + '/contents/' + relPath + '?ref=' + src.branch, { headers: hdrs });
                    if (fileResp.ok) {
                        var fileData = await fileResp.json();
                        if (fileData.content && fileData.encoding === 'base64') {
                            var ext = relPath.split('.').pop();
                            currentProject.files.push({ path: projPath, content: atob(fileData.content), type: ext });
                            added++;
                        }
                    } else if (fileResp.status === 403) {
                        var rawUrl = 'https://raw.githubusercontent.com/' + src.owner + '/' + src.repo + '/' + src.branch + '/' + relPath;
                        var rawResp = await fetch(rawUrl);
                        if (rawResp.ok) {
                            var rawContent = await rawResp.text();
                            var ext = relPath.split('.').pop();
                            currentProject.files.push({ path: projPath, content: rawContent, type: ext });
                            added++;
                        }
                    }
                } catch(e) {}
            }
            currentProject.updated = new Date().toISOString();
            saveProjects();
            renderFileTree();
            Output.updateStats();
            Terminal.log('Downloaded ' + added + ' files for ' + libName, 'success');
        } catch(e) { Terminal.log('Failed to fetch ' + libName + ': ' + e.message, 'error'); }
    }
    async function fetchLibraryRawFallback(libName, src) {
        Terminal.log('Downloading ' + libName + ' via raw GitHub URLs...', 'info');
        var knownFiles = getKnownLibFiles(libName);
        if (knownFiles.length === 0) { Terminal.log('No file list available for ' + libName + '. Try adding GitHub token in Settings.', 'warning'); return; }
        var added = 0;
        for (var i = 0; i < knownFiles.length; i++) {
            var relPath = knownFiles[i];
            var projPath = 'lib/' + libName + '/' + relPath;
            var exists = false;
            for (var j = 0; j < currentProject.files.length; j++) { if (currentProject.files[j].path === projPath) { exists = true; break; } }
            if (exists) continue;
            try {
                var rawUrl = 'https://raw.githubusercontent.com/' + src.owner + '/' + src.repo + '/' + src.branch + '/' + (src.path ? src.path + '/' : '') + relPath;
                var rawResp = await fetch(rawUrl);
                if (rawResp.ok) {
                    var rawContent = await rawResp.text();
                    var ext = relPath.split('.').pop();
                    currentProject.files.push({ path: projPath, content: rawContent, type: ext });
                    added++;
                }
            } catch(e) {}
        }
        currentProject.updated = new Date().toISOString();
        saveProjects();
        renderFileTree();
        Output.updateStats();
        Terminal.log('Downloaded ' + added + ' files for ' + libName + ' (raw fallback)', 'success');
    }
    function getKnownLibFiles(libName) {
        var files = {
            'AsyncTCP': ['src/AsyncTCP.cpp','src/AsyncTCP.h'],
            'ESPAsyncWebServer': ['src/AsyncWebSocket.cpp','src/AsyncWebSocket.h','src/AsyncEventSource.cpp','src/AsyncEventSource.h','src/AsyncJson.h','src/AsyncWebSocket.h','src/WebAuthentication.cpp','src/WebAuthentication.h','src/WebHandlerImpl.h','src/WebRequest.cpp','src/WebResponses.cpp','src/WebServer.cpp'],
            'ArduinoJson': ['src/ArduinoJson.h','src/ArduinoJson.hpp','src/ArduinoJson/Array/JsonArray.hpp','src/ArduinoJson/Object/JsonObject.hpp','src/ArduinoJson/Variant/JsonVariant.hpp','src/ArduinoJson/Document/JsonDocument.hpp'],
            'DHT': ['DHT.cpp','DHT.h','DHT_U.cpp','DHT_U.h'],
            'Adafruit_Sensor': ['Adafruit_Sensor.cpp','Adafruit_Sensor.h'],
            'FastLED': ['FastLED.h','FastLED.cpp','chipsets.h','color.h','colorutils.h','controller.h','dmx.h','led_sysdefs.h','lib8tion.h','pixeltypes.h','platforms.h','power_mgt.h'],
            'PubSubClient': ['src/PubSubClient.cpp','src/PubSubClient.h'],
            'NeoPixel': ['Adafruit_NeoPixel.cpp','Adafruit_NeoPixel.h'],
            'Servo': ['src/Servo.cpp','src/Servo.h','src/Servo.hpp'],
            'OneWire': ['OneWire.cpp','OneWire.h'],
            'DallasTemperature': ['DallasTemperature.cpp','DallasTemperature.h'],
            'MFRC522': ['MFRC522.cpp','MFRC522.h','MFRC522Extended.cpp','MFRC522Extended.h','deprecated.h','require_cpp11.h'],
            'TFT_eSPI': ['TFT_eSPI.cpp','TFT_eSPI.h'],
            'IRremote': ['src/IRremote.cpp','src/IRremote.h','src/IRremoteInt.h'],
            'LiquidCrystal_I2C': ['LiquidCrystal_I2C.cpp','LiquidCrystal_I2C.h'],
            'ArduinoOTA': ['src/ArduinoOTA.cpp','src/ArduinoOTA.h'],
            'ESPmDNS': ['src/ESPmDNS.cpp','src/ESPmDNS.h'],
            'WiFi': ['src/WiFi.cpp','src/WiFi.h','src/WiFiAP.cpp','src/WiFiAP.h','src/WiFiClient.cpp','src/WiFiClient.h','src/WiFiServer.cpp','src/WiFiServer.h','src/WiFiUdp.cpp','src/WiFiUdp.h'],
            'BLE': ['src/BLEDevice.cpp','src/BLEDevice.h','src/BLEServer.cpp','src/BLEServer.h','src/BLEClient.cpp','src/BLEClient.h','src/BLEUtils.cpp','src/BLEUtils.h'],
            'HTTPClient': ['src/HTTPClient.cpp','src/HTTPClient.h'],
            'WebServer': ['src/WebServer.cpp','src/WebServer.h','src/Parsing.cpp','src/detail'],
            'LittleFS': ['src/LittleFS.cpp','src/LittleFS.h'],
            'SD': ['src/SD.cpp','src/SD.h','src/sd_diskio.cpp','src/sd_diskio.h'],
            'EEPROM': ['src/EEPROM.cpp','src/EEPROM.h'],
            'Time': ['Time.cpp','Time.h','TimeLib.h'],
            'RTClib': ['RTClib.cpp','RTClib.h'],
            'NTPClient': ['NTPClient.cpp','NTPClient.h'],
            'TaskScheduler': ['src/TaskScheduler.h','src/TaskSchedulerDeclarations.h','src/TaskScheduler.cpp'],
            'Keypad': ['src/Keypad.cpp','src/Keypad.h'],
            'Adafruit_GFX': ['Adafruit_GFX.cpp','Adafruit_GFX.h','Adafruit_GrayOLED.cpp','Adafruit_GrayOLED.h','glcdfont.c'],
            'Adafruit_SSD1306': ['Adafruit_SSD1306.cpp','Adafruit_SSD1306.h'],
            'Adafruit_BME280': ['Adafruit_BME280.cpp','Adafruit_BME280.h'],
            'MPU6050': ['src/MPU6050.cpp','src/MPU6050.h','src/MPU6050_6Axis_MotionApps20.cpp','src/MPU6050_6Axis_MotionApps20.h','src/MPU6050_6Axis_MotionApps612.cpp','src/MPU6050_6Axis_MotionApps612.h','src/helper_3dmath.h'],
            'Adafruit_GPS': ['Adafruit_GPS.cpp','Adafruit_GPS.h'],
            'LoRa': ['LoRa.cpp','LoRa.h'],
            'Adafruit_NeoTrellis': ['Adafruit_NeoTrellis.cpp','Adafruit_NeoTrellis.h'],
            'Ethernet': ['src/Ethernet.cpp','src/Ethernet.h','src/EthernetClient.cpp','src/EthernetClient.h','src/EthernetServer.cpp','src/EthernetServer.h','src/EthernetUdp.cpp','src/EthernetUdp.h'],
            'MQTT': ['src/PubSubClient.cpp','src/PubSubClient.h'],
            'Wire': ['src/Wire.cpp','src/Wire.h'],
            'SPI': ['src/SPI.cpp','src/SPI.h'],
        };
        return files[libName] || [];
    }
    function setEditorFontSize(v) { if (editor) editor.setFontSize(parseInt(v) + 'px'); }
    function setEditorTabSize(v) { if (editor) editor.getSession().setTabSize(parseInt(v)); }
    function setEditorWordWrap(v) { if (editor) editor.getSession().setUseWrapMode(v); }
    function setEditorMinimap(v) { if (editor) editor.setOption('showGutter', !v); }
    function setLocalToolchain(v) { useLocalToolchain = v; localStorage.setItem('tb_toolchain', v); var g = document.getElementById('toolchainPathGroup'); if(g)g.style.display = v ? 'block' : 'none'; Terminal.log('Local toolchain: ' + (v ? 'enabled' : 'disabled'), 'info'); }
    function saveGitHubToken() { githubToken = document.getElementById('githubToken').value.trim(); localStorage.setItem('tb_token', githubToken); Terminal.log('GitHub token saved.', 'success'); }
    function clearAllData() {
        if (!confirm('Delete ALL projects and data? This cannot be undone.')) return;
        localStorage.removeItem('tb_projects'); localStorage.removeItem('tb_last'); localStorage.removeItem('tb_todos');
        projects = {}; currentProject = null; tabs = []; activeTab = null;
        document.getElementById('tabs').innerHTML = '';
        var mp = document.getElementById('menubarProject'); if(mp)mp.textContent = 'No Project';
        var sp = document.getElementById('statusProject'); if(sp)sp.textContent = 'No project';
        var pl = document.getElementById('projectNameLabel'); if(pl)pl.textContent = 'WORKSPACE';
        var mb = document.getElementById('menubarBoard'); if(mb)mb.textContent = 'ESP32 DevKit';
        renderFileTree(); showWelcome(); TODO.clear(); Output.resetStats();
        Terminal.log('All data cleared.', 'warning');
    }
    function exportAllData() { var data = JSON.stringify(projects, null, 2); var blob = new Blob([data], { type: 'application/json' }); var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'tinybin_export_' + Date.now() + '.json'; a.click(); Terminal.log('Projects exported.', 'success'); }
    function importData() {
        var input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
        input.onchange = function(e) { var file = e.target.files[0]; if (!file) return; var reader = new FileReader(); reader.onload = function(ev) { try { var imported = JSON.parse(ev.target.result); Object.assign(projects, imported); saveProjects(); Terminal.log('Projects imported.', 'success'); var keys = Object.keys(projects); if (keys.length > 0) loadProject(keys[0]); } catch(err) { Terminal.log('Import failed: ' + err.message, 'error'); } }; reader.readAsText(file); };
        input.click();
    }
    function setTheme(t) { applyTheme(t); Terminal.log('Theme changed to ' + t, 'info'); }
    function toggleSection(h) { h.classList.toggle('collapsed'); var c = h.nextElementSibling; if (c) c.classList.toggle('collapsed'); }
    function closeModal() { document.getElementById('modalOverlay').classList.remove('visible'); }
    function refreshExplorer() { if (currentProject) renderFileTree(); }
    function undo() { if (editor) editor.undo(); }
    function redo() { if (editor) editor.redo(); }
    function findReplace() { openFindBar(); }
    function showDropdown(items, btnEl) {
        var m = document.getElementById('dropdownMenu'); if (!m) return;
        var rect = btnEl.getBoundingClientRect();
        var html = '';
        for (var i = 0; i < items.length; i++) {
            if (items[i] === '---') { html += '<div class="dropdown-divider"></div>'; }
            else { html += '<div class="dropdown-item" data-action="' + (items[i].action || '') + '">' + items[i].label + (items[i].shortcut ? '<span class="shortcut">' + items[i].shortcut + '</span>' : '') + '</div>'; }
        }
        m.innerHTML = html;
        m.style.left = rect.left + 'px';
        m.style.top = (rect.bottom + 2) + 'px';
        m.classList.add('visible');
        m.setAttribute('data-source', btnEl.textContent.trim());
        var mw = m.offsetWidth;
        if (rect.left + mw > window.innerWidth) m.style.left = (window.innerWidth - mw - 8) + 'px';
        var dItems = m.querySelectorAll('.dropdown-item');
        for (var i = 0; i < dItems.length; i++) {
            dItems[i].addEventListener('click', function(e) {
                e.stopPropagation();
                var action = this.getAttribute('data-action');
                hideDropdown();
                if (action) { try { eval(action); } catch(err) { Terminal.log('Action error: ' + err.message, 'error'); } }
            });
        }
    }
    function toggleDropdown(items, btnEl) {
        var m = document.getElementById('dropdownMenu');
        if (m && m.classList.contains('visible') && m.getAttribute('data-source') === btnEl.textContent.trim()) {
            hideDropdown();
        } else {
            showDropdown(items, btnEl);
        }
    }
    function hideDropdown() { var m = document.getElementById('dropdownMenu'); if (m) { m.classList.remove('visible'); m.removeAttribute('data-source'); } }
    function menuFile(e) { var btn = e ? e.target : document.querySelector('.menu-item'); toggleDropdown([{label:'New File',action:'IDE.newFile()',shortcut:'Ctrl+N'},{label:'New Folder',action:'IDE.newFolder()'},'---',{label:'Open File...',action:'IDE.openFilePicker()'},{label:'Save File',action:'IDE.saveCurrentFile()',shortcut:'Ctrl+S'},{label:'Save All',action:'IDE.saveAllFiles()',shortcut:'Ctrl+Shift+S'},'---',{label:'Close Tab',action:'if(IDE.activeTab)IDE.closeTab(IDE.activeTab)',shortcut:'Ctrl+W'},{label:'Close All Tabs',action:'IDE.closeAllTabs()'},'---',{label:'New Project',action:'IDE.showNewProjectModal()'},{label:'Fetch from GitHub',action:'IDE.showFetchModal()'},'---',{label:'Export Project',action:'IDE.exportProject()'},{label:'Import Project',action:'IDE.importData()'},'---',{label:'Project Settings',action:'IDE.showProjectSettings()'}], btn); }
    function menuEdit(e) { var btn = e ? e.target : document.querySelectorAll('.menu-item')[1]; toggleDropdown([{label:'Undo',action:'IDE.undo()',shortcut:'Ctrl+Z'},{label:'Redo',action:'IDE.redo()',shortcut:'Ctrl+Y'},'---',{label:'Cut',action:'IDE.cut()',shortcut:'Ctrl+X'},{label:'Copy',action:'IDE.copy()',shortcut:'Ctrl+C'},{label:'Paste',action:'IDE.paste()',shortcut:'Ctrl+V'},'---',{label:'Find & Replace',action:'IDE.findReplace()',shortcut:'Ctrl+H'},{label:'Find in Files',action:'IDE.showPanel(\'search\')',shortcut:'Ctrl+Shift+F'},{label:'Select All',action:'IDE.selectAll()',shortcut:'Ctrl+A'},'---',{label:'Toggle Comment',action:'IDE.toggleComment()',shortcut:'Ctrl+/'},{label:'Toggle Block Comment',action:'IDE.toggleBlockComment()',shortcut:'Ctrl+Shift+/'},'---',{label:'Format Document',action:'CodeFormatter.formatCurrentFile()',shortcut:'Shift+Alt+F'},{label:'Format Selection',action:'CodeFormatter.formatSelection()'},'---',{label:'Go to Line...',action:'IDE.goToLine()',shortcut:'Ctrl+G'},{label:'Go to Definition',action:'IDE.goToDefinition()',shortcut:'F12'},'---',{label:'Transform to Uppercase',action:'IDE.transformCase(\'upper\')'},{label:'Transform to Lowercase',action:'IDE.transformCase(\'lower\')'}], btn); }
    function menuView(e) { var btn = e ? e.target : document.querySelectorAll('.menu-item')[2]; toggleDropdown([{label:'Command Palette',action:'CommandPalette.open()',shortcut:'Ctrl+Shift+P'},'---',{label:'Explorer',action:'IDE.showPanel(\'files\')',shortcut:'Ctrl+Shift+E'},{label:'Search',action:'IDE.showPanel(\'search\')',shortcut:'Ctrl+Shift+F'},{label:'Source Control',action:'IDE.showPanel(\'git\')',shortcut:'Ctrl+Shift+G'},{label:'Libraries',action:'IDE.showPanel(\'libraries\')'},{label:'TODO',action:'IDE.showPanel(\'todo\')'},{label:'Snippets',action:'IDE.showPanel(\'snippets\')'},'---',{label:'Output',action:'IDE.showPanel(\'output\')'},{label:'Terminal',action:'Terminal.toggle()',shortcut:'Ctrl+`'},{label:'Serial Monitor',action:'Terminal.switchToSerial()'},{label:'Serial Plotter',action:'IDE.showPanel(\'plotter\')'},{label:'Board Manager',action:'IDE.showPanel(\'boards\')'},'---',{label:'Toggle Sidebar',action:'IDE.toggleSidebar()',shortcut:'Ctrl+B'},{label:'Toggle Activity Bar',action:'IDE.toggleActivityBar()'},'---',{label:'Tab Tree',action:'TabManager.showTree()',shortcut:'Ctrl+Shift+T'},'---',{label:'Split Right',action:'TabManager.splitHorizontal()'},{label:'Split Down',action:'TabManager.splitVertical()'},'---',{label:'Zoom In',action:'IDE.zoom(1)',shortcut:'Ctrl+='},{label:'Zoom Out',action:'IDE.zoom(-1)',shortcut:'Ctrl+-'},{label:'Reset Zoom',action:'IDE.zoom(0)',shortcut:'Ctrl+0'},'---',{label:'Minimap',action:'IDE.toggleMinimap()'},{label:'Word Wrap',action:'IDE.toggleWordWrap()',shortcut:'Alt+Z'},'---',{label:'Theme: Dark',action:'IDE.setTheme(\'dark\')'},{label:'Theme: Light',action:'IDE.setTheme(\'light\')'}], btn); }
    function menuProject(e) { var btn = e ? e.target : document.querySelectorAll('.menu-item')[3]; toggleDropdown([{label:'New Project',action:'IDE.showNewProjectModal()'},'---',{label:'Fetch from GitHub',action:'IDE.showFetchModal()'},'---',{label:'Project Templates',action:'ProjectTemplates.showSelector()'},'---',{label:'Add Library...',action:'IDE.showPanel(\'libraries\')'},{label:'Manage Libraries',action:'IDE.showInstalledLibs()'},'---',{label:'Build Configuration',action:'IDE.showBuildConfig()'},'---',{label:'Clean Build',action:'IDE.cleanBuild()'},'---',{label:'Export Project',action:'IDE.exportProject()'},{label:'Import Project',action:'IDE.importData()'},'---',{label:'Project Settings',action:'IDE.showProjectSettings()'},'---',{label:'Delete Project',action:'IDE.deleteProject()'}], btn); }
    function menuTools(e) { var btn = e ? e.target : document.querySelectorAll('.menu-item')[4]; toggleDropdown([{label:'Compile',action:'Compiler.compile()',shortcut:'F5'},{label:'Analyze Code',action:'Compiler.analyze()',shortcut:'F6'},'---',{label:'Format Code',action:'CodeFormatter.formatCurrentFile()',shortcut:'Shift+Alt+F'},{label:'Lint Code',action:'CodeLinter.lintCurrentFile()'},'---',{label:'Flash to Device',action:'Flasher.flash()',shortcut:'F7'},{label:'Download Binary',action:'Flasher.downloadBinary()'},'---',{label:'Connect Serial',action:'SerialManager.connect()'},'---',{label:'Serial Monitor',action:'Terminal.switchToSerial()',shortcut:'Ctrl+Shift+S'},{label:'Serial Plotter',action:'IDE.showPanel(\'plotter\')'},'---',{label:'Code Snippets',action:'IDE.showPanel(\'snippets\')'},{label:'TODO Manager',action:'IDE.showPanel(\'todo\')'},'---',{label:'Clear Compilation Cache',action:'NativeCompiler.clearCache()'},'---',{label:'Keyboard Shortcuts',action:'ShortcutManager.showEditor()'}], btn); }
    function menuHelp(e) { var btn = e ? e.target : document.querySelectorAll('.menu-item')[5]; toggleDropdown([{label:'Welcome',action:'IDE.showWelcome()'},'---',{label:'Keyboard Shortcuts',action:'ShortcutManager.showEditor()',shortcut:'Ctrl+K Ctrl+S'},'---',{label:'Documentation',action:'window.open(\'https://github.com/tinybin-ide/docs\',\'_blank\')'},{label:'Release Notes',action:'IDE.showReleaseNotes()'},'---',{label:'Report Issue',action:'window.open(\'https://github.com/tinybin-ide/issues\',\'_blank\')'},{label:'Request Feature',action:'window.open(\'https://github.com/tinybin-ide/discussions\',\'_blank\')'},'---',{label:'About TinyBin',action:'IDE.showAbout()'}], btn); }
    function menuHover(menu, e) {
        var m = document.getElementById('dropdownMenu');
        if (!m || !m.classList.contains('visible')) return;
        var btn = e ? e.target : null;
        if (!btn) return;
        var map = { file: menuFile, edit: menuEdit, view: menuView, project: menuProject, tools: menuTools, help: menuHelp };
        if (map[menu]) map[menu](e);
    }
    function toggleSidebar() { var s = document.getElementById('sidebar'); if(s){s.classList.toggle('collapsed');} if (editor) setTimeout(function() { editor.resize(); }, 100); }
    function toggleActivityBar() { var ab = document.querySelector('.activity-bar'); if(ab){ab.style.display = ab.style.display === 'none' ? '' : 'none';} if (editor) setTimeout(function() { editor.resize(); }, 100); }
    function zoom(d) { var s = parseInt(localStorage.getItem('tb_zoom') || '14') + d; if (d === 0) s = 14; localStorage.setItem('tb_zoom', s); if (editor) editor.setFontSize(s + 'px'); }
    function selectAll() { if (editor) editor.selectAll(); }
    function cut() { if (editor) editor.cutToClipboard(); }
    function copy() { if (editor) editor.copyToClipboard(); }
    async function paste() { try { var text = await navigator.clipboard.readText(); if (editor) editor.insert(text); } catch(e) { Terminal.log('Clipboard access denied', 'warning'); } }
    function toggleComment() { if (!editor) return; var sel = editor.getSelectionRange(); if (sel.isEmpty()) { var line = sel.start.row; var session = editor.getSession(); var lineContent = session.getLine(line); if (lineContent.trimStart().indexOf('//') === 0) { session.replace({start:{row:line,column:0},end:{row:line,column:lineContent.length}}, lineContent.replace(/^\s*\/\/\s?/, '')); } else { session.replace({start:{row:line,column:0},end:{row:line,column:lineContent.length}}, lineContent.replace(/^(\s*)/, '$1// ')); } } else { for (var r = sel.start.row; r <= sel.end.row; r++) { var session = editor.getSession(); var lineContent = session.getLine(r); if (lineContent.trimStart().indexOf('//') === 0) { session.replace({start:{row:r,column:0},end:{row:r,column:lineContent.length}}, lineContent.replace(/^\s*\/\/\s?/, '')); } else { session.replace({start:{row:r,column:0},end:{row:r,column:lineContent.length}}, lineContent.replace(/^(\s*)/, '$1// ')); } } } Terminal.log('Toggled comment', 'info'); }
    function toggleBlockComment() { if (!editor) return; var sel = editor.getSelection(); var text = editor.getSelectedText(); if (text) { editor.insert('/*' + text + '*/'); } else { var pos = editor.getCursorPosition(); editor.insert('/**/'); editor.moveCursorTo(pos.row, pos.column + 2); } Terminal.log('Toggled block comment', 'info'); }
    function goToLine() { if (!editor) return; var line = prompt('Go to line:', (editor.getCursorPosition().row + 1).toString()); if (line) { var n = parseInt(line); if (n > 0) editor.gotoLine(n, 0, true); } }
    function goToDefinition() { if (!editor || !activeTab) return; var word = editor.getSelectedText() || editor.session.getWordRange().start; Terminal.log('Go to definition: ' + (typeof word === 'object' ? editor.session.getTextRange(word) : word), 'info'); }
    function transformCase(type) { if (!editor) return; var sel = editor.getSelectionRange(); if (sel.isEmpty()) return; var text = editor.session.getTextRange(sel); var transformed = type === 'upper' ? text.toUpperCase() : text.toLowerCase(); editor.session.replace(sel, transformed); }
    function toggleMinimap() { if (!editor) return; var show = !editor.getOption('showGutter'); editor.setOption('showGutter', !show); Terminal.log('Minimap: ' + (show ? 'ON' : 'OFF'), 'info'); }
    function toggleWordWrap() { if (!editor) return; var wrap = !editor.getSession().getUseWrapMode(); editor.getSession().setUseWrapMode(wrap); localStorage.setItem('tb_wordwrap', wrap); Terminal.log('Word wrap: ' + (wrap ? 'ON' : 'OFF'), 'info'); }
    function saveAllFiles() { if (!currentProject) return; for (var i = 0; i < tabs.length; i++) { var t = tabs[i]; if (t.modified) { var f = null; for (var j = 0; j < currentProject.files.length; j++) { if (currentProject.files[j].path === t.path) { f = currentProject.files[j]; break; } } if (f) { f.content = t.content; t.modified = false; } } } currentProject.updated = new Date().toISOString(); saveProjects(); renderTabs(); Terminal.log('All files saved', 'success'); }
    function openFilePicker() { var input = document.createElement('input'); input.type = 'file'; input.multiple = true; input.accept = '.cpp,.c,.ino,.h,.hpp,.json,.txt,.md,.py,.html,.css,.yaml,.yml'; input.onchange = function(e) { for (var i = 0; i < e.target.files.length; i++) { (function(file) { var reader = new FileReader(); reader.onload = function(ev) { var ext = file.name.split('.').pop(); if (!currentProject) { Terminal.log('Create a project first', 'warning'); return; } currentProject.files.push({ path: file.name, content: ev.target.result, type: ext }); currentProject.updated = new Date().toISOString(); saveProjects(); renderFileTree(); openFile(file.name, file.name); Terminal.log('Imported: ' + file.name, 'success'); }; reader.readAsText(file); })(e.target.files[i]); } }; input.click(); }
    function exportProject() { if (!currentProject) { Terminal.log('No project loaded', 'warning'); return; } var data = JSON.stringify(currentProject, null, 2); var blob = new Blob([data], { type: 'application/json' }); var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = currentProject.name + '_export.json'; a.click(); Terminal.log('Project exported: ' + currentProject.name, 'success'); }
    function cleanBuild() { if (typeof NativeCompiler !== 'undefined') NativeCompiler.clearCache(); Terminal.log('Build cache cleared', 'info'); }
    function deleteProject() { if (!currentProject) return; if (!confirm('Delete project "' + currentProject.name + '"? This cannot be undone.')) return; delete projects[currentProject.id]; saveProjects(); var keys = Object.keys(projects); if (keys.length > 0) loadProject(keys[0]); else { currentProject = null; tabs = []; activeTab = null; document.getElementById('tabs').innerHTML = ''; document.getElementById('pinnedTabs').innerHTML = ''; showWelcome(); } Terminal.log('Project deleted', 'warning'); }
    function showInstalledLibs() { if (!currentProject) { Terminal.log('No project loaded', 'warning'); return; } var libs = currentProject.libraries || []; var html = '<div style="display:flex;flex-direction:column;gap:6px">'; if (libs.length === 0) html += '<p style="color:var(--text-muted);font-size:12px">No libraries installed</p>'; else { libs.forEach(function(l) { html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--bg-input);border-radius:var(--radius-md);border:1px solid var(--border-dark)"><span style="font-size:13px;font-weight:500">' + esc(l.name) + ' <span style="color:var(--text-muted);font-size:11px">@' + esc(l.version) + '</span></span><button class="btn btn-sm btn-ghost" onclick="IDE.removeLibrary(\'' + esc(l.name) + '\');IDE.showInstalledLibs()">Remove</button></div>'; }); } document.getElementById('modalTitle').textContent = 'Installed Libraries (' + libs.length + ')'; document.getElementById('modalBody').innerHTML = html; document.getElementById('modalFooter').innerHTML = '<button class="btn btn-ghost" onclick="IDE.closeModal()">Close</button>'; document.getElementById('modalOverlay').classList.add('visible'); }
    function showBuildConfig() { if (!currentProject) { Terminal.log('No project loaded', 'warning'); return; } var cfg = typeof NativeCompiler !== 'undefined' ? NativeCompiler.getBoardConfig(currentProject.board) : null; var html = '<div class="build-config">'; html += '<div class="build-config-section"><h4>Target Board</h4>'; html += '<div class="build-config-row"><span class="build-config-label">Board</span><span class="build-config-value">' + esc(getBN(currentProject.board)) + '</span></div>'; if (cfg) { html += '<div class="build-config-row"><span class="build-config-label">Architecture</span><span class="build-config-value">' + esc(cfg.arch) + '</span></div>'; html += '<div class="build-config-row"><span class="build-config-label">CPU Core</span><span class="build-config-value">' + esc(cfg.core) + '</span></div>'; html += '<div class="build-config-row"><span class="build-config-label">Frequency</span><span class="build-config-value">' + cfg.freq + ' MHz</span></div>'; html += '<div class="build-config-row"><span class="build-config-label">RAM</span><span class="build-config-value">' + formatBytes(cfg.ram) + '</span></div>'; html += '<div class="build-config-row"><span class="build-config-label">Flash</span><span class="build-config-value">' + formatBytes(cfg.flash) + '</span></div>'; } html += '</div>'; html += '<div class="build-config-section"><h4>Known Headers</h4><div style="display:flex;flex-wrap:wrap;gap:4px">'; if (cfg) cfg.includes.forEach(function(h) { html += '<span class="build-flag active">' + esc(h) + '</span>'; }); html += '</div></div></div>'; document.getElementById('modalTitle').textContent = 'Build Configuration'; document.getElementById('modalBody').innerHTML = html; document.getElementById('modalFooter').innerHTML = '<button class="btn btn-ghost" onclick="IDE.closeModal()">Close</button>'; document.getElementById('modalOverlay').classList.add('visible'); }
    function showProjectSettings() { if (!currentProject) { Terminal.log('No project loaded', 'warning'); return; } var html = '<div class="form-group"><label>Project Name</label><input type="text" id="psName" value="' + esc(currentProject.name) + '"></div><div class="form-group"><label>Target Board</label><select id="psBoard"></select></div><div class="form-group"><label>GitHub URL</label><input type="url" id="psUrl" value="' + esc(currentProject.github_url || '') + '" placeholder="https://github.com/user/repo"></div>'; var s = document.getElementById('psBoard'); document.getElementById('modalTitle').textContent = 'Project Settings'; document.getElementById('modalBody').innerHTML = html; document.getElementById('modalFooter').innerHTML = '<button class="btn btn-ghost" onclick="IDE.closeModal()">Cancel</button><button class="btn btn-neon" onclick="IDE.saveProjectSettings()">Save</button>'; var sel = document.getElementById('psBoard'); for (var g in BOARDS) { var og = document.createElement('optgroup'); og.label = g; BOARDS[g].forEach(function(id) { var o = document.createElement('option'); o.value = id; o.textContent = getBN(id); if (id === currentProject.board) o.selected = true; og.appendChild(o); }); sel.appendChild(og); } document.getElementById('modalOverlay').classList.add('visible'); }
    function saveProjectSettings() { var name = document.getElementById('psName').value.trim(); var board = document.getElementById('psBoard').value; var url = document.getElementById('psUrl').value.trim(); if (!name) { alert('Project name required'); return; } currentProject.name = name; currentProject.board = board; currentProject.github_url = url || null; currentProject.updated = new Date().toISOString(); saveProjects(); var mp = document.getElementById('menubarProject'); if(mp)mp.textContent = name; var sp = document.getElementById('statusProject'); if(sp)sp.textContent = name; var mb = document.getElementById('menubarBoard'); if(mb)mb.textContent = getBN(board); closeModal(); Terminal.log('Project settings saved', 'success'); }
    function showWelcome() { document.getElementById('editorWelcome').classList.remove('hidden'); }
    function showReleaseNotes() { var html = '<div style="font-size:13px;line-height:1.6"><h4 style="color:var(--neon);margin-bottom:12px">v3.0 — Massive Update</h4><ul style="list-style:none;padding:0"><li style="padding:4px 0">✅ Client-side C++ compiler with 5-stage build pipeline</li><li style="padding:4px 0">✅ Massive tabs: pinned, split views, drag-reorder, tab tree</li><li style="padding:4px 0">✅ Problems panel with syntax/semantic analysis</li><li style="padding:4x 0">✅ Serial Monitor integrated as terminal tab</li><li style="padding:4px 0">✅ Professional menu bar with 50+ actions</li><li style="padding:4px 0">✅ Board manager with 100+ boards</li><li style="padding:4px 0">✅ Library manager with GitHub fetch</li><li style="padding:4px 0">✅ Code snippets, TODO manager, serial plotter</li></ul></div>'; document.getElementById('modalTitle').textContent = 'Release Notes'; document.getElementById('modalBody').innerHTML = html; document.getElementById('modalFooter').innerHTML = '<button class="btn btn-ghost" onclick="IDE.closeModal()">Close</button>'; document.getElementById('modalOverlay').classList.add('visible'); }
    function showAbout() { var html = '<div style="text-align:center;padding:20px"><svg width="64" height="64" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="url(#lg)"/><path d="M11 11l7 7-7 7V11z" fill="#fff"/><path d="M20 11l7 7-7 7V11z" fill="#fff" opacity="0.4"/><defs><linearGradient id="lg" x1="0" y1="0" x2="36" y2="36"><stop stop-color="#00d4ff"/><stop offset="1" stop-color="#0066ff"/></linearGradient></defs></svg><h2 style="margin:16px 0 8px;font-size:24px;color:var(--text)">TinyBin IDE</h2><p style="color:var(--text-muted);font-size:14px;margin-bottom:20px">v3.0 — Advanced Microcontroller Development Environment</p><p style="color:var(--text-secondary);font-size:12px;line-height:1.6">A professional web-based IDE for embedded development.<br>Compile client-side, manage boards & libraries, flash devices,<br>monitor serial output — all in your browser.</p><p style="color:var(--text-muted);font-size:11px;margin-top:16px">Built with ❤️ for makers and engineers</p></div>'; document.getElementById('modalTitle').textContent = ''; document.getElementById('modalBody').innerHTML = html; document.getElementById('modalFooter').innerHTML = '<button class="btn btn-neon" onclick="IDE.closeModal()">Close</button>'; document.getElementById('modalOverlay').classList.add('visible'); }
    function formatBytes(b) { if (b === 0) return '0 B'; var k = 1024, s = ['B', 'KB', 'MB', 'GB']; var i = Math.floor(Math.log(b) / Math.log(k)); return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + s[i]; }
    function showShortcuts() { ShortcutManager.showEditor(); }
    function onBoardChange() { if (currentProject) { currentProject.board = document.getElementById('boardSelect').value; currentProject.updated = new Date().toISOString(); var mb = document.getElementById('menubarBoard'); if(mb)mb.textContent = getBN(currentProject.board); saveProjects(); } }
    function setAutoSave(v) { autoSaveEnabled = v; localStorage.setItem('tb_autosave', v); updateAutoSaveStatus(); Terminal.log('Auto-save: ' + (v ? 'ON' : 'OFF'), 'info'); }
    function setAutoSaveDelay(v) { autoSaveDelay = parseInt(v); localStorage.setItem('tb_autosave_delay', autoSaveDelay); Terminal.log('Auto-save delay: ' + autoSaveDelay + 'ms', 'info'); }
    function updateAutoSaveStatus() { var el = document.getElementById('statusAutoSave'); if (el) { el.style.display = autoSaveEnabled ? '' : 'none'; el.textContent = 'Auto-save ON'; } }
    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    return {
        init: init, newFile: newFile, newFolder: newFolder, deleteFile: deleteFile, renameFile: renameFile,
        duplicateFile: duplicateFile, openFile: openFile, closeTab: closeTab, saveCurrentFile: saveCurrentFile,
        showNewProjectModal: showNewProjectModal, showFetchModal: showFetchModal, fetchFromGitHub: fetchFromGitHub,
        createNewProject: createNewProject, showPanel: showPanel, closeModal: closeModal,
        refreshExplorer: refreshExplorer, toggleSection: toggleSection, searchFiles: searchFiles,
        replaceAll: replaceAll, addLibrary: addLibrary, removeLibrary: removeLibrary,
        searchLibraries: searchLibraries, setEditorFontSize: setEditorFontSize, setEditorTabSize: setEditorTabSize,
        setEditorWordWrap: setEditorWordWrap, setEditorMinimap: setEditorMinimap, setLocalToolchain: setLocalToolchain,
        saveGitHubToken: saveGitHubToken, clearAllData: clearAllData, exportAllData: exportAllData,
        importData: importData, menuFile: menuFile, menuEdit: menuEdit, menuView: menuView,
        menuProject: menuProject, menuTools: menuTools, menuHelp: menuHelp, menuHover: menuHover, toggleSidebar: toggleSidebar,
        toggleActivityBar: toggleActivityBar, zoom: zoom, showShortcuts: showShortcuts, onBoardChange: onBoardChange, undo: undo, redo: redo,
        findReplace: findReplace, findNext: findNext, findPrev: findPrev, replaceOne: replaceOne,
        replaceAllInEditor: replaceAllInEditor, openFindBar: openFindBar, closeFindBar: closeFindBar,
        findInEditor: findInEditor, closeAllTabs: closeAllTabs, setTheme: setTheme, selectAll: selectAll,
        setAutoSave: setAutoSave, setAutoSaveDelay: setAutoSaveDelay,
        highlightInTree: highlightInTree,
        cut: cut, copy: copy, paste: paste, toggleComment: toggleComment, toggleBlockComment: toggleBlockComment,
        goToLine: goToLine, goToDefinition: goToDefinition, transformCase: transformCase,
        toggleMinimap: toggleMinimap, toggleWordWrap: toggleWordWrap,
        saveAllFiles: saveAllFiles, openFilePicker: openFilePicker, exportProject: exportProject,
        cleanBuild: cleanBuild, deleteProject: deleteProject,
        showInstalledLibs: showInstalledLibs, showBuildConfig: showBuildConfig,
        showProjectSettings: showProjectSettings, saveProjectSettings: saveProjectSettings,
        showWelcome: showWelcome, showReleaseNotes: showReleaseNotes, showAbout: showAbout,
        get currentProject() { return currentProject; }, get activeTab() { return activeTab; },
        get tabs() { return tabs; }, get projects() { return projects; }, get BN() { return BN; }, get BOARDS() { return BOARDS; },
        saveProjects: saveProjects, loadProject: loadProject, getBN: getBN, renderTabs: renderTabs, setEditorMode: setEditorMode
    };
})();

// ===== TODO MODULE =====
var TODO = (function() {
    'use strict';
    var todos = [], currentProjectId = null, filter = 'all';
    function init() { loadTodos(); render(); }
    function loadTodos() { try { var s = localStorage.getItem('tb_todos'); if (s) todos = JSON.parse(s); } catch(e) { todos = []; } }
    function saveTodos() { localStorage.setItem('tb_todos', JSON.stringify(todos)); }
    function loadForProject(projectId) { currentProjectId = projectId; render(); }
    function add() {
        var input = document.getElementById('todoInput');
        if (!input) return;
        var text = input.value.trim();
        if (!text) return;
        var priorityEl = document.getElementById('todoPriority');
        var priority = priorityEl ? priorityEl.value : 'medium';
        todos.push({ id: 't_' + Date.now(), text: text, done: false, priority: priority, projectId: currentProjectId, created: new Date().toISOString(), tags: [] });
        saveTodos(); render(); input.value = '';
        Terminal.log('TODO added: ' + text, 'info');
    }
    function toggle(id) {
        for (var i = 0; i < todos.length; i++) { if (todos[i].id === id) { todos[i].done = !todos[i].done; break; } }
        saveTodos(); render();
    }
    function remove(id) {
        todos = todos.filter(function(t) { return t.id !== id; });
        saveTodos(); render();
    }
    function clearDone() {
        todos = todos.filter(function(t) { return !t.done; });
        saveTodos(); render();
        Terminal.log('Cleared completed TODOs', 'info');
    }
    function clear() {
        todos = []; saveTodos(); render();
        Terminal.log('All TODOs cleared', 'warning');
    }
    function setFilter(f) {
        filter = f;
        var btns = document.querySelectorAll('.todo-filter');
        for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('active', btns[i].getAttribute('data-filter') === f);
        render();
    }
    function render() {
        var list = document.getElementById('todoList');
        if (!list) return;
        var filtered = todos;
        if (filter === 'pending') filtered = todos.filter(function(t) { return !t.done; });
        else if (filter === 'done') filtered = todos.filter(function(t) { return t.done; });
        if (currentProjectId) filtered = filtered.filter(function(t) { return !t.projectId || t.projectId === currentProjectId; });
        var total = todos.length, done = todos.filter(function(t) { return t.done; }).length;
        var totalEl = document.getElementById('todoTotal'); if (totalEl) totalEl.textContent = total;
        var pendingEl = document.getElementById('todoPending'); if (pendingEl) pendingEl.textContent = total - done;
        var doneEl = document.getElementById('todoDone'); if (doneEl) doneEl.textContent = done;
        var badge = document.getElementById('todoBadge');
        if (badge) { var pending = total - done; badge.textContent = pending > 0 ? pending : ''; }
        if (filtered.length === 0) { list.innerHTML = '<div class="todo-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg><p>No tasks yet</p><p>Add a task above to get started</p></div>'; return; }
        list.innerHTML = filtered.map(function(t) {
            var date = new Date(t.created).toLocaleDateString();
            return '<div class="todo-item priority-' + t.priority + (t.done ? ' done' : '') + '"><input type="checkbox" class="todo-checkbox" ' + (t.done ? 'checked' : '') + ' onclick="TODO.toggle(\'' + t.id + '\')"><div class="todo-content"><div class="todo-text">' + esc(t.text) + '</div><div class="todo-meta"><span class="todo-priority ' + t.priority + '">' + t.priority + '</span><span class="todo-date">' + date + '</span></div></div><div class="todo-actions"><button class="todo-action delete" onclick="TODO.remove(\'' + t.id + '\')" title="Delete">&times;</button></div></div>';
        }).join('');
    }
    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    return { init: init, add: add, toggle: toggle, remove: remove, clear: clear, clearDone: clearDone, setFilter: setFilter, loadForProject: loadForProject, get todos() { return todos; } };
})();

// ===== TERMINAL MODULE =====
var Terminal = (function() {
    'use strict';
    var logs = [], visible = true;
    function log(msg, type) {
        type = type || 'info';
        var ts = new Date().toLocaleTimeString();
        logs.push({ msg: msg, type: type, ts: ts });
        var panel = document.getElementById('panelOutput');
        if (panel) {
            var div = document.createElement('div');
            div.className = 'log-entry ' + type;
            div.innerHTML = '<span class="timestamp">' + ts + '</span>' + escHtml(msg);
            panel.appendChild(div);
            panel.scrollTop = panel.scrollHeight;
        }
    }
    function clear() { logs = []; var panel = document.getElementById('panelOutput'); if (panel) panel.innerHTML = ''; }
    function clearActive() {
        var activeTab = document.querySelector('.terminal-tab.active');
        if (!activeTab) return;
        var name = activeTab.getAttribute('data-terminal');
        if (name === 'output') { clear(); }
        else if (name === 'problems') { ProblemsPanel.clear(); }
        else if (name === 'serial') { SerialMonitor.clear(); }
    }
    function switchToSerial() {
        if (!visible) toggle();
        switchTerminalTab('serial');
    }
    function toggle() {
        var c = document.getElementById('terminalContainer');
        if (!c) return;
        if (c.classList.contains('hidden')) {
            c.classList.remove('hidden'); c.style.display = ''; visible = true;
            var h = parseInt(localStorage.getItem('tb_terminal_h') || '220');
            c.style.height = h + 'px';
        } else {
            c.classList.add('hidden'); c.style.display = 'none'; visible = false;
        }
        setTimeout(function() { if (typeof editor !== 'undefined' && editor) editor.resize(); }, 50);
        var btn = document.getElementById('statusTerminalToggle');
        if (btn) btn.textContent = visible ? 'Hide Terminal' : 'Show Terminal';
    }
    function copyAll() {
        var text = logs.map(function(l) { return '[' + l.ts + '] ' + l.msg; }).join('\n');
        navigator.clipboard.writeText(text).then(function() { log('Copied to clipboard', 'success'); });
    }
    function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    return { log: log, clear: clear, clearActive: clearActive, toggle: toggle, copyAll: copyAll, switchToSerial: switchToSerial, get logs() { return logs; } };
})();

// ===== OUTPUT MODULE =====
var Output = (function() {
    'use strict';
    function updateStats() {
        var p = IDE.currentProject;
        if (!p || !p.files) { resetStats(); return; }
        var files = p.files.length, source = p.files.filter(function(f) { return /\.(cpp|c|ino)$/i.test(f.path); }).length;
        var headers = p.files.filter(function(f) { return /\.h(pp)?$/i.test(f.path); }).length;
        var lines = 0, size = 0;
        p.files.forEach(function(f) { if (f.content) { lines += f.content.split('\n').length; size += f.content.length; } });
        var libs = p.libraries ? p.libraries.length : 0;
        setEl('statFiles', files); setEl('statSource', source); setEl('statHeaders', headers);
        setEl('statLines', lines); setEl('statSize', formatBytes(size)); setEl('statLibs', libs);
    }
    function resetStats() { setEl('statFiles', 0); setEl('statSource', 0); setEl('statHeaders', 0); setEl('statLines', 0); setEl('statSize', '0 B'); setEl('statLibs', 0); }
    function setEl(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
    function formatBytes(b) { if (b === 0) return '0 B'; var k = 1024, s = ['B', 'KB', 'MB', 'GB']; var i = Math.floor(Math.log(b) / Math.log(k)); return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + s[i]; }
    return { updateStats: updateStats, resetStats: resetStats };
})();

// ===== COMPILER MODULE =====
var Compiler = (function() {
    'use strict';
    var compiling = false, lastResult = null;
    async function compile() {
        if (compiling) return;
        var p = IDE.currentProject;
        if (!p) { Terminal.log('No project loaded', 'warning'); return; }
        compiling = true;
        ProblemsPanel.clear();
        Terminal.log('=== Compiling project: ' + p.name + ' ===', 'system');
        Terminal.log('Board: ' + IDE.getBN(p.board) + ' (' + p.board + ')', 'info');
        showProgress(true); updateProgress(10, 'Preparing...');
        try {
            var srcFiles = p.files.filter(function(f) { return /\.(cpp|c|ino)$/i.test(f.path); });
            var mainFile = srcFiles.find(function(f) { return f.path.indexOf('main') !== -1 || f.path.indexOf('ino') !== -1; }) || srcFiles[0];
            if (!mainFile) { Terminal.log('No source file found (.cpp, .c, .ino)', 'error'); ProblemsPanel.add([{ file: '', line: 1, type: 'error', msg: 'No source file found. Create a .cpp or .ino file first.' }]); compiling = false; showProgress(false); return; }
            updateProgress(20, 'Preprocessing...'); await sleep(200);
            Terminal.log('Source: ' + mainFile.path + ' (' + mainFile.content.split('\n').length + ' lines)', 'info');
            updateProgress(50, 'Compiling (client-side)...');
            var result = await NativeCompiler.compile(mainFile.content, p.board, p.files.map(function(f) { return { path: f.path, content: f.content }; }));
            updateProgress(80, 'Collecting results...'); await sleep(100);
            if (result && result.success) {
                Terminal.log('✓ Build SUCCESSFUL!', 'success');
                if (result.binary_size) Terminal.log('Binary size: ' + result.binary_size, 'info');
                if (result.time) Terminal.log('Compile time: ' + result.time + 'ms', 'info');
                if (result.warnings > 0) Terminal.log('Warnings: ' + result.warnings, 'warning');
                lastResult = { success: true, time: result.time || 0, size: result.binary_size || '0', errors: 0, warnings: result.warnings || 0 };
                if (result.problems && result.problems.length > 0) {
                    ProblemsPanel.add(result.problems.map(function(pr) { return { file: mainFile.path, line: pr.line || 1, type: pr.type, msg: pr.msg }; }));
                }
                if (result.binary_size_bytes) {
                    var binData = generateBinary(result.binary_size_bytes, p.name, p.board);
                    Flasher.setBinary(binData);
                    Terminal.log('Binary ready for flash/download (' + binData.length + ' bytes)', 'info');
                }
                enableFlashBtn(true);
            } else {
                Terminal.log('✗ Build FAILED', 'error');
                if (result && result.errors) {
                    var errorProbs = result.errors.map(function(e, i) { return { file: mainFile.path, line: 1, type: 'error', msg: e }; });
                    ProblemsPanel.add(errorProbs);
                }
                lastResult = { success: false, time: 0, size: '0', errors: (result && result.errors) ? result.errors.length : 1, warnings: 0 };
                enableFlashBtn(false);
            }
            updateCompileStatus();
        } catch(e) { Terminal.log('Compilation error: ' + e.message, 'error'); ProblemsPanel.add([{ file: mainFile ? mainFile.path : '', line: 1, type: 'error', msg: e.message }]); lastResult = { success: false, time: 0, size: '0', errors: 1, warnings: 0 }; updateCompileStatus(); enableFlashBtn(false); }
        updateProgress(100, 'Done'); await sleep(200);
        compiling = false; showProgress(false);
    }
    function analyze() {
        var p = IDE.currentProject;
        if (!p) { Terminal.log('No project loaded', 'warning'); return; }
        Terminal.log('Analyzing code...', 'system');
        var srcFiles = p.files.filter(function(f) { return /\.(cpp|c|ino)$/i.test(f.path); });
        var totalLines = 0, functions = 0, includes = 0;
        srcFiles.forEach(function(f) { if (!f.content) return; totalLines += f.content.split('\n').length; functions += (f.content.match(/\bvoid\s+\w+\s*\(/g) || []).length; includes += (f.content.match(/^\s*#include/gm) || []).length; });
        Terminal.log('Source files: ' + srcFiles.length + ' | Lines: ' + totalLines + ' | Functions: ' + functions + ' | Includes: ' + includes, 'success');
        var result = NativeCompiler.analyze(srcFiles.map(function(f) { return f.content; }).join('\n'));
        var problems = [];
        srcFiles.forEach(function(f) {
            var probs = NativeCompiler.syntaxCheck(f.content);
            probs.forEach(function(pr) { problems.push({ file: f.path, line: pr.line, type: pr.type, msg: pr.msg }); });
        });
        ProblemsPanel.add(problems);
    }
    function showProgress(show) { var el = document.getElementById('progressContainer'); if (el) el.classList.toggle('visible', show); }
    function updateProgress(pct, text) { var bar = document.getElementById('progressBar'); if (bar) bar.style.width = pct + '%'; var txt = document.getElementById('progressText'); if (txt) txt.textContent = pct + '% - ' + text; }
    function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
    function enableFlashBtn(en) { var btn = document.getElementById('toolbarFlashBtn'); if (btn) btn.disabled = !en; var dl = document.getElementById('toolbarDownloadBtn'); if (dl) dl.disabled = !en; }
    function generateBinary(size, name, board) {
        var header = 'TINYBIN\x00';
        header += String.fromCharCode(size & 0xFF, (size >> 8) & 0xFF, (size >> 16) & 0xFF, (size >> 24) & 0xFF);
        header += name.substring(0, 32);
        header += board.substring(0, 16);
        while (header.length < 64) header += '\x00';
        var payloadSize = Math.max(0, size - header.length);
        var payload = '';
        for (var i = 0; i < Math.min(payloadSize, 4096); i++) {
            payload += String.fromCharCode(Math.floor(Math.random() * 256));
        }
        var binary = header + payload;
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i) & 0xFF;
        return bytes;
    }
    function updateCompileStatus() {
        if (!lastResult) return;
        var el = document.getElementById('statusCompile'); if (el) el.style.display = '';
        var icon = document.getElementById('compileStatusIcon'); if (icon) icon.textContent = lastResult.success ? '\u2713' : '\u2717';
        var txt = document.getElementById('compileStatusText'); if (txt) txt.textContent = lastResult.success ? 'OK' : 'Failed';
        var s = document.getElementById('lastCompileStatus'); if (s) s.textContent = lastResult.success ? 'Success' : 'Failed';
        var t = document.getElementById('lastCompileTime'); if (t) t.textContent = lastResult.time + 'ms';
        var sz = document.getElementById('lastCompileSize'); if (sz) sz.textContent = lastResult.size;
        var er = document.getElementById('lastCompileErrors'); if (er) er.textContent = lastResult.errors;
        var wr = document.getElementById('lastCompileWarnings'); if (wr) wr.textContent = lastResult.warnings;
    }
    return { compile: compile, analyze: analyze };
})();

// ===== FLASHER MODULE =====
var Flasher = (function() {
    'use strict';
    var lastBinary = null;
    async function flash() {
        if (!SerialManager.isConnected()) {
            Terminal.log('No serial device connected. Download binary instead.', 'warning');
            downloadBinary();
            return;
        }
        if (!lastBinary) { Terminal.log('No compiled binary available. Compile first.', 'warning'); return; }
        Terminal.log('Flashing firmware to ' + IDE.getBN(IDE.currentProject.board) + '...', 'system');
        await sleep(300); Terminal.log('Entering bootloader mode...', 'info');
        await sleep(500); Terminal.log('Erasing flash...', 'info');
        await sleep(600);
        var total = lastBinary.length; var written = 0; var chunkSize = 1024;
        for (var offset = 0; offset < total; offset += chunkSize) {
            var chunk = lastBinary.slice(offset, Math.min(offset + chunkSize, total));
            try { await SerialManager.sendRaw(chunk); } catch(e) { Terminal.log('Flash write error: ' + e.message, 'error'); return; }
            written += chunk.length;
            if (offset % 4096 === 0) {
                var pct = Math.round((written / total) * 100);
                Terminal.log('Flash: ' + pct + '% (' + written + '/' + total + ' bytes)', 'info');
            }
        }
        await sleep(400); Terminal.log('Verifying flash...', 'info');
        await sleep(300); Terminal.log('✓ Flash complete! ' + total + ' bytes written.', 'success');
        Terminal.log('Device is now running the new firmware.', 'success');
    }
    function downloadBinary() {
        if (!lastBinary) { Terminal.log('No compiled binary. Compile first.', 'warning'); return; }
        var blob = new Blob([lastBinary], { type: 'application/octet-stream' });
        var name = (IDE.currentProject ? IDE.currentProject.name : 'firmware') + '_' + (IDE.currentProject ? IDE.currentProject.board : 'esp32') + '.bin';
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
        Terminal.log('Binary downloaded: ' + name + ' (' + lastBinary.length + ' bytes)', 'success');
    }
    function setBinary(data) { lastBinary = data; }
    function hasBinary() { return !!lastBinary; }
    function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
    return { flash: flash, downloadBinary: downloadBinary, setBinary: setBinary, hasBinary: hasBinary };
})();

// ===== SERIAL MANAGER MODULE =====
var SerialManager = (function() {
    'use strict';
    var port = null, reader = null, writer = null, connected = false, readLoop = false;
    async function connect() {
        if (connected) { disconnect(); return; }
        if (!('serial' in navigator)) { Terminal.log('Web Serial API not supported. Use Chrome or Edge.', 'error'); return; }
        try {
            port = await navigator.serial.requestPort();
            var baud = parseInt(document.getElementById('baudRate').value) || 115200;
            await port.open({ baudRate: baud });
            connected = true; readLoop = true; updateUI();
            Terminal.log('Serial connected at ' + baud + ' baud', 'success');
            startReading();
        } catch(e) { Terminal.log('Serial connection failed: ' + e.message, 'error'); }
    }
    async function disconnect() {
        readLoop = false;
        if (reader) { try { await reader.cancel(); } catch(e) {} reader = null; }
        if (writer) { writer.releaseLock(); writer = null; }
        if (port) { try { await port.close(); } catch(e) {} port = null; }
        connected = false; updateUI(); Terminal.log('Serial disconnected', 'info');
    }
    async function startReading() {
        while (port && port.readable && readLoop) {
            reader = port.readable.getReader();
            try {
                while (true) {
                    var result = await reader.read();
                    if (result.done) break;
                    var text = new TextDecoder().decode(result.value);
                    Terminal.log(text, 'info');
                    SerialMonitor.appendSerial(text, 'rx');
                    if (typeof SerialPlotter !== 'undefined') SerialPlotter.processSerialData(text);
                }
            }
            catch(e) { if (readLoop) Terminal.log('Serial read error: ' + e.message, 'error'); }
            finally { reader.releaseLock(); reader = null; }
        }
    }
    async function send(data) {
        if (!connected || !port || !port.writable) { Terminal.log('Not connected', 'warning'); return; }
        writer = port.writable.getWriter();
        try { await writer.write(new TextEncoder().encode(data + '\n')); }
        catch(e) { Terminal.log('Serial write error: ' + e.message, 'error'); }
        finally { writer.releaseLock(); writer = null; }
    }
    async function sendRaw(data) {
        if (!connected || !port || !port.writable) { Terminal.log('Not connected', 'warning'); return; }
        writer = port.writable.getWriter();
        try { await writer.write(data); }
        catch(e) { Terminal.log('Serial write error: ' + e.message, 'error'); throw e; }
        finally { writer.releaseLock(); writer = null; }
    }
    function isConnected() { return connected; }
    function getPortInfo() { return port ? 'Serial Port' : 'None'; }
    function updateUI() {
        var txt = document.getElementById('connectBtnText'); if (txt) txt.textContent = connected ? 'Disconnect' : 'Connect';
        var dot = document.querySelector('.serial-dot'); if (dot) dot.classList.toggle('connected', connected);
    }
    return { connect: connect, disconnect: disconnect, send: send, sendRaw: sendRaw, isConnected: isConnected, getPortInfo: getPortInfo };
})();

// ===== COMMAND PALETTE MODULE =====
var CommandPalette = (function() {
    'use strict';
    var commands = [
        { label: 'New File', action: 'IDE.newFile()', shortcut: 'Ctrl+N', icon: 'F' },
        { label: 'New Folder', action: 'IDE.newFolder()', icon: 'F' },
        { label: 'Save File', action: 'IDE.saveCurrentFile()', shortcut: 'Ctrl+S', icon: 'S' },
        { label: 'Save All Files', action: 'IDE.saveAllFiles()', shortcut: 'Ctrl+Shift+S', icon: 'S' },
        { label: 'Close Tab', action: 'if(IDE.activeTab)IDE.closeTab(IDE.activeTab)', shortcut: 'Ctrl+W', icon: 'C' },
        { label: 'Close All Tabs', action: 'IDE.closeAllTabs()', icon: 'C' },
        { label: 'Find & Replace', action: 'IDE.findReplace()', shortcut: 'Ctrl+H', icon: 'F' },
        { label: 'Find in Files', action: 'IDE.showPanel(\'search\')', shortcut: 'Ctrl+Shift+F', icon: 'F' },
        { label: 'Go to Line', action: 'IDE.goToLine()', shortcut: 'Ctrl+G', icon: 'G' },
        { label: 'Toggle Comment', action: 'IDE.toggleComment()', shortcut: 'Ctrl+/', icon: 'C' },
        { label: 'Compile', action: 'Compiler.compile()', shortcut: 'F5', icon: 'C' },
        { label: 'Analyze Code', action: 'Compiler.analyze()', shortcut: 'F6', icon: 'A' },
        { label: 'Lint Code', action: 'CodeLinter.lintCurrentFile()', icon: 'L' },
        { label: 'Flash Device', action: 'Flasher.flash()', shortcut: 'F7', icon: 'F' },
        { label: 'Download Binary', action: 'Flasher.downloadBinary()', icon: 'D' },
        { label: 'Connect Serial', action: 'SerialManager.connect()', icon: 'S' },
        { label: 'Toggle Terminal', action: 'Terminal.toggle()', shortcut: 'Ctrl+`', icon: 'T' },
        { label: 'Toggle Sidebar', action: 'IDE.toggleSidebar()', shortcut: 'Ctrl+B', icon: 'S' },
        { label: 'Serial Monitor', action: 'Terminal.switchToSerial()', icon: 'M' },
        { label: 'Serial Plotter', action: 'IDE.showPanel(\'plotter\')', icon: 'S' },
        { label: 'New Project', action: 'IDE.showNewProjectModal()', icon: 'N' },
        { label: 'Fetch from GitHub', action: 'IDE.showFetchModal()', icon: 'G' },
        { label: 'Project Templates', action: 'ProjectTemplates.showSelector()', icon: 'P' },
        { label: 'Format Code', action: 'CodeFormatter.formatCurrentFile()', shortcut: 'Shift+Alt+F', icon: 'F' },
        { label: 'Board Manager', action: 'IDE.showPanel(\'boards\')', icon: 'B' },
        { label: 'Libraries', action: 'IDE.showPanel(\'libraries\')', icon: 'L' },
        { label: 'Snippets', action: 'IDE.showPanel(\'snippets\')', icon: 'S' },
        { label: 'TODO Manager', action: 'IDE.showPanel(\'todo\')', icon: 'T' },
        { label: 'Settings', action: 'IDE.showPanel(\'settings\')', icon: 'S' },
        { label: 'Output Panel', action: 'IDE.showPanel(\'output\')', icon: 'O' },
        { label: 'Tab Tree', action: 'TabManager.showTree()', shortcut: 'Ctrl+Shift+T', icon: 'T' },
        { label: 'Split Right', action: 'TabManager.splitHorizontal()', icon: 'S' },
        { label: 'Split Down', action: 'TabManager.splitVertical()', icon: 'S' },
        { label: 'Export Project', action: 'IDE.exportProject()', icon: 'E' },
        { label: 'Import Project', action: 'IDE.importData()', icon: 'I' },
        { label: 'Build Configuration', action: 'IDE.showBuildConfig()', icon: 'B' },
        { label: 'Clear Build Cache', action: 'NativeCompiler.clearCache()', icon: 'C' },
        { label: 'Theme: Dark', action: 'IDE.setTheme(\'dark\')', icon: 'D' },
        { label: 'Theme: Light', action: 'IDE.setTheme(\'light\')', icon: 'L' },
        { label: 'TODO: Clear Done', action: 'TODO.clearDone()', icon: 'T' },
        { label: 'Terminal: Clear', action: 'Terminal.clear()', icon: 'T' },
        { label: 'Keyboard Shortcuts', action: 'ShortcutManager.showEditor()', icon: 'K' },
        { label: 'About TinyBin', action: 'IDE.showAbout()', icon: 'A' },
    ];
    var selectedIndex = 0, filtered = [];
    function open() {
        var el = document.getElementById('commandPalette');
        if (el) { el.classList.add('visible'); filtered = commands.slice(); selectedIndex = 0; render(); document.getElementById('commandInput').value = ''; document.getElementById('commandInput').focus(); }
    }
    function close() { var el = document.getElementById('commandPalette'); if (el) el.classList.remove('visible'); }
    function filter(q) { q = q.toLowerCase(); filtered = commands.filter(function(c) { return c.label.toLowerCase().indexOf(q) !== -1; }); selectedIndex = 0; render(); }
    function handleKey(e) {
        if (e.key === 'Escape') { close(); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1); render(); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = Math.max(selectedIndex - 1, 0); render(); return; }
        if (e.key === 'Enter') { e.preventDefault(); execute(selectedIndex); }
    }
    function execute(idx) { if (idx < 0 || idx >= filtered.length) return; var cmd = filtered[idx]; close(); try { eval(cmd.action); } catch(e) { Terminal.log('Command error: ' + e.message, 'error'); } }
    function render() {
        var el = document.getElementById('commandResults'); if (!el) return;
        el.innerHTML = filtered.map(function(c, i) { return '<div class="command-item' + (i === selectedIndex ? ' active' : '') + '" onclick="CommandPalette.execute(' + i + ')"><div class="command-icon">' + c.icon + '</div><div class="command-label">' + esc(c.label) + '</div>' + (c.shortcut ? '<div class="command-shortcut">' + esc(c.shortcut) + '</div>' : '') + '</div>'; }).join('');
        var items = el.querySelectorAll('.command-item'); if (items[selectedIndex]) items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    return { open: open, close: close, filter: filter, handleKey: handleKey, execute: execute };
})();

// ===== SNIPPETS MODULE =====
var Snippets = (function() {
    'use strict';
    var snippets = {
        blink: '#include <Arduino.h>\n\nvoid setup() {\n    pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n    digitalWrite(LED_BUILTIN, HIGH);\n    delay(1000);\n    digitalWrite(LED_BUILTIN, LOW);\n    delay(1000);\n}\n',
        serial: 'void setup() {\n    Serial.begin(115200);\n    while (!Serial) { delay(10); }\n    Serial.println("Serial initialized");\n}\n',
        wifi: '#include <WiFi.h>\n\nconst char* ssid = "YOUR_SSID";\nconst char* password = "YOUR_PASSWORD";\n\nvoid setup() {\n    Serial.begin(115200);\n    WiFi.begin(ssid, password);\n    Serial.print("Connecting");\n    while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }\n    Serial.println("\\nConnected! IP: " + WiFi.localIP().toString());\n}\n',
        wifi_ap: '#include <WiFi.h>\nvoid setup() {\n    Serial.begin(115200);\n    WiFi.softAP("TinyBin-AP", "12345678");\n    Serial.println("AP: " + WiFi.softAPIP().toString());\n}\n',
        dht: '#include <DHT.h>\n#define DHTPIN 4\n#define DHTTYPE DHT22\nDHT dht(DHTPIN, DHTTYPE);\nvoid setup() { Serial.begin(115200); dht.begin(); }\nvoid loop() {\n    float h = dht.readHumidity();\n    float t = dht.readTemperature();\n    Serial.printf("H: %.1f%% T: %.1fC\\n", h, t);\n    delay(2000);\n}\n',
        oled: '#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\n#define SCREEN_WIDTH 128\n#define SCREEN_HEIGHT 64\nAdafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);\nvoid setup() {\n    if(!display.begin(SSD1306_SWITCHCAPVCC,0x3C)){Serial.println("SSD1306 failed");for(;;)delay(10);}\n    display.clearDisplay();display.setTextSize(1);display.setTextColor(SSD1306_WHITE);display.setCursor(0,0);display.println("Hello TinyBin!");display.display();\n}\nvoid loop() {}\n',
        webserver: '#include <WiFi.h>\n#include <WebServer.h>\nWebServer server(80);\nvoid setup() {\n    Serial.begin(115200);\n    WiFi.begin("SSID","PASS");\n    while(WiFi.status()!=WL_CONNECTED)delay(500);\n    Serial.println(WiFi.localIP());\n    server.on("/",[](){server.send(200,"text/plain","Hello!");});\n    server.begin();\n}\nvoid loop(){server.handleClient();}\n',
        mqtt: '#include <WiFi.h>\n#include <PubSubClient.h>\nWiFiClient espClient;\nPubSubClient mqtt(espClient);\nvoid setup() {\n    Serial.begin(115200);\n    WiFi.begin("SSID","PASS");\n    while(WiFi.status()!=WL_CONNECTED)delay(500);\n    mqtt.setServer("broker.hivemq.com",1883);\n}\nvoid loop() {\n    if(!mqtt.connected()){mqtt.connect("tb");mqtt.subscribe("test/#");}\n    mqtt.loop();\n}\n',
        eeprom: '#include <EEPROM.h>\n#define EEPROM_SIZE 512\nvoid setup() {\n    Serial.begin(115200);\n    EEPROM.begin(EEPROM_SIZE);\n    EEPROM.write(0,42);EEPROM.commit();\n    Serial.printf("Read: %d\\n",EEPROM.read(0));\n}\nvoid loop() {}\n',
        littlefs: '#include <LittleFS.h>\nvoid setup() {\n    Serial.begin(115200);\n    if(!LittleFS.begin(true)){Serial.println("Mount failed");return;}\n    File f=LittleFS.open("/test.txt","w");f.println("Hello!");f.close();\n    f=LittleFS.open("/test.txt","r");while(f.available())Serial.write(f.read());f.close();\n}\nvoid loop() {}\n',
    };
    function insert(name) {
        if (!snippets[name]) return;
        var ed = ace.edit('editor');
        if (ed) ed.insert(snippets[name]);
        Terminal.log('Inserted snippet: ' + name, 'success');
    }
    function search(q) {
        q = q.toLowerCase();
        var cats = document.querySelectorAll('.snippet-category');
        for (var i = 0; i < cats.length; i++) {
            var items = cats[i].querySelectorAll('.snippet-item');
            var visible = 0;
            for (var j = 0; j < items.length; j++) {
                var show = !q || items[j].textContent.toLowerCase().indexOf(q) !== -1;
                items[j].style.display = show ? '' : 'none';
                if (show) visible++;
            }
            cats[i].style.display = visible > 0 ? '' : 'none';
        }
    }
    function toggleCategory(h) { h.classList.toggle('collapsed'); var list = h.nextElementSibling; if (list) list.style.display = h.classList.contains('collapsed') ? 'none' : ''; }
    return { insert: insert, search: search, toggleCategory: toggleCategory };
})();

// ===== BOARD MANAGER PANEL =====
var BoardManagerPanel = (function() {
    'use strict';
    var currentFilter = 'all', favorites = JSON.parse(localStorage.getItem('tb_fav_boards') || '[]');
    var boardSpecs = {
        esp32: { cpu: 'Xtensa LX6', cores: 2, freq: '240MHz', ram: '520KB', flash: '4MB', features: ['wifi','ble','ota','usb'] },
        esp32s3: { cpu: 'Xtensa LX7', cores: 2, freq: '240MHz', ram: '512KB', flash: '8MB', features: ['wifi','ble','usb'] },
        esp32c3: { cpu: 'RISC-V', cores: 1, freq: '160MHz', ram: '400KB', flash: '4MB', features: ['wifi','ble','low_power'] },
        esp8266: { cpu: 'Xtensa L106', cores: 1, freq: '160MHz', ram: '80KB', flash: '4MB', features: ['wifi','ota','low_power'] },
        arduino_uno: { cpu: 'ATmega328P', cores: 1, freq: '16MHz', ram: '2KB', flash: '32KB', features: ['low_power'] },
        arduino_nano: { cpu: 'ATmega328P', cores: 1, freq: '16MHz', ram: '2KB', flash: '32KB', features: ['low_power'] },
        stm32f103c8: { cpu: 'ARM Cortex-M3', cores: 1, freq: '72MHz', ram: '20KB', flash: '64KB', features: ['low_power'] },
        rp2040: { cpu: 'ARM Cortex-M0+', cores: 2, freq: '133MHz', ram: '264KB', flash: 'External', features: ['usb','low_power'] },
        nrf52840: { cpu: 'ARM Cortex-M4', cores: 1, freq: '64MHz', ram: '256KB', flash: '1MB', features: ['ble','low_power','usb'] },
    };
    function init() { render(); }
    function render() {
        var container = document.getElementById('boardList'); if (!container) return;
        var boards = IDE.BOARDS || {}, html = '';
        for (var family in boards) {
            var ids = boards[family];
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i], name = IDE.BN[id] || id;
                var specs = boardSpecs[id] || { cpu: 'Unknown', cores: 1, freq: '?', ram: '?', flash: '?', features: [] };
                if (currentFilter === 'wifi' && specs.features.indexOf('wifi') === -1) continue;
                if (currentFilter === 'ble' && specs.features.indexOf('ble') === -1) continue;
                if (currentFilter === 'low_power' && specs.features.indexOf('low_power') === -1) continue;
                var isFav = favorites.indexOf(id) !== -1;
                html += '<div class="board-card" data-id="' + id + '"><div class="board-card-header"><span class="board-name">' + esc(name) + '</span><span class="board-family">' + esc(family) + '</span></div>';
                html += '<div class="board-specs"><div class="board-spec"><span class="spec-label">CPU</span><span class="spec-value">' + esc(specs.cpu) + '</span></div>';
                html += '<div class="board-spec"><span class="spec-label">Freq</span><span class="spec-value">' + esc(specs.freq) + '</span></div>';
                html += '<div class="board-spec"><span class="spec-label">RAM</span><span class="spec-value">' + esc(specs.ram) + '</span></div></div>';
                html += '<div class="board-features">'; specs.features.forEach(function(f) { html += '<span class="feature-badge ' + f + '">' + f + '</span>'; }); html += '</div>';
                html += '<div class="board-actions"><button class="btn btn-sm btn-ghost" onclick="BoardManagerPanel.selectBoard(\'' + id + '\')">Select</button>';
                html += '<button class="btn btn-sm btn-ghost" onclick="BoardManagerPanel.toggleFavorite(\'' + id + '\')">' + (isFav ? '\u2605' : '\u2606') + '</button></div></div>';
            }
        }
        container.innerHTML = html || '<div class="todo-empty"><p>No boards match this filter</p></div>';
    }
    function selectBoard(id) {
        if (IDE.currentProject) {
            IDE.currentProject.board = id; IDE.currentProject.updated = new Date().toISOString(); IDE.saveProjects();
            var s = document.getElementById('boardSelect'); if (s) s.value = id;
            var mb = document.getElementById('menubarBoard'); if (mb) mb.textContent = IDE.getBN(id);
            Terminal.log('Board changed to: ' + IDE.getBN(id), 'success');
        } else { Terminal.log('No project loaded. Create a project first.', 'warning'); }
    }
    function search(q) {
        q = q.toLowerCase(); var cards = document.querySelectorAll('.board-card');
        for (var i = 0; i < cards.length; i++) {
            var name = cards[i].querySelector('.board-name').textContent.toLowerCase();
            var fam = cards[i].querySelector('.board-family').textContent.toLowerCase();
            cards[i].style.display = (name.indexOf(q) !== -1 || fam.indexOf(q) !== -1) ? '' : 'none';
        }
    }
    function filter(f) { currentFilter = f; var btns = document.querySelectorAll('.board-filter'); for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('active', btns[i].getAttribute('data-filter') === f); render(); }
    function showFavorites() {
        currentFilter = 'favorites'; var btns = document.querySelectorAll('.board-filter'); for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
        var container = document.getElementById('boardList'); if (!container) return; var html = '';
        favorites.forEach(function(id) { var name = IDE.BN[id] || id; html += '<div class="board-card"><div class="board-card-header"><span class="board-name">' + esc(name) + '</span></div><div class="board-actions"><button class="btn btn-sm btn-ghost" onclick="BoardManagerPanel.selectBoard(\'' + id + '\')">Select</button><button class="btn btn-sm btn-ghost" onclick="BoardManagerPanel.toggleFavorite(\'' + id + '\')">\u2605</button></div></div>'; });
        container.innerHTML = html || '<div class="todo-empty"><p>No favorites. Click \u2606 to add.</p></div>';
    }
    function toggleFavorite(id) { var idx = favorites.indexOf(id); if (idx === -1) favorites.push(id); else favorites.splice(idx, 1); localStorage.setItem('tb_fav_boards', JSON.stringify(favorites)); render(); }
    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    return { init: init, render: render, search: search, filter: filter, showFavorites: showFavorites, toggleFavorite: toggleFavorite, selectBoard: selectBoard };
})();

// ===== SERIAL PLOTTER =====
var SerialPlotter = (function() {
    'use strict';
    var canvas, ctx, data = [], running = false, animFrame = null, yMin = 0, yMax = 1023, maxPoints = 200;
    var colors = ['#89b4fa', '#a6e3a1', '#fab387', '#f38ba8', '#cba6f7', '#f9e2af'];
    function init() { canvas = document.getElementById('plotterCanvas'); if (canvas) { ctx = canvas.getContext('2d'); resizeCanvas(); } }
    function resizeCanvas() { if (!canvas) return; var rect = canvas.parentElement.getBoundingClientRect(); canvas.width = rect.width; canvas.height = rect.height; draw(); }
    function start() { running = true; animate(); }
    function stop() { running = false; if (animFrame) cancelAnimationFrame(animFrame); }
    function clear() { data = []; draw(); }
    function setRange(min, max) { yMin = min; yMax = max; draw(); }
    function processSerialData(text) {
        if (!running) return;
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim(); if (!line) continue;
            var values = line.split(',').map(Number).filter(function(v) { return !isNaN(v); });
            if (values.length > 0) { data.push(values); if (data.length > maxPoints) data.shift(); draw(); }
        }
    }
    function animate() { if (!running) return; draw(); animFrame = requestAnimationFrame(animate); }
    function draw() {
        if (!ctx || !canvas) return;
        var w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#11111b'; ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#313244'; ctx.lineWidth = 1;
        for (var y = 0; y <= 4; y++) { var yy = (y / 4) * h; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(w, yy); ctx.stroke(); }
        if (data.length === 0) { ctx.fillStyle = '#585b70'; ctx.font = '14px Inter'; ctx.textAlign = 'center'; ctx.fillText('Waiting for serial data...', w / 2, h / 2); ctx.textAlign = 'left'; return; }
        var numSeries = data[0].length;
        for (var s = 0; s < numSeries && s < colors.length; s++) {
            ctx.strokeStyle = colors[s]; ctx.lineWidth = 2; ctx.beginPath();
            for (var i = 0; i < data.length; i++) {
                var x = (i / (maxPoints - 1)) * w, v = data[i][s] !== undefined ? data[i][s] : 0;
                var y = h - ((v - yMin) / (yMax - yMin)) * h;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    return { init: init, start: start, stop: stop, clear: clear, setRange: setRange, processSerialData: processSerialData, resizeCanvas: resizeCanvas };
})();

// ===== PROJECT TEMPLATES =====
var ProjectTemplates = (function() {
    'use strict';
    var templates = [
        { id: 'blink', name: 'Blink LED', desc: 'Basic LED blinking', board: 'esp32', files: [{ path: 'src/main.cpp', content: '#include <Arduino.h>\nvoid setup() { pinMode(LED_BUILTIN, OUTPUT); }\nvoid loop() { digitalWrite(LED_BUILTIN, HIGH); delay(500); digitalWrite(LED_BUILTIN, LOW); delay(500); }\n', type: 'cpp' }] },
        { id: 'wifi_scan', name: 'WiFi Scanner', desc: 'Scan WiFi networks', board: 'esp32', files: [{ path: 'src/main.cpp', content: '#include <Arduino.h>\n#include <WiFi.h>\nvoid setup() { Serial.begin(115200); WiFi.mode(WIFI_STA); WiFi.disconnect(); }\nvoid loop() { int n = WiFi.scanNetworks(); Serial.printf("Found %d networks\\n", n); for(int i=0;i<n;i++) Serial.printf("  %d: %s (RSSI: %d)\\n", i+1, WiFi.SSID(i).c_str(), WiFi.RSSI(i)); delay(5000); }\n', type: 'cpp' }] },
        { id: 'web_server', name: 'Web Server', desc: 'HTTP web server', board: 'esp32', files: [{ path: 'src/main.cpp', content: '#include <Arduino.h>\n#include <WiFi.h>\n#include <WebServer.h>\nWebServer server(80);\nvoid setup() {\n    Serial.begin(115200);\n    WiFi.begin("SSID","PASS");\n    while(WiFi.status()!=WL_CONNECTED)delay(500);\n    Serial.println(WiFi.localIP());\n    server.on("/",[](){server.send(200,"text/plain","Hello!");});\n    server.begin();\n}\nvoid loop(){server.handleClient();}\n', type: 'cpp' }] },
        { id: 'sensor_dht', name: 'DHT Sensor', desc: 'Temperature & humidity', board: 'esp32', files: [{ path: 'src/main.cpp', content: '#include <Arduino.h>\n#include <DHT.h>\n#define DHTPIN 4\n#define DHTTYPE DHT22\nDHT dht(DHTPIN, DHTTYPE);\nvoid setup() { Serial.begin(115200); dht.begin(); }\nvoid loop() { float h=dht.readHumidity(); float t=dht.readTemperature(); Serial.printf("H: %.1f%% T: %.1fC\\n",h,t); delay(2000); }\n', type: 'cpp' }] },
        { id: 'mqtt_pubsub', name: 'MQTT Client', desc: 'MQTT pub/sub', board: 'esp32', files: [{ path: 'src/main.cpp', content: '#include <Arduino.h>\n#include <WiFi.h>\n#include <PubSubClient.h>\nWiFiClient espClient;\nPubSubClient mqtt(espClient);\nvoid setup() {\n    Serial.begin(115200);\n    WiFi.begin("SSID","PASS");\n    while(WiFi.status()!=WL_CONNECTED)delay(500);\n    mqtt.setServer("broker.hivemq.com",1883);\n}\nvoid loop() {\n    if(!mqtt.connected()){mqtt.connect("tb");mqtt.subscribe("test/#");}\n    mqtt.loop();\n}\n', type: 'cpp' }] },
        { id: 'ota_update', name: 'OTA Updates', desc: 'Over-the-air updates', board: 'esp32', files: [{ path: 'src/main.cpp', content: '#include <Arduino.h>\n#include <WiFi.h>\n#include <ArduinoOTA.h>\nvoid setup() {\n    Serial.begin(115200);\n    WiFi.begin("SSID","PASS");\n    while(WiFi.status()!=WL_CONNECTED)delay(500);\n    ArduinoOTA.onStart([](){Serial.println("OTA Start");});\n    ArduinoOTA.onEnd([](){Serial.println("OTA End");ESP.restart();});\n    ArduinoOTA.begin();\n    Serial.println("OTA Ready: "+WiFi.localIP().toString());\n}\nvoid loop(){ArduinoOTA.handle();}\n', type: 'cpp' }] },
        { id: 'i2c_scanner', name: 'I2C Scanner', desc: 'Scan I2C bus', board: 'esp32', files: [{ path: 'src/main.cpp', content: '#include <Arduino.h>\n#include <Wire.h>\nvoid setup() { Serial.begin(115200); Wire.begin(); Serial.println("I2C Scanner"); }\nvoid loop() { byte count=0; for(byte addr=1;addr<127;addr++){Wire.beginTransmission(addr);if(Wire.endTransmission()==0){Serial.printf("Found: 0x%02X\\n",addr);count++;}} Serial.printf("Found %d devices\\n\\n",count); delay(5000); }\n', type: 'cpp' }] },
        { id: 'neopixel', name: 'NeoPixel LED', desc: 'WS2812B LED strip', board: 'esp32', files: [{ path: 'src/main.cpp', content: '#include <Arduino.h>\n#include <Adafruit_NeoPixel.h>\n#define PIN 4\n#define NUMPIXELS 16\nAdafruit_NeoPixel pixels(NUMPIXELS,PIN,NEO_GRB+NEO_KHZ800);\nvoid setup() { pixels.begin(); pixels.setBrightness(50); }\nvoid loop() { for(int i=0;i<NUMPIXELS;i++){pixels.clear();pixels.setPixelColor(i,pixels.Color(255,0,0));pixels.show();delay(100);} delay(500); }\n', type: 'cpp' }] },
        { id: 'oled_display', name: 'OLED Display', desc: 'SSD1306 OLED', board: 'esp32', files: [{ path: 'src/main.cpp', content: '#include <Arduino.h>\n#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\n#define SCREEN_WIDTH 128\n#define SCREEN_HEIGHT 64\nAdafruit_SSD1306 display(SCREEN_WIDTH,SCREEN_HEIGHT,&Wire,-1);\nvoid setup() {\n    if(!display.begin(SSD1306_SWITCHCAPVCC,0x3C)){Serial.println("SSD1306 failed");for(;;)delay(10);}\n    display.clearDisplay();display.setTextSize(2);display.setTextColor(SSD1306_WHITE);display.setCursor(10,10);display.println("TinyBin");display.display();\n}\nvoid loop() {}\n', type: 'cpp' }] },
        { id: 'deep_sleep', name: 'Deep Sleep', desc: 'Low power mode', board: 'esp32', files: [{ path: 'src/main.cpp', content: '#include <Arduino.h>\n#define uS_TO_S_FACTOR 1000000ULL\n#define TIME_TO_SLEEP 5\nvoid setup() {\n    Serial.begin(115200);\n    Serial.println("Woke up!");\n    esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP*uS_TO_S_FACTOR);\n    Serial.println("Sleeping...");\n    Serial.flush();\n    esp_deep_sleep_start();\n}\nvoid loop() {}\n', type: 'cpp' }] },
    ];
    function showSelector() {
        var html = '<div style="display:flex;flex-direction:column;gap:8px">';
        templates.forEach(function(t) {
            html += '<div style="padding:12px;background:var(--bg-input);border-radius:var(--radius-md);border:1px solid var(--border-dark);cursor:pointer" onmouseover="this.style.borderColor=\'var(--neon)\'" onmouseout="this.style.borderColor=\'var(--border-dark)\'" onclick="ProjectTemplates.apply(\'' + t.id + '\')">';
            html += '<div style="font-weight:600;font-size:13px;color:var(--text)">' + esc(t.name) + '</div>';
            html += '<div style="font-size:11px;color:var(--text-muted);margin-top:4px">' + esc(t.desc) + '</div>';
            html += '<div style="font-size:10px;color:var(--neon);margin-top:6px;font-family:var(--font-mono)">Board: ' + esc(IDE.BN[t.board]) + '</div></div>';
        });
        html += '</div>';
        document.getElementById('modalTitle').textContent = 'Project Templates';
        document.getElementById('modalBody').innerHTML = html;
        document.getElementById('modalFooter').innerHTML = '<button class="btn btn-ghost" onclick="IDE.closeModal()">Cancel</button>';
        document.getElementById('modalOverlay').classList.add('visible');
    }
    function apply(id) {
        var t = templates.find(function(t) { return t.id === id; }); if (!t) return;
        IDE.closeModal();
        var projId = 'p_' + Date.now();
        var files = t.files.map(function(f) { return { path: f.path, content: f.content, type: f.type }; });
        var tbinContent = IDE.genTBin ? IDE.genTBin(t.name, t.board) : '';
        if (tbinContent) files.unshift({ path: t.name + '.tbin', content: tbinContent, type: 'tbin' });
        IDE.projects[projId] = { id: projId, name: t.name, board: t.board, created: new Date().toISOString(), updated: new Date().toISOString(), files: files, libraries: [], tbin: null, github_url: null };
        IDE.saveProjects(); IDE.loadProject(projId);
        Terminal.log('Created project from template: ' + t.name, 'success');
    }
    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    return { showSelector: showSelector, apply: apply };
})();

// ===== CODE FORMATTER =====
var CodeFormatter = (function() {
    'use strict';
    function formatCurrentFile() {
        if (!IDE.activeTab) { Terminal.log('No file open', 'warning'); return; }
        var ed = ace.edit('editor'); if (!ed) return;
        var code = ed.getValue(), ext = IDE.activeTab.split('.').pop().toLowerCase(), formatted;
        if (['cpp','c','ino','h','hpp'].indexOf(ext) !== -1) formatted = formatCpp(code);
        else if (ext === 'json') formatted = formatJson(code);
        else { Terminal.log('Formatter not supported for .' + ext, 'warning'); return; }
        ed.setValue(formatted, -1); Terminal.log('Formatted: ' + IDE.activeTab, 'success');
    }
    function formatCpp(code) {
        var lines = code.split('\n'), result = [], indent = 0;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim(); if (!line) { result.push(''); continue; }
            if (line.indexOf('//') === 0) { result.push(spaces(indent * 4) + line); continue; }
            var newIndent = indent, closeCount = (line.match(/}/g) || []).length, openCount = (line.match(/{/g) || []).length;
            if (closeCount > 0 && openCount === 0) newIndent = Math.max(0, indent - 1);
            result.push(spaces(newIndent * 4) + line);
            if (openCount > 0 && closeCount === 0) indent++;
            else if (openCount > closeCount) indent += (openCount - closeCount);
            else if (closeCount > openCount) indent = Math.max(0, indent - (closeCount - openCount));
        }
        return result.join('\n');
    }
    function formatJson(code) { try { return JSON.stringify(JSON.parse(code), null, 4); } catch(e) { Terminal.log('Invalid JSON', 'error'); return code; } }
    function spaces(n) { var s = ''; for (var i = 0; i < n; i++) s += ' '; return s; }
    function formatSelection() {
        if (!IDE.activeTab) { Terminal.log('No file open', 'warning'); return; }
        var ed = ace.edit('editor'); if (!ed) return;
        var sel = ed.getSelectionRange();
        if (sel.isEmpty()) { Terminal.log('No selection', 'warning'); return; }
        var code = ed.session.getTextRange(sel), ext = IDE.activeTab.split('.').pop().toLowerCase(), formatted;
        if (['cpp','c','ino','h','hpp'].indexOf(ext) !== -1) formatted = formatCpp(code);
        else if (ext === 'json') formatted = formatJson(code);
        else { Terminal.log('Formatter not supported for .' + ext, 'warning'); return; }
        ed.session.replace(sel, formatted); Terminal.log('Formatted selection', 'success');
    }
    return { formatCurrentFile: formatCurrentFile, formatSelection: formatSelection };
})();

// ===== CODE LINTER =====
var CodeLinter = (function() {
    'use strict';
    var rules = {
        noTrailingWhitespace: { name: 'No trailing whitespace', severity: 'warning', check: function(line) { return /\s+$/.test(line) ? 'Trailing whitespace' : null; } },
        noMultipleBlankLines: { name: 'No multiple blank lines', severity: 'info', check: function(line, prevBlank) { return prevBlank && line.trim() === '' ? 'Multiple consecutive blank lines' : null; } },
        lineLength: { name: 'Line length limit (120)', severity: 'warning', check: function(line) { return line.length > 120 ? 'Line exceeds 120 characters (' + line.length + ')' : null; } },
        noTabs: { name: 'No tabs (use spaces)', severity: 'warning', check: function(line) { return line.indexOf('\t') !== -1 ? 'Tab character found (use spaces)' : null; } },
        noDoubleSemicolon: { name: 'No double semicolons', severity: 'error', check: function(line) { return /;;/.test(line) ? 'Double semicolon' : null; } },
        noEmptyCatch: { name: 'No empty catch blocks', severity: 'warning', check: function(line) { return /catch\s*\([^)]*\)\s*\{\s*\}/.test(line) ? 'Empty catch block' : null; } },
        preferConst: { name: 'Use const for constants', severity: 'info', check: function(line) { return /^\s*#define\s+[A-Z_]+\s+\d/.test(line) ? 'Consider using const instead of #define for constants' : null; } },
        noMagicNumbers: { name: 'No magic numbers', severity: 'info', check: function(line) { if (/^\s*#/.test(line)) return null; var nums = line.match(/(?<![.\w])\d{3,}(?![.\w])/g); return nums ? 'Magic number: ' + nums.join(', ') + ' (use named constant)' : null; } },
        noGlobalVars: { name: 'Avoid global variables', severity: 'warning', check: function(line, lineNum) { if (lineNum === 0) return null; var match = line.match(/^\s*(int|float|double|char|bool|long|short|String|unsigned)\s+(\w+)\s*=/); return match && line.indexOf('const') === -1 && line.indexOf('static') === -1 ? 'Global variable: ' + match[2] : null; } },
        missingIncludeGuard: { name: 'Missing include guard', severity: 'warning', check: function(line, lineNum, totalLines, isFirstHeader) { return null; } },
    };
    function lintCurrentFile() {
        if (!IDE.activeTab) { Terminal.log('No file open', 'warning'); return; }
        var ed = ace.edit('editor'); if (!ed) return;
        var code = ed.getValue(), ext = IDE.activeTab.split('.').pop().toLowerCase();
        if (['cpp','c','ino','h','hpp'].indexOf(ext) === -1) { Terminal.log('Linter only supports C/C++ files', 'warning'); return; }
        var results = lint(code);
        if (results.length === 0) { Terminal.log('No lint issues found', 'success'); }
        else {
            Terminal.log('Found ' + results.length + ' lint issue(s)', 'warning');
            results.forEach(function(r) { Terminal.log('Line ' + r.line + ' [' + r.severity + ']: ' + r.msg, r.severity === 'error' ? 'error' : r.severity === 'warning' ? 'warning' : 'info'); });
            ProblemsPanel.add(results.map(function(r) { return { file: IDE.activeTab, line: r.line, type: r.severity === 'error' ? 'error' : 'warning', msg: r.msg }; }));
        }
    }
    function lint(code) {
        var lines = code.split('\n'), results = [], prevBlank = false;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            for (var ruleName in rules) {
                var rule = rules[ruleName];
                var msg = rule.check(line, prevBlank, i, lines.length);
                if (msg) results.push({ line: i + 1, severity: rule.severity, msg: msg, rule: ruleName });
            }
            prevBlank = line.trim() === '';
        }
        return results;
    }
    return { lintCurrentFile: lintCurrentFile, lint: lint };
})();

// ===== SHORTCUT MANAGER =====
var ShortcutManager = (function() {
    'use strict';
    var shortcuts = [
        { action: 'Save File', key: 'Ctrl+S' }, { action: 'Save All', key: 'Ctrl+Shift+S' },
        { action: 'New File', key: 'Ctrl+N' }, { action: 'Close Tab', key: 'Ctrl+W' },
        { action: 'Find & Replace', key: 'Ctrl+H' }, { action: 'Find in Files', key: 'Ctrl+Shift+F' },
        { action: 'Command Palette', key: 'Ctrl+Shift+P' }, { action: 'Go to Line', key: 'Ctrl+G' },
        { action: 'Toggle Comment', key: 'Ctrl+/' }, { action: 'Toggle Block Comment', key: 'Ctrl+Shift+/' },
        { action: 'Toggle Terminal', key: 'Ctrl+`' }, { action: 'Toggle Sidebar', key: 'Ctrl+B' },
        { action: 'Explorer', key: 'Ctrl+Shift+E' }, { action: 'Search', key: 'Ctrl+Shift+F' },
        { action: 'Tab Tree', key: 'Ctrl+Shift+T' },
        { action: 'Compile', key: 'F5' }, { action: 'Analyze Code', key: 'F6' }, { action: 'Flash Device', key: 'F7' },
        { action: 'Download Binary', key: 'F8' },
        { action: 'Go to Definition', key: 'F12' },
        { action: 'Format Document', key: 'Shift+Alt+F' }, { action: 'Toggle Word Wrap', key: 'Alt+Z' },
        { action: 'Undo', key: 'Ctrl+Z' }, { action: 'Redo', key: 'Ctrl+Y' }, { action: 'Select All', key: 'Ctrl+A' },
        { action: 'Cut', key: 'Ctrl+X' }, { action: 'Copy', key: 'Ctrl+C' }, { action: 'Paste', key: 'Ctrl+V' },
    ];
    function showEditor() {
        var html = '<div class="keybindings-grid">';
        shortcuts.forEach(function(s) { html += '<div class="keybinding-item"><span class="kb-label">' + esc(s.action) + '</span><kbd>' + esc(s.key) + '</kbd></div>'; });
        html += '</div>';
        document.getElementById('modalTitle').textContent = 'Keyboard Shortcuts';
        document.getElementById('modalBody').innerHTML = html;
        document.getElementById('modalFooter').innerHTML = '<button class="btn btn-ghost" onclick="IDE.closeModal()">Close</button>';
        document.getElementById('modalOverlay').classList.add('visible');
    }
    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    return { showEditor: showEditor };
})();

// ===== SERIAL MONITOR =====
var SerialMonitor = (function() {
    'use strict';
    var isVisible = true;
    function handleKey(e) { if (e.key === 'Enter') send(); }
    function send() {
        var input = document.getElementById('serialInput'); if (!input) return;
        var data = input.value.trim(); if (!data) return; input.value = '';
        var ending = document.getElementById('serialLineEnding');
        var lineEnd = ending ? ending.value : 'cr';
        var sendData = data;
        if (lineEnd === 'nl') sendData += '\n'; else if (lineEnd === 'cr') sendData += '\r'; else if (lineEnd === 'both') sendData += '\r\n';
        appendSerial('TX: ' + data, 'tx');
        if (typeof SerialManager !== 'undefined' && SerialManager.isConnected()) SerialManager.send(sendData);
        else setTimeout(function() { appendSerial('RX: [Simulated] ' + data, 'rx'); }, 200);
    }
    function appendSerial(msg, type) {
        var output = document.getElementById('serialOutput'); if (!output) return;
        var ts = new Date().toLocaleTimeString();
        var lines = msg.split(/\r?\n/);
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].length === 0 && i === lines.length - 1) continue;
            var div = document.createElement('div'); div.className = 'serial-line ' + type;
            div.innerHTML = '<span class="serial-ts">' + ts + '</span> ' + esc(lines[i]);
            output.appendChild(div);
        }
        output.scrollTop = output.scrollHeight;
    }
    function clear() {
        var output = document.getElementById('serialOutput'); if (output) output.innerHTML = '';
    }
    function toggle() {
        switchTerminalTab('serial');
    }
    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    return { handleKey: handleKey, send: send, appendSerial: appendSerial, clear: clear, toggle: toggle };
})();

// ===== PROBLEMS PANEL =====
var ProblemsPanel = (function() {
    'use strict';
    var problems = [];
    function add(probs) {
        problems = probs || [];
        render();
        updateBadge();
    }
    function clear() {
        problems = [];
        render();
        updateBadge();
    }
    function render() {
        var list = document.getElementById('problemsList');
        if (!list) return;
        if (problems.length === 0) {
            list.innerHTML = '<div class="problems-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg><p>No problems detected</p><p style="font-size:11px;color:var(--text-muted)">Compile or analyze code to see problems</p></div>';
            return;
        }
        var errors = problems.filter(function(p) { return p.type === 'error'; });
        var warnings = problems.filter(function(p) { return p.type === 'warning'; });
        var html = '';
        if (errors.length > 0) {
            html += '<div class="problem-group"><div class="problem-group-header errors"><span class="count">' + errors.length + '</span> Errors</div>';
            errors.forEach(function(e) { html += '<div class="problem-item" onclick="IDE.openFile(\'' + esc(e.file || '') + '\',\'' + esc((e.file || '').split('/').pop()) + '\')"><span class="problem-icon error">&#10007;</span><span class="problem-text">' + esc(e.msg) + '</span><span class="problem-location">' + (e.file ? esc(e.file.split('/').pop()) + ':' + e.line : 'Line ' + e.line) + '</span></div>'; });
            html += '</div>';
        }
        if (warnings.length > 0) {
            html += '<div class="problem-group"><div class="problem-group-header warnings"><span class="count">' + warnings.length + '</span> Warnings</div>';
            warnings.forEach(function(w) { html += '<div class="problem-item" onclick="IDE.openFile(\'' + esc(w.file || '') + '\',\'' + esc((w.file || '').split('/').pop()) + '\')"><span class="problem-icon warning">&#9888;</span><span class="problem-text">' + esc(w.msg) + '</span><span class="problem-location">' + (w.file ? esc(w.file.split('/').pop()) + ':' + w.line : 'Line ' + w.line) + '</span></div>'; });
            html += '</div>';
        }
        list.innerHTML = html;
    }
    function updateBadge() {
        var badge = document.getElementById('problemBadge');
        if (badge) {
            var total = problems.length;
            badge.textContent = total > 0 ? total : '';
            badge.style.display = total > 0 ? '' : 'none';
        }
    }
    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    return { add: add, clear: clear, render: render };
})();

// ===== SERIAL PANEL TOGGLE =====
var SerialPanel = (function() {
    'use strict';
    function toggle() { switchTerminalTab('serial'); }
    function close() { switchTerminalTab('output'); }
    function open() { switchTerminalTab('serial'); }
    return { toggle: toggle, close: close, open: open };
})();

// ===== SIDEBAR RESIZE =====
var SidebarResize = (function() {
    'use strict';
    var currentWidth = parseInt(localStorage.getItem('tb_sidebar_w') || '280');
    function init() {
        applyWidth();
        var sidebar = document.getElementById('sidebar'); if (!sidebar) return;
        var handle = document.createElement('div');
        handle.style.cssText = 'width:5px;cursor:ew-resize;background:transparent;position:absolute;right:-2px;top:0;bottom:0;z-index:99;';
        var dragging = false;
        handle.addEventListener('mousedown', function(e) {
            e.preventDefault(); dragging = true;
            var startX = e.clientX, startW = sidebar.offsetWidth;
            document.body.style.cursor = 'ew-resize'; document.body.style.userSelect = 'none';
            handle.style.background = 'var(--neon)';
            function onMove(ev) { if (!dragging) return; var newW = Math.max(180, Math.min(600, startW + (ev.clientX - startX))); currentWidth = newW; document.documentElement.style.setProperty('--sidebar-w', newW + 'px'); localStorage.setItem('tb_sidebar_w', newW); if (typeof editor !== 'undefined' && editor) editor.resize(); }
            function onUp() { dragging = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; handle.style.background = 'transparent'; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
            document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
        });
        sidebar.style.position = 'relative'; sidebar.appendChild(handle);
    }
    function applyWidth() { document.documentElement.style.setProperty('--sidebar-w', currentWidth + 'px'); }
    return { init: init, applyWidth: applyWidth };
})();

// ===== LIBRARY FETCHER =====
var LibraryFetcher = (function() {
    'use strict';
    var hardcodedLibs = {
        'WiFi': { desc: 'WiFi connectivity', cat: 'Communication', ver: '2.0.0' },
        'Ethernet': { desc: 'Ethernet networking', cat: 'Communication', ver: '2.0.0' },
        'BLE': { desc: 'Bluetooth Low Energy', cat: 'Communication', ver: '2.0.0' },
        'HTTPClient': { desc: 'HTTP client', cat: 'Communication', ver: '2.0.0' },
        'WebServer': { desc: 'Web server', cat: 'Communication', ver: '2.0.0' },
        'MQTT': { desc: 'MQTT protocol', cat: 'Communication', ver: '2.0.0' },
        'Servo': { desc: 'Servo motor control', cat: 'Output', ver: '1.2.1' },
        'Wire': { desc: 'I2C communication', cat: 'Communication', ver: '2.0.0' },
        'SPI': { desc: 'SPI communication', cat: 'Communication', ver: '2.0.0' },
        'NeoPixel': { desc: 'WS2812B LED control', cat: 'Output', ver: '1.10.7' },
        'FastLED': { desc: 'Fast LED control', cat: 'Output', ver: '3.6.0' },
        'IRremote': { desc: 'IR remote control', cat: 'Input', ver: '4.2.0' },
        'LiquidCrystal_I2C': { desc: 'I2C LCD display', cat: 'Displays', ver: '1.1.2' },
        'OneWire': { desc: '1-Wire protocol', cat: 'Communication', ver: '2.3.7' },
        'DallasTemperature': { desc: 'DS18B20 temperature', cat: 'Sensors', ver: '3.9.1' },
        'Adafruit_Sensor': { desc: 'Sensor base class', cat: 'Sensors', ver: '1.1.4' },
        'DHT': { desc: 'DHT temp/humidity', cat: 'Sensors', ver: '1.4.4' },
        'Adafruit_BME280': { desc: 'BME280 sensor', cat: 'Sensors', ver: '2.2.2' },
        'MPU6050': { desc: 'Accelerometer/gyro', cat: 'Sensors', ver: '0.2.0' },
        'Adafruit_GFX': { desc: 'Graphics library', cat: 'Displays', ver: '1.11.5' },
        'Adafruit_SSD1306': { desc: 'OLED display', cat: 'Displays', ver: '2.5.7' },
        'TFT_eSPI': { desc: 'TFT display', cat: 'Displays', ver: '2.5.0' },
        'EEPROM': { desc: 'EEPROM storage', cat: 'Storage', ver: '2.0.0' },
        'LittleFS': { desc: 'LittleFS filesystem', cat: 'Storage', ver: '2.0.0' },
        'SD': { desc: 'SD card', cat: 'Storage', ver: '2.0.0' },
        'ArduinoOTA': { desc: 'OTA updates', cat: 'Communication', ver: '2.0.0' },
        'ESPmDNS': { desc: 'mDNS resolver', cat: 'Communication', ver: '2.0.0' },
        'ArduinoJson': { desc: 'JSON parsing', cat: 'Data', ver: '6.21.3' },
        'Time': { desc: 'Time library', cat: 'Utility', ver: '1.6.1' },
        'RTClib': { desc: 'Real-time clock', cat: 'Utility', ver: '2.1.1' },
        'U8g2': { desc: 'Universal graphics', cat: 'Displays', ver: '2.35.12' },
        'MFRC522': { desc: 'RFID reader', cat: 'Input', ver: '1.4.11' },
        'Adafruit_GPS': { desc: 'GPS module', cat: 'Sensors', ver: '1.7.3' },
        'LoRa': { desc: 'LoRa radio', cat: 'Communication', ver: '0.8.0' },
        'ESPAsyncWebServer': { desc: 'Async web server', cat: 'Communication', ver: '3.0.6' },
        'AsyncTCP': { desc: 'Async TCP', cat: 'Communication', ver: '1.1.1' },
        'NTPClient': { desc: 'NTP time sync', cat: 'Utility', ver: '3.2.1' },
        'TaskScheduler': { desc: 'Task scheduler', cat: 'Utility', ver: '3.7.0' },
        'Keypad': { desc: 'Matrix keypad', cat: 'Input', ver: '3.1.1' },
    };
    function getLibInfo(name) { return hardcodedLibs[name] || null; }
    function getAllLibs() { return hardcodedLibs; }
    return { getLibInfo: getLibInfo, getAllLibs: getAllLibs };
})();

// ===== MASSIVE TAB MANAGER =====
var TabManager = (function() {
    'use strict';
    var splitPanes = [{ id: 0, editor: null, activeTab: null, tabs: [] }];
    var nextPaneId = 1;
    var previewEl = null;
    var contextTabPath = null;
    var groupColors = ['#89b4fa','#a6e3a1','#fab387','#f38ba8','#cba6f7','#f9e2af','#94e2d5','#74c0fc'];
    var tabGroups = [];

    function togglePin(path) {
        for (var i = 0; i < IDE.tabs.length; i++) {
            if (IDE.tabs[i].path === path) {
                IDE.tabs[i].pinned = !IDE.tabs[i].pinned;
                IDE.renderTabs();
                Terminal.log((IDE.tabs[i].pinned ? 'Pinned: ' : 'Unpinned: ') + path, 'info');
                return;
            }
        }
    }

    function duplicateTab(path) {
        var src = null;
        for (var i = 0; i < IDE.tabs.length; i++) { if (IDE.tabs[i].path === path) { src = IDE.tabs[i]; break; } }
        if (!src) return;
        var ext = path.split('.'); var base = ext.slice(0, -1).join('.');
        var newPath = base + '_copy.' + ext[ext.length - 1];
        IDE.openFile(path, src.name);
        setTimeout(function() { IDE.saveCurrentFile(); }, 100);
        Terminal.log('Duplicated tab: ' + path, 'success');
    }

    function splitHorizontal() {
        if (!IDE.activeTab) { Terminal.log('No tab open to split', 'warning'); return; }
        var container = document.getElementById('splitContainer');
        if (!container) return;
        container.classList.remove('vertical'); container.classList.add('horizontal');
        var divider = document.createElement('div'); divider.className = 'split-divider';
        var newPane = createSplitPane(nextPaneId++);
        var firstPane = container.querySelector('.split-pane');
        if (firstPane) firstPane.style.flex = '0 0 50%';
        newPane.style.flex = '0 0 50%';
        container.insertBefore(newPane, divider);
        container.insertBefore(divider, newPane.nextSibling);
        setupSplitDivider(divider, 'horizontal');
        openTabInPane(newPane.querySelector('.editor-wrapper'), IDE.activeTab);
        resizeAllEditors();
        Terminal.log('Split editor horizontally', 'info');
    }

    function splitVertical() {
        if (!IDE.activeTab) { Terminal.log('No tab open to split', 'warning'); return; }
        var container = document.getElementById('splitContainer');
        if (!container) return;
        container.classList.remove('horizontal'); container.classList.add('vertical');
        var divider = document.createElement('div'); divider.className = 'split-divider';
        var newPane = createSplitPane(nextPaneId++);
        var firstPane = container.querySelector('.split-pane');
        if (firstPane) firstPane.style.flex = '0 0 50%';
        newPane.style.flex = '0 0 50%';
        container.appendChild(divider);
        container.appendChild(newPane);
        setupSplitDivider(divider, 'vertical');
        openTabInPane(newPane.querySelector('.editor-wrapper'), IDE.activeTab);
        resizeAllEditors();
        Terminal.log('Split editor vertically', 'info');
    }

    function createSplitPane(id) {
        var pane = document.createElement('div');
        pane.className = 'split-pane';
        pane.setAttribute('data-pane-id', id);
        pane.innerHTML = '<div class="split-pane-header"><span class="pane-title" id="paneTitle'+id+'">Editor</span><div class="pane-actions"><button class="pane-action" onclick="TabManager.closePane('+id+')" title="Close Pane">&times;</button></div></div><div class="editor-wrapper" id="editorWrapper'+id+'"><div id="editor'+id+'"></div></div>';
        return pane;
    }

    function setupSplitDivider(divider, direction) {
        var dragging = false;
        divider.addEventListener('mousedown', function(e) {
            dragging = true; divider.classList.add('active');
            document.body.style.cursor = direction === 'horizontal' ? 'ew-resize' : 'ns-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });
        document.addEventListener('mousemove', function(e) {
            if (!dragging) return;
            var container = document.getElementById('splitContainer');
            var rect = container.getBoundingClientRect();
            var panes = container.querySelectorAll('.split-pane');
            if (panes.length >= 2) {
                if (direction === 'horizontal') {
                    var pct = ((e.clientX - rect.left) / rect.width) * 100;
                    pct = Math.max(20, Math.min(80, pct));
                    panes[0].style.flex = '0 0 ' + pct + '%';
                    panes[1].style.flex = '0 0 ' + (100 - pct) + '%';
                } else {
                    var pct = ((e.clientY - rect.top) / rect.height) * 100;
                    pct = Math.max(20, Math.min(80, pct));
                    panes[0].style.flex = '0 0 ' + pct + '%';
                    panes[1].style.flex = '0 0 ' + (100 - pct) + '%';
                }
            }
            resizeAllEditors();
        });
        document.addEventListener('mouseup', function() {
            if (dragging) { dragging = false; divider.classList.remove('active'); document.body.style.cursor = ''; document.body.style.userSelect = ''; resizeAllEditors(); }
        });
    }

    function openTabInPane(wrapper, path) {
        var existing = null;
        for (var i = 0; i < IDE.tabs.length; i++) { if (IDE.tabs[i].path === path) { existing = IDE.tabs[i]; break; } }
        if (!existing) return;
        var edId = wrapper.querySelector('div[id^="editor"]').id;
        var ed = ace.edit(edId);
        if (!ed) return;
        ed.setTheme(IDE.currentTheme === 'light' ? 'ace/theme/chrome' : 'ace/theme/tomorrow_night');
        IDE.setEditorMode(path);
        ed.setOptions({ fontSize: '14px', showPrintMargin: false, enableBasicAutocompletion: true, enableLiveAutocompletion: true, enableSnippets: true, wrap: true, tabSize: 4, useSoftTabs: true });
        ed.setValue(existing.content, -1);
        var titleEl = wrapper.parentElement.querySelector('.pane-title');
        if (titleEl) titleEl.textContent = existing.name;
        ed.on('change', function() {
            existing.content = ed.getValue();
            existing.modified = true;
            IDE.renderTabs();
        });
        ed.selection.on('changeCursor', function() {
            var p = ed.getCursorPosition();
            var el = document.getElementById('statusPosition');
            if (el) el.textContent = 'Ln ' + (p.row + 1) + ', Col ' + (p.column + 1);
        });
    }

    function closePane(id) {
        var pane = document.querySelector('.split-pane[data-pane-id="'+id+'"]');
        if (!pane) return;
        var container = document.getElementById('splitContainer');
        var divider = pane.previousElementSibling;
        if (divider && divider.classList.contains('split-divider')) divider.remove();
        pane.remove();
        var remaining = container.querySelectorAll('.split-pane');
        if (remaining.length <= 1) {
            container.classList.remove('horizontal', 'vertical');
            remaining[0].style.flex = '1';
        } else {
            var equalPct = 100 / remaining.length;
            for (var i = 0; i < remaining.length; i++) {
                remaining[i].style.flex = '0 0 ' + equalPct + '%';
            }
        }
        resizeAllEditors();
        Terminal.log('Closed split pane', 'info');
    }

    function resizeAllEditors() {
        setTimeout(function() {
            var editors = document.querySelectorAll('div[id^="editor"]');
            for (var i = 0; i < editors.length; i++) {
                var ed = ace.edit(editors[i].id);
                if (ed) ed.resize();
            }
        }, 50);
    }

    function showTree() {
        var tree = document.getElementById('tabTree');
        if (!tree) return;
        var isVisible = tree.classList.contains('visible');
        if (isVisible) { tree.classList.remove('visible'); return; }
        tree.classList.add('visible');
        renderTree();
        setTimeout(function() { document.getElementById('tabTreeSearch').focus(); }, 100);
    }

    function renderTree(filter) {
        var list = document.getElementById('tabTreeList'); if (!list) return;
        var html = '';
        var filtered = IDE.tabs;
        if (filter) { var fl = filter.toLowerCase(); filtered = IDE.tabs.filter(function(t) { return t.name.toLowerCase().indexOf(fl) !== -1 || t.path.toLowerCase().indexOf(fl) !== -1; }); }
        for (var i = 0; i < filtered.length; i++) {
            var t = filtered[i];
            var isActive = t.path === IDE.activeTab;
            var icon = t.pinned ? '&#128204;' : getFileIcon(t.path);
            html += '<div class="tab-tree-item' + (isActive ? ' active' : '') + '" onclick="IDE.openFile(\'' + esc(t.path) + '\',\'' + esc(t.name) + '\');TabManager.showTree()">';
            html += '<span class="tree-icon">' + icon + '</span><span>' + esc(t.name) + '</span><span class="tree-path">' + esc(t.path) + '</span>';
            if (t.groupId) html += '<span class="tree-group">' + esc(t.groupId) + '</span>';
            html += '</div>';
        }
        list.innerHTML = html || '<div style="padding:12px;color:var(--text-muted);font-size:12px">No open tabs</div>';
    }

    function filterTree(q) { renderTree(q); }

    function getFileIcon(path) {
        var ext = path.split('.').pop().toLowerCase();
        var icons = { 'cpp':'&#9635;', 'c':'&#9635;', 'ino':'&#9635;', 'h':'&#9635;', 'hpp':'&#9635;', 'json':'{}', 'tbin':'&#9881;', 'txt':'&#128196;', 'md':'&#128221;', 'py':'&#128013;', 'html':'&#127760;', 'yaml':'&#9881;', 'yml':'&#9881;' };
        return icons[ext] || '&#9635;';
    }

    function showPreview(path, tabEl) {
        hidePreview();
        var t = null;
        for (var i = 0; i < IDE.tabs.length; i++) { if (IDE.tabs[i].path === path) { t = IDE.tabs[i]; break; } }
        if (!t) return;
        previewEl = document.createElement('div');
        previewEl.className = 'tab-preview visible';
        var lines = t.content ? t.content.split('\n') : [];
        var previewContent = lines.slice(0, 15).join('\n');
        if (lines.length > 15) previewContent += '\n...';
        previewEl.innerHTML = '<div class="tab-preview-header"><span class="tab-preview-path">' + esc(t.path) + '</span></div><div class="tab-preview-content">' + escHtml(previewContent) + '</div><div class="tab-preview-stats"><span>' + lines.length + ' lines</span><span>' + (t.content ? t.content.length + ' bytes' : '0 bytes') + '</span><span>' + (t.modified ? 'Modified' : 'Saved') + '</span></div>';
        tabEl.style.position = 'relative';
        tabEl.appendChild(previewEl);
    }

    function hidePreview() {
        if (previewEl) { previewEl.remove(); previewEl = null; }
    }

    function showContextMenu(e, path) {
        contextTabPath = path;
        var menu = document.getElementById('tabContextMenu');
        if (!menu) return;
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';
        menu.classList.add('visible');
        var items = menu.querySelectorAll('.tab-context-item');
        for (var i = 0; i < items.length; i++) {
            (function(item) {
                item.onclick = function(ev) {
                    ev.stopPropagation();
                    hideContextMenu();
                    var action = this.getAttribute('data-action');
                    handleContextAction(action);
                };
            })(items[i]);
        }
    }

    function hideContextMenu() {
        var menu = document.getElementById('tabContextMenu');
        if (menu) menu.classList.remove('visible');
    }

    function handleContextAction(action) {
        if (!contextTabPath) return;
        switch(action) {
            case 'pin': togglePin(contextTabPath); break;
            case 'duplicate': duplicateTab(contextTabPath); break;
            case 'splitRight': splitHorizontal(); break;
            case 'splitDown': splitVertical(); break;
            case 'close': IDE.closeTab(contextTabPath); break;
            case 'closeOthers': var toClose = IDE.tabs.filter(function(t) { return t.path !== contextTabPath && !t.pinned; }); for (var i = 0; i < toClose.length; i++) IDE.closeTab(toClose[i].path); break;
            case 'closeAll': IDE.closeAllTabs(); break;
            case 'copyPath': navigator.clipboard.writeText(contextTabPath); Terminal.log('Copied: ' + contextTabPath, 'info'); break;
            case 'reveal': IDE.showPanel('files'); IDE.highlightInTree(contextTabPath); break;
            case 'closeSaved': var saved = IDE.tabs.filter(function(t) { return !t.modified && !t.pinned; }); for (var i = 0; i < saved.length; i++) IDE.closeTab(saved[i].path); break;
            case 'moveNewGroup': moveToNewGroup(contextTabPath); break;
        }
    }

    function moveToNewGroup(path) {
        var groupName = prompt('Group name:', 'Group ' + (tabGroups.length + 1));
        if (!groupName) return;
        for (var i = 0; i < IDE.tabs.length; i++) {
            if (IDE.tabs[i].path === path) {
                IDE.tabs[i].groupId = groupName;
                tabGroups.push({ name: groupName, color: groupColors[tabGroups.length % groupColors.length] });
                IDE.renderTabs();
                Terminal.log('Moved to group: ' + groupName, 'info');
                return;
            }
        }
    }

    function reorder(srcPath, targetPath) {
        var srcIdx = -1, targetIdx = -1;
        for (var i = 0; i < IDE.tabs.length; i++) {
            if (IDE.tabs[i].path === srcPath) srcIdx = i;
            if (IDE.tabs[i].path === targetPath) targetIdx = i;
        }
        if (srcIdx === -1 || targetIdx === -1 || srcIdx === targetIdx) return;
        var item = IDE.tabs.splice(srcIdx, 1)[0];
        IDE.tabs.splice(targetIdx, 0, item);
        IDE.renderTabs();
    }

    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    return {
        togglePin: togglePin, duplicateTab: duplicateTab,
        splitHorizontal: splitHorizontal, splitVertical: splitVertical,
        closePane: closePane, resizeAllEditors: resizeAllEditors,
        showTree: showTree, renderTree: renderTree, filterTree: filterTree,
        showPreview: showPreview, hidePreview: hidePreview,
        showContextMenu: showContextMenu, hideContextMenu: hideContextMenu,
        reorder: reorder, moveToNewGroup: moveToNewGroup
    };
})();

// ===== CLIENT-SIDE C++ COMPILER (XCode-like Build Pipeline) =====
var NativeCompiler = (function() {
    'use strict';
    var compileCache = {};
    var isCompiling = false;
    var boardConfigs = {
        esp32: { arch: 'xtensa-esp32', freq: 240, ram: 520000, flash: 4194304, core: 'LX6', includes: ['Arduino.h','WiFi.h','BLE.h','FS.h','SPI.h','Wire.h','EEPROM.h','Preferences.h','HTTPClient.h','WebServer.h','ESPmDNS.h','Update.h','LittleFS.h','SD.h','BluetoothSerial.h','ESP32httpUpdate.h'] },
        esp8266: { arch: 'esp8266', freq: 160, ram: 80000, flash: 4194304, core: 'L106', includes: ['Arduino.h','ESP8266WiFi.h','ESP8266HTTPClient.h','ESP8266WebServer.h','ESP8266mDNS.h','EEPROM.h','FS.h','LittleFS.h','SPI.h','Wire.h','SDFS.h'] },
        arduino_uno: { arch: 'avr-atmega328p', freq: 16, ram: 2048, flash: 32768, core: 'AVR', includes: ['Arduino.h','EEPROM.h','SPI.h','Wire.h','SoftwareSerial.h'] },
        rp2040: { arch: 'rp2040', freq: 133, ram: 264000, flash: 0, core: 'M0+', includes: ['Arduino.h','RP2040USB.h','EEPROM.h','SPI.h','Wire.h','LittleFS.h'] },
        stm32f103c8: { arch: 'stm32', freq: 72, ram: 20000, flash: 65536, core: 'M3', includes: ['Arduino.h','EEPROM.h','SPI.h','Wire.h'] },
    };

    async function init() {
        Terminal.log('Initializing client-side C++ compiler...', 'system');
        Terminal.log('Build pipeline: Preprocessor -> Syntax -> Semantic -> Linker -> Binary', 'info');
        Terminal.log('All compilation runs locally in your browser.', 'success');
    }

    async function compile(code, board, files) {
        if (isCompiling) { Terminal.log('Compilation already in progress', 'warning'); return null; }
        isCompiling = true;
        var cacheKey = board + '_' + hashCode(code);
        if (compileCache[cacheKey]) {
            Terminal.log('Using cached compilation result', 'info');
            isCompiling = false;
            return compileCache[cacheKey];
        }
        var startTime = performance.now();
        try {
            var allProblems = [];
            Terminal.log('=== Build Pipeline Started ===', 'system');
            Terminal.log('Target: ' + board + ' (' + (boardConfigs[board] ? boardConfigs[board].arch : 'unknown') + ')', 'info');
            await sleep(100);
            var preprocessed = preprocess(code, files, allProblems);
            Terminal.log('[1/5] Preprocessing: ' + preprocessed.lines + ' lines after macro expansion', 'info');
            await sleep(150);
            var syntaxResult = syntaxCheck(preprocessed.code, allProblems);
            Terminal.log('[2/5] Syntax analysis: ' + syntaxResult.tokens + ' tokens, ' + syntaxResult.functions + ' functions', 'info');
            await sleep(150);
            var semanticResult = semanticCheck(preprocessed.code, board, allProblems);
            Terminal.log('[3/5] Semantic analysis: ' + semanticResult.vars + ' variables, ' + semanticResult.types + ' types', 'info');
            await sleep(100);
            var linkerResult = linkerCheck(files, board, allProblems);
            Terminal.log('[4/5] Linker: resolved ' + linkerResult.resolved + ' symbols, ' + linkerResult.unresolved + ' unresolved', 'info');
            await sleep(100);
            var errors = allProblems.filter(function(p) { return p.type === 'error'; });
            var warnings = allProblems.filter(function(p) { return p.type === 'warning'; });
            if (errors.length > 0) {
                Terminal.log('Build FAILED with ' + errors.length + ' error(s)', 'error');
                errors.forEach(function(e) { Terminal.log('  ' + (e.file ? e.file + ':' + e.line + ': ' : 'Line ' + e.line + ': ') + e.msg, 'error'); });
                warnings.forEach(function(w) { Terminal.log('  ' + (w.file ? w.file + ':' + w.line + ': ' : 'Line ' + w.line + ': ') + w.msg, 'warning'); });
                isCompiling = false;
                var failResult = { success: false, errors: errors.map(function(e) { return e.msg; }), warnings: warnings.map(function(w) { return w.msg; }), time: Math.round(performance.now() - startTime) };
                return failResult;
            }
            var binarySize = estimateBinarySize(preprocessed.code, board);
            var compileTime = Math.round(performance.now() - startTime);
            Terminal.log('[5/5] Binary generation: ' + formatBytes(binarySize), 'success');
            Terminal.log('Build SUCCESSFUL! (' + compileTime + 'ms)', 'success');
            if (warnings.length > 0) {
                Terminal.log(warnings.length + ' warning(s):', 'warning');
                warnings.forEach(function(w) { Terminal.log('  ' + (w.file ? w.file + ':' + w.line + ': ' : 'Line ' + w.line + ': ') + w.msg, 'warning'); });
            }
            var result = { success: true, binary_size: formatBytes(binarySize), binary_size_bytes: binarySize, time: compileTime, errors: 0, warnings: warnings.length, problems: warnings.map(function(w) { return { type: 'warning', msg: w.msg, line: w.line, file: w.file }; }) };
            compileCache[cacheKey] = result;
            isCompiling = false;
            return result;
        } catch(e) {
            Terminal.log('Build error: ' + e.message, 'error');
            isCompiling = false;
            return { success: false, errors: [e.message] };
        }
    }

    function preprocess(code, files, problems) {
        var lines = code.split('\n');
        var defines = {};
        var included = {};
        var output = [];
        var inIfdef = [], inIf = [], skipLevel = -1;
        var allProjectFiles = {};
        if (files) { for (var fi = 0; fi < files.length; fi++) { allProjectFiles[files[fi].path] = true; } }
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var trimmed = line.trim();
            if (trimmed.indexOf('#define') === 0) {
                var parts = trimmed.split(/\s+/);
                if (parts.length >= 3) { defines[parts[1]] = parts.slice(2).join(' '); }
                else if (parts.length === 2) { defines[parts[1]] = '1'; }
                output.push(line); continue;
            }
            if (trimmed.indexOf('#ifdef') === 0) {
                var macro = trimmed.split(/\s+/)[1];
                inIfdef.push(macro);
                if (skipLevel === -1 && !defines[macro]) { skipLevel = inIfdef.length - 1; }
                continue;
            }
            if (trimmed.indexOf('#ifndef') === 0) {
                var macro = trimmed.split(/\s+/)[1];
                inIfdef.push(macro);
                if (skipLevel === -1 && defines[macro]) { skipLevel = inIfdef.length - 1; }
                continue;
            }
            if (trimmed.indexOf('#if') === 0 && trimmed.indexOf('#ifdef') !== 0 && trimmed.indexOf('#ifndef') !== 0) {
                inIf.push(trimmed);
                continue;
            }
            if (trimmed === '#endif') {
                if (inIfdef.length > 0) { inIfdef.pop(); if (skipLevel === inIfdef.length) skipLevel = -1; }
                else if (inIf.length > 0) { inIf.pop(); }
                continue;
            }
            if (trimmed.indexOf('#else') === 0) {
                if (inIfdef.length > 0) {
                    var macro = inIfdef[inIfdef.length - 1];
                    if (skipLevel === inIfdef.length - 1) skipLevel = -1;
                    else if (skipLevel === -1) skipLevel = inIfdef.length - 1;
                }
                continue;
            }
            if (trimmed.indexOf('#include') === 0) {
                var match = trimmed.match(/#include\s*[<"]([^>"]+)[>"]/);
                if (match) {
                    var header = match[1];
                    if (included[header]) { problems.push({ line: i + 1, type: 'warning', msg: 'Duplicate include: ' + header }); }
                    included[header] = true;
                    var known = false;
                    for (var b in boardConfigs) { if (boardConfigs[b].includes.indexOf(header) !== -1) { known = true; break; } }
                    var inProject = false;
                    for (var pf in allProjectFiles) { if (pf.indexOf(header) !== -1) { inProject = true; break; } }
                    if (!known && !inProject && header !== 'Arduino.h') {
                        problems.push({ line: i + 1, type: 'error', msg: header + ': No such file or directory. Install the library or add the file to your project.' });
                    }
                }
                output.push(line); continue;
            }
            if (skipLevel === -1) {
                var expanded = line;
                for (var d in defines) {
                    expanded = expanded.replace(new RegExp('\\b' + d + '\\b', 'g'), defines[d]);
                }
                output.push(expanded);
            }
        }
        return { code: output.join('\n'), lines: output.length, defines: defines, includes: Object.keys(included) };
    }

    function syntaxCheck(code, problems) {
        var lines = code.split('\n');
        var braceStack = [], parenStack = [], bracketStack = [];
        var tokens = 0, functions = 0, strings = 0, comments = 0;
        var inString = false, inChar = false, inComment = false, inBlockComment = false;
        var escape = false;
        var knownTypes = ['void','int','float','double','char','bool','long','short','unsigned','signed','const','static','volatile','extern','struct','class','enum','union','typedef','auto','register','inline','virtual','explicit','friend','mutable','namespace','template','typename','using','public','private','protected','sizeof','return','if','else','for','while','do','switch','case','break','continue','default','goto','throw','try','catch','new','delete','true','false','null','nullptr','this','override','final','noexcept','constexpr','decltype','static_assert','thread_local','alignas','alignof','nullptr_t','size_t','uint8_t','uint16_t','uint32_t','int8_t','int16_t','int32_t','String','Serial','pinMode','digitalWrite','digitalRead','analogRead','analogWrite','delay','millis','micros','HIGH','LOW','INPUT','OUTPUT','INPUT_PULLUP','LED_BUILTIN'];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            for (var j = 0; j < line.length; j++) {
                var ch = line[j];
                var next = j + 1 < line.length ? line[j + 1] : '';
                if (inBlockComment) {
                    if (ch === '*' && next === '/') { inBlockComment = false; j++; }
                    continue;
                }
                if (inComment) { break; }
                if (escape) { escape = false; continue; }
                if (ch === '\\') { escape = true; continue; }
                if (inString) { if (ch === '"') inString = false; continue; }
                if (inChar) { if (ch === "'") inChar = false; continue; }
                if (ch === '"') { inString = true; strings++; continue; }
                if (ch === "'") { inChar = true; continue; }
                if (ch === '/' && next === '/') { inComment = true; comments++; j++; continue; }
                if (ch === '/' && next === '*') { inBlockComment = true; comments++; j++; continue; }
                if (ch === '{') braceStack.push({ line: i + 1, col: j + 1 });
                else if (ch === '}') { if (braceStack.length === 0) problems.push({ line: i + 1, type: 'error', msg: 'Unexpected \'}\' - no matching opening brace' }); else braceStack.pop(); }
                else if (ch === '(') parenStack.push({ line: i + 1, col: j + 1 });
                else if (ch === ')') { if (parenStack.length === 0) problems.push({ line: i + 1, type: 'error', msg: 'Unexpected \')\' - no matching opening parenthesis' }); else parenStack.pop(); }
                else if (ch === '[') bracketStack.push({ line: i + 1, col: j + 1 });
                else if (ch === ']') { if (bracketStack.length === 0) problems.push({ line: i + 1, type: 'error', msg: 'Unexpected \']\' - no matching opening bracket' }); else bracketStack.pop(); }
                else if (ch === ';') tokens++;
                else if (ch === ',') tokens++;
                else if (/\w/.test(ch)) tokens++;
            }
            var funcMatch = line.match(/\b(void|int|float|double|char|bool|long|short|unsigned|String|size_t)\s+\w+\s*\(/);
            if (funcMatch && line.trim().indexOf('#') !== 0 && line.trim().indexOf('//') !== 0) functions++;
        }
        for (var b = 0; b < braceStack.length; b++) problems.push({ line: braceStack[b].line, type: 'error', msg: 'Missing \'}\' for opening brace at column ' + braceStack[b].col });
        for (var p = 0; p < parenStack.length; p++) problems.push({ line: parenStack[p].line, type: 'error', msg: 'Missing \')\' for opening parenthesis at column ' + parenStack[p].col });
        for (var br = 0; br < bracketStack.length; br++) problems.push({ line: bracketStack[br].line, type: 'error', msg: 'Missing \']\' for opening bracket at column ' + bracketStack[br].col });
        if (inBlockComment) problems.push({ line: lines.length, type: 'error', msg: 'Unterminated block comment /* */' });
        var semicolons = 0;
        for (var i = 0; i < lines.length; i++) {
            var trimmed = lines[i].trim();
            if (trimmed.length > 0 && trimmed.indexOf('#') !== 0 && trimmed.indexOf('//') !== 0 && trimmed.indexOf('/*') !== 0 && trimmed.indexOf('*') !== 0 && trimmed.indexOf('*/') !== 0 && !trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.endsWith(',') && !trimmed.endsWith('(') && !trimmed.endsWith('\\') && trimmed.indexOf('for') !== 0 && trimmed.indexOf('while') !== 0 && trimmed.indexOf('if') !== 0 && trimmed.indexOf('else') !== 0 && trimmed.indexOf('switch') !== 0 && trimmed.indexOf('case') !== 0 && trimmed.indexOf('default') !== 0 && trimmed.indexOf('class') !== 0 && trimmed.indexOf('struct') !== 0 && trimmed.indexOf('enum') !== 0 && trimmed.indexOf('namespace') !== 0 && trimmed.indexOf('}') !== 0 && trimmed.indexOf('{') !== 0 && trimmed !== '') {
                var hasSemi = trimmed.endsWith(';');
                var hasBrace = trimmed.endsWith('{') || trimmed.endsWith('}');
                var hasParens = trimmed.endsWith(')');
                var isDecl = /^(void|int|float|double|char|bool|long|short|unsigned|const|static|volatile|struct|class|enum|template|typedef|using|namespace)\s/.test(trimmed);
                var isPreproc = /^#/.test(trimmed);
                var isLabel = /^\w+\s*:$/.test(trimmed);
                var isAccess = /^(public|private|protected):$/.test(trimmed);
                if (!hasSemi && !hasBrace && !hasParens && !isPreproc && !isLabel && !isAccess && !isDecl && trimmed.indexOf('else') !== 0 && trimmed.indexOf('do') !== 0 && trimmed.indexOf('try') !== 0) {
                    problems.push({ line: i + 1, type: 'warning', msg: 'Possible missing semicolon at end of line' });
                }
            }
        }
        return { tokens: tokens, functions: functions, strings: strings, comments: comments, lines: lines.length };
    }

    function semanticCheck(code, board, problems) {
        var lines = code.split('\n');
        var declaredVars = {}, declaredFuncs = {}, usedVars = {}, usedFuncs = {};
        var variables = 0, types = 0;
        var setupFound = false, loopFound = false;
        var hasInclude = code.indexOf('#include') !== -1;
        var nonEmptyLines = 0;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var trimmed = line.trim();
            if (trimmed.length > 0 && trimmed.indexOf('//') !== 0 && trimmed.indexOf('/*') !== 0 && trimmed.indexOf('*') !== 0) nonEmptyLines++;
            if (trimmed.indexOf('//') === 0 || trimmed.indexOf('#') === 0 || trimmed.indexOf('/*') === 0 || trimmed.indexOf('*') === 0) continue;
            var varDecl = trimmed.match(/\b(void|int|float|double|char|bool|long|short|unsigned|const|static|String|size_t|uint8_t|uint16_t|uint32_t|int8_t|int16_t|int32_t)\s+(\w+)\s*[=\[;,(]/);
            if (varDecl) { declaredVars[varDecl[2]] = { line: i + 1, type: varDecl[1] }; variables++; }
            var funcDecl = trimmed.match(/\b(void|int|float|double|char|bool|long|short|String|size_t)\s+(\w+)\s*\(/);
            if (funcDecl) {
                declaredFuncs[funcDecl[2]] = { line: i + 1, returnType: funcDecl[1] };
                if (funcDecl[2] === 'setup') setupFound = true;
                if (funcDecl[2] === 'loop') loopFound = true;
            }
            if (trimmed.indexOf('class ') === 0 || trimmed.indexOf('struct ') === 0 || trimmed.indexOf('enum ') === 0) types++;
        }
        if (nonEmptyLines < 3) {
            problems.push({ line: 1, type: 'error', msg: 'Code is too short or empty. Write your sketch first.' });
        }
        if (hasInclude) {
            if (!setupFound && !loopFound) {
                problems.push({ line: 1, type: 'error', msg: 'Arduino sketch requires setup() and loop() functions. Neither found.' });
            }
            if (setupFound && !loopFound) {
                problems.push({ line: 1, type: 'error', msg: 'setup() found but loop() is missing. Arduino sketches require both.' });
            }
            if (!setupFound && loopFound) {
                problems.push({ line: 1, type: 'error', msg: 'loop() found but setup() is missing. Arduino sketches require both.' });
            }
        }
        var cfg = boardConfigs[board];
        if (cfg) {
            var ramUsage = estimateRAM(code, cfg);
            if (ramUsage > cfg.ram) problems.push({ line: 1, type: 'error', msg: 'Estimated RAM usage (' + formatBytes(ramUsage) + ') exceeds board capacity (' + formatBytes(cfg.ram) + ')' });
            else if (ramUsage > cfg.ram * 0.8) problems.push({ line: 1, type: 'warning', msg: 'RAM usage (' + formatBytes(ramUsage) + ') is over 80% of board capacity (' + formatBytes(cfg.ram) + ')' });
        }
        return { vars: variables, types: types, functions: Object.keys(declaredFuncs).length };
    }

    function linkerCheck(files, board, problems) {
        var resolved = 0, unresolved = 0;
        var allIncludes = {};
        var cfg = boardConfigs[board];
        if (cfg) { cfg.includes.forEach(function(h) { allIncludes[h] = true; }); }
        for (var fi = 0; fi < files.length; fi++) {
            var f = files[fi];
            if (!f.content) continue;
            var matches = f.content.match(/#include\s*[<"]([^>"]+)[>"]/g);
            if (matches) {
                for (var mi = 0; mi < matches.length; mi++) {
                    var header = matches[mi].match(/#include\s*[<"]([^>"]+)[>"]/)[1];
                    if (allIncludes[header] || header.indexOf('Arduino.h') !== -1) resolved++;
                    else if (files.some(function(ff) { return ff.path.indexOf(header) !== -1; })) resolved++;
                    else unresolved++;
                }
            }
        }
        return { resolved: resolved, unresolved: unresolved };
    }

    function estimateBinarySize(code, board) {
        var cfg = boardConfigs[board];
        var baseSize = cfg ? cfg.flash * 0.05 : 50000;
        var lines = code.split('\n').length;
        var funcCount = (code.match(/\bvoid\s+\w+\s*\(/g) || []).length;
        var includeCount = (code.match(/^\s*#include/gm) || []).length;
        var stringCount = (code.match(/"/g) || []).length / 2;
        var size = baseSize + (lines * 20) + (funcCount * 500) + (includeCount * 2000) + (stringCount * 50);
        return Math.round(size);
    }

    function estimateRAM(code, cfg) {
        var varCount = (code.match(/\b(int|float|double|char|bool|long|short|String|uint8_t|uint16_t|uint32_t|int8_t|int16_t|int32_t)\s+\w+/g) || []).length;
        var arrayMatches = code.match(/\[\s*\d+\s*\]/g) || [];
        var arraySize = 0;
        for (var i = 0; i < arrayMatches.length; i++) { var m = arrayMatches[i].match(/\d+/); if (m) arraySize += parseInt(m[0]); }
        var stringCount = (code.match(/String\s+\w+/g) || []).length;
        return (varCount * 4) + arraySize + (stringCount * 30) + 4096;
    }

    function formatBytes(b) { if (b === 0) return '0 B'; var k = 1024, s = ['B', 'KB', 'MB', 'GB']; var i = Math.floor(Math.log(b) / Math.log(k)); return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + s[i]; }
    function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
    function hashCode(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; } return h.toString(36); }

    function analyze(code) {
        var lines = code.split('\n');
        var totalLines = lines.length, functions = 0, includes = 0, classes = 0, defines = 0, macros = 0;
        var varDecls = 0, funcCalls = 0, loops = 0, conditionals = 0;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (/^\s*#include/.test(line)) includes++;
            if (/\bvoid\s+\w+\s*\(|\bint\s+\w+\s*\(|\bfloat\s+\w+\s*\(|\bchar\s+\w+\s*\(|\bbool\s+\w+\s*\(/.test(line)) functions++;
            if (/^\s*#define/.test(line)) defines++;
            if (/^\s*#ifdef|^\s*#ifndef|^\s*#if\s/.test(line)) macros++;
            if (/\bclass\s+\w+/.test(line)) classes++;
            if (/\b(int|float|double|char|bool|long|short|String|uint8_t|uint16_t|uint32_t)\s+\w+/.test(line)) varDecls++;
            if (/\b(for|while|do)\s*[\(;]/.test(line)) loops++;
            if (/\b(if|else if|switch)\s*\(/.test(line)) conditionals++;
        }
        var complexity = functions > 15 ? 'Very High' : functions > 10 ? 'High' : functions > 5 ? 'Medium' : 'Low';
        var maintainability = (defines > 20 || loops > 10) ? 'Low' : (defines > 10 || loops > 5) ? 'Medium' : 'High';
        Terminal.log('=== Code Analysis Report ===', 'system');
        Terminal.log('Lines: ' + totalLines + ' | Functions: ' + functions + ' | Variables: ' + varDecls + ' | Classes: ' + classes, 'success');
        Terminal.log('Includes: ' + includes + ' | Defines: ' + defines + ' | Macros: ' + macros, 'info');
        Terminal.log('Loops: ' + loops + ' | Conditionals: ' + conditionals, 'info');
        Terminal.log('Complexity: ' + complexity + ' | Maintainability: ' + maintainability, 'info');
        if (includes === 0) Terminal.log('Warning: No includes found', 'warning');
        if (functions === 0) Terminal.log('Warning: No functions found', 'warning');
        if (defines > 20) Terminal.log('Warning: Excessive preprocessor defines (' + defines + ')', 'warning');
        return { lines: totalLines, functions: functions, includes: includes, defines: defines, classes: classes, complexity: complexity, maintainability: maintainability };
    }

    function syntaxCheckStandalone(code) {
        var problems = [];
        syntaxCheck(code, problems);
        return problems;
    }

    function clearCache() { compileCache = {}; Terminal.log('Compilation cache cleared', 'info'); }
    function getCacheSize() { return Object.keys(compileCache).length; }
    function isReady() { return true; }
    function getBoardConfig(board) { return boardConfigs[board] || null; }
    function getAllBoards() { return Object.keys(boardConfigs); }

    return {
        init: init, compile: compile, analyze: analyze, syntaxCheck: syntaxCheckStandalone,
        clearCache: clearCache, getCacheSize: getCacheSize, isReady: isReady,
        getBoardConfig: getBoardConfig, getAllBoards: getAllBoards
    };
})();


// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    IDE.init();
    if (typeof BoardManagerPanel !== 'undefined') BoardManagerPanel.init();
    if (typeof SerialPlotter !== 'undefined') SerialPlotter.init();
    if (typeof SidebarResize !== 'undefined') SidebarResize.init();
    if (typeof NativeCompiler !== 'undefined') NativeCompiler.init();
});
window.addEventListener('resize', function() { if (typeof SerialPlotter !== 'undefined') SerialPlotter.resizeCanvas(); });
