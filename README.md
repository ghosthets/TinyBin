<div align="center">
<img src="https://raw.githubusercontent.com/ghosthets/TinyBin/main/logo.svg" width="72" height="72" alt="TinyBin Logo"/>
**Browser-based IDE for Microcontroller Firmware Development**

Code. Compile. Flash. From Any Browser. Zero Installs.

[![Status](https://img.shields.io/badge/Status-Build-10b981?style=for-the-badge&logo=rocket)](https://github.com/ghosthets/TinyBin)
[![Boards](https://img.shields.io/badge/Boards-150%2B-0ea5e9?style=for-the-badge&logo=arduino)](https://github.com/ghosthets/TinyBin)
[![Libraries](https://img.shields.io/badge/Libraries-40%2B-f97316?style=for-the-badge&logo=github)](https://github.com/ghosthets/TinyBin)
[![License](https://img.shields.io/badge/License-GPL%20v3-a855f7?style=for-the-badge&logo=open-source-initiative)](https://github.com/ghosthets/TinyBin/blob/main/LICENSE)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-777bb3?style=for-the-badge&logo=php)](https://php.net)
[![PRs](https://img.shields.io/badge/PRs-Welcome-f59e0b?style=for-the-badge&logo=github)](https://github.com/ghosthets/TinyBin/pulls)
</div>
## Overview

**TinyBin IDE** ek complete browser-based development environment hai microcontroller firmware ke liye. Ye Arduino IDE, PlatformIO, VS Code ka combination hai — lekin sirf ek browser tab mein. Koi installation nahi, koi setup nahi, koi database nahi.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Project Structure](#project-structure)
4. [How It Works — Step by Step](#how-it-works--step-by-step)
5. [Core Modules Breakdown](#core-modules-breakdown)
6. [Compilation Flow](#compilation-flow)
7. [Flashing Flow](#flashing-flow)
8. [GitHub Library Fetch Flow](#github-library-fetch-flow)
9. [Data Storage (LocalStorage)](#data-storage-localstorage)
10. [Board Support](#board-support)
11. [Library Catalog](#library-catalog)
12. [.tbin Config Format](#tbin-config-format)
13. [Keyboard Shortcuts](#keyboard-shortcuts)
14. [API Endpoints](#api-endpoints)
15. [Server Requirements](#server-requirements)
16. [Security](#security)
17. [Theme System](#theme-system)
18. [Tab Management](#tab-management)
19. [Serial Monitor & Plotter](#serial-monitor--plotter)
20. [Code Tools](#code-tools)
21. [Project Templates](#project-templates)
22. [Command Palette](#command-palette)
23. [TODO Manager](#todo-manager)
24. [Export / Import](#export--import)
25. [Installation Guide](#installation-guide)
26. [Troubleshooting](#troubleshooting)

---

### Key Numbers

| Metric | Value |
|--------|-------|
| Supported Boards | 150+ |
| Libraries | 40+ pre-configured |
| File Types | .cpp, .c, .ino, .h, .hpp, .tbin, .json, .yaml, .py, .md, .html |
| Storage | 100% Local (Browser LocalStorage) |
| Server Dependencies | PHP 7.4+ (optional for compilation) |
| External APIs | GitHub API (for library fetching) |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JavaScript (ES5), HTML5, CSS3 |
| Editor | Ace Editor (CDN) |
| Compilation (Server) | PHP + arduino-cli / gcc / platformio |
| Compilation (Client) | WebAssembly (TCC) — fallback |
| Flashing | Web Serial API + custom esptool protocol |
| Data Storage | Browser LocalStorage |
| GitHub Integration | GitHub REST API v3 |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    TinyBin IDE (ide.js)                       │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │  │
│  │  │ Compiler │ │ Flasher  │ │ Code     │ │ LibraryFetcher   │  │  │
│  │  │ Module   │ │ Module   │ │ Analyzer │ │ (GitHub API)     │  │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘  │  │
│  │       │            │            │                │            │  │
│  │  ┌────┴────────────┴────────────┴────────────────┴───────┐    │  │
│  │  │              WasmCompiler (tcc.wasm)                  │    │  │
│  │  │              EspTool (esptool.js)                     │    │  │
│  │  └───────────────────────────────────────────────────────┘    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │  │
│  │  │ Terminal │ │ Serial   │ │ Problems │ │ Command Palette  │  │  │
│  │  │ Module   │ │ Monitor  │ │ Panel    │ │                  │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │              LocalStorage (tb_projects)                  │ │  │
│  │  │  Projects │ Files │ Configs │ Libraries │ TODOs          │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │   POST /api/compile │
                    │   GET  /uploads/*.bin│
                    └──────────┬──────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────────┐
│                        PHP SERVER                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  api/compile.php                                              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │  │
│  │  │ detectTool   │→ │ arduino-cli  │→ │ Generate .bin file   │ │  │
│  │  │ chain()      │  │ / gcc / pio  │  │ in uploads/          │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │ cleanupOldBinaries() — auto-delete after 1 hour          │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  core/TBinParser.php    core/GitHubAPI.php                    │  │
│  │  (Config parsing)       (GitHub API wrapper)                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │   USB via Web Serial│
                    └──────────┬──────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────────┐
│                    MICROCONTROLLER (ESP32/Arduino/etc)              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  EspTool Protocol:                                            │  │
│  │  1. Sync → 2. Chip Detect → 3. Erase → 4. Flash → 5. Reboot   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
tinybin/
│
├── index.php                 # Landing page (marketing site)
├── dashboard.php             # Main IDE page (2500+ lines HTML+JS)
├── about.php                 # About page
├── blog.php                  # Blog page
├── privacy.php               # Privacy policy
├── terms.php                 # Terms of service
├── .htaccess                 # Apache security + rewrite rules
│
├── api/
│   └── compile.php           # REAL compilation endpoint (279 lines)
│       ├── detectToolchain()  # Auto-detect gcc/arduino-cli/pio
│       ├── compileWithArduinoCli()  # arduino-cli execution
│       ├── compileWithGCC()         # gcc cross-compilation
│       └── cleanupOldBinaries()     # Auto-cleanup after 1hr
│
├── core/
│   ├── TBinParser.php        # .tbin config parser + board registry
│   │   ├── parse()           # Parse .tbin content → array
│   │   ├── generate()        # Generate .tbin from name+board
│   │   ├── getAllBoards()    # 15 board families, 150+ boards
│   │   └── getBoardName()    # Board ID → human name
│   └── GitHubAPI.php         # GitHub REST API wrapper
│       ├── parseUrl()        # Extract owner/repo from URL
│       ├── getTree()         # Fetch recursive file tree
│       ├── getFile()         # Fetch single file content
│       ├── getRawUrl()       # Generate raw.githubusercontent URL
│       ├── downloadBinary()  # Download binary via cURL
│       └── discoverTBinFiles() # Find .tbin files in repo
│
├── assets/
│   ├── css/
│   │   ├── home.css          # Landing page styles
│   │   └── dashboard.css     # IDE styles (not shown in analysis)
│   └── js/
│       ├── ide.js            # MAIN IDE logic (2446 lines)
│       │   ├── IDE           # Core IDE module
│       │   ├── Compiler      # Compilation module
│       │   ├── Flasher       # Flash module
│       │   ├── SerialManager # Web Serial wrapper
│       │   ├── EspTool       # ESP flash protocol (esptool.js)
│       │   ├── WasmCompiler  # WASM fallback (wasm-compiler.js)
│       │   ├── CodeAnalyzer  # Static analysis
│       │   ├── CodeFormatter # Code formatting
│       │   ├── CodeLinter    # Linting rules
│       │   ├── LibraryFetcher # GitHub library fetch
│       │   ├── CommandPalette # Ctrl+Shift+P palette
│       │   ├── Snippets      # Code snippets
│       │   ├── BoardManagerPanel # Board browser
│       │   ├── SerialPlotter # Real-time graph
│       │   ├── ProjectTemplates # 10 starter templates
│       │   ├── ShortcutManager # Keyboard shortcuts
│       │   ├── SerialMonitor # Serial output panel
│       │   ├── ProblemsPanel # Error/warning list
│       │   ├── TabManager    # Multi-tab + split views
│       │   ├── SidebarResize # Draggable sidebar
│       │   ├── TODO          # Task manager
│       │   ├── Terminal      # Output terminal
│       │   └── Output        # Project stats
│       ├── wasm-compiler.js  # WASM C compiler (TCC)
│       ├── esptool.js        # ESP flash protocol implementation
│       └── home.js           # Landing page interactions
│
├── .tbin/                    # .tbin config examples (directory)
├── uploads/                  # Compiled binaries (auto-cleaned)
└── tinybin.zip               # Distribution archive
```

---

## How It Works — Step by Step

### Step 1: Project Creation

```
User clicks "New Project"
    │
    ├─→ Name: "my-blink"
    ├─→ Board: "esp32"
    │
    ▼
IDE.createProject() generates:
    ├── my-blink.tbin       (config file)
    ├── src/main.cpp        (boilerplate code)
    └── include/config.h    (header file)
    │
    ▼
Saved to LocalStorage → tb_projects["p_TIMESTAMP"]
```

### Step 2: Code Editing

```
User opens src/main.cpp
    │
    ├─→ Ace Editor loads with C/C++ syntax highlighting
    ├─→ Auto-save every 2 seconds (configurable)
    ├─→ Multi-tab support (pin, split, drag-reorder)
    └─→ Find/Replace, Go to Line, Toggle Comment
    │
    ▼
Changes saved in real-time to LocalStorage
```

### Step 3: Compilation

```
User presses F5 or clicks Compile
    │
    ├─→ IDE checks: WasmCompiler.isReady()?
    │   ├── YES → Compile client-side with WASM TCC
    │   └── NO  → Send POST to api/compile.php
    │
    ├─→ Server (compile.php):
    │   ├── detectToolchain() → finds arduino-cli/gcc/pio
    │   ├── Writes source files to uploads/
    │   ├── Executes compilation command
    │   ├── Copies .bin to uploads/
    │   └── Returns: { success, binary_path, binary_size, log }
    │
    ▼
IDE receives result → updates terminal, problems panel, flash button
```

### Step 4: Flashing

```
User presses F7 or clicks Flash
    │
    ├─→ Fetches .bin from server (or WASM blob URL)
    ├─→ EspTool.connect() via Web Serial API
    │   ├── Request USB port from browser
    │   ├── Open at 115200 baud
    │   ├── Enter bootloader (DTR/RTS signals)
    │   ├── Sync with device
    │   └── Detect chip (ESP32/ESP8266/etc)
    │
    ├─→ EspTool.flashData()
    │   ├── Erase flash
    │   ├── Send blocks (1024 bytes each)
    │   ├── Show real-time progress
    │   └── Reboot device
    │
    ▼
Device boots with new firmware → Serial monitor shows output
```

---

## Core Modules Breakdown

### Module Registry

| Module | File | Lines | Responsibility |
|--------|------|-------|----------------|
| `IDE` | `ide.js` | ~1030 | Core IDE: projects, files, tabs, editor, UI |
| `Compiler` | `ide.js` | ~110 | Compilation orchestration (WASM → server) |
| `Flasher` | `ide.js` | ~50 | Binary download + flash initiation |
| `EspTool` | `esptool.js` | ~200 | ESP flash protocol (SLIP, sync, chip detect) |
| `SerialManager` | `ide.js` | ~60 | Web Serial API wrapper (connect/read/write) |
| `WasmCompiler` | `wasm-compiler.js` | ~150 | Client-side TCC WASM compiler |
| `CodeAnalyzer` | `ide.js` | ~60 | Static code analysis (counts, complexity) |
| `CodeFormatter` | `ide.js` | ~40 | C/C++ and JSON formatting |
| `CodeLinter` | `ide.js` | ~45 | 10 lint rules (trailing whitespace, line length, etc) |
| `LibraryFetcher` | `ide.js` | ~170 | GitHub library download + raw fallback |
| `CommandPalette` | `ide.js` | ~70 | Ctrl+Shift+P command search |
| `Snippets` | `ide.js` | ~40 | 10 code snippets (blink, wifi, mqtt, etc) |
| `BoardManagerPanel` | `ide.js` | ~65 | Board browser with specs + favorites |
| `SerialPlotter` | `ide.js` | ~40 | Real-time serial data graphing |
| `ProjectTemplates` | `ide.js` | ~45 | 10 starter project templates |
| `ShortcutManager` | `ide.js` | ~30 | Keyboard shortcut reference |
| `SerialMonitor` | `ide.js` | ~35 | Serial TX/RX display |
| `ProblemsPanel` | `ide.js` | ~45 | Error/warning list with badge |
| `TabManager` | `ide.js` | ~200 | Multi-tab, split views, drag-reorder, pin |
| `SidebarResize` | `ide.js` | ~25 | Draggable sidebar width |
| `TODO` | `ide.js` | ~60 | Task manager with priorities |
| `Terminal` | `ide.js` | ~50 | Output log with timestamps |
| `Output` | `ide.js` | ~20 | Project statistics display |

---

## Compilation Flow

### Decision Tree

```
F5 (Compile)
    │
    ├─→ No project loaded? → Warning, abort
    ├─→ No source files? → Error, abort
    │
    ├─→ WasmCompiler.isReady() === true?
    │   │
    │   ├─→ YES
    │   │   └─→ WasmCompiler.compile(sourceCode, board)
    │   │       ├── Load tcc.wasm (if not loaded)
    │   │       ├── Create TCC state
    │   │       ├── Compile C source
    │   │       ├── Extract binary from WASM memory
    │   │       └─→ Return { success, binary_data (Uint8Array) }
    │   │
    │   └─→ If WASM fails → Fall through to server
    │
    └─→ compileOnServer(board, files, name)
        │
        ├─→ POST api/compile.php
        │   │
        │   ├─→ detectToolchain()
        │   │   ├── arduino-cli version → arduino-cli
        │   │   ├── pio --version → platformio
        │   │   ├── xtensa-esp32-elf-gcc --version → esp32-gcc
        │   │   ├── avr-gcc --version → avr-gcc
        │   │   └── gcc --version → gcc
        │   │
        │   ├─→ NO toolchain found?
        │   │   └─→ Return { toolchain_missing: true, install instructions }
        │   │
        │   ├─→ arduino-cli detected?
        │   │   ├── Create project dir: uploads/project_TIMESTAMP/
        │   │   ├── Write source files to src/
        │   │   ├── Write library files to lib/
        │   │   ├── Map board ID → FQBN (e.g., esp32 → esp32:esp32:esp32)
        │   │   ├── Execute: arduino-cli compile --fqbn ... --output-dir ...
        │   │   ├── Parse output for errors/warnings
        │   │   ├── Copy .bin to uploads/
        │   │   └─→ Return { success, binary_path, binary_size }
        │   │
        │   └─→ gcc detected?
        │       ├── Write source files to uploads/src_project_TIMESTAMP/
        │       ├── Map board → CPU flags (-mcpu=esp32, -mmcu=atmega328p)
        │       ├── Execute: gcc -Os -ffunction-sections ... -o output.bin
        │       ├── Parse output for errors/warnings
        │       └─→ Return { success, binary_path, binary_size }
        │
        └─→ Response → IDE processes result
            ├── Success → Update terminal, problems, flash button
            └── Failure → Show errors, disable flash
```

### Board FQBN Mapping (arduino-cli)

| Board ID | FQBN |
|----------|------|
| `esp32` | `esp32:esp32:esp32` |
| `esp32s2` | `esp32:esp32:esp32s2` |
| `esp32s3` | `esp32:esp32:esp32s3` |
| `esp32c3` | `esp32:esp32:esp32c3` |
| `esp8266` | `esp8266:esp8266:nodemcuv2` |
| `arduino_uno` | `arduino:avr:uno` |
| `arduino_nano` | `arduino:avr:nano` |
| `arduino_mega` | `arduino:avr:mega` |

### GCC Board Flags

| Board | CPU Flag |
|-------|----------|
| `esp32` | `-mcpu=esp32 -Os -ffunction-sections -fdata-sections` |
| `esp8266` | `-mcpu=esp8266 -Os -ffunction-sections -fdata-sections` |
| `arduino_uno` | `-mmcu=atmega328p -Os -ffunction-sections -fdata-sections` |
| `arduino_nano` | `-mmcu=atmega328p -Os -ffunction-sections -fdata-sections` |
| `arduino_mega` | `-mmcu=atmega2560 -Os -ffunction-sections -fdata-sections` |

---

## Flashing Flow

### EspTool Protocol Sequence

```
Flash Button (F7)
    │
    ├─→ Fetch binary
    │   ├── If server compiled: fetch(binary_path) → ArrayBuffer
    │   └── If WASM compiled: Blob URL → ArrayBuffer
    │
    ├─→ EspTool.connect()
    │   │
    │   ├─→ navigator.serial.requestPort() → User selects USB port
    │   ├─→ port.open({ baudRate: 115200 })
    │   ├─→ Enter bootloader mode:
    │   │   ├── setRTS(true) → sleep 100ms
    │   │   ├── setDTR(false) → sleep 100ms
    │   │   ├── setRTS(false)
    │   │   ├── setDTR(true) → sleep 50ms
    │   │   └── setDTR(false) → sleep 400ms
    │   ├─→ _sync() → Send sync packet (5 attempts)
    │   └─→ _detectChip() → Read magic register
    │       ├── 0xfff0c101 → ESP8266
    │       ├── 0x00f01d83 → ESP32
    │       ├── 0x000007c6 → ESP32-S2
    │       ├── 0x000009 → ESP32-S3
    │       └── 0x000006 → ESP32-C3
    │
    ├─→ EspTool.flashData(binaryData, offset=0x0, progressCallback)
    │   │
    │   ├─→ flashBegin(totalSize, offset)
    │   │   └─→ ESP_FLASH_BEGIN command (erase size calculated)
    │   │
    │   ├─→ For each 1024-byte block:
    │   │   ├── flashBlock(data, seq, timeout)
    │   │   │   ├── Pad to 1024 bytes with 0xFF
    │   │   │   ├── Build header (size, seq, 0)
    │   │   │   ├── Calculate checksum (XOR)
    │   │   │   ├── Encode as SLIP packet
    │   │   │   ├── Send via Web Serial
    │   │   │   └── Wait for response
    │   │   └─→ progressCallback(written, total)
    │   │
    │   └─→ flashEnd(reboot=true)
    │       └─→ ESP_FLASH_END command → Device reboots
    │
    └─→ EspTool.disconnect()
        └─→ Close port, release reader/writer
```

### SLIP Encoding

```
SLIP (Serial Line Internet Protocol) is used for reliable serial communication:

Original byte → SLIP encoded
0xC0 → 0xDB 0xDC
0xDB → 0xDB 0xDD
Other → unchanged

Packet format:
[0xC0] [Direction] [Command] [Size_L] [Size_H] [Checksum x4] [Payload...] [0xC0]
```

### Fallback Chain

```
Flash attempt:
    1. EspTool protocol (proper ESP flash)
       └── If fails → Fall back to raw serial write
    2. SerialManager.sendRaw() in 4KB chunks
       └── If fails → Show error, suggest manual esptool.py
```

---

## GitHub Library Fetch Flow

### Two Methods

#### Method 1: GitHub API (with token)

```
User adds library (e.g., "DHT")
    │
    ├─→ LibraryFetcher looks up in LIBRARY_SOURCES
    │   └── DHT → { owner: 'adafruit', repo: 'DHT-sensor-library', path: '', branch: 'master' }
    │
    ├─→ Fetch tree: GET api.github.com/repos/adafruit/DHT-sensor-library/git/trees/master?recursive=1
    │   └── Headers: { Authorization: token GITHUB_TOKEN }
    │
    ├─→ Filter .h/.cpp/.ino files in path
    │
    ├─→ For each file (max 20):
    │   ├── Fetch: GET api.github.com/repos/.../contents/DHT.cpp?ref=master
    │   ├── Decode base64 content
    │   └── Add to project: lib/DHT/DHT.cpp
    │
    └─→ Save to LocalStorage, update file tree
```

#### Method 2: Raw URL Fallback (rate limit)

```
If GitHub API returns 403 (rate limit):
    │
    ├─→ Try raw.githubusercontent.com URLs
    │   └── https://raw.githubusercontent.com/adafruit/DHT-sensor-library/master/DHT.cpp
    │
    ├─→ For each known file (from getKnownLibFiles):
    │   ├── fetch(rawUrl)
    │   ├── Get text content
    │   └── Add to project
    │
    └─→ If still fails → Suggest adding GitHub token in Settings
```

### Library Source Registry (40+ libraries)

| Library | Owner/Repo | Category |
|---------|-----------|----------|
| WiFi | espressif/arduino-esp32 | Communication |
| BLE | espressif/arduino-esp32 | Communication |
| HTTPClient | espressif/arduino-esp32 | Communication |
| WebServer | espressif/arduino-esp32 | Communication |
| Ethernet | arduino-libraries/Ethernet | Communication |
| MQTT | knolleary/pubsubclient | Communication |
| ESPAsyncWebServer | me-no-dev/ESPAsyncWebServer | Communication |
| AsyncTCP | me-no-dev/AsyncTCP | Communication |
| ESPmDNS | espressif/arduino-esp32 | Communication |
| ArduinoOTA | espressif/arduino-esp32 | Communication |
| Servo | arduino-libraries/Servo | Output |
| NeoPixel | adafruit/Adafruit_NeoPixel | Output |
| FastLED | FastLED/FastLED | Output |
| DHT | adafruit/DHT-sensor-library | Sensors |
| Adafruit_Sensor | adafruit/Adafruit_Sensor | Sensors |
| Adafruit_BME280 | adafruit/Adafruit_BME280_Library | Sensors |
| MPU6050 | ElectronicCats/MPU6050 | Sensors |
| DallasTemperature | milesburton/Arduino-Temperature-Control-Library | Sensors |
| OneWire | PaulStoffregen/OneWire | Communication |
| Adafruit_GPS | adafruit/Adafruit_GPS | Sensors |
| Adafruit_GFX | adafruit/Adafruit-GFX-Library | Displays |
| Adafruit_SSD1306 | adafruit/Adafruit_SSD1306 | Displays |
| TFT_eSPI | Bodmer/TFT_eSPI | Displays |
| U8g2 | olikraus/u8g2 | Displays |
| LiquidCrystal_I2C | marcoschwartz/LiquidCrystal_I2C | Displays |
| EEPROM | espressif/arduino-esp32 | Storage |
| LittleFS | espressif/arduino-esp32 | Storage |
| SD | espressif/arduino-esp32 | Storage |
| ArduinoJson | bblanchon/ArduinoJson | Data |
| Time | PaulStoffregen/Time | Utility |
| RTClib | adafruit/RTClib | Utility |
| NTPClient | arduino-libraries/NTPClient | Utility |
| TaskScheduler | arkhipenko/TaskScheduler | Utility |
| IRremote | Arduino-IRremote/Arduino-IRremote | Input |
| MFRC522 | miguelbalboa/rfid | Input |
| Keypad | Chris--A/Keypad | Input |
| LoRa | sandeepmistry/arduino-LoRa | Communication |
| Wire | (built-in) | Communication |
| SPI | (built-in) | Communication |

---

## Data Storage (LocalStorage)

### Storage Keys

| Key | Type | Content |
|-----|------|---------|
| `tb_projects` | JSON string | All projects with files, configs, libraries |
| `tb_last` | string | Last opened project ID |
| `tb_todos` | JSON string | All TODO tasks |
| `tb_token` | string | GitHub personal access token |
| `tb_theme` | string | `dark` or `light` |
| `tb_autosave` | string | `true` or `false` |
| `tb_autosave_delay` | string | Delay in ms (default: 2000) |
| `tb_fav_boards` | JSON string | Favorite board IDs |
| `tb_sidebar_w` | string | Sidebar width in px (default: 280) |
| `tb_terminal_h` | string | Terminal height in px (default: 220) |
| `tb_zoom` | string | Editor font size (default: 14) |
| `tb_wordwrap` | string | Word wrap state |

### Project Data Structure

```json
{
  "p_1234567890": {
    "id": "p_1234567890",
    "name": "my-blink",
    "board": "esp32",
    "created": "2026-05-20T10:30:00.000Z",
    "updated": "2026-05-20T11:00:00.000Z",
    "files": [
      {
        "path": "my-blink.tbin",
        "content": "# my-blink\n\nproject_name: my-blink\n...",
        "type": "tbin"
      },
      {
        "path": "src/main.cpp",
        "content": "#include <Arduino.h>\n\nvoid setup() {...}",
        "type": "cpp"
      },
      {
        "path": "lib/WiFi/WiFi.cpp",
        "content": "...",
        "type": "cpp"
      }
    ],
    "libraries": [
      { "name": "WiFi", "version": "2.0.0" }
    ],
    "tbin": {
      "path": "my-blink.tbin",
      "config": {
        "project_name": "my-blink",
        "version": "1.0.0",
        "board": "esp32",
        "binary_path": "build/my-blink.bin",
        "libraries": [{ "name": "WiFi", "version": "2.0.0" }],
        "build": { "optimization": "-Os", "debug": false },
        "defines": ["USE_SERIAL", "LED_BUILTIN=2"]
      }
    },
    "github_url": null
  }
}
```

---

## Board Support

### Board Families (15 families, 150+ boards)

| Family | Board Count | Examples |
|--------|-------------|----------|
| ESP8266 / ESP-01 | 13 | ESP-01, NodeMCU, Wemos D1 Mini, HUZZAH |
| ESP32 Family | 8 | ESP32 DevKit, ESP32-S2, ESP32-S3, ESP32-C3 |
| Arduino | 14 | Uno, Nano, Mega, Leonardo, Due, Zero, MKR |
| AVR | 6 | ATtiny85, ATtiny84, ATmega328, ATmega2560 |
| STM32 | 12 | Blue Pill, Black Pill, Nucleo, Discovery |
| Raspberry Pi Pico | 7 | Pico, Pico W, Pico 2, QT Py, Feather |
| nRF / micro:bit | 10 | nRF52832, nRF52840, micro:bit, CLUE |
| Teensy | 6 | Teensy 3.1, 3.5, 3.6, 4.0, 4.1, LC |
| Particle | 5 | Photon, Electron, Argon, Boron, Xenon |
| M5Stack | 13 | Core, Fire, StickC, Atom, Paper, Core2 |
| TTGO / Heltec | 7 | T-Beam, T-Watch, T-Display, LoRa32 |
| LOLIN / Wemos | 7 | S2 Mini, S3, D32, D32 Pro, LOLIN32 |
| DFRobot FireBeetle | 3 | ESP32, ESP32E, ESP32C6 |
| Seeed XIAO | 10 | ESP32C3, ESP32S3, RP2040, nRF52840, BLE |
| SAMD | 2 | SAMD21, SAMD51 |

### Board Specs (Known Boards)

| Board | CPU | Cores | Freq | RAM | Flash | Features |
|-------|-----|-------|------|-----|-------|----------|
| ESP32 | Xtensa LX6 | 2 | 240MHz | 520KB | 4MB | WiFi, BLE, OTA, USB |
| ESP32-S3 | Xtensa LX7 | 2 | 240MHz | 512KB | 8MB | WiFi, BLE, USB |
| ESP32-C3 | RISC-V | 1 | 160MHz | 400KB | 4MB | WiFi, BLE, Low Power |
| ESP8266 | Xtensa L106 | 1 | 160MHz | 80KB | 4MB | WiFi, OTA, Low Power |
| Arduino Uno | ATmega328P | 1 | 16MHz | 2KB | 32KB | Low Power |
| STM32F103C8 | ARM Cortex-M3 | 1 | 72MHz | 20KB | 64KB | Low Power |
| RP2040 | ARM Cortex-M0+ | 2 | 133MHz | 264KB | External | USB, Low Power |
| nRF52840 | ARM Cortex-M4 | 1 | 64MHz | 256KB | 1MB | BLE, Low Power, USB |

---

## .tbin Config Format

### Syntax

```
# Comment line (starts with #)

key: value          # Top-level key-value pair

## Section Name     # Section header (starts with ##)
  - name: item1     # List item (starts with -)
    version: 1.0    # Nested key under list item
```

### Sections

| Section | Purpose | Fields |
|---------|---------|--------|
| (top-level) | Project metadata | `project_name`, `version`, `board`, `binary_path` |
| `libraries:` | Library dependencies | `- name:`, `version:` |
| `build:` | Build configuration | `optimization`, `debug`, `partitions`, `flash_freq`, `flash_size` |
| `defines:` | Preprocessor defines | `- DEFINE_NAME`, `- KEY=VALUE` |

### Example

```tbin
# My IoT Sensor Project

project_name: iot-sensor-node
version: 1.0.0
board: esp32
binary_path: build/iot-sensor-node.bin

## Libraries
libraries:
  - name: WiFi
    version: 2.0.0
  - name: Adafruit_BME280
    version: 2.2.2
  - name: MQTT
    version: 2.0.0

## Build Settings
build:
  optimization: -Os
  debug: false
  partitions: default
  flash_freq: 80m
  flash_size: 4MB

## Preprocessor Defines
defines:
  - USE_SERIAL
  - LED_BUILTIN=2
  - MQTT_MAX_PACKET_SIZE=512
```

### Parsing Rules

1. Lines starting with `#` are comments (ignored)
2. Empty lines are ignored
3. `key: value` at top level sets config fields
4. `## Section` starts a new section
5. `- name:` in libraries section creates a new library entry
6. `version:` after `- name:` sets the library version
7. `key: value` in build section sets build config (auto-converts true/false/numbers)
8. `- value` in defines section adds a preprocessor define

---

## Keyboard Shortcuts

### File Operations

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save current file |
| `Ctrl+Shift+S` | Save all files |
| `Ctrl+N` | New file |
| `Ctrl+W` | Close current tab |

### Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl+G` | Go to line |
| `Ctrl+H` | Find & Replace |
| `Ctrl+Shift+F` | Find in files |
| `F12` | Go to definition |

### Editing

| Shortcut | Action |
|----------|--------|
| `Ctrl+/` | Toggle comment |
| `Ctrl+Shift+/` | Toggle block comment |
| `Alt+Z` | Toggle word wrap |
| `Shift+Alt+F` | Format document |

### Build & Flash

| Shortcut | Action |
|----------|--------|
| `F5` | Compile |
| `F6` | Analyze code |
| `F7` | Flash device |
| `F8` | Download binary |

### UI

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+Shift+E` | Explorer panel |
| `Ctrl+Shift+T` | Tab tree |
| `Ctrl+B` | Toggle sidebar |
| `` Ctrl+` `` | Toggle terminal |
| `Escape` | Close modals/palettes |

---

## API Endpoints

### POST `/api/compile.php`

**Request:**
```json
{
  "action": "compile",
  "board": "esp32",
  "project_name": "my-blink",
  "files": [
    { "path": "src/main.cpp", "content": "#include <Arduino.h>\n...", "type": "cpp" },
    { "path": "lib/WiFi/WiFi.cpp", "content": "...", "type": "cpp" }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Real compilation successful",
  "compile_time_ms": 1234,
  "log": [
    { "type": "system", "message": "=== REAL COMPILATION STARTED ===" },
    { "type": "success", "message": "✓ REAL COMPILATION SUCCESSFUL" }
  ],
  "problems": [],
  "data": {
    "binary_name": "my-blink_esp32.bin",
    "binary_size": 240128,
    "binary_path": "uploads/my-blink_esp32.bin"
  }
}
```

**Response (Toolchain Missing):**
```json
{
  "success": false,
  "message": "No compilation toolchain installed on server.",
  "toolchain_missing": true,
  "log": [
    { "type": "error", "message": "NO REAL TOOLCHAIN FOUND ON SERVER" },
    { "type": "info", "message": "For ESP32: sudo apt install arduino-cli && arduino-cli core install esp32:esp32" }
  ],
  "problems": []
}
```

**Response (Compilation Failed):**
```json
{
  "success": false,
  "message": "Compilation failed with 2 error(s)",
  "log": [...],
  "problems": [
    { "type": "error", "message": "'Serial' was not declared in this scope", "file": "src/main.cpp", "line": 5 }
  ]
}
```

### GET `/uploads/<filename>.bin`

Returns the compiled binary file for download or flashing.

---

## Server Requirements

### Minimum

| Requirement | Version |
|-------------|---------|
| PHP | 7.4+ |
| Web Server | Apache 2.4+ or Nginx |
| mod_rewrite | Enabled (Apache) |
| mod_headers | Enabled (Apache) |
| mod_deflate | Enabled (optional) |
| mod_expires | Enabled (optional) |

### For Real Compilation

| Toolchain | Installation |
|-----------|-------------|
| arduino-cli | `curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh \| sh` |
| ESP32 Core | `arduino-cli core install esp32:esp32` |
| Arduino AVR Core | `arduino-cli core install arduino:avr` |
| gcc (fallback) | `sudo apt install gcc` |
| xtensa-esp32-elf-gcc | `sudo apt install gcc-xtensa-esp32` |
| avr-gcc | `sudo apt install gcc-avr` |
| platformio | `pip install platformio` |

### PHP Settings (.htaccess)

| Setting | Value |
|---------|-------|
| `upload_max_filesize` | 50M |
| `post_max_size` | 50M |
| `max_execution_time` | 300 |
| `display_errors` | Off |
| `log_errors` | On |

---

## Security

### .htaccess Rules

| Rule | Purpose |
|------|---------|
| `RewriteRule ^core/ - [F,L]` | Block direct access to core/ directory |
| `FilesMatch "^(data\.json\|\.env\|\.git)"` | Block sensitive files |
| `X-Content-Type-Options: nosniff` | Prevent MIME type sniffing |
| `X-Frame-Options: SAMEORIGIN` | Prevent clickjacking |
| `X-XSS-Protection: 1; mode=block` | Enable XSS filter |
| `Referrer-Policy: strict-origin-when-cross-origin` | Control referrer info |
| `Content-Security-Policy` | Restrict script/style sources |
| `Options -Indexes` | Disable directory listing |

### CSP Allowed Sources

| Type | Sources |
|------|---------|
| scripts | `self`, `unsafe-inline`, `unsafe-eval`, `cdnjs.cloudflare.com`, `cdn.jsdelivr.net` |
| styles | `self`, `unsafe-inline`, `cdnjs.cloudflare.com`, `fonts.googleapis.com` |
| fonts | `self`, `cdnjs.cloudflare.com`, `fonts.gstatic.com` |
| connect | `self`, `api.github.com`, `raw.githubusercontent.com`, `github.com` |

### Data Privacy

- **Zero server storage** — All project data stays in browser LocalStorage
- **No accounts** — No login, no signup, no user database
- **No analytics** — No tracking scripts
- **GitHub token** — Stored only in browser, never sent to TinyBin server
- **Export/Import** — User controls data backup via JSON export

---

## Theme System

### Themes

| Theme | Editor Theme | CSS Variables |
|-------|-------------|---------------|
| Dark (default) | `ace/theme/tomorrow_night` | Default dark palette |
| Light | `ace/theme/chrome` | `data-theme="light"` on `<html>` |

### Theme Toggle

```javascript
// Stored in localStorage as tb_theme
IDE.setTheme('dark')  // Switch to dark
IDE.setTheme('light') // Switch to light
```

### Theme Persistence

- Theme choice saved to `localStorage.tb_theme`
- Applied on page load via `applyTheme()`
- Editor theme loaded dynamically from CDN if not already cached

---

## Tab Management

### Features

| Feature | Description |
|---------|-------------|
| Multi-tab | Open multiple files simultaneously |
| Pin tabs | Pin important tabs (📌 icon) |
| Drag-reorder | Drag tabs to reorder |
| Split views | Split editor horizontally or vertically |
| Tab tree | Ctrl+Shift+T shows searchable tab list |
| Tab preview | Hover shows 15-line preview |
| Context menu | Right-click for pin, duplicate, split, close |
| Tab groups | Group tabs with color coding |
| Modified indicator | Dot shows unsaved changes |

### Tab Context Menu Actions

| Action | Description |
|--------|-------------|
| Pin/Unpin | Toggle pinned state |
| Duplicate | Create copy of tab |
| Split Right | Horizontal split |
| Split Down | Vertical split |
| Close | Close tab |
| Close Others | Close all except this |
| Close All | Close all tabs |
| Copy Path | Copy file path to clipboard |
| Reveal in Explorer | Highlight in file tree |
| Close Saved | Close all unmodified tabs |
| Move to New Group | Create tab group |

---

## Serial Monitor & Plotter

### Serial Monitor

| Feature | Description |
|---------|-------------|
| TX/RX display | Shows sent and received data |
| Timestamps | Each line has time stamp |
| Line endings | Configurable: CR, LF, CRLF, None |
| Baud rate | Configurable (default: 115200) |
| Send input | Text input with Enter key |
| Clear | Clear serial output |
| Auto-scroll | Auto-scrolls to latest data |

### Serial Plotter

| Feature | Description |
|---------|-------------|
| Real-time graph | Plots serial data as lines |
| Multi-series | Supports comma-separated values |
| Color coding | 6 different colors for series |
| Y-axis range | Configurable min/max |
| Max points | 200 data points displayed |
| Auto-scale | Auto-adjusts to data range |
| Grid lines | 4 horizontal grid lines |

### Data Format for Plotter

```
// Single value
42

// Multiple values (comma-separated)
23.5,67.2,89.1

// Each line creates a new data point
```

---

## Code Tools

### Code Analyzer

| Feature | Description |
|---------|-------------|
| Line count | Total lines of code |
| Function count | Detects function definitions |
| Include count | Counts #include statements |
| Define count | Counts #define statements |
| Class count | Detects class definitions |
| Variable count | Counts variable declarations |
| Loop count | Counts for/while/do loops |
| Conditional count | Counts if/else if/switch |
| Complexity rating | Low/Medium/High/Very High |
| Maintainability | High/Medium/Low rating |

### Code Formatter

| Language | Method |
|----------|--------|
| C/C++ (.cpp, .c, .ino, .h, .hpp) | Brace-based indentation |
| JSON (.json) | JSON.stringify with 4-space indent |

### Code Linter (10 Rules)

| Rule | Severity | Description |
|------|----------|-------------|
| No trailing whitespace | Warning | Detects trailing spaces/tabs |
| No multiple blank lines | Info | Detects consecutive blank lines |
| Line length limit (120) | Warning | Lines exceeding 120 chars |
| No tabs (use spaces) | Warning | Tab characters found |
| No double semicolons | Error | `;;` detected |
| No empty catch blocks | Warning | `catch(...) {}` |
| Prefer const for constants | Info | `#define` for numeric constants |
| No magic numbers | Info | Large unnamed numbers |
| Avoid global variables | Warning | Global variable declarations |
| Missing include guard | Warning | Header file without guards |

---

## Project Templates

| Template | Description | Board | Key Libraries |
|----------|-------------|-------|---------------|
| Blink LED | Basic LED blinking | ESP32 | Arduino.h |
| WiFi Scanner | Scan WiFi networks | ESP32 | WiFi.h |
| Web Server | HTTP web server | ESP32 | WiFi.h, WebServer.h |
| DHT Sensor | Temperature & humidity | ESP32 | DHT.h |
| MQTT Client | MQTT pub/sub | ESP32 | WiFi.h, PubSubClient.h |
| OTA Updates | Over-the-air updates | ESP32 | WiFi.h, ArduinoOTA.h |
| I2C Scanner | Scan I2C bus | ESP32 | Wire.h |
| NeoPixel LED | WS2812B LED strip | ESP32 | Adafruit_NeoPixel.h |
| OLED Display | SSD1306 OLED | ESP32 | Wire.h, Adafruit_GFX.h, Adafruit_SSD1306.h |
| Deep Sleep | Low power mode | ESP32 | Arduino.h |

---

## Command Palette

**Access:** `Ctrl+Shift+P`

### Available Commands (40+)

| Category | Commands |
|----------|----------|
| File | New File, New Folder, Save File, Save All, Close Tab, Close All |
| Edit | Find & Replace, Find in Files, Go to Line, Toggle Comment |
| Build | Compile, Analyze Code, Lint Code, Format Code |
| Flash | Flash Device, Download Binary |
| Serial | Connect Serial, Serial Monitor, Serial Plotter |
| View | Explorer, Search, Libraries, TODO, Snippets, Output, Terminal |
| Project | New Project, Fetch from GitHub, Project Templates, Export, Import |
| UI | Toggle Sidebar, Tab Tree, Split Right, Split Down, Theme |
| Tools | Board Manager, Build Configuration, Clear Analysis Cache |
| Help | Keyboard Shortcuts, About TinyBin |

---

## TODO Manager

### Features

| Feature | Description |
|---------|-------------|
| Add tasks | Text input with priority selection |
| Priorities | Low, Medium, High |
| Filter | All, Pending, Done |
| Toggle complete | Checkbox to mark done |
| Delete | Remove individual tasks |
| Clear done | Remove all completed tasks |
| Project-scoped | Tasks tied to current project |
| Badge | Shows pending count in sidebar |
| Persistence | Saved to LocalStorage |

### Data Structure

```json
{
  "id": "t_1234567890",
  "text": "Add WiFi connectivity",
  "done": false,
  "priority": "high",
  "projectId": "p_1234567890",
  "created": "2026-05-20T10:30:00.000Z",
  "tags": []
}
```

---

## Export / Import

### Export Project

```
IDE.exportProject()
    │
    ├─→ JSON.stringify(currentProject)
    ├─→ Create Blob (application/json)
    ├─→ Generate download link
    └─→ Download: <project_name>_export.json
```

### Export All Data

```
IDE.exportAllData()
    │
    ├─→ JSON.stringify(projects) — ALL projects
    ├─→ Create Blob (application/json)
    └─→ Download: tinybin_export_TIMESTAMP.json
```

### Import Project

```
IDE.importData()
    │
    ├─→ File picker (.json)
    ├─→ FileReader.readAsText()
    ├─→ JSON.parse()
    ├─→ Object.assign(projects, imported)
    ├─→ saveProjects() → LocalStorage
    └─→ Load first imported project
```

---

## Installation Guide

### Quick Start (No Compilation)

1. **Clone or download** the project
2. **Place** in your web server's document root
3. **Open** `http://localhost/tinybin/` in browser
4. **Create** a project and start coding
5. **Flash** via Web Serial (Chrome/Edge only)

> No server-side compilation needed for basic use. WASM compiler provides client-side fallback.

### Full Setup (With Compilation)

1. **Install PHP** 7.4+ and Apache/Nginx
2. **Clone** the project to `/var/www/tinybin/`
3. **Install arduino-cli:**
   ```bash
   curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
   sudo mv bin/arduino-cli /usr/local/bin/
   ```
4. **Install board cores:**
   ```bash
   arduino-cli core update-index
   arduino-cli core install esp32:esp32
   arduino-cli core install arduino:avr
   ```
5. **Set permissions:**
   ```bash
   sudo chown -R www-data:www-data /var/www/tinybin/uploads/
   sudo chmod -R 755 /var/www/tinybin/uploads/
   ```
6. **Open** `http://localhost/tinybin/dashboard.php`

### Docker (Optional)

```dockerfile
FROM php:7.4-apache
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
RUN mv bin/arduino-cli /usr/local/bin/
RUN arduino-cli core update-index && arduino-cli core install esp32:esp32
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html/uploads/
```

---

## Troubleshooting

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| "No toolchain found" | Server has no compiler installed | Install arduino-cli or gcc |
| Compilation timeout | Large project, slow server | Increase `max_execution_time` in .htaccess |
| Flash fails | Wrong USB port, not in bootloader | Try again, hold BOOT button on ESP32 |
| GitHub rate limit | Too many API requests without token | Add GitHub token in Settings |
| Serial not working | Browser doesn't support Web Serial | Use Chrome or Edge |
| Project not loading | Corrupted LocalStorage | Clear `tb_projects` key, re-import |
| Editor not loading | CDN blocked or offline | Check internet connection, allow cdnjs.cloudflare.com |
| Binary not flashing | Wrong board selected | Verify board matches physical device |

### Debug Commands

```javascript
// Check LocalStorage
console.log(JSON.parse(localStorage.getItem('tb_projects')))

// Check toolchain (server)
php -r "echo shell_exec('arduino-cli version');"

// Check uploads directory
ls -la uploads/

// Check serial support
console.log('serial' in navigator)
```

---

## License

TinyBin IDE — Built with passion for the maker community.

**v3.0** — 150+ Boards, .tbin Config, Web Serial Flash, WASM Compiler, EspTool Protocol
