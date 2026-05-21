<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TinyBin — Cloud IDE for Microcontrollers</title>
<meta name="description" content="Browser-based IDE for ESP32, Arduino, STM32, RP2040. Code, compile, flash — zero installs.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/home.css">
</head>
<body>

<header class="site-header" id="siteHeader">
    <div class="container header-inner">
        <a href="index.php" class="logo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="url(#logoGrad)"/>
                <path d="M11 11l7 7-7 7V11z" fill="#fff"/>
                <path d="M20 11l7 7-7 7V11z" fill="#fff" opacity="0.4"/>
                <defs><linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36"><stop stop-color="#00d4ff"/><stop offset="1" stop-color="#0066ff"/></linearGradient></defs>
            </svg>
            <span>TinyBin</span>
        </a>
        <nav class="main-nav" id="mainNav">
            <a href="index.php" class="nav-link active">Home</a>
            <a href="dashboard.php" class="nav-link">IDE</a>
            <a href="blog.php" class="nav-link">Blog</a>
            <a href="about.php" class="nav-link">About</a>
            <a href="privacy.php" class="nav-link">Privacy</a>
            <a href="terms.php" class="nav-link">Terms</a>
            <a href="dashboard.php" class="nav-link nav-cta">Launch IDE</a>
            <button class="theme-toggle-btn" id="themeToggleBtn" aria-label="Toggle theme" title="Toggle light/dark theme"></button>
        </nav>
        <button class="mobile-toggle" id="mobileToggle" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
</header>

<main>
    <!-- HERO -->
    <section class="hero">
        <div class="hero-grid-bg"></div>
        <div class="hero-glow-1"></div>
        <div class="hero-glow-2"></div>
        <div class="container hero-content">
            <div class="hero-badge"><span class="badge-pulse"></span>v3.0 — 150+ Boards, .tbin Config, Web Serial Flash</div>
            <h1>Code. Compile. Flash.<br><span class="neon-text">From Any Browser.</span></h1>
            <p class="hero-desc">The most powerful browser-based IDE for microcontroller firmware. Fetch GitHub repos, write C/C++ with full IntelliSense, configure with <code>.tbin</code> files, and flash to 150+ boards via USB — no installs, no toolchains, no setup.</p>
            <div class="hero-actions">
                <a href="dashboard.php" class="btn btn-neon btn-lg">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2L4 10h5v8h2v-8h5L10 2z"/></svg>
                    Launch IDE — Free Forever
                </a>
                <a href="#how" class="btn btn-ghost btn-lg">See How It Works</a>
            </div>
            <div class="hero-stats">
                <div class="stat"><span class="stat-num">150+</span><span class="stat-label">Boards</span></div>
                <div class="stat-line"></div>
                <div class="stat"><span class="stat-num">0</span><span class="stat-label">Installs</span></div>
                <div class="stat-line"></div>
                <div class="stat"><span class="stat-num">100%</span><span class="stat-label">Browser</span></div>
                <div class="stat-line"></div>
                <div class="stat"><span class="stat-num">∞</span><span class="stat-label">Projects</span></div>
            </div>
        </div>
        <div class="hero-preview">
            <div class="preview-window">
                <div class="preview-titlebar">
                    <div class="preview-dots"><span></span><span></span><span></span></div>
                    <span>dashboard.php — TinyBin IDE</span>
                    <div class="preview-window-actions"><span></span><span></span><span></span></div>
                </div>
                <div class="preview-body">
                    <div class="preview-sidebar">
                        <div class="preview-tree-item active"><span class="dot"></span>src/main.cpp</div>
                        <div class="preview-tree-item"><span class="dot"></span>include/config.h</div>
                        <div class="preview-tree-item"><span class="dot"></span>project.tbin</div>
                        <div class="preview-tree-item"><span class="dot"></span>lib/wifi.cpp</div>
                        <div class="preview-tree-item"><span class="dot"></span>lib/wifi.h</div>
                    </div>
                    <div class="preview-main">
                        <div class="preview-tabs"><span class="ptab active">main.cpp</span><span class="ptab">config.h</span><span class="ptab">project.tbin</span></div>
                        <div class="preview-editor">
                            <div class="preview-line"><span class="ln">1</span><span class="kw">#include</span> <span class="str">&lt;Arduino.h&gt;</span></div>
                            <div class="preview-line"><span class="ln">2</span><span class="kw">#include</span> <span class="str">"config.h"</span></div>
                            <div class="preview-line"><span class="ln">3</span></div>
                            <div class="preview-line"><span class="ln">4</span><span class="kw">void</span> <span class="fn">setup</span>() {</div>
                            <div class="preview-line"><span class="ln">5</span>  <span class="fn">Serial</span>.<span class="fn">begin</span>(<span class="num">115200</span>);</div>
                            <div class="preview-line"><span class="ln">6</span>  <span class="fn">pinMode</span>(<span class="num">LED_BUILTIN</span>, <span class="num">OUTPUT</span>);</div>
                            <div class="preview-line"><span class="ln">7</span>  <span class="fn">Serial</span>.<span class="fn">println</span>(<span class="str">"TinyBin Ready"</span>);</div>
                            <div class="preview-line"><span class="ln">8</span>}</div>
                            <div class="preview-line"><span class="ln">9</span></div>
                            <div class="preview-line"><span class="ln">10</span><span class="kw">void</span> <span class="fn">loop</span>() {</div>
                            <div class="preview-line"><span class="ln">11</span>  <span class="fn">digitalWrite</span>(<span class="num">LED_BUILTIN</span>, <span class="num">HIGH</span>);</div>
                            <div class="preview-line"><span class="ln">12</span>  <span class="fn">delay</span>(<span class="num">1000</span>);</div>
                            <div class="preview-line"><span class="ln">13</span>  <span class="fn">digitalWrite</span>(<span class="num">LED_BUILTIN</span>, <span class="num">LOW</span>);</div>
                            <div class="preview-line"><span class="ln">14</span>  <span class="fn">delay</span>(<span class="num">1000</span>);</div>
                            <div class="preview-line"><span class="ln">15</span>}</div>
                        </div>
                    </div>
                </div>
                <div class="preview-terminal">
                    <div class="preview-term-header"><span>OUTPUT</span><span>PROBLEMS</span><span class="active">SERIAL</span></div>
                    <div class="preview-term-body">
                        <div><span class="ts">[00:00:01]</span> <span class="sys">TinyBin IDE initialized.</span></div>
                        <div><span class="ts">[00:00:02]</span> <span class="info">Project "blinky" loaded (3 files)</span></div>
                        <div><span class="ts">[00:00:03]</span> <span class="sys">Compilation successful in 1.2s</span></div>
                        <div><span class="ts">[00:00:04]</span> <span class="ok">Binary: blinky_esp32.bin (234.5 KB)</span></div>
                        <div><span class="ts">[00:00:05]</span> <span class="info">Serial port connected at 115200 baud</span></div>
                        <div><span class="ts">[00:00:06]</span> <span class="ok">Flash complete! 240128 bytes written</span></div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- TRUSTED BY -->
    <section class="trusted">
        <div class="container">
            <p class="trusted-label">BUILT FOR MAKERS, ENGINEERS &amp; HOBBYISTS</p>
            <div class="trusted-logos">
                <span>ESPRESSIF</span><span>ARDUINO</span><span>STMICROELECTRONICS</span><span>RASPBERRY PI</span><span>NORDIC SEMI</span><span>TEENSY</span><span>M5STACK</span><span>SEEED STUDIO</span>
            </div>
        </div>
    </section>

    <!-- FEATURES -->
    <section class="features" id="features">
        <div class="container">
            <div class="section-header">
                <span class="section-tag">Features</span>
                <h2>Everything You Need.<br>Nothing You Don't.</h2>
                <p>From GitHub fetch to USB flash — all in one browser tab. Zero installs.</p>
            </div>
            <div class="features-grid">
                <div class="feature-card featured-card">
                    <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 3L3 14h7v11h8V14h7L14 3z"/></svg></div>
                    <h3>Instant Flash via USB</h3>
                    <p>Web Serial API streams compiled binary directly to your microcontroller. Real-time progress, baud rate control, bootloader auto-detect. No external tools.</p>
                    <div class="feature-tags"><span>Web Serial</span><span>1024B Chunks</span><span>Live Progress</span></div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="14" cy="14" r="11"/><path d="M14 7v7l5 3"/></svg></div>
                    <h3>GitHub Fetch</h3>
                    <p>Paste any repo URL. Auto-discovers <code>.tbin</code> configs, pulls source files, builds file tree. Supports public &amp; private repos with token.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="22" height="22" rx="3"/><path d="M8 14h12M14 8v12"/></svg></div>
                    <h3>VS Code-Like IDE</h3>
                    <p>Ace Editor with C/C++ IntelliSense, multi-tab editing, file tree, search/replace, minimap, breadcrumbs, keyboard shortcuts, auto-save.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 3v22M3 14h22"/><circle cx="14" cy="14" r="11"/></svg></div>
                    <h3>150+ Boards</h3>
                    <p>ESP-01 to ESP32-S3, Arduino Uno to Due, STM32 Blue Pill to Nucleo, RP2040 Pico, nRF52, Teensy, M5Stack, TTGO, Seeed XIAO, Particle, and more.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="20" height="20" rx="2"/><path d="M9 9h10M9 14h7M9 19h4"/></svg></div>
                    <h3>.tbin Config Format</h3>
                    <p>Human-readable project config. Board type, binary path, libraries, build flags, defines — all in one clean file. Better than JSON, easier than YAML.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 3a11 11 0 100 22 11 11 0 000-22z"/><path d="M14 7a7 7 0 100 14 7 7 0 000-14z"/><circle cx="14" cy="14" r="3"/></svg></div>
                    <h3>Library Manager</h3>
                    <p>Built-in library catalog. Search, add WiFi, BLE, sensors, displays, protocols. Auto-generates include statements and dependency tracking.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="8" width="20" height="14" rx="2"/><path d="M4 14h20M10 8V6h8v2"/></svg></div>
                    <h3>Integrated Terminal</h3>
                    <p>Three-tab terminal: compile output, problem list, serial monitor. Timestamped logs, color-coded messages, clear/copy/toggle controls.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 3l11 7v8l-11 7L3 18v-8l11-7z"/><path d="M14 14v14M3 10l11 4 11-4"/></svg></div>
                    <h3>Local Storage</h3>
                    <p>All projects, code, configs saved in your browser. No server, no database, no accounts. Your data stays on your machine. Export/import anytime.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="how-it-works" id="how">
        <div class="container">
            <div class="section-header">
                <span class="section-tag">How It Works</span>
                <h2>Three Steps to<br>Flashed Firmware</h2>
            </div>
            <div class="steps-grid">
                <div class="step-card">
                    <div class="step-num">01</div>
                    <h3>Create or Fetch</h3>
                    <p><strong>New Project:</strong> Name it, pick your board, get auto-generated <code>.tbin</code> config, <code>main.cpp</code>, and <code>config.h</code>.</p>
                    <p><strong>Fetch from GitHub:</strong> Paste repo URL → auto-discovers <code>.tbin</code> files → pulls all source code into the editor.</p>
                    <div class="step-visual">
                        <div class="step-code"><span class="sc-comment">// Auto-generated by TinyBin</span><br><span class="sc-kw">project_name</span>: my-firmware<br><span class="sc-kw">board</span>: esp32<br><span class="sc-kw">binary_path</span>: build/my-firmware.bin</div>
                    </div>
                </div>
                <div class="step-connector"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 16h16M18 10l6 6-6 6"/></svg></div>
                <div class="step-card">
                    <div class="step-num">02</div>
                    <h3>Edit &amp; Configure</h3>
                    <p>Write C/C++ with full syntax highlighting. Add libraries from the catalog. Edit <code>.tbin</code> to set build flags, defines, flash size. Multi-tab editing with auto-save.</p>
                    <div class="step-visual">
                        <div class="step-code"><span class="sc-kw">#include</span> <span class="sc-str">&lt;Arduino.h&gt;</span><br><span class="sc-kw">#include</span> <span class="sc-str">&lt;WiFi.h&gt;</span><br><br><span class="sc-kw">void</span> <span class="sc-fn">setup</span>() {<br>&nbsp;&nbsp;<span class="sc-fn">Serial</span>.<span class="sc-fn">begin</span>(<span class="sc-num">115200</span>);<br>}</div>
                    </div>
                </div>
                <div class="step-connector"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 16h16M18 10l6 6-6 6"/></svg></div>
                <div class="step-card">
                    <div class="step-num">03</div>
                    <h3>Compile &amp; Flash</h3>
                    <p><strong>Compile:</strong> Use local toolchain (if configured) OR skip — IDE saves binary directly for testing.<br><strong>Flash:</strong> Connect USB → select port → flash with real-time progress. Serial monitor shows device output.</p>
                    <div class="step-visual">
                        <div class="step-code"><span class="sc-sys">[00:00:01]</span> <span class="sc-ok">Flash complete!</span><br><span class="sc-sys">[00:00:01]</span> 240128 bytes written<br><span class="sc-sys">[00:00:02]</span> <span class="sc-info">Device booting...</span><br><span class="sc-sys">[00:00:03]</span> TinyBin Ready</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- BOARDS -->
    <section class="boards-section" id="boards">
        <div class="container">
            <div class="section-header">
                <span class="section-tag">Supported Boards</span>
                <h2>150+ Microcontrollers<br>Ready to Flash</h2>
                <p>From tiny ESP-01 to powerful STM32H7 — if it has a serial port, TinyBin can flash it.</p>
            </div>
            <div class="board-grid">
                <div class="board-card"><h4>ESP8266 / ESP-01</h4><div class="board-tags"><span>ESP-01</span><span>ESP-01S</span><span>ESP-12E</span><span>ESP-12F</span><span>ESP8266</span><span>NodeMCU 1.0</span><span>NodeMCU V2</span><span>NodeMCU V3</span><span>Wemos D1 Mini</span><span>Wemos D1 Mini Pro</span><span>HUZZAH</span><span>Thing</span><span>Thing Dev</span></div></div>
                <div class="board-card"><h4>ESP32 Family</h4><div class="board-tags"><span>ESP32 DevKit</span><span>ESP32-S2</span><span>ESP32-S3</span><span>ESP32-C3</span><span>ESP32-C6</span><span>ESP32-H2</span><span>HUZZAH32</span><span>Feather ESP32</span></div></div>
                <div class="board-card"><h4>Arduino</h4><div class="board-tags"><span>Uno</span><span>Nano</span><span>Nano (Old)</span><span>Mega 2560</span><span>Leonardo</span><span>Micro</span><span>Pro Mini</span><span>Pro Mini 3.3V</span><span>Due</span><span>Zero</span><span>MKR1000</span><span>MKR WiFi 1010</span><span>Nano 33 IoT</span><span>Nano 33 BLE</span></div></div>
                <div class="board-card"><h4>STM32</h4><div class="board-tags"><span>Blue Pill</span><span>Black Pill</span><span>Nucleo F103</span><span>Nucleo F446</span><span>Nucleo L476</span><span>Nucleo G431</span><span>F4 Discovery</span><span>L4 Discovery</span><span>STM32F103C8</span><span>STM32F407VE</span><span>STM32H743ZI</span></div></div>
                <div class="board-card"><h4>Raspberry Pi Pico</h4><div class="board-tags"><span>Pico</span><span>Pico W</span><span>Pico 2 (RP2350)</span><span>QT Py RP2040</span><span>Feather RP2040</span><span>ItsyBitsy RP2040</span><span>RP2040-Zero</span></div></div>
                <div class="board-card"><h4>nRF / micro:bit</h4><div class="board-tags"><span>nRF52832</span><span>nRF52840</span><span>nRF52 DK</span><span>nRF52840 DK</span><span>nRF52840 Dongle</span><span>Feather nRF52840</span><span>CLUE</span><span>micro:bit</span><span>micro:bit V2</span><span>nRF51822</span></div></div>
                <div class="board-card"><h4>M5Stack</h4><div class="board-tags"><span>M5Stack Core</span><span>M5Stack Fire</span><span>M5StickC</span><span>M5StickC Plus</span><span>M5Atom</span><span>M5Atom Lite</span><span>M5Atom Matrix</span><span>M5Paper</span><span>M5Core2</span><span>M5CoreInk</span><span>M5Stamp Pico</span><span>M5Stamp C3</span><span>M5Stamp S3</span></div></div>
                <div class="board-card"><h4>TTGO / Heltec / LOLIN</h4><div class="board-tags"><span>T-Beam</span><span>T-Watch</span><span>T-Display</span><span>LoRa32</span><span>WiFi LoRa 32</span><span>WiFi Kit 32</span><span>Wireless Stick</span><span>LOLIN S2 Mini</span><span>LOLIN S3</span><span>LOLIN D32</span><span>LOLIN D32 PRO</span><span>LOLIN32</span></div></div>
                <div class="board-card"><h4>Seeed XIAO</h4><div class="board-tags"><span>XIAO ESP32C3</span><span>XIAO ESP32S3</span><span>XIAO ESP32C6</span><span>XIAO RP2040</span><span>XIAO nRF52840</span><span>XIAO BLE</span><span>XIAO SAMD21</span><span>XIAO BLE Sense</span><span>XIAO ESP32S3 Sense</span></div></div>
                <div class="board-card"><h4>Teensy / Particle / AVR</h4><div class="board-tags"><span>Teensy 3.1/3.2</span><span>Teensy 3.5</span><span>Teensy 3.6</span><span>Teensy 4.0</span><span>Teensy 4.1</span><span>Teensy LC</span><span>Photon</span><span>Electron</span><span>Argon</span><span>Boron</span><span>Xenon</span><span>ATtiny85</span><span>ATmega328</span></div></div>
            </div>
        </div>
    </section>

    <!-- .TBIN FORMAT -->
    <section class="tbin-section">
        <div class="container">
            <div class="tbin-grid">
                <div class="tbin-info">
                    <span class="section-tag">Configuration</span>
                    <h2>The <code>.tbin</code> Format</h2>
                    <p>A purpose-built config format for microcontroller projects. Cleaner than JSON, simpler than YAML, designed specifically for firmware.</p>
                    <ul class="tbin-features">
                        <li><span class="check"></span>Human-readable Markdown-like syntax</li>
                        <li><span class="check"></span>Sections: project, libraries, build, defines</li>
                        <li><span class="check"></span>Auto-parsed by TinyBin IDE on fetch</li>
                        <li><span class="check"></span>Auto-generated on new project creation</li>
                        <li><span class="check"></span>Board type, binary path, flash settings</li>
                        <li><span class="check"></span>Library dependency declarations</li>
                    </ul>
                </div>
                <div class="tbin-code-block">
                    <div class="tbin-code-header">
                        <span>project.tbin</span>
                        <button class="tbin-copy" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent)">Copy</button>
                    </div>
                    <pre><code><span class="tc-comment"># My IoT Sensor Project</span>

