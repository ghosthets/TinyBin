<?php
declare(strict_types=1);

class TBinParser
{
    private array $config = [];
    private array $errors = [];

    public static function parse(string $content): array
    {
        $parser = new self();
        return $parser->parseContent($content);
    }

    private function parseContent(string $content): array
    {
        $this->config = [];
        $this->errors = [];
        $lines = explode("\n", $content);
        $section = null;
        $currentLib = null;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || $line[0] === '#') continue;

            if (str_starts_with($line, 'project_name:')) {
                $this->config['project_name'] = trim(substr($line, 14));
                $section = null;
            } elseif (str_starts_with($line, 'version:')) {
                $this->config['version'] = trim(substr($line, 9));
                $section = null;
            } elseif (str_starts_with($line, 'board:')) {
                $this->config['board'] = strtolower(trim(substr($line, 7)));
                $section = null;
            } elseif (str_starts_with($line, 'binary_path:')) {
                $this->config['binary_path'] = trim(substr($line, 13));
                $section = null;
            } elseif ($line === 'libraries:') {
                $section = 'libraries';
                $this->config['libraries'] = [];
            } elseif ($line === 'build:') {
                $section = 'build';
                $this->config['build'] = [];
            } elseif ($line === 'defines:') {
                $section = 'defines';
                $this->config['defines'] = [];
            } elseif ($section === 'libraries') {
                if (str_starts_with($line, '- name:')) {
                    $currentLib = ['name' => trim(substr($line, 8))];
                    $this->config['libraries'][] = $currentLib;
                } elseif (str_starts_with($line, 'version:') && $currentLib) {
                    $currentLib['version'] = trim(substr($line, 9));
                }
            } elseif ($section === 'build') {
                if (strpos($line, ':') !== false) {
                    [$key, $val] = explode(':', $line, 2);
                    $val = trim($val);
                    if ($val === 'true') $val = true;
                    elseif ($val === 'false') $val = false;
                    elseif (is_numeric($val)) $val = (int) $val;
                    $this->config['build'][trim($key)] = $val;
                }
            } elseif ($section === 'defines') {
                if (str_starts_with($line, '- ')) {
                    $this->config['defines'][] = trim(substr($line, 2));
                }
            }
        }

        $this->validate();
        return $this->config;
    }

    private function validate(): void
    {
        $required = ['project_name', 'board', 'binary_path'];
        foreach ($required as $key) {
            if (empty($this->config[$key])) {
                $this->errors[] = "Missing required field: $key";
            }
        }
    }

    public static function generate(string $name, string $board = 'esp32'): string
    {
        return <<<TBIN
# $name

project_name: $name
version: 1.0.0
board: $board
binary_path: build/$name.bin

## Libraries
libraries:
  - name: WiFi
    version: 2.0.0

## Build
build:
  optimization: -Os
  debug: false
  partitions: default
  flash_freq: 80m
  flash_size: 4MB

## Defines
defines:
  - USE_SERIAL
  - LED_BUILTIN=2
TBIN;
    }

    public static function getAllBoards(): array
    {
        return [
            'ESP8266 / ESP-01' => ['esp01','esp01s','esp12e','esp12f','esp8266','nodemcu','nodemcu_v2','nodemcu_v3','wemos_d1_mini','wemos_d1_mini_pro','huzzah','thing','thingdev'],
            'ESP32 Family' => ['esp32','esp32s2','esp32s3','esp32c3','esp32c6','esp32h2','huzzah32','feather_esp32'],
            'Arduino' => ['arduino_uno','arduino_nano','arduino_nano_old','arduino_mega','arduino_leonardo','arduino_micro','arduino_pro_mini','arduino_pro_mini_3v3','arduino_due','arduino_zero','arduino_mkr1000','arduino_mkrwifi1010','arduino_nano_33_iot','arduino_nano_33_ble'],
            'AVR' => ['attiny85','attiny84','attiny167','atmega328','atmega2560','atmega32u4'],
            'STM32' => ['stm32f103c8','stm32f103cb','stm32f407ve','stm32f411ce','stm32l476rg','stm32g071rb','stm32h743zi','bluepill','blackpill','nucleo_f103rb','nucleo_f446re','nucleo_l476rg','nucleo_g431rb','discovery_f4','discovery_l4'],
            'Raspberry Pi Pico' => ['rp2040','pico','pico_w','pico2','adafruit_qtpy_rp2040','adafruit_feather_rp2040','adafruit_itsybitsy_rp2040','waveshare_rp2040_zero'],
            'nRF / micro:bit' => ['nrf52832','nrf52840','nrf52_dk','nrf52840_dk','nrf52840_dongle','adafruit_feather_nrf52840','adafruit_clue_nrf52840','bbc_microbit','bbc_microbit_v2','nrf51822','nrf51_dk'],
            'Teensy' => ['teensy31','teensy35','teensy36','teensy40','teensy41','teensylc'],
            'Particle' => ['particle_photon','particle_electron','particle_argon','particle_boron','particle_xenon'],
            'M5Stack' => ['m5stack_core','m5stack_fire','m5stickc','m5stickc_plus','m5atom','m5atom_lite','m5atom_matrix','m5paper','m5core2','m5coreink','m5stamp_pico','m5stamp_c3','m5stamp_s3'],
            'TTGO / Heltec' => ['ttgo_tbeam','ttgo_twatch','ttgo_tdisplay','ttgo_lora32','heltec_wifi_lora32','heltec_wifi_kit_32','heltec_wireless_stick'],
            'LOLIN / Wemos' => ['lolin_s2_mini','lolin_s3','lolin_d32','lolin_d32_pro','lolin32','lolin32_lite','wemos_s2_mini','wemos_s3'],
            'DFRobot FireBeetle' => ['firebeetle_esp32','firebeetle_esp32e','firebeetle_esp32c6'],
            'Seeed XIAO' => ['xiao_esp32c3','xiao_esp32s3','xiao_rp2040','xiao_nrf52840','xiao_ble','xiao_esp32c6','xiao_esp32s3_sense','xiao_esp32c3_sense','xiao_m0','xiao_ble_sense'],
            'SAMD' => ['samd21','samd51'],
        ];
    }

    public static function getBoardName(string $id): string
    {
        $names = [
            'esp01'=>'ESP-01','esp01s'=>'ESP-01S','esp12e'=>'ESP-12E','esp12f'=>'ESP-12F','esp8266'=>'ESP8266',
            'nodemcu'=>'NodeMCU 1.0','nodemcu_v2'=>'NodeMCU V2','nodemcu_v3'=>'NodeMCU V3',
            'wemos_d1_mini'=>'Wemos D1 Mini','wemos_d1_mini_pro'=>'Wemos D1 Mini Pro',
            'huzzah'=>'HUZZAH ESP8266','huzzah32'=>'HUZZAH32 ESP32',
            'esp32'=>'ESP32 DevKit','esp32s2'=>'ESP32-S2','esp32s3'=>'ESP32-S3','esp32c3'=>'ESP32-C3','esp32c6'=>'ESP32-C6','esp32h2'=>'ESP32-H2',
            'arduino_uno'=>'Arduino Uno','arduino_nano'=>'Arduino Nano','arduino_mega'=>'Arduino Mega 2560',
            'stm32f103c8'=>'STM32F103C8 Blue Pill','bluepill'=>'Blue Pill','blackpill'=>'Black Pill',
            'rp2040'=>'RP2040','pico'=>'Raspberry Pi Pico','pico_w'=>'Raspberry Pi Pico W','pico2'=>'Raspberry Pi Pico 2',
            'nrf52832'=>'nRF52832','nrf52840'=>'nRF52840','bbc_microbit'=>'micro:bit','bbc_microbit_v2'=>'micro:bit V2',
            'teensy40'=>'Teensy 4.0','teensy41'=>'Teensy 4.1',
            'm5stack_core'=>'M5Stack Core','m5stickc'=>'M5StickC','m5atom'=>'M5Atom','m5core2'=>'M5Core2',
        ];
        return $names[$id] ?? strtoupper($id);
    }
}
