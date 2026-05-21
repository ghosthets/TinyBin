<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>About — TinyBin</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/home.css">
</head>
<body>
<header class="site-header" id="siteHeader">
    <div class="container header-inner">
        <a href="index.php" class="logo"><svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="url(#lg)"/><path d="M11 11l7 7-7 7V11z" fill="#fff"/><path d="M20 11l7 7-7 7V11z" fill="#fff" opacity="0.4"/><defs><linearGradient id="lg" x1="0" y1="0" x2="36" y2="36"><stop stop-color="#00d4ff"/><stop offset="1" stop-color="#0066ff"/></linearGradient></defs></svg><span>TinyBin</span></a>
        <nav class="main-nav" id="mainNav"><a href="index.php" class="nav-link">Home</a><a href="dashboard.php" class="nav-link">IDE</a><a href="blog.php" class="nav-link">Blog</a><a href="about.php" class="nav-link active">About</a><a href="privacy.php" class="nav-link">Privacy</a><a href="terms.php" class="nav-link">Terms</a><a href="dashboard.php" class="nav-link nav-cta">Launch IDE</a><button class="theme-toggle-btn" id="themeToggleBtn" aria-label="Toggle theme"></button></nav>
        <button class="mobile-toggle" id="mobileToggle" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
</header>
<main>
    <section class="page-hero"><div class="container"><h1>About TinyBin</h1><p>Built by makers, for makers. No installs, no config, just code and flash.</p></div></section>
    <section class="about-content"><div class="container"><div class="about-grid">
        <div class="about-text">
            <h2>Our Mission</h2>
            <p>TinyBin was born from a simple frustration: why does programming a microcontroller require installing massive IDEs, configuring toolchains, managing drivers, and dealing with complex build systems?</p>
            <p>We believe firmware development should be as simple as opening a browser tab. That's why we built TinyBin — a complete, browser-based IDE that lets you write C/C++ code, compile it, and flash it to 150+ microcontroller boards, all without installing a single thing.</p>
            <h2>How It Works</h2>
            <p>TinyBin uses modern web technologies to bring desktop-class development to the browser:</p>
            <ul>
                <li><strong>Ace Editor</strong> provides VS Code-like syntax highlighting and code intelligence for C/C++.</li>
                <li><strong>Web Serial API</strong> enables direct USB communication with microcontrollers.</li>
                <li><strong>GitHub API</strong> lets you fetch entire projects from repositories with <code>.tbin</code> config files.</li>
                <li><strong>LocalStorage</strong> keeps all your projects and code saved locally in your browser.</li>
            </ul>
            <h2>The .tbin Format</h2>
            <p>We created <code>.tbin</code> as a lightweight, human-readable configuration format for microcontroller projects. It's similar to Markdown but designed specifically for firmware — defining board type, binary paths, libraries, build flags, and more in a clean, structured way.</p>
            <h2>Open &amp; Free</h2>
            <p>TinyBin is completely free to use. No accounts, no subscriptions, no limits. Your code stays in your browser. We don't store anything on our servers.</p>
        </div>
        <div class="about-sidebar">
            <div class="about-stat-card"><h3>150+</h3><p>Microcontroller boards supported</p></div>
            <div class="about-stat-card"><h3>0</h3><p>Installs or downloads required</p></div>
            <div class="about-stat-card"><h3>100%</h3><p>Browser-based, works anywhere</p></div>
            <div class="about-tech"><h4>Built With</h4><div class="tech-tags"><span>PHP</span><span>JavaScript</span><span>Ace Editor</span><span>Web Serial API</span><span>GitHub API</span><span>LocalStorage</span></div></div>
        </div>
    </div></div></section>
</main>
<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-brand"><a href="index.php" class="logo"><svg width="28" height="28" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="url(#lg2)"/><path d="M11 11l7 7-7 7V11z" fill="#fff"/><path d="M20 11l7 7-7 7V11z" fill="#fff" opacity="0.4"/><defs><linearGradient id="lg2" x1="0" y1="0" x2="36" y2="36"><stop stop-color="#00d4ff"/><stop offset="1" stop-color="#0066ff"/></linearGradient></defs></svg><span>TinyBin</span></a><p>Browser-based IDE for microcontroller development.</p></div><div class="footer-col"><h4>Product</h4><a href="dashboard.php">IDE</a><a href="index.php#features">Features</a><a href="blog.php">Blog</a></div><div class="footer-col"><h4>Resources</h4><a href="about.php">About</a><a href="privacy.php">Privacy</a><a href="terms.php">Terms</a></div><div class="footer-col"><h4>Community</h4><a href="https://github.com" target="_blank" rel="noopener">GitHub</a><a href="mailto:hello@tinybin.dev">Contact</a></div></div><div class="footer-bottom"><p>&copy; 2026 TinyBin. All rights reserved.</p></div></div></footer>
<script src="assets/js/home.js"></script>
</body>
</html>