<span class="tc-key">project_name</span>: <span class="tc-val">iot-sensor-node</span>
<span class="tc-key">version</span>: <span class="tc-val">1.0.0</span>
<span class="tc-key">board</span>: <span class="tc-val">esp32</span>
<span class="tc-key">binary_path</span>: <span class="tc-val">build/iot-sensor-node.bin</span>

<span class="tc-section">## Libraries</span>
<span class="tc-key">libraries</span>:
  <span class="tc-list">- name</span>: <span class="tc-val">WiFi</span>
    <span class="tc-list">version</span>: <span class="tc-val">2.0.0</span>
  <span class="tc-list">- name</span>: <span class="tc-val">Adafruit_BME280</span>
    <span class="tc-list">version</span>: <span class="tc-val">2.2.2</span>
  <span class="tc-list">- name</span>: <span class="tc-val">MQTT</span>
    <span class="tc-list">version</span>: <span class="tc-val">2.0.0</span>

<span class="tc-section">## Build Settings</span>
<span class="tc-key">build</span>:
  <span class="tc-key">optimization</span>: <span class="tc-val">-Os</span>
  <span class="tc-key">debug</span>: <span class="tc-val">false</span>
  <span class="tc-key">partitions</span>: <span class="tc-val">default</span>
  <span class="tc-key">flash_freq</span>: <span class="tc-val">80m</span>
  <span class="tc-key">flash_size</span>: <span class="tc-val">4MB</span>

