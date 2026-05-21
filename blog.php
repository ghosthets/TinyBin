<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog — TinyBin</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/home.css">
</head>
<body>
<header class="site-header" id="siteHeader">
    <div class="container header-inner">
        <a href="index.php" class="logo"><svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="url(#lg)"/><path d="M11 11l7 7-7 7V11z" fill="#fff"/><path d="M20 11l7 7-7 7V11z" fill="#fff" opacity="0.4"/><defs><linearGradient id="lg" x1="0" y1="0" x2="36" y2="36"><stop stop-color="#00d4ff"/><stop offset="1" stop-color="#0066ff"/></linearGradient></defs></svg><span>TinyBin</span></a>
        <nav class="main-nav" id="mainNav"><a href="index.php" class="nav-link">Home</a><a href="dashboard.php" class="nav-link">IDE</a><a href="blog.php" class="nav-link active">Blog</a><a href="about.php" class="nav-link">About</a><a href="privacy.php" class="nav-link">Privacy</a><a href="terms.php" class="nav-link">Terms</a><a href="dashboard.php" class="nav-link nav-cta">Launch IDE</a><button class="theme-toggle-btn" id="themeToggleBtn" aria-label="Toggle theme"></button></nav>
        <button class="mobile-toggle" id="mobileToggle" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
</header>
<main>
    <section class="page-hero"><div class="container"><h1>Blog</h1><p>Tutorials, updates, and deep dives into microcontroller development.</p></div></section>
    <section class="blog-section"><div class="container"><div class="blog-grid">
        <article class="blog-card featured"><div class="blog-card-img" style="background:linear-gradient(135deg,#00d4ff,#0066ff)"></div><div class="blog-card-body"><span class="blog-tag">Tutorial</span><h2><a href="#">Getting Started with ESP32 and TinyBin IDE</a></h2><p>Learn how to set up your first ESP32 project, write a WiFi-connected sensor logger, and flash it directly from your browser — all in under 5 minutes.</p><div class="blog-meta"><span>Jan 15, 2026</span><span>8 min read</span></div></div></article>
        <article class="blog-card"><div class="blog-card-body"><span class="blog-tag">Update</span><h2><a href="#">TinyBin v3.0: 150+ Boards, New .tbin Format</a></h2><p>We've completely redesigned the configuration format and added support for over 150 microcontroller boards.</p><div class="blog-meta"><span>Jan 10, 2026</span><span>4 min read</span></div></div></article>
        <article class="blog-card"><div class="blog-card-body"><span class="blog-tag">Deep Dive</span><h2><a href="#">Understanding the .tbin Configuration Format</a></h2><p>A complete guide to the .tbin file — how it works, why we built it, and how to use it for your projects.</p><div class="blog-meta"><span>Jan 5, 2026</span><span>6 min read</span></div></div></article>
        <article class="blog-card"><div class="blog-card-body"><span class="blog-tag">Tutorial</span><h2><a href="#">Flashing STM32 Blue Pill from Browser</a></h2><p>Step-by-step guide to programming an STM32F103C8 using TinyBin's Web Serial flasher.</p><div class="blog-meta"><span>Dec 28, 2025</span><span>5 min read</span></div></div></article>
        <article class="blog-card"><div class="blog-card-body"><span class="blog-tag">Community</span><h2><a href="#">Top 10 Projects Built with TinyBin</a></h2><p>From weather stations to robot controllers — see what the community has built using TinyBin IDE.</p><div class="blog-meta"><span>Dec 20, 2025</span><span>7 min read</span></div></div></article>
        <article class="blog-card"><div class="blog-card-body"><span class="blog-tag">Guide</span><h2><a href="#">Web Serial API: How Browser Flashing Works</a></h2><p>Technical deep dive into how TinyBin communicates with microcontrollers directly from the browser.</p><div class="blog-meta"><span>Dec 15, 2025</span><span>10 min read</span></div></div></article>
    </div></div></section>
</main>
<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-brand"><a href="index.php" class="logo"><svg width="28" height="28" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="url(#lg2)"/><path d="M11 11l7 7-7 7V11z" fill="#fff"/><path d="M20 11l7 7-7 7V11z" fill="#fff" opacity="0.4"/><defs><linearGradient id="lg2" x1="0" y1="0" x2="36" y2="36"><stop stop-color="#00d4ff"/><stop offset="1" stop-color="#0066ff"/></linearGradient></defs></svg><span>TinyBin</span></a><p>Browser-based IDE for microcontroller development.</p></div><div class="footer-col"><h4>Product</h4><a href="dashboard.php">IDE</a><a href="index.php#features">Features</a><a href="blog.php">Blog</a></div><div class="footer-col"><h4>Resources</h4><a href="about.php">About</a><a href="privacy.php">Privacy</a><a href="terms.php">Terms</a></div><div class="footer-col"><h4>Community</h4><a href="https://github.com" target="_blank" rel="noopener">GitHub</a><a href="mailto:hello@tinybin.dev">Contact</a></div></div><div class="footer-bottom"><p>&copy; 2026 TinyBin. All rights reserved.</p></div></div></footer>
<script src="assets/js/home.js"></script>
</body>
</html>
