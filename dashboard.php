<?php
// TinyBin IDE — Production-grade browser IDE for microcontrollers
// Full-featured web-based IDE with real compiler, TODO manager, snippets, command palette
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TinyBin IDE — Advanced Microcontroller Development Environment</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/ace.min.css">
<link rel="stylesheet" href="assets/css/ide.css">
</head>
<body>
<div class="ide-layout">
    <!-- Menu Bar -->
    <div class="ide-menubar">
        <div class="menubar-left">
            <a href="index.php" class="menubar-logo">
                <svg width="18" height="18" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="url(#lg)"/><path d="M11 11l7 7-7 7V11z" fill="#fff"/><path d="M20 11l7 7-7 7V11z" fill="#fff" opacity="0.4"/><defs><linearGradient id="lg" x1="0" y1="0" x2="36" y2="36"><stop stop-color="#00d4ff"/><stop offset="1" stop-color="#0066ff"/></linearGradient></defs></svg>
            </a>
            <button class="menu-item" onclick="IDE.menuFile(event)" onmouseenter="IDE.menuHover('file',event)">File</button>
            <button class="menu-item" onclick="IDE.menuEdit(event)" onmouseenter="IDE.menuHover('edit',event)">Edit</button>
            <button class="menu-item" onclick="IDE.menuView(event)" onmouseenter="IDE.menuHover('view',event)">View</button>
            <button class="menu-item" onclick="IDE.menuProject(event)" onmouseenter="IDE.menuHover('project',event)">Project</button>
            <button class="menu-item" onclick="IDE.menuTools(event)" onmouseenter="IDE.menuHover('tools',event)">Tools</button>
            <button class="menu-item" onclick="IDE.menuHelp(event)" onmouseenter="IDE.menuHover('help',event)">Help</button>
        </div>
        <div class="menubar-center">
            <span id="menubarProject">No Project</span>
            <span class="menubar-sep">|</span>
            <span id="menubarBoard">ESP32 DevKit</span>
        </div>
        <div class="menubar-right">
            <button class="menu-btn-icon" onclick="IDE.saveCurrentFile()" title="Save (Ctrl+S)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V2a1 1 0 00-1-1zM3 2h10v5H3V2zm0 6h10v5H3V8zm2 1v3h6V9H5z"/></svg>
            </button>
        </div>
    </div>

    <!-- Toolbar -->
    <div class="ide-toolbar">
        <div class="toolbar-left">
            <button class="tool-btn" onclick="IDE.newFile()" title="New File (Ctrl+N)"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zM7 12H4v-1h3V8h1v3h3v1H8v3H7v-3z"/></svg><span>New</span></button>
            <button class="tool-btn" onclick="IDE.saveCurrentFile()" title="Save (Ctrl+S)"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V2a1 1 0 00-1-1zM3 2h10v5H3V2zm0 6h10v5H3V8zm2 1v3h6V9H5z"/></svg><span>Save</span></button>
            <div class="tool-sep"></div>
            <button class="tool-btn" onclick="IDE.undo()" title="Undo (Ctrl+Z)"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3 5h8a4 4 0 010 8H7v-2h4a2 2 0 000-4H3V5zm2 2L2 4l3-3v4z"/></svg></button>
            <button class="tool-btn" onclick="IDE.redo()" title="Redo (Ctrl+Y)"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13 5H5a4 4 0 000 8h4v-2H5a2 2 0 010-4h8V5zm-2 2l3-3-3-3v4z"/></svg></button>
            <div class="tool-sep"></div>
            <button class="tool-btn" onclick="IDE.findReplace()" title="Find & Replace (Ctrl+H)"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M14 14l-3.5-3.5" stroke="currentColor" stroke-width="1.5"/></svg><span>Find</span></button>
        </div>
        <div class="toolbar-center">
            <button class="tool-btn tool-compile" onclick="Compiler.compile()" title="Compile (F5)"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2l6 6-6 6V2zM12 2v12"/></svg><span>Compile</span></button>
            <button class="tool-btn tool-analyze" onclick="Compiler.analyze()" title="Analyze Code"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM7 4v4.5l3.5 2.1.75-1.23L8.5 7.5V4H7z"/></svg><span>Analyze</span></button>
            <button class="tool-btn tool-flash" onclick="Flasher.flash()" id="toolbarFlashBtn" disabled title="Flash to Device"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M9 1l-5 7h4l-1 7 5-7h-4l1-7z"/></svg><span>Flash</span></button>
            <button class="tool-btn tool-download" onclick="Flasher.downloadBinary()" id="toolbarDownloadBtn" disabled title="Download Binary"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1v8l3-3h-2V1H7v5H5l3 3zM2 13h12v1H2v-1z"/></svg><span>Download</span></button>
        </div>
        <div class="toolbar-right">
            <div class="board-select-wrapper">
                <select id="boardSelect" class="board-select" onchange="IDE.onBoardChange()"></select>
            </div>
            <div class="baud-select-wrapper">
                <select id="baudRate" class="baud-select">
                    <option value="9600">9600</option>
                    <option value="19200">19200</option>
                    <option value="38400">38400</option>
                    <option value="57600">57600</option>
                    <option value="115200" selected>115200</option>
                    <option value="230400">230400</option>
                    <option value="460800">460800</option>
                    <option value="921600">921600</option>
                </select>
            </div>
            <button class="tool-btn tool-connect" id="connectBtn" onclick="SerialManager.connect()" title="Connect Serial Port">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6 2L2 6l4 4M10 14l4-4-4-4"/></svg>
                <span id="connectBtnText">Connect</span>
            </button>
        </div>
    </div>

    <div class="ide-body">
        <!-- Activity Bar -->
        <aside class="activity-bar">
            <button class="activity-btn active" data-panel="files" title="Explorer (Ctrl+Shift+E)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
            </button>
            <button class="activity-btn" data-panel="search" title="Search (Ctrl+Shift+F)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
            <button class="activity-btn" data-panel="git" title="Source Control (Ctrl+Shift+G)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v1a2 2 0 01-2 2H8a2 2 0 01-2-2V9"/><line x1="12" y1="12" x2="12" y2="15"/></svg>
            </button>
            <button class="activity-btn" data-panel="libraries" title="Libraries">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </button>
            <button class="activity-btn" data-panel="todo" title="TODO">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                <span class="badge" id="todoBadge"></span>
            </button>
            <button class="activity-btn" data-panel="snippets" title="Code Snippets">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>
            </button>
            <button class="activity-btn" data-panel="output" title="Output">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            </button>
            <button class="activity-btn" data-panel="boards" title="Board Manager">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>
            </button>
            <button class="activity-btn" data-panel="plotter" title="Serial Plotter">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 20l4-8 4 4 4-12 4 8"/></svg>
            </button>
            <button class="activity-btn" data-panel="terminal" title="Terminal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 10l4 4-4 4M12 18h6"/></svg>
            </button>
            <div class="activity-spacer"></div>
            <button class="activity-btn" data-panel="settings" title="Settings">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            </button>
        </aside>

        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
            <!-- Files Panel -->
            <div class="sidebar-panel active" id="panel-files">
                <div class="panel-header">
                    <span>EXPLORER</span>
                    <div class="panel-actions">
                        <button class="panel-btn" onclick="IDE.newFile()" title="New File"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zM7 12H4v-1h3V8h1v3h3v1H8v3H7v-3z"/></svg></button>
                        <button class="panel-btn" onclick="IDE.newFolder()" title="New Folder"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M14 3H8L6 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1z"/></svg></button>
                        <button class="panel-btn" onclick="IDE.refreshExplorer()" title="Refresh"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.5 2.5a5.5 5.5 0 00-10.78 1.18l1.73.6A4 4 0 0112 5.5V7l2.5-2.5L12 2V3.5a5.5 5.5 0 001.5-1zM2.5 13.5a5.5 5.5 0 0010.78-1.18l-1.73-.6A4 4 0 014 10.5V9L1.5 11.5 4 14v-1.5a5.5 5.5 0 00-1.5 1z"/></svg></button>
                    </div>
                </div>
                <div class="panel-content">
                    <div class="project-actions">
                        <button class="btn btn-neon btn-sm btn-block" onclick="IDE.showNewProjectModal()">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1v5H2v1h5v5h1V7h5V6H8V1H7z"/></svg>
                            New Project
                        </button>
                        <button class="btn btn-ghost btn-sm btn-block" onclick="IDE.showFetchModal()">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 1.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9zM6 4v3.5l2.5 1.5.75-1.23L7.5 6.5V4H6z"/></svg>
                            Fetch from GitHub
                        </button>
                    </div>
                    <div class="explorer-section">
                        <div class="explorer-section-header" onclick="IDE.toggleSection(this)">
                            <svg class="chevron" width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M7 2L3 6l4 4"/></svg>
                            <span id="projectNameLabel">WORKSPACE</span>
                        </div>
                        <div class="explorer-section-content">
                            <div id="fileTree" class="file-tree">
                                <div class="tree-empty">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                                    <p>No files yet</p>
                                    <button class="btn btn-sm btn-ghost" onclick="IDE.newFile()">Create File</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Search Panel -->
            <div class="sidebar-panel" id="panel-search">
                <div class="panel-header"><span>SEARCH</span></div>
                <div class="panel-content">
                    <input type="text" id="searchInput" placeholder="Search in files..." class="search-input" oninput="IDE.searchFiles(this.value)">
                    <input type="text" id="replaceInput" placeholder="Replace..." class="search-input" style="margin-top:4px">
                    <button class="btn btn-sm btn-ghost btn-block" style="margin:4px 8px 0" onclick="IDE.replaceAll()">Replace All</button>
                    <div id="searchResults" class="search-results"></div>
                </div>
            </div>

            <!-- Git Panel -->
            <div class="sidebar-panel" id="panel-git">
                <div class="panel-header"><span>SOURCE CONTROL</span></div>
                <div class="panel-content">
                    <div class="git-section">
                        <div class="form-group"><label>GitHub Repository URL</label><input type="url" id="gitUrl" placeholder="https://github.com/user/repo"></div>
                        <div class="form-group"><label>Branch</label><input type="text" id="gitBranch" value="main" placeholder="main"></div>
                        <button class="btn btn-neon btn-sm btn-block" onclick="IDE.fetchFromGitHub()">Fetch Repository</button>
                    </div>
                    <div id="gitStatus" class="git-status"></div>
                </div>
            </div>

            <!-- Libraries Panel -->
            <div class="sidebar-panel" id="panel-libraries">
                <div class="panel-header">
                    <span>LIBRARIES</span>
                    <div class="panel-actions">
                        <button class="panel-btn" onclick="LibraryFetcher.showAddUrlModal()" title="Add from GitHub URL">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zM7 12H4v-1h3V8h1v3h3v1H8v3H7v-3z"/></svg>
                        </button>
                    </div>
                </div>
                <div class="panel-content">
                    <input type="text" id="libSearch" placeholder="Search libraries..." class="search-input" oninput="IDE.searchLibraries(this.value)">
                    <div id="libraryList" class="library-list">
                        <div class="lib-category"><h4>Communication</h4>
                            <div class="lib-item" onclick="IDE.addLibrary('WiFi')"><span class="lib-name">WiFi</span><span class="lib-version">2.0.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('Ethernet')"><span class="lib-name">Ethernet</span><span class="lib-version">2.0.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('BLE')"><span class="lib-name">BLE</span><span class="lib-version">2.0.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('HTTPClient')"><span class="lib-name">HTTPClient</span><span class="lib-version">2.0.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('WebServer')"><span class="lib-name">WebServer</span><span class="lib-version">2.0.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('MQTT')"><span class="lib-name">MQTT</span><span class="lib-version">2.0.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('ESPAsyncWebServer')"><span class="lib-name">ESPAsyncWebServer</span><span class="lib-version">3.0.6</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('AsyncTCP')"><span class="lib-name">AsyncTCP</span><span class="lib-version">1.1.1</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('LoRa')"><span class="lib-name">LoRa</span><span class="lib-version">0.8.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('ESPmDNS')"><span class="lib-name">ESPmDNS</span><span class="lib-version">2.0.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('Wire')"><span class="lib-name">Wire</span><span class="lib-version">2.0.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('SPI')"><span class="lib-name">SPI</span><span class="lib-version">2.0.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('OneWire')"><span class="lib-name">OneWire</span><span class="lib-version">2.3.7</span></div>
                        </div>
                        <div class="lib-category"><h4>Sensors</h4>
                            <div class="lib-item" onclick="IDE.addLibrary('Adafruit_Sensor')"><span class="lib-name">Adafruit_Sensor</span><span class="lib-version">1.1.4</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('DHT')"><span class="lib-name">DHT</span><span class="lib-version">1.4.4</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('Adafruit_BME280')"><span class="lib-name">Adafruit_BME280</span><span class="lib-version">2.2.2</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('MPU6050')"><span class="lib-name">MPU6050</span><span class="lib-version">0.2.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('DallasTemperature')"><span class="lib-name">DallasTemperature</span><span class="lib-version">3.9.1</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('Adafruit_GPS')"><span class="lib-name">Adafruit_GPS</span><span class="lib-version">1.7.3</span></div>
                        </div>
                        <div class="lib-category"><h4>Displays</h4>
                            <div class="lib-item" onclick="IDE.addLibrary('Adafruit_GFX')"><span class="lib-name">Adafruit_GFX</span><span class="lib-version">1.11.5</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('Adafruit_SSD1306')"><span class="lib-name">Adafruit_SSD1306</span><span class="lib-version">2.5.7</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('TFT_eSPI')"><span class="lib-name">TFT_eSPI</span><span class="lib-version">2.5.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('LiquidCrystal_I2C')"><span class="lib-name">LiquidCrystal_I2C</span><span class="lib-version">1.1.2</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('U8g2')"><span class="lib-name">U8g2</span><span class="lib-version">2.35.12</span></div>
                        </div>
                        <div class="lib-category"><h4>Output / LEDs</h4>
                            <div class="lib-item" onclick="IDE.addLibrary('Servo')"><span class="lib-name">Servo</span><span class="lib-version">1.2.1</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('NeoPixel')"><span class="lib-name">NeoPixel</span><span class="lib-version">1.10.7</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('FastLED')"><span class="lib-name">FastLED</span><span class="lib-version">3.6.0</span></div>
                        </div>
                        <div class="lib-category"><h4>Input</h4>
                            <div class="lib-item" onclick="IDE.addLibrary('IRremote')"><span class="lib-name">IRremote</span><span class="lib-version">4.2.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('MFRC522')"><span class="lib-name">MFRC522</span><span class="lib-version">1.4.11</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('Keypad')"><span class="lib-name">Keypad</span><span class="lib-version">3.1.1</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('Adafruit_NeoTrellis')"><span class="lib-name">Adafruit_NeoTrellis</span><span class="lib-version">1.1.0</span></div>
                        </div>
                        <div class="lib-category"><h4>Storage</h4>
                            <div class="lib-item" onclick="IDE.addLibrary('EEPROM')"><span class="lib-name">EEPROM</span><span class="lib-version">2.0.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('LittleFS')"><span class="lib-name">LittleFS</span><span class="lib-version">2.0.0</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('SD')"><span class="lib-name">SD</span><span class="lib-version">2.0.0</span></div>
                        </div>
                        <div class="lib-category"><h4>Data / Utility</h4>
                            <div class="lib-item" onclick="IDE.addLibrary('ArduinoJson')"><span class="lib-name">ArduinoJson</span><span class="lib-version">6.21.3</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('Time')"><span class="lib-name">Time</span><span class="lib-version">1.6.1</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('RTClib')"><span class="lib-name">RTClib</span><span class="lib-version">2.1.1</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('NTPClient')"><span class="lib-name">NTPClient</span><span class="lib-version">3.2.1</span></div>
                            <div class="lib-item" onclick="IDE.addLibrary('TaskScheduler')"><span class="lib-name">TaskScheduler</span><span class="lib-version">3.7.0</span></div>
                        </div>
                        <div class="lib-category"><h4>OTA & Updates</h4>
                            <div class="lib-item" onclick="IDE.addLibrary('ArduinoOTA')"><span class="lib-name">ArduinoOTA</span><span class="lib-version">2.0.0</span></div>
                        </div>
                    </div>
                    <div id="installedLibs" class="installed-libs"><h4>Installed</h4><div id="installedLibList"></div></div>
                </div>
            </div>

            <!-- TODO Panel -->
            <div class="sidebar-panel" id="panel-todo">
                <div class="panel-header">
                    <span>TODO</span>
                    <div class="panel-actions">
                        <button class="panel-btn" onclick="TODO.clearDone()" title="Clear Completed">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h8v1H4V2zm1 3h6v1H5V5zm-1 3h8v1H4V8zm-1 3h10v1H3v-1z"/></svg>
                        </button>
                    </div>
                </div>
                <div class="panel-content">
                    <div class="todo-panel">
                        <div class="todo-stats">
                            <div class="todo-stat total"><div class="count" id="todoTotal">0</div><div class="label">Total</div></div>
                            <div class="todo-stat pending"><div class="count" id="todoPending">0</div><div class="label">Pending</div></div>
                            <div class="todo-stat done"><div class="count" id="todoDone">0</div><div class="label">Done</div></div>
                        </div>
                        <div class="todo-add">
                            <input type="text" id="todoInput" placeholder="Add a new task..." onkeydown="if(event.key==='Enter')TODO.add()">
                            <select id="todoPriority">
                                <option value="medium">Med</option>
                                <option value="high">High</option>
                                <option value="low">Low</option>
                            </select>
                            <button class="btn btn-neon btn-sm" onclick="TODO.add()">+</button>
                        </div>
                        <div class="todo-filters">
                            <button class="todo-filter active" data-filter="all" onclick="TODO.setFilter('all')">All</button>
                            <button class="todo-filter" data-filter="pending" onclick="TODO.setFilter('pending')">Pending</button>
                            <button class="todo-filter" data-filter="done" onclick="TODO.setFilter('done')">Done</button>
                        </div>
                        <div id="todoList" class="todo-list"></div>
                    </div>
                </div>
            </div>

            <!-- Snippets Panel -->
            <div class="sidebar-panel" id="panel-snippets">
                <div class="panel-header"><span>SNIPPETS</span></div>
                <div class="panel-content">
                    <div class="snippets-panel">
                        <input type="text" id="snippetSearch" placeholder="Search snippets..." class="search-input" oninput="Snippets.search(this.value)">
                        <div id="snippetList">
                            <div class="snippet-category">
                                <h4 onclick="Snippets.toggleCategory(this)">Basic <span class="chevron">&#9660;</span></h4>
                                <div class="snippet-list">
                                    <div class="snippet-item" onclick="Snippets.insert('blink')">Blink LED<div class="snippet-desc">Toggle builtin LED</div></div>
                                    <div class="snippet-item" onclick="Snippets.insert('serial')">Serial Print<div class="snippet-desc">Serial communication setup</div></div>
                                    <div class="snippet-item" onclick="Snippets.insert('wifi')">WiFi Connect<div class="snippet-desc">WiFi station mode</div></div>
                                    <div class="snippet-item" onclick="Snippets.insert('wifi_ap')">WiFi Access Point<div class="snippet-desc">Soft AP mode</div></div>
                                </div>
                            </div>
                            <div class="snippet-category">
                                <h4 onclick="Snippets.toggleCategory(this)">Sensors <span class="chevron">&#9660;</span></h4>
                                <div class="snippet-list">
                                    <div class="snippet-item" onclick="Snippets.insert('dht')">DHT Sensor<div class="snippet-desc">Temperature & humidity</div></div>
                                    <div class="snippet-item" onclick="Snippets.insert('bme280')">BME280<div class="snippet-desc">Pressure, temp, humidity</div></div>
                                    <div class="snippet-item" onclick="Snippets.insert('mpu6050')">MPU6050<div class="snippet-desc">Accelerometer & gyro</div></div>
                                </div>
                            </div>
                            <div class="snippet-category">
                                <h4 onclick="Snippets.toggleCategory(this)">Displays <span class="chevron">&#9660;</span></h4>
                                <div class="snippet-list">
                                    <div class="snippet-item" onclick="Snippets.insert('oled')">OLED SSD1306<div class="snippet-desc">I2C OLED display</div></div>
                                    <div class="snippet-item" onclick="Snippets.insert('tft')">TFT eSPI<div class="snippet-desc">SPI TFT display</div></div>
                                </div>
                            </div>
                            <div class="snippet-category">
                                <h4 onclick="Snippets.toggleCategory(this)">Network <span class="chevron">&#9660;</span></h4>
                                <div class="snippet-list">
                                    <div class="snippet-item" onclick="Snippets.insert('webserver')">Web Server<div class="snippet-desc">HTTP server with routes</div></div>
                                    <div class="snippet-item" onclick="Snippets.insert('mqtt')">MQTT Client<div class="snippet-desc">MQTT pub/sub</div></div>
                                    <div class="snippet-item" onclick="Snippets.insert('http_client')">HTTP Client<div class="snippet-desc">HTTP GET/POST</div></div>
                                    <div class="snippet-item" onclick="Snippets.insert('ota')">OTA Updates<div class="snippet-desc">Over-the-air firmware</div></div>
                                </div>
                            </div>
                            <div class="snippet-category">
                                <h4 onclick="Snippets.toggleCategory(this)">Storage <span class="chevron">&#9660;</span></h4>
                                <div class="snippet-list">
                                    <div class="snippet-item" onclick="Snippets.insert('eeprom')">EEPROM<div class="snippet-desc">EEPROM read/write</div></div>
                                    <div class="snippet-item" onclick="Snippets.insert('littlefs')">LittleFS<div class="snippet-desc">Filesystem operations</div></div>
                                    <div class="snippet-item" onclick="Snippets.insert('sd')">SD Card<div class="snippet-desc">SD card read/write</div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Output Panel -->
            <div class="sidebar-panel" id="panel-output">
                <div class="panel-header"><span>OUTPUT</span></div>
                <div class="panel-content">
                    <div class="output-panel">
                        <div class="output-section">
                            <h4>Project Statistics</h4>
                            <div id="outputStats">
                                <div class="output-stat"><span class="label">Files</span><span class="value" id="statFiles">0</span></div>
                                <div class="output-stat"><span class="label">Source Files</span><span class="value" id="statSource">0</span></div>
                                <div class="output-stat"><span class="label">Headers</span><span class="value" id="statHeaders">0</span></div>
                                <div class="output-stat"><span class="label">Total Lines</span><span class="value" id="statLines">0</span></div>
                                <div class="output-stat"><span class="label">Total Size</span><span class="value" id="statSize">0 B</span></div>
                                <div class="output-stat"><span class="label">Libraries</span><span class="value" id="statLibs">0</span></div>
                            </div>
                        </div>
                        <div class="output-section">
                            <h4>Last Compile</h4>
                            <div id="lastCompileInfo">
                                <div class="output-stat"><span class="label">Status</span><span class="value" id="lastCompileStatus">-</span></div>
                                <div class="output-stat"><span class="label">Time</span><span class="value" id="lastCompileTime">-</span></div>
                                <div class="output-stat"><span class="label">Binary Size</span><span class="value" id="lastCompileSize">-</span></div>
                                <div class="output-stat"><span class="label">Errors</span><span class="value" id="lastCompileErrors" style="color:var(--red)">0</span></div>
                                <div class="output-stat"><span class="label">Warnings</span><span class="value" id="lastCompileWarnings" style="color:var(--yellow)">0</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Settings Panel -->
            <div class="sidebar-panel" id="panel-settings">
                <div class="panel-header"><span>SETTINGS</span></div>
                <div class="panel-content">
                    <div class="settings-section"><h4>Theme</h4>
                        <p class="settings-desc">Choose your preferred IDE theme</p>
                        <div class="theme-selector">
                            <button class="theme-btn theme-btn-dark active" data-theme="dark" onclick="IDE.setTheme('dark')">Dark</button>
                            <button class="theme-btn theme-btn-light" data-theme="light" onclick="IDE.setTheme('light')">Light</button>
                        </div>
                    </div>
                    <div class="settings-section"><h4>Editor</h4>
                        <div class="setting-row"><label>Font Size</label><input type="number" id="editorFontSize" value="14" min="10" max="30" onchange="IDE.setEditorFontSize(this.value)"></div>
                        <div class="setting-row"><label>Tab Size</label><input type="number" id="editorTabSize" value="4" min="2" max="8" onchange="IDE.setEditorTabSize(this.value)"></div>
                        <div class="setting-row"><label>Word Wrap</label><input type="checkbox" id="editorWordWrap" checked onchange="IDE.setEditorWordWrap(this.checked)"></div>
                        <div class="setting-row"><label>Auto Save</label><input type="checkbox" id="autoSave" checked onchange="IDE.setAutoSave(this.checked)"></div>
                        <div class="setting-row"><label>Auto Save Delay (ms)</label><input type="number" id="autoSaveDelay" value="2000" min="500" max="10000" step="500" onchange="IDE.setAutoSaveDelay(this.value)"></div>
                    </div>
                    <div class="settings-section"><h4>Compile</h4>
                        <div class="setting-row"><label>Use Local Toolchain</label><input type="checkbox" id="useLocalToolchain" onchange="IDE.setLocalToolchain(this.checked)"></div>
                        <p class="settings-desc">If enabled, IDE will use your locally installed compiler. Otherwise, binary is generated directly for testing.</p>
                        <div class="form-group" id="toolchainPathGroup" style="display:none"><label>Toolchain Path</label><input type="text" id="toolchainPath" placeholder="/usr/bin/xtensa-esp32-elf-gcc"></div>
                    </div>
                    <div class="settings-section"><h4>GitHub Token <span style="color:var(--text-muted);font-weight:400">(optional)</span></h4>
                        <p class="settings-desc">Increases API rate limits</p>
                        <input type="password" id="githubToken" placeholder="ghp_xxxxxxxxxxxx" class="settings-input">
                        <button class="btn btn-sm btn-ghost btn-block" onclick="IDE.saveGitHubToken()" style="margin-top:6px">Save Token</button>
                    </div>
                    <div class="settings-section"><h4>Library Manager</h4>
                        <p class="settings-desc">Fetch any Arduino library from GitHub</p>
                        <div class="form-group"><label>GitHub Repository URL</label><input type="url" id="manageLibUrl" placeholder="https://github.com/owner/repo" class="settings-input"></div>
                        <div class="form-group"><label>Branch</label><input type="text" id="manageLibBranch" value="main" placeholder="main or master" class="settings-input"></div>
                        <button class="btn btn-sm btn-neon btn-block" onclick="LibraryFetcher.quickFetchFromManage()">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zM7 12H4v-1h3V8h1v3h3v1H8v3H7v-3z"/></svg>
                            Fetch & Add Library
                        </button>
                    </div>
                    <div class="settings-section"><h4>Serial Monitor</h4>
                        <p class="settings-desc">Configure serial monitor settings</p>
                        <div class="setting-row"><label>Baud Rate</label>
                            <select id="settingsBaudRate" onchange="document.getElementById('baudRate').value=this.value">
                                <option value="9600">9600</option>
                                <option value="19200">19200</option>
                                <option value="38400">38400</option>
                                <option value="57600">57600</option>
                                <option value="115200" selected>115200</option>
                                <option value="230400">230400</option>
                                <option value="460800">460800</option>
                                <option value="921600">921600</option>
                            </select>
                        </div>
                        <div class="setting-row"><label>Line Ending</label>
                            <select id="settingsLineEnding">
                                <option value="none">No line ending</option>
                                <option value="nl">Newline</option>
                                <option value="cr" selected>Carriage return</option>
                                <option value="both">Both NL & CR</option>
                            </select>
                        </div>
                        <button class="btn btn-sm btn-ghost btn-block" style="margin-top:8px" onclick="Terminal.switchToSerial()">Open Serial Monitor</button>
                    </div>
                    <div class="settings-section"><h4>Data</h4>
                        <button class="btn btn-sm btn-ghost btn-block" onclick="IDE.exportAllData()">Export All Projects</button>
                        <button class="btn btn-sm btn-ghost btn-block" style="margin-top:6px" onclick="IDE.importData()">Import Projects</button>
                        <button class="btn btn-sm btn-danger btn-block" style="margin-top:6px" onclick="IDE.clearAllData()">Clear All Data</button>
                    </div>
                </div>
            </div>

            <!-- Board Manager Panel -->
            <div class="sidebar-panel" id="panel-boards">
                <div class="panel-header">
                    <span>BOARD MANAGER</span>
                    <div class="panel-actions">
                        <button class="panel-btn" onclick="BoardManagerPanel.showFavorites()" title="Favorites">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l2.2 4.5 5 .7-3.6 3.5.9 5L8 12.4 3.5 14.7l.9-5L.8 6.2l5-.7L8 1z"/></svg>
                        </button>
                    </div>
                </div>
                <div class="panel-content">
                    <div class="board-manager-panel">
                        <input type="text" id="boardSearch" placeholder="Search boards..." class="search-input" oninput="BoardManagerPanel.search(this.value)">
                        <div class="board-filters">
                            <button class="board-filter active" data-filter="all" onclick="BoardManagerPanel.filter('all')">All</button>
                            <button class="board-filter" data-filter="wifi" onclick="BoardManagerPanel.filter('wifi')">WiFi</button>
                            <button class="board-filter" data-filter="ble" onclick="BoardManagerPanel.filter('ble')">BLE</button>
                            <button class="board-filter" data-filter="low_power" onclick="BoardManagerPanel.filter('low_power')">Low Power</button>
                        </div>
                        <div id="boardList" class="board-list"></div>
                    </div>
                </div>
            </div>

            <!-- Serial Plotter Panel -->
            <div class="sidebar-panel" id="panel-plotter">
                <div class="panel-header">
                    <span>SERIAL PLOTTER</span>
                    <div class="panel-actions">
                        <button class="panel-btn" onclick="SerialPlotter.clear()" title="Clear">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h8v1H4V2zm1 3h6v1H5V5zm-1 3h8v1H4V8zm-1 3h10v1H3v-1z"/></svg>
                        </button>
                    </div>
                </div>
                <div class="panel-content">
                    <div class="serial-plotter-panel">
                        <div class="plotter-controls">
                            <div class="plotter-range">
                                <label>Y Min</label><input type="number" id="plotMin" value="0" onchange="SerialPlotter.setRange(parseInt(this.value), parseInt(document.getElementById('plotMax').value))">
                                <label>Y Max</label><input type="number" id="plotMax" value="1023" onchange="SerialPlotter.setRange(parseInt(document.getElementById('plotMin').value), parseInt(this.value))">
                            </div>
                            <div class="plotter-actions">
                                <button class="btn btn-sm btn-neon" id="plotterStartBtn" onclick="SerialPlotter.start()">Start</button>
                                <button class="btn btn-sm btn-ghost" id="plotterStopBtn" onclick="SerialPlotter.stop()">Stop</button>
                            </div>
                        </div>
                        <div class="plotter-container">
                            <canvas id="plotterCanvas"></canvas>
                        </div>
                        <div id="plotterLegend" class="plotter-legend"></div>
                        <p class="plotter-hint">Send comma-separated values via serial to plot multiple series</p>
                    </div>
                </div>
            </div>

            <!-- Terminal Panel -->
            <div class="sidebar-panel" id="panel-terminal">
                <div class="panel-header"><span>TERMINAL</span></div>
                <div class="panel-content">
                    <div class="terminal-output-only">
                        <div id="terminalOutput" class="terminal-output"></div>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Area -->
        <main class="ide-main">
            <!-- Tab Bar -->
            <div class="tab-bar" id="tabBar">
                <div class="pinned-tabs" id="pinnedTabs"></div>
                <div class="tabs" id="tabs"></div>
                <div class="tab-actions">
                    <button class="tab-action-btn" onclick="TabManager.showTree()" title="Tab Tree (Ctrl+Shift+T)"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M1 1h5v5H1V1zm7 0h5v5H8V1zM1 8h5v5H1V8zm7 0h5v5H8V8z"/></svg></button>
                    <button class="tab-action-btn" onclick="TabManager.splitHorizontal()" title="Split Right"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="12" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 1v12"/></svg></button>
                    <button class="tab-action-btn" onclick="TabManager.splitVertical()" title="Split Down"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="12" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M1 7h12"/></svg></button>
                    <button class="tab-action-btn" onclick="IDE.saveCurrentFile()" title="Save (Ctrl+S)"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M11 1H3a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V2a1 1 0 00-1-1zM3 2h8v4H3V2zm0 5h8v5H3V7zm2 1v3h4V8H5z"/></svg></button>
                    <button class="tab-action-btn" onclick="IDE.closeAllTabs()" title="Close All"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 5l4 4M9 5l-4 4"/></svg></button>
                </div>
            </div>

            <!-- Tab Tree -->
            <div class="tab-tree" id="tabTree">
                <div class="tab-tree-header">
                    <h4>ALL OPEN TABS</h4>
                    <input type="text" class="tab-tree-search" id="tabTreeSearch" placeholder="Filter tabs..." oninput="TabManager.filterTree(this.value)">
                </div>
                <div class="tab-tree-list" id="tabTreeList"></div>
            </div>

            <!-- Breadcrumbs -->
            <div class="breadcrumbs" id="breadcrumbs"><span class="breadcrumb-item">workspace</span></div>

            <!-- Split Editor Container -->
            <div class="split-container" id="splitContainer">
                <div class="split-pane" id="splitPane0">
                    <div class="split-pane-header">
                        <span class="pane-title" id="paneTitle0">Editor</span>
                        <div class="pane-actions">
                            <button class="pane-action" onclick="TabManager.closePane(0)" title="Close Pane">&times;</button>
                        </div>
                    </div>
                    <div class="editor-wrapper" id="editorWrapper">
                        <div id="editor"></div>
                        <div class="editor-welcome" id="editorWelcome">
                            <div class="welcome-content">
                                <svg width="72" height="72" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="url(#lg2)" opacity="0.2"/><path d="M11 11l7 7-7 7V11z" fill="#00d4ff"/><path d="M20 11l7 7-7 7V11z" fill="#00d4ff" opacity="0.4"/><defs><linearGradient id="lg2" x1="0" y1="0" x2="36" y2="36"><stop stop-color="#00d4ff"/><stop offset="1" stop-color="#0066ff"/></linearGradient></defs></svg>
                                <h2>TinyBin IDE</h2>
                                <p>Create a new project or fetch from GitHub to start coding</p>
                                <div class="welcome-actions">
                                    <button class="btn btn-neon" onclick="IDE.showNewProjectModal()"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1v6H1v1h7v7h1V8h7V7H9V1H8z"/></svg>New Project</button>
                                    <button class="btn btn-ghost" onclick="IDE.showFetchModal()"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM7 4v4.5l3.5 2.1.75-1.23L8.5 7.5V4H7z"/></svg>Fetch from GitHub</button>
                                </div>
                                <div class="welcome-shortcuts">
                                    <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>S</kbd> Save</div>
                                    <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>N</kbd> New File</div>
                                    <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>W</kbd> Close Tab</div>
                                    <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>H</kbd> Find & Replace</div>
                                    <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>`</kbd> Toggle Terminal</div>
                                    <div class="shortcut"><kbd>F5</kbd> Compile</div>
                                    <div class="shortcut"><kbd>F7</kbd> Flash</div>
                                    <div class="shortcut"><kbd>F8</kbd> Download</div>
                                    <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> Command Palette</div>
                                    <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd> Tab Tree</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Terminal -->
            <div class="terminal-container" id="terminalContainer">
                <div id="progressContainer"><div id="progressBar"></div><div id="progressText">0%</div></div>
                <div class="terminal-resize-handle" id="terminalResizeHandle"></div>
                <div class="terminal-header">
                    <div class="terminal-tabs">
                        <button class="terminal-tab active" data-terminal="output">OUTPUT</button>
                        <button class="terminal-tab" data-terminal="problems">PROBLEMS <span class="tab-badge" id="problemBadge"></span></button>
                        <button class="terminal-tab" data-terminal="serial">SERIAL MONITOR</button>
                    </div>
                    <div class="terminal-actions">
                        <button onclick="Terminal.clearActive()" title="Clear">Clear</button>
                        <button onclick="Terminal.copyAll()" title="Copy">Copy</button>
                        <button onclick="Terminal.toggle()" title="Toggle">Toggle</button>
                    </div>
                </div>
                <div class="terminal-body" id="terminalBody">
                    <div class="terminal-panel active" id="panelOutput"></div>
                    <div class="terminal-panel" id="panelProblems">
                        <div class="problems-panel" id="problemsList">
                            <div class="problems-empty">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                                <p>No problems detected</p>
                                <p style="font-size:11px;color:var(--text-muted)">Compile or analyze code to see problems</p>
                            </div>
                        </div>
                    </div>
                    <div class="terminal-panel" id="panelSerial">
                        <div class="serial-monitor">
                            <div class="serial-output" id="serialOutput"></div>
                            <div class="serial-input-row">
                                <span class="serial-prompt">&gt;</span>
                                <input type="text" id="serialInput" placeholder="Send to serial..." class="serial-input" onkeydown="SerialMonitor.handleKey(event)">
                                <button class="btn btn-sm btn-neon" onclick="SerialMonitor.send()">Send</button>
                                <select id="serialLineEnding" class="serial-ending">
                                    <option value="none">No line ending</option>
                                    <option value="nl">Newline</option>
                                    <option value="cr" selected>Carriage return</option>
                                    <option value="both">Both NL & CR</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
        <div class="status-left">
            <span class="status-item" id="statusBranch"><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="2"/></svg> local</span>
            <span class="status-item" id="statusProject">No project</span>
            <span class="status-item" id="statusCompile" style="display:none"><span id="compileStatusIcon"></span><span id="compileStatusText"></span></span>
            <span class="status-item" id="statusAutoSave" style="display:none">Auto-save ON</span>
        </div>
        <div class="status-right">
            <span class="status-item" id="statusPosition">Ln 1, Col 1</span>
            <span class="status-item" id="statusEncoding">UTF-8</span>
            <span class="status-item" id="statusLanguage">C++</span>
            <span class="status-item" id="statusLineEnding">CRLF</span>
            <span class="status-item serial-status-item" id="serialStatusItem" style="cursor:pointer" onclick="Terminal.switchToSerial()"><span class="serial-dot"></span> Serial</span>
            <span class="status-item" id="statusTerminalToggle" style="cursor:pointer" onclick="Terminal.toggle()" title="Toggle Terminal">Terminal</span>
        </div>
    </div>
</div>

<!-- Command Palette -->
<div class="command-palette" id="commandPalette">
    <input type="text" class="command-palette-input" id="commandInput" placeholder="Type a command..." oninput="CommandPalette.filter(this.value)" onkeydown="CommandPalette.handleKey(event)">
    <div class="command-palette-results" id="commandResults"></div>
    <div class="command-palette-footer">
        <span><kbd>Up/Down</kbd> Navigate</span>
        <span><kbd>Enter</kbd> Execute</span>
        <span><kbd>Esc</kbd> Close</span>
    </div>
</div>

<!-- Dropdown Menu -->
<div class="dropdown-menu" id="dropdownMenu"></div>

<!-- Modal -->
<div class="modal-overlay" id="modalOverlay" onclick="if(event.target===this)IDE.closeModal()">
    <div class="modal" id="modal">
        <div class="modal-header"><h3 id="modalTitle">Modal</h3><button class="modal-close" onclick="IDE.closeModal()">&times;</button></div>
        <div class="modal-body" id="modalBody"></div>
        <div class="modal-footer" id="modalFooter"></div>
    </div>
</div>

<!-- Context Menu -->
<div class="context-menu" id="contextMenu">
    <div class="context-item" data-action="open"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M6 1H1v12h12V6H6V1z"/></svg>Open</div>
    <div class="context-item" data-action="rename"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M11 1l2 2-8 8H3v-2l8-8z"/></svg>Rename</div>
    <div class="context-divider"></div>
    <div class="context-item" data-action="duplicate"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1"/><path d="M1 1h8v1H2v8H1V1z"/></svg>Duplicate</div>
    <div class="context-item" data-action="delete"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M5 1h4v1H5V1zM2 3h10v1H2V3zm1 2h8l-1 8H4L3 5z"/></svg>Delete</div>
</div>

<!-- Tab Context Menu -->
<div class="tab-context-menu" id="tabContextMenu">
    <div class="tab-context-item" data-action="pin"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M10 1l-3 3H4v3L1 10l3 3 3-3h3V7l3-3-3-3z"/></svg>Pin Tab<span class="ctx-short">Ctrl+Shift+P</span></div>
    <div class="tab-context-item" data-action="duplicate"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1"/><path d="M1 1h8v1H2v8H1V1z"/></svg>Duplicate Tab<span class="ctx-short">Ctrl+D</span></div>
    <div class="tab-context-divider"></div>
    <div class="tab-context-item" data-action="splitRight"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="12" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 1v12"/></svg>Split Right</div>
    <div class="tab-context-item" data-action="splitDown"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="12" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M1 7h12"/></svg>Split Down</div>
    <div class="tab-context-divider"></div>
    <div class="tab-context-item" data-action="moveNewGroup"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/></svg>Move to New Group</div>
    <div class="tab-context-item" data-action="close"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 5l4 4M9 5l-4 4"/></svg>Close<span class="ctx-short">Ctrl+W</span></div>
    <div class="tab-context-item" data-action="closeOthers">Close Others</div>
    <div class="tab-context-item" data-action="closeAll">Close All</div>
    <div class="tab-context-divider"></div>
    <div class="tab-context-item" data-action="copyPath"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M6 1H1v12h12V6H6V1z"/></svg>Copy Path</div>
    <div class="tab-context-item" data-action="reveal"><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>Reveal in Explorer</div>
    <div class="tab-context-divider"></div>
    <div class="tab-context-item danger" data-action="closeSaved">Close Saved Tabs</div>
</div>

<!-- Find/Replace Bar -->
<div class="find-bar" id="findBar">
    <div class="find-row">
        <input type="text" id="findInput" placeholder="Find..." class="find-input" oninput="IDE.findInEditor()">
        <input type="text" id="findReplaceInput" placeholder="Replace..." class="find-input">
        <span class="find-count" id="findCount">0/0</span>
        <button class="find-btn" onclick="IDE.findPrev()" title="Previous">Up</button>
        <button class="find-btn" onclick="IDE.findNext()" title="Next">Down</button>
        <button class="find-btn" onclick="IDE.replaceOne()" title="Replace">Replace</button>
        <button class="find-btn" onclick="IDE.replaceAllInEditor()" title="Replace All">All</button>
        <button class="find-btn find-close" onclick="IDE.closeFindBar()" title="Close">x</button>
    </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/ace.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/mode-c_cpp.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/mode-json.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/mode-html.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/mode-python.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/mode-markdown.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/mode-yaml.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/theme-tomorrow_night.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/ext-language_tools.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/ext-searchbox.min.js"></script>
<script src="assets/js/wasm-compiler.js"></script>
<script src="assets/js/esptool.js"></script>
<script src="assets/js/ide.js"></script>
</body>
</html>