<span class="tc-section">## Preprocessor Defines</span>
<span class="tc-key">defines</span>:
  <span class="tc-list">- </span><span class="tc-val">USE_SERIAL</span>
  <span class="tc-list">- </span><span class="tc-val">LED_BUILTIN=2</span>
  <span class="tc-list">- </span><span class="tc-val">MQTT_MAX_PACKET_SIZE=512</span></code></pre>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
        <div class="container">
            <div class="cta-card">
                <div class="cta-glow"></div>
                <h2>Ready to Build Firmware?</h2>
                <p>Open the IDE. Create a project. Write code. Flash to your board. All in your browser.</p>
                <div class="cta-actions">
                    <a href="dashboard.php" class="btn btn-neon btn-lg">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2L4 10h5v8h2v-8h5L10 2z"/></svg>
                        Launch TinyBin IDE
                    </a>
                    <a href="#features" class="btn btn-ghost btn-lg">Explore Features</a>
                </div>
                <div class="cta-note">No signup. No installs. No config. Just code.</div>
            </div>
        </div>
    </section>
</main>

<footer class="site-footer">
    <div class="container">
        <div class="footer-grid">
            <div class="footer-brand">
                <a href="index.php" class="logo">
                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="url(#logoGrad2)"/><path d="M11 11l7 7-7 7V11z" fill="#fff"/><path d="M20 11l7 7-7 7V11z" fill="#fff" opacity="0.4"/><defs><linearGradient id="logoGrad2" x1="0" y1="0" x2="36" y2="36"><stop stop-color="#00d4ff"/><stop offset="1" stop-color="#0066ff"/></linearGradient></defs></svg>
                    <span>TinyBin</span>
                </a>
                <p>The most powerful browser-based IDE for microcontroller firmware development. Code, compile, and flash from anywhere.</p>
                <div class="footer-social">
                    <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg></a>
                    <a href="https://discord.com" target="_blank" rel="noopener" aria-label="Discord"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.96 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg></a>
                    <a href="mailto:hello@tinybin.dev" aria-label="Email"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg></a>
                </div>
            </div>
            <div class="footer-col"><h4>Product</h4><a href="dashboard.php">IDE</a><a href="#features">Features</a><a href="#boards">Boards</a><a href="blog.php">Blog</a></div>
            <div class="footer-col"><h4>Resources</h4><a href="about.php">About</a><a href="privacy.php">Privacy</a><a href="terms.php">Terms</a></div>
            <div class="footer-col"><h4>Community</h4><a href="https://github.com" target="_blank" rel="noopener">GitHub</a><a href="https://discord.com" target="_blank" rel="noopener">Discord</a><a href="mailto:hello@tinybin.dev">Contact</a></div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 TinyBin. All rights reserved.</p>
            <p>Built with passion for the maker community.</p>
        </div>
    </div>
</footer>

<script src="assets/js/home.js"></script>
</body>
</html>
